// Strategy for ACTOR_AGGREGATE_VALUE { actor, team, filter, speciesPool, totalOp, total, frame }.
//
// Augments `pieces` so that the sum of materialValue of pieces matching team +
// filter satisfies (totalOp, total). Adds pieces greedily, choosing species
// whose value fits remaining headroom (so equal_to lands exactly when the
// pool allows it).

import { materialValue } from 'gameplay/board_query_utils'
import { pieceCode } from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { compareValue, pieceMatchesFilter } from '../hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))
const MAX_PLACEMENT_ITERATIONS = 40

function shuffled(values, random) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickRandom(values, random) {
  if (!values || values.length === 0) { return null }
  return values[Math.floor(random() * values.length)]
}

function sumActorValue(pieces, hint) {
  let total = 0
  for (const [, piece] of pieces.entries()) {
    if (piece.charAt(0) !== hint.team) { continue }
    if (!pieceMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
    total += materialValue(piece.slice(1))
  }
  return total
}

// Max value we can add this step without overshooting. equal_to caps at the
// remaining gap; >, >= have no cap; <, <= can't be reached by adding.
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

export function actorAggregateValueStrategy(pieces, hint, ctx) {
  if (hint.frame !== 'current') { return null }
  let result = pieces

  for (let i = 0; i < MAX_PLACEMENT_ITERATIONS; i += 1) {
    const current = sumActorValue(result, hint)
    if (compareValue(current, hint.totalOp, hint.total)) { return result }

    const max = maxAdditionForOp(hint.totalOp, hint.total, current)
    if (max === null || max <= 0) { return null }

    const fitting = (hint.speciesPool ?? []).filter(s => {
      const v = materialValue(s)
      return v > 0 && v <= max
    })
    if (fitting.length === 0) { return null }

    const species = pickRandom(shuffled(fitting, ctx.random), ctx.random)
    let placed = false
    for (const pos of shuffled([...ALL_POSITIONS], ctx.random)) {
      if (result.has(pos)) { continue }
      const next = placePiece(result, pos, pieceCode(hint.team, species))
      if (next) { result = next; placed = true; break }
    }
    if (!placed) { return null }
  }
  return null
}
