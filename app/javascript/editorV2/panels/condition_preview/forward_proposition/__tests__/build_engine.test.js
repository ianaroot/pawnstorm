import { describe, expect, it } from 'vitest'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildAttempt } from 'editorV2/panels/condition_preview/forward_proposition/build_engine'

describe('buildAttempt — integration', () => {
  it('produces a (priorBoard, moveObject) pair for a simple knight-mover chain', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'knight',
      operator: 'count', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 0
    }])

    const result = buildAttempt(combinedPlan, () => 0.1)

    expect(result).not.toBeNull()
    expect(result.priorBoard.layOut).toBeDefined()
    expect(result.moveObject.illegal).toBeFalsy()
  })
})
