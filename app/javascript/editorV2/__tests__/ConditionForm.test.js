import { beforeEach, describe, expect, it } from 'vitest'

import ConditionForm from '../panels/ConditionForm.js'

function option(value, label = value) {
  return `<option value="${value}">${label}</option>`
}

function buildPanel() {
  const panel = document.createElement('div')
  panel.id = 'node-form-panel'
  panel.innerHTML = `
    <select id="cond-left-subject">${option('allied')}</select>
    <label class="condition-form-checkbox">
      <input id="cond-left-filter-mode" type="checkbox">
      <span>Non-</span>
    </label>
    <select id="cond-left-filter">${option('any')}${option('pawn')}</select>
    <select id="cond-left-comparison-metric">${option('count')}</select>
    <select id="cond-left-comparator">${option('equal_to', '=')}</select>
    <div id="cond-left-comparison-section" class="condition-form-comparison">
      <button type="button" id="cond-left-comparison-toggle"></button>
      <div id="cond-left-comparison-body" class="hidden"></div>
    </div>
    <div id="cond-left-comparison-value-stack" class="condition-form-comparison-value-stack">
      <select id="cond-left-comparison-value-source">
        ${option('exact_number', 'Integer')}
        ${option('prior_board_state', 'Prior Board State')}
      </select>
      <input id="cond-left-comparison-value-number" type="number">
    </div>

    <select id="cond-operator">${option('attack')}</select>

    <select id="cond-right-subject">${option('enemy')}</select>
    <label class="condition-form-checkbox">
      <input id="cond-right-filter-mode" type="checkbox">
      <span>Non-</span>
    </label>
    <select id="cond-right-filter">${option('any')}${option('pawn')}</select>
    <select id="cond-right-comparison-metric">${option('count')}</select>
    <select id="cond-right-comparator">${option('equal_to', '=')}</select>
    <div id="cond-right-comparison-section" class="condition-form-comparison">
      <button type="button" id="cond-right-comparison-toggle"></button>
      <div id="cond-right-comparison-body" class="hidden"></div>
    </div>
    <div id="cond-right-comparison-value-stack" class="condition-form-comparison-value-stack">
      <select id="cond-right-comparison-value-source">
        ${option('exact_number', 'Integer')}
        ${option('prior_board_state', 'Prior Board State')}
      </select>
      <input id="cond-right-comparison-value-number" type="number">
    </div>

    <div id="cond-right-card-label"></div>
    <div id="cond-right-relational-fields"></div>
    <div id="cond-unary-comparison-section" class="hidden"></div>
    <div id="cond-left-filter-row"></div>
    <div id="cond-right-filter-row"></div>
    <div id="cond-formulation-preview"></div>

    <select id="cond-unary-comparator">${option('greater_than', '>')}</select>
    <select id="cond-unary-comparison-value-source">
      ${option('exact_number', 'Integer')}
      ${option('prior_board_state', 'Prior Board State')}
    </select>
    <div id="cond-unary-comparison-value-stack" class="condition-form-comparison-value-stack">
      <input id="cond-unary-comparison-value-number" type="number">
    </div>
  `
  document.body.appendChild(panel)
  return panel
}

describe('ConditionForm', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('toggles only the matching numeric selector for each comparison block', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      subjectComparisonMetric: 'count',
      subjectComparator: 'equal_to',
      subjectComparisonValue: 2,
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    })

    expect(panel.querySelector('#cond-left-comparison-value-source').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-left-comparison-value-number').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-value-number').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-unary-comparison-value-number').classList.contains('hidden')).toBe(false)

    const rightSource = panel.querySelector('#cond-right-comparison-value-source')
    rightSource.value = 'prior_board_state'
    rightSource.dispatchEvent(new Event('change', { bubbles: true }))

    expect(panel.querySelector('#cond-left-comparison-value-number').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-value-number').classList.contains('hidden')).toBe(true)
    expect(panel.querySelector('#cond-unary-comparison-value-number').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-value-source').classList.contains('hidden')).toBe(false)
  })

  it('hides the numeric selector when the left source is symbolic and leaves the right side alone', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      subjectComparisonMetric: 'count',
      subjectComparator: 'equal_to',
      subjectComparisonValue: 2,
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    })

    const leftSource = panel.querySelector('#cond-left-comparison-value-source')
    leftSource.value = 'prior_board_state'
    leftSource.dispatchEvent(new Event('change', { bubbles: true }))

    expect(panel.querySelector('#cond-left-comparison-value-number').classList.contains('hidden')).toBe(true)
    expect(panel.querySelector('#cond-right-comparison-value-number').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-left-comparison-value-source').classList.contains('hidden')).toBe(false)
  })

  it('hides and clears the subject non toggle when the subject filter is any', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'pawn',
      subjectFilterMode: 'exclude',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'pawn'
    })

    const leftFilterMode = panel.querySelector('#cond-left-filter-mode')
    const leftFilterModeControl = leftFilterMode.closest('.condition-form-checkbox')
    expect(leftFilterMode.checked).toBe(true)
    expect(leftFilterModeControl.classList.contains('condition-form-checkbox--unavailable')).toBe(false)

    const leftFilter = panel.querySelector('#cond-left-filter')
    leftFilter.value = 'any'
    leftFilter.dispatchEvent(new Event('change', { bubbles: true }))

    expect(leftFilterMode.checked).toBe(false)
    expect(leftFilterModeControl.classList.contains('condition-form-checkbox--unavailable')).toBe(true)
    expect(form.buildPayload()).not.toHaveProperty('subjectFilterMode')
  })

  it('hides and clears the target non toggle when the target filter is any', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'pawn',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'pawn',
      targetFilterMode: 'exclude'
    })

    const rightFilterMode = panel.querySelector('#cond-right-filter-mode')
    const rightFilterModeControl = rightFilterMode.closest('.condition-form-checkbox')
    expect(rightFilterMode.checked).toBe(true)
    expect(rightFilterModeControl.classList.contains('condition-form-checkbox--unavailable')).toBe(false)

    const rightFilter = panel.querySelector('#cond-right-filter')
    rightFilter.value = 'any'
    rightFilter.dispatchEvent(new Event('change', { bubbles: true }))

    expect(rightFilterMode.checked).toBe(false)
    expect(rightFilterModeControl.classList.contains('condition-form-checkbox--unavailable')).toBe(true)
    expect(form.buildPayload()).not.toHaveProperty('targetFilterMode')
  })
})
