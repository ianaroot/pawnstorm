import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import GameController from 'gameplay/game_controller'

function buildRoot() {
  const root = document.createElement('div')
  root.dataset.gameMode = 'human-vs-bot'
  root.dataset.humanTeam = Board.WHITE
  root.dataset.botTeam = Board.BLACK
  root.dataset.botName = 'Clone newBot!'
  root.innerHTML = `
    <p class="match-show-meta-item"><span data-human-side-label></span></p>
    <p class="match-show-meta-item"><span data-bot-name-label></span></p>
    <p class="match-show-meta-item"><span data-bot-side-label></span></p>
    <p class="match-show-meta-item" data-play-status></p>
  `
  return root
}

function buildController(rootElement, allowedToMove = Board.WHITE) {
  const controller = Object.create(GameController.prototype)
  controller.rootElement = rootElement
  controller.playConfig = {
    humanTeam: rootElement.dataset.humanTeam,
    botTeam: rootElement.dataset.botTeam,
    botName: rootElement.dataset.botName
  }
  controller.board = {
    allowedToMove,
    gameOver: false
  }
  return controller
}

describe('GameController live match status', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the participants and your turn when the human is to move', () => {
    const root = buildRoot()
    document.body.appendChild(root)
    const controller = buildController(root, Board.WHITE)

    controller.updateLiveMatchStatus()

    expect(root.querySelector('[data-human-side-label]').textContent).toBe('White')
    expect(root.querySelector('[data-bot-name-label]').textContent).toBe('Clone newBot!')
    expect(root.querySelector('[data-bot-side-label]').textContent).toBe('Black')
    expect(root.querySelector('[data-play-status]').textContent).toBe('Your turn.')
    expect(root.querySelector('[data-play-status]').classList.contains('match-live-status-pill--human')).toBe(true)
  })

  it('shows bot turn when the bot is to move', () => {
    const root = buildRoot()
    document.body.appendChild(root)
    const controller = buildController(root, Board.BLACK)

    controller.updateLiveMatchStatus()

    expect(root.querySelector('[data-play-status]').textContent).toBe("Bot's turn.")
  })

  it('shows game over when the match is finished', () => {
    const root = buildRoot()
    document.body.appendChild(root)
    const controller = buildController(root, Board.WHITE)
    controller.board.gameOver = true

    controller.updateLiveMatchStatus()

    expect(root.querySelector('[data-play-status]').textContent).toBe('Game over.')
  })
})
