import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceParticipatesShield
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_participates_shield'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

function movedPieceSingular(species = Board.BISHOP) {
  return {
    team: Board.WHITE,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([D4]) },
    priorRegion: { kind: 'all' },
    relationsToAnchors: []
  }
}

// In shield, both subject (shielder) and target (shielded) share a team;
// the implicit attacker is the opposing team.
function entry({
  direction = '+', movedPieceRole = 'target',
  alliedTeam = Board.WHITE, speciesSet = new Set([Board.BISHOP])
} = {}) {
  const region = movedPieceRole
    ? { kind: 'related-to', actor: 'moved_piece', role: movedPieceRole, operator: 'shield' }
    : { kind: 'all' }
  const currentProposition = {
    team: alliedTeam, frame: 'current',
    species_set: speciesSet, region,
    count_range: { min: 1, max: Infinity }
  }
  return {
    source: 'relational', operator: 'shield', metric: 'count', direction,
    priorProposition: { ...currentProposition, frame: 'prior' },
    currentProposition
  }
}

describe('movedPieceParticipatesShield — appliesTo', () => {
  it('returns true when moved_piece is bound on the target side', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceParticipatesShield.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns true when moved_piece is bound on the subject (shielder) side', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceParticipatesShield.appliesTo(entry({ movedPieceRole: 'subject' }), ctx, new Map())).toBe(true)
  })

  it('returns true when neither side is bound but moved_piece is a slider on the opposing team', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: { ...movedPieceSingular(Board.QUEEN), team: Board.BLACK } }
    })
    // Allied team WHITE, moved_piece BLACK with slider — can be implicit attacker.
    expect(movedPieceParticipatesShield.appliesTo(entry({ movedPieceRole: null }), ctx, new Map())).toBe(true)
  })

  it('returns false for non-shield operators', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.operator = 'attack'
    expect(movedPieceParticipatesShield.appliesTo(e, ctx, new Map())).toBe(false)
  })

  it('returns false when neither side is bound and moved_piece is not a slider', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: { ...movedPieceSingular(Board.NIGHT), team: Board.BLACK } }
    })
    expect(movedPieceParticipatesShield.appliesTo(entry({ movedPieceRole: null }), ctx, new Map())).toBe(false)
  })
})

describe('movedPieceParticipatesShield — apply (role "subject", moved_piece is shielder)', () => {
  it('places an attacker and a target on a ray through moved_piece destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular(Board.BISHOP) } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.BISHOP)]])

    const result = movedPieceParticipatesShield.apply(entry({ movedPieceRole: 'subject' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBeGreaterThanOrEqual(pieces.size + 1)
  })
})

describe('movedPieceParticipatesShield — apply (role "target", moved_piece is shielded)', () => {
  it('places a shielder and an attacker on a ray through moved_piece destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular(Board.QUEEN) } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])

    const result = movedPieceParticipatesShield.apply(entry({ movedPieceRole: 'target' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBeGreaterThanOrEqual(pieces.size + 1)
  })
})
