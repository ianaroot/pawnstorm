import Board from 'gameplay/board'
import { HOME_RANK } from 'editorV2/panels/condition_preview/shared/board_utils'
import { MOVE_KIND_PROMOTION } from 'editorV2/panels/condition_preview/shared/example_utils'
import { emptySquareConstraintsRelativeToActor } from './proposition_helpers'

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

export const promotionCaptureRightScenario = {
  name: 'promotion_capture_right',
  moveKind: MOVE_KIND_PROMOTION,
  attemptWeight: 5,

  buildCtxDelta(combinedPlan) {
    const team = combinedPlan.movingTeam
    return {
      singulars: {
        moved_piece: {
          species_set: new Set(PROMOTION_SPECIES),
          region: { kind: 'set', squares: lastRankSquaresExcludingFile(team, 0) }
        },
        captured_piece: {
          species_set: new Set(CAPTURABLE_NON_PAWN),
          region: { kind: 'set', squares: lastRankSquaresExcludingFile(team, 0) }
        }
      },
      propositions: [
        ...emptySquareConstraintsRelativeToActor('moved_piece', 'pawn-diag-right-origin')
      ]
    }
  },

  resolveMoveObjectOverrides(ctx) {
    const moved = ctx.singulars.moved_piece
    const endPos = [...moved.region.squares][0]
    const promotedSpecies = [...moved.species_set][0]
    const rankDelta = ctx.movingTeam === Board.BLACK ? 1 : -1
    return {
      startPosition: endPos + 8 * rankDelta - 1,
      endPosition: endPos,
      promotionPiece: promotedSpecies
    }
  }
}
