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
    priorProposition, currentProposition
  }
}

describe('movedPieceParticipatesInAttackOrDefend — appliesTo', () => {
  it('returns true for a relational attack entry with moved_piece bound on the target side', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns true for relational defend entries', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry({ operator: 'defend' }), ctx, new Map())).toBe(true)
  })

  it('returns false for non-relational entries', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry({ source: 'unary' }), ctx, new Map())).toBe(false)
  })

  it('returns false for shield or adjacent operators', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry({ operator: 'shield' }), ctx, new Map())).toBe(false)
    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(entry({ operator: 'adjacent' }), ctx, new Map())).toBe(false)
  })

  it('returns false when moved_piece is not bound on either side of the relation', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.currentProposition = { ...e.currentProposition, region: { kind: 'all' } }

    expect(movedPieceParticipatesInAttackOrDefend.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceParticipatesInAttackOrDefend — apply (direction "+", role "target")', () => {
  it('places an attacker that controls moved_piece destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceParticipatesInAttackOrDefend.apply(entry(), ctx, pieces, () => 0.5)

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

    movedPieceParticipatesInAttackOrDefend.apply(entry(), ctx, pieces, () => 0.5)

    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })

  it('returns null if no attacker placement leaves any valid origin candidate', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    const e = entry({ speciesSet: new Set([]) })

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

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).toBe(pieces) // No new pieces placed for '-' direction.
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })
})

describe('movedPieceParticipatesInAttackOrDefend — apply (direction "+", role "subject")', () => {
  it('places a target on a square moved_piece (at destination) controls', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedPieceSingular(Board.QUEEN) }
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])
    const e = entry({ movedPieceRole: 'subject', speciesSet: new Set([Board.PAWN]) })

    const result = movedPieceParticipatesInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBe(pieces.size + 1)
    const placedSquare = [...result.keys()].find(p => p !== D4)
    expect(result.get(placedSquare)).toBe(pieceCode(Board.BLACK, Board.PAWN))
  })
})

