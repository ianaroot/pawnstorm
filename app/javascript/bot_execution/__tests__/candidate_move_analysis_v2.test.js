import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'

import { buildBoard, getMove, playMoveSequence, position } from 'gameplay/__tests__/helpers'

function buildEnemyKnightRecentMoveContext() {
  return {
    moveObject: { startPosition: position('b8'), endPosition: position('c6') },
    movingTeam: Board.BLACK,
    movedPieceStartPosition: position('b8'),
    movedPieceEndPosition: position('c6'),
    movedPieceSpeciesBeforeMove: Board.NIGHT,
    movedPieceSpeciesAfterMove: Board.NIGHT,
    capturedPiecePosition: null,
    capturedPieceTeam: null,
    capturedPieceSpecies: null
  }
}

function buildEnemyCapturedPieceContext() {
  return {
    moveObject: { startPosition: position('h4'), endPosition: position('e4') },
    movingTeam: Board.BLACK,
    movedPieceStartPosition: position('h4'),
    movedPieceEndPosition: position('e4'),
    movedPieceSpeciesBeforeMove: Board.QUEEN,
    movedPieceSpeciesAfterMove: Board.QUEEN,
    capturedPiecePosition: position('e4'),
    capturedPieceTeam: Board.WHITE,
    capturedPieceSpecies: Board.BISHOP
  }
}

describe('CandidateMoveAnalysisV2', () => {
  describe('general unary subjects', () => {
    it('counts, values, and sums mobility for allied and enemy subjects', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d1: 'wQ',
          c3: 'wN',
          c6: 'bN',
          a7: 'bP',
          h2: 'wP'
        }
      })

      const moveObject = getMove('h2', 'h3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      expect(
        analysis.unaryValue({
          subject: 'allied',
          subjectFilter: 'any',
          verb: 'count'
        })
      ).toBe(4)

      expect(
        analysis.unaryValue({
          subject: 'enemy',
          subjectFilter: 'king',
          subjectFilterMode: 'exclude',
          verb: 'value'
        })
      ).toBe(4)

      expect(
        analysis.unaryValue({
          subject: 'allied',
          subjectFilter: 'pawn',
          subjectFilterMode: 'exclude',
          verb: 'count'
        })
      ).toBe(3)

      expect(
        analysis.unaryValue({
          subject: 'enemy',
          subjectFilter: 'knight',
          verb: 'mobility'
        })
      ).toBe(7)
    })
  })

  describe('moved_piece', () => {
    it('resolves count, value, mobility, and prior-board comparison correctly for a promotion', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          g7: 'wP'
        }
      })

      const moveObject = getMove('g7', 'g8', board, Board.QUEEN)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      expect(
        analysis.unaryValue({
          subject: 'moved_piece',
          subjectFilter: 'queen',
          verb: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'moved_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(9)

      expect(
        analysis.unaryValue({
          subject: 'moved_piece',
          subjectFilter: 'any',
          verb: 'mobility'
        })
      ).toBe(17)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'prior_board_state',
          subject: 'moved_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(1)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'moved_piece_value',
          subject: 'moved_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(9)
    })
  })

  describe('captured_piece', () => {
    it('handles all unary verbs it supports on a normal capture', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e4: 'wP',
          d5: 'bN'
        }
      })

      const moveObject = getMove('e4', 'd5', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      expect(
        analysis.unaryValue({
          subject: 'captured_piece',
          subjectFilter: 'knight',
          verb: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'captured_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(3)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'captured_piece_value',
          subject: 'captured_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(3)
    })

    it('resolves the captured pawn on en passant', () => {
      const board = buildBoard({
        allowedToMove: Board.WHITE,
        movementNotation: ['1. e4', 'h6', '2. e5', 'd5'],
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e5: 'wP',
          d5: 'bP'
        }
      })

      const moveObject = getMove('e5', 'd6', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      expect(
        analysis.unaryValue({
          subject: 'captured_piece',
          subjectFilter: 'pawn',
          verb: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'captured_piece',
          subjectFilter: 'pawn',
          subjectFilterMode: 'exclude',
          verb: 'count'
        })
      ).toBe(0)
    })
  })

  describe('enemy_moved_piece', () => {
    it('resolves all unary verbs while the enemy moved piece is still on the board', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          a2: 'wP',
          c6: 'bN'
        }
      })
      board.recentMoveContext = buildEnemyKnightRecentMoveContext()

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'knight',
          verb: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(3)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'mobility'
        })
      ).toBe(8)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'prior_board_state',
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'mobility'
        })
      ).toBe(8)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'enemy_moved_piece_value',
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(3)
    })

    it('resolves all unary verbs when the current move captures the enemy moved piece from a real move sequence', () => {
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
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          verb: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'mobility'
        })
      ).toBe(0)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'prior_board_state',
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          verb: 'mobility'
        })
      ).toBe(2)
    })
  })

  describe('enemy_captured_piece', () => {
    it('resolves the enemy captured piece from recent move context for unary queries and comparison values', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          a2: 'wP'
        }
      })
      board.recentMoveContext = buildEnemyCapturedPieceContext()

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      expect(
        analysis.unaryValue({
          subject: 'enemy_captured_piece',
          subjectFilter: 'bishop',
          verb: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_captured_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(3)

      expect(
        analysis.unaryValue({
          subject: 'enemy_captured_piece',
          subjectFilter: 'bishop',
          subjectFilterMode: 'exclude',
          verb: 'count'
        })
      ).toBe(0)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'enemy_captured_piece_value',
          subject: 'enemy_captured_piece',
          subjectFilter: 'any',
          verb: 'value'
        })
      ).toBe(3)
    })
  })
})
