import { beforeEach, describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import Layout from 'gameplay/layout'
import MatchReplayController from 'gameplay/match_replay_controller'
import NotationResolver from 'gameplay/notation_resolver'

function buildRoot({ finalLayout, movementNotation }) {
  const root = document.createElement('div')
  root.dataset.finalLayout = JSON.stringify(finalLayout)
  root.dataset.movementNotation = JSON.stringify(movementNotation)
  root.dataset.result = 'threefold_repetition'
  root.dataset.currentUserId = '1'
  root.dataset.whiteBotOwnerId = ''
  root.dataset.blackBotOwnerId = ''
  root.dataset.whiteCompiledProgramSnapshot = ''
  root.dataset.blackCompiledProgramSnapshot = ''
  root.innerHTML = `
    <button data-match-replay-target="play-button"></button>
    <button data-match-replay-target="reverse-button"></button>
    <button data-match-replay-target="back-button"></button>
    <button data-match-replay-target="forward-button"></button>
    <button data-match-replay-target="start-button"></button>
    <button data-match-replay-target="top-moves-toggle"></button>
    <div data-match-replay-target="result"></div>
    <ol data-match-replay-target="notation"></ol>
    <div data-match-replay-target="warning"></div>
    <div data-match-replay-target="trace-panel"></div>
    <div data-match-replay-target="trace-summary"></div>
    <div data-match-replay-target="trace-branches"></div>
  `

  return root
}

function boardAfter(movementNotation) {
  const board = new Board({
    layOut: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: []
  })
  const notationResolver = new NotationResolver()
  movementNotation.forEach(notation => {
    board._officiallyMovePiece(notationResolver.resolve({ board, notation }))
  })
  return board
}

describe('MatchReplayController', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('rehydrates current boards with replay history for trace inspection', () => {
    const movementNotation = ['1. e4', 'a5']
    const finalBoard = boardAfter(movementNotation)
    const root = buildRoot({
      finalLayout: finalBoard.layOut,
      movementNotation
    })
    document.body.appendChild(root)

    const controller = new MatchReplayController({ rootElement: root })
    controller.currentMoveIndex = 1

    const board = controller.currentBoard()
    expect(board.movementNotation).toEqual(movementNotation)
    expect(board.recentMoveContext).toMatchObject({
      movingTeam: Board.BLACK,
      movedPieceStartPosition: 48,
      movedPieceEndPosition: 32,
      movedPieceSpeciesBeforeMove: Board.PAWN,
      movedPieceSpeciesAfterMove: Board.PAWN
    })
    expect(board.history.halfmoveClock).toBe(finalBoard.history.halfmoveClock)
    expect(board.history.positionKeys).toEqual(finalBoard.history.positionKeys)
  })

  it('distinguishes human players from other users\' bots when condition tracing is unavailable', () => {
    const root = buildRoot({
      finalLayout: Layout.default(),
      movementNotation: []
    })
    document.body.appendChild(root)

    const controller = new MatchReplayController({ rootElement: root })
    controller.currentMoveIndex = 0
    controller.totalPlayableMoves = 2

    const humanBoard = new Board({
      layOut: Layout.default(),
      capturedPieces: [],
      allowedToMove: Board.WHITE,
      movementNotation: []
    })
    controller.whiteBotOwnerId = null
    const humanInspection = controller.inspectionContextForBoard(humanBoard)
    expect(humanInspection.unavailableMessage).toBe('condition trace unavailable for human players')

    const botBoard = new Board({
      layOut: Layout.default(),
      capturedPieces: [],
      allowedToMove: Board.BLACK,
      movementNotation: []
    })
    controller.blackBotOwnerId = 2
    const botInspection = controller.inspectionContextForBoard(botBoard)
    expect(botInspection.unavailableMessage).toBe("condition trace unavailable for other players' bots")
  })

  it('hints the play and forward buttons until forward or play is used', () => {
    const root = buildRoot({ finalLayout: Layout.default(), movementNotation: [] })
    document.body.appendChild(root)

    new MatchReplayController({ rootElement: root })
    const play = root.querySelector('[data-match-replay-target="play-button"]')
    const forward = root.querySelector('[data-match-replay-target="forward-button"]')

    expect(play.classList.contains('replay-control--hint')).toBe(true)
    expect(forward.classList.contains('replay-control--hint')).toBe(true)

    forward.dispatchEvent(new Event('click'))

    expect(play.classList.contains('replay-control--hint')).toBe(false)
    expect(forward.classList.contains('replay-control--hint')).toBe(false)
  })

  it('flips the board to the viewer when they own the black bot', () => {
    const root = buildRoot({ finalLayout: Layout.default(), movementNotation: [] })
    root.dataset.blackBotOwnerId = '1'
    root.dataset.whiteName = 'Alice'
    root.dataset.blackName = 'Bob'
    document.body.appendChild(root)

    const controller = new MatchReplayController({ rootElement: root })
    root.insertAdjacentHTML('beforeend', `
      <div id="arena">
        <div class="board-player-name" data-board-name="top"></div>
        <table id="chess-board"></table>
        <div class="board-player-name" data-board-name="bottom"></div>
      </div>
    `)
    controller.applyOrientation()

    expect(root.querySelector('#chess-board').classList.contains('flipped')).toBe(true)
    expect(root.querySelector('[data-board-name="bottom"]').textContent).toBe('Bob')
    expect(root.querySelector('[data-board-name="bottom"]').dataset.team).toBe('B')
  })
})
