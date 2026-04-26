import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { legalPlacementForSpecies, pieceCode, shuffled, weightedRandomSpecies } from 'editorV2/panels/condition_preview/board_utils'
import { moveKindForMoveObject, soundForMove, candidateIdentity, legalPriorTurnState } from 'editorV2/panels/condition_preview/example_utils'
import { subjectTargetLabels } from 'editorV2/panels/condition_preview/relational_utils'
import { selectDiverseExamples, uniqueExamples } from 'editorV2/panels/condition_preview/diversity_selection'

const ENRICHMENT_PROBABILITY = 0.5
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
    highlights: subjectTargetLabels(plan, recomputedMoveObject, result),
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
      const species = weightedRandomSpecies(random)
      if (!legalPlacementForSpecies(position, species)) {
        return this.nextPlacement()
      }
      const movedPieceTeam = example.priorBoard.teamAt(example.moveObject.startPosition)
      return {
        position,
        team: position === example.moveObject.endPosition
          ? Board.opposingTeam(movedPieceTeam)
          : (random() < 0.5 ? Board.WHITE : Board.BLACK),
        species
      }
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

export function mergeMoveKindExamples({ standardExamples, castleExamples, plan, maxExamples, random }) {
  if (castleExamples.length === 0) {
    return finalizeExamples(standardExamples, plan, maxExamples, random)
  }

  const selectedCastle = selectDiverseExamples(castleExamples, 1)
  const selectedCastleIds = new Set(selectedCastle.map(candidateIdentity))
  const remainingStandard = standardExamples.filter(example => !selectedCastleIds.has(candidateIdentity(example)))
  const selectedStandard = finalizeExamples(remainingStandard, plan, Math.max(0, maxExamples - selectedCastle.length), random)
  return selectDiverseExamples(uniqueExamples([...selectedCastle, ...selectedStandard]), maxExamples)
}
