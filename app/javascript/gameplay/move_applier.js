import Rules from "gameplay/rules"
import { buildRecentMoveContext } from "gameplay/recent_move_context"

class MoveApplier {
  constructor({ board, moveObject }) {
    this.board = board
    this.moveObject = moveObject
  }

  apply() {
    const startPosition = this.moveObject.startPosition
    const endPosition = this.moveObject.endPosition
    const additionalActions = this.moveObject.additionalActions
    const promotionPiece = this.moveObject.promotionPiece
    const pieceObject = this.board.pieceObject(startPosition)
    const baseNotation = this.board.baseNotationFor(this.moveObject)
    const recentMoveContext = buildRecentMoveContext({
      boardBeforeMove: this.board,
      moveObject: this.moveObject
    })

    this.board.history.recordInitialPositionIfNeeded(this.board)
    this.board.recentMoveContext = recentMoveContext
    this.board._emptify(startPosition)
    if (!this.board.positionEmpty(endPosition)) { this.board._capture(endPosition) }
    this.board._placePiece({ position: endPosition, pieceObject })
    const epNotation = additionalActions ? additionalActions.call(this.board, startPosition) : ""
    if (promotionPiece) {
      this.board._placePiece({ position: endPosition, pieceObject: this.board.allowedToMove + promotionPiece })
    }
    const notationSuffix = Rules.postMoveQueries(this.board, baseNotation)
    this.board._recordNotation({ baseNotation, epNotation, notationSuffix })
    this.board.history.halfmoveClock = (
      recentMoveContext.movedPieceSpeciesBeforeMove === this.board.constructor.PAWN ||
      recentMoveContext.capturedPiecePosition !== null
    ) ? 0 : this.board.history.halfmoveClock + 1

    if (!this.board.gameOver) {
      this.board._nextTurn()
      this.board.history.recordPositionKey(this.board)
      Rules.postTurnDrawQueries(this.board)
    }

    return this.board
  }
}

export default MoveApplier
