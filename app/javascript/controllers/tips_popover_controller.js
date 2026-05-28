import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "popover", "button",
    "tipsTab", "botGuideTab",
    "tipsPanel", "botGuidePanel"
  ]

  connect() {
    this.handleOutsideClick = this.handleOutsideClick.bind(this)
    this.handleEscape = this.handleEscape.bind(this)
  }

  disconnect() {
    this.removeGlobalListeners()
  }

  toggle(event) {
    event.stopPropagation()
    if (this.isOpen) { this.close() } else { this.open() }
  }

  open() {
    this.popoverTarget.hidden = false
    this.buttonTarget.setAttribute("aria-expanded", "true")
    document.addEventListener("click", this.handleOutsideClick)
    document.addEventListener("keydown", this.handleEscape)
  }

  close() {
    this.popoverTarget.hidden = true
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.removeGlobalListeners()
  }

  get isOpen() {
    return !this.popoverTarget.hidden
  }

  showTips(event) {
    event.stopPropagation()
    this.activateTab(this.tipsTabTarget, this.botGuideTabTarget)
    this.tipsPanelTarget.hidden = false
    this.botGuidePanelTarget.hidden = true
  }

  showBotGuide(event) {
    event.stopPropagation()
    this.activateTab(this.botGuideTabTarget, this.tipsTabTarget)
    this.tipsPanelTarget.hidden = true
    this.botGuidePanelTarget.hidden = false
  }

  activateTab(activeTab, inactiveTab) {
    activeTab.classList.add("active")
    activeTab.setAttribute("aria-selected", "true")
    inactiveTab.classList.remove("active")
    inactiveTab.setAttribute("aria-selected", "false")
  }

  handleOutsideClick(event) {
    if (this.element.contains(event.target)) { return }
    this.close()
  }

  handleEscape(event) {
    if (event.key === "Escape") { this.close() }
  }

  removeGlobalListeners() {
    document.removeEventListener("click", this.handleOutsideClick)
    document.removeEventListener("keydown", this.handleEscape)
  }
}
