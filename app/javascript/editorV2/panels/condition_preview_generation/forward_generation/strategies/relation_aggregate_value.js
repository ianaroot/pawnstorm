// Strategy for RELATION_AGGREGATE_VALUE { operator, subject, target, side, totalOp, total, frame }.
//
// Augments `pieces` so that the sum of materialValue of distinct pieces on
// `side` involved in qualifying (subject, target) pairs satisfies (totalOp, total).
//
// Approach mirrors relation_count: incrementally add a qualifying piece on the
// chosen side (anchored to an existing piece on the opposite side), tracking
// value rather than count. Species selection caps at remaining gap for equal_to.

import { materialValue } from 'gameplay/board_query_utils'
import { pieceCode, ALL_POSITIONS, shuffled, pickRandom } from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import {
  compareValue, piecesIntoBoard, qualifyingPairs, subjectsRelatedToTarget
} from '../hint_compiler'

const MAX_PLACEMENT_ITERATIONS = 40



function sumOnSide(pieces, board, hint) {
  const pairs = qualifyingPairs(pieces, board, hint)
  const seen = new Set()
  let total = 0
  for (const pair of pairs) {
    const position = hint.side === 'subject' ? pair.subjectPosition : pair.targetPosition
    if (seen.has(position)) { continue }
    seen.add(position)
    const species = hint.side === 'subject' ? pair.subjectSpecies : pair.targetSpecies
    total += materialValue(species)
  }
  return total
}

function maxAdditionForOp(op, target, current) {
  switch (op) {
    case 'equal_to':                 return target - current
    case 'greater_than':             return Infinity
    case 'greater_than_or_equal_to': return Infinity
    case 'less_than':
    case 'less_than_or_equal_to':    return null
    default:                         return null
  }
}

function addQualifyingSubjectWithSpecies(pieces, hint, ctx, anchorTargetPositions, subjectSpecies) {
  const { random, movingTeam } = ctx
  for (const targetPos of shuffled([...anchorTargetPositions], random)) {
    for (const subjectPos of shuffled([...ALL_POSITIONS], random)) {
      if (subjectPos === targetPos) { continue }
      if (pieces.has(subjectPos)) { continue }
      const next = placePiece(pieces, subjectPos, pieceCode(hint.subject.team, subjectSpecies))
      if (!next) { continue }
      const board = piecesIntoBoard(next, movingTeam)
      const subjects = subjectsRelatedToTarget({
        board, operator: hint.operator, targetPosition: targetPos,
        subjectTeam: hint.subject.team
      })
      if (subjects.includes(subjectPos)) { return next }
    }
  }
  return null
}

function addQualifyingTargetWithSpecies(pieces, hint, ctx, anchorSubjectPositions, targetSpecies) {
  const { random, movingTeam } = ctx
  for (const subjectPos of shuffled([...anchorSubjectPositions], random)) {
    for (const targetPos of shuffled([...ALL_POSITIONS], random)) {
      if (targetPos === subjectPos) { continue }
      if (pieces.has(targetPos)) { continue }
      const next = placePiece(pieces, targetPos, pieceCode(hint.target.team, targetSpecies))
      if (!next) { continue }
      const board = piecesIntoBoard(next, movingTeam)
      const subjects = subjectsRelatedToTarget({
        board, operator: hint.operator, targetPosition: targetPos,
        subjectTeam: hint.subject.team
      })
      if (subjects.includes(subjectPos)) { return next }
    }
  }
  return null
}

export function relationAggregateValueStrategy(pieces, hint, ctx) {
  if (hint.frame !== 'current') { return null }
  let result = pieces

  for (let i = 0; i < MAX_PLACEMENT_ITERATIONS; i += 1) {
    const board = piecesIntoBoard(result, ctx.movingTeam)
    const pairs = qualifyingPairs(result, board, hint)
    const current = sumOnSide(result, board, hint)
    if (compareValue(current, hint.totalOp, hint.total)) { return result }

    const max = maxAdditionForOp(hint.totalOp, hint.total, current)
    if (max === null || max <= 0) { return null }

    const sidePool = hint.side === 'subject' ? hint.subject.speciesPool : hint.target.speciesPool
    const fitting = (sidePool ?? []).filter(s => {
      const v = materialValue(s)
      return v > 0 && v <= max
    })
    if (fitting.length === 0) { return null }

    const anchorPositions = pairs.map(p => hint.side === 'subject' ? p.targetPosition : p.subjectPosition)
    if (anchorPositions.length === 0) { return null }

    const species = pickRandom(shuffled(fitting, ctx.random), ctx.random)
    const next = hint.side === 'subject'
      ? addQualifyingSubjectWithSpecies(result, hint, ctx, anchorPositions, species)
      : addQualifyingTargetWithSpecies(result, hint, ctx, anchorPositions, species)
    if (next === null) { return null }
    result = next
  }
  return null
}
