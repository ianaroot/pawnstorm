import generateConditionExamples from 'editorV2/panels/condition_preview/ConditionExampleGenerator'
import Board from 'gameplay/board'
import Sound from 'gameplay/sound'

const PRIOR_DWELL  = 1500
const PIECE_FADE   = 220
const AFTER_DWELL  = 2400
const BOARD_FADE   = 250
const HALF_BEAT    = 400

const PIECE_GLYPHS = {
  WK: '♔', WQ: '♕', WR: '♖', WB: '♗', WN: '♘', WP: '♙',
  BK: '♚', BQ: '♛', BR: '♜', BB: '♝', BN: '♞', BP: '♟'
}

// ── DOM helpers ──────────────────────────────────────────────────────────────

function buildMiniBoardEl() {
  const wrapper = document.createElement('div')
  wrapper.className = 'mini-board'
  const table = document.createElement('table')
  table.className = 'mini-board__table'
  for (let rank = 7; rank >= 0; rank--) {
    const tr = document.createElement('tr')
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file
      const td = document.createElement('td')
      td.className = `mini-board__tile mini-board__tile--${Board.squareColor(index)}`
      td.dataset.index = index
      tr.appendChild(td)
    }
    table.appendChild(tr)
  }
  wrapper.appendChild(table)
  return wrapper
}

function renderLayout(boardEl, layout, highlights) {
  const subjectPositions  = new Set(highlights.subjectPositions || [])
  const targetPositions   = new Set(highlights.targetPositions || [])
  const movedStartPosition = highlights.movedStartPosition
  const movedEndPosition   = highlights.movedEndPosition

  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    const i = parseInt(tile.dataset.index, 10)
    const piece = layout[i]
    tile.innerHTML = ''
    tile.classList.toggle('mini-board__tile--subject',    subjectPositions.has(i))
    tile.classList.toggle('mini-board__tile--target',     targetPositions.has(i))
    tile.classList.toggle('mini-board__tile--moved-start', movedStartPosition === i)
    tile.classList.toggle('mini-board__tile--moved-end',   movedEndPosition === i)
    if (piece && PIECE_GLYPHS[piece]) {
      const span = document.createElement('span')
      span.className = `mini-piece mini-piece--${piece[0]}`
      span.textContent = PIECE_GLYPHS[piece]
      tile.appendChild(span)
    }
  })
}

function renderPieceIntoTile(tile, piece) {
  tile.innerHTML = ''
  if (piece && PIECE_GLYPHS[piece]) {
    const span = document.createElement('span')
    span.className = `mini-piece mini-piece--${piece[0]}`
    span.textContent = PIECE_GLYPHS[piece]
    tile.appendChild(span)
  }
}

function syncBoardToLayout(boardEl, layout) {
  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    const index = parseInt(tile.dataset.index, 10)
    const expectedPiece = layout[index]
    const currentPiece = tile.querySelector('.mini-piece')?.textContent || null
    const expectedGlyph = PIECE_GLYPHS[expectedPiece] || null

    if (currentPiece === expectedGlyph) { return }
    renderPieceIntoTile(tile, expectedPiece)
  })
}

function applyHighlights(boardEl, highlights) {
  const subjectPositions   = new Set(highlights.subjectPositions || [])
  const targetPositions    = new Set(highlights.targetPositions || [])
  const movedStartPosition = highlights.movedStartPosition
  const movedEndPosition   = highlights.movedEndPosition

  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    const i = parseInt(tile.dataset.index, 10)
    tile.classList.toggle('mini-board__tile--subject',    subjectPositions.has(i))
    tile.classList.toggle('mini-board__tile--target',     targetPositions.has(i))
    tile.classList.toggle('mini-board__tile--moved-start', movedStartPosition === i)
    tile.classList.toggle('mini-board__tile--moved-end',   movedEndPosition === i)
  })
}

function debounce(fn, delay) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
}

// ── Class ────────────────────────────────────────────────────────────────────

