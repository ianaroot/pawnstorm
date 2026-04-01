import Board from "gameplay/board"
import Layout from "gameplay/layout"
import NotationResolver from "gameplay/notation_resolver"
import ReplayMoveInspector from "gameplay/replay_move_inspector"
import ReplayView, { buildReplayBoard } from "gameplay/replay_view"
import Sound from "gameplay/sound"

class MatchReplayController {
  constructor({ rootElement, intervalMs = 1250 }) {
    this.rootElement = rootElement
    this.baseIntervalMs = intervalMs
    this.speedMultiplier = 1
    this.intervalMs = intervalMs
    this.view = new ReplayView({ rootElement })
    this.playButton = rootElement.querySelector('[data-match-replay-target="play-button"]')
    this.reverseButton = rootElement.querySelector('[data-match-replay-target="reverse-button"]')
    this.backButton = rootElement.querySelector('[data-match-replay-target="back-button"]')
    this.forwardButton = rootElement.querySelector('[data-match-replay-target="forward-button"]')
    this.startButton = rootElement.querySelector('[data-match-replay-target="start-button"]')
    this.selectedMoveToggle = rootElement.querySelector('[data-match-replay-target="selected-move-toggle"]')
    this.notationElement = rootElement.querySelector('[data-match-replay-target="notation"]')
    this.boardElement = rootElement.querySelector('#chess-board')
    this.speedButtons = rootElement.querySelectorAll('[data-match-replay-target="speed-button"]')
    this.playButton?.addEventListener('click', () => this.togglePlayback(1))
    this.reverseButton?.addEventListener('click', () => this.togglePlayback(-1))
    this.backButton?.addEventListener('click', this.stepBackwardOnce.bind(this))
    this.forwardButton?.addEventListener('click', this.stepForwardOnce.bind(this))
    this.startButton?.addEventListener('click', this.jumpToStart.bind(this))
    this.selectedMoveToggle?.addEventListener('click', this.toggleSelectedMoveHighlight.bind(this))
    this.notationElement?.addEventListener('click', this.jumpToNotationMove.bind(this))
    this.boardElement?.addEventListener('click', this.handleBoardClick.bind(this))
    this.speedButtons.forEach(button => {
      button.addEventListener('click', () => this.setSpeed(Number(button.dataset.speedMultiplier)))
    })

    this.intervalId = null
    this.isPlaying = false
    this.playDirection = 1
    this.currentMoveIndex = -1
    this.warning = null
    this.notationResolver = new NotationResolver()

    this.finalLayout = JSON.parse(rootElement.dataset.finalLayout)
    this.movementNotation = JSON.parse(rootElement.dataset.movementNotation)
    this.result = rootElement.dataset.result
    this.currentUserId = Number(rootElement.dataset.currentUserId)
    this.whiteBotOwnerId = rootElement.dataset.whiteBotOwnerId ? Number(rootElement.dataset.whiteBotOwnerId) : null
    this.blackBotOwnerId = rootElement.dataset.blackBotOwnerId ? Number(rootElement.dataset.blackBotOwnerId) : null
    this.whiteCompiledProgramSnapshot = this.parseCompiledProgramSnapshot(rootElement.dataset.whiteCompiledProgramSnapshot)
    this.blackCompiledProgramSnapshot = this.parseCompiledProgramSnapshot(rootElement.dataset.blackCompiledProgramSnapshot)

    this.frames = this.buildFrames()
    this.totalPlayableMoves = this.frames.length - 1
    this.movePairs = this.buildMovePairs()
    this.selectedStartPosition = null
    this.selectedMoveKey = null
    this.muteSelectedMoveHighlight = false
    this.renderCurrentFrame()
  }

