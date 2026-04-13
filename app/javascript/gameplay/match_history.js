class MatchHistory {
  constructor({
    movementNotation = [],
    recentMoveContext = null,
    halfmoveClock = 0,
    positionKeys = []
  } = {}) {
    this.movementNotation = movementNotation || []
    this.recentMoveContext = recentMoveContext
    this.halfmoveClock = halfmoveClock
    this.positionKeys = Array.isArray(positionKeys) ? [...positionKeys] : []
  }

  clone() {
    return new MatchHistory({
      movementNotation: [...this.movementNotation],
      recentMoveContext: this.recentMoveContext
        ? {
            ...this.recentMoveContext,
            moveObject: this.recentMoveContext.moveObject ? { ...this.recentMoveContext.moveObject } : null
          }
        : null,
      halfmoveClock: this.halfmoveClock,
      positionKeys: [...this.positionKeys]
    })
  }

  lightClone() {
    return new MatchHistory({
      recentMoveContext: this.recentMoveContext
        ? {
            ...this.recentMoveContext,
            moveObject: this.recentMoveContext.moveObject ? { ...this.recentMoveContext.moveObject } : null
          }
        : null,
      halfmoveClock: this.halfmoveClock,
      positionKeys: [...this.positionKeys]
    })
  }

  lightCloneForCheckQuery() {
    return new MatchHistory({
      halfmoveClock: this.halfmoveClock,
      positionKeys: [...this.positionKeys]
    })
  }

  recordInitialPositionIfNeeded(board) {
    if (this.positionKeys.length === 0) {
      this.recordPositionKey(board)
    }
  }

  recordPositionKey(board) {
    const positionKey = this.positionKeyFor(board)
    this.positionKeys.push(positionKey)
    return positionKey
  }

  positionKeyCount(board) {
    const positionKey = this.positionKeyFor(board)
    let count = 0
    for (let i = 0; i < this.positionKeys.length; i++) {
      if (this.positionKeys[i] === positionKey) {
        count++
      }
    }
    return count
  }

  positionKeyFor(board) {
    return JSON.stringify([
      board.layOut,
      board.allowedToMove,
      board.castlingRightsCache(),
      this._enPassantAvailabilityFor(board)
    ])
  }

  _enPassantAvailabilityFor(board) {
    // magic string alert
    const recentMove = board.recentMoveContext
    if (!recentMove || recentMove.movedPieceSpeciesBeforeMove !== board.constructor.PAWN) { return null }
    if (Math.abs(recentMove.movedPieceEndPosition - recentMove.movedPieceStartPosition) !== 16) { return null }

    const mover = recentMove.movingTeam
    const currentTeam = board.allowedToMove
    const expectedTeam = mover === board.constructor.WHITE
      ? board.constructor.BLACK
      : board.constructor.WHITE

    if (currentTeam !== expectedTeam) { return null }
    const targetSquare = mover === board.constructor.WHITE ? recentMove.movedPieceEndPosition - 8 : recentMove.movedPieceEndPosition + 8
    const captureStarts = currentTeam === board.constructor.WHITE ? [targetSquare - 9, targetSquare - 7] : [targetSquare + 7, targetSquare + 9]

    for (let i = 0; i < captureStarts.length; i++) {
      const startPosition = captureStarts[i]
      if (
        startPosition >= 0 &&
        startPosition < board.layOut.length &&
        board.teamAt(startPosition) === currentTeam &&
        board.pieceTypeAt(startPosition) === board.constructor.PAWN
      ) {
        return targetSquare
      }
    }
    return null
  }
}

export { MatchHistory }
export default MatchHistory
