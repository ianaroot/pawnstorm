import Board from 'gameplay/board'
import { QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import { placeKingOnRayThroughTarget } from 'editorV2/panels/condition_preview/shared/king_placement'
import { placeSliderBeyondTarget } from 'editorV2/panels/condition_preview/forward_proposition/pin_geometry'

export const pinsMechanism = {
  name: 'pins',

  appliesTo(target, ctx, frame, pieces) {
    if (target.species === Board.KING) { return false }
    if (ctx.pinState.count >= ctx.pinState.max) { return false }
    return true
  },

  apply(target, ctx, frame, pieces, random) {
    if (ctx.pinState.count >= ctx.pinState.max) { return null }

    for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
      const next = tryPinForStep(target, ctx, frame, pieces, step, random)
      if (next !== null) {
        ctx.pinState.count += 1
        return next
      }
    }
    return null
  },

  isActive() { return false }
}

// step = direction from king toward target (and beyond, toward slider).
// King is on the -step side of target; slider is on the +step side.
function tryPinForStep(target, ctx, frame, pieces, step, random) {
  const afterKing = placeKingOnRayThroughTarget({
    pieces, team: target.team, frame, ctx,
    targetPos: target.position, step: -step, random
  })
  if (afterKing === null) { return null }

  return placeSliderBeyondTarget({
    pieces: afterKing, attackerTeam: Board.opposingTeam(target.team),
    targetPos: target.position, step, ctx, random
  })
}
