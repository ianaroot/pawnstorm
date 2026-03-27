import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import CandidateMoveAnalysis from 'gameplay/candidate_move_analysis'

import { buildBoard, getMove, position } from 'gameplay/__tests__/helpers'

describe('CandidateMoveAnalysis', () => {
  describe('afterBoard', () => {
    it('returns a post-move board without mutating the original board state', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })
      const afterBoard = analysis.afterBoard()

      expect(board.pieceObject(position('e2'))).toBe('WP')
      expect(board.pieceObject(position('e4'))).toBe(Board.EMPTY_SQUARE)

      expect(afterBoard.pieceObject(position('e2'))).toBe(Board.EMPTY_SQUARE)
      expect(afterBoard.pieceObject(position('e4'))).toBe('WP')
      expect(afterBoard.allowedToMove).toBe(board.allowedToMove)
      expect(afterBoard.movementNotation).toEqual(board.movementNotation)
    })

    it('memoizes the post-move board for repeated analysis calls', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(analysis.afterBoard()).toBe(analysis.afterBoard())
    })
  })

  describe('moved piece helpers', () => {
    it('returns the moved piece team from the pre-move board', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(analysis.movedPieceTeam()).toBe(Board.WHITE)
    })

    it('returns the moved piece destination square', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(analysis.movedPiecePosition()).toBe(position('e4'))
    })
  })

  describe('moved_piece attacker_count', () => {
    it('counts one attacker when the moved piece lands on a square controlled by one enemy piece', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK',
          g5: 'bN'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.relationValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker_count'
        })
      ).toBe(1)
    })

    it('counts multiple attackers on the moved piece destination square', () => {
      const board = buildBoard({
        pieces: {
          d2: 'wP',
          e1: 'wK',
          e8: 'bK',
          d8: 'bR',
          b2: 'bB'
        }
      })

      const moveObject = getMove('d2', 'd4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.relationValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker_count'
        })
      ).toBe(2)
    })

    it('filters counted attackers by relationSpecifier', () => {
      const board = buildBoard({
        pieces: {
          d2: 'wP',
          e1: 'wK',
          e8: 'bK',
          d8: 'bR',
          b2: 'bB'
        }
      })

      const moveObject = getMove('d2', 'd4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker_count',
          relationSpecifier: 'rook'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker_count',
          relationSpecifier: 'bishop'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker_count',
          relationSpecifier: 'knight'
        })
      ).toBe(0)
    })

    it('counts defenders for the moved piece and filters them by relationSpecifier', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          d3: 'wB',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'defender_count',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'defender_count',
          relationSpecifier: 'bishop'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'defender_count',
          relationSpecifier: 'rook'
        })
      ).toBe(0)
    })

    it('filters the moved piece subject by subjectSpecifier before evaluating relations', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK',
          g5: 'bN'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'pawn',
          relation: 'attacker_count',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'rook',
          relation: 'attacker_count',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

  })

  describe('allies and opponents subjects', () => {
    it('counts allied pieces filtered by subjectSpecifier', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          a1: 'wR',
          h1: 'wR',
          e1: 'wK',
          e8: 'bK',
          d7: 'bP'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'rook',
          relation: 'piece_count',
          relationSpecifier: 'any'
        })
      ).toBe(2)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'queen',
          relation: 'piece_count',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('counts opponent pieces filtered by subjectSpecifier', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK',
          a8: 'bR',
          h8: 'bR',
          d7: 'bP'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'rook',
          relation: 'piece_count',
          relationSpecifier: 'any'
        })
      ).toBe(2)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'bishop',
          relation: 'piece_count',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('resolves allies on the prior board scope for comparison-style queries', () => {
      const board = buildBoard({
        pieces: {
          d1: 'wQ',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('d1', 'h5', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue(
          {
            subject: 'allies',
            subjectSpecifier: 'queen',
            relation: 'piece_count',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(1)
    })
  })

  describe('mobility', () => {
    it('counts legal moves including captures for non-pawn pieces', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          d4: 'wR',
          d6: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'rook',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBeGreaterThan(0)
    })

    it('treats pawn mobility as binary forward access rather than raw move count', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e4', 'e5', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'pawn',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })

    it('does not count pawn captures as mobility', () => {
      const board = buildBoard({
        pieces: {
          e3: 'wP',
          d4: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e3', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'pawn',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })
  })

  describe('captured_piece helpers', () => {
    it('reports absence and zero value when the move is not a capture', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(analysis.capturedPiecePresent()).toBe(false)
      expect(analysis.capturedPieceAbsent()).toBe(true)
      expect(analysis.capturedPiecePosition()).toBe(null)
      expect(analysis.capturedPieceObject()).toBe(null)
      expect(analysis.capturedPieceSpecies()).toBe(null)
      expect(analysis.capturedPieceValue()).toBe(0)
    })

    it('resolves the captured piece on a normal capture', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          d5: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e4', 'd5', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(analysis.capturedPiecePresent()).toBe(true)
      expect(analysis.capturedPieceAbsent()).toBe(false)
      expect(analysis.capturedPiecePosition()).toBe(position('d5'))
      expect(analysis.capturedPieceObject()).toBe(Board.BLACK_NIGHT)
      expect(analysis.capturedPieceSpecies()).toBe(Board.NIGHT)
      expect(analysis.capturedPieceValue()).toBe(3)
    })

    it('resolves the captured pawn on en passant', () => {
      const board = buildBoard({
        allowedToMove: Board.WHITE,
        movementNotation: ['h3', 'd5'],
        pieces: {
          e1: 'wK',
          e8: 'bK',
          e5: 'wP',
          d5: 'bP'
        }
      })

      const moveObject = getMove('e5', 'd6', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(analysis.capturedPiecePresent()).toBe(true)
      expect(analysis.capturedPieceAbsent()).toBe(false)
      expect(analysis.capturedPiecePosition()).toBe(position('d5'))
      expect(analysis.capturedPieceObject()).toBe(Board.BLACK_PAWN)
      expect(analysis.capturedPieceSpecies()).toBe(Board.PAWN)
      expect(analysis.capturedPieceValue()).toBe(1)
    })

    it('counts one captured piece when the subjectSpecifier matches and zero when it does not', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          d5: 'bQ',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e4', 'd5', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'captured_piece',
          subjectSpecifier: 'queen',
          relation: 'piece_count',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'captured_piece',
          subjectSpecifier: 'rook',
          relation: 'piece_count',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })
  })
})
