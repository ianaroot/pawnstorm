import { describe, expect, it } from 'vitest'

import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import generateConditionExamples from '../panels/condition_preview/orchestrator'

// NEW-TDD-RED: end-to-end efficacy. These assert the whole condition_preview
// pipeline can produce legal, satisfying examples for region-constrained
// census conditions compared against prior_board_state — the hardest cell
// (the "cart"): census must be a supported plan, regionFromPlan must carry
// the spatial region into both frames, and the cross-frame generator must
// force the prior/after delta to land inside the region. Expected to FAIL
// until both the evaluator restructure and the generator fix land.

function seededRandom(seed = 12345) {
  let current = seed >>> 0
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0
    return current / 0x100000000
  }
}

function evaluateExample(payload, example) {
  const evaluator = new ConditionEvaluatorV2()
  return evaluator.evaluate(payload, {
    board: example.priorBoard,
    moveObject: example.moveObject
  })
}

describe('condition_preview generates region-constrained PBS census examples (NEW-TDD-RED)', () => {
  it('generates satisfying examples for an increasing single-rank census against prior_board_state', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'allied', subjectFilter: 'rook',
      subjectFilterMode: 'include',
      positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5,
      operator: 'count', comparator: 'greater_than', target: 'prior_board_state'
    }

    const preview = generateConditionExamples([payload], { random: seededRandom(31) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
    })
  })

  it('generates satisfying examples for a decreasing single-file census against prior_board_state', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'enemy', subjectFilter: 'any',
      positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 4,
      operator: 'count', comparator: 'less_than', target: 'prior_board_state'
    }

    const preview = generateConditionExamples([payload], { random: seededRandom(53) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
    })
  })
})
