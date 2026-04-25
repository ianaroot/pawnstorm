import { beforeEach, describe, expect, it } from 'vitest'

import Board from 'chess_engine/board'
import Layout from 'chess_engine/layout'
import ReplayView, { buildReplayBoard } from 'replay/replay_view'

function buildRoot() {
  const root = document.createElement('div')
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

function appendTile(position) {
  const tile = document.createElement('div')
  tile.className = 'chess-tile'
  tile.id = Board.gridCalculator(position)
  document.body.appendChild(tile)
  return tile
}

function buildBoard() {
  return buildReplayBoard({
    layout: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE
  })
}

describe('ReplayView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('shows chosen move and explicitly inspected move with distinct highlight classes', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })
    const chosenTile = appendTile(9)
    const inspectedTile = appendTile(10)
    const tiedTile = appendTile(11)

    view.renderBoardHighlights({
      inspection: {
        enabled: true,
        selectedStartSquare: null,
        result: {
          currentChoiceKey: '1:9:none',
          currentChoiceMove: { moveObject: { startPosition: 1, endPosition: 9 } },
          explicitInspectedMoveKey: '2:10:none',
          inspectedMove: { moveObject: { startPosition: 2, endPosition: 10 } },
          tiedTopMoveKeys: ['3:11:none'],
          visibleMoves: [
            { key: '1:9:none', moveObject: { startPosition: 1, endPosition: 9 } },
            { key: '2:10:none', moveObject: { startPosition: 2, endPosition: 10 } },
            { key: '3:11:none', moveObject: { startPosition: 3, endPosition: 11 } }
          ]
        }
      },
      muteTopMoveHighlights: false
    })

    expect(chosenTile.classList.contains('match-replay-square--chosen-move')).toBe(true)
    expect(inspectedTile.classList.contains('match-replay-square--inspected-move')).toBe(true)
    expect(tiedTile.classList.contains('match-replay-square--tied-move')).toBe(true)
  })

  it('mutes chosen and tied highlights while keeping piece candidate highlights', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })
    const selectedPieceTile = appendTile(1)
    const chosenTile = appendTile(9)
    const candidateTile = appendTile(10)

    view.renderBoardHighlights({
      inspection: {
        enabled: true,
        selectedStartSquare: Board.gridCalculator(1),
        result: {
          currentChoiceKey: '1:9:none',
          currentChoiceMove: { moveObject: { startPosition: 1, endPosition: 9 } },
          explicitInspectedMoveKey: null,
          inspectedMove: null,
          tiedTopMoveKeys: ['1:9:none'],
          visibleMoves: [
            { key: '1:9:none', moveObject: { startPosition: 1, endPosition: 9 } },
            { key: '1:10:none', moveObject: { startPosition: 1, endPosition: 10 } }
          ]
        }
      },
      muteTopMoveHighlights: true
    })

    expect(selectedPieceTile.classList.contains('match-replay-square--selected-piece')).toBe(true)
    expect(chosenTile.classList.contains('match-replay-square--chosen-move')).toBe(false)
    expect(candidateTile.classList.contains('match-replay-square--candidate-move')).toBe(true)
  })

  it('applies start and end classes for the last move', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })
    const startTile = appendTile(1)
    const endTile = appendTile(9)

    view.renderBoardHighlights({
      inspection: { enabled: false, result: null },
      muteTopMoveHighlights: false,
      lastMove: { startPosition: 1, endPosition: 9 }
    })

    expect(startTile.classList.contains('match-replay-square--last-move-start')).toBe(true)
    expect(endTile.classList.contains('match-replay-square--last-move-end')).toBe(true)
  })

  it('clears previous last-move classes on rerender', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })
    const firstStartTile = appendTile(1)
    const firstEndTile = appendTile(9)
    const secondStartTile = appendTile(2)
    const secondEndTile = appendTile(10)

    view.renderBoardHighlights({
      inspection: { enabled: false, result: null },
      muteTopMoveHighlights: false,
      lastMove: { startPosition: 1, endPosition: 9 }
    })

    view.renderBoardHighlights({
      inspection: { enabled: false, result: null },
      muteTopMoveHighlights: false,
      lastMove: { startPosition: 2, endPosition: 10 }
    })

    expect(firstStartTile.classList.contains('match-replay-square--last-move-start')).toBe(false)
    expect(firstEndTile.classList.contains('match-replay-square--last-move-end')).toBe(false)
    expect(secondStartTile.classList.contains('match-replay-square--last-move-start')).toBe(true)
    expect(secondEndTile.classList.contains('match-replay-square--last-move-end')).toBe(true)
  })

  it('does not apply last-move classes when lastMove is null', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })
    const tile = appendTile(1)

    view.renderBoardHighlights({
      inspection: { enabled: false, result: null },
      muteTopMoveHighlights: false,
      lastMove: null
    })

    expect(tile.classList.contains('match-replay-square--last-move-start')).toBe(false)
    expect(tile.classList.contains('match-replay-square--last-move-end')).toBe(false)
  })

  it('shows the hidden spoiler message with a reveal button before reveal', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })

    view.renderFrame({
      board: buildBoard(),
      currentMoveIndex: 0,
      isPlaying: false,
      playDirection: 1,
      speedMultiplier: 1,
      movePairs: [['e4', 'e5']],
      result: 'white_wins',
      totalMoves: 2,
      spoilerRevealed: false,
      warning: null,
      inspection: { enabled: false, result: null },
      muteTopMoveHighlights: false
    })

    const resultElement = root.querySelector('[data-match-replay-target="result"]')
    const revealButton = resultElement.querySelector('[data-match-replay-spoiler-reveal]')

    expect(resultElement.textContent).toBe('Result hidden to avoid spoilers. Click HERE to reveal results early.')
    expect(revealButton).not.toBeNull()
    expect(revealButton.type).toBe('button')
  })

  it('shows the formatted result after the spoiler is revealed', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })

    view.renderFrame({
      board: buildBoard(),
      currentMoveIndex: 0,
      isPlaying: false,
      playDirection: 1,
      speedMultiplier: 1,
      movePairs: [['e4', 'e5']],
      result: 'white_wins',
      totalMoves: 2,
      spoilerRevealed: true,
      warning: null,
      inspection: { enabled: false, result: null },
      muteTopMoveHighlights: false
    })

    expect(root.querySelector('[data-match-replay-target="result"]').textContent).toBe('white wins')
  })

  it('shows a trace-unavailable message instead of hiding the trace column', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })

    view.renderFrame({
      board: buildBoard(),
      currentMoveIndex: 0,
      isPlaying: false,
      playDirection: 1,
      speedMultiplier: 1,
      movePairs: [['e4', 'e5']],
      result: 'white_wins',
      totalMoves: 2,
      spoilerRevealed: true,
      warning: null,
      inspection: {
        enabled: false,
        result: null,
        unavailableMessage: "condition trace unavailable for other players' bots"
      },
      muteTopMoveHighlights: false
    })

    expect(root.querySelector('[data-match-replay-target="trace-panel"]').hidden).toBe(false)
    expect(root.querySelector('[data-match-replay-target="trace-summary"]').textContent).toBe('')
    expect(root.querySelector('[data-match-replay-target="trace-branches"]').textContent)
      .toContain("condition trace unavailable for other players' bots")
  })

  it('rehydrates replay boards with history needed for trace scoring', () => {
    const recentMoveContext = {
      movingTeam: Board.BLACK,
      movedPieceStartPosition: 48,
      movedPieceEndPosition: 32,
      movedPieceSpeciesBeforeMove: Board.PAWN,
      movedPieceSpeciesAfterMove: Board.PAWN,
      capturedPiecePosition: null,
      capturedPieceSpecies: null,
      moveObject: { startPosition: 48, endPosition: 32 }
    }
    const board = buildReplayBoard({
      layout: Layout.default(),
      capturedPieces: [],
      allowedToMove: Board.WHITE,
      movementNotation: ['1. e4', 'a5'],
      recentMoveContext,
      halfmoveClock: 12,
      positionKeys: ['initial-position', 'after-e4']
    })

    expect(board.movementNotation).toEqual(['1. e4', 'a5'])
    expect(board.recentMoveContext).toEqual(recentMoveContext)
    expect(board.history.halfmoveClock).toBe(12)
    expect(board.history.positionKeys).toEqual(['initial-position', 'after-e4'])
  })
})
