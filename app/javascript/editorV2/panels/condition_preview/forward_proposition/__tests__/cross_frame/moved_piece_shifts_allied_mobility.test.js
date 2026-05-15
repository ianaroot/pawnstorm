import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceShiftsAlliedMobility
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_shifts_allied_mobility'
import { defaultTestCtx } from '../_helpers'

const D4 = 27
const D8 = 59

function movedPieceSingular(species = Board.NIGHT) {
  return {
    team: Board.WHITE,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([D4]) },
    priorRegion: { kind: 'all' },
    relationsToAnchors: []
  }
}

function entry({
  direction = '-', team = Board.WHITE, species = Board.QUEEN,
  boundSingularActor = null, source = 'unary'
} = {}) {
  const currentProposition = {
    team, frame: 'current',
    species_set: new Set([species]),
    region: { kind: 'all' },
    boundSingularActor,
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity }
  }
  return {
    source, operator: 'mobility', metric: 'aggregate_mobility', direction,
    priorProposition: { ...currentProposition, frame: 'prior' },
    currentProposition,
    subjectProposition: source === 'relational' ? currentProposition : null,
    targetProposition: null
  }
}

describe('movedPieceShiftsAlliedMobility — appliesTo', () => {
  it('returns true for unary mobility on allied team not bound to moved_piece', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsAlliedMobility.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns true for relational mobility entries (forward-compat with future support)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsAlliedMobility.appliesTo(entry({ source: 'relational' }), ctx, new Map())).toBe(true)
  })


  it('returns false for enemy-team mobility', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsAlliedMobility.appliesTo(entry({ team: Board.BLACK }), ctx, new Map())).toBe(false)
  })

  it('returns false for non-mobility metric', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.metric = 'count'
    expect(movedPieceShiftsAlliedMobility.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceShiftsAlliedMobility — apply with existing X', () => {
  it('commits priorRegion when an origin produces a natural mobility shift for an existing allied piece', () => {
    // Allied queen at D8. moved_piece (knight) at D4 (on d-file) blocks queen's
    // d-file rays on after-board. On prior, knight is at some non-d-file
    // origin, queen's d-file is open — higher prior mobility → '-' direction.
    const moved = movedPieceSingular(Board.NIGHT)
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [D8, pieceCode(Board.WHITE, Board.QUEEN)]
    ])

    const result = movedPieceShiftsAlliedMobility.apply(entry({ direction: '-', species: Board.QUEEN }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(moved.priorRegion.kind).toBe('set')
  })
})
