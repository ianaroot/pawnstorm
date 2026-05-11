import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceParticipatesAdjacent
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_participates_adjacent'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

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
  direction = '+', movedPieceRole = 'target',
  otherTeam = Board.BLACK, speciesSet = new Set([Board.PAWN])
} = {}) {
  const region = { kind: 'related-to', actor: 'moved_piece', role: movedPieceRole, operator: 'adjacent' }
  const currentProposition = {
    team: otherTeam, frame: 'current',
    species_set: speciesSet, region,
    count_range: { min: 1, max: Infinity }
  }
  return {
    source: 'relational', operator: 'adjacent', metric: 'count', direction,
    priorProposition: { ...currentProposition, frame: 'prior' },
    currentProposition
  }
}

describe('movedPieceParticipatesAdjacent — appliesTo', () => {
  it('returns true for a relational adjacent entry with moved_piece bound', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceParticipatesAdjacent.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns false for non-adjacent operators', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.operator = 'attack'
    expect(movedPieceParticipatesAdjacent.appliesTo(e, ctx, new Map())).toBe(false)
  })

  it('returns true regardless of which side moved_piece is on (adjacency is mutual)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceParticipatesAdjacent.appliesTo(entry({ movedPieceRole: 'subject' }), ctx, new Map())).toBe(true)
  })
})

describe('movedPieceParticipatesAdjacent — apply (direction "+")', () => {
  it('places a piece adjacent to moved_piece destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceParticipatesAdjacent.apply(entry(), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBe(pieces.size + 1)
    const placedSquare = [...result.keys()].find(p => p !== D4)
    expect(result.get(placedSquare)).toBe(pieceCode(Board.BLACK, Board.PAWN))
  })

  it('narrows priorRegion to origin candidates not adjacent to the placed piece', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    movedPieceParticipatesAdjacent.apply(entry(), ctx, pieces, () => 0.5)

    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })
})

describe('movedPieceParticipatesAdjacent — apply (direction "-")', () => {
  it('returns null when destination is still adjacent to a relevant piece', () => {
    // Black pawn at C5 (file 2 rank 4) is adjacent to D4 (file 3 rank 3).
    const C5 = 34
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [C5, pieceCode(Board.BLACK, Board.PAWN)]
    ])

    expect(movedPieceParticipatesAdjacent.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)).toBeNull()
  })

  it('commits priorRegion to origins adjacent to relevant piece when destination is not', () => {
    // Black pawn at A4 (file 0 rank 3). Not adjacent to D4 (file diff 3).
    // Adjacent to B3 (file 1 rank 2), which IS a knight origin for D4.
    const A4 = 24
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [A4, pieceCode(Board.BLACK, Board.PAWN)]
    ])

    const result = movedPieceParticipatesAdjacent.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).toBe(pieces) // No new pieces placed for '-'.
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })
})
