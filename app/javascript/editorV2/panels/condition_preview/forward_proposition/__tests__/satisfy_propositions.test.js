import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { materialValue } from 'gameplay/board_query_utils'
import { satisfyPropositions } from 'editorV2/panels/condition_preview/forward_proposition/satisfy_propositions'

const PERMISSIVE = { min: 0, max: Infinity }

describe('satisfyPropositions — count satisfaction on empty board', () => {
  it('places exactly count_range.min pieces matching the proposition\'s species_set', () => {
    const ctx = {
      propositions: [{
        team: Board.WHITE, frame: 'current',
        species_set: new Set([Board.PAWN]),
        region: { kind: 'all' },
        count_range: { min: 2, max: Infinity },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }],
      relations: []
    }

    const result = satisfyPropositions(ctx, new Map(), () => 0.5)

    expect(result).not.toBeNull()
    let pawns = 0
    for (const p of result.values()) {
      if (p === pieceCode(Board.WHITE, Board.PAWN)) { pawns += 1 }
    }
    expect(pawns).toBe(2)
  })

  it('does not place additional pieces when count_range.min is already met by existing pieces', () => {
    const ctx = {
      propositions: [{
        team: Board.WHITE, frame: 'current',
        species_set: new Set([Board.PAWN]),
        region: { kind: 'all' },
        count_range: { min: 2, max: Infinity },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }],
      relations: []
    }
    const seeded = new Map([
      [10, pieceCode(Board.WHITE, Board.PAWN)],
      [20, pieceCode(Board.WHITE, Board.PAWN)]
    ])

    const result = satisfyPropositions(ctx, seeded, () => 0.5)

    expect(result.size).toBe(2)
  })
})

describe('satisfyPropositions — aggregate value satisfaction', () => {
  it('places pieces to meet aggregate_value_range.min when initial value is below threshold', () => {
    const ctx = {
      propositions: [{
        team: Board.WHITE, frame: 'current',
        species_set: new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]),
        region: { kind: 'all' },
        count_range: { min: 0, max: Infinity },
        aggregate_value_range: { min: 9, max: Infinity },
        aggregate_mobility_range: { ...PERMISSIVE }
      }],
      relations: []
    }

    const result = satisfyPropositions(ctx, new Map(), () => 0.5)

    expect(result).not.toBeNull()
    let value = 0
    for (const piece of result.values()) {
      if (piece.charAt(0) === Board.WHITE) { value += materialValue(piece.slice(1)) }
    }
    expect(value).toBeGreaterThanOrEqual(9)
  })
})

describe('satisfyPropositions — region: set placement', () => {
  it('places pieces only within region.squares when region.kind is set', () => {
    const region = { kind: 'set', squares: new Set([16, 17, 24, 25]) }
    const ctx = {
      propositions: [{
        team: Board.WHITE, frame: 'current',
        species_set: new Set([Board.NIGHT]),
        region,
        count_range: { min: 2, max: Infinity },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }],
      relations: []
    }

    const result = satisfyPropositions(ctx, new Map(), () => 0.5)

    expect(result).not.toBeNull()
    for (const pos of result.keys()) {
      expect(region.squares.has(pos)).toBe(true)
    }
  })
})

describe('satisfyPropositions — frame routing', () => {
  it('skips frame: prior propositions in v1 (PBS deferred)', () => {
    const ctx = {
      propositions: [{
        team: Board.WHITE, frame: 'prior',
        species_set: new Set([Board.NIGHT]),
        region: { kind: 'all' },
        count_range: { min: 1, max: Infinity },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }],
      relations: []
    }

    const result = satisfyPropositions(ctx, new Map(), () => 0.5)

    expect(result.size).toBe(0)
  })
})

describe('satisfyPropositions — failure', () => {
  it('returns null when count_range.min cannot be met within the region', () => {
    const ctx = {
      propositions: [{
        team: Board.WHITE, frame: 'current',
        species_set: new Set([Board.PAWN]),
        region: { kind: 'set', squares: new Set() },
        count_range: { min: 1, max: Infinity },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }],
      relations: []
    }

    expect(satisfyPropositions(ctx, new Map(), () => 0.5)).toBeNull()
  })
})

describe('satisfyPropositions — related-to region placement', () => {
  it('places a queen on a queen-line attacking the moved_piece anchor (target role)', () => {
    const D4 = 27
    const ctx = {
      singulars: {
        moved_piece: {
          team: Board.WHITE, species_set: new Set([Board.NIGHT]),
          region: { kind: 'set', squares: new Set([D4]) }
        }
      },
      propositions: [{
        team: Board.BLACK, frame: 'current',
        species_set: new Set([Board.QUEEN]),
        region: { kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack' },
        count_range: { min: 1, max: Infinity },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }],
      relations: []
    }
    const seeded = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = satisfyPropositions(ctx, seeded, () => 0.5)

    expect(result).not.toBeNull()
    const queens = []
    for (const [pos, piece] of result) {
      if (piece === pieceCode(Board.BLACK, Board.QUEEN)) { queens.push(pos) }
    }
    expect(queens.length).toBe(1)
    const queenPos = queens[0]
    const fileDiff = Math.abs(Board.fileIndex(queenPos) - Board.fileIndex(D4))
    const rankDiff = Math.abs(Board.rankIndex(queenPos) - Board.rankIndex(D4))
    expect(fileDiff === 0 || rankDiff === 0 || fileDiff === rankDiff).toBe(true)
  })
})

describe('satisfyPropositions — cap respect across propositions', () => {
  it('avoids species that would push another proposition past its count_range.max', () => {
    const ctx = {
      propositions: [
        {
          team: Board.WHITE, frame: 'current',
          species_set: new Set([Board.PAWN, Board.NIGHT]),
          region: { kind: 'all' },
          count_range: { min: 3, max: Infinity },
          aggregate_value_range: { ...PERMISSIVE },
          aggregate_mobility_range: { ...PERMISSIVE }
        },
        {
          team: Board.WHITE, frame: 'current',
          species_set: new Set([Board.PAWN]),
          region: { kind: 'all' },
          count_range: { min: 0, max: 1 },
          aggregate_value_range: { ...PERMISSIVE },
          aggregate_mobility_range: { ...PERMISSIVE }
        }
      ],
      relations: []
    }

    const result = satisfyPropositions(ctx, new Map(), () => 0.5)

    expect(result).not.toBeNull()
    let pawns = 0
    let total = 0
    for (const piece of result.values()) {
      if (piece.charAt(0) === Board.WHITE) { total += 1 }
      if (piece === pieceCode(Board.WHITE, Board.PAWN)) { pawns += 1 }
    }
    expect(total).toBeGreaterThanOrEqual(3)
    expect(pawns).toBeLessThanOrEqual(1)
  })
})
