import { describe, expect, it } from 'vitest'

import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'

import { buildBoard, getMove, playMoveSequence } from 'gameplay/__tests__/helpers'

// NEW-TDD-RED: the identity kind does not exist in CEv2 yet (the kind switch
// only knows unary | relational | position; anything else throws
// "Unknown V2 condition kind"). Every `identity` evaluation below is expected
// to FAIL until the same_piece extraction lands.
//
// Each case also evaluates the equivalent same_piece relational on the SAME
// board/move. Those legacy assertions are regression baselines and must stay
// GREEN — a failing legacy assertion is UNEXPECTED, not a missing-feature red.

function evaluate(conditionNode, board, moveObject) {
  return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
}

describe('CEv2 identity ≡ same_piece relational (NEW-TDD-RED)', () => {
  function forwardScenario() {
    const board = buildBoard({ pieces: { e1: 'wK', e8: 'bK', e2: 'wP', f7: 'bP' } })
    playMoveSequence(board, [
      { from: 'e2', to: 'e4' },
      { from: 'f7', to: 'f5' }
    ])
    return { board, moveObject: getMove('e4', 'f5', board) }
  }

  it('matches the same_piece relational result when the current move captures the enemy moved piece', () => {
    const { board, moveObject } = forwardScenario()

    const relationalResult = evaluate(
      {
        version: 2, kind: 'relational',
        subject: 'enemy_moved_piece', subjectFilter: 'any',
        operator: 'same_piece', target: 'captured_piece', targetFilter: 'any'
      },
      board, moveObject
    )
    expect(relationalResult).toBe(true)

    expect(
      evaluate(
        { version: 2, kind: 'identity', subject: 'enemy_moved_piece', target: 'captured_piece' },
        board, moveObject
      )
    ).toBe(relationalResult)
  })

  it('matches the same_piece relational result in the reversed subject/target direction', () => {
    const { board, moveObject } = forwardScenario()

    const relationalResult = evaluate(
      {
        version: 2, kind: 'relational',
        subject: 'captured_piece', subjectFilter: 'any',
        operator: 'same_piece', target: 'enemy_moved_piece', targetFilter: 'any'
      },
      board, moveObject
    )
    expect(relationalResult).toBe(true)

    expect(
      evaluate(
        { version: 2, kind: 'identity', subject: 'captured_piece', target: 'enemy_moved_piece' },
        board, moveObject
      )
    ).toBe(relationalResult)
  })

  it('matches the same_piece relational result for an en passant capture of the enemy moved piece', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', a7: 'bP', e2: 'wP', f7: 'bP' }
    })
    playMoveSequence(board, [
      { from: 'e2', to: 'e4' },
      { from: 'a7', to: 'a6' },
      { from: 'e4', to: 'e5' },
      { from: 'f7', to: 'f5' }
    ])
    const moveObject = getMove('e5', 'f6', board)

    const relationalResult = evaluate(
      {
        version: 2, kind: 'relational',
        subject: 'enemy_moved_piece', subjectFilter: 'any',
        operator: 'same_piece', target: 'captured_piece', targetFilter: 'any'
      },
      board, moveObject
    )
    expect(relationalResult).toBe(true)

    expect(
      evaluate(
        { version: 2, kind: 'identity', subject: 'enemy_moved_piece', target: 'captured_piece' },
        board, moveObject
      )
    ).toBe(relationalResult)
  })
})
