import { describe, expect, it } from 'vitest'
import { standardScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/standard'

describe('standardScenario', () => {
  it('is named "standard"', () => {
    expect(standardScenario.name).toBe('standard')
  })

  it('returns an empty ctx delta for any combinedPlan', () => {
    expect(standardScenario.buildCtxDelta({ plans: [] })).toEqual({})
  })
})
