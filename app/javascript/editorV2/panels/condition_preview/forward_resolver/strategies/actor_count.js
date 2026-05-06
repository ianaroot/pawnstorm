// Strategy for ACTOR_COUNT { actor, team, filter, speciesPool, countOp, n, frame }.
//
// Augments `pieces` so that the count of pieces matching team + filter
// satisfies (countOp, n). Adds matching pieces at random unoccupied squares.
// If the chain requires fewer pieces than already present, returns null.

import {
  pieceCode, ALL_POSITIONS, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { compareValue } from '../hint_compiler'
import { speciesMatchesFilter } from 'editorV2/panels/condition_preview/shared/example_utils'
import { ACTOR_TO_VAR_KEY } from '../chain_constraints'
import { respectsInventoryCaps } from '../inventory_protocol'



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

  // Stopgap: captured_piece subject's hint.team is correctly enemyTeam, but the
  // strategy's after-board placement on enemyTeam corrupts sibling plans (the
  // placed piece is read as a real enemy). Override placement to movingTeam to
  // restore the pre-fix "harmless junk" behavior. The architectural fix lives
  // in agents/next/5_5 capture hint bug.md.
  const placementTeam = hint.actor === 'captured_piece' ? ctx.movingTeam : hint.team

  let currentCount = 0
  for (const [, piece] of pieces.entries()) {
    if (piece.charAt(0) !== placementTeam) { continue }
    if (!speciesMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
    currentCount += 1
  }

  if (compareValue(currentCount, hint.countOp, hint.n)) { return pieces }

  const additions = neededAdditions(hint.countOp, hint.n, currentCount)
  if (additions === null || additions <= 0) { return null }

  // When the actor is singular, intersect species pool with ctx.{actor}.species_set
  // so sibling plans' species constraints flow through.
  const varKey = ACTOR_TO_VAR_KEY[hint.actor]
  // Defense-in-depth: contradiction detectors reject `count > 1` for singular
  // actors at plan-build time, but guard here too so a future code path that
  // reaches this strategy without going through plan-build still degrades
  // cleanly instead of producing a malformed narrowing.
  if (varKey && ctx[varKey] && additions > 1) { return null }
  const hintPool = hint.speciesPool ?? []
  const effectivePool = (varKey && ctx[varKey])
    ? hintPool.filter(s => ctx[varKey].species_set.has(s))
    : hintPool
  const speciesCandidates = shuffled([...effectivePool], ctx.random)
  if (speciesCandidates.length === 0) { return null }

  let result = pieces
  let speciesUsed = null
  let posUsed = null
  for (let i = 0; i < additions; i += 1) {
    let placed = false
    for (const species of speciesCandidates) {
      if (!respectsInventoryCaps(placementTeam, species, result, ctx, hint.frame)) { continue }
      for (const pos of shuffled([...ALL_POSITIONS], ctx.random)) {
        if (result.has(pos)) { continue }
        const next = placePiece(result, pos, pieceCode(placementTeam, species))
        if (!next) { continue }
        result = next
        speciesUsed = species
        posUsed = pos
        placed = true
        break
      }
      if (placed) { break }
    }
    if (!placed) { return null }
  }
  // Singular actor: narrow ctx to the committed species + position so sibling
  // strategies see the commit.
  if (varKey && ctx[varKey] && speciesUsed !== null) {
    ctx[varKey].species_set.clear()
    ctx[varKey].species_set.add(speciesUsed)
    ctx[varKey].position_set.clear()
    ctx[varKey].position_set.add(posUsed)
  }
  return result
}
