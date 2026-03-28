import { beforeEach, describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import ReplayView from 'gameplay/replay_view'

function buildRoot() {
  const root = document.createElement('div')
  root.innerHTML = `
    <button data-match-replay-target="play-button"></button>
    <button data-match-replay-target="reverse-button"></button>
    <button data-match-replay-target="back-button"></button>
    <button data-match-replay-target="forward-button"></button>
    <button data-match-replay-target="start-button"></button>
    <button data-match-replay-target="selected-move-toggle"></button>
    <div data-match-replay-target="status"></div>
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

describe('ReplayView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('shows chosen move and explicitly selected move with distinct highlight classes', () => {
    const root = buildRoot()
    const view = new ReplayView({ rootElement: root })
    const chosenTile = appendTile(9)
    const selectedTile = appendTile(10)
    const tiedTile = appendTile(11)

    view.renderBoardHighlights({
      inspection: {
        enabled: true,
        selectedStartSquare: null,
        result: {
          currentChoiceKey: '1:9:none',
          currentChoiceMove: { moveObject: { startPosition: 1, endPosition: 9 } },
          explicitSelectedMoveKey: '2:10:none',
          selectedMove: { moveObject: { startPosition: 2, endPosition: 10 } },
          tiedTopMoveKeys: ['3:11:none'],
          visibleMoves: [
            { key: '1:9:none', moveObject: { startPosition: 1, endPosition: 9 } },
            { key: '2:10:none', moveObject: { startPosition: 2, endPosition: 10 } },
            { key: '3:11:none', moveObject: { startPosition: 3, endPosition: 11 } }
          ]
        }
      },
      muteSelectedMoveHighlight: false
    })

    expect(chosenTile.classList.contains('match-replay-square--chosen-move')).toBe(true)
    expect(selectedTile.classList.contains('match-replay-square--selected-move')).toBe(true)
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
          explicitSelectedMoveKey: null,
          selectedMove: null,
          tiedTopMoveKeys: ['1:9:none'],
          visibleMoves: [
            { key: '1:9:none', moveObject: { startPosition: 1, endPosition: 9 } },
            { key: '1:10:none', moveObject: { startPosition: 1, endPosition: 10 } }
          ]
        }
      },
      muteSelectedMoveHighlight: true
    })

    expect(selectedPieceTile.classList.contains('match-replay-square--selected-piece')).toBe(true)
    expect(chosenTile.classList.contains('match-replay-square--chosen-move')).toBe(false)
    expect(candidateTile.classList.contains('match-replay-square--candidate-move')).toBe(true)
  })
})
