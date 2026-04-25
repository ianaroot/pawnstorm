import Board from 'chess_engine/board'
import Layout from 'chess_engine/layout'
import NotationResolver from 'chess_engine/notation_resolver'

const notationResolver = new NotationResolver()

export function buildBoardFromNotationPrefix(notationPrefix) {
  const board = new Board({
    layOut: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: [],
    previousLayouts: JSON.stringify([])
  })

  notationPrefix.forEach(notation => {
    const moveObject = notationResolver.resolve({ board, notation })
    board._officiallyMovePiece(moveObject)
  })

  return board
}

export function moveLabel(moveObject) {
  const start = Board.gridCalculator(moveObject.startPosition)
  const finish = Board.gridCalculator(moveObject.endPosition)
  const promotion = moveObject.promotionPiece ? `=${moveObject.promotionPiece}` : ''
  return `${start}-${finish}${promotion}`
}

function squareLabel(pieceObject) {
  if (pieceObject === Board.EMPTY_SQUARE) return '..'
  return pieceObject
}

export function boardAscii({ board, perspective = 'white' }) {
  const rows = []
  const rankIndexes = perspective === 'black'
    ? [0, 1, 2, 3, 4, 5, 6, 7]
    : [7, 6, 5, 4, 3, 2, 1, 0]
  const files = perspective === 'black'
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  rankIndexes.forEach(rankIndex => {
    const rank = rankIndex + 1
    const pieces = []

    files.forEach(file => {
      const position = Board.gridCalculatorReverse(`${file}${rank}`)
      pieces.push(squareLabel(board.pieceObject(position)))
    })

    rows.push(`${rank} ${pieces.join(' ')}`)
  })

  rows.push(`  ${files.join('  ')}`)
  return rows.join('\n')
}

