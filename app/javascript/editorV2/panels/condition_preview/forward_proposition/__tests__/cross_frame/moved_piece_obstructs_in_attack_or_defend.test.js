import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceObstructsInAttackOrDefend
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_obstructs_in_attack_or_defend'
import { defaultTestCtx } from '../_helpers'

const D4 = 27 // file 3, rank 3

function movedPieceSingular(species = Board.NIGHT, squareSet = new Set([D4])) {
  return {
    team: Board.WHITE,
    species_set: new Set([species]),
    region: { kind: 'set', squares: squareSet },
    priorRegion: { kind: 'all' },
    relationsToAnchors: []
  }
}

// "enemy any (count [op] PBS) attack ally any" — neither side bound to moved_piece.
function entry({
  direction = '+', operator = 'attack',
  subjectTeam = Board.BLACK, targetTeam = Board.WHITE,
  subjectSpecies = new Set([Board.ROOK, Board.BISHOP, Board.QUEEN]),
  targetSpecies = new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
} = {}) {
  const subjectProposition = {
    team: subjectTeam, frame: 'current',
    species_set: subjectSpecies,
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity }
  }
  const targetProposition = {
    team: targetTeam, frame: 'current',
    species_set: targetSpecies,
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity }
  }
  return {
    source: 'relational', operator, metric: 'count', direction,
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

describe('movedPieceObstructsInAttackOrDefend — appliesTo', () => {
  it('returns true for relational attack entries where moved_piece is not bound on either side', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns true for relational defend entries', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(entry({ operator: 'defend' }), ctx, new Map())).toBe(true)
  })

  it('returns false when moved_piece is bound on a side (participates mechanism owns that case)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    bindMovedTo(ctx, e, 'target')
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(e, ctx, new Map())).toBe(false)
  })

  it('returns false for non-attack/defend operators', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const e = entry()
    e.operator = 'shield'
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(e, ctx, new Map())).toBe(false)
  })
})

describe('movedPieceObstructsInAttackOrDefend — apply (direction "-")', () => {
  it('places attacker and target on opposite sides of moved_piece destination', () => {
    // moved_piece (white knight) at D4 should block black-rook-attacks-white-target on the d-file.
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsInAttackOrDefend.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    // At least 2 new pieces placed (attacker + target).
    expect(result.size).toBeGreaterThanOrEqual(pieces.size + 2)
  })

  it('narrows priorRegion to origins off the obstruction line', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    movedPieceObstructsInAttackOrDefend.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
  })
})

describe('movedPieceObstructsInAttackOrDefend — apply (direction "+")', () => {
  it('commits priorRegion to squares between an attacker and target pair', () => {
    // BLACK ROOK at D8 attacks WHITE PAWN at D1 along the D-file. Queen-origins
    // for D4 on the D-file (D2-D7, excluding D4 itself) lie between attacker
    // and target — those are valid prior positions where moved_piece obstructed.
    const D1 = 3
    const D8 = 59
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedPieceSingular(Board.QUEEN, new Set([D4])) }
    })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [D8, pieceCode(Board.BLACK, Board.ROOK)],
      [D1, pieceCode(Board.WHITE, Board.PAWN)]
    ])

    const result = movedPieceObstructsInAttackOrDefend.apply(entry({ direction: '+' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBeGreaterThan(0)
  })
})

describe('movedPieceObstructsInAttackOrDefend — apply (operator "defend")', () => {
  it('obstructs an enemy defender controlling another enemy through moved_piece destination', () => {
    // Defend = subject controls target's square; here both are enemy. The
    // moved_piece (WHITE NIGHT, ally) intercepts the defender's line of
    // control. Because the obstructor is on the opposite team from the
    // defended species filter, it never re-counts as a new defendee.
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const e = entry({
      direction: '-', operator: 'defend',
      subjectTeam: Board.BLACK, targetTeam: Board.BLACK,
      subjectSpecies: new Set([Board.ROOK, Board.QUEEN]),
      targetSpecies: new Set([Board.KING, Board.QUEEN, Board.ROOK, Board.PAWN])
    })
    const result = movedPieceObstructsInAttackOrDefend.apply(e, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBeGreaterThanOrEqual(pieces.size + 2)
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
  })
})

describe('movedPieceObstructsInAttackOrDefend — apply returns null when priorRegion excludes every legal origin', () => {
  it('returns null when priorRegion is constrained to a square no engineering can produce', () => {
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

    const result = movedPieceObstructsInAttackOrDefend.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).toBeNull()
  })
})

