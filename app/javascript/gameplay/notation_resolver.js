import Rules from "gameplay/rules"
import NotationParser from "gameplay/notation_parser"

class NotationResolver {
  constructor({ parser = new NotationParser() } = {}) {
    this.parser = parser
  }

  legalMoves(board) {
    return board._positionsOccupiedByTeam(board.allowedToMove).flatMap(startPosition => (
      Rules.availableMovesFrom({ board, startPosition })
    ))
  }

  emittedNotation({ board, moveObject }) {
    const replayBoard = board.deepCopy()
    replayBoard._officiallyMovePiece(moveObject)
    return replayBoard.movementNotation.at(-1)
  }

  resolve({ board, notation }) {
    const matchingMoves = this.legalMoves(board).filter(moveObject => {
      const candidateNotation = this.emittedNotation({ board, moveObject })
      return this.parser.equivalent(notation, candidateNotation)
    })

    if (matchingMoves.length === 1) { return matchingMoves[0] }
    if (matchingMoves.length === 0) {
      throw new Error(`Unable to resolve notation on current board: ${notation}`)
    }

    throw new Error(`Notation resolved to multiple legal moves: ${notation}`)
  }
}

export default NotationResolver
