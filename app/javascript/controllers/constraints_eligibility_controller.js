import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { url: String }
  static targets = ["button", "panel", "filterInput", "row"]

  async check() {
    this.buttonTarget.disabled = true
    this.buttonTarget.textContent = 'Checking…'
    this.panelTarget.hidden = true

    try {
      const response = await fetch(this.urlValue, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content,
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: this.collectConstraints()
      })

      if (!response.ok) throw new Error()
      const { results } = await response.json()
      this.renderResults(results)
    } catch {
      this.panelTarget.innerHTML = '<p class="ce-error">Could not check eligibility.</p>'
      this.panelTarget.hidden = false
    } finally {
      this.buttonTarget.disabled = false
      this.buttonTarget.textContent = 'Check my bots'
    }
  }

  applyFilter() {
    const text = this.filterInputTarget.value.toLowerCase()
    this.rowTargets.forEach(row => {
      const nameMatch = row.dataset.name.includes(text)
      const statusMatch = this.activeFilter === 'all' ||
        (this.activeFilter === 'eligible'   && row.dataset.eligible === 'true') ||
        (this.activeFilter === 'ineligible' && row.dataset.eligible === 'false')
      row.hidden = !(nameMatch && statusMatch)
    })
  }

  setFilter(event) {
    this.activeFilter = event.currentTarget.dataset.filter
    this.element.querySelectorAll('.ce-pill').forEach(pill => {
      pill.classList.toggle('ce-pill--active', pill.dataset.filter === this.activeFilter)
    })
    this.applyFilter()
  }

  // private

  collectConstraints() {
    const section = this.element.querySelector('.constraints-section')
    const params = new URLSearchParams()
    section.querySelectorAll('input, select').forEach(el => {
      if (!el.name) return
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return
      if (!el.value) return
      params.append(el.name.replace(/^tournament\[constraints\]/, 'constraints'), el.value)
    })
    return params.toString()
  }

  renderResults(results) {
    this.activeFilter = 'all'

    if (results.length === 0) {
      this.panelTarget.innerHTML = '<p class="ce-empty">No compiled bots to check.</p>'
      this.panelTarget.hidden = false
      return
    }

    this.panelTarget.innerHTML = `
      <div class="ce-filter-bar">
        <input type="text" class="ce-filter-input" placeholder="Filter by name…"
               data-constraints-eligibility-target="filterInput"
               data-action="input->constraints-eligibility#applyFilter">
        <div class="ce-filter-pills">
          <button type="button" class="ce-pill ce-pill--active" data-filter="all"
                  data-action="click->constraints-eligibility#setFilter">All</button>
          <button type="button" class="ce-pill" data-filter="eligible"
                  data-action="click->constraints-eligibility#setFilter">Eligible</button>
          <button type="button" class="ce-pill" data-filter="ineligible"
                  data-action="click->constraints-eligibility#setFilter">Ineligible</button>
        </div>
      </div>
      <table class="ce-table">
        <thead>
          <tr>
            <th>Bot</th>
            <th>Eligible</th>
            <th>Cost</th>
            <th>Violations</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => this.renderRow(r)).join('')}
        </tbody>
      </table>
    `
    this.panelTarget.hidden = false
  }

  renderRow(result) {
    const name     = this.escapeHtml(result.bot_name)
    const cost     = result.budget != null ? `${result.cost} / ${result.budget}` : result.cost
    const violations = result.violations
      .filter(v => v.type !== 'budget')
      .map(v => this.escapeHtml(v.message))
      .join('<span class="ce-sep"> ; </span>')

    return `
      <tr class="ce-row"
          data-constraints-eligibility-target="row"
          data-eligible="${result.eligible}"
          data-name="${name.toLowerCase()}">
        <td>${name}</td>
        <td><span class="ce-badge ce-badge--${result.eligible ? 'eligible' : 'ineligible'}">${result.eligible ? 'Yes' : 'No'}</span></td>
        <td class="ce-cost">${cost}</td>
        <td class="ce-violations">${violations}</td>
        <td><a href="/bots/${result.bot_id}/edit" class="ce-edit-link">Edit</a></td>
      </tr>
    `
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
}
