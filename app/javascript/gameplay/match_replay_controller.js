import Board from "gameplay/board"
import ReplayView, { buildReplayBoard } from "gameplay/replay_view"

class MatchReplayController {
  constructor({ rootElement, intervalMs = 1000 }) {
    this.rootElement = rootElement
    this.intervalMs = intervalMs
    this.view = new ReplayView({ rootElement })
    this.playButton = rootElement.querySelector('[data-match-replay-target="play-button"]')
    this.playButton?.addEventListener('click', this.togglePlayback.bind(this))

    this.intervalId = null
    this.isPlaying = false
    this.currentMoveIndex = -1
    this.warning = null

    this.previousLayouts = JSON.parse(rootElement.dataset.previousLayouts)
    this.finalLayout = JSON.parse(rootElement.dataset.finalLayout)
    this.movementNotation = JSON.parse(rootElement.dataset.movementNotation)
    this.result = rootElement.dataset.result

    this.frames = this.buildFrames()
    this.movePairs = this.buildMovePairs()
    this.renderCurrentFrame()
  }

  buildFrames() {
    const layouts = [...this.previousLayouts, this.finalLayout]
    const frames = []
    const capturedPieces = []

    for (let i = 0; i < layouts.length; i++) {
      if (i > 0) {
        const moveNotation = this.movementNotation[i - 1]
        const capturedPiece = this.detectCapturedPiece({
          previousLayout: layouts[i - 1],
          nextLayout: layouts[i],
          moveNotation
        })

        if (capturedPiece) {
          capturedPieces.push(capturedPiece)
        }
      }

      frames.push({
        layout: layouts[i],
        capturedPieces: [...capturedPieces],
        allowedToMove: i % 2 === 0 ? Board.WHITE : Board.BLACK
      })
    }

    return frames
  }

  buildMovePairs() {
    const movePairs = []

    for (let i = 0; i < this.movementNotation.length; i += 2) {
      movePairs.push([this.movementNotation[i], this.movementNotation[i + 1] || null])
    }

    return movePairs
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  play() {
    if (this.currentMoveIndex >= this.movementNotation.length - 1) { return }

    this.isPlaying = true
    this.renderCurrentFrame()
    this.intervalId = window.setInterval(() => this.stepForward(), this.intervalMs)
  }

  pause() {
    this.isPlaying = false
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.renderCurrentFrame()
  }

  stepForward() {
    if (this.currentMoveIndex >= this.movementNotation.length - 1) {
      this.pause()
      return
    }

    this.currentMoveIndex += 1
    this.renderCurrentFrame()

    if (this.currentMoveIndex >= this.movementNotation.length - 1) {
      this.pause()
    }
  }

  renderCurrentFrame() {
    const frameIndex = this.currentMoveIndex + 1
    const frame = this.frames[frameIndex]

    const board = buildReplayBoard({
      layout: frame.layout,
      capturedPieces: frame.capturedPieces,
      allowedToMove: frame.allowedToMove
    })

    this.view.renderFrame({
      board,
      currentMoveIndex: this.currentMoveIndex,
      isPlaying: this.isPlaying,
      movePairs: this.movePairs,
      result: this.result,
      totalMoves: this.movementNotation.length,
      warning: this.warning
    })
  }

  detectCapturedPiece({ previousLayout, nextLayout, moveNotation }) {
    const disappearedPieces = []

    for (let i = 0; i < previousLayout.length; i++) {
      const previousPiece = previousLayout[i]
      const nextPiece = nextLayout[i]

      if (previousPiece !== Board.EMPTY_SQUARE && nextPiece === Board.EMPTY_SQUARE) {
        disappearedPieces.push(previousPiece)
      }
    }

    if (disappearedPieces.length === 0) { return null }
    if (disappearedPieces.length === 1) { return disappearedPieces[0] }

    const promotionCapturePiece = this.detectPromotionCapture(disappearedPieces, moveNotation)
    if (promotionCapturePiece) { return promotionCapturePiece }

    const warning = `Unexpected replay transition after ${moveNotation}: ${disappearedPieces.join(', ')} disappeared`
    console.warn(warning)
    this.warning = warning
    return null
  }

  detectPromotionCapture(disappearedPieces, moveNotation) {
    if (!moveNotation.includes('=')) { return null }

    const pawn = disappearedPieces.find(piece => Board.parseSpecies(piece) === Board.PAWN)
    const capturedPiece = disappearedPieces.find(piece => Board.parseSpecies(piece) !== Board.PAWN)

    if (pawn && capturedPiece) { return capturedPiece }

    return null
  }
}

export default MatchReplayController
