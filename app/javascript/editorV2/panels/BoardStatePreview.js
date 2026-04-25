import Board from 'gameplay/board'
import { controlledSquares } from 'gameplay/board_query_utils'

const PIECE_GLYPHS = {
  WK: '♔', WQ: '♕', WR: '♖', WB: '♗', WN: '♘', WP: '♙',
  BK: '♚', BQ: '♛', BR: '♜', BB: '♝', BN: '♞', BP: '♟'
}

const SUBJECT_TO_TEAM = {
  allied: 'W', moved_piece: 'W', captured_piece: 'W',
  enemy: 'B', enemy_moved_piece: 'B', enemy_captured_piece: 'B'
}

const FILTER_TO_SPECIES = {
  pawn: 'P', rook: 'R', knight: 'N', bishop: 'B', queen: 'Q', king: 'K'
}

function teamFor(subject) { return SUBJECT_TO_TEAM[subject] || 'W' }
function speciesFor(filter) { return FILTER_TO_SPECIES[filter] || 'Q' }

function emptyLayout() { return Array(64).fill('ee') }

function buildBoard(layout) {
  return new Board({ layOut: layout, capturedPieces: [], allowedToMove: 'W' })
}

function tileColor(index) {
  return (index % 8 + Math.floor(index / 8)) % 2 === 0 ? 'dark' : 'light'
}

function pickSpread(arr, n) {
  if (arr.length <= n) return [...arr]
  return Array.from({ length: n }, (_, i) => arr[Math.floor((i * arr.length) / n)])
}

// Square where the subject piece "lives" once the condition holds
function activeSquare(team, species) {
  if (species === 'P') return team === 'W' ? 27 : 35  // d4 / d5
  return team === 'W' ? 28 : 36                       // e4 / e5
}

// Square the piece "came from" for its move to activePos — must be a legal move
function originSquare(team, species, activePos, blockedPos) {
  const file = activePos % 8
  const rank = Math.floor(activePos / 8)

  const pick = (candidates) => candidates.find(sq => sq !== activePos && sq !== blockedPos)

  switch (species) {
    case 'P': {
      // Pawn moves forward only — back one or two ranks
      const behind = team === 'W' ? -1 : 1
      const candidates = []
      const r1 = rank + behind
      if (r1 >= 0 && r1 < 8) candidates.push(r1 * 8 + file)
      const r2 = rank + behind * 2
      if (r2 >= 0 && r2 < 8) candidates.push(r2 * 8 + file)
      return pick(candidates) ?? activePos
    }
    case 'N': {
      // Any valid knight's move away from activePos
      const candidates = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
        .map(([df, dr]) => [(file + df), (rank + dr)])
        .filter(([f, r]) => f >= 0 && f < 8 && r >= 0 && r < 8)
        .map(([f, r]) => r * 8 + f)
      return pick(candidates) ?? activePos
    }
    case 'B': {
      // Any diagonal square reachable from activePos
      const candidates = []
      for (const [df, dr] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
        for (let d = 1; d <= 6; d++) {
          const f = file + df * d, r = rank + dr * d
          if (f < 0 || f >= 8 || r < 0 || r >= 8) break
          candidates.push(r * 8 + f)
        }
      }
      return pick(candidates) ?? activePos
    }
    case 'K': {
      // One king step away
      const candidates = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
        .map(([df, dr]) => [(file + df), (rank + dr)])
        .filter(([f, r]) => f >= 0 && f < 8 && r >= 0 && r < 8)
        .map(([f, r]) => r * 8 + f)
      return pick(candidates) ?? activePos
    }
    default: {
      // Queen / Rook: same file on the team's back rank is a legal linear move
      const backRank = team === 'W' ? 0 : 7
      const candidates = [file, (file + 1) % 8, (file + 7) % 8]
        .map(f => backRank * 8 + f)
      return pick(candidates) ?? activePos
    }
  }
}

function getAdjacentPositions(pos) {
  const file = pos % 8, rank = Math.floor(pos / 8)
  const result = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      if (dr === 0 && df === 0) continue
      const nf = file + df, nr = rank + dr
      if (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) result.push(nr * 8 + nf)
    }
  }
  return result
}

// Each example: { after, subjectPos, targetPos, prior, priorSubjectPos }
// prior / priorSubjectPos are null when there is no meaningful animation (unary)
function generateRelationalExamples(payload) {
  const subjectTeam  = teamFor(payload.subject || 'allied')
  const subjectSpecies = speciesFor(payload.subjectFilter)
  const targetTeam   = teamFor(payload.target || 'enemy')
  const targetSpecies = speciesFor(payload.targetFilter)
  const subjectPiece = subjectTeam + subjectSpecies
  const targetPiece  = targetTeam + targetSpecies
  const subjectPos   = activeSquare(subjectTeam, subjectSpecies)

  let targetPositions
  if (payload.operator === 'adjacent') {
    targetPositions = pickSpread(getAdjacentPositions(subjectPos), 3)
  } else {
    const seed = emptyLayout()
    seed[subjectPos] = subjectPiece
    const squares = controlledSquares({ board: buildBoard(seed), attackerPosition: subjectPos })
    targetPositions = squares.length > 0 ? pickSpread(squares, 3) : [null]
  }

  return targetPositions.map(targetPos => {
    const after = emptyLayout()
    after[subjectPos] = subjectPiece
    if (targetPos !== null) after[targetPos] = targetPiece

    const priorSubjectPos = originSquare(subjectTeam, subjectSpecies, subjectPos, targetPos)
    const prior = emptyLayout()
    prior[priorSubjectPos] = subjectPiece
    if (targetPos !== null) prior[targetPos] = targetPiece

    return { after, subjectPos, targetPos, prior, priorSubjectPos }
  })
}