  parseCompiledProgramSnapshot(snapshotJson) {
    if (!snapshotJson) { return null }
    return JSON.parse(snapshotJson)
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

  atStart() {
    return this.currentMoveIndex <= -1
  }

  atEnd() {
    return this.currentMoveIndex >= this.totalPlayableMoves - 1
  }

  setIntervalMs() {
    this.intervalMs = Math.round(this.baseIntervalMs / this.speedMultiplier)
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier
    this.setIntervalMs()

    if (this.isPlaying) {
      this.restartPlayback()
      return
    }

    this.renderCurrentFrame()
  }

  togglePlayback(direction) {
    if (this.isPlaying && this.playDirection === direction) {
      this.pause()
    } else {
      this.play(direction)
    }
  }

  play(direction = 1) {
    if ((direction === 1 && this.atEnd()) || (direction === -1 && this.atStart())) { return }

    this.isPlaying = true
    this.playDirection = direction
    this.renderCurrentFrame()
    this.startPlayback()
  }

  startPlayback() {
    this.stopPlaybackTimer()
    this.intervalId = window.setInterval(() => this.stepByDirection(), this.intervalMs)
  }

  restartPlayback() {
    if (!this.isPlaying) { return }
    this.startPlayback()
  }

  stopPlaybackTimer() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  pause() {
    this.isPlaying = false
    this.stopPlaybackTimer()
    this.renderCurrentFrame()
  }

  stepByDirection() {
    if (this.playDirection === -1) {
      this.stepBackward()
      return
    }

    this.stepForward()
  }

  stepForward() {
    if (this.atEnd()) {
      this.pause()
      return
    }

    this.currentMoveIndex += 1
    this.resetInspectionSelection()
    this.playReplaySound(this.movementNotation[this.currentMoveIndex])
    this.renderCurrentFrame()

    if (this.atEnd()) {
      this.pause()
    }
  }

  stepBackward() {
    if (this.atStart()) {
      this.pause()
      return
    }

    this.playReplaySound(this.movementNotation[this.currentMoveIndex])
    this.currentMoveIndex -= 1
    this.resetInspectionSelection()
    this.renderCurrentFrame()

    if (this.atStart()) {
      this.pause()
    }
  }

  stepBackwardOnce() {
    if (this.isPlaying) {
      this.pause()
    }

    this.stepBackward()
  }

  stepForwardOnce() {
    if (this.isPlaying) {
      this.pause()
    }

    this.stepForward()
  }

  toggleSelectedMoveHighlight() {
    this.muteSelectedMoveHighlight = !this.muteSelectedMoveHighlight
    this.renderCurrentFrame()
  }

  jumpToStart() {
    if (this.isPlaying) {
      this.pause()
    }

    this.currentMoveIndex = -1
    this.resetInspectionSelection()
    this.renderCurrentFrame()
  }

  jumpToNotationMove(event) {
    const moveButton = event.target.closest('[data-move-index]')
    if (!moveButton) { return }

    if (this.isPlaying) {
      this.pause()
    }

    this.currentMoveIndex = Number(moveButton.dataset.moveIndex)
    this.resetInspectionSelection()
    this.renderCurrentFrame()
  }

  handleBoardClick(event) {
    if (this.isPlaying) { return }

    const tile = event.target.closest('.chess-tile')
    if (!tile) { return }

    const board = this.currentBoard()
    const inspection = this.inspectionContextForBoard(board)
    if (!inspection.enabled || !inspection.result) { return }

    const square = tile.id
    const position = Board.gridCalculatorReverse(square)
    const clickedVisibleMove = inspection.result.visibleMoves.find(result => (
      Board.gridCalculator(result.moveObject.endPosition) === square
    ))

    if (clickedVisibleMove) {
      this.selectedMoveKey = clickedVisibleMove.key
      this.renderCurrentFrame()
      return
    }

    if (board.teamAt(position) === inspection.team) {
      this.selectedStartPosition = this.selectedStartPosition === position ? null : position
      this.selectedMoveKey = null
      this.renderCurrentFrame()
      return
    }

    this.selectedStartPosition = null
    this.selectedMoveKey = null
    this.renderCurrentFrame()
  }

  resetInspectionSelection() {
    this.selectedStartPosition = null
    this.selectedMoveKey = null
  }

  currentBoard() {
    const frameIndex = this.currentMoveIndex + 1
    const frame = this.frames[frameIndex]

    return buildReplayBoard({
      layout: frame.layout,
      capturedPieces: frame.capturedPieces,
      allowedToMove: frame.allowedToMove
    })
  }

  inspectionContextForBoard(board) {
    const team = board.allowedToMove
    const ownerId = team === Board.WHITE ? this.whiteBotOwnerId : this.blackBotOwnerId
    const compiledProgram = team === Board.WHITE
      ? this.whiteCompiledProgramSnapshot
      : this.blackCompiledProgramSnapshot

    if (this.atEnd()) {
      return { enabled: false, team, compiledProgram: null, result: null, selectedStartSquare: null }
    }

    if (ownerId !== this.currentUserId || !compiledProgram) {
      return { enabled: false, team, compiledProgram: null, result: null, selectedStartSquare: null }
    }

    const inspector = new ReplayMoveInspector({ compiledProgram })
    const result = inspector.inspectPosition({
      board,
      selectedMoveKey: this.selectedMoveKey,
      restrictToStartPosition: this.selectedStartPosition,
      autoSelectVisibleMove: !(this.selectedStartPosition && this.selectedMoveKey === null)
    })

    if (this.selectedMoveKey !== result.explicitSelectedMoveKey) {
      this.selectedMoveKey = result.explicitSelectedMoveKey
    }

    return {
      enabled: true,
      team,
      compiledProgram,
      result,
      selectedStartSquare: this.selectedStartPosition === null
        ? null
        : Board.gridCalculator(this.selectedStartPosition)
    }
  }

  renderCurrentFrame() {
    const board = this.currentBoard()
    const inspection = this.inspectionContextForBoard(board)

    this.view.renderFrame({
      board,
      currentMoveIndex: this.currentMoveIndex,
      isPlaying: this.isPlaying,
      playDirection: this.playDirection,
      speedMultiplier: this.speedMultiplier,
      movePairs: this.movePairs,
      result: this.result,
      totalMoves: this.totalPlayableMoves,
      warning: this.warning,
      inspection,
      muteSelectedMoveHighlight: this.muteSelectedMoveHighlight
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
