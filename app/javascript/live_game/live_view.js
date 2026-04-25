import Board from "chess_engine/board"
import Rules from "chess_engine/rules"
import { controlledSquares } from "chess_engine/board_query_utils"
import {
  clearAlerts,
  displayAlerts,
  renderBoardPieces,
  updateCaptureAreaSizing,
  updateCaptures,
  updateTeamAllowedToMove
} from "live_game/view_utils"

const SHOW_CONTROL_PREVIEW =
  window.DEBUG_CONTROL_PREVIEW === true

class LiveView {
  constructor(_gameController){
    this.boundHighlightTile = this.highlightTile.bind(this)
    this.boundAttemptMove = this.attemptMove.bind(this)
    this._gameController = _gameController
  }
  static get TILE_HEIGHT() { return "49" }
  displayLayOut(args){
    let board = args["board"],
        alert = args["alert"] || ""
    renderBoardPieces(board)
    this.setTileClickListener()
    updateCaptureAreaSizing(board)
    updateCaptures(board)
    clearAlerts()
    updateTeamAllowedToMove(board)
    displayAlerts(alert)
  }

  highlightTile(){
    if(!this._gameController.board.gameOver){
      let target = arguments[0].currentTarget,
      position = Board.gridCalculatorReverse( target.id ),
      team = Board.EMPTY
      this.unhighlLighTiles()
      this.setTileClickListener()
      if (target.classList.contains(Board.BLACK) || target.classList.contains(Board.WHITE) ) {
        team = this.teamSet(target.classList)
        const controlPreview = this.buildControlPreview(position, team)
        this.renderControlPreview(controlPreview)
        if (team === this._gameController.board.allowedToMove && this._gameController.canHumanMove()){
          this.highlightLegalMovesFrom(position, target)
        }
      }
    }
  }

  buildControlPreview(position, team){
    if (!SHOW_CONTROL_PREVIEW) { return null }
    return {
      position,
      squares: controlledSquares({
        board: this._gameController.board,
        attackerPosition: position
      }),
      sourceIsMovable: team === this._gameController.board.allowedToMove
    }
  }

  highlightLegalMovesFrom(position, target){
    let viables = Rules.viablePositionsFromKeysOnly({startPosition: position, board: this._gameController.board})
    for (let i = 0; i < viables.length; i++){
      let tilePosition = viables[i],
      alphaNumericPosition = Board.gridCalculator(tilePosition),
      square = document.getElementById(alphaNumericPosition)
      square.classList.add("highlight2")
      square.removeEventListener("click", this.boundHighlightTile )
      square.addEventListener("click", this.boundAttemptMove )
    }
    target.classList.add("highlight1")
    target.classList.add("startPosition")
  }

  renderControlPreview(controlPreview){
    if (!controlPreview) { return }
    let sourceSquare = document.getElementById(Board.gridCalculator(controlPreview.position))
    if (!controlPreview.sourceIsMovable) { sourceSquare?.classList.add("control-preview-source") }
    for (let i = 0; i < controlPreview.squares.length; i++) {
      let previewSquare = document.getElementById(Board.gridCalculator(controlPreview.squares[i]))
      previewSquare?.classList.add("control-preview-square")
    }
  }

  retrieveTiles(){
    return document.getElementsByClassName("chess-tile")
  }

  teamSet(list){
    if( list.contains(Board.BLACK)){
      return Board.BLACK
    }else if (list.contains(Board.WHITE)) {
      return Board.WHITE
    }else {
      throw new Error("error in teamSet")
    }
  }

  unhighlLighTiles(){
    let tiles = this.retrieveTiles()
    for(let i = 0 ; i < tiles.length ; i++ ){
      var tile = tiles[i]
      tile.removeEventListener("click", this.boundHighlightTile)
      tile.removeEventListener("click", this.boundAttemptMove)
      tile.classList.remove("startPosition")
      tile.classList.remove("highlight1")
      tile.classList.remove("highlight2")
      tile.classList.remove("control-preview-source")
      tile.classList.remove("control-preview-square")
    }
  }

  attemptMove(){
    let target = arguments[0].currentTarget,
      endPosition = Board.gridCalculatorReverse( target.id ),
      startElement = document.getElementsByClassName("startPosition")[0],
      startPosition = Board.gridCalculatorReverse( startElement.id )
    this.unhighlLighTiles()
    this.setTileClickListener()
    this._gameController.attemptMove(startPosition, endPosition)
  }

  setTileClickListener(){
    let tiles = this.retrieveTiles()
    for(let i = 0 ; i < tiles.length ; i++ ){
      var tile = tiles[i]
      tile.addEventListener("click", this.boundHighlightTile )
    }
  }

  // setUndoClickListener(gameController){
  //   let undoButton = document.getElementById("undo-button")
  //   undoButton.addEventListener("click", gameController.undo.bind(gameController))
  // }

  // setPauseClickListener(gameController){
  //   let pauseButton = document.getElementById("pause-button")
  //   pauseButton.addEventListener("click", gameController.pause.bind(gameController))
  // }
}

export default LiveView
