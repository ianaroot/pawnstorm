import { describe, expect, it } from 'vitest'

import ConditionEvaluator from 'bot_execution/condition_evaluator'

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
        subjectSpecifierMode: 'include',
        relation: 'attacker',
        relationSpecifier: 'pawn',
        relationSpecifierMode: 'include'
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
        subjectSpecifierMode: 'include',
        relation: 'attacker',
        relationSpecifier: 'any',
        relationSpecifierMode: 'include'
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
          subjectSpecifierMode: 'include',
          relation: 'attacker',
          relationSpecifier: 'pawn',
          relationSpecifierMode: 'include'
        },
        'after'
      ],
      [
        {
          subject: 'moved_piece',
          subjectSpecifier: 'rook',
          subjectSpecifierMode: 'include',
          relation: 'attacker',
          relationSpecifier: 'pawn',
          relationSpecifierMode: 'include'
        },
        'prior'
      ]
    ])
  })

  it('passes explicit include/exclude specifier modes through to analysis', () => {
    const queries = []
    const analysis = {
      queryValue(query) {
        queries.push(query)
        return 1
      }
    }

    const evaluator = new ConditionEvaluator()

    expect(
      evaluator.evaluate(
        {
          subject: 'captured_piece',
          subjectSpecifier: 'pawn',
          subjectSpecifierMode: 'exclude',
          relation: 'count',
          relationSpecifier: 'moved_piece',
          relationSpecifierMode: 'exclude',
          comparison: 'greater_than',
          comparisonValue: 0
        },
        analysis
      )
    ).toBe(true)

    expect(queries).toEqual([
      {
        subject: 'captured_piece',
        subjectSpecifier: 'pawn',
        subjectSpecifierMode: 'exclude',
        relation: 'count',
        relationSpecifier: 'moved_piece',
        relationSpecifierMode: 'exclude'
      }
    ])
  })

  it('dispatches version 2 condition nodes to the V2 evaluator', () => {
    const analysis = {}
    const v2 = {
      evaluate(node, passedAnalysis) {
        expect(node).toEqual({
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'queen',
          verb: 'count',
          comparator: 'greater_than',
          comparisonValue: 0
        })
        expect(passedAnalysis).toBe(analysis)
        return true
      }
    }

    const evaluator = new ConditionEvaluator({ v2 })

    expect(
      evaluator.evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'queen',
          verb: 'count',
          comparator: 'greater_than',
          comparisonValue: 0
        },
        analysis
      )
    ).toBe(true)
  })
})
