import { Controller } from "@hotwired/stimulus"

// Paginated "How it works" walkthrough modal for the bot editor.
// Auto-opens once when the editor is reached via the post-create redirect
// (bots#create adds ?intro=1, surfaced as the `auto` value). Also reopenable
// from the "How it works" toolbar button.
export default class extends Controller {
  static targets = ["modal", "dialog", "slide", "dot", "prev", "next"]
  static values = { auto: Boolean }

  connect() {
    this.index = 0
    this.boundKeydown = this.handleKeydown.bind(this)
    this.render()
    if (this.autoValue) { this.open() }
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundKeydown, true)
  }

  open() {
    this.opener = document.activeElement
    this.index = 0
    this.render()
    this.modalTarget.classList.remove("hidden")
    this.modalTarget.setAttribute("aria-hidden", "false")
    // Capture phase so the editor's global KeyboardHandler does not also
    // act on Escape / arrow keys while the modal owns focus.
    document.addEventListener("keydown", this.boundKeydown, true)
    this.dialogTarget.focus()
  }

  close() {
    this.modalTarget.classList.add("hidden")
    this.modalTarget.setAttribute("aria-hidden", "true")
    document.removeEventListener("keydown", this.boundKeydown, true)
    if (this.opener && typeof this.opener.focus === "function") {
      this.opener.focus()
    }
  }

  next() {
    if (this.index >= this.lastIndex) { this.close(); return }
    this.index += 1
    this.render()
  }

  prev() {
    if (this.index === 0) { return }
    this.index -= 1
    this.render()
  }

  goto(event) {
    const target = Number(event.currentTarget.dataset.index)
    if (Number.isNaN(target)) { return }
    this.index = Math.min(Math.max(target, 0), this.lastIndex)
    this.render()
  }

  get lastIndex() {
    return this.slideTargets.length - 1
  }

  render() {
    this.slideTargets.forEach((slide, i) => {
      slide.hidden = i !== this.index
    })
    this.dotTargets.forEach((dot, i) => {
      const active = i === this.index
      dot.classList.toggle("bot-intro-modal__dot--active", active)
      dot.setAttribute("aria-selected", active ? "true" : "false")
    })
    if (this.hasPrevTarget) {
      this.prevTarget.disabled = this.index === 0
    }
    if (this.hasNextTarget) {
      this.nextTarget.textContent = this.index >= this.lastIndex ? "Done" : "Next"
    }
  }

  isOpen() {
    return !this.modalTarget.classList.contains("hidden")
  }

  handleKeydown(event) {
    if (!this.isOpen()) { return }

    if (event.key === "Escape") {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.close()
      return
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.next()
      return
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.prev()
      return
    }

    if (event.key === "Tab") {
      this.trapFocus(event)
    }
  }

  trapFocus(event) {
    const focusable = this.dialogTarget.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) { return }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey && (active === first || active === this.dialogTarget)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }
}
