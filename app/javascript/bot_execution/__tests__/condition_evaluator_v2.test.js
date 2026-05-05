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
          target: 'prior_board_state'
        },
        { board, moveObject }
      )
    ).toBe(true)
  })

  it('evaluates captured_piece targets through the unary comparison path', () => {
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
          target: 'captured_piece',
          targetFilter: 'any'
        },
        { board, moveObject }
      )
    ).toBe(true)
  })

  it('does not compare moved king value as an individual source', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e2: 'wP'
      }
    })

    const moveObject = getMove('e1', 'f1', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'king',
          operator: 'value',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  it('does not let empty value totals tie an individual moved king comparison source', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        h2: 'wP',
        a7: 'bP'
      }
    })

    const moveObject = getMove('e1', 'f1', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'relational',
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'any',
          targetComparisonMetric: 'individual_value',
          targetComparator: 'greater_than_or_equal_to',
          targetComparisonSource: 'moved_piece'
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  it('fails enemy_moved_piece mobility against prior_board_state when the current move captures it', () => {
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
          target: 'prior_board_state'
        },
        { board, moveObject }
      )
    ).toBe(false)
  })

  it('keeps enemy_moved_piece count resolved after the current move captures it', () => {
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
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          operator: 'count',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 1
        },
        board,
        moveObject
      )
    ).toBe(true)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          operator: 'count',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  it('keeps enemy_moved_piece value resolved after the current move captures it', () => {
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
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          operator: 'value',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 1
        },
        board,
        moveObject
      )
    ).toBe(true)
  })

  it('fails enemy_moved_piece mobility when the current move captures it', () => {
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
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          operator: 'mobility',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  it('applies exclude filters to enemy_moved_piece identity after the current move captures it', () => {
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
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'knight',
          subjectFilterMode: 'exclude',
          operator: 'count',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 1
        },
        board,
        moveObject
      )
    ).toBe(true)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          subjectFilterMode: 'exclude',
          operator: 'count',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
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
          target: 'exact_number',
          targetTotal: 1
        },
        { board, moveObject }
      )
    ).toBe(true)
  })

  it('allows singular count queries to pass when the actor misses the piece filter', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d2: 'wQ'
      }
    })

    const moveObject = getMove('d2', 'd3', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'knight',
          operator: 'count',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
      )
    ).toBe(true)
  })

  it('fails singular mobility queries when the actor misses the piece filter', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d2: 'wQ'
      }
    })

    const moveObject = getMove('d2', 'd3', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'knight',
          operator: 'mobility',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  it('fails singular value queries when the actor misses the piece filter', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d2: 'wQ'
      }
    })

    const moveObject = getMove('d2', 'd3', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'knight',
          operator: 'value',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 3
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  it('allows captured piece count queries to pass when no matching piece was captured', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e2: 'wP'
      }
    })

    const moveObject = getMove('e2', 'e3', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'captured_piece',
          subjectFilter: 'queen',
          operator: 'count',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
      )
    ).toBe(true)
  })

  it('allows unfiltered captured piece value queries to return zero when no piece was captured', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e2: 'wP'
      }
    })

    const moveObject = getMove('e2', 'e3', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'captured_piece',
          subjectFilter: 'any',
          operator: 'value',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 0
        },
        board,
        moveObject
      )
    ).toBe(true)
  })

  it('fails filtered captured piece value queries when no matching piece was captured', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e2: 'wP'
      }
    })

    const moveObject = getMove('e2', 'e3', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'captured_piece',
          subjectFilter: 'queen',
          operator: 'value',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 9
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  it('passes filtered captured piece value queries when the matching piece was captured', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e4: 'wP',
        d5: 'bQ'
      }
    })

    const moveObject = getMove('e4', 'd5', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'captured_piece',
          subjectFilter: 'queen',
          operator: 'value',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 9
        },
        board,
        moveObject
      )
    ).toBe(true)
  })

  it('fails filtered captured piece value queries when a different piece was captured', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e4: 'wP',
        d5: 'bN'
      }
    })

    const moveObject = getMove('e4', 'd5', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'unary',
          subject: 'captured_piece',
          subjectFilter: 'queen',
          operator: 'value',
          comparator: 'equal_to',
          target: 'exact_number',
          targetTotal: 9
        },
        board,
        moveObject
      )
    ).toBe(false)
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

    it('fails when the singular subject actor misses the piece filter', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          g1: 'wN',
          a1: 'wR'
        }
      })

      const moveObject = getMove('g1', 'f3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'king',
            operator: 'adjacent',
            target: 'allied',
            targetFilter: 'rook',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('fails when the singular target actor misses the piece filter', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          g1: 'wN',
          e4: 'bP'
        }
      })

      const moveObject = getMove('g1', 'f3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy',
            subjectFilter: 'pawn',
            operator: 'attack',
            target: 'moved_piece',
            targetFilter: 'king',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('preserves collection zero-count behavior when no collection subjects match', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          a2: 'wP',
          d5: 'bR'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'queen',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'rook',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('honors subject exclude filters when the remaining subject can still make the relation true', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          c2: 'wP',
          d7: 'bB'
        }
      })

      const moveObject = getMove('c2', 'c3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            subjectFilterMode: 'exclude',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('honors subject exclude filters when excluding the only matching subject makes the relation false', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wP',
          d7: 'bB'
        }
      })

      const moveObject = getMove('d4', 'd5', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            subjectFilterMode: 'exclude',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'bishop'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('honors target exclude filters when the remaining target can still satisfy the relation', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bB',
          d8: 'bP'
        }
      })

      const moveObject = getMove('d4', 'd5', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'pawn',
            targetFilterMode: 'exclude'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('honors target exclude filters when excluding the only matching target makes the relation false', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          d4: 'wR',
          d7: 'bP'
        }
      })

      const moveObject = getMove('d4', 'd5', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'rook',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'pawn',
            targetFilterMode: 'exclude'
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('excludes king from individual_value pair filter leaving only pawn pairs', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wK',
          h8: 'bK',
          d4: 'wP',
          h2: 'wP',
          e5: 'bN'
        }
      })

      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'any',
            subjectComparisonMetric: 'individual_value',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'knight'
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('fails a subject-side value comparison against captured_piece when the moved piece attacks no enemies', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d4: 'wR',
          d5: 'bP'
        }
      })

      const moveObject = getMove('d4', 'd5', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'any',
            subjectComparisonMetric: 'individual_value',
            subjectComparator: 'less_than',
            subjectComparisonSource: 'captured_piece',
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 0,
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 0,
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
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
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
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
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
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns true when enemy pawns only attack allied pieces with individual_value >= 9 and count=0 with individual_value<9 on target', () => {
      // "enemy pawn count=0 attacks allied individual_value<9"
      // bP on e5 attacks wQ on d4 (value=9). individual_value<9 excludes the queen.
      // Filtered pairs = [] → count of enemy pawns = 0 → 0==0 → true.
      const board = buildBoard({
        pieces: {
          g1: 'wK',
          g8: 'bK',
          e5: 'bP',
          d4: 'wQ',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy',
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 0,
            operator: 'attack',
            target: 'allied',
            targetFilter: 'any',
            targetComparisonMetric: 'individual_value',
            targetComparator: 'less_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 9
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns false for count=0 individual_value<9 when enemy pawn attacks an allied piece with value<9', () => {
      const board = buildBoard({
        pieces: {
          g1: 'wK',
          g8: 'bK',
          e5: 'bP',
          d4: 'wR',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'enemy',
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 0,
            operator: 'attack',
            target: 'allied',
            targetFilter: 'any',
            targetComparisonMetric: 'individual_value',
            targetComparator: 'less_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 9
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('returns true for aggregate_value when sum of attacked pieces exceeds threshold', () => {
      // wR on d4 attacks bQ on d7 (9) and bN on g4 (3). Sum = 12 > 8.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d4: 'wR',
          d7: 'bQ',
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
            targetComparisonMetric: 'aggregate_value',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 8
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns false for aggregate_value when sum of attacked pieces does not exceed threshold', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d4: 'wR',
          d7: 'bQ',
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
            targetComparisonMetric: 'aggregate_value',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 15
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('does not double-count a single subject that participates in multiple pairs when computing subject aggregate_value', () => {
      // wP e4 attacks bN d5 and bB f5 — one pawn, two enemies. Pairs: (e4,d5), (e4,f5).
      // Aggregate over unique subject positions = value(wP) = 1, not 1+1=2.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e4: 'wP',
          d5: 'bN',
          f5: 'bB',
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
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'aggregate_value',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 2,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('counts each unique subject once when multiple pairs share subjects with multiple targets', () => {
      // wP a4 attacks bR b5; wP e4 attacks bN d5 and bB f5.
      // Pairs: (a4,b5), (e4,d5), (e4,f5). Unique subjects: {a4, e4}. Aggregate = 1+1 = 2.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          a4: 'wP',
          b5: 'bR',
          e4: 'wP',
          d5: 'bN',
          f5: 'bB',
          h2: 'wP'
        }
      })

      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'relational',
            subject: 'allied',
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'aggregate_value',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 2,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('does not double-count a single target that is attacked by multiple subjects when computing target aggregate_value', () => {
      // wP c4 and wP e4 both attack bN d5. Pairs: (c4,d5), (e4,d5).
      // Aggregate over unique target positions = value(bN) = 3, not 3+3=6.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          c4: 'wP',
          e4: 'wP',
          d5: 'bN',
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
            subjectFilter: 'pawn',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'aggregate_value',
            targetComparator: 'equal_to',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 3
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns true for count+aggregate_value combinatorial when two pawns combined attacked value exceeds threshold', () => {
      // wP c5 attacks bR d6 (5), wP f5 attacks bR e6 (5). Both groups sum 5.
      // Find 2 groups with combined sum > 8: 5+5=10 > 8 → true.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          c5: 'wP',
          f5: 'wP',
          d6: 'bR',
          e6: 'bR',
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
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 2,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'aggregate_value',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 8
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns false for count+aggregate_value combinatorial when no two groups combined exceed threshold', () => {
      // wP c5 attacks bN d6 (3), wP f5 attacks bN e6 (3). Best 2: 3+3=6, not > 8.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h8: 'bK',
          c5: 'wP',
          f5: 'wP',
          d6: 'bN',
          e6: 'bN',
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
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 2,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'aggregate_value',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 8
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('returns true for count+aggregate_value when a valid 2-group subset exists even if full set does not', () => {
      // wP b5→bN c6(3), wP e5→bR d6(5), wP g5→bR h6(5).
      // b5+e5=8 (not >8), b5+g5=8 (not >8), e5+g5=10 >8 → true.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          a8: 'bK',
          b5: 'wP',
          e5: 'wP',
          g5: 'wP',
          c6: 'bN',
          d6: 'bR',
          h6: 'bR',
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
            subjectFilter: 'pawn',
            subjectComparisonMetric: 'count',
            subjectComparator: 'equal_to',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 2,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'aggregate_value',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 8
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns true for individual_value+individual_value when a pair satisfies both filters', () => {
      // wP (value=1) attacks bN (value=3). subject individual_value<3 and target individual_value>2 both pass.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d4: 'wP',
          e5: 'bN',
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
            subjectFilter: 'any',
            subjectComparisonMetric: 'individual_value',
            subjectComparator: 'less_than',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 3,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'individual_value',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('returns false for individual_value+individual_value when no pair satisfies both filters', () => {
      // wR (value=5) attacks bN (value=3). subject individual_value<3 fails for the rook.
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d4: 'wR',
          d7: 'bN',
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
            subjectFilter: 'any',
            subjectComparisonMetric: 'individual_value',
            subjectComparator: 'less_than',
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 3,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'individual_value',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
          },
          board,
          moveObject
        )
      ).toBe(false)
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
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'equal_to',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
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
            subjectComparisonSource: 'exact_number',
            subjectComparisonSourceTotal: 1,
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 2
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
            subjectComparisonSource: 'prior_board_state',
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
            subjectComparisonSource: 'prior_board_state',
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
            targetComparisonSource: 'prior_board_state'
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
            targetComparisonSource: 'prior_board_state'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('fails a target-side prior_board_state comparison against enemy_moved_piece when the current move captures it', () => {
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
            targetComparisonSource: 'prior_board_state'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('passes a target-side prior_board_state comparison when the enemy moved piece remains relationally comparable', () => {
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
            subject: 'allied',
            subjectFilter: 'pawn',
            operator: 'attack',
            target: 'enemy_moved_piece',
            targetFilter: 'any',
            targetComparisonMetric: 'count',
            targetComparator: 'less_than',
            targetComparisonSource: 'prior_board_state'
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('passes a target-side prior_board_state comparison when a moved piece creates a new relation', () => {
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
            targetComparisonSource: 'prior_board_state'
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

  describe('position evaluation', () => {
    it('passes allied count on rank using moving team perspective', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          c5: 'wN',
          d6: 'wB',
          h2: 'wP'
        }
      })
      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'allied',
            subjectFilter: 'any',
            positionAxis: 'rank',
            positionComparator: 'greater_than_or_equal_to',
            positionTarget: 5,
            operator: 'count',
            comparator: 'equal_to',
            targetTotal: 2
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('passes enemy count on rank using enemy team perspective', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          c5: 'bN',
          c7: 'bP',
          h2: 'wP'
        }
      })
      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'enemy',
            subjectFilter: 'any',
            positionAxis: 'rank',
            positionComparator: 'greater_than_or_equal_to',
            positionTarget: 4,
            operator: 'count',
            comparator: 'equal_to',
            targetTotal: 1
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('passes zero enemy count on rank when no enemy piece occupies the rank from enemy perspective', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          c5: 'bN',
          h2: 'wP'
        }
      })
      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'enemy',
            subjectFilter: 'any',
            positionAxis: 'rank',
            positionComparator: 'equal_to',
            positionTarget: 5,
            operator: 'count',
            comparator: 'equal_to',
            targetTotal: 0
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('passes enemy count on square using enemy team perspective', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          a8: 'bR',
          h2: 'wP'
        }
      })
      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'enemy',
            subjectFilter: 'any',
            positionAxis: 'square',
            positionComparator: 'equal_to',
            positionTarget: 0,
            operator: 'count',
            comparator: 'equal_to',
            targetTotal: 1
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('passes moved_piece position evaluated against the after-board', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP'
        }
      })
      const moveObject = getMove('e2', 'e4', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'moved_piece',
            subjectFilter: 'any',
            positionAxis: 'rank',
            positionComparator: 'equal_to',
            positionTarget: 4,
            operator: 'count',
            comparator: 'equal_to',
            targetTotal: 1
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('fails moved_piece position when only the prior rank matched', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP'
        }
      })
      const moveObject = getMove('e2', 'e4', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'moved_piece',
            subjectFilter: 'any',
            positionAxis: 'rank',
            positionComparator: 'equal_to',
            positionTarget: 2,
            operator: 'count',
            comparator: 'equal_to',
            targetTotal: 1
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('fails enemy_moved_piece position when current move captures it', () => {
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
            kind: 'position',
            subject: 'enemy_moved_piece',
            subjectFilter: 'any',
            positionAxis: 'rank',
            positionComparator: 'greater_than_or_equal_to',
            positionTarget: 1,
            operator: 'count',
            comparator: 'greater_than_or_equal_to',
            targetTotal: 1
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('respects subjectFilter when computing position count', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          c5: 'wN',
          d5: 'wP',
          h2: 'wP'
        }
      })
      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'allied',
            subjectFilter: 'pawn',
            positionAxis: 'rank',
            positionComparator: 'equal_to',
            positionTarget: 5,
            operator: 'count',
            comparator: 'equal_to',
            targetTotal: 1
          },
          board,
          moveObject
        )
      ).toBe(true)
    })

    it('evaluates value operator over filtered positions and treats king value as zero', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d4: 'wQ',
          a4: 'wR',
          h2: 'wP'
        }
      })
      const moveObject = getMove('h2', 'h3', board)

      expect(
        evaluate(
          {
            version: 2,
            kind: 'position',
            subject: 'allied',
            subjectFilter: 'any',
            positionAxis: 'rank',
            positionComparator: 'equal_to',
            positionTarget: 4,
            operator: 'value',
            comparator: 'equal_to',
            targetTotal: 14
          },
          board,
          moveObject
        )
      ).toBe(true)
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
        targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
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
        targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
      }

      expect(evaluateV1(v1Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(true)
      expect(evaluate(v2Condition, board, moveObject)).toBe(evaluateV1(v1Condition, board, moveObject))
    })
  })

  describe('v2 shield semantics', () => {
    it('does not count a blocker as a shielder when no enemy slider line exists', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e1: 'wK',
          g8: 'bN',
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
            operator: 'shield',
            target: 'allied',
            targetFilter: 'king'
          },
          board,
          moveObject
        )
      ).toBe(false)
    })

    it('does not count lines with multiple blockers as a shield', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e2: 'wP',
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
            operator: 'shield',
            target: 'allied',
            targetFilter: 'king'
          },
          board,
          moveObject
        )
      ).toBe(false)
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
            targetComparisonSource: 'prior_board_state'
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
