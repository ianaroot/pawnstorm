import Board from 'gameplay/board'
import profileCollector from 'gameplay/profile_collector'

class MatchRunner {
  constructor({ board, moveProviders }, options = {}) {
    this.board = board
    this.moveProviders = moveProviders
    this.onMoveApplied = options.onMoveApplied || null
  }

  moveProviderFor(team) {
    const provider = this.moveProviders[team]
    if (!provider) { throw new Error(`No move provider configured for team: ${team}`) }
    return provider
  }

  selectMove() {
    return profileCollector.measure('match.select_move', () => {
      if (this.board.gameOver) { return null }
      const team = this.board.allowedToMove
      const provider = this.moveProviderFor(team)

      if (typeof provider === 'function') { return provider({ board: this.board, team }) }
      if (typeof provider.selectMove === 'function') { return provider.selectMove({ board: this.board, team }) }
      throw new Error(`Invalid move provider for team: ${team}`)
    })
  }

  playTurn() {
    return profileCollector.measure('match.play_turn', () => {
      if (this.board.gameOver) { return null }
      const team = this.board.allowedToMove
      const moveObject = this.selectMove()
      if (moveObject === null) { return null }
      this.board._officiallyMovePiece(moveObject)
      const result = { team, moveObject }
      if (this.onMoveApplied) { this.onMoveApplied(result) }
      return result
    })
  }

  play({ maxPlies = Infinity } = {}) {
    return profileCollector.measure('match.play', () => {
      const turns = []
      while (!this.board.gameOver && turns.length < maxPlies) {
        const turn = this.playTurn()
        if (turn === null) { break }
        turns.push(turn)
      }
      profileCollector.increment('match.turns', turns.length)
      return turns
    })
  }
}

MatchRunner.WHITE = Board.WHITE
MatchRunner.BLACK = Board.BLACK

export default MatchRunner
