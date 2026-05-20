import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceParticipatesInAttackOrDefend
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_participates_in_attack_or_defend'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

function movedPieceSingular(species = Board.NIGHT, squareSet = new Set([D4])) {
  return {
    team: Board.WHITE,
    species_set: new Set([species]),
    region: { kind: 'set', squares: squareSet },
    priorRegion: { kind: 'all' },
    relationsToAnchors: []
  }
}

function entry({
  source = 'relational', operator = 'attack', direction = '+',
  movedPieceRole = 'target', otherTeam = Board.BLACK,
  speciesSet = new Set([Board.QUEEN])
} = {}) {
  const region = { kind: 'related-to', actor: 'moved_piece', role: movedPieceRole, operator }
  const currentProposition = {
    team: otherTeam, frame: 'current',
    species_set: speciesSet, region,
    count_range: { min: 1, max: Infinity }
  }
  const priorProposition = { ...currentProposition, frame: 'prior' }
  return {
    source, operator, metric: 'count', direction,
    priorProposition, currentProposition,
    sourcePlan: {},
    movedPieceRole
  }
}

function bindMovedToEntry(ctx, entry) {
  ctx.movedBinding = {
    assignments: [{ sourcePlan: entry.sourcePlan, role: entry.movedPieceRole, kind: 'related-to' }]
  }
}

describe('movedPieceParticipatesInAttackOrDefend — appliesTo', () => {
  it('returns true for a relational attack entry with moved_piece bound on the target side', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    bindMovedToEntry(ctx, e)

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(e, ctx, new Map())).toBe(true)
  })

  it('returns true for relational defend entries', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry({ operator: 'defend' })
    bindMovedToEntry(ctx, e)

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(e, ctx, new Map())).toBe(true)
  })

  it('returns false for non-relational entries', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry({ source: 'census' }), ctx, new Map())).toBe(false)
  })

  it('returns false for shield or adjacent operators', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry({ operator: 'shield' }), ctx, new Map())).toBe(false)
    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry({ operator: 'adjacent' }), ctx, new Map())).toBe(false)
  })

  it('returns false when moved_piece is not bound on either side of the relation', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    // No bindMovedToEntry — ctx.movedBinding stays unset → roleForPlan returns null.
    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceParticipatesInAttackOrDefend — apply (direction "+", role "target")', () => {
  it('places an attacker that controls moved_piece destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    const e = entry()
    bindMovedToEntry(ctx, e)

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    // One new piece was added.
    expect(result.size).toBe(pieces.size + 1)
    // The new piece is an enemy queen (per the entry's species_set).
    const placedSquare = [...result.keys()].find(p => p !== D4)
    expect(result.get(placedSquare)).toBe(pieceCode(Board.BLACK, Board.QUEEN))
  })

  it('narrows moved_piece priorRegion to squares the new attacker does not control', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    const e = entry()
    bindMovedToEntry(ctx, e)

    movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })

  it('returns null if no attacker placement leaves any valid origin candidate', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    const e = entry({ speciesSet: new Set([]) })
    bindMovedToEntry(ctx, e)

    expect(movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)).toBeNull()
  })
})

describe('movedPieceParticipatesInAttackOrDefend — apply (direction "-", role "target")', () => {
  it('returns null when moved_piece destination is still attacked by a relevant piece', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    // Black queen at d8 attacks d4 (moved_piece destination) on an open file.
    const D8 = 59
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [D8, pieceCode(Board.BLACK, Board.QUEEN)]
    ])
    const e = entry({ direction: '-' })
    bindMovedToEntry(ctx, e)

    expect(movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)).toBeNull()
  })

  it('narrows priorRegion to origin candidates that ARE attacked when destination is unattacked', () => {
    // Black queen at h1 attacks the diagonal a8-h1; b3 (a knight-origin for d4) is on a diagonal queen ray from h1.
    const H1 = 7
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [H1, pieceCode(Board.BLACK, Board.QUEEN)]
    ])
    const e = entry({ direction: '-' })
    bindMovedToEntry(ctx, e)

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).toBe(pieces) // No new pieces placed for '-' direction.
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })
})

