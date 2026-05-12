import Board from 'gameplay/board'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })
const HOME_RANK = Object.freeze({ [Board.WHITE]: 0, [Board.BLACK]: 7 })

function squareAt(team, file) {
  return HOME_RANK[team] * 8 + file
}

export const kingsideCastleScenario = {
  name: 'kingside_castle',

  buildCtxDelta(combinedPlan) {
    const team = combinedPlan.movingTeam
    const kingEnd = squareAt(team, 6)
    const rookEnd = squareAt(team, 5)
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
      endPosition: squareAt(team, 6),
      pieceNotation: 'O-O'
    }
  }
}
