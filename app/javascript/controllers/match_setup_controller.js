import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["staleBotConfirmation"]

  confirmStaleCompile(event) {
    if (this.staleBotConfirmationTarget.value === 'compile') { return }
    const staleOwnedBots = this.selectedStaleOwnedBots()
    if (staleOwnedBots.length === 0) { return }
    event.preventDefault()
    const message = staleOwnedBots.length === 1
      ? `${staleOwnedBots[0].name} needs to be recompiled before match generation. Compile and continue?`
      : `${staleOwnedBots.map(bot => bot.name).join(' and ')} each need to be recompiled before match generation. Compile both and continue?`
    if (!window.confirm(message)) { return }
    this.staleBotConfirmationTarget.value = 'compile'
    this.element.submit()
  }

  selectedStaleOwnedBots() {
    return Array.from(this.element.querySelectorAll('input[type="radio"]:checked'))
      .filter(input => input.dataset.botOwned === 'true' && input.dataset.botStale === 'true')
      .map(input => ({ name: input.dataset.botName }))
  }
}
