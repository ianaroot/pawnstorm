import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'

import { buildBoard, getMove, playMoveSequence, position, square } from 'gameplay/__tests__/helpers'

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

function pairSquares(result) {
  return result.pairs
    .map(pair => [square(pair.subjectPosition), square(pair.targetPosition)])
    .sort((a, b) => a.join(':').localeCompare(b.join(':')))
}

function squaresFor(positions) {
  return positions.map(square).sort()
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
          operator: 'count'
        })
      ).toBe(4)

      expect(
        analysis.unaryValue({
          subject: 'enemy',
          subjectFilter: 'king',
          subjectFilterMode: 'exclude',
          operator: 'value'
        })
      ).toBe(4)

      expect(
        analysis.unaryValue({
          subject: 'allied',
          subjectFilter: 'pawn',
          subjectFilterMode: 'exclude',
          operator: 'count'
        })
      ).toBe(3)

      expect(
        analysis.unaryValue({
          subject: 'enemy',
          subjectFilter: 'knight',
          operator: 'mobility'
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
          operator: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'value'
        })
      ).toBe(9)

      expect(
        analysis.unaryValue({
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'mobility'
        })
      ).toBe(17)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'prior_board_state',
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'value'
        })
      ).toBe(1)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'moved_piece_value',
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'value'
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
          operator: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'captured_piece',
          subjectFilter: 'any',
          operator: 'value'
        })
      ).toBe(3)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'captured_piece_value',
          subject: 'captured_piece',
          subjectFilter: 'any',
          operator: 'value'
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
          operator: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'captured_piece',
          subjectFilter: 'pawn',
          subjectFilterMode: 'exclude',
          operator: 'count'
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
          operator: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          operator: 'value'
        })
      ).toBe(3)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          operator: 'mobility'
        })
      ).toBe(8)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'enemy_moved_piece_value',
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          operator: 'value'
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
          operator: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          operator: 'value'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          operator: 'mobility'
        })
      ).toBe(0)

      const priorMobility = analysis.comparisonValueFor({
        comparisonValue: 'prior_board_state',
        subject: 'enemy_moved_piece',
        subjectFilter: 'any',
        operator: 'mobility'
      })

      const afterMobility = analysis.unaryValue({
        subject: 'enemy_moved_piece',
        subjectFilter: 'any',
        operator: 'mobility'
      })

      expect(priorMobility).toBe(2)
      expect(priorMobility).not.toBe(afterMobility)
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
          operator: 'count'
        })
      ).toBe(1)

      expect(
        analysis.unaryValue({
          subject: 'enemy_captured_piece',
          subjectFilter: 'any',
          operator: 'value'
        })
      ).toBe(3)

      expect(
        analysis.unaryValue({
          subject: 'enemy_captured_piece',
          subjectFilter: 'bishop',
          subjectFilterMode: 'exclude',
          operator: 'count'
        })
      ).toBe(0)

      expect(
        analysis.comparisonValueFor({
          comparisonValue: 'enemy_captured_piece_value',
          subject: 'enemy_captured_piece',
          subjectFilter: 'any',
          operator: 'value'
        })
      ).toBe(3)
    })
  })

  describe('relational attack', () => {
    it('builds pairs and deduped side sets for allied rook attacks against enemy targets', () => {
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
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })
      const result = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'rook',
        operator: 'attack',
        mode: 'ignore_king_safety',
        target: 'enemy',
        targetFilter: 'any'
      })

      expect(pairSquares(result)).toEqual([
        ['d4', 'd7'],
        ['d4', 'g4']
      ])
      expect(squaresFor(result.subjectPositions)).toEqual(['d4'])
      expect(squaresFor(result.targetPositions)).toEqual(['d7', 'g4'])
    })

    it('excludes pinned pieces from attack pairs when mode is legal and preserves the old geometry when mode ignores king safety', () => {
      const board = buildBoard({
        pieces: {
          a8: 'bK',
          h4: 'bB',
          e1: 'wK',
          f2: 'wN',
          e4: 'bP',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      const legalResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'knight',
        operator: 'attack',
        mode: 'legal',
        target: 'enemy',
        targetFilter: 'pawn'
      })

      expect(pairSquares(legalResult)).toEqual([])
      expect(legalResult.subjectPositions).toEqual([])
      expect(legalResult.targetPositions).toEqual([])

      const ignoreResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'knight',
        operator: 'attack',
        mode: 'ignore_king_safety',
        target: 'enemy',
        targetFilter: 'pawn'
      })

      expect(pairSquares(ignoreResult)).toEqual([['f2', 'e4']])
      expect(squaresFor(ignoreResult.subjectPositions)).toEqual(['f2'])
      expect(squaresFor(ignoreResult.targetPositions)).toEqual(['e4'])
    })

    it('supports moved_piece and enemy_moved_piece as relational targets across after and prior board scopes', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP',
          h7: 'bB',
          f7: 'bP'
        }
      })

      playMoveSequence(board, [
        { from: 'e2', to: 'e4' },
        { from: 'f7', to: 'f5' }
      ])

      const moveObject = getMove('e4', 'f5', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      const movedPieceTargetResult = analysis.relationalResult({
        subject: 'enemy',
        subjectFilter: 'bishop',
        operator: 'attack',
        mode: 'ignore_king_safety',
        target: 'moved_piece',
        targetFilter: 'any'
      })

      expect(pairSquares(movedPieceTargetResult)).toEqual([['h7', 'f5']])
      expect(squaresFor(movedPieceTargetResult.subjectPositions)).toEqual(['h7'])
      expect(squaresFor(movedPieceTargetResult.targetPositions)).toEqual(['f5'])

      const enemyMovedPiecePriorResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'attack',
        mode: 'ignore_king_safety',
        target: 'enemy_moved_piece',
        targetFilter: 'any',
        boardScope: 'prior'
      })

      expect(pairSquares(enemyMovedPiecePriorResult)).toEqual([['e4', 'f5']])
      expect(squaresFor(enemyMovedPiecePriorResult.subjectPositions)).toEqual(['e4'])
      expect(squaresFor(enemyMovedPiecePriorResult.targetPositions)).toEqual(['f5'])

      const enemyMovedPieceAfterResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'attack',
        mode: 'ignore_king_safety',
        target: 'enemy_moved_piece',
        targetFilter: 'any'
      })

      expect(pairSquares(enemyMovedPieceAfterResult)).toEqual([])
      expect(enemyMovedPieceAfterResult.subjectPositions).toEqual([])
      expect(enemyMovedPieceAfterResult.targetPositions).toEqual([])
    })
  })

  describe('relational defend', () => {
    it('supports allied defenders targeting the moved piece', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e2: 'wP',
          f2: 'wN'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })
      const result = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'knight',
        operator: 'defend',
        mode: 'ignore_king_safety',
        target: 'moved_piece',
        targetFilter: 'any'
      })

      expect(pairSquares(result)).toEqual([['f2', 'e4']])
      expect(squaresFor(result.subjectPositions)).toEqual(['f2'])
      expect(squaresFor(result.targetPositions)).toEqual(['e4'])
    })

    it('excludes pinned pieces from defend pairs when mode is legal and preserves the old geometry when mode ignores king safety', () => {
      const board = buildBoard({
        pieces: {
          a8: 'bK',
          h4: 'bB',
          e1: 'wK',
          f2: 'wN',
          e4: 'wP',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      const legalResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'knight',
        operator: 'defend',
        mode: 'legal',
        target: 'allied',
        targetFilter: 'pawn'
      })

      expect(pairSquares(legalResult)).toEqual([])
      expect(legalResult.subjectPositions).toEqual([])
      expect(legalResult.targetPositions).toEqual([])

      const ignoreResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'knight',
        operator: 'defend',
        mode: 'ignore_king_safety',
        target: 'allied',
        targetFilter: 'pawn'
      })

      expect(pairSquares(ignoreResult)).toEqual([['f2', 'e4']])
      expect(squaresFor(ignoreResult.subjectPositions)).toEqual(['f2'])
      expect(squaresFor(ignoreResult.targetPositions)).toEqual(['e4'])
    })
  })

  describe('relational adjacent', () => {
    it('supports enemy_moved_piece as a present-on-board subject', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          b5: 'wB',
          c6: 'bN',
          a2: 'wP'
        }
      })
      board.recentMoveContext = buildEnemyKnightRecentMoveContext()

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })
      const result = analysis.relationalResult({
        subject: 'enemy_moved_piece',
        subjectFilter: 'any',
        operator: 'adjacent',
        target: 'allied',
        targetFilter: 'bishop'
      })

      expect(pairSquares(result)).toEqual([['c6', 'b5']])
      expect(squaresFor(result.subjectPositions)).toEqual(['c6'])
      expect(squaresFor(result.targetPositions)).toEqual(['b5'])
    })

    it('returns no after-board pairs and a prior-board pair when the enemy moved piece was captured', () => {
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

      const afterResult = analysis.relationalResult({
        subject: 'enemy_moved_piece',
        subjectFilter: 'any',
        operator: 'adjacent',
        target: 'allied',
        targetFilter: 'pawn'
      })

      expect(pairSquares(afterResult)).toEqual([])
      expect(afterResult.subjectPositions).toEqual([])
      expect(afterResult.targetPositions).toEqual([])

      const priorResult = analysis.relationalResult({
        subject: 'enemy_moved_piece',
        subjectFilter: 'any',
        operator: 'adjacent',
        target: 'allied',
        targetFilter: 'pawn',
        boardScope: 'prior'
      })

      expect(pairSquares(priorResult)).toEqual([['f5', 'e4']])
      expect(squaresFor(priorResult.subjectPositions)).toEqual(['f5'])
      expect(squaresFor(priorResult.targetPositions)).toEqual(['e4'])
    })
  })

  describe('relational shield', () => {
    it('treats the moved piece as shielding the allied king when it interposes on a slider line', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          a8: 'bK',
          e8: 'bR',
          d3: 'wB'
        }
      })

      const moveObject = getMove('d3', 'e2', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })
      const result = analysis.relationalResult({
        subject: 'moved_piece',
        subjectFilter: 'any',
        operator: 'shield',
        target: 'allied',
        targetFilter: 'king'
      })

      expect(pairSquares(result)).toEqual([['e2', 'e1']])
      expect(squaresFor(result.subjectPositions)).toEqual(['e2'])
      expect(squaresFor(result.targetPositions)).toEqual(['e1'])
    })

    it('does not treat a covered rook as shielded when an extra blocker breaks the shield line', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          a8: 'bK',
          d4: 'wR',
          d5: 'wP',
          d6: 'wN',
          d8: 'bR',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      const coverResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'cover',
        target: 'allied',
        targetFilter: 'rook'
      })

      expect(pairSquares(coverResult)).toEqual([['d5', 'd4']])
      expect(squaresFor(coverResult.subjectPositions)).toEqual(['d5'])
      expect(squaresFor(coverResult.targetPositions)).toEqual(['d4'])

      const shieldResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'shield',
        target: 'allied',
        targetFilter: 'rook'
      })

      expect(pairSquares(shieldResult)).toEqual([])
      expect(shieldResult.subjectPositions).toEqual([])
      expect(shieldResult.targetPositions).toEqual([])
    })
  })

  describe('relational cover', () => {
    it('treats a pawn as covering an allied rook when it blocks a live opposing slider route', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          a8: 'bK',
          d4: 'wR',
          d5: 'wP',
          d8: 'bR',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })
      const result = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'cover',
        target: 'allied',
        targetFilter: 'rook'
      })

      expect(pairSquares(result)).toEqual([['d5', 'd4']])
      expect(squaresFor(result.subjectPositions)).toEqual(['d5'])
      expect(squaresFor(result.targetPositions)).toEqual(['d4'])
    })

    it('does not count cover when no opposing slider can potentially align to the ray', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          a8: 'bK',
          d4: 'wR',
          d5: 'wP',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })
      const result = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'cover',
        target: 'allied',
        targetFilter: 'rook'
      })

      expect(pairSquares(result)).toEqual([])
      expect(result.subjectPositions).toEqual([])
      expect(result.targetPositions).toEqual([])
    })

    it('treats a pawn as covering an allied rook even when the opposing slider is not already on the ray', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          a8: 'bK',
          d4: 'wR',
          d5: 'wP',
          g6: 'bR',
          a2: 'wP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysisV2({ board, moveObject })

      const coverResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'cover',
        target: 'allied',
        targetFilter: 'rook'
      })

      expect(pairSquares(coverResult)).toEqual([['d5', 'd4']])
      expect(squaresFor(coverResult.subjectPositions)).toEqual(['d5'])
      expect(squaresFor(coverResult.targetPositions)).toEqual(['d4'])

      const shieldResult = analysis.relationalResult({
        subject: 'allied',
        subjectFilter: 'pawn',
        operator: 'shield',
        target: 'allied',
        targetFilter: 'rook'
      })

      expect(pairSquares(shieldResult)).toEqual([])
      expect(shieldResult.subjectPositions).toEqual([])
      expect(shieldResult.targetPositions).toEqual([])
    })
  })
})
