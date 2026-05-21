import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceShiftsEnemyMobility
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_shifts_enemy_mobility'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

function movedPieceSingular(species = Board.QUEEN) {
  return {
    team: Board.WHITE,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([D4]) },
    priorRegion: { kind: 'all' },
    relationsToAnchors: []
  }
}

function entry({ direction = '-', team = Board.BLACK, speciesSet = new Set([Board.QUEEN]) } = {}) {
  const currentProposition = {
    team, frame: 'current',
    species_set: speciesSet,
    region: { kind: 'all' },
    boundSingularActor: null,
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity }
  }
  return {
    source: 'census', operator: 'mobility', metric: 'aggregate_mobility', direction,
    priorProposition: { ...currentProposition, frame: 'prior' },
    currentProposition,
    subjectProposition: null,
    targetProposition: null
  }
}

describe('movedPieceShiftsEnemyMobility — appliesTo', () => {
  it('returns true for enemy mobility with king-excluded filter', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsEnemyMobility.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns true for enemy mobility with king-included filter (fires alongside patch 3)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const allSpecies = new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
    expect(movedPieceShiftsEnemyMobility.appliesTo(entry({ speciesSet: allSpecies }), ctx, new Map())).toBe(true)
  })

  it('returns false for allied team mobility', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsEnemyMobility.appliesTo(entry({ team: Board.WHITE }), ctx, new Map())).toBe(false)
  })

  it('returns false for non-mobility metric', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.metric = 'count'
    expect(movedPieceShiftsEnemyMobility.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceShiftsEnemyMobility — apply', () => {
  it('engineers a "-" mobility delta against an existing enemy slider via origin selection', () => {
    const D8 = 59
    const E1 = 4
    const E8 = 60
    const moved = movedPieceSingular(Board.QUEEN)
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [D8, pieceCode(Board.BLACK, Board.QUEEN)],
      [E1, pieceCode(Board.WHITE, Board.KING)],
      [E8, pieceCode(Board.BLACK, Board.KING)]
    ])

    const result = movedPieceShiftsEnemyMobility.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
  })
})
