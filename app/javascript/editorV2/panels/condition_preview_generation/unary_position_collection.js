import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { relativeRank, relativeToAbsolutePosition, materialValue } from 'gameplay/board_query_utils'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/geometry_utils'
import {
  candidateSpecies, legalPriorTurnState, soundForMove, moveKindForMoveObject, MOVE_KIND_STANDARD
} from 'editorV2/panels/condition_preview/example_utils'
import {
  clonePiecesMap, squareIsOccupied, buildLayoutFromPieces, buildBoardFromLayout,
  shuffled, legalPlacementForSpecies, placeKingsIfAbsent, teamHasKing, MAX_PAWNS_PER_TEAM
} from './board_utils'
import { collectVerifiedMoves, buildAggregatedResult, buildAggregatedHighlights } from './move_collection'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))
const EXACT_NUMBER_TARGET = 'exact_number'
const PRIOR_BOARD_TARGET = 'prior_board_state'
const VALUE_CAP_OVER_MINIMUM = 12
const SINGULAR_BOARD_ATTEMPTS = 50
const MOBILITY_BOARD_ATTEMPTS = 100
const POSITION_BOARD_ATTEMPTS = 80
const MAX_FORWARD_MOBILITY_ATTEMPTS = 20
const BLOCKER_SPECIES_POOL = Object.freeze([Board.NIGHT, Board.BISHOP, Board.ROOK, Board.PAWN, Board.QUEEN])
const MAX_PIECE_MOBILITY = 27
const SINGULAR_CROSS_ACTOR_TARGETS = Object.freeze(new Set(['captured_piece', 'enemy_captured_piece', 'enemy_moved_piece']))

// ===== Utilities =====

function range(from, to) {
  const result = []
  for (let i = from; i <= to; i++) { result.push(i) }
  return result
}

function satisfiesComparator(comparator, sv, t) {
  switch (comparator) {
    case 'equal_to':                 return sv === t
    case 'greater_than':             return sv > t
    case 'greater_than_or_equal_to': return sv >= t
    case 'less_than':                return sv < t
    case 'less_than_or_equal_to':    return sv <= t
    default:                         return sv === t
  }
}

