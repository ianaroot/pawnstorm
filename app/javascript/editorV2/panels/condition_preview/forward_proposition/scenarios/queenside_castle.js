import Board from 'gameplay/board'
import { HOME_RANK } from 'editorV2/panels/condition_preview/shared/board_utils'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function squareAt(team, file) {
  return HOME_RANK[team] * 8 + file
}

export const queensideCastleScenario = {
  name: 'queenside_castle',

  buildCtxDelta(combinedPlan) {
    const team = combinedPlan.movingTeam
    const kingEnd = squareAt(team, 2)
    const rookEnd = squareAt(team, 3)
    return {
      singulars: {
        moved_piece: {
          species_set: new Set([Board.KING]),
          region: { kind: 'set', squares: new Set([kingEnd]) }
        },
        captured_piece: {
          species_set: new Set([null])
        }
      },
      propositions: [{
        team,
        frame: 'current',
        species_set: new Set([Board.ROOK]),
        region: { kind: 'set', squares: new Set([rookEnd]) },
        count_range: { min: 1, max: 1 },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }]
    }
  },

  resolveMoveObjectOverrides(ctx) {
    const team = ctx.movingTeam
    return {
      startPosition: squareAt(team, 4),
      endPosition: squareAt(team, 2),
      pieceNotation: 'O-O-O'
    }
  }
}
