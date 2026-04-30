import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { legalPlacementForSpecies, shuffled, legalEnrichmentSpecies } from './board_utils'
import {
  moveKindForMoveObject, soundForMove, candidateIdentity, legalPriorTurnState,
  MOVE_KIND_CASTLE, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/example_utils'
import { buildAggregatedResult, buildAggregatedHighlights } from './move_collection'
import { selectDiverseExamples, uniqueExamples } from './diversity_selection'

const ENRICHMENT_PROBABILITY = 0.5
const GUARANTEED_SPECIAL_MOVE_EXAMPLES = 2
const MAX_ENRICHED_EXTRA_PIECES = 10
const ENRICHMENT_END_POSITION_WEIGHT = 4

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
  const endPositionIsSpecial = example.moveKind !== MOVE_KIND_CASTLE && example.moveKind !== MOVE_KIND_EN_PASSANT

  const candidates = Array.from({ length: 64 }, (_, position) => position).filter(position => {
    if (endPositionIsSpecial && position === example.moveObject.endPosition) { return true }
    return !forbidden.has(position)
  })

  const weighted = []
  candidates.forEach(position => {
    const weight = endPositionIsSpecial && position === example.moveObject.endPosition
      ? ENRICHMENT_END_POSITION_WEIGHT
      : 1
    for (let i = 0; i < weight; i++) { weighted.push(position) }
  })

  return shuffled(weighted, random)
}

export function buildEnrichmentPlacementPolicy(example, random) {
  const candidates = weightedEnrichmentCandidateSquares(example, random)
  const usedPositions = new Set()
  const movedPieceTeam = example.priorBoard.teamAt(example.moveObject.startPosition)
  const endPositionIsSpecial = example.moveKind !== MOVE_KIND_CASTLE && example.moveKind !== MOVE_KIND_EN_PASSANT

  const currentPieces = new Map()
  example.priorBoard.layOut.forEach((piece, pos) => {
    if (piece !== Board.EMPTY_SQUARE) { currentPieces.set(pos, piece) }
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

      const team = endPositionIsSpecial && position === example.moveObject.endPosition
        ? Board.opposingTeam(movedPieceTeam)
        : (random() < 0.5 ? Board.WHITE : Board.BLACK)

      const speciesPool = legalEnrichmentSpecies(currentPieces, team)
      if (speciesPool.length === 0) { return this.nextPlacement() }
      const species = speciesPool[Math.floor(random() * speciesPool.length)]

      if (!legalPlacementForSpecies(position, species)) { return this.nextPlacement() }

      currentPieces.set(position, `${team}${species}`)
      return { position, team, species }
    }
  }
}

function deriveVerifiedExample({ combinedPlan, priorBoard, moveObject, baseExample, suffix }) {
  let recomputedMoveObject
  try {
    recomputedMoveObject = Rules.getMoveObject(moveObject.startPosition, moveObject.endPosition, priorBoard)
  } catch {
    return null
  }
  if (recomputedMoveObject.illegal) { return null }
  if (moveKindForMoveObject(recomputedMoveObject) !== baseExample.moveKind) { return null }
  if (!legalPriorTurnState(priorBoard, recomputedMoveObject)) { return null }

  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject: recomputedMoveObject }
  if (!combinedPlan.evaluationPayloads.every(payload => evaluator.evaluate(payload, input))) { return null }

  const analysis = new CandidateMoveAnalysisV2(input)
  const aggregatedResult = buildAggregatedResult(combinedPlan, analysis)
  if (!aggregatedResult) { return null }

  const afterBoard = priorBoard.lightClone()
  afterBoard._hypotheticallyMovePiece(recomputedMoveObject)
  const movedPieceInRelation = (
    aggregatedResult.subjectPositions.includes(recomputedMoveObject.endPosition) ||
    aggregatedResult.targetPositions.includes(recomputedMoveObject.endPosition)
  )

  return {
    priorBoard,
    afterBoard,
    moveObject: recomputedMoveObject,
    result: aggregatedResult,
    highlights: buildAggregatedHighlights(combinedPlan, recomputedMoveObject, aggregatedResult, priorBoard),
    variantType: movedPieceInRelation ? 'involved' : 'separate',
    geometryKey: `${baseExample.geometryKey}:enriched:${suffix}`,
    movedPieceInRelation,
    moveKind: baseExample.moveKind,
    sound: soundForMove(priorBoard, afterBoard, recomputedMoveObject),
    generationPath: baseExample.generationPath
  }
}

function enrichExample(example, combinedPlan, random) {
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
      pieceObject: `${placement.team}${placement.species}`
    })
    const derived = deriveVerifiedExample({
      combinedPlan,
      priorBoard: trialPriorBoard,
      moveObject: example.moveObject,
      baseExample: example,
      suffix: `${addedCount + 1}:${placement.position}:${placement.team}${placement.species}`
    })

    if (!derived) { break }

    bestExample = derived
    basePriorBoard.layOut = Board._deepCopy(trialPriorBoard.layOut)
    addedCount += 1
  }

  return addedCount > 0 ? bestExample : null
}

export function finalizeExamples(baseExamples, combinedPlan, maxExamples, random) {
  const enrichedCandidates = []

  baseExamples.forEach(example => {
    if (random() >= ENRICHMENT_PROBABILITY) { return }
    const enriched = enrichExample(example, combinedPlan, random)
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
  const selectedBase = selectDiverseExamples(shuffled(remainingBase, random), Math.max(0, maxExamples - selectedEnriched.length))
  const combined = shuffled(uniqueExamples([...selectedBase, ...selectedEnriched]), random)

  if (combined.length >= maxExamples) {
    return selectDiverseExamples(combined, maxExamples)
  }

  const fallbackPool = shuffled(uniqueExamples([...combined, ...baseExamples, ...enrichedCandidates]), random)
  return selectDiverseExamples(fallbackPool, maxExamples)
}

export function mergeMoveKindExamples({
  standardExamples, castleExamples = [], promotionExamples = [], enPassantExamples = [],
  combinedPlan, maxExamples, random
}) {
  const hasSpecial = castleExamples.length > 0 || promotionExamples.length > 0 || enPassantExamples.length > 0
  if (!hasSpecial) {
    return finalizeExamples(standardExamples, combinedPlan, maxExamples, random)
  }

  const guaranteed = []
  for (const pool of [castleExamples, promotionExamples, enPassantExamples]) {
    if (pool.length === 0) { continue }
    guaranteed.push(...finalizeExamples(pool, combinedPlan, GUARANTEED_SPECIAL_MOVE_EXAMPLES, random))
  }

  const guaranteedIds = new Set(guaranteed.map(candidateIdentity))
  const allExamples = uniqueExamples([...standardExamples, ...castleExamples, ...promotionExamples, ...enPassantExamples])
  const remaining = allExamples.filter(e => !guaranteedIds.has(candidateIdentity(e)))
  const selectedRemaining = finalizeExamples(remaining, combinedPlan, Math.max(0, maxExamples - guaranteed.length), random)

  return selectDiverseExamples(uniqueExamples([...guaranteed, ...selectedRemaining]), maxExamples)
}
