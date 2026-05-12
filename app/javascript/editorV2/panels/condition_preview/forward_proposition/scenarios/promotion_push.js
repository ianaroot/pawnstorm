import Board from 'gameplay/board'
import { HOME_RANK } from 'editorV2/panels/condition_preview/shared/board_utils'
import { emptySquareConstraintsRelativeToActor } from './proposition_helpers'

const PROMOTION_SPECIES = Object.freeze([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT])

function lastRankSquares(team) {
  const rank = HOME_RANK[Board.opposingTeam(team)]
  return new Set(Array.from({ length: 8 }, (_, file) => rank * 8 + file))
}

export const promotionPushScenario = {
  name: 'promotion_push',
  attemptBudget: 10,

  buildCtxDelta(combinedPlan) {
    const team = combinedPlan.movingTeam
    return {
      singulars: {
        moved_piece: {
          species_set: new Set(PROMOTION_SPECIES),
          region: { kind: 'set', squares: lastRankSquares(team) }
        },
        captured_piece: {
          species_set: new Set([null])
        }
      },
      propositions: [
        ...emptySquareConstraintsRelativeToActor('moved_piece', 'pawn-push-origin')
      ]
    }
  },

  resolveMoveObjectOverrides(ctx) {
    const moved = ctx.singulars.moved_piece
    const endPos = [...moved.region.squares][0]
    const promotedSpecies = [...moved.species_set][0]
    const rankDelta = ctx.movingTeam === Board.BLACK ? 1 : -1
    return {
      startPosition: endPos + 8 * rankDelta,
      endPosition: endPos,
      promotionPiece: promotedSpecies
    }
  }
}
