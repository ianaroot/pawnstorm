import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BoardStatePreview from '../panels/BoardStatePreview.js'

vi.mock('../panels/condition_preview/orchestrator', () => ({
  default: vi.fn()
}))
vi.mock('../utils/conditionPreviewFormatter', () => ({
  formatConditionSentence: vi.fn(() => [{ text: 'label' }]),
  renderSentenceSegments: (target, segments) => {
    target.textContent = segments.map(s => s.text).join('')
    return target
  }
}))
vi.mock('gameplay/board', () => ({
  default: { squareColor: vi.fn(() => 'light') }
}))
vi.mock('gameplay/sound', () => ({
  default: { playSound: vi.fn() }
}))

import generateConditionExamples from '../panels/condition_preview/orchestrator.js'
import { formatConditionSentence } from '../utils/conditionPreviewFormatter.js'

function buildWrap() {
  const wrap = document.createElement('div')
  wrap.className = 'board-state-preview hidden'

  const header = document.createElement('div')
  header.className = 'board-state-preview__header'

  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'board-state-preview__toggle'
  toggle.textContent = 'Hide'
  header.appendChild(toggle)

  const content = document.createElement('div')
  content.className = 'board-state-preview__content'

  wrap.appendChild(header)
  wrap.appendChild(content)
  document.body.appendChild(wrap)
  return wrap
}

function buildConditionFormMock(payload = {}) {
  return { buildPayload: vi.fn(() => payload), onStateChange: null }
}

describe('BoardStatePreview', () => {
  let wrap
  let preview

  beforeEach(() => {
    vi.useFakeTimers()
    wrap = buildWrap()
    preview = new BoardStatePreview(wrap)
  })

  afterEach(() => {
    vi.useRealTimers()
    wrap.remove()
    vi.restoreAllMocks()
  })

  // ── activate ───────────────────────────────────────────────────────────────

  describe('activate', () => {
    it('sets mode to form and shows the wrap and content', () => {
      const form = buildConditionFormMock()
      preview.activate(form)

      expect(preview.mode).toBe('form')
      expect(preview.conditionForm).toBe(form)
      expect(wrap.classList.contains('hidden')).toBe(false)
      expect(preview.content.classList.contains('hidden')).toBe(false)
    })

    it('registers onStateChange on the condition form', () => {
      const form = buildConditionFormMock()
      preview.activate(form)

      expect(typeof form.onStateChange).toBe('function')
    })
  })

  // ── deactivate ─────────────────────────────────────────────────────────────

  describe('deactivate', () => {
    it('sets mode to idle and hides the wrap', () => {
      const form = buildConditionFormMock()
      preview.activate(form)
      preview.deactivate()

      expect(preview.mode).toBe('idle')
      expect(wrap.classList.contains('hidden')).toBe(true)
    })

    it('clears conditionForm and its onStateChange callback', () => {
      const form = buildConditionFormMock()
      preview.activate(form)
      preview.deactivate()

      expect(form.onStateChange).toBe(null)
      expect(preview.conditionForm).toBe(null)
    })
  })

  // ── showSelectionPreview ───────────────────────────────────────────────────

  describe('showSelectionPreview', () => {
    it('sets mode to selection and shows the wrap', () => {
      preview.showSelectionPreview({ status: 'no_examples', reason: 'No data', examples: [] })

      expect(preview.mode).toBe('selection')
      expect(wrap.classList.contains('hidden')).toBe(false)
    })

    it('clears a prior conditionForm onStateChange when transitioning from form mode', () => {
      const form = buildConditionFormMock()
      preview.activate(form)
      preview.showSelectionPreview({ status: 'no_examples', reason: '', examples: [] })

      expect(form.onStateChange).toBe(null)
      expect(preview.conditionForm).toBe(null)
    })
  })

  // ── toggle ─────────────────────────────────────────────────────────────────

  describe('toggle', () => {
    it('hides content and marks isEnabled false when toggling off', () => {
      const form = buildConditionFormMock()
      preview.activate(form)

      preview.toggle()

      expect(preview.isEnabled).toBe(false)
      expect(preview.content.classList.contains('hidden')).toBe(true)
    })

    it('shows content and marks isEnabled true when toggling back on in form mode', () => {
      const form = buildConditionFormMock({})
      generateConditionExamples.mockReturnValue({ status: 'no_examples', reason: 'none', examples: [] })
      formatConditionSentence.mockReturnValue([{ text: 'label' }])

      preview.activate(form)
      preview.toggle()  // off
      preview.toggle()  // on

      expect(preview.isEnabled).toBe(true)
      expect(preview.content.classList.contains('hidden')).toBe(false)
    })
  })

  // ── _appendChain ───────────────────────────────────────────────────────────

  describe('_appendChain', () => {
    it('appends an ordered list with one item per condition label', () => {
      preview.conditionLabels = [
        [{ text: 'White pawn advances' }],
        [{ text: 'Black king is in check' }]
      ]
      preview._appendChain()

      const chain = preview.content.querySelector('.board-state-preview__chain')
      expect(chain).not.toBeNull()
      expect(chain.tagName).toBe('OL')

      const items = chain.querySelectorAll('.board-state-preview__chain-item')
      expect(items).toHaveLength(2)
      expect(items[0].textContent).toBe('White pawn advances')
      expect(items[1].textContent).toBe('Black king is in check')
    })

    it('does not append a chain when conditionLabels is empty', () => {
      preview.conditionLabels = []
      preview._appendChain()

      expect(preview.content.querySelector('.board-state-preview__chain')).toBeNull()
    })
  })

  // ── _update ────────────────────────────────────────────────────────────────

  describe('_update', () => {
    it('calls generateConditionExamples with the payload after debounce and generation timers fire', () => {
      const payload = { subject: 'allied', operator: 'targets' }
      generateConditionExamples.mockReturnValue({ status: 'no_examples', reason: 'none', examples: [] })
      formatConditionSentence.mockReturnValue([{ text: 'label' }])

      preview._update(payload)
      vi.runAllTimers()

      expect(generateConditionExamples).toHaveBeenCalledWith(payload)
    })
  })
})
