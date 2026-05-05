import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import { relativeRank, relativeToAbsolutePosition, materialValue } from 'gameplay/board_query_utils'
import { compareValues } from 'bot_execution/utils'
import {
  clonePiecesMap, pieceCode, squareIsOccupied, shuffled, legalPlacementForSpecies
} from 'editorV2/panels/condition_preview/board_utils'
import {
  collectLegalReverseMoves, soundForMove, candidateSpecies, MOVE_KIND_STANDARD
} from 'editorV2/panels/condition_preview/example_utils'
import { buildEnemyRecentMoveContextWithCapture } from 'editorV2/panels/condition_preview/candidate_collection'

const ALL_POSITIONS = Array.from({ length: 64 }, (_, i) => i)
const BLOCKER_SPECIES_POOL = [Board.NIGHT, Board.BISHOP, Board.ROOK, Board.PAWN]
const MAX_PIECE_MOBILITY = 27
const POSITION_BOARD_ATTEMPTS = 80

// ===== Position filter inversion =====

export function qualifyingSquares(positionAxis, positionComparator, positionTarget, movingTeam) {
  return ALL_POSITIONS.filter(pos => {
    switch (positionAxis) {
      case 'rank': {
        const rank = relativeRank(pos, movingTeam)
        return compareValues(rank, positionComparator, positionTarget)
      }
      case 'file': {
        const file = Board.fileIndex(pos) + 1
        return compareValues(file, positionComparator, positionTarget)
      }
      case 'square': {
        const absoluteTarget = relativeToAbsolutePosition(positionTarget, movingTeam)
        return pos === absoluteTarget
      }
      default:
        return false
    }
  })
}

// ===== Range / combination helpers =====

function range(from, to) {
  const result = []
  for (let i = from; i <= to; i++) { result.push(i) }
  return result
}

function targetCountsForComparator(comparator, targetTotal) {
  const cap = 12
  switch (comparator) {
    case 'equal_to':                 return [targetTotal]
    case 'greater_than':             return range(targetTotal + 1, targetTotal + cap + 1)
    case 'greater_than_or_equal_to': return range(targetTotal, targetTotal + cap)
    case 'less_than':                return range(Math.max(1, targetTotal - cap), targetTotal - 1)
    case 'less_than_or_equal_to':    return range(Math.max(1, targetTotal - cap), targetTotal)
    default:                         return [targetTotal]
  }
}

function targetValuesForComparator(comparator, targetTotal) {
  const cap = 12
  switch (comparator) {
    case 'equal_to':                 return [targetTotal]
    case 'greater_than':             return range(targetTotal + 1, targetTotal + cap + 1)
    case 'greater_than_or_equal_to': return range(targetTotal, targetTotal + cap)
    case 'less_than':                return range(Math.max(1, targetTotal - cap), targetTotal - 1)
    case 'less_than_or_equal_to':    return range(Math.max(1, targetTotal - cap), targetTotal)
    default:                         return [targetTotal]
  }
}

function targetMobilitiesForComparator(comparator, total) {
  return range(0, MAX_PIECE_MOBILITY).filter(m => compareValues(m, comparator, total))
}

function valueCombinationsForTotal(target, speciesPool) {
  if (target === 0) { return [[]] }
  const availableValues = [...new Set(
    speciesPool.filter(s => s !== Board.KING).map(s => materialValue(s)).filter(v => v > 0 && v <= target)
  )].sort((a, b) => a - b)
  if (availableValues.length === 0) { return [] }
  const results = []
  function search(remaining, minValue, current) {
    if (results.length >= 12) { return }
    if (remaining === 0) { results.push([...current]); return }
    for (const v of availableValues) {
      if (v < minValue) { continue }
      if (v > remaining) { break }
      current.push(v)
      search(remaining - v, v, current)
      current.pop()
    }
  }
  search(target, availableValues[0], [])
  return results
}

// ===== Work item builders =====

