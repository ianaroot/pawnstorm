import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import { buildRecentMoveContext } from 'gameplay/recent_move_context'

import { buildBoard, getMove, position } from 'gameplay/__tests__/helpers'

describe('recentMoveContext', () => {
  describe('buildRecentMoveContext', () => {
    it('records a quiet move with no capture', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)

      expect(
        buildRecentMoveContext({ boardBeforeMove: board, moveObject })
      ).toEqual({
        moveObject,
        movingTeam: Board.WHITE,
        movedPieceStartPosition: position('e2'),
        movedPieceEndPosition: position('e4'),
        movedPieceSpeciesBeforeMove: Board.PAWN,
        movedPieceSpeciesAfterMove: Board.PAWN,
        capturedPiecePosition: null,
        capturedPieceTeam: null,
        capturedPieceSpecies: null
      })
    })

    it('records a normal capture from the destination square', () => {
      const board = buildBoard({
        pieces: {
          e4: 'wP',
          d5: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e4', 'd5', board)

      expect(
        buildRecentMoveContext({ boardBeforeMove: board, moveObject })
      ).toEqual({
        moveObject,
        movingTeam: Board.WHITE,
        movedPieceStartPosition: position('e4'),
        movedPieceEndPosition: position('d5'),
        movedPieceSpeciesBeforeMove: Board.PAWN,
        movedPieceSpeciesAfterMove: Board.PAWN,
        capturedPiecePosition: position('d5'),
        capturedPieceTeam: Board.BLACK,
        capturedPieceSpecies: Board.NIGHT
      })
    })

    it('records en passant from the square behind the destination', () => {
      const board = buildBoard({
        allowedToMove: Board.WHITE,
        movementNotation: ['1. e4', 'h6', '2. e5', 'd5'],
        pieces: {
          e5: 'wP',
          d5: 'bP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e5', 'd6', board)

      expect(
        buildRecentMoveContext({ boardBeforeMove: board, moveObject })
      ).toEqual({
        moveObject,
        movingTeam: Board.WHITE,
        movedPieceStartPosition: position('e5'),
        movedPieceEndPosition: position('d6'),
        movedPieceSpeciesBeforeMove: Board.PAWN,
        movedPieceSpeciesAfterMove: Board.PAWN,
        capturedPiecePosition: position('d5'),
        capturedPieceTeam: Board.BLACK,
        capturedPieceSpecies: Board.PAWN
      })
    })

    it('records promotion species after move', () => {
      const board = buildBoard({
        pieces: {
          g7: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('g7', 'g8', board, Board.ROOK)

      expect(
        buildRecentMoveContext({ boardBeforeMove: board, moveObject })
      ).toEqual({
        moveObject,
        movingTeam: Board.WHITE,
        movedPieceStartPosition: position('g7'),
        movedPieceEndPosition: position('g8'),
        movedPieceSpeciesBeforeMove: Board.PAWN,
        movedPieceSpeciesAfterMove: Board.ROOK,
        capturedPiecePosition: null,
        capturedPieceTeam: null,
        capturedPieceSpecies: null
      })
    })
  })

  describe('Board integration', () => {
    it('stores recentMoveContext when a move is officially applied', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moveObject = getMove('e2', 'e4', board)
      board._officiallyMovePiece(moveObject)

      expect(board.recentMoveContext).toMatchObject({
        movingTeam: Board.WHITE,
        movedPieceStartPosition: position('e2'),
        movedPieceEndPosition: position('e4'),
        movedPieceSpeciesBeforeMove: Board.PAWN,
        movedPieceSpeciesAfterMove: Board.PAWN,
        capturedPiecePosition: null,
        capturedPieceTeam: null,
        capturedPieceSpecies: null
      })
      expect(board.recentMoveContext.moveObject).toEqual(moveObject)
    })

    it('preserves recentMoveContext through clone and lightClone', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      board._officiallyMovePiece(getMove('e2', 'e4', board))

      const clonedBoard = board.clone()
      const lightClonedBoard = board.lightClone()

      expect(clonedBoard.recentMoveContext).toEqual(board.recentMoveContext)
      expect(clonedBoard.recentMoveContext).not.toBe(board.recentMoveContext)

      expect(lightClonedBoard.recentMoveContext).toEqual(board.recentMoveContext)
      expect(lightClonedBoard.recentMoveContext).not.toBe(board.recentMoveContext)
    })

    it('clears recentMoveContext on reset', () => {
      const board = buildBoard({
        pieces: {
          e2: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      board._officiallyMovePiece(getMove('e2', 'e4', board))
      board._reset()

      expect(board.recentMoveContext).toBeNull()
    })

    it('stores en passant capture details after official move application', () => {
      const board = buildBoard({
        allowedToMove: Board.WHITE,
        movementNotation: ['1. e4', 'h6', '2. e5', 'd5'],
        pieces: {
          e5: 'wP',
          d5: 'bP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      board._officiallyMovePiece(getMove('e5', 'd6', board))

      expect(board.recentMoveContext).toMatchObject({
        movingTeam: Board.WHITE,
        movedPieceStartPosition: position('e5'),
        movedPieceEndPosition: position('d6'),
        capturedPiecePosition: position('d5'),
        capturedPieceTeam: Board.BLACK,
        capturedPieceSpecies: Board.PAWN
      })
    })
  })
})
