import Board from "chess_engine/board"

class MoveObject {
  constructor({endPosition: endPosition,
    additionalActions: additionalActions, pieceNotation: pieceNotation,
    illegal: illegal,
    startPosition: startPosition, captureNotation: captureNotation,
    promotionPiece: promotionPiece = null
  }){
    this.startPosition = startPosition
    this.endPosition = endPosition
    this.additionalActions = additionalActions
    this.pieceNotation = pieceNotation
    this.captureNotation = captureNotation
    this.promotionPiece = promotionPiece
    this.illegal = illegal
  }


  notation(){
    if( !/O-O/.exec(this.pieceNotation) ){
      var positionNotation = Board.gridCalculator(this.endPosition);
    }
    const promotionNotation = this.promotionPiece ? `=${this.promotionPiece}` : ""
    return this.pieceNotation + (this.captureNotation || "") + (positionNotation || "") + promotionNotation
  }

}

export default MoveObject