export function buildPositionWorkItems(plan, random) {
  const { subject, subjectSpeciesPool, operator, comparator, targetTotal, movingTeam, positionAxis, positionComparator, positionTarget } = plan
  const validSquares = qualifyingSquares(positionAxis, positionComparator, positionTarget, movingTeam)
  if (validSquares.length === 0) { return [] }

  const items = []

  if (subject === 'moved_piece') {
    for (let i = 0; i < POSITION_BOARD_ATTEMPTS; i++) {
      shuffled(validSquares, random).forEach(movedSquare => {
        subjectSpeciesPool.forEach(movedSpecies => {
          if (legalPlacementForSpecies(movedSquare, movedSpecies)) {
            items.push({ movedSquare, movedSpecies })
          }
        })
      })
    }
    return shuffled(items, random)
  }

  if (subject === 'enemy_moved_piece') {
    for (let i = 0; i < POSITION_BOARD_ATTEMPTS; i++) {
      shuffled(validSquares, random).forEach(enemyMovedSquare => {
        subjectSpeciesPool.forEach(enemyMovedSpecies => {
          if (legalPlacementForSpecies(enemyMovedSquare, enemyMovedSpecies)) {
            items.push({ enemyMovedSquare, enemyMovedSpecies })
          }
        })
      })
    }
    return shuffled(items, random)
  }

  // allied or enemy: group actors
  if (operator === 'count') {
    targetCountsForComparator(comparator, targetTotal).forEach(count => {
      if (count > 0 && count <= validSquares.length) { items.push({ count }) }
    })
  } else if (operator === 'value') {
    targetValuesForComparator(comparator, targetTotal).forEach(v => {
      valueCombinationsForTotal(v, subjectSpeciesPool).forEach(valueCombination => {
        if (valueCombination.length <= validSquares.length) { items.push({ valueCombination }) }
      })
    })
  } else if (operator === 'mobility') {
    const mobilities = targetMobilitiesForComparator(comparator, targetTotal)
    const counts = targetCountsForComparator(comparator, targetTotal)
    for (let attempt = 0; attempt < POSITION_BOARD_ATTEMPTS; attempt++) {
      mobilities.forEach(targetMobility => {
        subjectSpeciesPool.forEach(species => { items.push({ species, targetMobility }) })
      })
      counts.forEach(count => {
        if (count > 0 && count <= validSquares.length) { items.push({ count }) }
      })
    }
  }

  return shuffled(items, random)
}

// ===== Board building =====

function placeAtSquare({ pieces, species, team, square }) {
  if (squareIsOccupied(pieces, square) || !legalPlacementForSpecies(square, species)) { return null }
  const result = clonePiecesMap(pieces)
  result.set(square, pieceCode(team, species))
  return result
}

function placeNextPiece({ pieces, species, team, random }) {
  const candidates = shuffled(
    ALL_POSITIONS.filter(pos => !squareIsOccupied(pieces, pos) && legalPlacementForSpecies(pos, species)),
    random
  )
  if (candidates.length === 0) { return null }
  const result = clonePiecesMap(pieces)
  result.set(candidates[0], pieceCode(team, species))
  return { pieces: result, square: candidates[0] }
}