const SPREAD_SQUARES = [28, 35, 20, 43, 27, 36, 19, 44]

function generateUnaryExamples(payload) {
  const subjectTeam    = teamFor(payload.subject || 'allied')
  const subjectSpecies = speciesFor(payload.subjectFilter)
  const subjectPiece   = subjectTeam + subjectSpecies
  const comparator     = payload.comparator || 'greater_than'
  const threshold      = typeof payload.targetTotal === 'number' ? payload.targetTotal : 0

  let count
  switch (comparator) {
    case 'greater_than':             count = threshold + 1; break
    case 'greater_than_or_equal_to': count = threshold; break
    case 'equal_to':                 count = threshold; break
    case 'less_than':                count = Math.max(0, threshold - 1); break
    case 'less_than_or_equal_to':    count = threshold; break
    default:                         count = threshold + 1
  }
  count = Math.max(1, Math.min(count, 8))

  const after = emptyLayout()
  for (let i = 0; i < count; i++) after[SPREAD_SQUARES[i % SPREAD_SQUARES.length]] = subjectPiece

  return [{ after, subjectPos: SPREAD_SQUARES[0], targetPos: null, prior: null, priorSubjectPos: null }]
}

function generateExamples(payload) {
  if (!payload?.kind) return []
  try {
    return payload.kind === 'relational'
      ? generateRelationalExamples(payload)
      : generateUnaryExamples(payload)
  } catch { return [] }
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

function renderLayout(boardEl, layout, subjectPos, targetPos) {
  boardEl.querySelectorAll('[data-index]').forEach(tile => {
    const i = parseInt(tile.dataset.index, 10)
    const piece = layout[i]
    tile.innerHTML = ''
    tile.classList.toggle('mini-board__tile--subject', i === subjectPos)
    tile.classList.toggle('mini-board__tile--target', targetPos !== null && i === targetPos)
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
    this._animInterval = null
    this._cancelAnim = null
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
    this._stopAnimation()
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
      this._stopAnimation()
      this.content.classList.add('hidden')
    }
  }

  _update(payload) {
    this._stopAnimation()
    this.examples = generateExamples(payload)
    this.currentIndex = 0
    this._render()
  }

  _render() {
    this._stopAnimation()
    this.content.innerHTML = ''
    if (this.examples.length === 0) return

    const example = this.examples[this.currentIndex]

    // Phase label (only for relational examples with a prior board)
    const phaseLabel = document.createElement('div')
    phaseLabel.className = 'mini-board__phase'
    phaseLabel.textContent = example.prior ? 'After move' : ''
    this.content.appendChild(phaseLabel)

    const boardEl = buildMiniBoardEl()
    renderLayout(boardEl, example.after, example.subjectPos, example.targetPos)
    this.content.appendChild(boardEl)

    if (example.prior) {
      this._startAnimation(boardEl, phaseLabel, example)
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

  _startAnimation(boardEl, phaseLabel, example) {
    let cancelled = false
    let showingPrior = false  // start on "after" (condition-holds state)
    this._cancelAnim = () => { cancelled = true }

    this._animInterval = setInterval(() => {
      if (cancelled) return
      boardEl.classList.add('mini-board--fading')
      setTimeout(() => {
        if (cancelled) return
        showingPrior = !showingPrior
        if (showingPrior) {
          renderLayout(boardEl, example.prior, example.priorSubjectPos, example.targetPos)
          phaseLabel.textContent = 'Before move'
          phaseLabel.className = 'mini-board__phase mini-board__phase--prior'
        } else {
          renderLayout(boardEl, example.after, example.subjectPos, example.targetPos)
          phaseLabel.textContent = 'After move'
          phaseLabel.className = 'mini-board__phase mini-board__phase--after'
        }
        boardEl.classList.remove('mini-board--fading')
      }, 200)
    }, 1800)
  }

  _stopAnimation() {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    if (this._animInterval) { clearInterval(this._animInterval); this._animInterval = null }
  }

  _navigate(delta) {
    this._stopAnimation()
    this.currentIndex = (this.currentIndex + delta + this.examples.length) % this.examples.length
    this._render()
  }

  destroy() {
    this.deactivate()
  }
}

export default BoardStatePreview
