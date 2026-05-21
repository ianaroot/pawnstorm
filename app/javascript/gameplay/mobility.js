import Board from 'gameplay/board'
import Rules from 'gameplay/rules'

export function mobilityFromMoveObjects(pieceType, moveObjects) {
  if (pieceType === Board.PAWN) {
    return new Set(moveObjects.map(moveObject => moveObject.endPosition)).size
  }
  return moveObjects.length
}

export function mobilityAt(board, position) {
  return mobilityFromMoveObjects(
    board.pieceTypeAt(position),
    Rules.availableMovesFrom({ board, startPosition: position })
  )
}
