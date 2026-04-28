import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { actorPositions } from 'bot_execution/actor_positions'
import Board from 'gameplay/board'
import { materialValue } from 'gameplay/board_query_utils'
import {
  clonePiecesMap, pieceCode, squareIsOccupied, shuffled, legalPlacementForSpecies
} from 'editorV2/panels/condition_preview/board_utils'
import {
  collectLegalReverseMoves, soundForMove, candidateSpecies, MOVE_KIND_STANDARD
} from 'editorV2/panels/condition_preview/example_utils'

const ALL_POSITIONS = Array.from({ length: 64 }, (_, i) => i)
const EXACT_NUMBER_TARGET = 'exact_number'
const VALUE_CAP_OVER_MINIMUM = 12
const MAX_PAWNS_PER_TEAM = 8

// ===== Target range helpers =====

function range(from, to) {
  const result = []
  for (let i = from; i <= to; i++) { result.push(i) }
  return result
}

function targetCountsForComparator(comparator, targetTotal) {
  switch (comparator) {
    case 'equal_to':                 return [targetTotal]
    case 'greater_than':             return range(targetTotal + 1, targetTotal + VALUE_CAP_OVER_MINIMUM + 1)
    case 'greater_than_or_equal_to': return range(targetTotal, targetTotal + VALUE_CAP_OVER_MINIMUM)
    case 'less_than':                return range(Math.max(1, targetTotal - VALUE_CAP_OVER_MINIMUM), targetTotal - 1)
    case 'less_than_or_equal_to':    return range(Math.max(1, targetTotal - VALUE_CAP_OVER_MINIMUM), targetTotal)
    default:                         return [targetTotal]
  }
}

function targetValuesForComparator(comparator, targetTotal) {
  switch (comparator) {
    case 'equal_to':                 return [targetTotal]
    case 'greater_than':             return range(targetTotal + 1, targetTotal + VALUE_CAP_OVER_MINIMUM + 1)
    case 'greater_than_or_equal_to': return range(targetTotal, targetTotal + VALUE_CAP_OVER_MINIMUM)
    case 'less_than':                return range(Math.max(1, targetTotal - VALUE_CAP_OVER_MINIMUM), targetTotal - 1)
    case 'less_than_or_equal_to':    return range(Math.max(1, targetTotal - VALUE_CAP_OVER_MINIMUM), targetTotal)
    default:                         return [targetTotal]
  }
}

// ===== Value combination enumeration =====

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

export function buildUnaryWorkItems(plan, random) {
  const { subject, subjectSpeciesPool, targetSpeciesPool, target, operator, comparator, targetTotal } = plan
  const items = []

  if (subject === 'moved_piece') {
    subjectSpeciesPool.forEach(movedSpecies => items.push({ movedSpecies }))
    return shuffled(items, random)
  }

  if (subject === 'captured_piece') {
    const movers = candidateSpecies('any', null).filter(s => s !== Board.KING)
    shuffled(movers, random).slice(0, 4).forEach(movedSpecies => {
      subjectSpeciesPool.forEach(capturedSpecies => items.push({ movedSpecies, capturedSpecies }))
    })
    return shuffled(items, random)
  }

  // allied or enemy
  if (operator === 'count') {
    targetCountsForComparator(comparator, targetTotal).forEach(count => {
      if (count > 0) { items.push({ count }) }
    })
  } else if (operator === 'value') {
    targetValuesForComparator(comparator, targetTotal).forEach(v => {
      valueCombinationsForTotal(v, subjectSpeciesPool).forEach(valueCombination => {
        items.push({ valueCombination })
      })
    })
  }

  if (target !== EXACT_NUMBER_TARGET) {
    // cross-actor: iterate T from 1-15 as target value/count, derive subject items satisfying comparator against T
    const paired = []
    if (operator === 'count') {
      range(1, 15).forEach(t => {
        const subjectCounts = targetCountsForComparator(comparator, t)
        subjectCounts.forEach(count => {
          if (count > 0) { paired.push({ count, targetCount: t }) }
        })
      })
    } else if (operator === 'value') {
      range(1, 15).forEach(t => {
        const subjectValues = targetValuesForComparator(comparator, t)
        subjectValues.forEach(sv => {
          valueCombinationsForTotal(sv, subjectSpeciesPool).forEach(valueCombination => {
            valueCombinationsForTotal(t, targetSpeciesPool).forEach(targetValueCombination => {
              paired.push({ valueCombination, targetValueCombination })
            })
          })
        })
      })
    }
    return shuffled(paired, random)
  }

  return shuffled(items, random)
}

// ===== Board building =====

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

