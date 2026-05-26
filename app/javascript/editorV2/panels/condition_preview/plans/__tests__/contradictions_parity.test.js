import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'

// Shared impossible/possible payloads, also loaded by the Ruby spec
// (spec/models/nodes/condition_satisfiability_parity_spec.rb), so the JS
// detectors and Nodes::ConditionSatisfiability can't drift on these cases.
// The JS side checks the verdict; the Ruby side pins the exact reason.
const parityCases = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'spec/fixtures/condition_satisfiability_parity.json'), 'utf8')
)

function isContradictory(data) {
  return buildCombinedPlan([data]).status === 'contradictory'
}

describe('condition satisfiability parity', () => {
  it('allows every satisfiable parity case', () => {
    const flagged = parityCases.filter(c => c.satisfiable && isContradictory(c.data)).map(c => c.name)
    expect(flagged).toEqual([])
  })

  it('rejects every unsatisfiable parity case', () => {
    const missed = parityCases.filter(c => !c.satisfiable && !isContradictory(c.data)).map(c => c.name)
    expect(missed).toEqual([])
  })
})
