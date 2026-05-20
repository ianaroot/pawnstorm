import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildAttempt } from 'editorV2/panels/condition_preview/forward_proposition/build_engine'

const KNIGHT_MOVER_PAYLOAD = {
  version: 2, kind: 'census',
  subject: 'moved_piece', subjectFilter: 'knight',
  operator: 'count', comparator: 'greater_than',
  target: 'exact_number', targetTotal: 0
}

const ROOK_MOBILITY_PAYLOAD = {
  version: 2, kind: 'census',
  subject: 'allied', subjectFilter: 'rook',
  operator: 'mobility', comparator: 'less_than',
  target: 'exact_number', targetTotal: 5
}

function seededRandom(seed = 12345) {
  let current = seed >>> 0
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0
    return current / 0x100000000
  }
}

function buildResult(payload) {
  return buildAttempt(buildCombinedPlan([payload]), () => 0.1)
}

function buildResultRetrying(payloadOrPayloads, seedBase = 1, maxAttempts = 200) {
  const payloads = Array.isArray(payloadOrPayloads) ? payloadOrPayloads : [payloadOrPayloads]
  const combinedPlan = buildCombinedPlan(payloads)
  const random = seededRandom(seedBase)
  const evaluator = new ConditionEvaluatorV2()
  for (let i = 0; i < maxAttempts; i += 1) {
    const result = buildAttempt(combinedPlan, random)
    if (result === null) { continue }
    const passes = payloads.every(p => evaluator.evaluate(p, {
      board: result.priorBoard,
      moveObject: result.moveObject
    }))
    if (passes) { return result }
  }
  return null
}

function evaluatesTruthy(payloadOrPayloads, result) {
  const payloads = Array.isArray(payloadOrPayloads) ? payloadOrPayloads : [payloadOrPayloads]
  const evaluator = new ConditionEvaluatorV2()
  return payloads.every(p => evaluator.evaluate(p, {
    board: result.priorBoard,
    moveObject: result.moveObject
  }))
}

describe('buildAttempt — knight-mover smoke chain', () => {
  let result
  beforeEach(() => {
    result = buildResult(KNIGHT_MOVER_PAYLOAD)
  })

  it('returns a non-null result', () => {
    expect(result).not.toBeNull()
  })

  it('produces a priorBoard with a layOut', () => {
    expect(result.priorBoard.layOut).toBeDefined()
  })

  it('produces a legal moveObject', () => {
    expect(result.moveObject.illegal).toBeFalsy()
  })

  it('produces an example that satisfies the condition per CEv2', () => {
    expect(evaluatesTruthy(KNIGHT_MOVER_PAYLOAD, result)).toBeTruthy()
  })
})

describe('buildAttempt — rook mobility-constrained chain', () => {
  let result
  beforeEach(() => {
    result = buildResultRetrying(ROOK_MOBILITY_PAYLOAD)
  })

  it('returns a non-null result within the retry budget', () => {
    expect(result).not.toBeNull()
  })

  it('produces a legal moveObject', () => {
    expect(result.moveObject.illegal).toBeFalsy()
  })

  it('produces an example that satisfies the condition per CEv2', () => {
    expect(evaluatesTruthy(ROOK_MOBILITY_PAYLOAD, result)).toBeTruthy()
  })
})

const PIN_CHAIN_PAYLOADS = [
  {
    version: 2, kind: 'relational',
    subject: 'enemy_moved_piece', subjectFilter: 'any',
    operator: 'shield',
    target: 'enemy', targetFilter: 'king'
  },
  {
    version: 2, kind: 'census',
    subject: 'enemy_moved_piece', subjectFilter: 'any',
    operator: 'mobility', comparator: 'equal_to',
    target: 'exact_number', targetTotal: 0
  }
]

function countSuccesses(payloads, attempts = 100, seedBase = 1) {
  const combinedPlan = buildCombinedPlan(payloads)
  const evaluator = new ConditionEvaluatorV2()
  let count = 0
  for (let i = 0; i < attempts; i += 1) {
    const random = seededRandom(seedBase + i)
    const result = buildAttempt(combinedPlan, random)
    if (result === null) { continue }
    const passes = payloads.every(p => evaluator.evaluate(p, {
      board: result.priorBoard,
      moveObject: result.moveObject
    }))
    if (passes) { count += 1 }
  }
  return count
}

const MATE_CHAIN_PAYLOADS = [
  {
    version: 2, kind: 'relational',
    subject: 'allied', subjectFilter: 'any',
    operator: 'attack',
    target: 'enemy', targetFilter: 'king'
  },
  {
    version: 2, kind: 'census',
    subject: 'enemy', subjectFilter: 'any',
    operator: 'mobility', comparator: 'equal_to',
    target: 'exact_number', targetTotal: 0
  }
]

describe('buildAttempt — mate chain (allied attack enemy king + enemy mobility=0)', () => {
  it('generates at least 10 mate examples across 100 attempts', () => {
    expect(countSuccesses(MATE_CHAIN_PAYLOADS, 100)).toBeGreaterThanOrEqual(10)
  })
})

const STALEMATE_CHAIN_PAYLOADS = [
  {
    version: 2, kind: 'relational',
    subject: 'allied', subjectFilter: 'any',
    subjectComparisonMetric: 'count',
    subjectComparator: 'equal_to',
    subjectComparisonSource: 'exact_number',
    subjectComparisonSourceTotal: 0,
    operator: 'attack',
    target: 'enemy', targetFilter: 'king'
  },
  {
    version: 2, kind: 'census',
    subject: 'enemy', subjectFilter: 'any',
    operator: 'mobility', comparator: 'equal_to',
    target: 'exact_number', targetTotal: 0
  }
]

describe('buildAttempt — stalemate chain (no allied attacks enemy king + enemy mobility=0)', () => {
  it('generates at least 2 stalemate examples across 100 attempts', () => {
    expect(countSuccesses(STALEMATE_CHAIN_PAYLOADS, 100)).toBeGreaterThanOrEqual(2)
  })
})

describe('buildAttempt — pin chain (enemy_moved_piece shield enemy_king + mobility=0)', () => {
  let result
  beforeEach(() => {
    result = buildResultRetrying(PIN_CHAIN_PAYLOADS)
  })

  it('returns a non-null result within the retry budget', () => {
    expect(result).not.toBeNull()
  })

  it('produces a legal moveObject', () => {
    expect(result.moveObject.illegal).toBeFalsy()
  })

  it('produces an example that satisfies all conditions per CEv2', () => {
    expect(evaluatesTruthy(PIN_CHAIN_PAYLOADS, result)).toBeTruthy()
  })
})

describe('buildAttempt — scenario parameter', () => {
  it('returns null when the scenario delta narrows moved_piece species_set to an empty intersection', () => {
    const kingOnlyScenario = {
      name: 'king-only',
      buildCtxDelta: () => ({
        singulars: { moved_piece: { species_set: new Set([Board.KING]) } }
      })
    }
    const result = buildAttempt(buildCombinedPlan([KNIGHT_MOVER_PAYLOAD]), () => 0.1, kingOnlyScenario)
    expect(result).toBeNull()
  })
})
