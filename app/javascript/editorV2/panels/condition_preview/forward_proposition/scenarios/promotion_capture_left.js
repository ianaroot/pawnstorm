import Board from 'gameplay/board'
import { HOME_RANK } from 'editorV2/panels/condition_preview/shared/board_utils'
import { MOVE_KIND_PROMOTION } from 'editorV2/panels/condition_preview/shared/example_utils'
import { emptySquareConstraintsRelativeToActor } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/proposition_helpers'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

const PROMOTION_SPECIES = Object.freeze([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT])
const CAPTURABLE_NON_PAWN = Object.freeze([Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])

function lastRankSquaresExcludingFile(team, excludeFile) {
  const rank = HOME_RANK[Board.opposingTeam(team)]
  const squares = new Set()
  for (let file = 0; file < 8; file += 1) {
    if (file === excludeFile) { continue }
    squares.add(rank * 8 + file)
  }
  return squares
}

export const promotionCaptureLeftScenario = {
  name: 'promotion_capture_left',
  moveKind: MOVE_KIND_PROMOTION,
  attemptWeight: 5,

  buildCtxDelta(combinedPlan) {
    const team = combinedPlan.movingTeam
    return {
      singulars: {
        moved_piece: {
          species_set: new Set(PROMOTION_SPECIES),
          region: { kind: 'set', squares: lastRankSquaresExcludingFile(team, 7) }
        },
        captured_piece: {
          species_set: new Set(CAPTURABLE_NON_PAWN),
          region: { kind: 'set', squares: lastRankSquaresExcludingFile(team, 7) }
        }
      },
      propositions: [
        ...emptySquareConstraintsRelativeToActor('moved_piece', 'pawn-diag-left-origin')
      ]
    }
  },

  resolveMoveObjectOverrides(ctx) {
    const moved = ctx.singulars.moved_piece
    const endPos = [...moved.region.squares][0]
    const promotedSpecies = committedSpecies(moved)
    const rankDelta = ctx.movingTeam === Board.BLACK ? 1 : -1
    return {
      startPosition: endPos + 8 * rankDelta + 1,
      endPosition: endPos,
      promotionPiece: promotedSpecies
    }
  }
}