function isIncreasingComparator(comparator) {
  return comparator === 'greater_than' || comparator === 'greater_than_or_equal_to'
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

function targetMobilitiesForComparator(comparator, total) {
  return range(0, MAX_PIECE_MOBILITY).filter(m => satisfiesComparator(comparator, m, total))
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

export function qualifyingSquares(positionAxis, positionComparator, positionTarget, movingTeam) {
  return ALL_POSITIONS.filter(pos => {
    switch (positionAxis) {
      case 'rank': {
        const rank = relativeRank(pos, movingTeam)
        return satisfiesComparator(positionComparator, rank, positionTarget)
      }
      case 'file': {
        const file = Board.fileIndex(pos) + 1
        return satisfiesComparator(positionComparator, file, positionTarget)
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

// ===== Board placement helpers =====

function placeAtSquare({ pieces, species, team, square }) {
  if (squareIsOccupied(pieces, square) || !legalPlacementForSpecies(square, species)) { return null }
  const result = clonePiecesMap(pieces)
  result.set(square, `${team}${species}`)
  return result
}

function placeNextPiece({ pieces, species, team, random }) {
  const candidates = shuffled(
    ALL_POSITIONS.filter(pos => !squareIsOccupied(pieces, pos) && legalPlacementForSpecies(pos, species)),
    random
  )
  if (candidates.length === 0) { return null }
  const result = clonePiecesMap(pieces)
  result.set(candidates[0], `${team}${species}`)
  return { pieces: result, square: candidates[0] }
}

// ===== Enemy recent move context =====

function buildEnemyRecentMoveContext(endPosition, species, enemyTeam, capturedSpecies, movingTeam, random) {
  const candidates = shuffled(
    originCandidatesForSpecies(endPosition, species).filter(p => p !== endPosition),
    random
  )
  const startPosition = candidates.length > 0 ? candidates[0] : endPosition
  return {
    moveObject: { startPosition, endPosition },
    movingTeam: enemyTeam,
    movedPieceStartPosition: startPosition,
    movedPieceEndPosition: endPosition,
    movedPieceSpeciesBeforeMove: species,
    movedPieceSpeciesAfterMove: species,
    capturedPiecePosition: capturedSpecies ? endPosition : null,
    capturedPieceTeam: capturedSpecies ? movingTeam : null,
    capturedPieceSpecies: capturedSpecies ?? null
  }
}

// ===== Work item helpers =====

function singularCrossActorTargetItems({ target, subjectValue, comparator, targetSpeciesPool, operator, random }) {
  if (operator === 'count') {
    const validTargets = range(1, 15).filter(t => satisfiesComparator(comparator, 1, t))
    return shuffled(validTargets, random).slice(0, 4).map(targetCount => ({ targetCount }))
  }

  if (operator === 'mobility') {
    if (SINGULAR_CROSS_ACTOR_TARGETS.has(target)) {
      return shuffled([...targetSpeciesPool], random).slice(0, 4).map(targetSingularSpecies => ({ targetSingularSpecies }))
    }
    return range(1, 4).map(targetCount => ({ targetCount }))
  }

  if (SINGULAR_CROSS_ACTOR_TARGETS.has(target)) {
    const validSpecies = targetSpeciesPool.filter(s => s !== Board.KING && satisfiesComparator(comparator, subjectValue, materialValue(s)))
    return shuffled(validSpecies, random).slice(0, 4).map(targetSingularSpecies => ({ targetSingularSpecies }))
  }

  const targetItems = []
  range(1, 15).forEach(t => {
    if (!satisfiesComparator(comparator, subjectValue, t)) { return }
    valueCombinationsForTotal(t, targetSpeciesPool).forEach(targetValueCombination => {
      targetItems.push({ targetValueCombination })
    })
  })
  return shuffled(targetItems, random).slice(0, 4)
}

// ===== Work item builders =====

export function buildUnaryWorkItems(unaryPlan, random) {
  const { subject, subjectSpeciesPool, targetSpeciesPool, target, operator, comparator, targetTotal } = unaryPlan
  const items = []
  const isCrossActor = target !== EXACT_NUMBER_TARGET && target !== PRIOR_BOARD_TARGET

  if (subject === 'moved_piece') {
    for (let i = 0; i < SINGULAR_BOARD_ATTEMPTS; i++) {
      subjectSpeciesPool.forEach(movedSpecies => {
        if (isCrossActor) {
          const sv = operator === 'value' ? materialValue(movedSpecies) : 1
          singularCrossActorTargetItems({ target, subjectValue: sv, comparator, targetSpeciesPool, operator, random })
            .forEach(targetItem => items.push({ movedSpecies, ...targetItem }))
        } else {
          items.push({ movedSpecies })
        }
      })
    }
    return shuffled(items, random)
  }

  if (subject === 'captured_piece') {
    const movers = candidateSpecies('any', null)
    for (let i = 0; i < SINGULAR_BOARD_ATTEMPTS; i++) {
      shuffled(movers, random).slice(0, 4).forEach(movedSpecies => {
        subjectSpeciesPool.forEach(capturedSpecies => {
          if (isCrossActor) {
            const sv = operator === 'value' ? materialValue(capturedSpecies) : 1
            singularCrossActorTargetItems({ target, subjectValue: sv, comparator, targetSpeciesPool, operator, random })
              .forEach(targetItem => items.push({ movedSpecies, capturedSpecies, ...targetItem }))
          } else {
            items.push({ movedSpecies, capturedSpecies })
          }
        })
      })
    }
    return shuffled(items, random)
  }

  if (subject === 'enemy_moved_piece') {
    for (let i = 0; i < SINGULAR_BOARD_ATTEMPTS; i++) {
      subjectSpeciesPool.forEach(enemyMovedSpecies => {
        if (isCrossActor) {
          const sv = operator === 'value' ? materialValue(enemyMovedSpecies) : 1
          singularCrossActorTargetItems({ target, subjectValue: sv, comparator, targetSpeciesPool, operator, random })
            .forEach(targetItem => items.push({ enemyMovedSpecies, ...targetItem }))
        } else {
          items.push({ enemyMovedSpecies })
        }
      })
    }
    return shuffled(items, random)
  }

  if (subject === 'enemy_captured_piece') {
    const enemyMovers = candidateSpecies('any', null)
    for (let i = 0; i < SINGULAR_BOARD_ATTEMPTS; i++) {
      shuffled(enemyMovers, random).slice(0, 4).forEach(enemyMoverSpecies => {
        subjectSpeciesPool.forEach(enemyCapturedSpecies => {
          if (isCrossActor) {
            const sv = operator === 'value' ? materialValue(enemyCapturedSpecies) : 1
            singularCrossActorTargetItems({ target, subjectValue: sv, comparator, targetSpeciesPool, operator, random })
              .forEach(targetItem => items.push({ enemyMoverSpecies, enemyCapturedSpecies, ...targetItem }))
          } else {
            items.push({ enemyMoverSpecies, enemyCapturedSpecies })
          }
        })
      })
    }
    return shuffled(items, random)
  }

  // allied or enemy
  const effectiveCounts = targetTotal !== null ? targetCountsForComparator(comparator, targetTotal) : range(1, 10)
  const effectiveValues = targetTotal !== null ? targetValuesForComparator(comparator, targetTotal) : range(1, 15)
  const effectiveMobilities = targetTotal !== null ? targetMobilitiesForComparator(comparator, targetTotal) : range(0, MAX_PIECE_MOBILITY)

  if (operator === 'count') {
    effectiveCounts.forEach(count => {
      if (count > 0) { items.push({ count }) }
    })
  } else if (operator === 'mobility') {
    for (let attempt = 0; attempt < MOBILITY_BOARD_ATTEMPTS; attempt++) {
      effectiveMobilities.forEach(targetMobility => {
        subjectSpeciesPool.forEach(species => { items.push({ species, targetMobility }) })
      })
      effectiveCounts.forEach(count => {
        if (count > 0) { items.push({ count }) }
      })
      effectiveCounts.forEach(count => {
        if (count > 1) { subjectSpeciesPool.forEach(species => { items.push({ count, species }) }) }
      })
    }
  } else if (operator === 'value') {
    effectiveValues.forEach(v => {
      valueCombinationsForTotal(v, subjectSpeciesPool).forEach(valueCombination => {
        items.push({ valueCombination })
      })
    })
  }

  if (isCrossActor) {
    const paired = []

    if (operator === 'count') {
      range(1, 15).forEach(sc => {
        const validTargets = range(1, 15).filter(t => satisfiesComparator(comparator, sc, t))
        shuffled(validTargets, random).slice(0, 4).forEach(targetCount => {
          paired.push({ count: sc, targetCount })
        })
      })
    } else if (operator === 'mobility') {
      for (let attempt = 0; attempt < MOBILITY_BOARD_ATTEMPTS; attempt++) {
        range(1, 6).forEach(sc => {
          if (SINGULAR_CROSS_ACTOR_TARGETS.has(target)) {
            shuffled([...targetSpeciesPool], random).slice(0, 2).forEach(targetSingularSpecies => {
              paired.push({ count: sc, targetSingularSpecies })
            })
          } else {
            range(1, 6).forEach(tc => { paired.push({ count: sc, targetCount: tc }) })
          }
        })
      }
    } else if (operator === 'value') {
      const subjectComboMap = new Map()
      range(1, 15).forEach(sv => {
        valueCombinationsForTotal(sv, subjectSpeciesPool).forEach(valueCombination => {
          const key = valueCombination.join(',')
          if (!subjectComboMap.has(key)) { subjectComboMap.set(key, { valueCombination, total: sv, targetItems: [] }) }
        })
      })
      subjectComboMap.forEach(({ total: sv, targetItems }) => {
        range(1, 15).forEach(t => {
          if (!satisfiesComparator(comparator, sv, t)) { return }
          valueCombinationsForTotal(t, targetSpeciesPool).forEach(targetValueCombination => {
            targetItems.push(targetValueCombination)
          })
        })
      })
      shuffled(Array.from(subjectComboMap.values()), random).forEach(({ valueCombination, targetItems }) => {
        shuffled(targetItems, random).slice(0, 4).forEach(targetValueCombination => {
          paired.push({ valueCombination, targetValueCombination })
        })
      })
    }

    return shuffled(paired, random)
  }

  return shuffled(items, random)
}

export function buildPositionWorkItems(positionPlan, movingTeam, random) {
  const { subject, subjectSpeciesPool, operator, comparator, targetTotal, positionAxis, positionComparator, positionTarget } = positionPlan
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

  // allied or enemy
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

// ===== Board building for unary =====

function buildAfterPiecesForUnaryItem({ combinedPlan, unaryPlan, item, random }) {
  const { subject, subjectTeam, targetTeam, target, subjectSpeciesPool, targetSpeciesPool, operator, comparator } = unaryPlan
  const { movingTeam } = combinedPlan
  const enemyTeam = Board.opposingTeam(movingTeam)
  const isPBS = target === PRIOR_BOARD_TARGET
  const isPBSIncreasing = isPBS && isIncreasingComparator(comparator)
  const isPBSDecreasing = isPBS && !isPBSIncreasing && comparator !== 'equal_to'

  function applyCrossActorTarget(pieces, pawnCount, baseRecentMoveContext, baseCapturedPool) {
    if (item.targetSingularSpecies !== undefined) {
      if (target === 'captured_piece') {
        return { pieces, recentMoveContext: baseRecentMoveContext, capturedPieceSpeciesPool: [item.targetSingularSpecies] }
      }
      if (target === 'enemy_captured_piece') {
        const endPos = baseRecentMoveContext?.movedPieceEndPosition ?? (pieces.keys().next().value ?? 0)
        const species = baseRecentMoveContext?.movedPieceSpeciesAfterMove ?? Board.PAWN
        const ctx = buildEnemyRecentMoveContext(endPos, species, enemyTeam, item.targetSingularSpecies, movingTeam, random)
        return { pieces, recentMoveContext: ctx, capturedPieceSpeciesPool: baseCapturedPool }
      }
      if (target === 'enemy_moved_piece') {
        const enemyResult = placeNextPiece({ pieces, species: item.targetSingularSpecies, team: enemyTeam, random })
        const endPos = enemyResult ? enemyResult.square : (baseRecentMoveContext?.movedPieceEndPosition ?? 0)
        const placedPieces = enemyResult ? enemyResult.pieces : pieces
        const ctx = buildEnemyRecentMoveContext(endPos, item.targetSingularSpecies, enemyTeam, null, movingTeam, random)
        return { pieces: placedPieces, recentMoveContext: ctx, capturedPieceSpeciesPool: baseCapturedPool }
      }
    }

    if (!item.targetValueCombination && !item.targetCount) {
      return { pieces, recentMoveContext: baseRecentMoveContext, capturedPieceSpeciesPool: baseCapturedPool }
    }

    const slots = item.targetValueCombination
      ? item.targetValueCombination.map(v => {
          const pool = targetSpeciesPool.filter(s => materialValue(s) === v && (s !== Board.PAWN || pawnCount[targetTeam] < MAX_PAWNS_PER_TEAM))
          if (pool.length === 0) { return null }
          return pool[Math.floor(random() * pool.length)]
        }).filter(Boolean)
      : Array.from({ length: item.targetCount }, () => {
          const pool = targetSpeciesPool.filter(s => s !== Board.PAWN || pawnCount[targetTeam] < MAX_PAWNS_PER_TEAM)
          if (pool.length === 0) { return null }
          return pool[Math.floor(random() * pool.length)]
        }).filter(Boolean)

    let current = pieces
    for (const species of slots) {
      const r = placeNextPiece({ pieces: current, species, team: targetTeam, random })
      if (r) {
        current = r.pieces
        if (species === Board.PAWN) { pawnCount[targetTeam]++ }
      }
    }
    return { pieces: current, recentMoveContext: baseRecentMoveContext, capturedPieceSpeciesPool: baseCapturedPool }
  }

  function initPawnCount(primaryTeam, primarySpecies) {
    const counts = { [primaryTeam]: primarySpecies === Board.PAWN ? 1 : 0 }
    if (targetTeam && targetTeam !== primaryTeam) { counts[targetTeam] = 0 }
    return counts
  }

  // ===== Singular subjects =====

  if (subject === 'moved_piece') {
    const species = item.movedSpecies
    const result = placeNextPiece({ pieces: new Map(), species, team: subjectTeam, random })
    if (!result) { return null }
    const capturedPieceSpeciesPool = isPBS
      ? [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]
      : null
    const applied = applyCrossActorTarget(result.pieces, initPawnCount(subjectTeam, species), null, capturedPieceSpeciesPool)
    return { afterPieces: applied.pieces, movedPieceSquare: result.square, movedPieceSpecies: species, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  if (subject === 'captured_piece') {
    const result = placeNextPiece({ pieces: new Map(), species: item.movedSpecies, team: subjectTeam, random })
    if (!result) { return null }
    const applied = applyCrossActorTarget(result.pieces, initPawnCount(subjectTeam, item.movedSpecies), null, [item.capturedSpecies])
    return { afterPieces: applied.pieces, movedPieceSquare: result.square, movedPieceSpecies: item.movedSpecies, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  if (subject === 'enemy_moved_piece') {
    const enemyResult = placeNextPiece({ pieces: new Map(), species: item.enemyMovedSpecies, team: enemyTeam, random })
    if (!enemyResult) { return null }
    const baseContext = buildEnemyRecentMoveContext(enemyResult.square, item.enemyMovedSpecies, enemyTeam, null, movingTeam, random)
    const allSpecies = candidateSpecies('any', null)
    const moverSpecies = allSpecies[Math.floor(random() * allSpecies.length)]
    const moverResult = placeNextPiece({ pieces: enemyResult.pieces, species: moverSpecies, team: movingTeam, random })
    if (!moverResult) { return null }
    const applied = applyCrossActorTarget(moverResult.pieces, initPawnCount(movingTeam, moverSpecies), baseContext, null)
    return { afterPieces: applied.pieces, movedPieceSquare: moverResult.square, movedPieceSpecies: moverSpecies, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  if (subject === 'enemy_captured_piece') {
    const enemyResult = placeNextPiece({ pieces: new Map(), species: item.enemyMoverSpecies, team: enemyTeam, random })
    if (!enemyResult) { return null }
    const baseContext = buildEnemyRecentMoveContext(enemyResult.square, item.enemyMoverSpecies, enemyTeam, item.enemyCapturedSpecies, movingTeam, random)
    const allSpecies = candidateSpecies('any', null)
    const moverSpecies = allSpecies[Math.floor(random() * allSpecies.length)]
    const moverResult = placeNextPiece({ pieces: enemyResult.pieces, species: moverSpecies, team: movingTeam, random })
    if (!moverResult) { return null }
    const applied = applyCrossActorTarget(moverResult.pieces, initPawnCount(movingTeam, moverSpecies), baseContext, null)
    return { afterPieces: applied.pieces, movedPieceSquare: moverResult.square, movedPieceSpecies: moverSpecies, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  // ===== Mobility items: single piece + blockers =====

  if (item.targetMobility !== undefined) {
    let currentPieces = new Map()

    const subjectResult = placeNextPiece({ pieces: currentPieces, species: item.species, team: subjectTeam, random })
    if (!subjectResult) { return null }
    currentPieces = subjectResult.pieces

    const opposingTeam = Board.opposingTeam(subjectTeam)
    const extraCount = Math.min(10, Math.max(3, Math.floor((MAX_PIECE_MOBILITY - item.targetMobility) / 3)))
    const extraPositions = shuffled(ALL_POSITIONS.filter(p => !squareIsOccupied(currentPieces, p)), random).slice(0, extraCount)
    for (const sq of extraPositions) {
      const team = random() < 0.5 ? subjectTeam : opposingTeam
      const validSpecies = BLOCKER_SPECIES_POOL.filter(s => legalPlacementForSpecies(sq, s))
      if (validSpecies.length === 0) { continue }
      const species = validSpecies[Math.floor(random() * validSpecies.length)]
      const next = placeAtSquare({ pieces: currentPieces, species, team, square: sq })
      if (next) { currentPieces = next }
    }

    let movedPieceSquare = subjectResult.square
    let movedPieceSpecies = item.species
    if (subjectTeam !== movingTeam) {
      const allSpecies = candidateSpecies('any', null).filter(s => s !== Board.KING || !teamHasKing(currentPieces, movingTeam))
      const moverSpecies = allSpecies[Math.floor(random() * allSpecies.length)]
      const moverResult = placeNextPiece({ pieces: currentPieces, species: moverSpecies, team: movingTeam, random })
      if (!moverResult) { return null }
      currentPieces = moverResult.pieces
      movedPieceSquare = moverResult.square
      movedPieceSpecies = moverSpecies
    }
    return { afterPieces: currentPieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
  }

  // ===== Group subject (allied / enemy): count or value =====

  let pieces = new Map()
  const subjectMovedSquares = []
  const targetMovedSquares = []
  const pawnCount = { [subjectTeam]: 0 }
  if (targetTeam && targetTeam !== subjectTeam) { pawnCount[targetTeam] = 0 }

  function pickSpecies(pool, team) {
    const filtered = pool.filter(s => s !== Board.PAWN || pawnCount[team] < MAX_PAWNS_PER_TEAM)
    if (filtered.length === 0) { return null }
    return filtered[Math.floor(random() * filtered.length)]
  }

  const subjectSlots = item.valueCombination
    ? item.valueCombination.map(v => pickSpecies(subjectSpeciesPool.filter(s => materialValue(s) === v), subjectTeam)).filter(Boolean)
    : Array.from({ length: item.count }, () => {
        const pool = item.species ? subjectSpeciesPool.filter(s => s === item.species) : subjectSpeciesPool
        return pickSpecies(pool, subjectTeam)
      }).filter(Boolean)

  for (const species of subjectSlots) {
    const result = placeNextPiece({ pieces, species, team: subjectTeam, random })
    if (!result) { return null }
    pieces = result.pieces
    if (species === Board.PAWN) { pawnCount[subjectTeam]++ }
    subjectMovedSquares.push({ square: result.square, species })
  }

  if (target !== EXACT_NUMBER_TARGET && target !== PRIOR_BOARD_TARGET) {
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

  // ===== Moved piece selection =====

  let movedPieceSquare = null
  let movedPieceSpecies = null
  let capturedPieceSpeciesPool = null

  if (isPBSIncreasing && subjectTeam === movingTeam && (operator === 'count' || operator === 'value')) {
    // PBS increasing (allied subject): moved piece IS a random allied subject piece.
    // In the prior board it will be at its origin (not yet qualifying), creating the delta.
    if (subjectMovedSquares.length > 0) {
      const idx = Math.floor(random() * subjectMovedSquares.length)
      movedPieceSquare = subjectMovedSquares[idx].square
      movedPieceSpecies = subjectMovedSquares[idx].species
    }
  } else if (isPBSDecreasing && subjectTeam !== movingTeam && (operator === 'count' || operator === 'value')) {
    // PBS decreasing (enemy subject): capture strategy — moved piece captures an enemy subject piece.
    const capturePool = item.valueCombination
      ? item.valueCombination.flatMap(v => subjectSpeciesPool.filter(s => materialValue(s) === v))
      : [...subjectSpeciesPool]
    const captureSpecies = capturePool.length > 0
      ? capturePool[Math.floor(random() * capturePool.length)]
      : null
    if (captureSpecies) { capturedPieceSpeciesPool = [captureSpecies] }
  }

  if (movedPieceSquare === null) {
    if (subjectTeam === movingTeam && subjectMovedSquares.length > 0) {
      const idx = Math.floor(random() * subjectMovedSquares.length)
      movedPieceSquare = subjectMovedSquares[idx].square
      movedPieceSpecies = subjectMovedSquares[idx].species
    } else if (targetTeam === movingTeam && targetMovedSquares.length > 0) {
      const idx = Math.floor(random() * targetMovedSquares.length)
      movedPieceSquare = targetMovedSquares[idx].square
      movedPieceSpecies = targetMovedSquares[idx].species
    } else {
      const canPlaceKing = !teamHasKing(pieces, movingTeam)
      const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING || canPlaceKing)
      const moverSpecies = moverPool.length > 0 ? moverPool[Math.floor(random() * moverPool.length)] : null
      if (!moverSpecies) { return null }
      const moverResult = placeNextPiece({ pieces, species: moverSpecies, team: movingTeam, random })
      if (!moverResult) { return null }
      pieces = moverResult.pieces
      movedPieceSquare = moverResult.square
      movedPieceSpecies = moverSpecies
    }
  }

  if (!movedPieceSquare) { return null }
  return { afterPieces: pieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool, recentMoveContext: null }
}

// ===== Board building for position =====

function buildAfterPiecesForPositionItem({ combinedPlan, positionPlan, item, validSquares, random }) {
  const { subject, subjectTeam, subjectSpeciesPool, operator, comparator } = positionPlan
  const { movingTeam } = combinedPlan
  const enemyTeam = Board.opposingTeam(movingTeam)
  const isPBS = positionPlan.target === PRIOR_BOARD_TARGET
  const isPBSIncreasing = isPBS && isIncreasingComparator(comparator)

  if (subject === 'moved_piece') {
    const placed = placeAtSquare({ pieces: new Map(), species: item.movedSpecies, team: subjectTeam, square: item.movedSquare })
    if (!placed) { return null }
    return { afterPieces: placed, movedPieceSquare: item.movedSquare, movedPieceSpecies: item.movedSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
  }

  if (subject === 'enemy_moved_piece') {
    const placed = placeAtSquare({ pieces: new Map(), species: item.enemyMovedSpecies, team: enemyTeam, square: item.enemyMovedSquare })
    if (!placed) { return null }
    const recentMoveContext = buildEnemyRecentMoveContext(item.enemyMovedSquare, item.enemyMovedSpecies, enemyTeam, null, movingTeam, random)
    const moverPool = candidateSpecies('any', null)
    const moverSpecies = moverPool[Math.floor(random() * moverPool.length)]
    const moverResult = placeNextPiece({ pieces: placed, species: moverSpecies, team: movingTeam, random })
    if (!moverResult) { return null }
    return { afterPieces: moverResult.pieces, movedPieceSquare: moverResult.square, movedPieceSpecies: moverSpecies, capturedPieceSpeciesPool: null, recentMoveContext }
  }

  // Group actors: place pieces at qualifying squares
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

  // PBS increasing: moved piece IS one of the subject pieces landing on the qualifying square
  if (isPBSIncreasing && subjectTeam === movingTeam && placedSquares.length > 0) {
    const idx = Math.floor(random() * placedSquares.length)
    const { square: movedPieceSquare, species: movedPieceSpecies } = placedSquares[idx]
    return { afterPieces: pieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
  }

  // Default: separate mover, allowing blocker strategy to emerge through reverse generation
  const canPlaceKing = !teamHasKing(pieces, movingTeam)
  const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING || canPlaceKing)
  const moverSpecies = moverPool[Math.floor(random() * moverPool.length)]
  const moverResult = placeNextPiece({ pieces, species: moverSpecies, team: movingTeam, random })
  if (!moverResult) { return null }

  return { afterPieces: moverResult.pieces, movedPieceSquare: moverResult.square, movedPieceSpecies: moverSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
}

// ===== Mobility forward generation =====

// ===== Example collection =====

export function collectUnaryExamples({ combinedPlan, unaryPlan, item, random, maxResults = 3 }) {
  const setup = buildAfterPiecesForUnaryItem({ combinedPlan, unaryPlan, item, random })
  if (!setup) { return [] }

  const { afterPieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool, recentMoveContext } = setup

  const moves = collectVerifiedMoves({
    pieces: afterPieces,
    movedPieceSquare,
    movedPieceSpecies,
    movingTeam: combinedPlan.movingTeam,
    attemptKind: MOVE_KIND_STANDARD,
    recentMoveContext,
    capturedPieceSpeciesPool,
    evaluationPayloads: combinedPlan.evaluationPayloads,
    random,
    maxResults
  })

  const examples = []
  for (const { priorBoard, moveObject, afterBoard } of moves) {
    const analysis = new CandidateMoveAnalysisV2({ board: priorBoard, moveObject })
    const aggregatedResult = buildAggregatedResult(combinedPlan, analysis)
    if (!aggregatedResult) { continue }

    const highlights = buildAggregatedHighlights(combinedPlan, moveObject, aggregatedResult, priorBoard)
    const movedPieceInRelation = (
      aggregatedResult.subjectPositions.includes(moveObject.endPosition) ||
      aggregatedResult.targetPositions.includes(moveObject.endPosition)
    )

    examples.push({
      priorBoard,
      afterBoard,
      moveObject,
      result: aggregatedResult,
      highlights,
      variantType: movedPieceInRelation ? 'involved' : 'separate',
      geometryKey: `unary-${unaryPlan.subject}-${unaryPlan.operator}`,
      movedPieceInRelation,
      moveKind: moveKindForMoveObject(moveObject),
      sound: soundForMove(priorBoard, afterBoard, moveObject)
    })
  }

  return examples
}

export function collectPositionExamples({ combinedPlan, positionPlan, item, random, maxResults = 3 }) {
  const validSquares = qualifyingSquares(
    positionPlan.positionAxis, positionPlan.positionComparator, positionPlan.positionTarget,
    combinedPlan.movingTeam
  )

  const setup = buildAfterPiecesForPositionItem({ combinedPlan, positionPlan, item, validSquares, random })
  if (!setup) { return [] }

  const { afterPieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool, recentMoveContext } = setup

  const moves = collectVerifiedMoves({
    pieces: afterPieces,
    movedPieceSquare,
    movedPieceSpecies,
    movingTeam: combinedPlan.movingTeam,
    attemptKind: MOVE_KIND_STANDARD,
    recentMoveContext,
    capturedPieceSpeciesPool,
    evaluationPayloads: combinedPlan.evaluationPayloads,
    random,
    maxResults
  })

  const examples = []
  for (const { priorBoard, moveObject, afterBoard } of moves) {
    const analysis = new CandidateMoveAnalysisV2({ board: priorBoard, moveObject })
    const aggregatedResult = buildAggregatedResult(combinedPlan, analysis)
    if (!aggregatedResult) { continue }

    const highlights = buildAggregatedHighlights(combinedPlan, moveObject, aggregatedResult, priorBoard)
    const movedPieceInRelation = (
      aggregatedResult.subjectPositions.includes(moveObject.endPosition) ||
      aggregatedResult.targetPositions.includes(moveObject.endPosition)
    )

    examples.push({
      priorBoard,
      afterBoard,
      moveObject,
      result: aggregatedResult,
      highlights,
      variantType: movedPieceInRelation ? 'involved' : 'separate',
      geometryKey: `position-${positionPlan.positionAxis}-${positionPlan.positionComparator}-${positionPlan.positionTarget}`,
      movedPieceInRelation,
      moveKind: moveKindForMoveObject(moveObject),
      sound: soundForMove(priorBoard, afterBoard, moveObject)
    })
  }

  return examples
}
