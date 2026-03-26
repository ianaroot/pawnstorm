import Board from 'gameplay/board'
import Rules from 'gameplay/rules'

const PIECE_CODES = Object.freeze({
  wK: Board.WHITE_KING,
  wQ: Board.WHITE_QUEEN,
  wR: Board.WHITE_ROOK,
  wB: Board.WHITE_BISHOP,
  wN: Board.WHITE_NIGHT,
  wP: Board.WHITE_PAWN,
  bK: Board.BLACK_KING,
  bQ: Board.BLACK_QUEEN,
  bR: Board.BLACK_ROOK,
  bB: Board.BLACK_BISHOP,
  bN: Board.BLACK_NIGHT,
  bP: Board.BLACK_PAWN
})

export function position(square) {
  return Board.gridCalculatorReverse(square)
}

export function square(positionNumber) {
  return Board.gridCalculator(positionNumber)
}

export function emptyLayout() {
  return Array(64).fill(Board.EMPTY_SQUARE)
}

export function buildBoard({
  pieces = {},
  allowedToMove = Board.WHITE,
  movementNotation = [],
  capturedPieces = [],
  gameOver = false,
  previousLayouts = JSON.stringify([])
} = {}) {
  const board = new Board({
    layOut: emptyLayout(),
    allowedToMove,
    movementNotation,
    capturedPieces,
    gameOver,
    previousLayouts
  })

  Object.entries(pieces).forEach(([squareName, pieceCode]) => {
    const pieceObject = PIECE_CODES[pieceCode] || pieceCode
    board._placePiece({ position: position(squareName), pieceObject })
  })

  return board
}

export function moveTargets(moveObjects) {
  return moveObjects.map(moveObject => square(moveObject.endPosition)).sort()
}

export function getMove(from, to, board) {
  return Rules.getMoveObject(position(from), position(to), board)
}

export function playMoveSequence(board, moves) {
  moves.forEach(({ from, to }) => {
    const move = getMove(from, to, board)
    if (move.illegal) {
      throw new Error(`Illegal move in test sequence: ${from} -> ${to}`)
    }
    board._officiallyMovePiece(move)
  })

  return board
}
