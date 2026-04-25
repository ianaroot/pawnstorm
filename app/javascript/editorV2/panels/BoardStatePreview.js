import generateConditionExamples from 'editorV2/panels/condition_preview/ConditionExampleGenerator'

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
      td.className = `mini-board__tile mini-board__tile--${tileColor(index)}`
      td.dataset.index = index
      tr.appendChild(td)
    }
    table.appendChild(tr)
  }
  wrapper.appendChild(table)
  return wrapper
}

function tileColor(index) {
  return (index % 8 + Math.floor(index / 8)) % 2 === 0 ? 'dark' : 'light'
}

function renderLayout(boardEl, layout, highlights) {
  const subjectPositions = new Set(highlights.subjectPositions || [])
  const targetPositions = new Set(highlights.targetPositions || [])
  const movedStartPosition = highlights.movedStartPosition
  const movedEndPosition = highlights.movedEndPosition

  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    const i = parseInt(tile.dataset.index, 10)
    const piece = layout[i]
    tile.innerHTML = ''
    tile.classList.toggle('mini-board__tile--subject', subjectPositions.has(i))
    tile.classList.toggle('mini-board__tile--target', targetPositions.has(i))
    tile.classList.toggle('mini-board__tile--moved-start', movedStartPosition === i)
    tile.classList.toggle('mini-board__tile--moved-end', movedEndPosition === i)
    if (piece && PIECE_GLYPHS[piece]) {
      const span = document.createElement('span')
      span.className = `mini-piece mini-piece--${piece[0]}`
      span.textContent = PIECE_GLYPHS[piece]
      tile.appendChild(span)
    }
  })
}

function debounce(fn, delay) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
}

// ── Class ────────────────────────────────────────────────────────────────────

class BoardStatePreview {
  constructor(wrap) {
    this.wrap    = wrap
    this.content = wrap.querySelector('.board-state-preview__content')
    this.toggleBtn = wrap.querySelector('.board-state-preview__toggle')
    this.isEnabled = true
    this.conditionForm = null
    this.examples = []
    this.currentIndex = 0
    this.status = 'idle'
    this.reason = ''
    this._debouncedUpdate = debounce((payload) => this._update(payload), 250)

    this.toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      this._toggle()
    })
  }

  activate(conditionForm) {
    this.conditionForm = conditionForm
    this.wrap.classList.remove('hidden')
    conditionForm.onStateChange = (payload) => this._debouncedUpdate(payload)
    if (this.isEnabled) {
      this.content.classList.remove('hidden')
      this._update(conditionForm.buildPayload())
    } else {
      this.content.classList.add('hidden')
    }
  }

  deactivate() {
    if (this.conditionForm) { this.conditionForm.onStateChange = null }
    this.conditionForm = null
    this.wrap.classList.add('hidden')
  }

  _toggle() {
    this.isEnabled = !this.isEnabled
    if (this.toggleBtn) {
      this.toggleBtn.textContent = this.isEnabled ? 'Hide' : 'Show examples'
    }
    if (this.isEnabled) {
      this.content.classList.remove('hidden')
      if (this.conditionForm) { this._update(this.conditionForm.buildPayload()) }
    } else {
      this.content.classList.add('hidden')
    }
  }

  _update(payload) {
    const preview = generateConditionExamples(payload)
    this.status = preview.status
    this.reason = preview.reason || ''
    this.examples = preview.examples || []
    this.currentIndex = 0
    this._render()
  }

  _render() {
    this.content.innerHTML = ''
    const example = this.status === 'ready' ? this.examples[this.currentIndex] : null

    const meta = document.createElement('div')
    meta.className = 'mini-board__meta'

    if (example?.label) {
      const title = document.createElement('div')
      title.className = 'mini-board__phase mini-board__phase--after'
      title.textContent = example.label
      meta.appendChild(title)
    }

    const pair = document.createElement('div')
    pair.className = 'mini-board__pair'
    pair.appendChild(this.buildBoardPanel({
      title: 'Before move',
      board: example?.priorBoard || this.blankBoard(),
      highlights: example?.highlights?.prior || {}
    }))
    pair.appendChild(this.buildBoardPanel({
      title: 'After move',
      board: example?.afterBoard || this.blankBoard(),
      highlights: example?.highlights?.after || {}
    }))

    this.content.appendChild(meta)
    this.content.appendChild(pair)

    if (this.status !== 'ready') {
      this.content.appendChild(this.buildMessage())
      return
    }

    if (this.examples.length > 1) {
      const nav = document.createElement('div')
      nav.className = 'mini-board__nav'

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

      nav.appendChild(prevBtn)
      nav.appendChild(indicator)
      nav.appendChild(nextBtn)
      this.content.appendChild(nav)
    }
  }

  buildBoardPanel({ title, board, highlights }) {
    const panel = document.createElement('div')
    panel.className = 'mini-board__panel'

    const heading = document.createElement('div')
    heading.className = `mini-board__phase ${title === 'Before move' ? 'mini-board__phase--prior' : 'mini-board__phase--after'}`
    heading.textContent = title

    const boardEl = buildMiniBoardEl()
    renderLayout(boardEl, board.layOut, highlights)

    panel.appendChild(heading)
    panel.appendChild(boardEl)
    return panel
  }

  buildMessage() {
    const message = document.createElement('div')
    message.className = 'board-state-preview__message'
    message.textContent = this.reason || 'Condition preview is not available for this condition yet.'
    return message
  }

  blankBoard() {
    return { layOut: Array(64).fill('ee') }
  }

  _navigate(delta) {
    this.currentIndex = (this.currentIndex + delta + this.examples.length) % this.examples.length
    this._render()
  }

  destroy() {
    this.deactivate()
  }
}

export default BoardStatePreview
