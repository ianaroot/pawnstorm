import Board from 'gameplay/board'

const PERMISSIVE = { min: 0, max: Infinity }
const RANK_0_SQUARES = new Set([0, 1, 2, 3, 4, 5, 6, 7])
const RANK_7_SQUARES = new Set([56, 57, 58, 59, 60, 61, 62, 63])

export function defaultStructuralPropositions() {
  const props = []
  for (const team of [Board.WHITE, Board.BLACK]) {
    props.push(cap({ team, species: Board.PAWN, region: { kind: 'set', squares: RANK_0_SQUARES }, countMax: 0 }))
    props.push(cap({ team, species: Board.PAWN, region: { kind: 'set', squares: RANK_7_SQUARES }, countMax: 0 }))
    props.push(cap({ team, species: Board.PAWN, region: { kind: 'all' }, countMax: 8 }))
    props.push(cap({ team, species: Board.KING, region: { kind: 'all' }, countMax: 1 }))
  }
  return props
}

function cap({ team, species, region, countMax }) {
  return {
    frame: 'current',
    team,
    species_set: new Set([species]),
    region,
    count_range: { min: 0, max: countMax },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE }
  }
}
