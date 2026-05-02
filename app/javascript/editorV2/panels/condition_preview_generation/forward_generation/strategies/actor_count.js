// Strategy for ACTOR_COUNT { actor, team, filter, speciesPool, countOp, n, frame }.
//
// Augments `pieces` so that the count of pieces matching team + filter
// satisfies (countOp, n). Adds matching pieces at random unoccupied squares.
// If the chain requires fewer pieces than already present, returns null.

import {
  pieceCode, ALL_POSITIONS, shuffled
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { compareValue } from '../hint_compiler'
import { speciesMatchesFilter } from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { ACTOR_TO_VAR_KEY } from '../chain_constraints'



function neededAdditions(countOp, n, current) {
  switch (countOp) {
    case 'equal_to':                 return current > n ? null : n - current
    case 'greater_than':             return n + 1 - current
    case 'greater_than_or_equal_to': return n - current
    case 'less_than':
    case 'less_than_or_equal_to':    return null
    default:                         return null
  }
}

export function actorCountStrategy(pieces, hint, ctx) {
  if (hint.frame !== 'current') { return null }

  let currentCount = 0
  for (const [, piece] of pieces.entries()) {
    if (piece.charAt(0) !== hint.team) { continue }
    if (!speciesMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
    currentCount += 1
  }

  // Inventory awareness for group actors: cap additions at the converged
  // count_range.max so we don't overshoot sibling constraints.
  const inventoryCell = (hint.actor === 'allied' || hint.actor === 'enemy')
    ? ctx.inventory?.[hint.team]?.[hint.frame]?.[hint.filter ?? 'any']
    : null
  const upperBound = inventoryCell?.count_range.max ?? Infinity
  if (currentCount > upperBound) { return null }

  if (compareValue(currentCount, hint.countOp, hint.n)) { return pieces }

  const additions = neededAdditions(hint.countOp, hint.n, currentCount)
  if (additions === null || additions <= 0) { return null }
  if (currentCount + additions > upperBound) { return null }

  // When the actor is singular, intersect species pool with ctx.{actor}.species_set
  // so sibling plans' species constraints flow through.
  const varKey = ACTOR_TO_VAR_KEY[hint.actor]
  const hintPool = hint.speciesPool ?? []
  const effectivePool = (varKey && ctx[varKey])
    ? hintPool.filter(s => ctx[varKey].species_set.has(s))
    : hintPool
  const speciesCandidates = shuffled([...effectivePool], ctx.random)
  if (speciesCandidates.length === 0) { return null }

  let result = pieces
  let speciesUsed = null
  for (let i = 0; i < additions; i += 1) {
    let placed = false
    for (const species of speciesCandidates) {
      for (const pos of shuffled([...ALL_POSITIONS], ctx.random)) {
        if (result.has(pos)) { continue }
        const next = placePiece(result, pos, pieceCode(hint.team, species))
        if (!next) { continue }
        result = next
        speciesUsed = species
        placed = true
        break
      }
      if (placed) { break }
    }
    if (!placed) { return null }
  }
  // Singular actor: narrow ctx to the committed species so sibling strategies see the commit.
  if (varKey && ctx[varKey] && speciesUsed !== null) {
    ctx[varKey].species_set.clear()
    ctx[varKey].species_set.add(speciesUsed)
  }
  return result
}
