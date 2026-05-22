import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { edgeStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/edge'
import { isEdgePosition } from 'editorV2/panels/condition_preview/forward_proposition/mobility/edge_bias'
import { position } from 'gameplay/__tests__/helpers'
import { defaultTestCtx } from './_helpers'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function constraintOf(overrides = {}) {
  return {
    team: Board.WHITE,
    frame: 'current',
    species_set: new Set([Board.NIGHT]),
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { min: 0, max: 2 },
    ...overrides
  }
}

function ctxOf(overrides = {}) {
  return defaultTestCtx(overrides)
}

function freshPoolEntry(constraint) {
  return {
    source: 'fresh',
    actorKey: null,
    team: constraint.team,
    speciesOptions: constraint.species_set,
    regionOptions: constraint.region,
    constraintRef: constraint,
    side: null
  }
}

describe('edgeStrategy.appliesTo', () => {
  it('returns true for a typical mobility-constrained proposition', () => {
    expect(edgeStrategy.appliesTo(constraintOf(), ctxOf(), new Map(), [])).toBe(true)
  })

  it('returns true even when edge placement alone cannot fully achieve the max (partial reduction is still useful)', () => {
    const constraint = constraintOf({ species_set: new Set([Board.QUEEN]), aggregate_mobility_range: { min: 0, max: 5 } })
    expect(edgeStrategy.appliesTo(constraint, ctxOf(), new Map(), [])).toBe(true)
  })

  it('returns false when the bias cap is already reached', () => {
    const ctx = ctxOf({ edgeBiasState: { count: 2, max: 2 } })
    expect(edgeStrategy.appliesTo(constraintOf(), ctx, new Map(), [])).toBe(false)
  })

  it('returns false when the constraint region kind is "related-to"', () => {
    const constraint = constraintOf({ region: { kind: 'related-to', actor: 'enemy_moved_piece', role: 'subject', operator: 'attack' } })
    expect(edgeStrategy.appliesTo(constraint, ctxOf(), new Map(), [])).toBe(false)
  })
})

describe('edgeStrategy.apply with a fresh pool entry', () => {
  let constraint, result
  beforeEach(() => {
    constraint = constraintOf()
    const pool = [freshPoolEntry(constraint)]
    result = edgeStrategy.apply(constraint, ctxOf(), new Map(), pool, () => 0)
  })

  it('returns a pieces map with one piece', () => {
    expect(result.size).toBe(1)
  })

  it('places the piece on an edge square', () => {
    const placedSquare = [...result.keys()][0]
    expect(isEdgePosition(placedSquare)).toBe(true)
  })
})

describe('edgeStrategy.apply increments the bias counter', () => {
  it('increments ctx.edgeBiasState.count on a successful placement', () => {
    const ctx = ctxOf()
    const pool = [freshPoolEntry(constraintOf())]
    edgeStrategy.apply(constraintOf(), ctx, new Map(), pool, () => 0)
    expect(ctx.edgeBiasState.count).toBe(1)
  })
})

describe('edgeStrategy.apply with a singular pool entry', () => {
  let singular
  beforeEach(() => {
    singular = {
      team: Board.WHITE, species_set: new Set([Board.NIGHT]),
      region: { kind: 'all' }, relationsToAnchors: []
    }
    const ctx = ctxOf({ singulars: { moved_piece: singular } })
    const constraint = constraintOf()
    const pool = [{
      source: 'singular', actorKey: 'moved_piece', team: Board.WHITE,
      speciesOptions: singular.species_set, regionOptions: singular.region,
      constraintRef: null, side: null
    }]
    edgeStrategy.apply(constraint, ctx, new Map(), pool, () => 0)
  })

  it('narrows the singular\'s region kind to "set"', () => {
    expect(singular.region.kind).toBe('set')
  })

  it('narrows the singular\'s region to a single square', () => {
    expect(singular.region.squares.size).toBe(1)
  })
})

describe('edgeStrategy.apply respecting caps', () => {
  it('returns null when every legal candidate would violate a count_range.max cap', () => {
    const constraint = constraintOf()
    const ctx = ctxOf({
      propositions: [{
        team: Board.WHITE,
        frame: 'current',
        species_set: new Set([Board.NIGHT]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }]
    })
    const pool = [freshPoolEntry(constraint)]

    expect(edgeStrategy.apply(constraint, ctx, new Map(), pool, () => 0)).toBeNull()
  })
})

describe('edgeStrategy.apply when no edge square is available', () => {
  it('returns null when the constraint region has no edge squares', () => {
    const constraint = constraintOf({
      region: { kind: 'set', squares: new Set([position('d4'), position('e5')]) }
    })
    const pool = [freshPoolEntry(constraint)]
    const result = edgeStrategy.apply(constraint, ctxOf(), new Map(), pool, () => 0)
    expect(result).toBeNull()
  })
})
