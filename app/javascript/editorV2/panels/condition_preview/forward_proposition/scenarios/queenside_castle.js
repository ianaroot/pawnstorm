import Board from 'gameplay/board'
import { HOME_RANK } from 'editorV2/panels/condition_preview/shared/board_utils'
import { MOVE_KIND_CASTLE } from 'editorV2/panels/condition_preview/shared/example_utils'
import { emptySquareConstraints } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/proposition_helpers'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function squareAt(team, file) {
  return HOME_RANK[team] * 8 + file
}

export const queensideCastleScenario = {
  name: 'queenside_castle',
  moveKind: MOVE_KIND_CASTLE,
  attemptWeight: 20,

  buildCtxDelta(combinedPlan) {
    const team = combinedPlan.movingTeam
    const kingStart = squareAt(team, 4)
    const kingEnd = squareAt(team, 2)
    const rookEnd = squareAt(team, 3)
    const rookStart = squareAt(team, 0)
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
      propositions: [
        {
          team,
          frame: 'current',
          species_set: new Set([Board.ROOK]),
          region: { kind: 'set', squares: new Set([rookEnd]) },
          count_range: { min: 1, max: 1 },
          aggregate_value_range: { ...PERMISSIVE },
          aggregate_mobility_range: { ...PERMISSIVE }
        },
        ...emptySquareConstraints(kingStart),
        ...emptySquareConstraints(rookStart)
      ]
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
