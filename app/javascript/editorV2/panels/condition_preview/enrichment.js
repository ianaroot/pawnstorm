import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { legalPlacementForSpecies, MAX_PAWNS_PER_TEAM, pieceCode, pieceSpecies, pieceTeam, shuffled, weightedRandomSpecies } from 'editorV2/panels/condition_preview/board_utils'
import { moveKindForMoveObject, soundForMove, candidateIdentity, legalPriorTurnState } from 'editorV2/panels/condition_preview/example_utils'
import { relationalActorLabels } from 'editorV2/panels/condition_preview/relational_utils'
import { unaryActorLabels } from 'editorV2/panels/condition_preview/unary_utils'
import { selectDiverseExamples, uniqueExamples } from 'editorV2/panels/condition_preview/diversity_selection'

const ENRICHMENT_PROBABILITY = 0.5
const GUARANTEED_SPECIAL_MOVE_EXAMPLES = 1
const MAX_ENRICHED_EXTRA_PIECES = 10
const MAX_EXTRA_RELATION_PAIRS_FOR_ENRICHMENT = 3
const ENRICHMENT_END_POSITION_WEIGHT = 4

export function requiredRelationPairFloor(plan) {
  if (!plan.requirements.comparisonsPresent) { return 1 }
  return Math.max(plan.requirements.subject, plan.requirements.target)
}

export function movePathSquares(priorBoard, moveObject) {
  const start = moveObject.startPosition
  const end = moveObject.endPosition
  const species = priorBoard.pieceTypeAt(start)
  const squares = new Set([start, end])

  if ([Board.ROOK, Board.BISHOP, Board.QUEEN].includes(species)) {
    const fileDelta = Board.fileIndex(end) - Board.fileIndex(start)
    const rankDelta = Board.rankIndex(end) - Board.rankIndex(start)
    const stepFile = Math.sign(fileDelta)
    const stepRank = Math.sign(rankDelta)
    let file = Board.fileIndex(start) + stepFile
    let rank = Board.rankIndex(start) + stepRank

    while (file !== Board.fileIndex(end) || rank !== Board.rankIndex(end)) {
      squares.add(rank * 8 + file)
      file += stepFile
      rank += stepRank
    }
  } else if (species === Board.PAWN && Math.abs(end - start) === 16) {
    squares.add((start + end) / 2)
  }

  return squares
}

export function forbiddenSquaresForEnrichment(example) {
  const squares = new Set(movePathSquares(example.priorBoard, example.moveObject))

  example.priorBoard.layOut.forEach((piece, position) => {
    if (piece !== Board.EMPTY_SQUARE) { squares.add(position) }
  })
  example.afterBoard.layOut.forEach((piece, position) => {
    if (piece !== Board.EMPTY_SQUARE) { squares.add(position) }
  })

  return squares
}

export function weightedEnrichmentCandidateSquares(example, random) {
  const forbidden = forbiddenSquaresForEnrichment(example)
  const candidates = Array.from({ length: 64 }, (_unused, position) => position).filter(position => {
    if (position === example.moveObject.endPosition) { return true }
    return !forbidden.has(position)
  })
  const weighted = []

  candidates.forEach(position => {
    const weight = position === example.moveObject.endPosition ? ENRICHMENT_END_POSITION_WEIGHT : 1
    for (let count = 0; count < weight; count += 1) {
      weighted.push(position)
    }
  })

  return shuffled(weighted, random)
}

export function deriveVerifiedExample({ plan, priorBoard, moveObject, baseExample, suffix }) {
  let recomputedMoveObject
  try {
    recomputedMoveObject = Rules.getMoveObject(moveObject.startPosition, moveObject.endPosition, priorBoard)
  } catch {
    return null
  }
  if (recomputedMoveObject.illegal || recomputedMoveObject.additionalActions || recomputedMoveObject.promotionPiece) {
    return null
  }
  if (!legalPriorTurnState(priorBoard, recomputedMoveObject)) { return null }

  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject: recomputedMoveObject }
  if (!evaluator.evaluate(plan.evaluationPayload, input)) { return null }

  const analysis = new CandidateMoveAnalysisV2(input)
  const result = analysis.relationalResult(plan.relationParams)
  const afterBoard = priorBoard.lightClone()
  afterBoard._hypotheticallyMovePiece(recomputedMoveObject)
  const movedPieceInRelation = (
    result.subjectPositions.includes(recomputedMoveObject.endPosition) ||
    result.targetPositions.includes(recomputedMoveObject.endPosition)
  )

  return {
    priorBoard,
    afterBoard,
    moveObject: recomputedMoveObject,
    result,
    highlights: relationalActorLabels(plan, recomputedMoveObject, result, priorBoard),
    variantType: movedPieceInRelation ? 'involved' : 'separate',
    geometryKey: `${baseExample.geometryKey}:${suffix}`,
    movedPieceInRelation,
    moveKind: moveKindForMoveObject(recomputedMoveObject),
    sound: soundForMove(priorBoard, afterBoard, recomputedMoveObject)
  }
}

