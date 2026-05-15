import { describe, expect, it } from 'vitest'

import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildChainCtx } from 'editorV2/panels/condition_preview/forward_proposition/chain_ctx'
import { respectsAllCaps } from 'editorV2/panels/condition_preview/forward_proposition/respect_caps'

function piecesFrom(spec) { return new Map(spec.map(([sq, piece]) => [sq, piece])) }
function sq(file, rank) { return rank * 8 + file }

function buildCtx() {
  return buildChainCtx(buildCombinedPlan([{
    kind: 'relational',
    subject: 'allied', subjectFilter: 'pawn',
    subjectComparisonMetric: 'count', subjectComparator: 'equal_to',
    subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 2,
    operator: 'attack',
    target: 'enemy', targetFilter: 'any'
  }]))
}

describe('respectsAllCaps with skipRelation', () => {
  const ctx = buildCtx()
  const relation = ctx.relations[0]
  const baseBoard = piecesFrom([
    [sq(2, 1), 'WP'], [sq(4, 1), 'WP'], [sq(3, 2), 'BR'], [sq(0, 4), 'BQ']
  ])
  const candPos = sq(1, 3)

  it('rejects the cap-violating placement when no skip', () => {
    expect(respectsAllCaps('W', 'P', candPos, ctx, baseBoard)).toBe(false)
  })

  it('accepts the same placement when skipRelation matches the violating relation', () => {
    expect(respectsAllCaps('W', 'P', candPos, ctx, baseBoard, { skipRelation: relation })).toBe(true)
  })

  it('still applies the relation check when skipRelation is null/undefined/{}', () => {
    expect(respectsAllCaps('W', 'P', candPos, ctx, baseBoard, {})).toBe(false)
    expect(respectsAllCaps('W', 'P', candPos, ctx, baseBoard, { skipRelation: null })).toBe(false)
  })

  it('still applies the relation check when skipRelation is a different relation object', () => {
    const otherRelation = { operator: 'attack', subjectSide: {}, targetSide: {} }
    expect(respectsAllCaps('W', 'P', candPos, ctx, baseBoard, { skipRelation: otherRelation })).toBe(false)
  })
})
