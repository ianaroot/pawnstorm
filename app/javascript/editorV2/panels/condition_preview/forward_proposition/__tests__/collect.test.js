import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { candidateIdentity } from 'editorV2/panels/condition_preview/shared/example_utils'
import {
  collectForwardPropositionExamples, buildScenarioBudgets
} from 'editorV2/panels/condition_preview/forward_proposition/collect'

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
      version: 2, kind: 'census',
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
      version: 2, kind: 'census',
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

  it('generates examples for enemy_moved_piece same_piece captured_piece, including en passant', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'identity',
      subject: 'enemy_moved_piece',
      target: 'captured_piece'
    }])
    const standardExamples = []
    const produced = { 'forward-proposition': 0 }

    collectForwardPropositionExamples({
      combinedPlan,
      random: seededRandom(17),
      maxStandardSize: 500,
      addUnique: makeAdder(),
      standardExamples,
      produced,
      attempts: 1000
    })

    expect(produced['forward-proposition']).toBeGreaterThan(0)
    const enPassantExamples = standardExamples.filter(e => {
      const endPos = e.moveObject.endPosition
      return e.priorBoard.pieceTypeAt(endPos) === Board.EMPTY
    })
    expect(enPassantExamples.length).toBeGreaterThan(0)
  })

  it('generates examples for moved_piece value less_than captured_piece', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'census',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'value', comparator: 'less_than',
      target: 'captured_piece', targetFilter: 'any'
    }])
    const standardExamples = []
    const produced = { 'forward-proposition': 0 }

    collectForwardPropositionExamples({
      combinedPlan,
      random: seededRandom(23),
      maxStandardSize: 300,
      addUnique: makeAdder(),
      standardExamples,
      produced,
      attempts: 500
    })

    expect(produced['forward-proposition']).toBeGreaterThan(0)
  })
})

describe('buildScenarioBudgets', () => {
  const mockScenario = (name, weight) => ({ name, attemptWeight: weight, buildCtxDelta: () => ({}) })
  const mockA = mockScenario('mock-a', 10)
  const mockB = mockScenario('mock-b', 10)
  const mockC = mockScenario('mock-c', 20)
  const allMocks = [mockA, mockB, mockC] // weight sum = 40

  function findBudget(result, name) {
    return result.find(r => r.scenario.name === name)?.budget
  }

  it('budgets are proportional to weights (within ceil tolerance)', () => {
    const result = buildScenarioBudgets(allMocks, 200)
    const a = findBudget(result, 'mock-a')
    const b = findBudget(result, 'mock-b')
    const c = findBudget(result, 'mock-c')
    expect(a).toBe(b)                          // equal weights → equal budgets
    expect(c).toBeGreaterThanOrEqual(2 * a - 1) // c is 2x a's weight
    expect(c).toBeLessThanOrEqual(2 * a + 1)
  })

  it('ineligible scenarios redistribute their weight to remaining eligibles', () => {
    const allResult = buildScenarioBudgets(allMocks, 200)
    const partialResult = buildScenarioBudgets([mockA, mockC], 200)
    expect(findBudget(partialResult, 'mock-a')).toBeGreaterThan(findBudget(allResult, 'mock-a'))
    expect(findBudget(partialResult, 'mock-c')).toBeGreaterThan(findBudget(allResult, 'mock-c'))
  })

  it('no eligibles: standard takes all attempts; no specials in the result', () => {
    const result = buildScenarioBudgets([], 200)
    expect(result).toHaveLength(1)
    expect(result[0].scenario.name).toBe('standard')
    expect(result[0].budget).toBe(200)
  })

  it('specialPool scales roughly linearly with totalAttempts', () => {
    const small = buildScenarioBudgets(allMocks, 100)
    const large = buildScenarioBudgets(allMocks, 1000)
    const smallC = findBudget(small, 'mock-c')
    const largeC = findBudget(large, 'mock-c')
    expect(largeC).toBeGreaterThanOrEqual(10 * smallC - 5)
    expect(largeC).toBeLessThanOrEqual(10 * smallC + 5)
  })

  it('total budget stays at or marginally above totalAttempts (ceil overflow is small)', () => {
    const result = buildScenarioBudgets(allMocks, 200)
    const total = result.reduce((s, r) => s + r.budget, 0)
    expect(total).toBeGreaterThanOrEqual(200)
    expect(total).toBeLessThanOrEqual(200 + allMocks.length)
  })
})
