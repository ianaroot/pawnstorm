import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TourEngine from 'tour/engine'

function makeTarget(id = 'target') {
  const el = document.createElement('button')
  el.id = id
  el.textContent = id
  document.body.appendChild(el)
  return el
}

function backdrop() {
  return document.querySelector('.tour-backdrop')
}

function tooltip() {
  return document.querySelector('.tour-tooltip')
}

function title() {
  return document.querySelector('.tour-tooltip__title')
}

function body() {
  return document.querySelector('.tour-tooltip__body')
}

function progress() {
  return document.querySelector('.tour-tooltip__progress')
}

function nextButton() {
  return document.querySelector('.tour-tooltip__next')
}

function closeButton() {
  return document.querySelector('.tour-tooltip__close')
}

beforeEach(() => { document.body.innerHTML = '' })
afterEach(() => { document.body.innerHTML = '' })

describe('TourEngine', () => {
  describe('constructor', () => {
    it('starts inactive', () => {
      const engine = new TourEngine({ steps: [] })
      expect(engine.isActive).toBe(false)
      expect(backdrop()).toBeNull()
    })
  })

  describe('start()', () => {
    it('does nothing when steps are empty', () => {
      const engine = new TourEngine({ steps: [] })
      engine.start()
      expect(engine.isActive).toBe(false)
      expect(backdrop()).toBeNull()
    })

    it('mounts backdrop and tooltip with first step content', () => {
      const target = makeTarget()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'Hello', body: '<p>World</p>' }]
      })
      engine.start()
      expect(engine.isActive).toBe(true)
      expect(backdrop()).not.toBeNull()
      expect(tooltip()).not.toBeNull()
      expect(title().textContent).toBe('Hello')
      expect(body().innerHTML).toBe('<p>World</p>')
      expect(progress().textContent).toBe('1 of 1')
      expect(target.classList.contains('tour-spotlight')).toBe(true)
    })

    it('renders a centered step when target is null', () => {
      const engine = new TourEngine({
        steps: [{ target: null, title: 'Welcome', body: 'intro' }]
      })
      engine.start()
      expect(tooltip()).not.toBeNull()
      expect(title().textContent).toBe('Welcome')
    })

    it('is idempotent', () => {
      makeTarget()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'A' }]
      })
      engine.start()
      engine.start()
      expect(document.querySelectorAll('.tour-backdrop')).toHaveLength(1)
    })
  })

  describe('next()', () => {
    it('advances to the next step', () => {
      makeTarget('a')
      makeTarget('b')
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first' },
          { target: '#b', title: 'second' }
        ]
      })
      engine.start()
      engine.next()
      expect(title().textContent).toBe('second')
      expect(progress().textContent).toBe('2 of 2')
      expect(document.getElementById('a').classList.contains('tour-spotlight')).toBe(false)
      expect(document.getElementById('b').classList.contains('tour-spotlight')).toBe(true)
    })

    it('closes after the last step', () => {
      makeTarget()
      const onClose = vi.fn()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'only' }],
        onClose
      })
      engine.start()
      engine.next()
      expect(engine.isActive).toBe(false)
      expect(backdrop()).toBeNull()
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does nothing when inactive', () => {
      const engine = new TourEngine({ steps: [] })
      engine.next()
      expect(engine.isActive).toBe(false)
    })
  })

  describe('close()', () => {
    it('removes the overlay and clears the spotlight', () => {
      const target = makeTarget()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'x' }]
      })
      engine.start()
      engine.close()
      expect(engine.isActive).toBe(false)
      expect(backdrop()).toBeNull()
      expect(tooltip()).toBeNull()
      expect(target.classList.contains('tour-spotlight')).toBe(false)
    })

    it('calls onClose once', () => {
      const onClose = vi.fn()
      makeTarget()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'x' }],
        onClose
      })
      engine.start()
      engine.close()
      engine.close()
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('keyboard', () => {
    it('closes on Escape', () => {
      makeTarget()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'x' }]
      })
      engine.start()
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
      expect(engine.isActive).toBe(false)
    })
  })

  describe('Next button', () => {
    it('advances on click for "next" steps', () => {
      makeTarget('a')
      makeTarget('b')
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first', advanceOn: 'next' },
          { target: '#b', title: 'second' }
        ]
      })
      engine.start()
      nextButton().click()
      expect(title().textContent).toBe('second')
    })

    it('is hidden for non-"next" advance triggers', () => {
      makeTarget()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'x', advanceOn: 'click' }]
      })
      engine.start()
      expect(nextButton().hidden).toBe(true)
    })
  })

  describe('Close button', () => {
    it('closes the tour', () => {
      makeTarget()
      const engine = new TourEngine({
        steps: [{ target: '#target', title: 'x' }]
      })
      engine.start()
      closeButton().click()
      expect(engine.isActive).toBe(false)
    })
  })

  describe('advanceOn: "click"', () => {
    it('advances when the spotlighted target is clicked', () => {
      const target = makeTarget('a')
      makeTarget('b')
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first', advanceOn: 'click' },
          { target: '#b', title: 'second' }
        ]
      })
      engine.start()
      target.click()
      expect(title().textContent).toBe('second')
    })
  })

  describe('advanceOn: { event }', () => {
    it('advances when the named custom event fires on document', () => {
      makeTarget('a')
      makeTarget('b')
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first', advanceOn: { event: 'editor:node-saved' } },
          { target: '#b', title: 'second' }
        ]
      })
      engine.start()
      document.dispatchEvent(new CustomEvent('editor:node-saved', { detail: { type: 'condition' } }))
      expect(title().textContent).toBe('second')
    })

    it('respects a `when` predicate on the event detail', () => {
      makeTarget('a')
      makeTarget('b')
      const engine = new TourEngine({
        steps: [
          {
            target: '#a',
            title: 'first',
            advanceOn: {
              event: 'editor:node-saved',
              when: (detail) => detail.type === 'condition'
            }
          },
          { target: '#b', title: 'second' }
        ]
      })
      engine.start()
      document.dispatchEvent(new CustomEvent('editor:node-saved', { detail: { type: 'score' } }))
      expect(title().textContent).toBe('first')
      document.dispatchEvent(new CustomEvent('editor:node-saved', { detail: { type: 'condition' } }))
      expect(title().textContent).toBe('second')
    })
  })

  describe('skipIf', () => {
    it('skips a step when the predicate returns true', () => {
      makeTarget('a')
      makeTarget('b')
      makeTarget('c')
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first' },
          { target: '#b', title: 'skipped', skipIf: () => true },
          { target: '#c', title: 'third' }
        ]
      })
      engine.start()
      engine.next()
      expect(title().textContent).toBe('third')
    })

    it('closes when every remaining step is skipped', () => {
      makeTarget('a')
      makeTarget('b')
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first' },
          { target: '#b', title: 'skipped', skipIf: () => true }
        ]
      })
      engine.start()
      engine.next()
      expect(engine.isActive).toBe(false)
    })
  })

  describe('missing target', () => {
    it('skips a step whose selector resolves to nothing and warns', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      makeTarget('present')
      const engine = new TourEngine({
        steps: [
          { target: '#absent', title: 'first' },
          { target: '#present', title: 'second' }
        ]
      })
      engine.start()
      expect(title().textContent).toBe('second')
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  describe('target as function', () => {
    it('resolves a function target', () => {
      const target = makeTarget()
      const engine = new TourEngine({
        steps: [{ target: () => target, title: 'fn' }]
      })
      engine.start()
      expect(target.classList.contains('tour-spotlight')).toBe(true)
    })
  })

  describe('lastAdvanceDetail context', () => {
    it('passes the prior event detail to the next step target', () => {
      makeTarget('a')
      makeTarget('b')
      const targetFn = vi.fn(() => document.getElementById('b'))
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first', advanceOn: { event: 'editor:node-added' } },
          { target: targetFn, title: 'second' }
        ]
      })
      engine.start()
      document.dispatchEvent(new CustomEvent('editor:node-added', { detail: { type: 'condition', clientId: 'abc' } }))

      expect(targetFn).toHaveBeenCalled()
      const ctx = targetFn.mock.calls[0][0]
      expect(ctx.lastAdvanceDetail).toEqual({ type: 'condition', clientId: 'abc' })
      expect(ctx.engine).toBe(engine)
    })

    it('passes the prior event detail to the next step skipIf', () => {
      makeTarget('a')
      makeTarget('b')
      const skipIf = vi.fn(() => false)
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first', advanceOn: { event: 'editor:node-added' } },
          { target: '#b', title: 'second', skipIf }
        ]
      })
      engine.start()
      document.dispatchEvent(new CustomEvent('editor:node-added', { detail: { clientId: 'xyz' } }))

      expect(skipIf).toHaveBeenCalled()
      expect(skipIf.mock.calls[0][0].lastAdvanceDetail).toEqual({ clientId: 'xyz' })
    })

    it('passes null lastAdvanceDetail for the first step', () => {
      const targetFn = vi.fn(() => makeTarget())
      const engine = new TourEngine({
        steps: [{ target: targetFn, title: 'first' }]
      })
      engine.start()

      expect(targetFn.mock.calls[0][0].lastAdvanceDetail).toBeNull()
    })

    it('passes null lastAdvanceDetail when advanced via the Next button', () => {
      makeTarget('a')
      makeTarget('b')
      const targetFn = vi.fn(() => document.getElementById('b'))
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first', advanceOn: 'next' },
          { target: targetFn, title: 'second' }
        ]
      })
      engine.start()
      nextButton().click()

      expect(targetFn.mock.calls[0][0].lastAdvanceDetail).toBeNull()
    })

    it('preserves lastAdvanceDetail across a skipped step', () => {
      makeTarget('a')
      makeTarget('c')
      const targetFn = vi.fn(() => document.getElementById('c'))
      const engine = new TourEngine({
        steps: [
          { target: '#a', title: 'first', advanceOn: { event: 'editor:node-added' } },
          { target: '#b', title: 'skipped', skipIf: () => true },
          { target: targetFn, title: 'third' }
        ]
      })
      engine.start()
      document.dispatchEvent(new CustomEvent('editor:node-added', { detail: { clientId: 'kept' } }))

      expect(targetFn.mock.calls[0][0].lastAdvanceDetail).toEqual({ clientId: 'kept' })
    })
  })
})
