import Rules from "chess_engine/rules"
import Board from "chess_engine/board"

class Api {
  constructor (args){
    this._board = args["board"]
    this._gameController = args["gameController"];
  }
  consoleLogBlackPov(){
    this._board.consoleLogBlackPov()
  }
  consoleLogWhitePov(){
    this._board.consoleLogWhitePov()
  }
  whoseTurn(){
    return this._board.allowedToMove
  }
  
  movementNotation(){
    return this._board.movementNotation
  }

  availableMovesDefault(){
    let movingTeam = this._board.allowedToMove;
    return this.availableMovesFor({movingTeam: movingTeam, board: this._board})
  }

  availableMovesFor({movingTeam: movingTeam, board: board}){
    let positions = board._positionsOccupiedByTeam(movingTeam),
        availableMoves = [];
    for(let i = 0; i < positions.length; i++){
      availableMoves = availableMoves.concat( this.availableMovesFrom({board: board, position: positions[i]}) )
    }
    return availableMoves
  }

  resultOfHypotheticalMove({board: board, moveObject:moveObject}){
      let newBoard = board.deepCopy();
      newBoard._officiallyMovePiece( moveObject )
    return newBoard
  }


  availableMovesFrom({position: position, board: board}){
    return Rules.availableMovesFrom({board: board, startPosition: position})
  }


}

export default Api