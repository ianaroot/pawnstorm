import { singularSquare, commitPriorRegion } from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/cross_frame_helpers'
import { legalOriginCandidates } from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/shifts_mobility_helpers'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

// Engineers a region-restricted PBS count delta by choosing moved_piece's
// origin so its own region-membership differs prior-vs-after. moved_piece is
// the only subject piece whose region-membership can change across a single
// move, so for source census/unary the delta is manufactured here rather
// than left to luck. Direction:
//   '+'  destination in-region, origin out-of-region  (prior count is one less)
//   '-'  destination out-of-region, origin in-region  (prior count is one more)
//   '='  origin and destination on the same side of the region boundary
// The capture-in-region path (enemy subject decreasing) is a separate
// mechanism — moved_piece cannot be an enemy subject.
export const movedPieceShiftsRegionMembership = {
  name: 'moved-piece-shifts-region-membership',

  appliesTo(entry, ctx) {
    if (entry.source !== 'census') { return false }
    if (entry.metric !== 'count') { return false }
    if (entry.currentProposition?.region?.kind !== 'set') { return false }
    return movedMatchesSubject(entry, ctx)
  },

  apply(entry, ctx, pieces) {
    const moved = ctx.singulars.moved_piece
    const destination = singularSquare(moved)
    if (destination === null) { return null }
    const movedSpecies = committedSpecies(moved)
    if (movedSpecies === null || movedSpecies === undefined) { return null }

    const region = entry.currentProposition.region.squares
    const destInRegion = region.has(destination)
    const origins = legalOriginCandidates(pieces, destination, moved.team, movedSpecies)

    let candidates
    if (entry.direction === '+') {
      if (!destInRegion) { return null }
      candidates = origins.filter(o => !region.has(o))
    } else if (entry.direction === '-') {
      if (destInRegion) { return null }
      candidates = origins.filter(o => region.has(o))
    } else if (entry.direction === '=') {
      candidates = origins.filter(o => region.has(o) === destInRegion)
    } else {
      return null
    }

    if (candidates.length === 0) { return null }
    return commitPriorRegion(ctx, candidates, pieces)
  }
}

function movedMatchesSubject(entry, ctx) {
  const moved = ctx?.singulars?.moved_piece
  const prop = entry.currentProposition
  if (!moved || !prop) { return false }
  if (moved.team !== prop.team) { return false }
  for (const species of moved.species_set) {
    if (species !== null && prop.species_set.has(species)) { return true }
  }
  return false
}
