import { describe, expect, it } from 'vitest'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { candidateIdentity } from 'editorV2/panels/condition_preview/shared/example_utils'
import { collectForwardPropositionExamples } from 'editorV2/panels/condition_preview/forward_proposition/collect'

function makeAdder() {
  const seen = new Set()
  return function addUnique(example, pool) {
    const id = candidateIdentity(example)
    if (seen.has(id)) { return }
    seen.add(id)
    pool.push(example)
  }
}

describe('collectForwardPropositionExamples', () => {
  it('produces verified examples for a simple knight-mover chain', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'knight',
      operator: 'count', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 0
    }])
    const standardExamples = []
    const produced = { 'forward-proposition': 0 }

    collectForwardPropositionExamples({
      combinedPlan,
      random: Math.random,
      maxStandardSize: 50,
      addUnique: makeAdder(),
      standardExamples,
      produced,
      attempts: 200
    })

    expect(standardExamples.length).toBeGreaterThan(0)
    expect(produced['forward-proposition']).toBeGreaterThan(0)
  })
})
