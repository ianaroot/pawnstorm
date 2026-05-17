import { describe, expect, it } from 'vitest'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { emitConstraintsFromPlan } from 'editorV2/panels/condition_preview/forward_proposition/propositions'

// NEW-TDD-RED: the census kind is not yet a supported plan, and
// regionFromPlan is still gated on plan.kind === 'position'. A census plan
// carrying spatial keys must reach the proposition layer as a set-region;
// a census against prior_board_state must emit BOTH frames region-restricted
// (this is the foundation of generating region-specific PBS census examples).

function censusPlan(payload) {
  const combined = buildCombinedPlan([{ version: 2, kind: 'census', ...payload }])
  return combined.plans[0]
}

describe('census region reaches the proposition layer (NEW-TDD-RED)', () => {
  it('emits a board-wide region for a census with no spatial keys', () => {
    const plan = censusPlan({
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'count', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 2
    })

    const { propositions } = emitConstraintsFromPlan(plan)

    expect(propositions).toHaveLength(1)
    expect(propositions[0].region).toEqual({ kind: 'all' })
  })

  it('emits a set-region proposition for a census carrying spatial keys', () => {
    const plan = censusPlan({
      subject: 'allied', subjectFilter: 'major',
      positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 4,
      operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 2
    })

    const { propositions } = emitConstraintsFromPlan(plan)

    expect(propositions).toHaveLength(1)
    expect(propositions[0].region.kind).toBe('set')
    expect(propositions[0].region.squares.size).toBeGreaterThan(0)
  })

  it('emits both prior and current propositions region-restricted for a region census against prior_board_state', () => {
    const plan = censusPlan({
      subject: 'allied', subjectFilter: 'major',
      positionAxis: 'rank', positionComparator: 'greater_than_or_equal_to', positionTarget: 5,
      operator: 'count', comparator: 'greater_than',
      target: 'prior_board_state'
    })

    const { propositions, crossFrame } = emitConstraintsFromPlan(plan)

    const prior = propositions.find(p => p.frame === 'prior')
    const current = propositions.find(p => p.frame === 'current')
    expect(prior).toBeDefined()
    expect(current).toBeDefined()
    expect(prior.region.kind).toBe('set')
    expect(current.region.kind).toBe('set')
    expect(crossFrame).toHaveLength(1)
    expect(crossFrame[0].source).toBe('census')
  })
})
