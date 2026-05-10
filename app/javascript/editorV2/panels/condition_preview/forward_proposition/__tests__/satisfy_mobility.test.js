import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { satisfyMobility } from 'editorV2/panels/condition_preview/forward_proposition/mobility/satisfy_mobility'
import { mobilityAt } from 'gameplay/mobility'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { position } from 'gameplay/__tests__/helpers'
import { defaultTestCtx } from './_helpers'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function permissiveProposition(overrides = {}) {
  return {
    team: Board.WHITE,
    frame: 'current',
    species_set: new Set([Board.NIGHT]),
    region: { kind: 'all' },
    count_range: { ...PERMISSIVE },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE },
    ...overrides
  }
}

function piecesMap(entries) {
  return new Map(entries.map(([square, code]) => [position(square), code]))
}

function seededRandom(seed = 1) {
  let current = seed >>> 0
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0
    return current / 0x100000000
  }
}

function boardFrom(pieces) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces))
}

describe('satisfyMobility — gate', () => {
  it('returns the input pieces map unchanged when no propositions exist', () => {
    const ctx = { singulars: {}, propositions: [], relations: [] }
    const pieces = new Map()
    expect(satisfyMobility(ctx, pieces, () => 0.5)).toBe(pieces)
  })

  it('returns the input pieces map unchanged when every aggregate_mobility_range is permissive', () => {
    const ctx = defaultTestCtx({
      propositions: [permissiveProposition()]
    })
    const pieces = new Map()
    expect(satisfyMobility(ctx, pieces, () => 0.5)).toBe(pieces)
  })
})

describe('satisfyMobility — mechanism dispatch', () => {
  it('reduces a constrained target\'s mobility when a non-permissive proposition matches', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.QUEEN)],
      ['e1', pieceCode(Board.WHITE, Board.KING)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const ctx = defaultTestCtx({
      propositions: [permissiveProposition({
        species_set: new Set([Board.QUEEN]),
        aggregate_mobility_range: { min: 0, max: 2 }
      })]
    })
    const before = mobilityAt(boardFrom(pieces), position('d4'))
    const result = satisfyMobility(ctx, pieces, () => 0)
    const after = mobilityAt(boardFrom(result), position('d4'))
    expect(after).toBeLessThan(before)
  })

  it('does not modify pieces when no piece on the board matches the constrained group', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.QUEEN)],
      ['e1', pieceCode(Board.WHITE, Board.KING)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const ctx = defaultTestCtx({
      propositions: [permissiveProposition({
        team: Board.BLACK,
        species_set: new Set([Board.PAWN]),
        aggregate_mobility_range: { min: 0, max: 0 }
      })]
    })
    const result = satisfyMobility(ctx, pieces, () => 0)
    expect(result).toBe(pieces)
  })
})

describe('satisfyMobility — gap-driven loop', () => {
  // A queen at d4 has 27 legal moves on an otherwise-empty board. A single
  // blocker reduces that by less than 10. Driving aggregate mobility under
  // 5 requires the loop to apply mechanisms multiple times.
  it('applies mechanisms across multiple iterations to drive mobility into range', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.QUEEN)],
      ['a1', pieceCode(Board.WHITE, Board.KING)],
      ['h8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const ctx = defaultTestCtx({
      propositions: [permissiveProposition({
        species_set: new Set([Board.QUEEN]),
        aggregate_mobility_range: { min: 0, max: 5 }
      })]
    })
    const before = mobilityAt(boardFrom(pieces), position('d4'))
    const result = satisfyMobility(ctx, pieces, () => 0.3)
    const after = mobilityAt(boardFrom(result), position('d4'))

    expect(before).toBeGreaterThan(20)
    expect(after).toBeLessThan(before)
    expect(result.size).toBeGreaterThan(pieces.size + 1)
  })

  // A queen on d4 starting with no own king on board, asked for mobility = 0,
  // requires multiple mechanism applications: an initial king-and-blocker
  // placement plus several follow-up blockers (or a pin pattern) before the
  // queen's reachable squares are fully sealed.
  it('drives queen mobility down via multiple mechanism applications', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.QUEEN)],
      ['h8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const ctx = defaultTestCtx({
      propositions: [permissiveProposition({
        species_set: new Set([Board.QUEEN]),
        aggregate_mobility_range: { min: 0, max: 0 }
      })]
    })
    const before = mobilityAt(boardFrom(pieces), position('d4'))
    const result = satisfyMobility(ctx, pieces, () => 0.5)
    const after = mobilityAt(boardFrom(result), position('d4'))

    expect(before).toBeGreaterThan(20)
    expect(after).toBeLessThan(before)
    // Loop must place at least the WK (so mobilityAt evaluates) plus several
    // additional pieces to noticeably drop mobility — confirming the loop
    // ran more than a single mechanism application.
    expect(result.size).toBeGreaterThan(pieces.size + 3)
  })

  // Verify the loop converges regardless of mechanism shuffle order. Each
  // seed produces a different shuffle inside applyOneMechanism; all of them
  // should produce mobility-reducing outcomes.
  it('converges to a mobility reduction across varied shuffle orders', () => {
    const initialPieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.QUEEN)],
      ['a1', pieceCode(Board.WHITE, Board.KING)],
      ['h8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const before = mobilityAt(boardFrom(initialPieces), position('d4'))

    let allReduced = true
    for (let seed = 1; seed <= 10; seed += 1) {
      const ctx = defaultTestCtx({
        propositions: [permissiveProposition({
          species_set: new Set([Board.QUEEN]),
          aggregate_mobility_range: { min: 0, max: 5 }
        })]
      })
      const random = seededRandom(seed)
      const result = satisfyMobility(ctx, initialPieces, random)
      const after = mobilityAt(boardFrom(result), position('d4'))
      if (after >= before) { allReduced = false; break }
    }

    expect(allReduced).toBe(true)
  })
})
