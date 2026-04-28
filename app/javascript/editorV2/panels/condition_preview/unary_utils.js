import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { relationalActorPositions } from 'bot_execution/actor_positions'
import Board from 'gameplay/board'
import { materialValue } from 'gameplay/board_query_utils'
import {
  clonePiecesMap, pieceCode, squareIsOccupied, shuffled, legalPlacementForSpecies, MAX_PAWNS_PER_TEAM
} from 'editorV2/panels/condition_preview/board_utils'
import {
  collectLegalReverseMoves, soundForMove, candidateSpecies, MOVE_KIND_STANDARD
} from 'editorV2/panels/condition_preview/example_utils'
import { buildEnemyRecentMoveContextWithCapture } from 'editorV2/panels/condition_preview/candidate_collection'

const ALL_POSITIONS = Array.from({ length: 64 }, (_, i) => i)
const EXACT_NUMBER_TARGET = 'exact_number'
const VALUE_CAP_OVER_MINIMUM = 12
const SINGULAR_BOARD_ATTEMPTS = 50
const MOBILITY_BOARD_ATTEMPTS = 100
const BLOCKER_SPECIES_POOL = [Board.NIGHT, Board.BISHOP, Board.ROOK, Board.PAWN]
const MAX_PIECE_MOBILITY = 27

// ===== Target range helpers =====

function range(from, to) {
  const result = []
  for (let i = from; i <= to; i++) { result.push(i) }
  return result
}

