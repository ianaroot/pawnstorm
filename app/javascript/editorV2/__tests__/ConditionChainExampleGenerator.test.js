import { describe, expect, it } from 'vitest'

import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import generateConditionExamples from '../panels/condition_preview_generation/index'

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

describe('ConditionChainExampleGenerator', () => {
  it('builds examples that satisfy every payload in a relational AND chain', () => {
    const payloads = [
      {
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'allied',
        targetFilter: 'pawn'
      },
      {
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'allied',
        targetFilter: 'any'
      }
    ]

    const preview = generateConditionExamples(payloads, { random: seededRandom(31) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      payloads.forEach(payload => {
        expect(evaluateExample(payload, example)).toBe(true)
      })
    })
  })

  it('generates examples for a single unary condition', () => {
    const payload = {
      kind: 'unary',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 0
    }

    const preview = generateConditionExamples([payload], { random: seededRandom(31) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
    })
  })
})
