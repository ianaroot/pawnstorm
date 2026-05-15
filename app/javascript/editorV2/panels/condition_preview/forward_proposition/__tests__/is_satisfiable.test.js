import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { isSatisfiable } from 'editorV2/panels/condition_preview/forward_proposition/is_satisfiable'

const PERMISSIVE = { min: 0, max: Infinity }

function defaultCtx(overrides = {}) {
  return {
    singulars: {
      moved_piece: {
        team: Board.WHITE, species_set: new Set([Board.PAWN]),
        region: { kind: 'all' }, relationsToAnchors: []
      }
    },
    propositions: [],
    ...overrides
  }
}

describe('isSatisfiable', () => {
  it('returns true for a minimal ctx with non-empty singular and no propositions', () => {
    expect(isSatisfiable(defaultCtx())).toBe(true)
  })

  it('returns false when a singular has an empty species_set', () => {
    const ctx = defaultCtx()
    ctx.singulars.moved_piece.species_set = new Set()
    expect(isSatisfiable(ctx)).toBe(false)
  })

  it('returns false when a singular has an empty region (set kind with no squares)', () => {
    const ctx = defaultCtx()
    ctx.singulars.moved_piece.region = { kind: 'set', squares: new Set() }
    expect(isSatisfiable(ctx)).toBe(false)
  })

  it('returns false when moved_piece has an empty priorRegion (set kind with no squares)', () => {
    const ctx = defaultCtx()
    ctx.singulars.moved_piece.priorRegion = { kind: 'set', squares: new Set() }
    expect(isSatisfiable(ctx)).toBe(false)
  })

  it('returns false when a proposition has count_range with min > max', () => {
    const ctx = defaultCtx({
      propositions: [{
        team: Board.WHITE, frame: 'current',
        species_set: new Set([Board.PAWN]),
        region: { kind: 'all' },
        count_range: { min: 5, max: 3 },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }]
    })
    expect(isSatisfiable(ctx)).toBe(false)
  })

  it('returns false when a proposition has aggregate_value_range with min > max', () => {
    const ctx = defaultCtx({
      propositions: [{
        team: Board.WHITE, frame: 'current',
        species_set: new Set([Board.PAWN]),
        region: { kind: 'all' },
        count_range: { ...PERMISSIVE },
        aggregate_value_range: { min: 100, max: 9 },
        aggregate_mobility_range: { ...PERMISSIVE }
      }]
    })
    expect(isSatisfiable(ctx)).toBe(false)
  })
})
