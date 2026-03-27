import Board from 'gameplay/board'
import { controllingPositions } from 'gameplay/board_query_utils'

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
    if (conditionNode.subject !== 'moved_piece') {
      throw new Error(`CandidateMoveAnalysis does not yet support subject: ${conditionNode.subject}`)
    }

    switch (conditionNode.relation) {
      case 'attacker_count':
        return this.movedPieceAttackerCount()
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support relation: ${conditionNode.relation}`)
    }
  }
}

export default CandidateMoveAnalysis
