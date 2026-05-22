import { describe, expect, it } from 'vitest'

import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { buildBoard, getMove } from 'gameplay/__tests__/helpers'

function evaluate(conditionNode, board, moveObject) {
  return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
}

const ALLIED_INDIVIDUAL_VALUE_GT_5_ATTACK_ENEMY_KING = {
  version: 2,
  kind: 'relational',
  subject: 'allied',
  subjectFilter: 'any',
  subjectComparisonMetric: 'individual_value',
  subjectComparator: 'greater_than',
  subjectComparisonSource: 'exact_number',
  subjectComparisonSourceTotal: 5,
  operator: 'attack',
  target: 'enemy',
  targetFilter: 'king'
}

describe('relational condition evaluation — individual_value multiplicity', () => {
  it('passes when one queen attacks the enemy king', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h8: 'bK',
        h1: 'wQ',
        a2: 'wP'
      }
    })
    const moveObject = getMove('a2', 'a3', board)

    expect(evaluate(ALLIED_INDIVIDUAL_VALUE_GT_5_ATTACK_ENEMY_KING, board, moveObject)).toBe(true)
  })

  it('passes when two queens both attack the enemy king', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h8: 'bK',
        h1: 'wQ',
        a8: 'wQ',
        b2: 'wP'
      }
    })
    const moveObject = getMove('b2', 'b3', board)

    expect(evaluate(ALLIED_INDIVIDUAL_VALUE_GT_5_ATTACK_ENEMY_KING, board, moveObject)).toBe(true)
  })
})