function buildAfterPiecesForItem({ plan, item, random }) {
  const { subject, subjectTeam, targetTeam, target, subjectSpeciesPool, targetSpeciesPool, movingTeam } = plan

  if (subject === 'moved_piece') {
    const species = item.movedSpecies
    const result = placeNextPiece({ pieces: new Map(), species, team: subjectTeam, random })
    if (!result) { return null }
    return { afterPieces: result.pieces, movedPieceSquare: result.square, movedPieceSpecies: species, capturedPieceSpeciesPool: null }
  }

  if (subject === 'captured_piece') {
    const result = placeNextPiece({ pieces: new Map(), species: item.movedSpecies, team: subjectTeam, random })
    if (!result) { return null }
    return { afterPieces: result.pieces, movedPieceSquare: result.square, movedPieceSpecies: item.movedSpecies, capturedPieceSpeciesPool: [item.capturedSpecies] }
  }

  // allied or enemy: build subject pieces
  let pieces = new Map()
  const subjectMovedSquares = []
  const targetMovedSquares = []
  const pawnCount = { [subjectTeam]: 0, [targetTeam]: 0 }

  function pickSpecies(pool, team) {
    const filtered = pool.filter(s => s !== Board.PAWN || pawnCount[team] < MAX_PAWNS_PER_TEAM)
    if (filtered.length === 0) { return null }
    return filtered[Math.floor(random() * filtered.length)]
  }

  const subjectSlots = item.valueCombination
    ? item.valueCombination.map(v => pickSpecies(subjectSpeciesPool.filter(s => materialValue(s) === v), subjectTeam)).filter(Boolean)
    : Array.from({ length: item.count }, () => pickSpecies(subjectSpeciesPool, subjectTeam)).filter(Boolean)

  for (let i = 0; i < subjectSlots.length; i++) {
    const result = placeNextPiece({ pieces, species: subjectSlots[i], team: subjectTeam, random })
    if (!result) { return null }
    pieces = result.pieces
    if (subjectSlots[i] === Board.PAWN) { pawnCount[subjectTeam]++ }
    subjectMovedSquares.push({ square: result.square, species: subjectSlots[i] })
  }

  // place target pieces if cross-actor
  if (target !== EXACT_NUMBER_TARGET) {
    const targetSlots = item.targetValueCombination
      ? item.targetValueCombination.map(v => pickSpecies(targetSpeciesPool.filter(s => materialValue(s) === v), targetTeam)).filter(Boolean)
      : item.targetCount
        ? Array.from({ length: item.targetCount }, () => pickSpecies(targetSpeciesPool, targetTeam)).filter(Boolean)
        : []

    for (const species of targetSlots) {
      const result = placeNextPiece({ pieces, species, team: targetTeam, random })
      if (result) {
        pieces = result.pieces
        if (species === Board.PAWN) { pawnCount[targetTeam]++ }
        targetMovedSquares.push({ square: result.square, species })
      }
    }
  }

  // determine moved piece from movingTeam so collectLegalReverseMoves (which hardcodes WHITE mover) works
  let movedPieceSquare = null
  let movedPieceSpecies = null

  if (subjectTeam === movingTeam && subjectMovedSquares.length > 0) {
    movedPieceSquare = subjectMovedSquares[0].square
    movedPieceSpecies = subjectMovedSquares[0].species
  } else if (targetTeam === movingTeam && targetMovedSquares.length > 0) {
    movedPieceSquare = targetMovedSquares[0].square
    movedPieceSpecies = targetMovedSquares[0].species
  } else {
    // neither actor pool is the moving team — add a separate mover piece
    const moverSpecies = pickSpecies(candidateSpecies('any', null).filter(s => s !== Board.KING), movingTeam)
    if (!moverSpecies) { return null }
    const result = placeNextPiece({ pieces, species: moverSpecies, team: movingTeam, random })
    if (!result) { return null }
    pieces = result.pieces
    movedPieceSquare = result.square
    movedPieceSpecies = moverSpecies
  }

  if (!movedPieceSquare) { return null }

  return { afterPieces: pieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool: null }
}

// ===== Example collection =====

export function collectUnaryExamples({ plan, item, random, maxResults = 3 }) {
  const setup = buildAfterPiecesForItem({ plan, item, random })
  if (!setup) { return [] }

  const { afterPieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool } = setup
  const moves = collectLegalReverseMoves({
    afterPieces,
    movedPieceSquare,
    movedPieceSpecies,
    recentMoveContext: null,
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
      kind: 'unary',
      result: null,
      highlights: unaryActorLabels(plan, moveObject, analysis),
      sound: soundForMove(priorBoard, afterBoard, moveObject)
    })
  }

  return examples
}

// ===== Highlight labels =====

export function unaryActorLabels(plan, moveObject, analysis) {
  const afterPositions = actorPositions(analysis, {
    actor: plan.subject,
    filter: plan.subjectFilter,
    filterMode: plan.subjectFilterMode,
    boardScope: 'after'
  })
  const priorPositions = actorPositions(analysis, {
    actor: plan.subject,
    filter: plan.subjectFilter,
    filterMode: plan.subjectFilterMode,
    boardScope: 'prior'
  })

  return {
    prior: {
      subjectPositions: priorPositions,
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
