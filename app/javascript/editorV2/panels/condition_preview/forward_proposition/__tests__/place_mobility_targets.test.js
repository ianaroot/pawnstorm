import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { earlyPlaceMobilityTargets } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/place_mobility_targets'
import { isEdgePosition } from 'editorV2/panels/condition_preview/forward_proposition/mobility/edge_bias'
import { defaultTestCtx } from './_helpers'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function nonPermissiveProposition(overrides = {}) {
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

function permissiveProposition(overrides = {}) {
  return {
    team: Board.WHITE,
    frame: 'current',
    species_set: new Set([Board.NIGHT]),
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE },
    ...overrides
  }
}

function ctxOf(overrides = {}) {
  return defaultTestCtx(overrides)
}

describe('earlyPlaceMobilityTargets — no mobility constraints', () => {
  it('returns an empty pieces map when ctx has no propositions', () => {
    const pieces = earlyPlaceMobilityTargets(ctxOf(), () => 0)
    expect(pieces.size).toBe(0)
  })

  it('returns an empty pieces map when all propositions have permissive mobility ranges', () => {
    const ctx = ctxOf({ propositions: [permissiveProposition()] })
    const pieces = earlyPlaceMobilityTargets(ctx, () => 0)
    expect(pieces.size).toBe(0)
  })
})

describe('earlyPlaceMobilityTargets — single mobility constraint, edge applicable', () => {
  let pieces
  beforeEach(() => {
    const ctx = ctxOf({ propositions: [nonPermissiveProposition()] })
    pieces = earlyPlaceMobilityTargets(ctx, () => 0)
  })

  it('places at least one piece', () => {
    expect(pieces.size).toBeGreaterThan(0)
  })

  it('places piece on an edge square', () => {
    const square = [...pieces.keys()][0]
    expect(isEdgePosition(square)).toBe(true)
  })
})

describe('earlyPlaceMobilityTargets — strategy bias counter integration', () => {
  it('increments at least one strategy counter when a strategy fires', () => {
    const ctx = ctxOf({ propositions: [nonPermissiveProposition()] })
    earlyPlaceMobilityTargets(ctx, () => 0)
    expect(ctx.edgeBiasState.count + ctx.pinState.count).toBeGreaterThanOrEqual(1)
  })
})

describe('earlyPlaceMobilityTargets — non-applicable constraint', () => {
  it('returns empty pieces when constraint region is "related-to" (edge declines)', () => {
    const constraint = nonPermissiveProposition({
      region: { kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'attack' }
    })
    const ctx = ctxOf({ propositions: [constraint] })
    const pieces = earlyPlaceMobilityTargets(ctx, () => 0)
    expect(pieces.size).toBe(0)
  })
})
