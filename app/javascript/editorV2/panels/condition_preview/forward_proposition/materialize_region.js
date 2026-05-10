import { ALL_POSITIONS } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  adjacentNeighborPositions, attackerCandidatesFor, controlledSquaresForPieceAt,
  raySquaresFrom
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'

export function materializeRegion(region, ctx) {
  if (region.kind === 'all') { return new Set(ALL_POSITIONS) }
  if (region.kind === 'set') { return region.squares }
  if (region.kind === 'related-to') { return materializeRelatedTo(region, ctx) }
  return new Set()
}

function materializeRelatedTo(region, { singulars, board, species, team }) {
  const anchor = singulars[region.actor]
  // Permissive when the anchor isn't fully committed yet (called during
  // commit_singulars_position before all singulars have a single-square region).
  if (anchor.region.kind !== 'set' || anchor.region.squares.size !== 1) { return new Set() }
  const anchorPos = [...anchor.region.squares][0]
  if (region.operator === 'adjacent') {
    return new Set(adjacentNeighborPositions(anchorPos))
  }
  // Shield geometry is ray-symmetric: whether anchor is the shielder (role:subject)
  // or the shielded (role:target), the other piece sits on a queen-ray from anchor.
  if (region.operator === 'shield') {
    return new Set(raySquaresFrom(anchorPos, QUEEN_RAY_STEPS, board))
  }
  if (region.role === 'subject') {
    return new Set(controlledSquaresForPieceAt(anchorPos, board))
  }
  return new Set(attackerCandidatesFor(anchorPos, species, team, board))
}
