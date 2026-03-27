import Board from "gameplay/board"
import {
  clearAlerts,
  displayAlerts,
  renderBoardPieces,
  updateCaptureAreaSizing,
  updateCaptures,
  updateTeamAllowedToMove
} from "gameplay/view_utils"

class ReplayView {
  constructor({ rootElement }) {
    this.rootElement = rootElement
    this.playButton = rootElement.querySelector('[data-match-replay-target="play-button"]')
    this.statusElement = rootElement.querySelector('[data-match-replay-target="status"]')
    this.resultElement = rootElement.querySelector('[data-match-replay-target="result"]')
    this.notationElement = rootElement.querySelector('[data-match-replay-target="notation"]')
    this.warningElement = rootElement.querySelector('[data-match-replay-target="warning"]')
  }

  renderFrame({ board, currentMoveIndex, isPlaying, movePairs, result, totalMoves, warning }) {
    renderBoardPieces(board)
    updateCaptureAreaSizing(board)
    updateCaptures(board)
    clearAlerts()
    updateTeamAllowedToMove(board)
    displayAlerts("")
    this.renderStatus({ currentMoveIndex, totalMoves })
    this.renderControls({ isPlaying })
    this.renderResult(result)
    this.renderWarning(warning)
    this.renderNotation({ movePairs, currentMoveIndex })
  }

  renderStatus({ currentMoveIndex, totalMoves }) {
    if (!this.statusElement) { return }

    if (currentMoveIndex === -1) {
      this.statusElement.innerText = "Start position"
      return
    }

    if (currentMoveIndex >= totalMoves - 1) {
      this.statusElement.innerText = `Final position after move ${currentMoveIndex + 1}`
      return
    }

    this.statusElement.innerText = `Move ${currentMoveIndex + 1} of ${totalMoves}`
  }

  renderControls({ isPlaying }) {
    if (!this.playButton) { return }
    this.playButton.innerText = isPlaying ? "Pause" : "Play"
  }

  renderResult(result) {
    if (!this.resultElement) { return }
    this.resultElement.innerText = result.replaceAll('_', ' ')
  }

  renderWarning(warning) {
    if (!this.warningElement) { return }

    this.warningElement.innerText = warning || ""
    this.warningElement.hidden = !warning
  }

  renderNotation({ movePairs, currentMoveIndex }) {
    if (!this.notationElement) { return }

    this.notationElement.innerHTML = ""

    for (let i = 0; i < movePairs.length; i++) {
      const [whiteMove, blackMove] = movePairs[i]
      const row = document.createElement("li")
      row.className = "match-replay-notation-row"

      const whiteSpan = document.createElement("span")
      whiteSpan.className = "match-replay-move"
      whiteSpan.innerText = whiteMove
      if (currentMoveIndex === i * 2) {
        whiteSpan.classList.add("match-replay-move--current")
      }
      row.appendChild(whiteSpan)

      if (blackMove) {
        const blackSpan = document.createElement("span")
        blackSpan.className = "match-replay-move"
        blackSpan.innerText = blackMove
        if (currentMoveIndex === i * 2 + 1) {
          blackSpan.classList.add("match-replay-move--current")
        }
        row.appendChild(blackSpan)
      }

      this.notationElement.appendChild(row)
    }
  }
}

export function buildReplayBoard({ layout, capturedPieces, allowedToMove }) {
  return new Board({
    layOut: layout,
    capturedPieces,
    allowedToMove,
    movementNotation: [],
    previousLayouts: []
  })
}

export default ReplayView
