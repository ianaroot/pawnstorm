import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["staleBotConfirmation", "form", "opponentForm", "ownBotIdField"]
  static values = { staleMessageTemplate: String }

  ownBotChosen(event) {
    this.ownBotIdFieldTargets.forEach((field) => { field.value = event.target.value })
    this.opponentFormTarget.requestSubmit()
  }

  confirmStaleCompile(event) {
    if (this.staleBotConfirmationTarget.value === 'compile') { return }
    const staleOwnedBots = this.selectedStaleOwnedBots()
    if (staleOwnedBots.length === 0) { return }
    event.preventDefault()
    const names = staleOwnedBots.map(bot => bot.name).join(' and ')
    const message = this.staleMessageTemplateValue.replace('%{names}', names)
    if (!window.confirm(message)) { return }
    this.staleBotConfirmationTarget.value = 'compile'
    this.formTarget.submit()
  }

  selectedStaleOwnedBots() {
    return Array.from(this.element.querySelectorAll('input[type="radio"]:checked'))
      .filter(input => input.dataset.botOwned === 'true' && input.dataset.botStale === 'true')
      .map(input => ({ name: input.dataset.botName }))
  }
}
