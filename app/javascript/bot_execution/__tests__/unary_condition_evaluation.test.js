import { describe, expect, it } from 'vitest'

import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { buildBoard, getMove } from 'gameplay/__tests__/helpers'

function evaluate(conditionNode, board, moveObject) {
  return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
}

// After move (h2->h3) on this board:
//   wB c1 has 7 legal bishop moves: NE (d2,e3,f4,g5,h6) + NW (b2,a3)
//   wB f1 has 6 legal bishop moves: NE (g2 only, h3 blocked by allied wP) + NW (e2,d3,c4,b5,a6)
// Aggregate mobility across both bishops = 13.
function buildTwoBishopBoardAndMove() {
  const board = buildBoard({
    pieces: {
      e1: 'wK',
      e8: 'bK',
      c1: 'wB',
      f1: 'wB',
      h2: 'wP'
    }
  })
  return { board, moveObject: getMove('h2', 'h3', board) }
}

describe('unary condition evaluation — group mobility aggregation', () => {
  it('passes when target equals the SUM of both bishops\' individual mobilities (aggregate semantics)', () => {
    const { board, moveObject } = buildTwoBishopBoardAndMove()

    expect(
      evaluate(
        {
          version: 2, kind: 'census',
          subject: 'allied', subjectFilter: 'bishop',
          operator: 'mobility', comparator: 'equal_to',
          target: 'exact_number', targetTotal: 13
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('fails when target equals the mobility of just ONE bishop (rules out at-least-one and per-piece semantics)', () => {
    const { board, moveObject } = buildTwoBishopBoardAndMove()

    expect(
      evaluate(
        {
          version: 2, kind: 'census',
          subject: 'allied', subjectFilter: 'bishop',
          operator: 'mobility', comparator: 'equal_to',
          target: 'exact_number', targetTotal: 7
        },
        board, moveObject
      )
    ).toBe(false)
  })
})
