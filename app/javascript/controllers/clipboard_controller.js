import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { text: String }
  static targets = ["button"]

  copy() {
    if (!navigator.clipboard) return this.flash("Copy unavailable")
    navigator.clipboard.writeText(this.textValue)
      .then(() => this.flash("Copied"))
      .catch(() => this.flash("Copy failed"))
  }

  flash(message) {
    if (!this.hasButtonTarget) return
    const original = this.buttonTarget.dataset.label || this.buttonTarget.textContent
    this.buttonTarget.dataset.label = original
    this.buttonTarget.textContent = message
    clearTimeout(this.timer)
    this.timer = setTimeout(() => { this.buttonTarget.textContent = original }, 1500)
  }

  disconnect() {
    clearTimeout(this.timer)
  }
}