describe('movedPieceParticipatesInAttackOrDefend — apply (direction "-", role "subject")', () => {
  it('narrows priorRegion to origin candidates that attack more relevant targets than destination does', () => {
    // moved_piece (white queen) at D4 attacks nothing matching black queen on this board.
    // A black queen at A8 isn't on any line from D4, but is on lines from queen-origins
    // for D4 (e.g., A1 via the A1-H8 diagonal continues to A-file → A8; A4 via rank 3 → A-file → A8).
    const A8 = 56
    const moved = {
      team: Board.WHITE, species_set: new Set([Board.QUEEN]),
      region: { kind: 'set', squares: new Set([D4]) },
      priorRegion: { kind: 'all' }, relationsToAnchors: []
    }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [A8, pieceCode(Board.BLACK, Board.QUEEN)]
    ])

    const e = entry({ direction: '-', movedPieceRole: 'subject' })
    bindMovedToEntry(ctx, e)
    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).toBe(pieces) // No new pieces placed for '-' direction.
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })

  it('places a new target via place-extension when no existing target supports the delta', () => {
    const moved = {
      team: Board.WHITE, species_set: new Set([Board.QUEEN]),
      region: { kind: 'set', squares: new Set([D4]) },
      priorRegion: { kind: 'all' }, relationsToAnchors: []
    }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])
    const e = entry({ direction: '-', movedPieceRole: 'subject' })
    bindMovedToEntry(ctx, e)

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBe(pieces.size + 1)
    const placedSquare = [...result.keys()].find(p => p !== D4)
    expect(result.get(placedSquare)).toBe(pieceCode(Board.BLACK, Board.QUEEN))
  })
})

describe('movedPieceParticipatesInAttackOrDefend — apply (direction "+", role "subject")', () => {
  it('places a target on a square moved_piece (at destination) controls', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedPieceSingular(Board.QUEEN) }
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])
    const e = entry({ movedPieceRole: 'subject', speciesSet: new Set([Board.PAWN]) })
    bindMovedToEntry(ctx, e)

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBe(pieces.size + 1)
    const placedSquare = [...result.keys()].find(p => p !== D4)
    expect(result.get(placedSquare)).toBe(pieceCode(Board.BLACK, Board.PAWN))
  })
})

describe('movedPieceParticipatesInAttackOrDefend — defend operator', () => {
  it('places a defender (same team as moved_piece) for "allied defend moved_piece" with direction "+"', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    // defender team matches the moved_piece team (white)
    const e = entry({ operator: 'defend', otherTeam: Board.WHITE, speciesSet: new Set([Board.ROOK]) })
    bindMovedToEntry(ctx, e)

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    const placedSquare = [...result.keys()].find(p => p !== D4)
    expect(result.get(placedSquare)).toBe(pieceCode(Board.WHITE, Board.ROOK))
  })
})

describe('movedPieceParticipatesInAttackOrDefend — cap respect', () => {
  it('returns null when placing the attacker would violate a proposition count_range.max cap', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedPieceSingular() },
      propositions: [{
        team: Board.BLACK, frame: 'current',
        species_set: new Set([Board.QUEEN]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 }, // no black queens allowed on the board
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }]
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    // Mechanism wants to place a black queen — but proposition forbids any black queens.
    const e = entry()
    bindMovedToEntry(ctx, e)
    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).toBeNull()
  })
})

describe('movedPieceParticipatesInAttackOrDefend — priorRegion intersection', () => {
  it('respects an already-narrowed priorRegion by intersecting rather than overwriting', () => {
    // B3, F3, B5 are all knight-origins for D4.
    const B3 = 17, F3 = 21, B5 = 33
    const moved = movedPieceSingular()
    moved.priorRegion = { kind: 'set', squares: new Set([B3, F3]) }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    const e = entry()
    bindMovedToEntry(ctx, e)

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    // Final priorRegion must be a subset of the original {B3, F3} — B5 (excluded
    // by the prior narrowing) must not appear.
    expect(moved.priorRegion.kind).toBe('set')
    expect(moved.priorRegion.squares.has(B5)).toBe(false)
    for (const sq of moved.priorRegion.squares) {
      expect([B3, F3]).toContain(sq)
    }
  })
})

