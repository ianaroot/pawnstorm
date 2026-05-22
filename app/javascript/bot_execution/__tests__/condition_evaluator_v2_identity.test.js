import { describe, expect, it } from 'vitest'

import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'

import { buildBoard, getMove, playMoveSequence } from 'gameplay/__tests__/helpers'

// identity asserts piece-equivalence across forward, reversed, and en-passant
// captures.

function evaluate(conditionNode, board, moveObject) {
  return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
}

describe('CEv2 identity evaluation', () => {
  function forwardScenario() {
    const board = buildBoard({ pieces: { e1: 'wK', e8: 'bK', e2: 'wP', f7: 'bP' } })
    playMoveSequence(board, [
      { from: 'e2', to: 'e4' },
      { from: 'f7', to: 'f5' }
    ])
    return { board, moveObject: getMove('e4', 'f5', board) }
  }

  it('is true when the current move captures the enemy moved piece', () => {
    const { board, moveObject } = forwardScenario()

    expect(
      evaluate(
        { version: 2, kind: 'identity', subject: 'enemy_moved_piece', target: 'captured_piece' },
        board, moveObject
      )
    ).toBe(true)
  })

  it('is true in the reversed subject/target direction', () => {
    const { board, moveObject } = forwardScenario()

    expect(
      evaluate(
        { version: 2, kind: 'identity', subject: 'captured_piece', target: 'enemy_moved_piece' },
        board, moveObject
      )
    ).toBe(true)
  })

  it('is true for an en passant capture of the enemy moved piece', () => {
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

    expect(
      evaluate(
        { version: 2, kind: 'identity', subject: 'enemy_moved_piece', target: 'captured_piece' },
        board, moveObject
      )
    ).toBe(true)
  })
})
