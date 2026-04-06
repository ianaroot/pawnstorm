import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'

import { buildBoard, getMove, playMoveSequence } from 'gameplay/__tests__/helpers'

describe('ConditionEvaluatorV2', () => {
  it('evaluates a promoted moved_piece value against prior_board_state', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        g7: 'wP'
      }
    })

    const moveObject = getMove('g7', 'g8', board, Board.QUEEN)
    const evaluator = new ConditionEvaluatorV2()

    expect(
      evaluator.evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'any',
          verb: 'value',
          comparator: 'greater_than',
          comparisonValue: 'prior_board_state'
        },
        { board, moveObject }
      )
    ).toBe(true)
  })

  it('evaluates captured_piece_value through the unary comparison path', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e4: 'wP',
        d5: 'bN'
      }
    })

    const moveObject = getMove('e4', 'd5', board)
    const evaluator = new ConditionEvaluatorV2()

    expect(
      evaluator.evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'captured_piece',
          subjectFilter: 'any',
          verb: 'value',
          comparator: 'equal_to',
          comparisonValue: 'captured_piece_value'
        },
        { board, moveObject }
      )
    ).toBe(true)
  })

  it('runs a full real move sequence for enemy_moved_piece mobility against prior_board_state', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e2: 'wP',
        f7: 'bP'
      }
    })

    playMoveSequence(board, [
      { from: 'e2', to: 'e4' },
      { from: 'f7', to: 'f5' }
    ])

    const moveObject = getMove('e4', 'f5', board)
    const evaluator = new ConditionEvaluatorV2()

    expect(
      evaluator.evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'mobility',
          comparator: 'less_than',
          comparisonValue: 'prior_board_state'
        },
        { board, moveObject }
      )
    ).toBe(true)
  })

  it('honors explicit exclude filters in unary evaluation', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e4: 'wP',
        d5: 'bN'
      }
    })

    const moveObject = getMove('e4', 'd5', board)
    const evaluator = new ConditionEvaluatorV2()

    expect(
      evaluator.evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'captured_piece',
          subjectFilter: 'pawn',
          subjectFilterMode: 'exclude',
          verb: 'count',
          comparator: 'equal_to',
          comparisonValue: 1
        },
        { board, moveObject }
      )
    ).toBe(true)
  })
})