export function exampleEligibleForEnrichment(example, plan) {
  return example.result.pairs.length <= requiredRelationPairFloor(plan) + MAX_EXTRA_RELATION_PAIRS_FOR_ENRICHMENT
}

export function buildEnrichmentPlacementPolicy(example, random) {
  const candidates = weightedEnrichmentCandidateSquares(example, random)
  const usedPositions = new Set()
  const movedPieceTeam = example.priorBoard.teamAt(example.moveObject.startPosition)

  const pawnCounts = { [Board.WHITE]: 0, [Board.BLACK]: 0 }
  example.priorBoard.layOut.forEach(piece => {
    if (piece !== Board.EMPTY_SQUARE && pieceSpecies(piece) === Board.PAWN) {
      pawnCounts[pieceTeam(piece)]++
    }
  })

  return {
    nextPlacement() {
      let position
      while (candidates.length > 0) {
        const candidate = candidates.shift()
        if (usedPositions.has(candidate)) { continue }
        usedPositions.add(candidate)
        position = candidate
        break
      }
      if (position === undefined) { return null }
      const team = position === example.moveObject.endPosition
        ? Board.opposingTeam(movedPieceTeam)
        : (random() < 0.5 ? Board.WHITE : Board.BLACK)
      const allowedSpecies = pawnCounts[team] >= MAX_PAWNS_PER_TEAM
        ? [Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]
        : null
      const species = weightedRandomSpecies(random, { includeKing: false, allowedSpecies })
      if (!legalPlacementForSpecies(position, species)) {
        return this.nextPlacement()
      }
      if (species === Board.PAWN) { pawnCounts[team]++ }
      return { position, team, species }
    }
  }
}

export function enrichExample(example, plan, random) {
  if (!exampleEligibleForEnrichment(example, plan)) { return null }

  const policy = buildEnrichmentPlacementPolicy(example, random)
  const basePriorBoard = example.priorBoard.lightClone()
  let bestExample = example
  let addedCount = 0

  while (addedCount < MAX_ENRICHED_EXTRA_PIECES) {
    const placement = policy.nextPlacement()
    if (!placement) { break }

    const trialPriorBoard = basePriorBoard.lightClone()
    trialPriorBoard._placePiece({
      position: placement.position,
      pieceObject: pieceCode(placement.team, placement.species)
    })
    const derived = deriveVerifiedExample({
      plan,
      priorBoard: trialPriorBoard,
      moveObject: example.moveObject,
      baseExample: example,
      suffix: `enriched:${addedCount + 1}:${placement.position}:${placement.team}${placement.species}`
    })

    if (!derived) { break }
    if (!exampleEligibleForEnrichment(derived, plan)) { break }

    bestExample = derived
    basePriorBoard.layOut = Board._deepCopy(trialPriorBoard.layOut)
    addedCount += 1
  }

  return addedCount > 0 ? bestExample : null
}

function deriveUnaryVerifiedExample({ plan, priorBoard, moveObject, baseExample }) {
  let recomputedMoveObject
  try {
    recomputedMoveObject = Rules.getMoveObject(moveObject.startPosition, moveObject.endPosition, priorBoard)
  } catch {
    return null
  }
  if (recomputedMoveObject.illegal || recomputedMoveObject.additionalActions || recomputedMoveObject.promotionPiece) { return null }
  if (!legalPriorTurnState(priorBoard, recomputedMoveObject)) { return null }

  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject: recomputedMoveObject }
  if (!evaluator.evaluate(plan.evaluationPayload, input)) { return null }

  const analysis = new CandidateMoveAnalysisV2(input)
  const afterBoard = priorBoard.lightClone()
  afterBoard._hypotheticallyMovePiece(recomputedMoveObject)

  return {
    priorBoard,
    afterBoard,
    moveObject: recomputedMoveObject,
    kind: 'unary',
    result: null,
    highlights: unaryActorLabels(plan, recomputedMoveObject, analysis),
    moveKind: moveKindForMoveObject(recomputedMoveObject),
    sound: soundForMove(priorBoard, afterBoard, recomputedMoveObject)
  }
}

