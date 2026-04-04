function capturePositionFor({ boardBeforeMove, moveObject }) {
    const endPosition = moveObject.endPosition

    if (!moveObject.captureNotation) {
      return null
    }

    if (!boardBeforeMove.positionEmpty(endPosition)) {
      return endPosition
    }

    
    return moveObject.endPosition > moveObject.startPosition ? endPosition - 8 : endPosition + 8
      // White pawns capture upward in this board indexing scheme.
      // Black pawns capture downward in this board indexing scheme.
  }

  export function buildRecentMoveContext({ boardBeforeMove, moveObject }) {
    const movedPieceStartPosition = moveObject.startPosition
    const movedPieceEndPosition = moveObject.endPosition
    const movingTeam = boardBeforeMove.teamAt(movedPieceStartPosition)
    const movedPieceSpeciesBeforeMove = boardBeforeMove.pieceTypeAt(movedPieceStartPosition)
    const movedPieceSpeciesAfterMove = moveObject.promotionPiece || movedPieceSpeciesBeforeMove

    const capturedPiecePosition = capturePositionFor({
      boardBeforeMove,
      moveObject
    })

    const capturedPieceTeam = capturedPiecePosition === null
      ? null
      : boardBeforeMove.teamAt(capturedPiecePosition)

    const capturedPieceSpecies = capturedPiecePosition === null
      ? null
      : boardBeforeMove.pieceTypeAt(capturedPiecePosition)

    return {
      moveObject,
      movingTeam,
      movedPieceStartPosition,
      movedPieceEndPosition,
      movedPieceSpeciesBeforeMove,
      movedPieceSpeciesAfterMove,
      capturedPiecePosition,
      capturedPieceTeam,
      capturedPieceSpecies
    }
  }

  export function cloneRecentMoveContext(recentMoveContext) {
    if (!recentMoveContext) {
      return null
    }

    return {
      ...recentMoveContext,
      moveObject: recentMoveContext.moveObject
        ? { ...recentMoveContext.moveObject }
        : null
    }
  }

  export default buildRecentMoveContext