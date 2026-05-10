import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildChainCtx } from 'editorV2/panels/condition_preview/forward_proposition/chain_ctx'

const TRIVIAL_PAYLOAD = {
  version: 2, kind: 'unary',
  subject: 'allied', subjectFilter: 'pawn',
  operator: 'count', comparator: 'greater_than_or_equal_to',
  target: 'exact_number', targetTotal: 2
}

describe('buildChainCtx — single plan', () => {
  it('returns singulars, propositions, relations, and crossFrame for a single unary count plan', () => {
    const combinedPlan = buildCombinedPlan([TRIVIAL_PAYLOAD])

    const ctx = buildChainCtx(combinedPlan)

    expect(ctx.singulars.moved_piece).toBeDefined()
    expect(ctx.propositions).toHaveLength(1)
    expect(ctx.relations).toHaveLength(0)
    expect(ctx.crossFrame).toHaveLength(0)
  })
})

describe('buildChainCtx — movingTeam / enemyTeam exposure', () => {
  let ctx
  beforeEach(() => {
    ctx = buildChainCtx(buildCombinedPlan([TRIVIAL_PAYLOAD]))
  })

  it('exposes combinedPlan.movingTeam on ctx', () => {
    expect(ctx.movingTeam).toBe(Board.WHITE)
  })

  it('exposes combinedPlan.enemyTeam on ctx', () => {
    expect(ctx.enemyTeam).toBe(Board.BLACK)
  })
})
