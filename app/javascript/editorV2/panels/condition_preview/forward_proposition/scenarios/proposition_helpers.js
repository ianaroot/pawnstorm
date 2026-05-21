import Board from 'gameplay/board'

const ALL_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })
const EMPTY_COUNT = Object.freeze({ min: 0, max: 0 })

export function emptySquareConstraints(square) {
  return [Board.WHITE, Board.BLACK].map(team => ({
    team,
    frame: 'current',
    species_set: new Set(ALL_SPECIES),
    region: { kind: 'set', squares: new Set([square]) },
    count_range: { ...EMPTY_COUNT },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE }
  }))
}

export function emptySquareConstraintsRelativeToActor(actor, operator) {
  return [Board.WHITE, Board.BLACK].map(team => ({
    team,
    frame: 'current',
    species_set: new Set(ALL_SPECIES),
    region: { kind: 'related-to', actor, operator },
    count_range: { ...EMPTY_COUNT },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE }
  }))
}
