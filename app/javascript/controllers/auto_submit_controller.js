import { Controller } from "@hotwired/stimulus"

const DEBOUNCE_MS = 300

export default class extends Controller {
  submitNow() {
    clearTimeout(this.timer)
    this.element.requestSubmit()
  }

  submitDebounced() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.element.requestSubmit(), DEBOUNCE_MS)
  }

  disconnect() {
    clearTimeout(this.timer)
  }
}
