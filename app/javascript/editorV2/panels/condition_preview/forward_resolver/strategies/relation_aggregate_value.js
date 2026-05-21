// Strategy for RELATION_AGGREGATE_VALUE { operator, subject, target, side, totalOp, total, frame }.
//
// Augments `pieces` so that the sum of materialValue of distinct pieces on
// `side` involved in qualifying (subject, target) pairs satisfies (totalOp, total).
//
// Approach mirrors relation_count: incrementally add a qualifying piece on the
// chosen side (anchored to an existing piece on the opposite side), tracking
// value rather than count. Species selection caps at remaining gap for equal_to.

import { materialValue } from 'gameplay/board_query_utils'
import { pieceCode, ALL_POSITIONS, shuffled, pickRandom } from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import {
  compareValue, buildLayoutAndBoard, qualifyingPairs, subjectsRelatedToTarget
} from '../hint_compiler'
import { ACTOR_TO_VAR_KEY } from '../chain_constraints'
import { respectsInventoryCaps } from '../inventory_protocol'

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
      const board = buildLayoutAndBoard(next, movingTeam)
      const subjects = subjectsRelatedToTarget({
        board, operator: hint.operator, targetPosition: targetPos,
        subjectTeam: hint.subject.team
      })
      if (subjects.includes(subjectPos)) { return { pieces: next, position: subjectPos } }
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
      const board = buildLayoutAndBoard(next, movingTeam)
      const subjects = subjectsRelatedToTarget({
        board, operator: hint.operator, targetPosition: targetPos,
        subjectTeam: hint.subject.team
      })
      if (subjects.includes(subjectPos)) { return { pieces: next, position: targetPos } }
    }
  }
  return null
}

export function relationAggregateValueStrategy(pieces, hint, ctx) {
  if (hint.frame !== 'current') { return null }
  let result = pieces
  let placementCount = 0

  for (let i = 0; i < MAX_PLACEMENT_ITERATIONS; i += 1) {
    const board = buildLayoutAndBoard(result, ctx.movingTeam)
    const pairs = qualifyingPairs(result, board, hint)
    const current = sumOnSide(result, board, hint)
    if (compareValue(current, hint.totalOp, hint.total)) { return result }

    const side = hint.side === 'subject' ? hint.subject : hint.target
    const sideVarKey = ACTOR_TO_VAR_KEY[side.actor]
    // Singular side holds at most one piece. If one placement didn't
    // satisfy, a second wouldn't legitimately be the singular actor.
    if (sideVarKey && ctx[sideVarKey] && placementCount > 0) { return null }

    const max = maxAdditionForOp(hint.totalOp, hint.total, current)
    if (max === null || max <= 0) { return null }

    const hintSidePool = side.speciesPool ?? []
    const sidePool = (sideVarKey && ctx[sideVarKey])
      ? hintSidePool.filter(s => ctx[sideVarKey].species_set.has(s))
      : hintSidePool
    const sideTeam = hint.side === 'subject' ? hint.subject.team : hint.target.team
    const fitting = sidePool.filter(s => {
      const v = materialValue(s)
      if (v <= 0 || v > max) { return false }
      return respectsInventoryCaps(sideTeam, s, result, ctx, hint.frame)
    })
    if (fitting.length === 0) { return null }

    const anchorPositions = pairs.map(p => hint.side === 'subject' ? p.targetPosition : p.subjectPosition)
    if (anchorPositions.length === 0) { return null }

    const species = pickRandom(shuffled(fitting, ctx.random), ctx.random)
    const placed = hint.side === 'subject'
      ? addQualifyingSubjectWithSpecies(result, hint, ctx, anchorPositions, species)
      : addQualifyingTargetWithSpecies(result, hint, ctx, anchorPositions, species)
    if (placed === null) { return null }
    result = placed.pieces
    placementCount += 1
    // When the side is a singular actor, narrow ctx species_set + position_set
    // to the committed values.
    if (sideVarKey && ctx[sideVarKey]) {
      ctx[sideVarKey].species_set.clear()
      ctx[sideVarKey].species_set.add(species)
      ctx[sideVarKey].position_set.clear()
      ctx[sideVarKey].position_set.add(placed.position)
    }
  }
  return null
}
