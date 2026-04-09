import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import CandidateMoveAnalysis from 'gameplay/candidate_move_analysis'
import ConditionEvaluator from 'gameplay/condition_evaluator'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'

import { buildBoard, getMove, playMoveSequence } from 'gameplay/__tests__/helpers'

describe('ConditionEvaluatorV2', () => {
  function evaluate(conditionNode, board, moveObject) {
    return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
  }

  function evaluateV1(conditionNode, board, moveObject) {
    const analysis = new CandidateMoveAnalysis({ board, moveObject })
    return new ConditionEvaluator().evaluate(conditionNode, analysis)
  }

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
          operator: 'value',
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
          operator: 'value',
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
          operator: 'mobility',
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
          operator: 'count',
          comparator: 'equal_to',
          comparisonValue: 1
        },
        { board, moveObject }
      )
    ).toBe(true)
  })

  describe('relational evaluation', () => {
    it('returns true when a relational node with no comparison blocks has at least one pair', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns false when a relational node with no comparison blocks has no pairs', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          a2: 'wP',
          h7: 'bB'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('uses a subject-only comparison block as the full truth condition when it passes', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonValue: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('uses a subject-only comparison block as the full truth condition when it fails', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            subjectComparisonMetric: 'count',
            subjectComparator: 'greater_than',
            subjectComparisonValue: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('lets a subject-only zero comparison pass on an empty relation', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          a2: 'wP',
          h7: 'bB'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonValue: 0,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('lets a subject-only zero comparison fail on an empty relation when the comparator demands more', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          a2: 'wP',
          h7: 'bB'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'count',
            subjectComparator: 'greater_than',
            subjectComparisonValue: 0,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('uses a target-only comparison block as the full truth condition when it passes', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonValue: 2
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('uses a target-only comparison block as the full truth condition when it fails', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonValue: 2
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('lets a target-only zero comparison pass on an empty relation', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          a2: 'wP',
          h7: 'bB'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'queen',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonValue: 0
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('lets a target-only zero comparison fail on an empty relation when the comparator demands more', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          a2: 'wP',
          h7: 'bB'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'queen',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonValue: 0
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('requires both comparison blocks to pass when both are present', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonValue: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonValue: 2
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('fails when the subject comparison block fails and the target comparison block passes', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            subjectComparisonMetric: 'count',
            subjectComparator: 'greater_than',
            subjectComparisonValue: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonValue: 2
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('fails when the target comparison block fails and the subject comparison block passes', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonValue: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonValue: 2
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('fails when both comparison blocks fail', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          g4: 'bN',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            subjectComparisonMetric: 'count',
            subjectComparator: 'greater_than',
            subjectComparisonValue: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonValue: 2
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('passes a subject-side prior_board_state comparison when the moved piece creates a new attack', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP',
          d5: 'bB'
        }
      })

      const moveObject = getMove('e2', 'e4', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'any',
            subjectComparisonMetric: 'count',
            subjectComparator: 'greater_than',
            subjectComparisonValue: 'prior_board_state',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('fails a subject-side prior_board_state comparison when the moved piece creates a new attack', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP',
          d5: 'bB'
        }
      })

      const moveObject = getMove('e2', 'e4', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'any',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonValue: 'prior_board_state',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('passes a target-side prior_board_state comparison when the moved piece creates a new attack', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP',
          d5: 'bB'
        }
      })

      const moveObject = getMove('e2', 'e4', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'any',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonValue: 'prior_board_state'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('fails a target-side prior_board_state comparison when the moved piece creates a new attack', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP',
          d5: 'bB'
        }
      })

      const moveObject = getMove('e2', 'e4', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'any',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonValue: 'prior_board_state'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('runs a full real move sequence for a target-side prior_board_state comparison against enemy_moved_piece', () => {
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

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'attack',
            target: 'enemy_moved_piece',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'less_than',
            targetComparisonValue: 'prior_board_state'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })
  })

  describe('same_piece evaluation', () => {
    it('returns true when the current move captures the enemy moved piece', () => {
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

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy_moved_piece',
            subjectFilter: 'any',
            operator: 'same_piece',
            target: 'captured_piece',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns true in the reversed same_piece direction when the current move captures the enemy moved piece', () => {
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

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'captured_piece',
            subjectFilter: 'any',
            operator: 'same_piece',
            target: 'enemy_moved_piece',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns true for en passant when the captured pawn is the enemy moved piece', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          a7: 'bP',
          e2: 'wP',
          f7: 'bP'
        }
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
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy_moved_piece',
            subjectFilter: 'any',
            operator: 'same_piece',
            target: 'captured_piece',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns false when the current move is not a capture', () => {
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

      const moveObject = getMove('e4', 'e5', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy_moved_piece',
            subjectFilter: 'any',
            operator: 'same_piece',
            target: 'captured_piece',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('returns false when the current move captures a different piece', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP',
          d5: 'bN',
          f7: 'bP'
        }
      })

      playMoveSequence(board, [
        { from: 'e2', to: 'e4' },
        { from: 'f7', to: 'f5' }
      ])

      const moveObject = getMove('e4', 'd5', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy_moved_piece',
            subjectFilter: 'any',
            operator: 'same_piece',
            target: 'captured_piece',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('returns false when the current move captures a different piece of the same species', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e4: 'wP',
          d5: 'bP',
          f5: 'bP'
        }
      })
      board.recentMoveContext = {
        moveObject: { startPosition: 53, endPosition: 37 },
        movingTeam: Board.BLACK,
        movedPieceStartPosition: 53,
        movedPieceEndPosition: 37,
        movedPieceSpeciesBeforeMove: Board.PAWN,
        movedPieceSpeciesAfterMove: Board.PAWN,
        capturedPiecePosition: null,
        capturedPieceTeam: null,
        capturedPieceSpecies: null
      }

      const moveObject = getMove('e4', 'd5', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy_moved_piece',
            subjectFilter: 'any',
            operator: 'same_piece',
            target: 'captured_piece',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })
  })

  describe('v1 shield/cover equivalence', () => {
    it('matches v1 shielder > 0 with plain v2 shield existence', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e1: 'wK',
          e8: 'bR',
          a8: 'bK'
        }
      })

      const moveObject = getMove('d3', 'e3', board)

      const v1Condition = {
        subject: 'allies',
        subjectSpecifier: 'king',
        relation: 'shielder',
        relationSpecifier: 'moved_piece',
        comparison: 'greater_than',
        comparisonValue: 0
      }

      const v2Condition = {
        version: 2,
        kind: 'relational',
        subject: 'moved_piece',
        subjectFilter: 'any',
        operator: 'shield',
        target: 'allied',
        targetFilter: 'king'
      }

      expect(evaluateV1(v1Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(evaluateV1(v1Condition, board, moveObject))
    })

    it('matches v1 shielder = 0 with a target-side zero comparison in v2 shield', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e1: 'wK',
          g8: 'bN',
          a8: 'bK'
        }
      })

      const moveObject = getMove('d3', 'e3', board)

      const v1Condition = {
        subject: 'allies',
        subjectSpecifier: 'king',
        relation: 'shielder',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }

      const v2Condition = {
        version: 2,
        kind: 'relational',
        subject: 'moved_piece',
        subjectFilter: 'any',
        operator: 'shield',
        target: 'allied',
        targetFilter: 'king',
        targetComparisonMetric: 'count',
        targetComparator: 'equal_to',
        targetComparisonValue: 0
      }

      expect(evaluateV1(v1Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(evaluateV1(v1Condition, board, moveObject))
    })

    it('matches v1 coverer > 0 with plain v2 cover existence', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wR',
          a2: 'wP',
          e1: 'wK',
          a8: 'bR',
          h8: 'bK'
        }
      })

      const moveObject = getMove('e1', 'e2', board)

      const v1Condition = {
        subject: 'allies',
        subjectSpecifier: 'rook',
        relation: 'coverer',
        relationSpecifier: 'pawn',
        comparison: 'greater_than',
        comparisonValue: 0
      }

      const v2Condition = {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'cover',
        target: 'allied',
        targetFilter: 'rook'
      }

      expect(evaluateV1(v1Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(evaluateV1(v1Condition, board, moveObject))
    })

    it('matches v1 covered = 0 with a target-side zero comparison in v2 cover', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          a8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e3', board)

      const v1Condition = {
        subject: 'allies',
        subjectSpecifier: 'king',
        relation: 'covered',
        relationSpecifier: 'pawn',
        comparison: 'equal_to',
        comparisonValue: 0
      }

      const v2Condition = {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'cover',
        target: 'allied',
        targetFilter: 'king',
        targetComparisonMetric: 'count',
        targetComparator: 'equal_to',
        targetComparisonValue: 0
      }

      expect(evaluateV1(v1Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(evaluateV1(v1Condition, board, moveObject))
    })
  })

  describe('v2 cover semantics', () => {
    it('does not count the reverse direction as cover', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          a8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'pawn',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(false)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'king'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('does not count cover when the blocked side of the board contains only allies and empty squares', () => {
      const board = buildBoard({
        pieces: {
          a3: 'wP',
          a2: 'wR',
          e1: 'wK',
          a8: 'bK'
        }
      })

      const moveObject = getMove('e1', 'e2', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'rook'
          },
          board,
          moveObject
        )
      ).toBe(false)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'pawn'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('does not count a diagonal pawn as cover for a rook when no opposing slider can access that side', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wR',
          b2: 'wP',
          e1: 'wK',
          h8: 'bK'
        }
      })

      const moveObject = getMove('e1', 'e2', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'rook'
          },
          board,
          moveObject
        )
      ).toBe(false)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'pawn'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('counts a forward pawn as cover for a rook when an opposing rook can access that file', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wR',
          a2: 'wP',
          e1: 'wK',
          a8: 'bR',
          h8: 'bK'
        }
      })

      const moveObject = getMove('e1', 'e2', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'rook'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('counts a diagonal pawn as cover for a rook when an opposing bishop can access that side', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wR',
          b2: 'wP',
          e1: 'wK',
          f8: 'bB',
          h8: 'bK'
        }
      })

      const moveObject = getMove('e1', 'e2', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'rook'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('does not increase king cover when a move only opens a remote latent slider route', () => {
      const board = buildBoard({
        pieces: {
          e8: 'bK',
          f7: 'bP',
          g4: 'bN',
          d1: 'wQ',
          a1: 'wK'
        },
        allowedToMove: Board.BLACK
      })

      const moveObject = getMove('g4', 'f6', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'any',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'king',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonValue: 'prior_board_state'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('does not count cover when the only attacker route reaches the ray by capturing the cover piece', () => {
      const board = buildBoard({
        pieces: {
          g1: 'wK',
          h2: 'wP',
          a2: 'wP',
          f4: 'bQ',
          a8: 'bK'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'king',
            boardScope: 'prior'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('counts shields as a subset of covers', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e1: 'wK',
          e8: 'bR',
          a8: 'bK'
        }
      })

      const moveObject = getMove('d3', 'e3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'any',
            operator: 'cover',
            target: 'allied',
            targetFilter: 'king'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })
  })
})
