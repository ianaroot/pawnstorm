import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { mergeCtxDelta } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/merge_ctx_delta'

function ctxWithSingulars(singulars = {}) {
  return { singulars, propositions: [], relations: [] }
}

describe('mergeCtxDelta — empty delta', () => {
  it('returns the ctx with no behavioral changes', () => {
    const ctx = ctxWithSingulars({
      moved_piece: { team: Board.WHITE, species_set: new Set([Board.KING]), region: { kind: 'all' } }
    })
    const result = mergeCtxDelta(ctx, {})
    expect(result.singulars.moved_piece.species_set).toEqual(new Set([Board.KING]))
    expect(result.singulars.moved_piece.region).toEqual({ kind: 'all' })
    expect(result.propositions).toEqual([])
  })
})

describe('mergeCtxDelta — singular species_set narrowing', () => {
  it('intersects chain singular species_set with delta singular species_set', () => {
    const ctx = ctxWithSingulars({
      moved_piece: {
        team: Board.WHITE,
        species_set: new Set([Board.KING, Board.QUEEN, Board.ROOK]),
        region: { kind: 'all' }
      }
    })
    const delta = {
      singulars: {
        moved_piece: { species_set: new Set([Board.KING]) }
      }
    }
    mergeCtxDelta(ctx, delta)
    expect(ctx.singulars.moved_piece.species_set).toEqual(new Set([Board.KING]))
  })
})

describe('mergeCtxDelta — singular region narrowing', () => {
  it('intersects chain singular region with delta singular region', () => {
    const G1 = 6
    const C1 = 2
    const ctx = ctxWithSingulars({
      moved_piece: {
        team: Board.WHITE,
        species_set: new Set([Board.KING]),
        region: { kind: 'all' }
      }
    })
    const delta = {
      singulars: {
        moved_piece: { region: { kind: 'set', squares: new Set([G1, C1]) } }
      }
    }
    mergeCtxDelta(ctx, delta)
    expect(ctx.singulars.moved_piece.region).toEqual({ kind: 'set', squares: new Set([G1, C1]) })
  })
})

describe('mergeCtxDelta — propositions concat onto ctx', () => {
  it('appends delta propositions to ctx.propositions', () => {
    const F1 = 5
    const ctx = ctxWithSingulars({})
    ctx.propositions = [{ team: Board.WHITE, frame: 'current', species_set: new Set([Board.PAWN]) }]
    const rookProp = {
      team: Board.WHITE, frame: 'current', species_set: new Set([Board.ROOK]),
      region: { kind: 'set', squares: new Set([F1]) },
      count_range: { min: 1, max: 1 }
    }
    mergeCtxDelta(ctx, { propositions: [rookProp] })
    expect(ctx.propositions).toHaveLength(2)
    expect(ctx.propositions[1]).toBe(rookProp)
  })
})

describe('mergeCtxDelta — aliased singulars in delta produce aliased keys in merged ctx', () => {
  it('makes chain.captured_piece and chain.enemy_moved_piece point to the same object when delta aliases them', () => {
    const ctx = ctxWithSingulars({
      captured_piece: {
        team: Board.BLACK, species_set: new Set([null, Board.PAWN, Board.ROOK]), region: { kind: 'all' }
      },
      enemy_moved_piece: {
        team: Board.BLACK, species_set: new Set([null, Board.PAWN, Board.KING]), region: { kind: 'all' }
      }
    })
    const epPawnDelta = { species_set: new Set([Board.PAWN]) }
    const delta = {
      singulars: {
        captured_piece: epPawnDelta,
        enemy_moved_piece: epPawnDelta
      }
    }
    mergeCtxDelta(ctx, delta)
    expect(ctx.singulars.captured_piece).toBe(ctx.singulars.enemy_moved_piece)
    expect(ctx.singulars.captured_piece.species_set).toEqual(new Set([Board.PAWN]))
  })
})