function buildAfterPiecesForPositionItem({ plan, item, validSquares, random }) {
  const { subject, subjectTeam, subjectSpeciesPool, movingTeam } = plan

  if (subject === 'moved_piece') {
    const placed = placeAtSquare({ pieces: new Map(), species: item.movedSpecies, team: subjectTeam, square: item.movedSquare })
    if (!placed) { return null }
    return { afterPieces: placed, movedPieceSquare: item.movedSquare, movedPieceSpecies: item.movedSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
  }

  if (subject === 'enemy_moved_piece') {
    const enemyTeam = Board.opposingTeam(movingTeam)
    const placed = placeAtSquare({ pieces: new Map(), species: item.enemyMovedSpecies, team: enemyTeam, square: item.enemyMovedSquare })
    if (!placed) { return null }
    const recentMoveContext = buildEnemyRecentMoveContextWithCapture(item.enemyMovedSquare, item.enemyMovedSpecies, null)
    const moverPool = candidateSpecies('any', null)
    const moverSpecies = moverPool[Math.floor(random() * moverPool.length)]
    const moverResult = placeNextPiece({ pieces: placed, species: moverSpecies, team: movingTeam, random })
    if (!moverResult) { return null }
    return { afterPieces: moverResult.pieces, movedPieceSquare: moverResult.square, movedPieceSpecies: moverSpecies, capturedPieceSpeciesPool: null, recentMoveContext }
  }

  // Group actors: allied / enemy — place pieces at qualifying squares
  const targetSquares = shuffled([...validSquares], random)
  const placeablePool = subjectSpeciesPool.filter(s => targetSquares.some(sq => legalPlacementForSpecies(sq, s)))

  const slots = item.valueCombination
    ? item.valueCombination.map(v => {
        const pool = placeablePool.filter(s => materialValue(s) === v)
        if (pool.length === 0) { return null }
        return pool[Math.floor(random() * pool.length)]
      }).filter(Boolean)
    : Array.from({ length: item.count || 1 }, () => {
        const pool = item.species
          ? placeablePool.filter(s => s === item.species)
          : placeablePool.filter(s => s !== Board.KING)
        if (pool.length === 0) { return null }
        return pool[Math.floor(random() * pool.length)]
      }).filter(Boolean)

  if (slots.length === 0 || slots.length > targetSquares.length) { return null }

  let pieces = new Map()
  const placedSquares = []

  // Place each slot at the first valid qualifying square
  let sqIdx = 0
  for (let i = 0; i < slots.length; i++) {
    let placed = false
    while (sqIdx < targetSquares.length) {
      const sq = targetSquares[sqIdx++]
      if (squareIsOccupied(pieces, sq)) { continue }
      const next = placeAtSquare({ pieces, species: slots[i], team: subjectTeam, square: sq })
      if (!next) { continue }
      pieces = next
      placedSquares.push({ square: sq, species: slots[i] })
      placed = true
      break
    }
    if (!placed) { return null }
  }

  // For mobility: add random blockers to constrain movement
  if (item.targetMobility !== undefined) {
    const extraCount = Math.min(10, Math.max(3, Math.floor((MAX_PIECE_MOBILITY - item.targetMobility) / 3)))
    const opposingTeam = Board.opposingTeam(subjectTeam)
    shuffled(ALL_POSITIONS.filter(p => !squareIsOccupied(pieces, p)), random).slice(0, extraCount).forEach(sq => {
      const team = random() < 0.5 ? subjectTeam : opposingTeam
      const validSpecies = BLOCKER_SPECIES_POOL.filter(s => legalPlacementForSpecies(sq, s))
      if (validSpecies.length === 0) { return }
      const species = validSpecies[Math.floor(random() * validSpecies.length)]
      const next = placeAtSquare({ pieces, species, team, square: sq })
      if (next) { pieces = next }
    })
  }

  // Always use a separate mover so qualifying pieces stay put on the board
  const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING)
  const moverSpecies = moverPool[Math.floor(random() * moverPool.length)]
  const moverResult = placeNextPiece({ pieces, species: moverSpecies, team: movingTeam, random })
  if (!moverResult) { return null }
  pieces = moverResult.pieces
  const movedPieceSquare = moverResult.square
  const movedPieceSpecies = moverSpecies

  if (!movedPieceSquare) { return null }
  return { afterPieces: pieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
}

// ===== Example collection =====

export function collectPositionExamples({ plan, item, random, maxResults = 3 }) {
  const validSquares = qualifyingSquares(plan.positionAxis, plan.positionComparator, plan.positionTarget, plan.movingTeam)
  const setup = buildAfterPiecesForPositionItem({ plan, item, validSquares, random })
  if (!setup) { return [] }

  const { afterPieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool, recentMoveContext } = setup
  const moves = collectLegalReverseMoves({
    afterPieces,
    movedPieceSquare,
    movedPieceSpecies,
    recentMoveContext,
    random,
    maxResults,
    capturedPieceSpeciesPool
  })

  const evaluator = new ConditionEvaluatorV2()
  const examples = []

  for (const { priorBoard, moveObject, afterBoard } of moves) {
    const input = { board: priorBoard, moveObject }
    if (!evaluator.evaluate(plan.evaluationPayload, input)) { continue }
    const analysis = new CandidateMoveAnalysisV2(input)
    examples.push({
      priorBoard,
      afterBoard,
      moveObject,
      moveKind: MOVE_KIND_STANDARD,
      kind: 'position',
      result: null,
      highlights: positionActorLabels(plan, moveObject, analysis),
      sound: soundForMove(priorBoard, afterBoard, moveObject)
    })
  }

  return examples
}

// ===== Highlight labels =====

export function positionActorLabels(plan, moveObject, analysis) {
  const afterPositions = analysis.positionFilteredPositions({
    actor: plan.subject,
    filter: plan.subjectFilter,
    filterMode: plan.subjectFilterMode,
    positionAxis: plan.positionAxis,
    positionComparator: plan.positionComparator,
    positionTarget: plan.positionTarget,
    boardScope: 'after'
  })

  return {
    prior: {
      subjectPositions: [],
      targetPositions: [],
      movedStartPosition: moveObject.startPosition,
      movedEndPosition: null
    },
    after: {
      subjectPositions: afterPositions,
      targetPositions: [],
      movedStartPosition: null,
      movedEndPosition: moveObject.endPosition
    }
  }
}
