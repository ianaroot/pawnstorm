import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceShiftsOwnMobility
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_shifts_own_mobility'
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

function entry({ direction = '+', boundSingularActor = 'moved_piece', species = Board.QUEEN } = {}) {
  const currentProposition = {
    team: Board.WHITE, frame: 'current',
    species_set: new Set([species]),
    region: { kind: 'all' },
    boundSingularActor,
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity }
  }
  return {
    source: 'unary', operator: 'mobility', metric: 'aggregate_mobility', direction,
    priorProposition: { ...currentProposition, frame: 'prior' },
    currentProposition,
    subjectProposition: null,
    targetProposition: null
  }
}

describe('movedPieceShiftsOwnMobility — appliesTo', () => {
  it('returns true for unary mobility entry bound to moved_piece', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsOwnMobility.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns false for unary mobility entries bound to other singulars', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsOwnMobility.appliesTo(entry({ boundSingularActor: 'enemy_moved_piece' }), ctx, new Map())).toBe(false)
  })

  it('returns false for unary mobility entries not bound to a singular (team-wide)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsOwnMobility.appliesTo(entry({ boundSingularActor: null }), ctx, new Map())).toBe(false)
  })

  it('returns false for non-mobility metric entries', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.metric = 'count'
    expect(movedPieceShiftsOwnMobility.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceShiftsOwnMobility — apply (direction "+")', () => {
  it('commits priorRegion to an origin where moved_piece mobility is lower than at destination', () => {
    // Queen at D4 has 27 moves on an empty board. Place blockers around B2 to
    // reduce queen-from-B2 mobility. B2 is on a queen-ray (diagonal) for D4.
    const B2 = 9
    // Blockers: A2, A3, B3, C3, C2, C1, B1, A1 (B2's queen-reach).
    // We don't need to block all — just enough that mobility at B2 < 27.
    const moved = movedPieceSingular(Board.QUEEN)
    moved.priorRegion = { kind: 'all' }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [9, pieceCode(Board.WHITE, Board.PAWN)],   // B2 already occupied — skip
      [10, pieceCode(Board.WHITE, Board.PAWN)],  // C2
      [11, pieceCode(Board.WHITE, Board.PAWN)],  // D2
      [12, pieceCode(Board.WHITE, Board.PAWN)],  // E2
      [3, pieceCode(Board.WHITE, Board.PAWN)],   // D1
      [17, pieceCode(Board.WHITE, Board.PAWN)]   // B3
    ])

    const result = movedPieceShiftsOwnMobility.apply(entry({ direction: '+' }), ctx, pieces, () => 0.5)

    // Either commits priorRegion (success) or returns null (no satisfying origin).
    // With heavy blockers around D-file, many queen-origins will have low mobility.
    expect(result).not.toBeNull()
    expect(moved.priorRegion.kind).toBe('set')
    expect(moved.priorRegion.squares.size).toBe(1)
  })
})

describe('movedPieceShiftsOwnMobility — apply (direction "-")', () => {
  it('commits priorRegion to an origin where moved_piece mobility is higher than at destination', () => {
    // Knight at D4 with limited mobility (some adjacent squares blocked).
    // Knight at A1 has only 2 moves; at D4 has up to 8.
    // For '-' (mobility went down): pick origin like A1 (low knight mobility)?
    // Wait — '-' means mobility went DOWN from prior to after. So prior > after.
    // Prior = mobility at origin. After = mobility at destination.
    // We want mobility-at-origin > mobility-at-destination.
    // So pick origin with HIGHER mobility than destination.
    // For a knight at D4 with blockers around it, destination mobility is low.
    // An open origin (like F3) has higher knight mobility (~6).
    const moved = movedPieceSingular(Board.NIGHT)
    const ctx = defaultTestCtx({ singulars: { moved: moved, moved_piece: moved } })
    // Block knight moves from D4: B3, B5, C2, C6, E2, E6, F3, F5 — exactly knight's reach from D4.
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [17, pieceCode(Board.WHITE, Board.PAWN)],  // B3
      [33, pieceCode(Board.WHITE, Board.PAWN)],  // B5
      [10, pieceCode(Board.WHITE, Board.PAWN)],  // C2
      [42, pieceCode(Board.WHITE, Board.PAWN)],  // C6
      [12, pieceCode(Board.WHITE, Board.PAWN)]   // E2
    ])

    const result = movedPieceShiftsOwnMobility.apply(entry({ direction: '-', species: Board.NIGHT }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(moved.priorRegion.kind).toBe('set')
    expect(moved.priorRegion.squares.size).toBe(1)
  })

  it('returns null when no origin satisfies direction', () => {
    // Knight at D4 with completely open board: mobility = 8. No origin can have higher mobility.
    const moved = movedPieceSingular(Board.NIGHT)
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    expect(movedPieceShiftsOwnMobility.apply(entry({ direction: '-', species: Board.NIGHT }), ctx, pieces, () => 0.5)).toBeNull()
  })
})
