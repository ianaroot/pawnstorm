// Tour engine: walks a user through an ordered list of steps, spotlighting
// one DOM target at a time and waiting for either a manual Next click or a
// step-specified advance trigger (target click, custom DOM event).
//
// Pure module: no Stimulus, no app coupling. The Stimulus wrapper in
// controllers/tour_controller.js owns mounting and step-set loading.
//
// Step shape:
//   {
//     target:    'css-selector' | () => Element | null,   // null = centered modal
//     title:     string,
//     body:      string,                                  // HTML allowed
//     placement: 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center',
//     advanceOn: 'next' | 'click' | { event, when?, selector? },
//     skipIf:    (ctx) => boolean
//   }

const TOOLTIP_WIDTH = 320
const TOOLTIP_GAP = 12

export default class TourEngine {
  constructor({ steps = [], onClose = () => {} } = {}) {
    this.steps = steps
    this.onClose = onClose
    this.active = false
    this.currentIndex = -1
    this.dom = null
    this.spotlightTarget = null
    this.stepCleanup = []
    this.lastAdvanceDetail = null
  }

  get isActive() { return this.active }
  get currentStepIndex() { return this.currentIndex }
  get currentStep() { return this.steps[this.currentIndex] ?? null }

  start() {
    if (this.active || this.steps.length === 0) { return }
    this.active = true
    this.currentIndex = -1
    this.lastAdvanceDetail = null
    this.mountDom()
    this.advanceToNextValidStep()
  }

  next(detail = null) {
    if (!this.active) { return }
    this.lastAdvanceDetail = detail
    this.advanceToNextValidStep()
  }

  close() {
    if (!this.active) { return }
    this.active = false
    this.teardownStep()
    this.unmountDom()
    this.onClose()
  }

  advanceToNextValidStep() {
    this.teardownStep()
    let candidate = this.currentIndex + 1
    while (candidate < this.steps.length && this.shouldSkip(this.steps[candidate])) {
      candidate += 1
    }
    if (candidate >= this.steps.length) { this.close(); return }
    this.currentIndex = candidate

    const step = this.steps[candidate]
    const target = this.resolveTarget(step)
    if (step.target && !target) {
      console.warn(`TourEngine: target not found for step ${candidate}: ${step.target}`)
      this.advanceToNextValidStep()
      return
    }

    this.renderStep(step, target)
    this.wireStepTriggers(step, target)
  }

  shouldSkip(step) {
    if (typeof step.skipIf !== 'function') { return false }
    try { return Boolean(step.skipIf(this.context())) }
    catch (err) { console.warn('TourEngine: skipIf threw:', err); return false }
  }

  resolveTarget(step) {
    if (!step.target) { return null }
    if (typeof step.target === 'function') { return step.target(this.context()) || null }
    return document.querySelector(step.target)
  }

  context() {
    return { engine: this, lastAdvanceDetail: this.lastAdvanceDetail }
  }

  renderStep(step, target) {
    if (target) {
      target.classList.add('tour-spotlight')
      this.spotlightTarget = target
    }
    this.dom.title.textContent = step.title ?? ''
    this.dom.body.innerHTML = step.body ?? ''
    this.dom.progress.textContent = `${this.currentIndex + 1} of ${this.steps.length}`
    this.positionFramesAndHalo(target)
    this.positionTooltip(target, step.placement)
  }