function targetMobilitiesForComparator(comparator, total) {
  return range(0, MAX_PIECE_MOBILITY).filter(m => satisfiesComparator(comparator, m, total))
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

// ===== Work item builders =====

const SINGULAR_CROSS_ACTOR_TARGETS = new Set(['captured_piece', 'enemy_captured_piece', 'enemy_moved_piece'])

function singularCrossActorTargetItems({ target, subjectValue, comparator, targetSpeciesPool, operator, random }) {
  if (operator === 'count') {
    const validTargets = range(1, 15).filter(t => satisfiesComparator(comparator, 1, t))
    return shuffled(validTargets, random).slice(0, 4).map(targetCount => ({ targetCount }))
  }

  // For singular targets (captured_piece, enemy_captured_piece, enemy_moved_piece), enumerate individual species
  if (SINGULAR_CROSS_ACTOR_TARGETS.has(target)) {
    const validSpecies = targetSpeciesPool.filter(s => s !== Board.KING && satisfiesComparator(comparator, subjectValue, materialValue(s)))
    return shuffled(validSpecies, random).slice(0, 4).map(targetSingularSpecies => ({ targetSingularSpecies }))
  }

  // Group targets (allied, enemy): use value combinations
  const targetItems = []
  range(1, 15).forEach(t => {
    if (!satisfiesComparator(comparator, subjectValue, t)) { return }
    valueCombinationsForTotal(t, targetSpeciesPool).forEach(targetValueCombination => {
      targetItems.push({ targetValueCombination })
    })
  })
  return shuffled(targetItems, random).slice(0, 4)
}

export function buildUnaryWorkItems(plan, random) {
  const { subject, subjectSpeciesPool, targetSpeciesPool, target, operator, comparator, targetTotal } = plan
  const items = []
  const isCrossActor = target !== EXACT_NUMBER_TARGET

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
  if (operator === 'count') {
    targetCountsForComparator(comparator, targetTotal).forEach(count => {
      if (count > 0) { items.push({ count }) }
    })
  } else if (operator === 'mobility') {
    for (let attempt = 0; attempt < MOBILITY_BOARD_ATTEMPTS; attempt++) {
      // Tier 1: single subject piece with random pieces placed to restrict mobility
      targetMobilitiesForComparator(comparator, targetTotal).forEach(targetMobility => {
        subjectSpeciesPool.forEach(species => { items.push({ species, targetMobility }) })
      })
      // Tier 2: multi-piece aggregate, random placement
      targetCountsForComparator(comparator, targetTotal).forEach(count => {
        if (count > 0) { items.push({ count }) }
      })
      // Tier 3: fixed-species homogeneous groups (exposes e.g. "8 pawns with 1 mobility each")
      targetCountsForComparator(comparator, targetTotal).forEach(count => {
        if (count > 1) { subjectSpeciesPool.forEach(species => { items.push({ count, species }) }) }
      })
    }
  } else if (operator === 'value') {
    targetValuesForComparator(comparator, targetTotal).forEach(v => {
      valueCombinationsForTotal(v, subjectSpeciesPool).forEach(valueCombination => {
        items.push({ valueCombination })
      })
    })
  }

  if (target !== EXACT_NUMBER_TARGET) {
    // cross-actor: enumerate subject combos as outer loop so every distinct subject gets equal representation
    const paired = []

    if (operator === 'count') {
      range(1, 15).forEach(sc => {
        const validTargets = range(1, 15).filter(t => satisfiesComparator(comparator, sc, t))
        shuffled(validTargets, random).slice(0, 4).forEach(targetCount => {
          paired.push({ count: sc, targetCount })
        })
      })
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

function buildAfterPiecesForItem({ plan, item, random }) {
  const { subject, subjectTeam, targetTeam, target, subjectSpeciesPool, targetSpeciesPool, movingTeam } = plan

  function applyCrossActorTarget(pieces, pawnCount, baseRecentMoveContext, baseCapturedPool) {
    // Singular targets: captured_piece → capturedPieceSpeciesPool, enemy_captured_piece/enemy_moved_piece → recentMoveContext
    if (item.targetSingularSpecies !== undefined) {
      if (target === 'captured_piece') {
        return { pieces, recentMoveContext: baseRecentMoveContext, capturedPieceSpeciesPool: [item.targetSingularSpecies] }
      }
      if (target === 'enemy_captured_piece') {
        const ctx = buildEnemyRecentMoveContextWithCapture(
          baseRecentMoveContext?.movedPieceEndPosition || pieces.keys().next().value,
          baseRecentMoveContext?.movedPieceSpeciesAfterMove || Board.PAWN,
          item.targetSingularSpecies
        )
        return { pieces, recentMoveContext: ctx, capturedPieceSpeciesPool: baseCapturedPool }
      }
      if (target === 'enemy_moved_piece') {
        const ctx = buildEnemyRecentMoveContextWithCapture(
          baseRecentMoveContext?.movedPieceEndPosition || pieces.keys().next().value,
          item.targetSingularSpecies,
          null
        )
        return { pieces, recentMoveContext: ctx, capturedPieceSpeciesPool: baseCapturedPool }
      }
    }

    // Group targets (allied, enemy): place on board
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

  if (subject === 'moved_piece') {
    const species = item.movedSpecies
    const result = placeNextPiece({ pieces: new Map(), species, team: subjectTeam, random })
    if (!result) { return null }
    const applied = applyCrossActorTarget(result.pieces, initPawnCount(subjectTeam, species), null, null)
    return { afterPieces: applied.pieces, movedPieceSquare: result.square, movedPieceSpecies: species, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  if (subject === 'captured_piece') {
    const result = placeNextPiece({ pieces: new Map(), species: item.movedSpecies, team: subjectTeam, random })
    if (!result) { return null }
    const applied = applyCrossActorTarget(result.pieces, initPawnCount(subjectTeam, item.movedSpecies), null, [item.capturedSpecies])
    return { afterPieces: applied.pieces, movedPieceSquare: result.square, movedPieceSpecies: item.movedSpecies, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  if (subject === 'enemy_moved_piece') {
    const enemyTeam = Board.opposingTeam(movingTeam)
    const enemyResult = placeNextPiece({ pieces: new Map(), species: item.enemyMovedSpecies, team: enemyTeam, random })
    if (!enemyResult) { return null }
    const baseContext = buildEnemyRecentMoveContextWithCapture(enemyResult.square, item.enemyMovedSpecies, null)
    const allSpecies = candidateSpecies('any', null)
    const moverSpecies = allSpecies[Math.floor(random() * allSpecies.length)]
    const moverResult = placeNextPiece({ pieces: enemyResult.pieces, species: moverSpecies, team: movingTeam, random })
    if (!moverResult) { return null }
    const applied = applyCrossActorTarget(moverResult.pieces, initPawnCount(movingTeam, moverSpecies), baseContext, null)
    return { afterPieces: applied.pieces, movedPieceSquare: moverResult.square, movedPieceSpecies: moverSpecies, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  if (subject === 'enemy_captured_piece') {
    const enemyTeam = Board.opposingTeam(movingTeam)
    const enemyResult = placeNextPiece({ pieces: new Map(), species: item.enemyMoverSpecies, team: enemyTeam, random })
    if (!enemyResult) { return null }
    const baseContext = buildEnemyRecentMoveContextWithCapture(enemyResult.square, item.enemyMoverSpecies, item.enemyCapturedSpecies)
    const allSpecies = candidateSpecies('any', null)
    const moverSpecies = allSpecies[Math.floor(random() * allSpecies.length)]
    const moverResult = placeNextPiece({ pieces: enemyResult.pieces, species: moverSpecies, team: movingTeam, random })
    if (!moverResult) { return null }
    const applied = applyCrossActorTarget(moverResult.pieces, initPawnCount(movingTeam, moverSpecies), baseContext, null)
    return { afterPieces: applied.pieces, movedPieceSquare: moverResult.square, movedPieceSpecies: moverSpecies, capturedPieceSpeciesPool: applied.capturedPieceSpeciesPool, recentMoveContext: applied.recentMoveContext }
  }

  // allied/enemy mobility: single subject piece + kings + random nearby pieces, evaluator filters
  if (item.targetMobility !== undefined) {
    let currentPieces = new Map()

    const subjectResult = placeNextPiece({ pieces: currentPieces, species: item.species, team: subjectTeam, random })
    if (!subjectResult) { return null }
    currentPieces = subjectResult.pieces

    // Place subject-team king unless subject IS the king
    if (item.species !== Board.KING) {
      const kingResult = placeNextPiece({ pieces: currentPieces, species: Board.KING, team: subjectTeam, random })
      if (!kingResult) { return null }
      currentPieces = kingResult.pieces
    }

    const opposingTeam = Board.opposingTeam(subjectTeam)
    const opposingKingResult = placeNextPiece({ pieces: currentPieces, species: Board.KING, team: opposingTeam, random })
    if (!opposingKingResult) { return null }
    currentPieces = opposingKingResult.pieces

    // Add random pieces to constrain mobility; more pieces for lower target mobility
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
      const allSpecies = candidateSpecies('any', null).filter(s => s !== Board.KING)
      const moverSpecies = allSpecies[Math.floor(random() * allSpecies.length)]
      const moverResult = placeNextPiece({ pieces: currentPieces, species: moverSpecies, team: movingTeam, random })
      if (!moverResult) { return null }
      currentPieces = moverResult.pieces
      movedPieceSquare = moverResult.square
      movedPieceSpecies = moverSpecies
    }
    return { afterPieces: currentPieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
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
    : Array.from({ length: item.count }, () => {
        const pool = item.species ? subjectSpeciesPool.filter(s => s === item.species) : subjectSpeciesPool
        return pickSpecies(pool, subjectTeam)
      }).filter(Boolean)

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

  return { afterPieces: pieces, movedPieceSquare, movedPieceSpecies, capturedPieceSpeciesPool: null, recentMoveContext: null }
}

// ===== Example collection =====

export function collectUnaryExamples({ plan, item, random, maxResults = 3 }) {
  const setup = buildAfterPiecesForItem({ plan, item, random })
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
      kind: 'unary',
      result: null,
      highlights: unaryActorLabels(plan, moveObject, analysis),
      sound: soundForMove(priorBoard, afterBoard, moveObject)
    })
  }

  return examples
}

// ===== Highlight labels =====

const POSITIONAL_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'])

export function unaryActorLabels(plan, moveObject, analysis) {
  const isPositional = POSITIONAL_ACTORS.has(plan.subject)
  const afterPositions = isPositional ? relationalActorPositions(analysis, {
    actor: plan.subject,
    filter: plan.subjectFilter,
    filterMode: plan.subjectFilterMode,
    boardScope: 'after'
  }) : []
  const priorPositions = isPositional ? relationalActorPositions(analysis, {
    actor: plan.subject,
    filter: plan.subjectFilter,
    filterMode: plan.subjectFilterMode,
    boardScope: 'prior'
  }) : []

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