describe('movedPieceObstructsInAttackOrDefend — appliesTo gates on slider subject species', () => {
  it('returns false when subject species is knight only', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(
      entry({ subjectSpecies: new Set([Board.NIGHT]) }),
      ctx, new Map()
    )).toBe(false)
  })

  it('returns false for pawn-only and king-only subjects', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(
      entry({ subjectSpecies: new Set([Board.PAWN]) }), ctx, new Map()
    )).toBe(false)
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(
      entry({ subjectSpecies: new Set([Board.KING]) }), ctx, new Map()
    )).toBe(false)
  })

  it('returns true when subject mixes a non-slider with a slider', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceObstructsInAttackOrDefend.appliesTo(
      entry({ subjectSpecies: new Set([Board.NIGHT, Board.QUEEN]) }),
      ctx, new Map()
    )).toBe(true)
  })
})

describe('movedPieceObstructsInAttackOrDefend — narrows subject species per ray step', () => {
  it('with bishop-only subject, the placed attacker is diagonally aligned with destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsInAttackOrDefend.apply(
      entry({ direction: '-', subjectSpecies: new Set([Board.BISHOP]) }),
      ctx, pieces, () => 0.5
    )

    expect(result).not.toBeNull()
    const bishopPositions = positionsOfPiece(result, Board.BLACK, Board.BISHOP)
    expect(bishopPositions.length).toBeGreaterThan(0)
    for (const pos of bishopPositions) {
      expect(isDiagonalTo(pos, D4)).toBe(true)
    }
  })

  it('with rook-only subject, the placed attacker is orthogonally aligned with destination', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = movedPieceObstructsInAttackOrDefend.apply(
      entry({ direction: '-', subjectSpecies: new Set([Board.ROOK]) }),
      ctx, pieces, () => 0.5
    )

    expect(result).not.toBeNull()
    const rookPositions = positionsOfPiece(result, Board.BLACK, Board.ROOK)
    expect(rookPositions.length).toBeGreaterThan(0)
    for (const pos of rookPositions) {
      expect(isOrthogonalTo(pos, D4)).toBe(true)
    }
  })

  it('direction "+": with bishop-only subject, placed attacker is on a diagonal from placed target', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedPieceSingular(Board.QUEEN, new Set([D4])) }
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])

    const result = movedPieceObstructsInAttackOrDefend.apply(
      entry({ direction: '+', subjectSpecies: new Set([Board.BISHOP]) }),
      ctx, pieces, () => 0.5
    )

    expect(result).not.toBeNull()
    const bishopPositions = positionsOfPiece(result, Board.BLACK, Board.BISHOP)
    expect(bishopPositions.length).toBe(1)
    const newPositions = [...result.keys()].filter(p => p !== D4 && p !== bishopPositions[0])
    expect(newPositions.length).toBe(1)
    expect(isDiagonalTo(bishopPositions[0], newPositions[0])).toBe(true)
  })
})

function positionsOfPiece(pieces, team, species) {
  const code = pieceCode(team, species)
  return [...pieces.entries()].filter(([_, c]) => c === code).map(([pos]) => pos)
}

function isDiagonalTo(a, b) {
  const fileDiff = Math.abs((a % 8) - (b % 8))
  const rankDiff = Math.abs(Math.floor(a / 8) - Math.floor(b / 8))
  return fileDiff === rankDiff && fileDiff > 0
}

function isOrthogonalTo(a, b) {
  if (a === b) { return false }
  const sameFile = (a % 8) === (b % 8)
  const sameRank = Math.floor(a / 8) === Math.floor(b / 8)
  return sameFile || sameRank
}