class BoardStatePreview {
  constructor(wrap) {
    this.wrap       = wrap
    this.content    = wrap.querySelector('.board-state-preview__content')
    this.headerEl   = wrap.querySelector('.board-state-preview__header')
    this.toggleBtn  = wrap.querySelector('.board-state-preview__toggle')
    this.isEnabled  = true
    this.conditionForm = null
    this.examples      = []
    this.currentIndex  = 0
    this.status        = 'idle'
    this.reason        = ''
    this.isPlaying     = true
    this.isMuted       = true
    this._phase        = 'prior'
    this._stopped      = true
    this._phaseTimer   = null
    this._generationTimer = null
    this._boardEl      = null
    this._phaseLabel   = null
    this._playPauseBtn = null
    this._muteBtn      = null
    this._debouncedUpdate = debounce((payload) => this._update(payload), 250)

    this.toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggle()
    })
    this.mode = 'idle'
    this.selectionPreview = null
  }

  activate(conditionForm) {
    this._stopCycle()
    this.isEnabled = true
    this.mode = 'form'
    this.selectionPreview = null
    this.conditionForm = conditionForm
    this.wrap.classList.remove('hidden')
    conditionForm.onStateChange = (payload) => this._debouncedUpdate(payload)
    if (this.isEnabled) {
      this.content.classList.remove('hidden')
      this._debouncedUpdate(conditionForm.buildPayload())
    } else {
      this.content.classList.add('hidden')
    }
  }

  showSelectionPreview(preview) {
    this._stopCycle()
    if (this.conditionForm) { this.conditionForm.onStateChange = null }
    this.conditionForm = null
    this.mode = 'selection'
    this.selectionPreview = preview
    this.wrap.classList.remove('hidden')

    if (this.isEnabled) {
      this.content.classList.remove('hidden')
      this._applyPreview(preview)
    } else {
      this.content.classList.add('hidden')
    }
  }

  deactivate() {
    this._stopCycle()
    this._returnToggleToHeader()
    if (this.conditionForm) { this.conditionForm.onStateChange = null }
    this.conditionForm = null
    this.mode = 'idle'
    this.selectionPreview = null
    this._renderEmptyBoard()
    this.wrap.classList.add('hidden')
  }

  toggle() {
    this.isEnabled = !this.isEnabled
    if (this.isEnabled) {
      this.content.classList.remove('hidden')
      if (this.mode === 'form' && this.conditionForm) {
        this._update(this.conditionForm.buildPayload())
      } else if (this.mode === 'selection' && this.selectionPreview) {
        this._applyPreview(this.selectionPreview)
      }
    } else {
      this._stopCycle()
      this._returnToggleToHeader()
      if (this.toggleBtn) { this.toggleBtn.textContent = 'Show examples' }
      this._renderEmptyBoard()
      this.content.classList.add('hidden')
    }
  }

  _update(payload) {
    if (!this.isEnabled) { return }
    this._stopCycle()
    this._applyPreview({ status: 'loading', reason: 'Computing preview…', examples: [] })
    this._generationTimer = setTimeout(() => {
      this._applyPreview(generateConditionExamples(payload))
    }, 0)
  }

  _applyPreview(preview) {
    this.status = preview.status
    this.reason = preview.reason || ''
    this.examples = preview.examples || []
    this.currentIndex = 0
    this._phase = 'prior'
    this._render()
    if (this.status === 'ready' && this.isPlaying) { this._startCycle() }
  }

  _renderEmptyBoard() {
    this.content.innerHTML = ''
    this._boardEl      = null
    this._phaseLabel   = null
    this._playPauseBtn = null
    this._muteBtn      = null
    this.content.appendChild(buildMiniBoardEl())
  }

  _render() {
    this._returnToggleToHeader()
    this.content.innerHTML = ''
    this._boardEl      = null
    this._phaseLabel   = null
    this._playPauseBtn = null
    this._muteBtn      = null

    if (this.status === 'loading') {
      const boardEl = buildMiniBoardEl()
      boardEl.classList.add('mini-board--loading')
      const overlay = document.createElement('div')
      overlay.className = 'mini-board__loading-overlay'
      const spinner = document.createElement('div')
      spinner.className = 'mini-board__spinner'
      overlay.appendChild(spinner)
      boardEl.appendChild(overlay)
      this.content.appendChild(boardEl)
      return
    }

    if (this.status !== 'ready') {
      this.content.appendChild(this.buildMessage())
      return
    }

    const example = this.examples[this.currentIndex]


    const body = document.createElement('div')
    body.className = 'board-state-preview__body'

    // Left: board + phase label
    const left = document.createElement('div')

    const boardEl = buildMiniBoardEl()
    boardEl.style.transition = `opacity ${BOARD_FADE}ms ease`
    renderLayout(boardEl, example.priorBoard.layOut, example.highlights?.prior || {})
    this._boardEl = boardEl
    left.appendChild(boardEl)

    // Right: stacked buttons
    const side = document.createElement('div')
    side.className = 'board-state-preview__side'

    const playPauseBtn = document.createElement('button')
    playPauseBtn.type = 'button'
    playPauseBtn.className = 'mini-board__nav-btn'
    playPauseBtn.textContent = this.isPlaying ? 'Pause' : 'Play'
    playPauseBtn.addEventListener('click', (e) => { e.stopPropagation(); this._togglePlay() })
    this._playPauseBtn = playPauseBtn

    const muteBtn = document.createElement('button')
    muteBtn.type = 'button'
    muteBtn.className = 'mini-board__nav-btn'
    muteBtn.textContent = this.isMuted ? 'Unmute' : 'Mute'
    muteBtn.addEventListener('click', (e) => { e.stopPropagation(); this._toggleMute() })
    this._muteBtn = muteBtn

    if (this.toggleBtn) {
      this.toggleBtn.style.gridRow = '1'
      side.appendChild(this.toggleBtn)
    }

    const controlsRow = document.createElement('div')
    controlsRow.className = 'board-state-preview__side-row board-state-preview__side-row--centered'
    controlsRow.style.gridRow = '2'
    controlsRow.appendChild(playPauseBtn)
    controlsRow.appendChild(muteBtn)
    side.appendChild(controlsRow)

    const legendEntries = [
      { swatchClass: 'mini-board__tile--subject', label: 'Subject' },
      { swatchClass: 'mini-board__tile--target', label: 'Target' },
      { swatchClass: 'mini-board__tile--moved-end', label: 'Moved piece' }
    ]

    const legend = document.createElement('div')
    legend.className = 'board-state-preview__legend'
    legend.style.gridRow = '3'
    legendEntries.forEach(({ swatchClass, label }) => {
      const item = document.createElement('div')
      item.className = 'board-state-preview__legend-item'
      const swatch = document.createElement('span')
      swatch.className = `board-state-preview__legend-swatch ${swatchClass}`
      const labelText = document.createElement('span')
      labelText.className = 'board-state-preview__legend-label'
      labelText.textContent = label
      item.appendChild(swatch)
      item.appendChild(labelText)
      legend.appendChild(item)
    })
    side.appendChild(legend)

    const bottom = document.createElement('div')
    bottom.className = 'board-state-preview__side-bottom'
    bottom.style.gridRow = '4'

    if (this.examples.length > 1) {
      const prevBtn = document.createElement('button')
      prevBtn.type = 'button'
      prevBtn.className = 'mini-board__nav-btn'
      prevBtn.textContent = '← Prev'
      prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(-1) })

      const indicator = document.createElement('span')
      indicator.className = 'mini-board__nav-indicator'
      indicator.textContent = `${this.currentIndex + 1} / ${this.examples.length}`

      const nextBtn = document.createElement('button')
      nextBtn.type = 'button'
      nextBtn.className = 'mini-board__nav-btn'
      nextBtn.textContent = 'Next →'
      nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(1) })

      const navRow = document.createElement('div')
      navRow.className = 'board-state-preview__side-row'
      navRow.appendChild(prevBtn)
      navRow.appendChild(indicator)
      navRow.appendChild(nextBtn)
      bottom.appendChild(navRow)
    }

    const phaseLabel = document.createElement('div')
    phaseLabel.className = 'mini-board__phase mini-board__phase--prior'
    phaseLabel.textContent = 'Before move'
    this._phaseLabel = phaseLabel
    bottom.appendChild(phaseLabel)

    side.appendChild(bottom)

    body.appendChild(left)
    body.appendChild(side)
    this.content.appendChild(body)
  }

  // ── Animation cycle ────────────────────────────────────────────────────────

  _startCycle() {
    this._stopCycle()
    if (this.status !== 'ready') { return }
    this._stopped = false
    this._runCycle()
  }

  _stopCycle() {
    this._stopped = true
    clearTimeout(this._phaseTimer)
    this._phaseTimer = null
    clearTimeout(this._generationTimer)
    this._generationTimer = null
  }

  _runCycle() {
    if (this._stopped || !this._boardEl) { return }
    this._phaseTimer = setTimeout(() => { this._doMove() }, PRIOR_DWELL)
  }

  _doMove() {
    if (this._stopped || !this._boardEl) { return }
    const example = this.examples[this.currentIndex]
    if (!example) { return }

    const startPos  = example.moveObject.startPosition
    const endPos    = example.moveObject.endPosition
    const startTile = this._boardEl.querySelector(`[data-index="${startPos}"]`)
    const endTile   = this._boardEl.querySelector(`[data-index="${endPos}"]`)

    // Fade out the moving piece at its origin
    const startSpan = startTile?.querySelector('.mini-piece')
    if (startSpan) {
      startSpan.style.transition = `opacity ${PIECE_FADE}ms ease`
      startSpan.style.opacity = '0'
    }
    // Fade out any captured piece at the destination
    const capturedSpan = endTile?.querySelector('.mini-piece')
    if (capturedSpan) {
      capturedSpan.style.transition = `opacity ${PIECE_FADE}ms ease`
      capturedSpan.style.opacity = '0'
    }

    this._phaseTimer = setTimeout(() => {
      if (this._stopped || !this._boardEl) { return }

      // Clear origin tile
      if (startTile) { renderPieceIntoTile(startTile, null) }

      // Place moved piece at destination, fading in
      if (endTile) {
        const piece = example.afterBoard.layOut[endPos]
        renderPieceIntoTile(endTile, null)
        if (piece && PIECE_GLYPHS[piece]) {
          const span = document.createElement('span')
          span.className = `mini-piece mini-piece--${piece[0]}`
          span.textContent = PIECE_GLYPHS[piece]
          span.style.opacity = '0'
          span.style.transition = `opacity ${PIECE_FADE}ms ease`
          endTile.appendChild(span)
          requestAnimationFrame(() => { span.style.opacity = '1' })
        }
      }

      // Reconcile any additional side effects, like castling rook movement.
      syncBoardToLayout(this._boardEl, example.afterBoard.layOut)

      // Update all tile highlight classes for the after-board state
      applyHighlights(this._boardEl, example.highlights?.after || {})

      this._phase = 'after'
      if (this._phaseLabel) {
        this._phaseLabel.textContent = 'After move'
        this._phaseLabel.className = 'mini-board__phase mini-board__phase--after'
      }

      if (!this.isMuted && example.sound) { Sound.playSound(example.sound) }

      this._phaseTimer = setTimeout(() => { this._resetBoard() }, AFTER_DWELL)
    }, PIECE_FADE)
  }

  _resetBoard() {
    if (this._stopped || !this._boardEl) { return }
    const example = this.examples[this.currentIndex]
    if (!example) { return }

    // Fade out the whole board
    this._boardEl.style.opacity = '0'

    this._phaseTimer = setTimeout(() => {
      if (this._stopped || !this._boardEl) { return }

      renderLayout(this._boardEl, example.priorBoard.layOut, example.highlights?.prior || {})
      this._boardEl.style.opacity = '1'
      this._phase = 'prior'

      if (this._phaseLabel) {
        this._phaseLabel.textContent = 'Before move'
        this._phaseLabel.className = 'mini-board__phase mini-board__phase--prior'
      }

      this._phaseTimer = setTimeout(() => { this._runCycle() }, HALF_BEAT)
    }, BOARD_FADE)
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  _togglePlay() {
    this.isPlaying = !this.isPlaying
    if (this._playPauseBtn) { this._playPauseBtn.textContent = this.isPlaying ? 'Pause' : 'Play' }
    if (this.isPlaying) {
      this._startCycle()
    } else {
      this._stopCycle()
    }
  }

  _toggleMute() {
    this.isMuted = !this.isMuted
    if (this._muteBtn) { this._muteBtn.textContent = this.isMuted ? 'Unmute' : 'Mute' }
  }

  _navigate(delta) {
    this._stopCycle()
    this.currentIndex = (this.currentIndex + delta + this.examples.length) % this.examples.length
    this._phase = 'prior'
    this._render()
    if (this.isPlaying) { this._startCycle() }
  }

  _returnToggleToHeader() {
    if (!this.toggleBtn || !this.headerEl) { return }
    this.toggleBtn.textContent = 'Hide'
    if (!this.headerEl.contains(this.toggleBtn)) {
      this.headerEl.appendChild(this.toggleBtn)
    }
  }

  buildMessage() {
    const message = document.createElement('div')
    message.className = 'board-state-preview__message'
    message.textContent = this.reason || 'Condition preview is not available for this condition yet.'
    return message
  }

  destroy() {
    this._stopCycle()
    this.deactivate()
  }
}

export default BoardStatePreview
