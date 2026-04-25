import { describe, expect, it } from 'vitest'

import Board from 'chess_engine/board'
import {
  controlledSquares,
  controllingPositions,
  pawnAttackPositions,
  pieceControlsSquare,
  squareClassification
} from 'chess_engine/board_query_utils'

import { buildBoard, position, square } from 'chess_engine/__tests__/helpers'

describe('board_query_utils', () => {
  describe('squareClassification', () => {
    it('classifies empty, teammate, and opponent squares relative to the moving team', () => {
      const board = buildBoard({
        pieces: {
          e1: 'wK',
          e8: 'bK',
          d4: 'wP',
          e5: 'bP'
        }
      })

      const emptySquare = squareClassification({
        board,
        position: position('c3'),
        movingTeam: Board.WHITE
      })
      const teammateSquare = squareClassification({
        board,
        position: position('d4'),
        movingTeam: Board.WHITE
      })
      const opponentSquare = squareClassification({
        board,
        position: position('e5'),
        movingTeam: Board.WHITE
      })

      expect(emptySquare.isEmpty).toBe(true)
      expect(emptySquare.isTeammate).toBe(false)
      expect(emptySquare.isOpponent).toBe(false)

      expect(teammateSquare.isEmpty).toBe(false)
      expect(teammateSquare.isTeammate).toBe(true)
      expect(teammateSquare.isOpponent).toBe(false)

      expect(opponentSquare.isEmpty).toBe(false)
      expect(opponentSquare.isTeammate).toBe(false)
      expect(opponentSquare.isOpponent).toBe(true)
    })
  })

  describe('pawnAttackPositions', () => {
    it('returns the correct diagonal attack squares for a central white pawn', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(pawnAttackPositions({ board, startPosition: position('e4') })).toEqual({
        left: position('d5'),
        right: position('f5')
      })
    })

    it('does not wrap a white h-file pawn attack across the board edge', () => {
      const board = buildBoard({
        pieces: {
          h5: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(pawnAttackPositions({ board, startPosition: position('h5') })).toEqual({
        left: position('g6'),
        right: null
      })
    })

    it('does not wrap a black a-file pawn attack across the board edge', () => {
      const board = buildBoard({
        pieces: {
          a4: 'bP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(pawnAttackPositions({ board, startPosition: position('a4') })).toEqual({
        left: null,
        right: position('b3')
      })
    })
  })

  describe('pieceControlsSquare', () => {
    it('returns true when a knight controls a valid target square', () => {
      const board = buildBoard({
        pieces: {
          g5: 'wN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('g5'),
          targetPosition: position('e4')
        })
      ).toBe(true)
    })

    it('returns false when a knight does not control the target square', () => {
      const board = buildBoard({
        pieces: {
          g5: 'wN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('g5'),
          targetPosition: position('g4')
        })
      ).toBe(false)
    })

    it('returns true when a rook controls along an open file', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wR',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('e2'),
          targetPosition: position('e7')
        })
      ).toBe(true)
    })

    it('returns false when a rook is blocked before the target square', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wR',
          e4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('e2'),
          targetPosition: position('e7')
        })
      ).toBe(false)
    })

    it('returns true when a bishop controls along an open diagonal', () => {
      const board = buildBoard({
        pieces: {
          c1: 'wB',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('c1'),
          targetPosition: position('g5')
        })
      ).toBe(true)
    })

    it('returns false when a bishop is blocked before the target square', () => {
      const board = buildBoard({
        pieces: {
          c1: 'wB',
          e3: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('c1'),
          targetPosition: position('g5')
        })
      ).toBe(false)
    })

    it('returns true when a white pawn controls its diagonal attack square', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('e4'),
          targetPosition: position('d5')
        })
      ).toBe(true)
    })

    it('returns false when a white pawn targets a non-controlled square', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('e4'),
          targetPosition: position('e5')
        })
      ).toBe(false)
    })

    it('returns true when a king controls an adjacent square', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wK',
          e8: 'bK'
        }
      })

      expect(
        pieceControlsSquare({
          board,
          attackerPosition: position('e4'),
          targetPosition: position('f5')
        })
      ).toBe(true)
    })
  })

  describe('controllingPositions', () => {
    it('returns the controlling rook position on an open file', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wR',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const controllers = controllingPositions({
        board,
        targetPosition: position('e7'),
        team: Board.WHITE
      }).map(square)

      expect(controllers).toEqual(['e2'])
    })

    it('returns no controlling rook when a blocker interrupts the line', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wR',
          e4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const controllers = controllingPositions({
        board,
        targetPosition: position('e7'),
        team: Board.WHITE
      })

      expect(controllers).toEqual([])
    })

    it('returns multiple controlling positions when two pieces attack the same square', () => {
      const board = buildBoard({
        pieces: {
          d2: 'wR',
          b2: 'wB',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const controllers = controllingPositions({
        board,
        targetPosition: position('d4'),
        team: Board.WHITE
      }).map(square).sort()

      expect(controllers).toEqual(['b2', 'd2'])
    })

    it('respects the species filter', () => {
      const board = buildBoard({
        pieces: {
          d2: 'wR',
          b2: 'wB',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const bishopControllers = controllingPositions({
        board,
        targetPosition: position('d4'),
        team: Board.WHITE,
        species: Board.BISHOP
      }).map(square)

      expect(bishopControllers).toEqual(['b2'])
    })

    it('returns pawn controlling positions correctly', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          c4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const controllers = controllingPositions({
        board,
        targetPosition: position('d5'),
        team: Board.WHITE,
        species: Board.PAWN
      }).map(square).sort()

      expect(controllers).toEqual(['c4', 'e4'])
    })
  })

  describe('controlledSquares', () => {
    it('returns the squares a knight controls', () => {
      const board = buildBoard({
        pieces: {
          g5: 'wN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const controlled = controlledSquares({
        board,
        attackerPosition: position('g5')
      }).map(square).sort()

      expect(controlled).toEqual(['e4', 'e6', 'f3', 'f7', 'h3', 'h7'])
    })

    it('does not include squares beyond a rook blocker', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wR',
          e4: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const controlled = controlledSquares({
        board,
        attackerPosition: position('e2')
      }).map(square).sort()

      expect(controlled).toEqual(['a2', 'b2', 'c2', 'd2', 'e1', 'e3', 'e4', 'f2', 'g2', 'h2'])
      expect(controlled).not.toContain('e5')
      expect(controlled).not.toContain('e7')
    })

    it('returns only the valid edge-file diagonal for a white pawn', () => {
      const board = buildBoard({
        pieces: {
          h5: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const controlled = controlledSquares({
        board,
        attackerPosition: position('h5')
      }).map(square)

      expect(controlled).toEqual(['g6'])
    })
  })
})