function enrichUnaryExample(example, plan, random) {
  const policy = buildEnrichmentPlacementPolicy(example, random)
  const basePriorBoard = example.priorBoard.lightClone()
  let bestExample = example
  let addedCount = 0

  while (addedCount < MAX_ENRICHED_EXTRA_PIECES) {
    const placement = policy.nextPlacement()
    if (!placement) { break }

    const trialPriorBoard = basePriorBoard.lightClone()
    trialPriorBoard._placePiece({ position: placement.position, pieceObject: pieceCode(placement.team, placement.species) })
    const derived = deriveUnaryVerifiedExample({ plan, priorBoard: trialPriorBoard, moveObject: example.moveObject, baseExample: example })
    if (!derived) { break }

    bestExample = derived
    basePriorBoard.layOut = Board._deepCopy(trialPriorBoard.layOut)
    addedCount += 1
  }

  return addedCount > 0 ? bestExample : null
}

export function finalizeUnaryExamples(baseExamples, plan, maxExamples, random) {
  const enrichedCandidates = []

  baseExamples.forEach(example => {
    if (random() >= ENRICHMENT_PROBABILITY) { return }
    const enriched = enrichUnaryExample(example, plan, random)
    if (enriched) { enrichedCandidates.push(enriched) }
  })

  if (enrichedCandidates.length === 0) {
    return selectDiverseExamples(shuffled(baseExamples, random), maxExamples)
  }

  const desiredEnrichedCount = Math.min(
    enrichedCandidates.length,
    Math.max(1, Math.round(maxExamples * ENRICHMENT_PROBABILITY))
  )
  const selectedEnriched = selectDiverseExamples(uniqueExamples(enrichedCandidates), desiredEnrichedCount)
  const selectedEnrichedIds = new Set(selectedEnriched.map(candidateIdentity))
  const remainingBase = baseExamples.filter(example => !selectedEnrichedIds.has(candidateIdentity(example)))
  const selectedBase = selectDiverseExamples(remainingBase, Math.max(0, maxExamples - selectedEnriched.length))
  return selectDiverseExamples(shuffled(uniqueExamples([...selectedBase, ...selectedEnriched]), random), maxExamples)
}

export function finalizeExamples(baseExamples, plan, maxExamples, random) {
  const enrichedCandidates = []

  baseExamples.forEach(example => {
    if (random() >= ENRICHMENT_PROBABILITY) { return }
    const enriched = enrichExample(example, plan, random)
    if (enriched) { enrichedCandidates.push(enriched) }
  })

  if (enrichedCandidates.length === 0) {
    return selectDiverseExamples(baseExamples, maxExamples)
  }

  const desiredEnrichedCount = Math.min(
    enrichedCandidates.length,
    Math.max(1, Math.round(maxExamples * ENRICHMENT_PROBABILITY))
  )
  const selectedEnriched = selectDiverseExamples(uniqueExamples(enrichedCandidates), desiredEnrichedCount)
  const selectedEnrichedIds = new Set(selectedEnriched.map(candidateIdentity))
  const remainingBase = baseExamples.filter(example => !selectedEnrichedIds.has(candidateIdentity(example)))
  const selectedBase = selectDiverseExamples(remainingBase, Math.max(0, maxExamples - selectedEnriched.length))
  const combined = shuffled(uniqueExamples([...selectedBase, ...selectedEnriched]), random)

  if (combined.length >= maxExamples) {
    return selectDiverseExamples(combined, maxExamples)
  }

  const fallbackPool = shuffled(uniqueExamples([...combined, ...baseExamples, ...enrichedCandidates]), random)
  return selectDiverseExamples(fallbackPool, maxExamples)
}

export function mergeMoveKindExamples({ standardExamples, castleExamples, promotionExamples = [], plan, maxExamples, random }) {
  const hasSpecial = castleExamples.length > 0 || promotionExamples.length > 0
  if (!hasSpecial) {
    return finalizeExamples(standardExamples, plan, maxExamples, random)
  }

  const guaranteedExamples = []
  if (castleExamples.length > 0) {
    guaranteedExamples.push(...selectDiverseExamples(castleExamples, GUARANTEED_SPECIAL_MOVE_EXAMPLES))
  }
  if (promotionExamples.length > 0) {
    guaranteedExamples.push(...selectDiverseExamples(promotionExamples, GUARANTEED_SPECIAL_MOVE_EXAMPLES))
  }

  const guaranteedIds = new Set(guaranteedExamples.map(candidateIdentity))
  const remainingStandard = standardExamples.filter(e => !guaranteedIds.has(candidateIdentity(e)))
  const selectedStandard = finalizeExamples(remainingStandard, plan, Math.max(0, maxExamples - guaranteedExamples.length), random)

  const allSpecial = uniqueExamples([...castleExamples, ...promotionExamples])
  const remainingSpecial = allSpecial.filter(e => !guaranteedIds.has(candidateIdentity(e)))
  return selectDiverseExamples(uniqueExamples([...guaranteedExamples, ...selectedStandard, ...remainingSpecial]), maxExamples)
}
