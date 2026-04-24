import { Controller } from "@hotwired/stimulus"

const ROTATION_INTERVAL_MS = 6500

export default class extends Controller {
  static targets = ["line"]
  static values = {
    tips: Array
  }

  connect() {
    this.currentIndex = 0
    this.intervalId = null
    this.isPaused = false

    this.renderCurrentTip()
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
    if (!this.hasLineTarget || this.tipsValue.length <= 1) { return }

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
    this.currentIndex = (this.currentIndex + 1) % this.tipsValue.length
    this.renderCurrentTip()
  }

  renderCurrentTip() {
    if (!this.hasLineTarget || this.tipsValue.length === 0) { return }

    this.lineTarget.classList.remove('sidebar__tips-line--animate')
    void this.lineTarget.offsetWidth
    this.lineTarget.textContent = this.tipsValue[this.currentIndex]
    this.lineTarget.classList.add('sidebar__tips-line--animate')
  }
}
