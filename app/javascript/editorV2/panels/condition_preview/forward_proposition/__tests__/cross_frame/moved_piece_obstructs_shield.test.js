import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceObstructsShield
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_obstructs_shield'
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

// Shield relation: subject (shielder) and target (shielded) share team;
// implicit attacker is opposing team slider.
function entry({
  direction = '+', alliedTeam = Board.WHITE,
  shielderSpecies = new Set([Board.BISHOP, Board.NIGHT, Board.PAWN]),
  shieldedSpecies = new Set([Board.KING, Board.QUEEN, Board.ROOK])
} = {}) {
  const subjectProposition = {
    team: alliedTeam, frame: 'current',
    species_set: shielderSpecies, region: { kind: 'all' },
    count_range: { min: 1, max: Infinity }
  }
  const targetProposition = {
    team: alliedTeam, frame: 'current',
    species_set: shieldedSpecies, region: { kind: 'all' },
    count_range: { min: 1, max: Infinity }
  }
  return {
    source: 'relational', operator: 'shield', metric: 'count', direction,
    priorProposition: { ...subjectProposition, frame: 'prior' },
    currentProposition: subjectProposition,
    subjectProposition,
    targetProposition
  }
}

describe('movedPieceObstructsShield — appliesTo', () => {
  it('returns true for relational shield entries when moved_piece is not bound', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceObstructsShield.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns false for non-shield operators', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.operator = 'attack'
    expect(movedPieceObstructsShield.appliesTo(e, ctx, new Map())).toBe(false)
  })

  it('returns false when moved_piece is bound on a side (participates_shield owns that case)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.currentProposition = {
      ...e.currentProposition,
      region: { kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'shield' }
    }
    expect(movedPieceObstructsShield.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceObstructsShield — apply (direction "-")', () => {
  it('engineers an attacker-shielder-target line through moved_piece destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsShield.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBeGreaterThanOrEqual(pieces.size + 3)
  })

  it('narrows priorRegion to origins off the engineered shield ray', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    movedPieceObstructsShield.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
  })
})
