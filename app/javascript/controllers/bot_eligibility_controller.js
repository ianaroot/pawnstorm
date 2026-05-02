import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { botId: Number, stale: Boolean }
  static targets = ["panel", "select", "inviteInput", "status"]

  connect() {
    this.handleCompiled = () => {
      this.staleValue = false
      if (this.selectTarget.value) this.checkEligibility()
    }
    document.addEventListener('bot:compiled', this.handleCompiled)
  }

  disconnect() {
    document.removeEventListener('bot:compiled', this.handleCompiled)
  }

  toggle() {
    this.panelTarget.hidden = !this.panelTarget.hidden
  }

  tournamentChanged() {
    if (!this.selectTarget.value) { this.clearStatus(); return }
    if (this.staleValue) { this.setStatus('Compile your bot first to check eligibility.', 'neutral'); return }
    this.checkEligibility()
  }

  async lookupInviteTournament() {
    const token = this.inviteInputTarget.value.trim()
    if (!token) return

    try {
      const response = await fetch(`/tournament_lookup?token=${encodeURIComponent(token)}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin'
      })
      if (!response.ok) { this.setStatus('Invite token not found.', 'error'); return }

      const { id, name } = await response.json()
      if (!this.selectTarget.querySelector(`option[value="${id}"]`)) {
        this.selectTarget.add(new Option(name, id))
      }
      this.selectTarget.value = id
      this.inviteInputTarget.value = ''
      this.tournamentChanged()
    } catch {
      this.setStatus('Could not look up invite token.', 'error')
    }
  }

  async checkEligibility() {
    const tournamentId = this.selectTarget.value
    if (!tournamentId) return

    this.setStatus('Checking…', 'neutral')

    try {
      const response = await fetch(`/tournaments/${tournamentId}/eligibility?bot_id=${this.botIdValue}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin'
      })
      if (!response.ok) { this.setStatus('Could not check eligibility.', 'error'); return }

      const result = await response.json()
      if (result.eligible) {
        this.setStatus('Eligible', 'success')
      } else {
        this.setStatus(`Ineligible: ${result.violations.map(v => v.message).join(', ')}`, 'error')
      }
    } catch {
      this.setStatus('Could not check eligibility.', 'error')
    }
  }

  setStatus(message, type) {
    this.statusTarget.textContent = message
    this.statusTarget.dataset.statusType = type
  }

  clearStatus() {
    this.statusTarget.textContent = ''
    delete this.statusTarget.dataset.statusType
  }
}
