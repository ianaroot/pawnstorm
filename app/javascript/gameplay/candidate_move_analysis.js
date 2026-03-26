class CandidateMoveAnalysis {
  constructor({ board, moveObject }) {
    this.board = board
    this.moveObject = moveObject
    this._afterBoard = null
  }

  afterBoard() {
    if (!this._afterBoard) {
      const nextBoard = this.board.deepCopy()
      nextBoard._officiallyMovePiece(this.moveObject)
      this._afterBoard = nextBoard
    }

    return this._afterBoard
  }

  relationValue(_conditionNode) {
    throw new Error('CandidateMoveAnalysis#relationValue is not implemented yet')
  }
}

export default CandidateMoveAnalysis
