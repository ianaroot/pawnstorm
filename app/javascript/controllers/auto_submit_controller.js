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

  reset() {
    clearTimeout(this.timer)
    this.element.querySelectorAll('input[type="text"]').forEach((field) => { field.value = "" })
    this.element.querySelectorAll('[data-sort-target="field"]').forEach((field) => { field.value = "" })
    this.element.requestSubmit()
  }

  disconnect() {
    clearTimeout(this.timer)
  }
}
