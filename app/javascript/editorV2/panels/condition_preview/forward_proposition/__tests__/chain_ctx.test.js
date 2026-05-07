import { describe, expect, it } from 'vitest'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildChainCtx } from 'editorV2/panels/condition_preview/forward_proposition/chain_ctx'

describe('buildChainCtx — single plan', () => {
  it('returns singulars, propositions, relations, and crossFrame for a single unary count plan', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'count', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 2
    }])

    const ctx = buildChainCtx(combinedPlan)

    expect(ctx.singulars.moved_piece).toBeDefined()
    expect(ctx.propositions).toHaveLength(1)
    expect(ctx.relations).toHaveLength(0)
    expect(ctx.crossFrame).toHaveLength(0)
  })
})
