// Strategy for ACTOR_AT_POSITION { actor, team, filter, speciesPool, axis, positionComparator, positionTarget }.
//
// Ensures every matching piece sits on a position satisfying the axis
// constraint. If a matching piece is on a non-qualifying square, the strategy
// relocates it (delete + place on a qualifying square). If no matching piece
// exists yet, places one on a qualifying square.
//
// Note: relocation can break sibling hints in conjunction (e.g. BARE_RELATION
// may have anchored on the moved piece). The verify pass catches that and the
// outer attempt loop retries with a fresh RNG sequence.

import {
  pieceCode, clonePiecesMap, ALL_POSITIONS, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { positionMatchesAxis } from '../hint_compiler'
import { speciesMatchesFilter } from 'editorV2/panels/condition_preview/shared/example_utils'
import { ACTOR_TO_VAR_KEY } from '../chain_constraints'
import { respectsInventoryCaps } from '../inventory_protocol'



function qualifyingSquaresForHint(hint, movingTeam) {
  return ALL_POSITIONS.filter(p => positionMatchesAxis(p, hint, movingTeam))
}

export function actorAtPositionStrategy(pieces, hint, ctx) {
  const { random } = ctx
  const qualifying = qualifyingSquaresForHint(hint, ctx.movingTeam)
  if (qualifying.length === 0) { return null }

  const varKey = ACTOR_TO_VAR_KEY[hint.actor]

  const matching = []
  for (const [pos, piece] of pieces.entries()) {
    if (piece.charAt(0) !== hint.team) { continue }
    if (!speciesMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
    matching.push({ pos, piece })
  }

  const qualifyingSet = new Set(qualifying)
  const misplaced = matching.filter(m => !qualifyingSet.has(m.pos))

  // No matching pieces: place one on a qualifying square. When the actor is
  // singular, narrow the species pool by ctx.{actor}.species_set.
  if (matching.length === 0) {
    const hintPool = hint.speciesPool ?? []
    const effectivePool = (varKey && ctx[varKey])
      ? hintPool.filter(s => ctx[varKey].species_set.has(s))
      : hintPool
    const speciesCandidates = shuffled([...effectivePool], random)
    for (const species of speciesCandidates) {
      if (!respectsInventoryCaps(hint.team, species, pieces, ctx, 'current')) { continue }
      for (const pos of shuffled([...qualifying], random)) {
        if (pieces.has(pos)) { continue }
        const next = placePiece(pieces, pos, pieceCode(hint.team, species))
        if (next) {
          if (varKey && ctx[varKey]) {
            ctx[varKey].species_set.clear()
            ctx[varKey].species_set.add(species)
            ctx[varKey].position_set.clear()
            ctx[varKey].position_set.add(pos)
          }
          return next
        }
      }
    }
    return null
  }

  // All matching pieces already on qualifying squares.
  if (misplaced.length === 0) { return pieces }

  // Relocate misplaced pieces one at a time. (Relocation removes from one
  // square and re-places at another — net zero change to inventory counts,
  // so no caps check needed.)
  let result = pieces
  let lastPlacedPos = null
  for (const { pos, piece } of misplaced) {
    const cloned = clonePiecesMap(result)
    cloned.delete(pos)
    let placed = false
    for (const newPos of shuffled([...qualifying], random)) {
      if (cloned.has(newPos)) { continue }
      const next = placePiece(cloned, newPos, piece)
      if (next) { result = next; lastPlacedPos = newPos; placed = true; break }
    }
    if (!placed) { return null }
  }
  if (varKey && ctx[varKey] && lastPlacedPos !== null) {
    ctx[varKey].position_set.clear()
    ctx[varKey].position_set.add(lastPlacedPos)
  }
  return result
}
