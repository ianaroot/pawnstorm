import { Controller } from "@hotwired/stimulus"

const ROTATION_INTERVAL_MS = 6500

export default class extends Controller {
  static targets = ["card", "dot"]

  connect() {
    this.currentIndex = 0
    this.intervalId = null
    this.isPaused = false

    this.show(this.currentIndex)
    this.startRotation()
  }

  disconnect() {
    this.stopRotation()
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  startRotation() {
    this.stopRotation()
    if (this.cardTargets.length <= 1) { return }

    this.intervalId = window.setInterval(() => {
      if (this.isPaused) { return }
      this.advance()
    }, ROTATION_INTERVAL_MS)
  }

  stopRotation() {
    if (!this.intervalId) { return }
    window.clearInterval(this.intervalId)
    this.intervalId = null
  }

  advance() {
    const nextIndex = (this.currentIndex + 1) % this.cardTargets.length
    this.show(nextIndex)
  }

  goTo(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (Number.isNaN(index)) { return }

    this.show(index)
    this.startRotation()
  }

  show(index) {
    if (this.cardTargets.length === 0) { return }

    this.cardTargets.forEach((card, cardIndex) => {
      const active = cardIndex === index
      card.hidden = !active
      card.classList.toggle('is-active', active)
    })

    this.dotTargets.forEach((dot, dotIndex) => {
      const active = dotIndex === index
      dot.classList.toggle('is-active', active)
      dot.setAttribute('aria-pressed', active ? 'true' : 'false')
    })

    this.animateCard(this.cardTargets[index])
    this.currentIndex = index
  }

  animateCard(card) {
    if (!card || typeof card.animate !== 'function') { return }

    card.animate(
      [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 420, easing: 'ease' }
    )
  }
}
