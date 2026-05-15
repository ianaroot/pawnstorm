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

  describe('pairwise count contradictions', () => {
    const ALL_SPECIES = [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]
    const H1 = 7
    const A1 = 0

    function prop({
      team = Board.WHITE,
      frame = 'current',
      species,
      region,
      countMin = 0,
      countMax = Infinity
    }) {
      return {
        team, frame,
        species_set: new Set(species),
        region,
        count_range: { min: countMin, max: countMax },
        aggregate_value_range: { ...PERMISSIVE },
        aggregate_mobility_range: { ...PERMISSIVE }
      }
    }

    it('returns false when a min>0 species-specific demand subsets an emptiness prop on the same square', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1]) }, countMin: 1 }),
          prop({ species: ALL_SPECIES, region: { kind: 'set', squares: new Set([H1]) }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(false)
    })

    it('returns false when demand exceeds free squares (region partially overlaps emptiness)', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1, A1]) }, countMin: 2 }),
          prop({ species: ALL_SPECIES, region: { kind: 'set', squares: new Set([H1]) }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(false)
    })

    it('returns true when demand fits in non-overlapping free squares', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1, A1]) }, countMin: 1 }),
          prop({ species: ALL_SPECIES, region: { kind: 'set', squares: new Set([H1]) }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(true)
    })

    it('returns true when regions are disjoint', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1]) }, countMin: 1 }),
          prop({ species: ALL_SPECIES, region: { kind: 'set', squares: new Set([A1]) }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(true)
    })

    it('returns true when teams differ', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ team: Board.WHITE, species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1]) }, countMin: 1 }),
          prop({ team: Board.BLACK, species: ALL_SPECIES, region: { kind: 'set', squares: new Set([H1]) }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(true)
    })

    it('returns true when frames differ', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ frame: 'current', species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1]) }, countMin: 1 }),
          prop({ frame: 'prior', species: ALL_SPECIES, region: { kind: 'set', squares: new Set([H1]) }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(true)
    })

    it('returns true when neither species_set is a subset of the other (under-detect)', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN, Board.ROOK], region: { kind: 'set', squares: new Set([H1]) }, countMin: 1 }),
          prop({ species: [Board.ROOK, Board.KING], region: { kind: 'set', squares: new Set([H1]) }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(true)
    })

    it('returns true when either region is related-to (skipped in v1)', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1]) }, countMin: 1 }),
          prop({ species: ALL_SPECIES, region: { kind: 'related-to', actor: 'moved_piece', operator: 'adjacent' }, countMax: 0 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(true)
    })

    it('returns false for non-emptiness cap: demand >= 3 in subset region vs cap of 1 in superset', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1]) }, countMin: 3 }),
          prop({ species: ALL_SPECIES, region: { kind: 'all' }, countMax: 1 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(false)
    })

    it('returns true when capper.region is `all` but demand fits within cap', () => {
      const ctx = defaultCtx({
        propositions: [
          prop({ species: [Board.QUEEN], region: { kind: 'set', squares: new Set([H1]) }, countMin: 1 }),
          prop({ species: ALL_SPECIES, region: { kind: 'all' }, countMax: 5 })
        ]
      })
      expect(isSatisfiable(ctx)).toBe(true)
    })
  })
})
