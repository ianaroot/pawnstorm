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
      relation: 'attacker',
      relationSpecifier: 'pawn',
      comparison: 'greater_than',
      comparisonValue: 0
    }

    expect(evaluator.evaluate(conditionNode, analysis)).toBe(true)
    expect(queries).toEqual([
      {
        subject: 'moved_piece',
        subjectSpecifier: 'rook',
        relation: 'attacker',
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
          relation: 'attacker',
          comparison: 'equal_to',
          comparisonValue: 0
        },
        analysis
      )
    ).toBe(true)

    expect(queries).toEqual([
      {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any'
      }
    ])
  })

  it('resolves moved_piece_value through analysis for numeric comparisons', () => {
    const analysis = {
      queryValue() {
        return 5
      },
      movedPieceValue() {
        return 3
      }
    }

    const evaluator = new ConditionEvaluator()

    expect(
      evaluator.evaluate(
        {
          subject: 'moved_piece',
          relation: 'attacker',
          comparison: 'greater_than',
          comparisonValue: 'moved_piece_value'
        },
        analysis
      )
    ).toBe(true)
  })

  it('resolves captured_piece_value through analysis for numeric comparisons', () => {
    const analysis = {
      queryValue() {
        return 5
      },
      capturedPieceValue() {
        return 9
      }
    }

    const evaluator = new ConditionEvaluator()

    expect(
      evaluator.evaluate(
        {
          subject: 'moved_piece',
          relation: 'attacker',
          comparison: 'less_than',
          comparisonValue: 'captured_piece_value'
        },
        analysis
      )
    ).toBe(true)
  })

  it('resolves prior_board_state by re-running the same query against the prior board scope', () => {
    const queries = []
    const analysis = {
      queryValue(query, boardScope) {
        queries.push([query, boardScope])
        return boardScope === 'after' ? 3 : 1
      }
    }

    const evaluator = new ConditionEvaluator()
    const conditionNode = {
      subject: 'moved_piece',
      subjectSpecifier: 'rook',
      relation: 'attacker',
      relationSpecifier: 'pawn',
      comparison: 'greater_than',
      comparisonValue: 'prior_board_state'
    }

    expect(evaluator.evaluate(conditionNode, analysis)).toBe(true)
    expect(queries).toEqual([
      [
        {
          subject: 'moved_piece',
          subjectSpecifier: 'rook',
          relation: 'attacker',
          relationSpecifier: 'pawn'
        },
        'after'
      ],
      [
        {
          subject: 'moved_piece',
          subjectSpecifier: 'rook',
          relation: 'attacker',
          relationSpecifier: 'pawn'
        },
        'prior'
      ]
    ])
  })
})
