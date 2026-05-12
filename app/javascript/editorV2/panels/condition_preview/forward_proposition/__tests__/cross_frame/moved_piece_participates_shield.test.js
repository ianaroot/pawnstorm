import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { activeShieldSets } from 'editorV2/panels/condition_preview/forward_proposition/relations/shield'
import {
  movedPieceParticipatesShield
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_participates_shield'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

function piecesWithMovedAtOrigin(pieces, destination, origin, team, species) {
  const result = new Map(pieces)
  result.delete(destination)
  result.set(origin, pieceCode(team, species))
  return result
}

function shieldCountForSubject(pieces, subjectTeam, subjectSpecies, targetTeam, targetSpecies) {
  const subjectSide = { team: subjectTeam, species_set: subjectSpecies, region: { kind: 'all' } }
  const targetSide  = { team: targetTeam,  species_set: targetSpecies,  region: { kind: 'all' } }
  return activeShieldSets({ operator: 'shield', subjectSide, targetSide }, pieces).activeSubjects.size
}

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

// "allied pawn shield allied rook" — moved_piece (WHITE pawn) bound on subject
// (shielder). subjectProposition describes the shielder side; targetProposition
// describes the shielded side. For direction "-", on prior moved_piece was the
// shielder of a rook; on after the pawn has moved off the shield line.
function entryWithBothProps({
  direction, movedPieceRole,
  subjectTeam = Board.WHITE, subjectSpecies = new Set([Board.PAWN]),
  targetTeam  = Board.WHITE, targetSpecies  = new Set([Board.ROOK])
}) {
  const region = movedPieceRole
    ? { kind: 'related-to', actor: 'moved_piece', role: movedPieceRole, operator: 'shield' }
    : { kind: 'all' }
  const subjectProposition = {
    team: subjectTeam, frame: 'current',
    species_set: subjectSpecies,
    region: movedPieceRole === 'subject' ? region : { kind: 'all' },
    count_range: { min: 1, max: Infinity }
  }
  const targetProposition = {
    team: targetTeam, frame: 'current',
    species_set: targetSpecies,
    region: movedPieceRole === 'target' ? region : { kind: 'all' },
    count_range: { min: 1, max: Infinity }
  }
  const pbsSide = movedPieceRole === 'target' ? targetProposition : subjectProposition
  return {
    source: 'relational', operator: 'shield', metric: 'count', direction,
    priorProposition: { ...pbsSide, frame: 'prior' },
    currentProposition: pbsSide,
    subjectProposition,
    targetProposition
  }
}

describe('movedPieceParticipatesShield — apply (direction "-", role "subject", moved_piece is the shielder on prior)', () => {
  it('commits priorRegion to origins where prior shield-count exceeds after shield-count', () => {
    const moved = {
      team: Board.WHITE,
      species_set: new Set([Board.PAWN]),
      region: { kind: 'set', squares: new Set([D4]) },
      priorRegion: { kind: 'all' },
      relationsToAnchors: []
    }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.PAWN)]])

    const result = movedPieceParticipatesShield.apply(
      entryWithBothProps({ direction: '-', movedPieceRole: 'subject' }),
      ctx, pieces, () => 0.5
    )

    expect(result).not.toBeNull()
    const priorRegion = ctx.singulars.moved_piece.priorRegion
    expect(priorRegion.kind).toBe('set')
    expect(priorRegion.squares.size).toBeGreaterThan(0)

    const afterCount = shieldCountForSubject(result, Board.WHITE, new Set([Board.PAWN]), Board.WHITE, new Set([Board.ROOK]))
    for (const origin of priorRegion.squares) {
      const priorPieces = piecesWithMovedAtOrigin(result, D4, origin, Board.WHITE, Board.PAWN)
      const priorCount = shieldCountForSubject(priorPieces, Board.WHITE, new Set([Board.PAWN]), Board.WHITE, new Set([Board.ROOK]))
      expect(priorCount).toBeGreaterThan(afterCount)
    }
  })
})

describe('movedPieceParticipatesShield — apply (direction "-", role "target", moved_piece is the shielded on prior)', () => {
  it('commits priorRegion to origins where prior shield-count exceeds after shield-count', () => {
    const moved = {
      team: Board.WHITE,
      species_set: new Set([Board.ROOK]),
      region: { kind: 'set', squares: new Set([D4]) },
      priorRegion: { kind: 'all' },
      relationsToAnchors: []
    }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.ROOK)]])

    const result = movedPieceParticipatesShield.apply(
      entryWithBothProps({ direction: '-', movedPieceRole: 'target' }),
      ctx, pieces, () => 0.5
    )

    expect(result).not.toBeNull()
    const priorRegion = ctx.singulars.moved_piece.priorRegion
    expect(priorRegion.kind).toBe('set')
    expect(priorRegion.squares.size).toBeGreaterThan(0)

    const afterCount = shieldCountForSubject(result, Board.WHITE, new Set([Board.PAWN]), Board.WHITE, new Set([Board.ROOK]))
    for (const origin of priorRegion.squares) {
      const priorPieces = piecesWithMovedAtOrigin(result, D4, origin, Board.WHITE, Board.ROOK)
      const priorCount = shieldCountForSubject(priorPieces, Board.WHITE, new Set([Board.PAWN]), Board.WHITE, new Set([Board.ROOK]))
      expect(priorCount).toBeGreaterThan(afterCount)
    }
  })
})

describe('movedPieceParticipatesShield — apply (direction "-", role "attacker", moved_piece is the implicit attacker on prior)', () => {
  it('commits priorRegion to origins where prior shield-count exceeds after shield-count', () => {
    const moved = {
      team: Board.BLACK,
      species_set: new Set([Board.QUEEN]),
      region: { kind: 'set', squares: new Set([D4]) },
      priorRegion: { kind: 'all' },
      relationsToAnchors: []
    }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.BLACK, Board.QUEEN)]])

    const result = movedPieceParticipatesShield.apply(
      entryWithBothProps({ direction: '-', movedPieceRole: null }),
      ctx, pieces, () => 0.5
    )

    expect(result).not.toBeNull()
    const priorRegion = ctx.singulars.moved_piece.priorRegion
    expect(priorRegion.kind).toBe('set')
    expect(priorRegion.squares.size).toBeGreaterThan(0)

    const afterCount = shieldCountForSubject(result, Board.WHITE, new Set([Board.PAWN]), Board.WHITE, new Set([Board.ROOK]))
    for (const origin of priorRegion.squares) {
      const priorPieces = piecesWithMovedAtOrigin(result, D4, origin, Board.BLACK, Board.QUEEN)
      const priorCount = shieldCountForSubject(priorPieces, Board.WHITE, new Set([Board.PAWN]), Board.WHITE, new Set([Board.ROOK]))
      expect(priorCount).toBeGreaterThan(afterCount)
    }
  })
})
