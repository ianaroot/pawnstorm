import Board from "gameplay/board"
import LiveView from "gameplay/live_view"
import Api	from "gameplay/api"
import Bot	from "gameplay/bot"
import Rules from "gameplay/rules"
import Sound from "gameplay/sound"

const throwIfMissing = p => { throw new Error(`Missing parameter: ${p}`) }

class GameController {
	constructor(){
		this.board = new Board({});
		this.view = new LiveView(this);
		this._paused = false
		this.view.displayLayOut({board: this.board, alert: ""})
		this.view.setTileClickListener()
		this.view.setUndoClickListener(this)
		this.view.setPauseClickListener(this)
		this.api = new Api({board: this.board, gameController: this});
		// this._whiteBot = new Bot(this.api, Board.WHITE)
		// this._blackBot = new Bot(this.api, Board.BLACK)
		if(this._whiteBot && !this._paused){ this.queryNextBotMove()}
	}

	pause(){
		this._paused = true
	}

	attemptMove(startPosition = throwIfMissing("startPosition"), endPosition = throwIfMissing("endPosition")) {
		var board = this.board,
			alert = "",
			sound = "";
		sound
		if( board.gameOver ){
			return
		}
		// shouldn't the board be making sure neither of these happens?
		// also, what happens after the alert????
		if ( !Board._inBounds(endPosition) ){
		alert = 'stay on the board, fool'
		} else if( board.occupiedByTeamMate({position: endPosition, teamString: board.allowedToMove}) ){
		alert = "what, are you trying to capture your own piece?"
		} else {

			// TODO: replace this queen default with explicit promotion UI.
			var moveObject = Rules.getMoveObject(startPosition, endPosition, board, Board.QUEEN);
			if( moveObject.illegal ){
				alert = "illegal move attempted"
				// also, what happens after the alert????

			} else {

				board._officiallyMovePiece( moveObject )
				let alerts_and_sounds = this.getAlertsAndSounds();

				alert = alerts_and_sounds.alert
				sound = alerts_and_sounds.sound
			}
		}

		this.view.displayLayOut({board: board, alert: alert, startPosition: startPosition})
		Sound.playSound(sound)
		if(this.movingTeamHasBot() && !this._paused ){
			let queryMove = this.queryNextBotMove.bind(this)
			setTimeout( function(){  queryMove() }, 400)
		}
	}

	getAlertsAndSounds(){
		return this.board.getAlertsAndSounds()
	}

	movingTeamHasBot(){
		let movingTeam = this.board.allowedToMove
		return ( (movingTeam === Board.WHITE) && this._whiteBot !== undefined ) || ( (movingTeam === Board.BLACK) && this._blackBot !== undefined )
	}

	queryBotMove(team){
		if( team === Board.WHITE ){
			let moveObject = this._whiteBot.determineMove({ board: this.board, api: this.api })
			this.attemptMove(moveObject.startPosition, moveObject.endPosition)
		} else {
			let moveObject = this._blackBot.determineMove({ board: this.board, api: this.api })
			this.attemptMove(moveObject.startPosition, moveObject.endPosition)
		}
	}

	queryNextBotMove(){
		let team = this.board.allowedToMove;
		this.queryBotMove(team);
	}

	undo(){
		if( JSON.parse( this.board.previousLayouts ).length){
			this.board._undo()
			this.view.displayLayOut({board: this.board})
		}
	}
}

export default GameController
