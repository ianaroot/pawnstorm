import Board from "gameplay/board"
import Layout from "gameplay/layout"
import NotationResolver from "gameplay/notation_resolver"
import ReplayView, { buildReplayBoard } from "gameplay/replay_view"
import Sound from "gameplay/sound"

class MatchReplayController {
  constructor({ rootElement, intervalMs = 2000 }) {
    this.rootElement = rootElement
    this.intervalMs = intervalMs
    this.view = new ReplayView({ rootElement })
    this.playButton = rootElement.querySelector('[data-match-replay-target="play-button"]')
    this.playButton?.addEventListener('click', this.togglePlayback.bind(this))

    this.intervalId = null
    this.isPlaying = false
    this.currentMoveIndex = -1
    this.warning = null
    this.notationResolver = new NotationResolver()

    this.finalLayout = JSON.parse(rootElement.dataset.finalLayout)
    this.movementNotation = JSON.parse(rootElement.dataset.movementNotation)
    this.result = rootElement.dataset.result

    this.frames = this.buildFrames()
    this.totalPlayableMoves = this.frames.length - 1
    this.movePairs = this.buildMovePairs()
    this.renderCurrentFrame()
  }

  buildFrames() {
    const board = new Board({
      layOut: Layout.default(),
      capturedPieces: [],
      allowedToMove: Board.WHITE,
      movementNotation: [],
      previousLayouts: JSON.stringify([])
    })
    const frames = [this.snapshotBoard(board)]

    for (const notation of this.movementNotation) {
      try {
        const moveObject = this.notationResolver.resolve({ board, notation })
        board._officiallyMovePiece(moveObject)
        frames.push(this.snapshotBoard(board))
      } catch (error) {
        this.warning = `Replay stopped at ${notation}: ${error.message}`
        console.warn(this.warning)
        break
      }
    }

    if (frames.length > 0 && JSON.stringify(frames.at(-1).layout) !== JSON.stringify(this.finalLayout)) {
      this.warning = this.warning || 'Replay reconstruction did not match the persisted final layout.'
      console.warn(this.warning)
    }

    return frames
  }

  snapshotBoard(board) {
    return {
      layout: Board._deepCopy(board.layOut),
      capturedPieces: Board._deepCopy(board.capturedPieces),
      allowedToMove: board.allowedToMove
    }
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
    if (this.currentMoveIndex >= this.totalPlayableMoves - 1) { return }

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
    if (this.currentMoveIndex >= this.totalPlayableMoves - 1) {
      this.pause()
      return
    }

    this.currentMoveIndex += 1
    this.playReplaySound(this.movementNotation[this.currentMoveIndex])
    this.renderCurrentFrame()

    if (this.currentMoveIndex >= this.totalPlayableMoves - 1) {
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
      totalMoves: this.totalPlayableMoves,
      warning: this.warning
    })
  }

  playReplaySound(notation) {
    if (!notation) { return }

    if (notation.includes('+') || notation.includes('#')) {
      Sound.playSound('check')
      return
    }

    if (notation.includes('x')) {
      Sound.playSound('capture')
      return
    }

    Sound.playSound('move')
  }
}

export default MatchReplayController