  positionFramesAndHalo(target) {
    const { backdropFull, frameTop, frameRight, frameBottom, frameLeft, halo } = this.dom
    if (!target) {
      backdropFull.hidden = false
      frameTop.hidden = frameRight.hidden = frameBottom.hidden = frameLeft.hidden = true
      halo.hidden = true
      return
    }
    backdropFull.hidden = true
    const r = target.getBoundingClientRect()
    const vh = window.innerHeight
    const vw = window.innerWidth
    Object.assign(frameTop.style,    { top: '0',           left: '0',           width: '100vw',                       height: `${Math.max(0, r.top)}px` })
    Object.assign(frameBottom.style, { top: `${r.bottom}px`, left: '0',         width: '100vw',                       height: `${Math.max(0, vh - r.bottom)}px` })
    Object.assign(frameLeft.style,   { top: `${r.top}px`,  left: '0',           width: `${Math.max(0, r.left)}px`,    height: `${r.height}px` })
    Object.assign(frameRight.style,  { top: `${r.top}px`,  left: `${r.right}px`, width: `${Math.max(0, vw - r.right)}px`, height: `${r.height}px` })
    frameTop.hidden = frameRight.hidden = frameBottom.hidden = frameLeft.hidden = false
    Object.assign(halo.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` })
    halo.hidden = false
  }

  positionTooltip(target, placement) {
    const style = this.dom.tooltip.style
    if (!target || placement === 'center') {
      style.position = 'fixed'
      style.top = '50%'
      style.left = '50%'
      style.transform = 'translate(-50%, -50%)'
      return
    }
    const rect = target.getBoundingClientRect()
    const desired = !placement || placement === 'auto' ? this.pickPlacement(rect) : placement
    const { top, left } = this.placementCoords(rect, desired)
    style.position = 'fixed'
    style.transform = 'none'
    style.top = `${top}px`
    style.left = `${left}px`
    const tooltipRect = this.dom.tooltip.getBoundingClientRect()
    const clampedTop = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8))
    const clampedLeft = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))
    style.top = `${clampedTop}px`
    style.left = `${clampedLeft}px`
  }

  pickPlacement(rect) {
    if (window.innerHeight - rect.bottom > 200) { return 'bottom' }
    if (rect.top > 200) { return 'top' }
    if (window.innerWidth - rect.right > TOOLTIP_WIDTH) { return 'right' }
    return 'left'
  }

  placementCoords(rect, placement) {
    switch (placement) {
      case 'top':    return { top: rect.top - TOOLTIP_GAP - 200, left: rect.left }
      case 'bottom': return { top: rect.bottom + TOOLTIP_GAP, left: rect.left }
      case 'left':   return { top: rect.top, left: rect.left - TOOLTIP_GAP - TOOLTIP_WIDTH }
      case 'right':  return { top: rect.top, left: rect.right + TOOLTIP_GAP }
      default:       return { top: rect.bottom + TOOLTIP_GAP, left: rect.left }
    }
  }

  wireStepTriggers(step, target) {
    this.wireKeyboard()
    this.wireCloseButton()

    const advance = step.advanceOn ?? 'next'
    if (advance === 'next') {
      this.dom.nextButton.hidden = false
      this.bindCleanup(this.dom.nextButton, 'click', () => this.next())
      return
    }
    this.dom.nextButton.hidden = true

    if (advance === 'click') {
      if (!target) { return }
      this.bindCleanup(target, 'click', () => this.next())
      return
    }

    if (typeof advance === 'object' && advance.event) {
      const handler = (event) => {
        const detail = event.detail || {}
        if (advance.when && !advance.when(detail)) { return }
        if (advance.selector && !event.target?.closest?.(advance.selector)) { return }
        this.next(detail)
      }
      this.bindCleanup(document, advance.event, handler)
    }
  }

  wireKeyboard() {
    const handler = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); this.close() }
    }
    this.bindCleanup(document, 'keydown', handler, true)
  }

  wireCloseButton() {
    this.bindCleanup(this.dom.closeButton, 'click', () => this.close())
  }

  bindCleanup(element, event, handler, capture = false) {
    element.addEventListener(event, handler, capture)
    this.stepCleanup.push(() => element.removeEventListener(event, handler, capture))
  }

  teardownStep() {
    this.stepCleanup.forEach((fn) => fn())
    this.stepCleanup = []
    if (this.spotlightTarget) {
      this.spotlightTarget.classList.remove('tour-spotlight')
      this.spotlightTarget = null
    }
  }

  mountDom() {
    const makeBackdrop = (modifier) => {
      const el = document.createElement('div')
      el.className = `tour-backdrop tour-backdrop--${modifier}`
      return el
    }
    const backdropFull = makeBackdrop('full')
    const frameTop = makeBackdrop('frame')
    const frameRight = makeBackdrop('frame')
    const frameBottom = makeBackdrop('frame')
    const frameLeft = makeBackdrop('frame')

    const halo = document.createElement('div')
    halo.className = 'tour-halo'

    const tooltip = document.createElement('div')
    tooltip.className = 'tour-tooltip'
    tooltip.setAttribute('role', 'dialog')
    tooltip.setAttribute('aria-modal', 'true')

    const closeButton = document.createElement('button')
    closeButton.type = 'button'
    closeButton.className = 'tour-tooltip__close'
    closeButton.setAttribute('aria-label', 'Close tour')
    closeButton.textContent = '×'

    const heading = document.createElement('h3')
    heading.className = 'tour-tooltip__title'

    const body = document.createElement('div')
    body.className = 'tour-tooltip__body'

    const footer = document.createElement('div')
    footer.className = 'tour-tooltip__footer'

    const progress = document.createElement('span')
    progress.className = 'tour-tooltip__progress'

    const nextButton = document.createElement('button')
    nextButton.type = 'button'
    nextButton.className = 'tour-tooltip__next'
    nextButton.textContent = 'Next'

    footer.append(progress, nextButton)
    tooltip.append(closeButton, heading, body, footer)
    document.body.append(backdropFull, frameTop, frameRight, frameBottom, frameLeft, halo, tooltip)

    const stopPropagation = (e) => e.stopPropagation()
    ;[backdropFull, frameTop, frameRight, frameBottom, frameLeft, tooltip]
      .forEach((el) => el.addEventListener('click', stopPropagation))

    this.dom = {
      backdropFull, frameTop, frameRight, frameBottom, frameLeft, halo,
      tooltip, title: heading, body, footer, progress, nextButton, closeButton
    }
  }

  unmountDom() {
    if (!this.dom) { return }
    this.dom.backdropFull.remove()
    this.dom.frameTop.remove()
    this.dom.frameRight.remove()
    this.dom.frameBottom.remove()
    this.dom.frameLeft.remove()
    this.dom.halo.remove()
    this.dom.tooltip.remove()
    this.dom = null
  }
}
