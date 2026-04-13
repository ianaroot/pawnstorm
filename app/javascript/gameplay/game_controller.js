import Board from "gameplay/board"
import LiveView from "gameplay/live_view"
import Api	from "gameplay/api"
import BotRunner from "gameplay/bot_runner"
import Rules from "gameplay/rules"
import Sound from "gameplay/sound"

const throwIfMissing = p => { throw new Error(`Missing parameter: ${p}`) }

class GameController {
	constructor(){
		this.rootElement = document.querySelector('[data-game-controller-page="true"]')
		this.playConfig = this.buildPlayConfig()
		this.board = new Board({});
		this.view = new LiveView(this);
		this._paused = false
		this._completionSubmitted = false
		this.view.displayLayOut({board: this.board, alert: ""})
		this.view.setTileClickListener()
		// this.view.setUndoClickListener(this)
		// this.view.setPauseClickListener(this)
		this.api = new Api({board: this.board, gameController: this});
		this.configurePlayBots()
		if(this._whiteBot && !this._paused){ this.queryNextBotMove()}
	}

	buildPlayConfig(){
		if (this.rootElement?.dataset.gameMode !== 'human-vs-bot') { return null }
		return {
			humanTeam: this.rootElement.dataset.humanTeam,
			botTeam: this.rootElement.dataset.botTeam,
			completeUrl: this.rootElement.dataset.completeUrl,
			replayUrl: this.rootElement.dataset.replayUrl,
			botCompiledProgram: JSON.parse(this.rootElement.dataset.botCompiledProgram)
		}
	}

	configurePlayBots(){
		if (!this.playConfig) { return }
		const botRunner = new BotRunner(this.playConfig.botCompiledProgram)
		if (this.playConfig.botTeam === Board.WHITE) {
			this._whiteBot = botRunner
		} else {
			this._blackBot = botRunner
		}
	}

	// pause(){
	// 	this._paused = true
	// }

	attemptMove(startPosition = throwIfMissing("startPosition"), endPosition = throwIfMissing("endPosition")) {
		if (!this.canHumanMove()) { return }
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
		this.submitCompletionIfGameOver()
		if(this.movingTeamHasBot() && !this._paused ){
			let queryMove = this.queryNextBotMove.bind(this)
			setTimeout( function(){  queryMove() }, 400)
		}
	}

	canHumanMove(){
		return !this.playConfig || this.board.allowedToMove === this.playConfig.humanTeam
	}

	getAlertsAndSounds(){
		return this.board.getAlertsAndSounds()
	}

	movingTeamHasBot(){
		let movingTeam = this.board.allowedToMove
		return ( (movingTeam === Board.WHITE) && this._whiteBot !== undefined ) || ( (movingTeam === Board.BLACK) && this._blackBot !== undefined )
	}

	queryBotMove(team){
		try {
			let moveObject = team === Board.WHITE ? this.selectBotMove(this._whiteBot) : this.selectBotMove(this._blackBot)
			this.applyBotMove(moveObject)
		} catch (error) {
			this.failInteractiveMatch(error)
		}
	}

	selectBotMove(bot){
		if (typeof bot.selectMove === 'function') { return bot.selectMove({ board: this.board }) }
		return bot.determineMove({ board: this.board, api: this.api })
	}

	applyBotMove(moveObject){
		if (!moveObject) { throw new Error('Bot did not select a move.') }
		this.board._officiallyMovePiece(moveObject)
		let alerts_and_sounds = this.getAlertsAndSounds()
		this.view.displayLayOut({board: this.board, alert: alerts_and_sounds.alert, startPosition: moveObject.startPosition})
		Sound.playSound(alerts_and_sounds.sound)
		this.submitCompletionIfGameOver()
	}

	queryNextBotMove(){
		let team = this.board.allowedToMove;
		this.queryBotMove(team);
	}

	// undo(){
	// 	return
	// }

	submitCompletionIfGameOver(){
		if (!this.playConfig || !this.board.gameOver || this._completionSubmitted) { return }
		this._completionSubmitted = true
		this.updatePlayStatus(`${this.resultMessage()} Redirecting to replay...`)
		setTimeout(() => this.persistInteractiveMatch(this.completedPayload()), 1200)
	}

	completedPayload(){
		return {
			match: {
				status: 'completed',
				result: this.matchResult(),
				lay_out: this.board.layOut,
				captured_pieces: this.board.capturedPieces,
				allowed_to_move: this.board.allowedToMove,
				movement_notation: this.board.movementNotation,
				previous_layouts: []
			}
		}
	}

	matchResult(){
		if (this.board._resultType === 'fifty_move_rule') { return 'fifty_move_rule' }
		if (this.board._resultType === 'threefold_repetition') { return 'threefold_repetition' }
		if (this.board._winner === Board.WHITE) { return 'white_win' }
		if (this.board._winner === Board.BLACK) { return 'black_win' }
		return 'stalemate'
	}

	resultMessage(){
		if (this.board._winner === this.playConfig.humanTeam) { return 'You win.' }
		if (this.board._winner === this.playConfig.botTeam) { return 'Bot wins.' }
		if (this.board._resultType === 'fifty_move_rule') { return 'Draw by 50-move rule.' }
		if (this.board._resultType === 'threefold_repetition') { return 'Draw by threefold repetition.' }
		return 'Draw by stalemate.'
	}

	failInteractiveMatch(error){
		if (!this.playConfig || this._completionSubmitted) { throw error }
		this._completionSubmitted = true
		this.updatePlayStatus('Game failed. Redirecting to match details...')
		this.persistInteractiveMatch({
			match: {
				status: 'failed',
				error_message: `${error.name || 'Error'}: ${error.message || error}`
			}
		})
	}

	persistInteractiveMatch(payload){
		fetch(this.playConfig.completeUrl, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
			},
			body: JSON.stringify(payload)
		})
			.then(response => {
				if (!response.ok) { throw new Error(`Match save failed with ${response.status}`) }
				return response.json()
			})
			.then(data => {
				window.location.href = data.redirect_url || this.playConfig.replayUrl
			})
			.catch(error => {
				this.updatePlayStatus(`Could not save match: ${error.message}`)
			})
	}

	updatePlayStatus(message){
		const status = this.rootElement?.querySelector('[data-play-status]')
		if (status) { status.textContent = message }
	}
}

export default GameController
