import { ALL_POSITIONS } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  adjacentNeighborPositions, attackerCandidatesFor, controlledSquaresForPieceAt
} from 'editorV2/panels/condition_preview/shared/geometry_utils'

export function materializeRegion(region, ctx) {
  if (region.kind === 'all') { return new Set(ALL_POSITIONS) }
  if (region.kind === 'set') { return region.squares }
  if (region.kind === 'related-to') { return materializeRelatedTo(region, ctx) }
  return new Set()
}

function materializeRelatedTo(region, { singulars, board, species, team }) {
  const anchor = singulars[region.actor]
  const anchorPos = [...anchor.region.squares][0]
  if (region.operator === 'adjacent') {
    return new Set(adjacentNeighborPositions(anchorPos))
  }
  if (region.role === 'subject') {
    return new Set(controlledSquaresForPieceAt(anchorPos, board))
  }
  return new Set(attackerCandidatesFor(anchorPos, species, team, board))
}
