import MovesCalculator from "chess_engine/moves_calculator";
import Board from "chess_engine/board";
import MoveObject from "chess_engine/move_object";
import { controllingPositions } from "chess_engine/board_query_utils";
import profileCollector from "chess_engine/profile_collector";

class Rules {
  
  static getMoveObject(startPosition, endPosition, board, promotionPiece = Board.QUEEN){
    // if(
    //   !Board.prototype.isPrototypeOf( board ) || typeof startPosition !== "number" ||  typeof endPosition !== "number"
    // ){
    //   throw new Error("missing params in getMoveObject")
    // }
    let layOut = board.layOut,
        team = board.teamAt(startPosition),
        moveObject = new MoveObject({illegal: true}); //defaulting to illegal, will be overridden if it's not
    if( team === Board.EMPTY ){
      moveObject.alert = "that tile is empty"
      return moveObject
    }
    if( team !== board.allowedToMove ){
      moveObject.alert =  "other team's turn"
      return moveObject
    }
    let moveObjects = new MovesCalculator({board: board, startPosition: startPosition}).moveObjects//, endPosition: endPosition});
    const matchingMoves = moveObjects.filter(currentMoveObject => {
      if( currentMoveObject.endPosition !== endPosition ){ return false }
      if( !currentMoveObject.promotionPiece ){ return true }
      return currentMoveObject.promotionPiece === promotionPiece
    })
    for(let i = 0; i < matchingMoves.length; i++){
      let currentMoveObject = matchingMoves[i]
      moveObject = currentMoveObject
      if( this.checkQueryWithMove({board: board, moveObject: moveObject}) ){
        moveObject.illegal = true
      } else {
        break;
      }
    }
    return moveObject
  }

  static checkQueryWithMove({board: board, moveObject: moveObject}){
    const startPosition = moveObject.startPosition
    const teamString = board.teamAt(startPosition)
    let newBoard = board.lightCloneForCheckQuery();
    newBoard._hypotheticallyMovePiece( moveObject )
    return this.checkQuery({board: newBoard, teamString: teamString})
  }

  static pieceWillBeAttackedAfterMove({board: board, moveObject: moveObject}){
    const startPosition = moveObject.startPosition
    const teamString  = board.teamAt(startPosition)
    let newBoard = board.lightCloneForCheckQuery();
    newBoard._hypotheticallyMovePiece( moveObject )
    return this.checkQuery({board: newBoard, teamString: teamString})
  }

  static checkQuery({board: board, teamString: teamString}){
      let kingPosition = board._kingPosition(teamString);
      return this.pieceIsAttacked({board: board, defensePosition: kingPosition, defendingTeam: teamString})
  }

  static pieceIsAttacked({board: board, defensePosition: defensePosition, defendingTeam: defendingTeam = null}){ //doesn't care if the position is occupied
    const teamString = defendingTeam || board.teamAt(defensePosition)
    const opposingTeamString = Board.opposingTeam(teamString)

    return controllingPositions({
      board,
      targetPosition: defensePosition,
      team: opposingTeamString
    }).length > 0
  }

  static positionsControlledByTeam({board: board, team: team}){
    let occcupiedPositions = board.positionsOccupiedByTeam(team);
    for (let i = 0; i < occcupiedPositions.length; i++){

    }
  }

  static availableMovesFrom({board: board, startPosition: startPosition}){
    return profileCollector.measure('rules.available_moves_from', () => {
      const pieceType = board.pieceTypeAt(startPosition)
      const pieceLabel = {
        [Board.PAWN]: 'pawn',
        [Board.NIGHT]: 'knight',
        [Board.BISHOP]: 'bishop',
        [Board.ROOK]: 'rook',
        [Board.QUEEN]: 'queen',
        [Board.KING]: 'king'
      }[pieceType] || 'unknown'

      return profileCollector.measure(`rules.available_moves_from.${pieceLabel}`, () => {
        let moveObjects = new MovesCalculator({board: board, startPosition: startPosition}).moveObjects,
          safeMoves = [];
        for(let i = 0; i < moveObjects.length; i++){
          let moveObject = moveObjects[i]
          if( !this.checkQueryWithMove({board: board, moveObject: moveObject})){
            safeMoves.push(moveObject);
          }
        }
        return safeMoves
      })
    })
  }
  static viablePositionsFromKeysOnly({board: board, startPosition: startPosition}){
    let movesCalculator = new MovesCalculator({board: board, startPosition: startPosition}),
        keysOnly = [];
    for (let i = 0; i < movesCalculator.moveObjects.length; i++){
      let moveObject = movesCalculator.moveObjects[i],
        endPosition = moveObject.endPosition;
      if( !this.checkQueryWithMove({board: board, moveObject: moveObject}) ){
        keysOnly.push(endPosition)
      }
    }
    return keysOnly
  }

  static noLegalMoves({ board: board, teamString: teamString }){
    let noLegalMoves = true,
      occcupiedPositions = board._positionsOccupiedByTeam(teamString);
    for(let i = 0; i < occcupiedPositions.length && noLegalMoves; i++){
      let startPosition = occcupiedPositions[i],
        movesCalculator = new MovesCalculator({board: board, startPosition: startPosition});
      for (let i = 0; i < movesCalculator.moveObjects.length; i++){
        let moveObject = movesCalculator.moveObjects[i];
         if( !this.checkQueryWithMove( {moveObject: moveObject, board: board}) ){
           noLegalMoves = false
           break
         }
      }
    };
    return noLegalMoves
  }

  static threeFoldRepetition(board){
    return board.history.positionKeyCount(board) >= 3
  }


  static postMoveQueries(board, prefixNotation){
    let otherTeam = board.teamNotMoving(),
        attackingTeam = Board.opposingTeam(otherTeam),
        kingPosition = board._kingPosition(otherTeam),
        inCheck = this.checkQuery({board: board, teamString: otherTeam}),
        noMoves = this.noLegalMoves({ board: board, teamString: otherTeam });
    if( inCheck && noMoves ){ board._endGame({ winner: attackingTeam, resultType: "checkmate" }); return "#" }
    if( inCheck ){ return "+" }
    if( noMoves ){ board._endGame({ resultType: "stalemate" }); return "" }
    return ""
  }

  static postTurnDrawQueries(board){
    if( board.history.halfmoveClock >= 100 ){
      board._endGame({ resultType: "fifty_move_rule" })
      return ""
    }

    if( this.threeFoldRepetition(board) ){
      board._endGame({ resultType: "threefold_repetition" })
      return ""
    }

    return ""
  }
}

export default Rules
