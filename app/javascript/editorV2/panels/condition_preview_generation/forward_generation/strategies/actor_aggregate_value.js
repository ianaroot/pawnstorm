// Strategy for ACTOR_AGGREGATE_VALUE { actor, team, filter, speciesPool, totalOp, total, frame }.
//
// Augments `pieces` so that the sum of materialValue of pieces matching team +
// filter satisfies (totalOp, total). Adds pieces greedily, choosing species
// whose value fits remaining headroom (so equal_to lands exactly when the
// pool allows it).

import { materialValue } from 'gameplay/board_query_utils'
import { pieceCode, ALL_POSITIONS, shuffled, pickRandom } from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { compareValue } from '../hint_compiler'
import { speciesMatchesFilter } from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { ACTOR_TO_VAR_KEY } from '../chain_constraints'
import { respectsInventoryCaps } from '../inventory_protocol'

const MAX_PLACEMENT_ITERATIONS = 40



function sumActorValue(pieces, hint) {
  let total = 0
  for (const [, piece] of pieces.entries()) {
    if (piece.charAt(0) !== hint.team) { continue }
    if (!speciesMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
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

  // When the actor is singular, intersect species pool with ctx.{actor}.species_set.
  const varKey = ACTOR_TO_VAR_KEY[hint.actor]
  const hintPool = hint.speciesPool ?? []
  const effectivePool = (varKey && ctx[varKey])
    ? hintPool.filter(s => ctx[varKey].species_set.has(s))
    : hintPool
  let lastSpeciesUsed = null
  let lastPosUsed = null
  let placementCount = 0

  for (let i = 0; i < MAX_PLACEMENT_ITERATIONS; i += 1) {
    const current = sumActorValue(result, hint)
    if (compareValue(current, hint.totalOp, hint.total)) {
      if (varKey && ctx[varKey] && lastSpeciesUsed !== null) {
        ctx[varKey].species_set.clear()
        ctx[varKey].species_set.add(lastSpeciesUsed)
        ctx[varKey].position_set.clear()
        ctx[varKey].position_set.add(lastPosUsed)
      }
      return result
    }

    // Singular actors are by definition one piece. If a single placement
    // didn't bring the sum into the satisfying range, no second piece can
    // legitimately be added (the second one isn't the singular actor).
    if (varKey && ctx[varKey] && placementCount > 0) { return null }

    const max = maxAdditionForOp(hint.totalOp, hint.total, current)
    if (max === null || max <= 0) { return null }

    // Filter to species that fit the comparator headroom AND don't push
    // any inventory cell over its caps (count_range.max, value_range.max
    // across every filter the species belongs to).
    const fitting = effectivePool.filter(s => {
      const v = materialValue(s)
      if (v <= 0 || v > max) { return false }
      return respectsInventoryCaps(hint.team, s, result, ctx, hint.frame)
    })
    if (fitting.length === 0) { return null }

    const species = pickRandom(shuffled(fitting, ctx.random), ctx.random)
    let placed = false
    for (const pos of shuffled([...ALL_POSITIONS], ctx.random)) {
      if (result.has(pos)) { continue }
      const next = placePiece(result, pos, pieceCode(hint.team, species))
      if (next) { result = next; lastSpeciesUsed = species; lastPosUsed = pos; placed = true; break }
    }
    if (!placed) { return null }
    placementCount += 1
  }
  return null
}
