import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { url: String }
  static targets = ["loader", "form", "select", "noBotsMessage"]

  async connect() {
    try {
      const response = await fetch(this.urlValue, {
        headers: { Accept: "application/json" },
        credentials: "same-origin"
      })
      if (!response.ok) { return this.showForm() }
      const { eligible_bot_ids } = await response.json()
      this.filterBots(eligible_bot_ids)
    } catch {
      this.showForm()
    }
  }

  filterBots(eligibleIds) {
    const idSet = new Set(eligibleIds.map(String))
    Array.from(this.selectTarget.options).forEach(option => {
      if (!idSet.has(option.value)) option.remove()
    })

    if (this.selectTarget.options.length === 0) {
      this.formTarget.hidden = true
      this.noBotsMessageTarget.hidden = false
    } else {
      this.showForm()
    }
  }

  showForm() {
    this.loaderTarget.hidden = true
    this.formTarget.hidden = false
  }
}
