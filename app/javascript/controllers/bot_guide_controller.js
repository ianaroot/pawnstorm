import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["drawer", "toggle", "content"]

  connect() {
    this.boundHandleKeydown = this.handleKeydown.bind(this)
    document.addEventListener("keydown", this.boundHandleKeydown)
    this.updateToggleState(false)
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundHandleKeydown)
  }

  open() {
    this.drawerTarget.classList.remove("hidden")
    this.drawerTarget.classList.add("bot-guide-drawer--open")
    this.updateToggleState(true)
  }

  close() {
    this.drawerTarget.classList.add("hidden")
    this.drawerTarget.classList.remove("bot-guide-drawer--open")
    this.updateToggleState(false)
  }

  toggle() {
    if (this.isOpen()) {
      this.close()
    } else {
      this.open()
    }
  }

  isOpen() {
    return this.drawerTarget.classList.contains("bot-guide-drawer--open")
  }

  scrollToSection(event) {
    event.preventDefault()

    const sectionId = event.currentTarget.dataset.sectionId
    if (!sectionId || !this.hasContentTarget) return

    const section = this.contentTarget.querySelector(`#${sectionId}`)
    if (!section) return

    section.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  handleKeydown(event) {
    if (event.key === "Escape" && this.isOpen()) {
      this.close()
    }
  }

  updateToggleState(expanded) {
    this.toggleTargets.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false")
    })
  }
}
