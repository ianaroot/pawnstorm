import Board from 'gameplay/board'
import { controllingPositions, materialValue } from 'gameplay/board_query_utils'

class CandidateMoveAnalysis {
  constructor({ board, moveObject }) {
    this.board = board
    this.moveObject = moveObject
    this._afterBoard = null
  }

  afterBoard() {
    if (!this._afterBoard) {
      const nextBoard = this.board.deepCopy()
      nextBoard._hypotheticallyMovePiece(this.moveObject)
      this._afterBoard = nextBoard
    }

    return this._afterBoard
  }

  movedPieceTeam() {
    return this.board.teamAt(this.moveObject.startPosition)
  }

  movedPiecePosition() {
    return this.moveObject.endPosition
  }

  movedPieceAttackerCount() {
    const movedPieceTeam = this.movedPieceTeam()
    const opposingTeam = Board.opposingTeam(movedPieceTeam)

    return controllingPositions({
      board: this.afterBoard(),
      targetPosition: this.movedPiecePosition(),
      team: opposingTeam
    }).length
  }

  relationValue(conditionNode) {
    switch (conditionNode.subject) {
      case 'moved_piece':
        return this.movedPieceRelationValue(conditionNode.relation)
      case 'captured_piece':
        return this.capturedPieceRelationValue(conditionNode.relation)
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support subject: ${conditionNode.subject}`)
    }
  }

  capturedPieceRelationValue(relation) {
    switch (relation) {
      case 'presence':
        return this.capturedPiecePresent()
      case 'absence':
        return this.capturedPieceAbsent()
      case 'piece_value':
        return this.capturedPieceValue()
      default:
        throw new Error(`captured_piece does not support relation: ${relation}`)
    }
  }

  movedPieceRelationValue(relation) {
    switch (relation) {
      case 'attacker_count':
        return this.movedPieceAttackerCount()
      default:
        throw new Error(`moved_piece does not yet support relation: ${relation}`)
    }
  }

  capturedPiecePresent() {
    return this.capturedPiecePosition() !== null
  }

  capturedPieceAbsent() {
    return !this.capturedPiecePresent()
  }

  capturedPiecePosition() {
    const startPosition = this.moveObject.startPosition
    const endPosition = this.moveObject.endPosition
    const movedPieceType = this.board.pieceTypeAt(startPosition)

    if (this.board.teamAt(endPosition) !== Board.EMPTY) {
      return endPosition
    }

    const changedFiles = Board.file(startPosition) !== Board.file(endPosition)

    if (movedPieceType === Board.PAWN && changedFiles) {
      return this.movedPieceTeam() === Board.WHITE
        ? endPosition - 8
        : endPosition + 8
    }

    return null
  }

  capturedPieceObject() {
    const capturedPosition = this.capturedPiecePosition()
    if (capturedPosition === null) { return null }
    return this.board.pieceObject(capturedPosition)
  }

  capturedPieceValue() {
    const species = this.capturedPieceSpecies()
    if (species === null) {
      return 0
    }

    return materialValue(species)
  }
  capturedPieceSpecies() {
    const capturedPiece = this.capturedPieceObject()
    if (capturedPiece === null) { return null }
    return Board.parseSpecies(capturedPiece)
  }

}

export default CandidateMoveAnalysis
