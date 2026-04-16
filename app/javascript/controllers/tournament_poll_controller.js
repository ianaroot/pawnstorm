import { Controller } from "@hotwired/stimulus"

const POLL_INTERVAL_MS = 10000
const FLASH_DURATION_MS = 900

export default class extends Controller {
  static targets = ["meta", "progress", "standings", "matrix"]
  static values = {
    active: Boolean,
    url: String
  }

  connect() {
    if (!this.activeValue) { return }
    this.poll()
    this.startPolling()
  }

  disconnect() {
    this.stopPolling()
  }

  startPolling() {
    this.stopPolling()
    this.pollTimer = window.setInterval(() => this.poll(), POLL_INTERVAL_MS)
  }

  stopPolling() {
    if (!this.pollTimer) { return }
    window.clearInterval(this.pollTimer)
    this.pollTimer = null
  }

  async poll() {
    try {
      const response = await fetch(this.urlValue, {
        headers: { Accept: "application/json" },
        credentials: "same-origin"
      })
      if (!response.ok) { return }
      const payload = await response.json()
      this.replaceSection(this.metaTarget, payload.meta_html)
      this.updateSectionFields(this.progressTarget, payload.progress_html)
      this.updateStandings(this.standingsTarget, payload.standings_html)
      this.updateSectionFields(this.matrixTarget, payload.matrix_html)
      if (payload.polling_complete) { this.stopPolling() }
    } catch (_error) {
      this.stopPolling()
    }
  }

  replaceSection(target, html) {
    if (target.innerHTML === html) { return }
    target.innerHTML = html
  }

  updateSectionFields(target, html) {
    const fragment = this.fragmentFor(html)
    const incomingFields = Array.from(fragment.querySelectorAll("[data-tournament-field]"))
    const currentFieldsByKey = new Map(
      Array.from(target.querySelectorAll("[data-tournament-field]")).map((element) => [element.dataset.tournamentField, element])
    )
    if (incomingFields.length === 0 || currentFieldsByKey.size === 0) {
      this.replaceSection(target, html)
      return
    }
    const incomingKeys = incomingFields.map((element) => element.dataset.tournamentField)
    const currentKeys = Array.from(currentFieldsByKey.keys())
    if (!this.sameKeys(currentKeys, incomingKeys)) {
      this.replaceSection(target, html)
      return
    }
    incomingFields.forEach((incomingField) => {
      const currentField = currentFieldsByKey.get(incomingField.dataset.tournamentField)
      if (!currentField) { return }
      if (currentField.innerHTML === incomingField.innerHTML) { return }
      currentField.innerHTML = incomingField.innerHTML
      this.flash(currentField)
    })
  }

  updateStandings(target, html) {
    const fragment = this.fragmentFor(html)
    const incomingBody = fragment.querySelector("tbody")
    const currentBody = target.querySelector("tbody")
    if (!incomingBody || !currentBody) {
      this.replaceSection(target, html)
      return
    }
    const incomingRows = Array.from(incomingBody.querySelectorAll("[data-tournament-row]"))
    const currentRowsByKey = new Map(
      Array.from(currentBody.querySelectorAll("[data-tournament-row]")).map((row) => [row.dataset.tournamentRow, row])
    )
    if (incomingRows.length === 0 || currentRowsByKey.size === 0) {
      this.replaceSection(target, html)
      return
    }
    const incomingKeys = incomingRows.map((row) => row.dataset.tournamentRow)
    const currentKeys = Array.from(currentRowsByKey.keys())
    if (!this.sameMembers(currentKeys, incomingKeys)) {
      this.replaceSection(target, html)
      return
    }
    incomingRows.forEach((incomingRow, index) => {
      const key = incomingRow.dataset.tournamentRow
      const currentRow = currentRowsByKey.get(key)
      if (!currentRow) { return }
      currentBody.appendChild(currentRow)
      this.updateRowFields(currentRow, incomingRow)
      if (currentKeys[index] !== key) {
        this.flash(currentRow)
      }
    })
  }

  updateRowFields(currentRow, incomingRow) {
    const incomingFields = Array.from(incomingRow.querySelectorAll("[data-tournament-field]"))
    const currentFieldsByKey = new Map(
      Array.from(currentRow.querySelectorAll("[data-tournament-field]")).map((element) => [element.dataset.tournamentField, element])
    )
    incomingFields.forEach((incomingField) => {
      const currentField = currentFieldsByKey.get(incomingField.dataset.tournamentField)
      if (!currentField) { return }
      if (currentField.innerHTML === incomingField.innerHTML) { return }
      currentField.innerHTML = incomingField.innerHTML
      this.flash(currentField)
    })
  }

  fragmentFor(html) {
    const template = document.createElement("template")
    template.innerHTML = html.trim()
    return template.content
  }

  sameKeys(left, right) {
    if (left.length !== right.length) { return false }
    return left.every((key, index) => key === right[index])
  }

  sameMembers(left, right) {
    if (left.length !== right.length) { return false }
    const leftSet = new Set(left)
    return right.every((key) => leftSet.has(key))
  }

  flash(element) {
    element.classList.remove("tournament-poll-updated")
    void element.offsetWidth
    element.classList.add("tournament-poll-updated")
    window.setTimeout(() => {
      element.classList.remove("tournament-poll-updated")
    }, FLASH_DURATION_MS)
  }
}
