import { describe, expect, it } from 'vitest'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { candidateIdentity } from 'editorV2/panels/condition_preview/shared/example_utils'
import { collectForwardPropositionExamples } from 'editorV2/panels/condition_preview/forward_proposition/collect'

function seededRandom(seed = 1) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

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

  it('produces castle examples for a castle-compatible chain', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'count', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 0
    }])
    const standardExamples = []
    const produced = { 'forward-proposition': 0 }

    collectForwardPropositionExamples({
      combinedPlan,
      random: seededRandom(11),
      maxStandardSize: 200,
      addUnique: makeAdder(),
      standardExamples,
      produced,
      attempts: 200
    })

    const castleExamples = standardExamples.filter(e => /^O-O/.test(e.moveObject?.pieceNotation ?? ''))
    expect(castleExamples.length).toBeGreaterThan(0)
  })

  it('produces verified examples for "no enemy attacker on moved_piece" (count=0 relational)', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'enemy', subjectFilter: 'any',
      operator: 'attack',
      target: 'moved_piece', targetFilter: 'any',
      subjectComparisonMetric: 'count', subjectComparator: 'equal_to',
      subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 0
    }])
    const standardExamples = []
    const produced = { 'forward-proposition': 0 }

    collectForwardPropositionExamples({
      combinedPlan,
      random: seededRandom(9101),
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
