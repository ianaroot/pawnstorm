import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'

function position(square) {
  return Board.gridCalculatorReverse(square)
}

function emptyLayout() {
  return Array(64).fill(Board.EMPTY_SQUARE)
}

function addKings(board) {
  board._placePiece({ position: position('e1'), pieceObject: Board.WHITE_KING })
  board._placePiece({ position: position('e8'), pieceObject: Board.BLACK_KING })
}

describe('Rules en passant', () => {
  it('returns a legal en passant move for white after a black double step', () => {
    const board = new Board({
      layOut: emptyLayout(),
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd5']
    })

    addKings(board)
    board._placePiece({ position: position('e5'), pieceObject: Board.WHITE_PAWN })
    board._placePiece({ position: position('d5'), pieceObject: Board.BLACK_PAWN })

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
    const board = new Board({
      layOut: emptyLayout(),
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd6', 'a3', 'd5']
    })

    addKings(board)
    board._placePiece({ position: position('e5'), pieceObject: Board.WHITE_PAWN })
    board._placePiece({ position: position('d5'), pieceObject: Board.BLACK_PAWN })

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow en passant after a black double step that was not the most recent move', () => {
    const board = new Board({
      layOut: emptyLayout(),
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd5', 'a3', 'Nc6']
    })

    addKings(board)
    board._placePiece({ position: position('e5'), pieceObject: Board.WHITE_PAWN })
    board._placePiece({ position: position('d5'), pieceObject: Board.BLACK_PAWN })
    board._placePiece({ position: position('c6'), pieceObject: Board.BLACK_NIGHT })

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).toBe(true)
  })

  it('returns a legal en passant move for black after a white double step', () => {
    const board = new Board({
      layOut: emptyLayout(),
      allowedToMove: Board.BLACK,
      movementNotation: ['e4']
    })

    addKings(board)
    board._placePiece({ position: position('d4'), pieceObject: Board.BLACK_PAWN })
    board._placePiece({ position: position('e4'), pieceObject: Board.WHITE_PAWN })

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
    const board = new Board({
      layOut: emptyLayout(),
      allowedToMove: Board.BLACK,
      movementNotation: ['e3', 'h6', 'e4']
    })

    addKings(board)
    board._placePiece({ position: position('d4'), pieceObject: Board.BLACK_PAWN })
    board._placePiece({ position: position('e4'), pieceObject: Board.WHITE_PAWN })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow en passant for black after a white double step that was not the most recent move', () => {
    const board = new Board({
      layOut: emptyLayout(),
      allowedToMove: Board.BLACK,
      movementNotation: ['e4', 'h6', 'Nc3']
    })

    addKings(board)
    board._placePiece({ position: position('d4'), pieceObject: Board.BLACK_PAWN })
    board._placePiece({ position: position('e4'), pieceObject: Board.WHITE_PAWN })
    board._placePiece({ position: position('c3'), pieceObject: Board.WHITE_NIGHT })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).toBe(true)
  })
})
