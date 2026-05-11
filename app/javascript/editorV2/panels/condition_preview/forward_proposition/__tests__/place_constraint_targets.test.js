import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import {
  earlyPlaceConstraintTargets, constraintsFromCtx
} from 'editorV2/panels/condition_preview/forward_proposition/early_placement/place_constraint_targets'
import { edgeStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/edge'
import { pinLineStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/pin_line'
import { checkRestrictionStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/check_restriction'
import { stalemateStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/stalemate'
import { checkmateStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/checkmate'
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

describe('earlyPlaceConstraintTargets — no mobility constraints', () => {
  it('returns an empty pieces map when ctx has no propositions', () => {
    const pieces = earlyPlaceConstraintTargets(ctxOf(), () => 0)
    expect(pieces.size).toBe(0)
  })

  it('returns an empty pieces map when all propositions have permissive mobility ranges', () => {
    const ctx = ctxOf({ propositions: [permissiveProposition()] })
    const pieces = earlyPlaceConstraintTargets(ctx, () => 0)
    expect(pieces.size).toBe(0)
  })
})

describe('earlyPlaceConstraintTargets — single mobility constraint, edge applicable', () => {
  let pieces
  beforeEach(() => {
    const ctx = ctxOf({ propositions: [nonPermissiveProposition()] })
    pieces = earlyPlaceConstraintTargets(ctx, () => 0)
  })

  it('places at least one piece', () => {
    expect(pieces.size).toBeGreaterThan(0)
  })

  it('places piece on an edge square', () => {
    const square = [...pieces.keys()][0]
    expect(isEdgePosition(square)).toBe(true)
  })
})

describe('earlyPlaceConstraintTargets — strategy bias counter integration', () => {
  it('increments at least one strategy counter when a strategy fires', () => {
    const ctx = ctxOf({ propositions: [nonPermissiveProposition()] })
    earlyPlaceConstraintTargets(ctx, () => 0)
    expect(ctx.edgeBiasState.count + ctx.pinState.count).toBeGreaterThanOrEqual(1)
  })
})

describe('earlyPlaceConstraintTargets — non-applicable constraint', () => {
  it('returns empty pieces when constraint region is "related-to" (edge declines)', () => {
    const constraint = nonPermissiveProposition({
      region: { kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'attack' }
    })
    const ctx = ctxOf({ propositions: [constraint] })
    const pieces = earlyPlaceConstraintTargets(ctx, () => 0)
    expect(pieces.size).toBe(0)
  })
})

describe('constraintsFromCtx', () => {
  it('wraps each non-permissive mobility proposition as { kind: "mobility", proposition }', () => {
    const proposition = nonPermissiveProposition()
    const ctx = ctxOf({ propositions: [proposition] })

    expect(constraintsFromCtx(ctx)).toEqual([{ kind: 'mobility', proposition }])
  })

  it('omits permissive-mobility propositions', () => {
    const ctx = ctxOf({ propositions: [permissiveProposition()] })

    expect(constraintsFromCtx(ctx)).toEqual([])
  })
})

describe('strategies — constraintKind', () => {
  it('declares "mobility" on every existing strategy', () => {
    const strategies = [edgeStrategy, pinLineStrategy, checkRestrictionStrategy, stalemateStrategy, checkmateStrategy]
    for (const strategy of strategies) {
      expect(strategy.constraintKind).toBe('mobility')
    }
  })
})
