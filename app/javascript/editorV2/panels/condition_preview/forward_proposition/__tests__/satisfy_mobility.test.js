import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { satisfyMobility } from 'editorV2/panels/condition_preview/forward_proposition/mobility/satisfy_mobility'
import { mobilityAt } from 'gameplay/mobility'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { position } from 'gameplay/__tests__/helpers'

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
    const ctx = {
      singulars: {},
      propositions: [permissiveProposition()],
      relations: []
    }
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
    const ctx = {
      singulars: {},
      propositions: [permissiveProposition({
        species_set: new Set([Board.QUEEN]),
        aggregate_mobility_range: { min: 0, max: 2 }
      })],
      relations: []
    }
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
    const ctx = {
      singulars: {},
      propositions: [permissiveProposition({
        team: Board.BLACK,
        species_set: new Set([Board.PAWN]),
        aggregate_mobility_range: { min: 0, max: 0 }
      })],
      relations: []
    }
    const result = satisfyMobility(ctx, pieces, () => 0)
    expect(result).toBe(pieces)
  })
})
