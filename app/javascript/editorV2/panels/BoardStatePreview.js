import generateConditionExamples from 'editorV2/panels/condition_preview/orchestrator'
import { formatConditionSentence, renderSentenceSegments } from 'editorV2/utils/conditionPreviewFormatter'
import { exampleId } from 'editorV2/utils/example_id'
import { tileDecoration, legendEntries } from 'editorV2/panels/condition_preview/shared/highlight_roles'
import Board from 'gameplay/board'
import Sound from 'gameplay/sound'

const PRIOR_DWELL  = 1500
const PIECE_FADE   = 220
const AFTER_DWELL  = 2400
const BOARD_FADE   = 250
const HALF_BEAT    = 400

const PIECE_GLYPHS = {
  WK: '♚', WQ: '♛', WR: '♜', WB: '♝', WN: '♞', WP: '♟',
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
      td.dataset.fileLetter = 'abcdefgh'[file]
      td.dataset.rankNumber = rank + 1
      tr.appendChild(td)
    }
    table.appendChild(tr)
  }
  wrapper.appendChild(table)
  return wrapper
}

function decorateTile(tile, index, highlights) {
  const deco = tileDecoration(highlights, index)
  tile.style.boxShadow = deco?.boxShadow || ''
  // background-image (not the shorthand) so the wood background-color from
  // .mini-board__tile--light/dark stays underneath and the wash alpha-blends over it.
  tile.style.backgroundImage = deco ? `linear-gradient(${deco.background}, ${deco.background})` : ''
}

function renderLayout(boardEl, layout, highlights) {
  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    const i = parseInt(tile.dataset.index, 10)
    const piece = layout[i]
    tile.innerHTML = ''
    decorateTile(tile, i, highlights)
    if (piece && PIECE_GLYPHS[piece]) {
      const span = document.createElement('span')
      span.className = `mini-piece mini-piece--${piece[0]}`
      span.dataset.piece = piece
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
    span.dataset.piece = piece
    span.textContent = PIECE_GLYPHS[piece]
    tile.appendChild(span)
  }
}

function syncBoardToLayout(boardEl, layout) {
  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    const index = parseInt(tile.dataset.index, 10)
    const expectedPiece = layout[index]
    const currentPiece = tile.querySelector('.mini-piece')?.dataset.piece || null
    const expectedPieceCode = PIECE_GLYPHS[expectedPiece] ? expectedPiece : null

    if (currentPiece === expectedPieceCode) { return }
    renderPieceIntoTile(tile, expectedPiece)
  })
}

function applyHighlights(boardEl, highlights) {
  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    decorateTile(tile, parseInt(tile.dataset.index, 10), highlights)
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
      this.actions?.togglePreview()
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

  showSelectionPreview(preview, retryHandler = null) {
    this._stopCycle()
    if (this.conditionForm) { this.conditionForm.onStateChange = null }
    this.conditionForm = null
    this.mode = 'selection'
    this.selectionPreview = preview
    this._retryHandler = retryHandler
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
    this._retryHandler = () => this._continueGenerating(() => generateConditionExamples(payload))
    this._applyPreview({ status: 'loading', reason: 'Computing preview…', examples: [] })
    this._generationTimer = setTimeout(() => {
      const preview = generateConditionExamples(payload)
      preview.conditionLabels = [formatConditionSentence(payload)]
      this._applyPreview(preview)
    }, 0)
  }

  _continueGenerating(generate) {
    this._stopCycle()
    const previousExamples = this.examples
    const previousLabels = this.conditionLabels
    this._retrying = true
    this._render()
    this._generationTimer = setTimeout(() => {
      const preview = generate()
      const seen = new Set(previousExamples.map(exampleId))
      const additions = (preview.examples ?? []).filter(e => {
        const id = exampleId(e)
        if (seen.has(id)) { return false }
        seen.add(id)
        return true
      })
      preview.examples = [...previousExamples, ...additions]
      preview.conditionLabels = previousLabels
      // If this round produced new examples, the user got something — drop
      // the slow state so the Keep Trying prompt goes away.
      if (additions.length > 0 && preview.status === 'slow') { preview.status = 'ready' }
      this._retrying = false
      this._applyPreview(preview)
    }, 0)
  }

  _applyPreview(preview) {
    this.status = preview.status
    this.reason = preview.reason || ''
    this.examples = preview.examples || []
    this.conditionLabels = preview.conditionLabels || []
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

    if (this.status === 'slow' && this.examples.length === 0) {
      this.content.appendChild(this.buildMessage())
      this.content.appendChild(this._buildKeepTryingButton())
      this._appendChain()
      return
    }

    if (this.status !== 'ready' && this.status !== 'slow') {
      this.content.appendChild(this.buildMessage())
      this._appendChain()
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

    const pathBadge = document.createElement('span')
    pathBadge.className = `mini-board__path-badge mini-board__path-badge--${example.generationPath}`
    pathBadge.textContent = example.generationPath === 'forward' ? 'F' : 'R'
    boardEl.appendChild(pathBadge)

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
      this.headerEl?.classList.add('hidden')
    }

    const controlsRow = document.createElement('div')
    controlsRow.className = 'board-state-preview__side-row board-state-preview__side-row--centered'
    controlsRow.style.gridRow = '2'
    controlsRow.appendChild(playPauseBtn)
    controlsRow.appendChild(muteBtn)
    side.appendChild(controlsRow)

    const legend = document.createElement('div')
    legend.className = 'board-state-preview__legend'
    legend.style.gridRow = '3'
    legendEntries(example).forEach(({ color, label }) => {
      const item = document.createElement('div')
      item.className = 'board-state-preview__legend-item'
      const swatch = document.createElement('span')
      swatch.className = 'board-state-preview__legend-swatch'
      swatch.style.background = color
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

    if (this.status === 'slow') {
      this.content.appendChild(this._buildKeepTryingButton())
    }

    this._appendChain()
  }

  _buildKeepTryingButton() {
    const wrap = document.createElement('div')
    wrap.className = 'board-state-preview__keep-trying'
    if (this.reason) {
      const note = document.createElement('div')
      note.className = 'board-state-preview__keep-trying-note'
      note.textContent = this.reason
      wrap.appendChild(note)
    }
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'mini-board__nav-btn'
    if (this._retrying) {
      btn.textContent = 'Trying…'
      btn.disabled = true
    } else {
      btn.textContent = 'Keep trying'
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (this._retryHandler) { this._retryHandler() }
      })
    }
    wrap.appendChild(btn)
    return wrap
  }

  _appendChain() {
    if (this.mode === 'form') { return }
    if (!this.conditionLabels?.length) { return }
    const chain = document.createElement('ol')
    chain.className = 'board-state-preview__chain'
    this.conditionLabels.forEach(label => {
      const item = document.createElement('li')
      item.className = 'board-state-preview__chain-item'
      renderSentenceSegments(item, label)
      chain.appendChild(item)
    })
    this.content.appendChild(chain)
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
    this.headerEl.classList.remove('hidden')
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
