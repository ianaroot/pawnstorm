import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import CandidateMoveAnalysis from 'gameplay/candidate_move_analysis'
import Rules from 'gameplay/rules'

import { buildBoard, getMove, moveTargets, playMoveSequence, position } from 'gameplay/__tests__/helpers'

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

    it('preserves en passant availability that depends on movement notation', () => {
      const board = buildBoard({
        allowedToMove: Board.WHITE,
        movementNotation: ['h3', 'd5'],
        pieces: {
          e1: 'wK',
          e8: 'bK',
          a2: 'wP',
          e5: 'wP',
          d5: 'bP'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })
      const afterBoard = analysis.afterBoard()

      const whitePawnTargets = moveTargets(
        Rules.availableMovesFrom({ board: afterBoard, startPosition: position('e5') })
      )

      expect(whitePawnTargets).toContain('d6')
    })

    it('preserves castling availability when king and rook are untouched', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h1: 'wR',
          a2: 'wP',
          e8: 'bK'
        }
      })

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })
      const afterBoard = analysis.afterBoard()

      const kingTargets = moveTargets(
        Rules.availableMovesFrom({ board: afterBoard, startPosition: position('e1') })
      )

      expect(kingTargets).toContain('g1')
    })

    it('preserves castling unavailability when the rook moved away and returned', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h1: 'wR',
          a2: 'wP',
          e8: 'bK',
          a7: 'bP'
        }
      })

      playMoveSequence(board, [
        { from: 'h1', to: 'h2' },
        { from: 'a7', to: 'a6' },
        { from: 'h2', to: 'h1' },
        { from: 'a6', to: 'a5' }
      ])

      const moveObject = getMove('a2', 'a3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })
      const afterBoard = analysis.afterBoard()

      const kingTargets = moveTargets(
        Rules.availableMovesFrom({ board: afterBoard, startPosition: position('e1') })
      )

      expect(kingTargets).not.toContain('g1')
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

    it('returns the moved piece destination square on the after board', () => {
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

    it('returns the moved piece start square on the prior board', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(analysis.movedPiecePosition('prior')).toBe(position('e2'))
    })
  })

  describe('moved_piece attacker', () => {
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
          relation: 'attacker'
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
          relation: 'attacker'
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
          relation: 'attacker',
          relationSpecifier: 'rook'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker',
          relationSpecifier: 'bishop'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker',
          relationSpecifier: 'knight'
        })
      ).toBe(0)
    })

    it('supports exclude mode when filtering relation specifiers by piece type', () => {
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
          relation: 'attacker',
          relationSpecifier: 'rook',
          relationSpecifierMode: 'exclude'
        })
      ).toBe(1)
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
          relation: 'defender',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'defender',
          relationSpecifier: 'bishop'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'defender',
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
          relation: 'attacker',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'rook',
          relation: 'attacker',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('supports exclude mode when filtering the moved piece subject by subjectSpecifier', () => {
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
          subjectSpecifierMode: 'exclude',
          relation: 'attacker',
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
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(2)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'queen',
          relation: 'count',
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
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(2)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'bishop',
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('supports exclude mode for allied and opponent subject specifiers', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          a1: 'wR',
          h1: 'wR',
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
          subject: 'allies',
          subjectSpecifier: 'pawn',
          subjectSpecifierMode: 'exclude',
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(3)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'pawn',
          subjectSpecifierMode: 'exclude',
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(3)
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
            relation: 'count',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(1)
    })

    it('sums material value for positional subjects', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wR',
          c1: 'wB',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('a1', 'a2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'any',
          relation: 'value',
          relationSpecifier: 'any'
        })
      ).toBe(8)
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

    it('counts a pawn capture when it is the only legal reply', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          h5: 'wN',
          d8: 'bR',
          e8: 'bK',
          f8: 'bR',
          d7: 'bP',
          e7: 'bP',
          f7: 'bP'
        }
      })

      const moveObject = getMove('h5', 'f6', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })

    it('resolves moved_piece mobility on the prior board from the start square', () => {
      const board = buildBoard({
        pieces: {
          b1: 'wN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('b1', 'c3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue(
          {
            subject: 'moved_piece',
            subjectSpecifier: 'knight',
            relation: 'mobility',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(3)
    })

    it('counts opponent king mobility on the after board when the checking piece can be captured', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e2: 'wQ',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e7', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'king',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })

    it('counts aggregate opponent mobility on the after board when only the king capture defends check', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e2: 'wQ',
          a8: 'bR',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e7', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'any',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })

    it('resolves opponent king mobility on the prior board from the prior position in the king-capture defense scenario', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e2: 'wQ',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e7', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue(
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(4)
    })

    it('distinguishes opponent king mobility from aggregate opponent mobility in a normal position', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          d1: 'wQ',
          a8: 'bR',
          e8: 'bK'
        }
      })

      const moveObject = getMove('d1', 'd2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'king',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(4)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'any',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(14)
    })

    it('tracks prior board opponent mobility in the normal aggregate scenario', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          d1: 'wQ',
          a8: 'bR',
          e8: 'bK'
        }
      })

      const moveObject = getMove('d1', 'd2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue(
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(4)

      expect(
        analysis.queryValue(
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'mobility',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(14)
    })

    it('returns zero opponent mobility in a checkmate position', () => {
      const board = buildBoard({
        pieces: {
          c6: 'wK',
          c7: 'wQ',
          a8: 'bK'
        }
      })

      const moveObject = getMove('c7', 'b7', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'king',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'any',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('returns zero opponent mobility in a stalemate position', () => {
      const board = buildBoard({
        pieces: {
          c6: 'wK',
          d7: 'wQ',
          a8: 'bK'
        }
      })

      const moveObject = getMove('d7', 'c7', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'king',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'any',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('counts opponent mobility when check is defendable only by blocking', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wK',
          c1: 'wR',
          e1: 'wR',
          c2: 'wQ',
          d8: 'bK',
          f7: 'bR'
        }
      })

      const moveObject = getMove('c2', 'd2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue(
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'king',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'any',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })

    it('counts opponent mobility when check is defendable only by king escape', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wK',
          c4: 'wN',
          d7: 'bK',
          c7: 'bR',
          d8: 'bR',
          e7: 'bR',
          c6: 'bB',
          d6: 'bB',
          e6: 'bB'
        }
      })

      const moveObject = getMove('c4', 'b6', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue(
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any'
          },
          'prior'
        )
      ).toBe(2)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'king',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'any',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })

    it('treats promotion-ready opponent pawn mobility as binary forward access', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wK',
          g8: 'bK',
          a2: 'bP'
        }
      })

      const moveObject = getMove('e2', 'e3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'pawn',
          relation: 'mobility',
          relationSpecifier: 'any'
        })
      ).toBe(1)
    })
  })

  describe('attacked and defended', () => {
    it('counts how many allied pieces are attacked', () => {
      const board = buildBoard({
        pieces: {
          d4: 'wN',
          e4: 'wB',
          f6: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e4', 'f5', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'any',
          relation: 'attacked',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('counts how many allied pieces are defended', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wB',
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
          relation: 'defended',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('counts opponent pieces attacked by allied rooks', () => {
      const board = buildBoard({
        pieces: {
          a1: 'wR',
          a8: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('a1', 'a2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'any',
          relation: 'attacker',
          relationSpecifier: 'rook'
        })
      ).toBe(1)
    })

    it('counts allied pieces attacked by opponent subjects', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wR',
          d6: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e1', 'e2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'knight',
          relation: 'attacked',
          relationSpecifier: 'rook'
        })
      ).toBe(1)
    })

    it('counts opponent pieces defended by opponent subjects', () => {
      const board = buildBoard({
        pieces: {
          c8: 'bB',
          d7: 'bP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e1', 'e2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'opponents',
          subjectSpecifier: 'bishop',
          relation: 'defended',
          relationSpecifier: 'pawn'
        })
      ).toBe(1)
    })
  })

  describe('shields', () => {
    it('counts the moved piece as a shielder when it interposes on an enemy slider line to the king', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e1: 'wK',
          e8: 'bR',
          a8: 'bK'
        }
      })

      const moveObject = getMove('d3', 'e3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'shielder',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'rook',
          relation: 'shielded',
          relationSpecifier: 'king'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'shielder',
          relationSpecifier: 'moved_piece'
        })
      ).toBe(1)
    })

    it('filters moved_piece relation specifiers against the prior-board square when requested', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e1: 'wK',
          e8: 'bR',
          a8: 'bK'
        }
      })

      const moveObject = getMove('d3', 'e3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue(
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'shielder',
            relationSpecifier: 'moved_piece'
          },
          'prior'
        )
      ).toBe(0)
    })

    it('supports exclude mode for moved_piece relation specifiers', () => {
      const board = buildBoard({
        pieces: {
          d3: 'wR',
          e1: 'wK',
          e8: 'bR',
          a8: 'bK'
        }
      })

      const moveObject = getMove('d3', 'e3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'shielder',
          relationSpecifier: 'moved_piece',
          relationSpecifierMode: 'exclude'
        })
      ).toBe(0)
    })

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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'shielder',
          relationSpecifier: 'any'
        })
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'rook',
          relation: 'shielded',
          relationSpecifier: 'king'
        })
      ).toBe(0)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'shielder',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })
  })

  describe('covers', () => {
    it('does not count the reverse direction as cover', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          a8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'moved_piece',
          subjectSpecifier: 'pawn',
          relation: 'coverer',
          relationSpecifier: 'any'
        })
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'covered',
          relationSpecifier: 'pawn'
        })
      ).toBe(0)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'pawn',
          relation: 'coverer',
          relationSpecifier: 'rook'
        })
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'rook',
          relation: 'covered',
          relationSpecifier: 'pawn'
        })
      ).toBe(0)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'rook',
          relation: 'coverer',
          relationSpecifier: 'pawn'
        })
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'pawn',
          relation: 'covered',
          relationSpecifier: 'rook'
        })
      ).toBe(0)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'rook',
          relation: 'coverer',
          relationSpecifier: 'pawn'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'pawn',
          relation: 'covered',
          relationSpecifier: 'rook'
        })
      ).toBe(1)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'rook',
          relation: 'coverer',
          relationSpecifier: 'pawn'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'pawn',
          relation: 'covered',
          relationSpecifier: 'rook'
        })
      ).toBe(1)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      const priorCover = analysis.queryValue({
        subject: 'allies',
        subjectSpecifier: 'king',
        relation: 'coverer',
        relationSpecifier: 'any'
      }, 'prior')

      const afterCover = analysis.queryValue({
        subject: 'allies',
        subjectSpecifier: 'king',
        relation: 'coverer',
        relationSpecifier: 'any'
      })

      expect(afterCover).toBe(priorCover)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'coverer',
          relationSpecifier: 'pawn'
        }, 'prior')
      ).toBe(0)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'pawn',
          relation: 'covered',
          relationSpecifier: 'king'
        }, 'prior')
      ).toBe(0)
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
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'king',
          relation: 'coverer',
          relationSpecifier: 'moved_piece'
        })
      ).toBe(1)
    })
  })

  describe('adjacency', () => {
    it('counts allied adjacent pieces in the 8 neighboring squares', () => {
      const board = buildBoard({
        pieces: {
          d4: 'wN',
          d5: 'wP',
          e5: 'wB',
          f4: 'wR',
          a1: 'wK',
          h8: 'bK'
        }
      })

      const moveObject = getMove('a1', 'a2', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'knight',
          relation: 'adjacent',
          relationSpecifier: 'any'
        })
      ).toBe(2)

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'knight',
          relation: 'adjacent',
          relationSpecifier: 'bishop'
        })
      ).toBe(1)
    })

    it('can filter adjacent pieces by moved_piece identity', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          d4: 'wN',
          e5: 'wB',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e3', board)
      const analysis = new CandidateMoveAnalysis({ board, moveObject })

      expect(
        analysis.queryValue({
          subject: 'allies',
          subjectSpecifier: 'knight',
          relation: 'adjacent',
          relationSpecifier: 'moved_piece'
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
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'captured_piece',
          subjectSpecifier: 'rook',
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('supports exclude mode for captured piece subject specifiers', () => {
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
          subjectSpecifier: 'pawn',
          subjectSpecifierMode: 'exclude',
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(1)

      expect(
        analysis.queryValue({
          subject: 'captured_piece',
          subjectSpecifier: 'queen',
          subjectSpecifierMode: 'exclude',
          relation: 'count',
          relationSpecifier: 'any'
        })
      ).toBe(0)
    })

    it('reports captured piece value through the normalized value relation', () => {
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
          relation: 'value',
          relationSpecifier: 'any'
        })
      ).toBe(9)
    })
  })
})
