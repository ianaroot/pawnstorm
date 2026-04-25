import { beforeEach, describe, expect, it } from 'vitest'

import Board from 'chess_engine/board'
import Layout from 'chess_engine/layout'
import MatchReplayController from 'replay/match_replay_controller'
import NotationResolver from 'chess_engine/notation_resolver'

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
})
