import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'

import {
  buildBoard,
  getMove,
  moveTargets,
  playMoveSequence,
  position
} from 'gameplay/__tests__/helpers'

describe('Rules en passant', () => {
  it('returns a legal en passant move for white after a black double step', () => {
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

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).not.toBe(true)
    expect(move.captureNotation).toBe('x')
    expect(move.notation()).toBe('exd6')

    board._officiallyMovePiece(move)

    expect(board.pieceObject(position('d6'))).toBe(Board.WHITE_PAWN)
    expect(board.pieceObject(position('d5'))).toBe(Board.EMPTY_SQUARE)
    expect(board.movementNotation.at(-1)).toBe('exd6e.p.')
  })

  it('does not allow en passant after a black pawn reached the adjacent square by single step', () => {
    const board = buildBoard({
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd6', 'a3', 'd5'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e5: 'wP',
        d5: 'bP'
      }
    })

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow en passant after a black double step that was not the most recent move', () => {
    const board = buildBoard({
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd5', 'a3', 'Nc6'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e5: 'wP',
        d5: 'bP',
        c6: 'bN'
      }
    })

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).toBe(true)
  })

  it('returns a legal en passant move for black after a white double step', () => {
    const board = buildBoard({
      allowedToMove: Board.BLACK,
      movementNotation: ['e4'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d4: 'bP',
        e4: 'wP'
      }
    })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).not.toBe(true)
    expect(move.captureNotation).toBe('x')
    expect(move.notation()).toBe('dxe3')

    board._officiallyMovePiece(move)

    expect(board.pieceObject(position('e3'))).toBe(Board.BLACK_PAWN)
    expect(board.pieceObject(position('e4'))).toBe(Board.EMPTY_SQUARE)
    expect(board.movementNotation.at(-1)).toBe('dxe3e.p.')
  })

  it('does not allow en passant for black after a white pawn reached the adjacent square by single step', () => {
    const board = buildBoard({
      allowedToMove: Board.BLACK,
      movementNotation: ['e3', 'h6', 'e4'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d4: 'bP',
        e4: 'wP'
      }
    })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow en passant for black after a white double step that was not the most recent move', () => {
    const board = buildBoard({
      allowedToMove: Board.BLACK,
      movementNotation: ['e4', 'h6', 'Nc3'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d4: 'bP',
        e4: 'wP',
        c3: 'wN'
      }
    })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).toBe(true)
  })
})

describe('Rules attack and legality', () => {
  it('detects a rook attack on the king square', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e7: 'bR'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(true)
  })

  it('does not report an attack when a blocking piece interrupts the line', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e7: 'bR',
        e4: 'wB'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(false)
  })

  it('detects a knight attack on the king square', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        f3: 'bN'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(true)
  })

  it('detects a pawn attack on the king square', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d2: 'bP'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(true)
  })

  it('filters out moves that would expose the moving side king to attack', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e2: 'wR',
        e7: 'bR'
      }
    })

    const legalTargets = moveTargets(
      Rules.availableMovesFrom({ board, startPosition: position('e2') })
    )

    expect(legalTargets).toEqual(['e3', 'e4', 'e5', 'e6', 'e7'])
    expect(legalTargets).not.toContain('d2')
    expect(legalTargets).not.toContain('f2')
  })

  it('only allows a pinned rook to move along the line that keeps its king protected', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e2: 'wR',
        e8: 'bK',
        e7: 'bR'
      }
    })

    const legalTargets = moveTargets(
      Rules.availableMovesFrom({ board, startPosition: position('e2') })
    )

    expect(legalTargets).toEqual(['e3', 'e4', 'e5', 'e6', 'e7'])
    expect(legalTargets).not.toContain('d2')
    expect(legalTargets).not.toContain('f2')
  })
})

describe('Rules castling', () => {
  it('allows kingside castling when the path is clear and untouched', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).not.toBe(true)
    expect(move.notation()).toBe('O-O')
  })

  it('does not allow castling out of check', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK',
        e7: 'bR'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling through check', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK',
        f7: 'bR'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling when a piece blocks the path', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        f1: 'wB',
        e8: 'bK'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling if the rook moved away and returned', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
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

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling if the king moved away and returned', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK',
        a7: 'bP'
      }
    })

    playMoveSequence(board, [
      { from: 'e1', to: 'e2' },
      { from: 'a7', to: 'a6' },
      { from: 'e2', to: 'e1' },
      { from: 'a6', to: 'a5' }
    ])

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })
})
