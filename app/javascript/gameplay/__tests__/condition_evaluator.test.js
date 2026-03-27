import { describe, expect, it } from 'vitest'

import ConditionEvaluator from 'gameplay/condition_evaluator'

describe('ConditionEvaluator', () => {
  it('passes only the query-shaped subset of a condition node to analysis', () => {
    const queries = []
    const analysis = {
      queryValue(query) {
        queries.push(query)
        return 1
      }
    }

    const evaluator = new ConditionEvaluator()
    const conditionNode = {
      subject: 'moved_piece',
      subjectSpecifier: 'rook',
      relation: 'attacker_count',
      relationSpecifier: 'pawn',
      comparison: 'any',
      comparisonValue: null
    }

    expect(evaluator.evaluate(conditionNode, analysis)).toBe(true)
    expect(queries).toEqual([
      {
        subject: 'moved_piece',
        subjectSpecifier: 'rook',
        relation: 'attacker_count',
        relationSpecifier: 'pawn'
      }
    ])
  })

  it('defaults missing specifiers to any when building the query', () => {
    const queries = []
    const analysis = {
      queryValue(query) {
        queries.push(query)
        return 0
      }
    }

    const evaluator = new ConditionEvaluator()

    expect(
      evaluator.evaluate(
        {
          subject: 'moved_piece',
          relation: 'attacker_count',
          comparison: 'none',
          comparisonValue: null
        },
        analysis
      )
    ).toBe(true)

    expect(queries).toEqual([
      {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker_count',
        relationSpecifier: 'any'
      }
    ])
  })
})
