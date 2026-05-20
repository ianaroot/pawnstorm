import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { activeShieldSets } from 'editorV2/panels/condition_preview/forward_proposition/relations/shield'
import {
  movedPieceObstructsShield
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_obstructs_shield'
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
    targetProposition,
    sourcePlan: {}
  }
}

function bindMovedTo(ctx, entry, role) {
  ctx.movedBinding = { assignments: [{ sourcePlan: entry.sourcePlan, role, kind: 'related-to' }] }
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
    bindMovedTo(ctx, e, 'subject')
    expect(movedPieceObstructsShield.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceObstructsShield — apply (direction "-")', () => {
  it('commits priorRegion to origins where prior shield-count exceeds after shield-count', () => {
    const shielderSpecies = new Set([Board.BISHOP, Board.NIGHT, Board.PAWN])
    const shieldedSpecies = new Set([Board.KING, Board.QUEEN, Board.ROOK])
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsShield.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    const priorRegion = ctx.singulars.moved_piece.priorRegion
    expect(priorRegion.kind).toBe('set')
    expect(priorRegion.squares.size).toBeGreaterThan(0)

    const afterCount = shieldCountForSubject(result, Board.WHITE, shielderSpecies, Board.WHITE, shieldedSpecies)
    for (const origin of priorRegion.squares) {
      const priorPieces = piecesWithMovedAtOrigin(result, D4, origin, Board.WHITE, Board.NIGHT)
      const priorCount = shieldCountForSubject(priorPieces, Board.WHITE, shielderSpecies, Board.WHITE, shieldedSpecies)
      expect(priorCount).toBeGreaterThan(afterCount)
    }
  })
})

describe('movedPieceObstructsShield — apply (direction "+")', () => {
  it('commits priorRegion to origins where after shield-count exceeds prior shield-count', () => {
    const shielderSpecies = new Set([Board.BISHOP, Board.NIGHT, Board.PAWN])
    const shieldedSpecies = new Set([Board.KING, Board.QUEEN, Board.ROOK])
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsShield.apply(entry({ direction: '+' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    const priorRegion = ctx.singulars.moved_piece.priorRegion
    expect(priorRegion.kind).toBe('set')
    expect(priorRegion.squares.size).toBeGreaterThan(0)

    const afterCount = shieldCountForSubject(result, Board.WHITE, shielderSpecies, Board.WHITE, shieldedSpecies)
    for (const origin of priorRegion.squares) {
      const priorPieces = piecesWithMovedAtOrigin(result, D4, origin, Board.WHITE, Board.NIGHT)
      const priorCount = shieldCountForSubject(priorPieces, Board.WHITE, shielderSpecies, Board.WHITE, shieldedSpecies)
      expect(afterCount).toBeGreaterThan(priorCount)
    }
  })
})

describe('movedPieceObstructsShield — apply returns null when priorRegion is constrained to a square no engineering can produce', () => {
  it('returns null when priorRegion excludes every legal origin', () => {
    const A1 = 0
    const moved = {
      team: Board.WHITE,
      species_set: new Set([Board.NIGHT]),
      region: { kind: 'set', squares: new Set([D4]) },
      priorRegion: { kind: 'set', squares: new Set([A1]) },
      relationsToAnchors: []
    }
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsShield.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).toBeNull()
  })
})

describe('movedPieceObstructsShield — cap respect', () => {
  it('returns null when placing the engineered attacker would violate count_range.max caps on every slider species', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedPieceSingular() },
      propositions: [{
        team: Board.BLACK, frame: 'current',
        species_set: new Set([Board.QUEEN, Board.ROOK, Board.BISHOP]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }]
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsShield.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).toBeNull()
  })
})
