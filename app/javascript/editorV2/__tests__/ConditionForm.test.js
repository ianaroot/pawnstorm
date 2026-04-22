import { beforeEach, describe, expect, it } from 'vitest'

import ConditionForm from '../panels/ConditionForm.js'

function option(value, label = value) {
  return `<option value="${value}">${label}</option>`
}

const subjectOptions = ['allied', 'enemy', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece']
  .map(value => option(value))
  .join('')
const operatorOptions = ['attack', 'defend', 'cover', 'shield', 'adjacent', 'same_piece', 'count', 'mobility', 'value']
  .map(value => option(value))
  .join('')

function buildPanel() {
  const panel = document.createElement('div')
  panel.id = 'node-form-panel'
  panel.innerHTML = `
    <select id="cond-left-subject">${subjectOptions}</select>
    <label class="condition-form-checkbox">
      <input id="cond-left-filter-mode" type="checkbox">
      <span>Non-</span>
    </label>
    <select id="cond-left-filter">${option('any')}${option('pawn')}${option('rook')}</select>
    <select id="cond-left-comparison-metric">${option('count')}</select>
    <select id="cond-left-comparator">${option('equal_to', '=')}</select>
    <div id="cond-left-comparison-section" class="condition-form-comparison">
      <button type="button" id="cond-left-comparison-toggle"></button>
      <div id="cond-left-comparison-body" class="hidden"></div>
    </div>
    <div id="cond-left-comparison-source-stack" class="condition-form-comparison-source-stack">
      <select id="cond-left-comparison-source">
        ${option('exact_number', 'Integer')}
        ${option('prior_board_state', 'Prior Board State')}
      </select>
      <input id="cond-left-comparison-source-total" type="number">
    </div>

    <select id="cond-operator">${operatorOptions}</select>

    <select id="cond-right-subject">${subjectOptions}</select>
    <label class="condition-form-checkbox">
      <input id="cond-right-filter-mode" type="checkbox">
      <span>Non-</span>
    </label>
    <select id="cond-right-filter">${option('any')}${option('pawn')}${option('rook')}</select>
    <select id="cond-right-comparison-metric">${option('count')}</select>
    <select id="cond-right-comparator">${option('equal_to', '=')}</select>
    <div id="cond-right-comparison-section" class="condition-form-comparison">
      <button type="button" id="cond-right-comparison-toggle"></button>
      <div id="cond-right-comparison-body" class="hidden"></div>
    </div>
    <div id="cond-right-comparison-source-stack" class="condition-form-comparison-source-stack">
      <select id="cond-right-comparison-source">
        ${option('exact_number', 'Integer')}
        ${option('prior_board_state', 'Prior Board State')}
      </select>
      <input id="cond-right-comparison-source-total" type="number">
    </div>

    <div id="cond-right-card-label"></div>
    <div id="cond-right-relational-fields"></div>
    <div id="cond-unary-comparison-section" class="hidden">
      <label>Comparator</label>
      <select id="cond-unary-comparator">${option('greater_than', '>')}</select>
    </div>
    <div id="cond-unary-target-section" class="hidden">
      <label>Target</label>
      <select id="cond-unary-target">
        ${option('exact_number', 'Integer')}
        ${option('allied', 'Allied')}
        ${option('enemy', 'Enemy')}
        ${option('moved_piece', 'Moved Piece')}
        ${option('captured_piece', 'Captured Piece')}
        ${option('enemy_moved_piece', 'Enemy Moved Piece')}
        ${option('enemy_captured_piece', 'Enemy Captured Piece')}
        ${option('prior_board_state', 'Prior Board State')}
      </select>
    </div>
    <div id="cond-left-filter-row"></div>
    <div id="cond-right-filter-row"></div>
    <div id="cond-formulation-preview"></div>

    <div id="cond-unary-target-stack" class="condition-form-comparison-source-stack">
      <input id="cond-unary-target-total" type="number">
      <div class="condition-form-inline-pair" id="cond-unary-target-filter-row">
        <label class="condition-form-checkbox">
          <input id="cond-unary-target-filter-mode" type="checkbox">
          <span>Non-</span>
        </label>
        <select id="cond-unary-target-filter">${option('any')}${option('pawn')}${option('rook')}</select>
      </div>
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
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 2,
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    })

    expect(panel.querySelector('#cond-left-comparison-source').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-left-comparison-source-total').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-source-total').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-unary-target-total').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-left-comparison-source-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(true)
    expect(panel.querySelector('#cond-right-comparison-source-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(true)
    expect(panel.querySelector('#cond-unary-target-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(true)

    const rightSource = panel.querySelector('#cond-right-comparison-source')
    rightSource.value = 'prior_board_state'
    rightSource.dispatchEvent(new Event('change', { bubbles: true }))

    expect(panel.querySelector('#cond-left-comparison-source-total').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-source-total').classList.contains('hidden')).toBe(true)
    expect(panel.querySelector('#cond-unary-target-total').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-source').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-source-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(false)
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
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 2,
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    })

    const leftSource = panel.querySelector('#cond-left-comparison-source')
    leftSource.value = 'prior_board_state'
    leftSource.dispatchEvent(new Event('change', { bubbles: true }))

    expect(panel.querySelector('#cond-left-comparison-source-total').classList.contains('hidden')).toBe(true)
    expect(panel.querySelector('#cond-right-comparison-source-total').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-left-comparison-source').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-left-comparison-source-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-source-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(true)
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

  it('limits attack targets to the opposing team from the selected subject', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'allied',
      targetFilter: 'any'
    })

    const rightSubject = panel.querySelector('#cond-right-subject')
    expect(form.buildPayload().target).toBe('enemy')
    expect(rightSubject.querySelector('option[value="enemy"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="enemy_moved_piece"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="allied"]').disabled).toBe(true)
    expect(rightSubject.querySelector('option[value="moved_piece"]').disabled).toBe(true)
  })

  it('limits defend cover and shield targets to the same team as the selected subject', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'enemy',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'any'
    })

    const rightSubject = panel.querySelector('#cond-right-subject')
    expect(form.buildPayload().target).toBe('enemy')
    expect(rightSubject.querySelector('option[value="enemy"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="enemy_moved_piece"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="allied"]').disabled).toBe(true)
    expect(rightSubject.querySelector('option[value="moved_piece"]').disabled).toBe(true)

    const operator = panel.querySelector('#cond-operator')
    operator.value = 'cover'
    operator.dispatchEvent(new Event('change', { bubbles: true }))
    expect(form.buildPayload().target).toBe('enemy')

    operator.value = 'shield'
    operator.dispatchEvent(new Event('change', { bubbles: true }))
    expect(form.buildPayload().target).toBe('enemy')
  })

  it('keeps adjacent targets unrestricted among regular relational targets', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'adjacent',
      target: 'enemy_moved_piece',
      targetFilter: 'any'
    })

    const rightSubject = panel.querySelector('#cond-right-subject')
    expect(form.buildPayload().target).toBe('enemy_moved_piece')
    expect(rightSubject.querySelector('option[value="allied"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="enemy"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="moved_piece"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="enemy_moved_piece"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="captured_piece"]').disabled).toBe(true)
  })

  it('uses rendered grammar config for relational target scoping', () => {
    const rules = document.createElement('script')
    rules.type = 'application/json'
    rules.id = 'node-grammar-rules'
    rules.textContent = JSON.stringify({
      editorSubjects: ['allied', 'enemy', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'],
      regularRelationalSubjects: ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'],
      regularRelationalTargets: ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'],
      relationalOperatorTargetRules: { attack: 'same_team' },
      samePieceTargets: { enemy_moved_piece: ['captured_piece'], captured_piece: ['enemy_moved_piece'] },
      teamSubjectGroups: { allied: ['allied', 'moved_piece'], enemy: ['enemy', 'enemy_moved_piece'] },
      opposingTeamGroups: { allied: 'enemy', enemy: 'allied' }
    })
    document.body.appendChild(rules)

    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    })

    expect(form.buildPayload().target).toBe('allied')
  })

  it('builds unary actor-target payloads with target filters', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'unary',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'value',
      comparator: 'greater_than',
      target: 'enemy',
      targetFilter: 'rook',
      targetFilterMode: 'exclude'
    })

    expect(panel.querySelector('#cond-unary-target-total').classList.contains('hidden')).toBe(true)
    expect(panel.querySelector('#cond-unary-target-filter-row').classList.contains('hidden')).toBe(false)
    expect(form.buildPayload()).toMatchObject({
      version: 2,
      kind: 'unary',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'value',
      comparator: 'greater_than',
      target: 'enemy',
      targetFilter: 'rook',
      targetFilterMode: 'exclude'
    })
  })

  it('hides and clears the unary target non toggle when the target filter is any', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'unary',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'value',
      comparator: 'greater_than',
      target: 'enemy',
      targetFilter: 'rook',
      targetFilterMode: 'exclude'
    })

    const targetFilterMode = panel.querySelector('#cond-unary-target-filter-mode')
    const targetFilterModeControl = targetFilterMode.closest('.condition-form-checkbox')
    expect(targetFilterMode.checked).toBe(true)
    expect(targetFilterModeControl.classList.contains('condition-form-checkbox--unavailable')).toBe(false)

    const targetFilter = panel.querySelector('#cond-unary-target-filter')
    targetFilter.value = 'any'
    targetFilter.dispatchEvent(new Event('change', { bubbles: true }))

    expect(targetFilterMode.checked).toBe(false)
    expect(targetFilterModeControl.classList.contains('condition-form-checkbox--unavailable')).toBe(true)
    expect(form.buildPayload()).not.toHaveProperty('targetFilterMode')
  })

  it('disallows captured-piece unary targets for mobility', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'unary',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'mobility',
      comparator: 'greater_than',
      target: 'captured_piece',
      targetFilter: 'any'
    })

    const targetSource = panel.querySelector('#cond-unary-target')
    expect(form.buildPayload().target).toBe('exact_number')
    expect(targetSource.querySelector('option[value="captured_piece"]').disabled).toBe(true)
    expect(targetSource.querySelector('option[value="enemy_captured_piece"]').disabled).toBe(true)
    expect(targetSource.querySelector('option[value="enemy"]').disabled).toBe(false)
  })
})
