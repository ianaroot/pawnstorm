import { beforeEach, describe, expect, it } from 'vitest'

import ConditionForm from '../panels/ConditionForm.js'

function option(value, label = value) {
  return `<option value="${value}">${label}</option>`
}

const subjectOptions = ['allied', 'enemy', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece']
  .map(value => option(value))
  .join('')
const relationalOperatorOptions = ['targets', 'shield', 'adjacent']
  .map(value => option(value))
  .join('')
const identitySubjectOptions = ['enemy_moved_piece', 'captured_piece']
  .map(value => option(value))
  .join('')
const identityTargetOptions = ['captured_piece', 'enemy_moved_piece']
  .map(value => option(value))
  .join('')
const censusOperatorOptions = ['count', 'mobility', 'value']
  .map(value => option(value))
  .join('')
const censusTargetOptions = ['exact_number', 'allied', 'enemy', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece', 'prior_board_state']
  .map(value => option(value))
  .join('')
function radioList(name) {
  return [1, 2, 3, 4, 5, 6, 7, 8]
    .map(v => `<label class="condition-form-checkbox"><input type="radio" name="${name}" value="${v}"${v === 1 ? ' checked' : ''}><span>${v}</span></label>`)
    .join('')
}

function buildPanel() {
  const panel = document.createElement('div')
  panel.id = 'node-form-panel'
  panel.innerHTML = `
    <button type="button" id="cond-mode-census">Positions</button>
    <button type="button" id="cond-mode-relational" class="active">Attack/Defend</button>
    <button type="button" id="cond-mode-identity">Identity</button>

    <div class="condition-form-layout">
      <select id="cond-left-subject">${subjectOptions}</select>
      <label class="condition-form-checkbox">
        <input id="cond-left-filter-mode" type="checkbox">
        <span>Non-</span>
      </label>
      <select id="cond-left-filter">${option('any')}${option('pawn')}${option('rook')}</select>
      <select id="cond-left-comparison-metric">${option('count')}</select>
      <div id="cond-left-comparator">
        <label class="condition-form-checkbox"><input type="radio" name="cond-left-comparator" value="equal_to" checked><span>=</span></label>
        <label class="condition-form-checkbox"><input type="radio" name="cond-left-comparator" value="greater_than"><span>></span></label>
        <label class="condition-form-checkbox"><input type="radio" name="cond-left-comparator" value="less_than"><span><</span></label>
      </div>
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

      <select id="cond-relational-operator">${relationalOperatorOptions}</select>

      <select id="cond-right-subject">${subjectOptions}</select>
      <label class="condition-form-checkbox">
        <input id="cond-right-filter-mode" type="checkbox">
        <span>Non-</span>
      </label>
      <select id="cond-right-filter">${option('any')}${option('pawn')}${option('rook')}</select>
      <select id="cond-right-comparison-metric">${option('count')}</select>
      <div id="cond-right-comparator">
        <label class="condition-form-checkbox"><input type="radio" name="cond-right-comparator" value="equal_to" checked><span>=</span></label>
        <label class="condition-form-checkbox"><input type="radio" name="cond-right-comparator" value="greater_than"><span>></span></label>
        <label class="condition-form-checkbox"><input type="radio" name="cond-right-comparator" value="less_than"><span><</span></label>
      </div>
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
      <div id="cond-left-filter-row"></div>
      <div id="cond-right-filter-row"></div>
      <p id="cond-relational-target-note" class="hidden"></p>
    </div>

    <div class="condition-form-layout condition-form-position-layout hidden" id="cond-census-layout">
      <select id="cond-census-subject">${subjectOptions}</select>
      <div id="cond-census-filter-row">
        <label class="condition-form-checkbox">
          <input id="cond-census-filter-mode" type="checkbox">
          <span>Non-</span>
        </label>
        <select id="cond-census-filter">${option('any')}${option('pawn')}${option('rook')}</select>
      </div>
      <div id="cond-census-comparison" class="condition-form-comparison">
        <button type="button" id="cond-census-comparison-toggle"></button>
        <div id="cond-census-comparison-body" class="hidden">
          <select id="cond-census-operator">${censusOperatorOptions}</select>
          <div id="cond-census-comparator">
            <label class="condition-form-checkbox"><input type="radio" name="cond-census-comparator" value="equal_to" checked><span>=</span></label>
            <label class="condition-form-checkbox"><input type="radio" name="cond-census-comparator" value="greater_than"><span>></span></label>
            <label class="condition-form-checkbox"><input type="radio" name="cond-census-comparator" value="less_than"><span><</span></label>
          </div>
          <div id="cond-census-target-stack" class="condition-form-comparison-source-stack">
            <select id="cond-census-target">${censusTargetOptions}</select>
            <div id="cond-census-target-filter-row">
              <label class="condition-form-checkbox">
                <input id="cond-census-target-filter-mode" type="checkbox">
                <span>Non-</span>
              </label>
              <select id="cond-census-target-filter">${option('any')}${option('pawn')}${option('rook')}</select>
            </div>
            <input id="cond-census-target-total" type="number">
          </div>
        </div>
      </div>

      <div id="cond-census-scope">
        <label class="condition-form-checkbox">
          <input type="radio" name="cond-census-scope" id="cond-census-scope-whole" value="whole">
          <span>Whole board</span>
        </label>
        <label class="condition-form-checkbox">
          <input type="radio" name="cond-census-scope" id="cond-census-axis-rank" value="rank" checked>
          <span>Rank</span>
        </label>
        <label class="condition-form-checkbox">
          <input type="radio" name="cond-census-scope" id="cond-census-axis-file" value="file">
          <span>File</span>
        </label>
        <label class="condition-form-checkbox">
          <input type="radio" name="cond-census-scope" id="cond-census-axis-square" value="square">
          <span>Square</span>
        </label>
      </div>
      <div id="cond-census-region-comparator">
        <label class="condition-form-checkbox"><input type="radio" name="cond-census-region-comparator" value="equal_to" checked><span>=</span></label>
        <label class="condition-form-checkbox"><input type="radio" name="cond-census-region-comparator" value="greater_than"><span>></span></label>
        <label class="condition-form-checkbox"><input type="radio" name="cond-census-region-comparator" value="less_than"><span><</span></label>
      </div>

      <section id="cond-census-region-target">
        <div id="cond-census-rank-input">${radioList('cond-census-rank-input')}</div>
        <div id="cond-census-file-input" class="hidden">${radioList('cond-census-file-input')}</div>
        <div id="cond-census-square-inputs" class="hidden">
          <div id="cond-census-square-file">${radioList('cond-census-square-file')}</div>
          <div id="cond-census-square-rank">${radioList('cond-census-square-rank')}</div>
        </div>
      </section>
    </div>

    <div class="condition-form-layout condition-form-identity-layout hidden" id="cond-identity-layout">
      <select id="cond-identity-subject">${identitySubjectOptions}</select>
      <select id="cond-identity-target">${identityTargetOptions}</select>
    </div>

    <div id="cond-formulation-preview"></div>
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
    expect(panel.querySelector('#cond-left-comparison-source-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(true)
    expect(panel.querySelector('#cond-right-comparison-source-stack').classList.contains('condition-form-comparison-source-stack--inline-number')).toBe(true)

    const rightSource = panel.querySelector('#cond-right-comparison-source')
    rightSource.value = 'prior_board_state'
    rightSource.dispatchEvent(new Event('change', { bubbles: true }))

    expect(panel.querySelector('#cond-left-comparison-source-total').classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-right-comparison-source-total').classList.contains('hidden')).toBe(true)
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

  it('allows any regular target for the targets operator regardless of team', () => {
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

    const rightSubject = panel.querySelector('#cond-right-subject')
    expect(form.buildPayload().operator).toBe('attack')
    expect(rightSubject.querySelector('option[value="enemy"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="enemy_moved_piece"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="allied"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="moved_piece"]').disabled).toBe(false)
    expect(rightSubject.querySelector('option[value="captured_piece"]').disabled).toBe(true)
  })

  it('translates targets operator to defend when subject and target are same team', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'moved_piece',
      targetFilter: 'any'
    })

    expect(form.buildPayload().operator).toBe('defend')

    const rightSubject = panel.querySelector('#cond-right-subject')
    rightSubject.value = 'enemy'
    rightSubject.dispatchEvent(new Event('change', { bubbles: true }))
    expect(form.buildPayload().operator).toBe('attack')
  })

  it('limits shield targets to the same team as the selected subject', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'enemy',
      subjectFilter: 'any',
      operator: 'shield',
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

  it('uses rendered grammar config for shield target scoping', () => {
    const rules = document.createElement('script')
    rules.type = 'application/json'
    rules.id = 'node-grammar-rules'
    rules.textContent = JSON.stringify({
      editorSubjects: ['allied', 'enemy', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'],
      regularRelationalSubjects: ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'],
      regularRelationalTargets: ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'],
      relationalOperatorTargetRules: { shield: 'opposing_team' },
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
      operator: 'shield',
      target: 'moved_piece',
      targetFilter: 'any'
    })

    expect(form.buildPayload().target).toBe('enemy')
  })

  it('loads a whole-board census and builds an actor-target payload with filters', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'value',
      comparator: 'greater_than',
      target: 'enemy',
      targetFilter: 'rook',
      targetFilterMode: 'exclude'
    })

    expect(panel.querySelector('#cond-census-scope-whole').checked).toBe(true)
    expect(panel.querySelector('#cond-census-region-target').classList.contains('hidden')).toBe(false)
    const squareInputs = panel.querySelector('#cond-census-square-inputs')
    expect(squareInputs.classList.contains('hidden')).toBe(false)
    expect(squareInputs.classList.contains('condition-form-radio-list--disabled')).toBe(true)
    expect(panel.querySelector('#cond-census-square-rank input').disabled).toBe(true)
    expect(panel.querySelector('#cond-census-target-total').classList.contains('hidden')).toBe(true)
    expect(panel.querySelector('#cond-census-target-filter-row').classList.contains('hidden')).toBe(false)

    const payload = form.buildPayload()
    expect(payload).toMatchObject({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'value',
      comparator: 'greater_than',
      target: 'enemy',
      targetFilter: 'rook',
      targetFilterMode: 'exclude'
    })
    expect(payload).not.toHaveProperty('positionAxis')
    expect(payload).not.toHaveProperty('positionComparator')
    expect(payload).not.toHaveProperty('positionTarget')
  })

  it('loads a whole-board prior_board_state census round-trip', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'moved_piece',
      subjectFilter: 'rook',
      subjectFilterMode: 'include',
      operator: 'mobility',
      comparator: 'greater_than',
      target: 'prior_board_state'
    })

    expect(panel.querySelector('#cond-census-scope-whole').checked).toBe(true)
    const payload = form.buildPayload()
    expect(payload).toEqual({
      version: 2,
      kind: 'census',
      subject: 'moved_piece',
      subjectFilter: 'rook',
      subjectFilterMode: 'include',
      operator: 'mobility',
      comparator: 'greater_than',
      target: 'prior_board_state'
    })
  })

  it('hides and clears the whole-board target non toggle when the target filter is any', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'value',
      comparator: 'greater_than',
      target: 'enemy',
      targetFilter: 'rook',
      targetFilterMode: 'exclude'
    })

    const targetFilterMode = panel.querySelector('#cond-census-target-filter-mode')
    const control = targetFilterMode.closest('.condition-form-checkbox')
    expect(targetFilterMode.checked).toBe(true)
    expect(control.classList.contains('condition-form-checkbox--unavailable')).toBe(false)

    const targetFilter = panel.querySelector('#cond-census-target-filter')
    targetFilter.value = 'any'
    targetFilter.dispatchEvent(new Event('change', { bubbles: true }))

    expect(targetFilterMode.checked).toBe(false)
    expect(control.classList.contains('condition-form-checkbox--unavailable')).toBe(true)
    expect(form.buildPayload()).not.toHaveProperty('targetFilterMode')
  })

  it('disallows captured-piece whole-board census targets for mobility', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'mobility',
      comparator: 'greater_than',
      target: 'captured_piece',
      targetFilter: 'any'
    })

    const targetSelect = panel.querySelector('#cond-census-target')
    expect(form.buildPayload().target).toBe('exact_number')
    expect(targetSelect.querySelector('option[value="captured_piece"]').disabled).toBe(true)
    expect(targetSelect.querySelector('option[value="enemy_captured_piece"]').disabled).toBe(true)
    expect(targetSelect.querySelector('option[value="enemy"]').disabled).toBe(false)
  })

  it('loads a region census and emits spatial keys with an exact_number target', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      positionAxis: 'rank',
      positionComparator: 'equal_to',
      positionTarget: 5,
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 2
    })

    expect(panel.querySelector('#cond-census-axis-rank').checked).toBe(true)
    expect(panel.querySelector('#cond-census-region-target').classList.contains('hidden')).toBe(false)

    expect(form.buildPayload()).toEqual({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      positionAxis: 'rank',
      positionComparator: 'equal_to',
      positionTarget: 5,
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 2
    })
  })

  it('keeps a Simple region census on exact_number and hides the target select', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      positionAxis: 'file',
      positionComparator: 'equal_to',
      positionTarget: 3,
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 0
    })

    expect(panel.querySelector('#cond-census-comparison-toggle').textContent).toBe('+ Advanced options')
    expect(panel.querySelector('#cond-census-target').classList.contains('hidden')).toBe(true)

    const targetSelect = panel.querySelector('#cond-census-target')
    targetSelect.value = 'prior_board_state'
    targetSelect.dispatchEvent(new Event('change', { bubbles: true }))

    expect(form.buildPayload()).toMatchObject({
      kind: 'census',
      positionAxis: 'file',
      positionTarget: 3,
      target: 'exact_number',
      targetTotal: 0
    })
  })

  it('preserves relational state when switching to the census tab and back', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'pawn',
      operator: 'shield',
      target: 'moved_piece',
      targetFilter: 'any'
    })

    panel.querySelector('#cond-mode-census').dispatchEvent(new Event('click'))
    panel.querySelector('#cond-mode-relational').dispatchEvent(new Event('click'))

    const payload = form.buildPayload()
    expect(payload.kind).toBe('relational')
    expect(payload.subject).toBe('allied')
    expect(payload.subjectFilter).toBe('pawn')
    expect(payload.operator).toBe('shield')
    expect(payload.target).toBe('moved_piece')
  })

  it('preserves census state when switching to relational and back', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'enemy',
      subjectFilter: 'any',
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 3
    })

    panel.querySelector('#cond-mode-relational').dispatchEvent(new Event('click'))
    panel.querySelector('#cond-mode-census').dispatchEvent(new Event('click'))

    const payload = form.buildPayload()
    expect(payload.kind).toBe('census')
    expect(payload.subject).toBe('enemy')
    expect(payload.operator).toBe('count')
    expect(payload.targetTotal).toBe(3)
  })

  it('defaults whole-board to Simple (no target select) and reveals it via Advanced', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 2
    })

    const toggle = panel.querySelector('#cond-census-comparison-toggle')
    expect(panel.querySelector('#cond-census-scope-whole').checked).toBe(true)
    expect(panel.querySelector('#cond-census-comparison-body').classList.contains('hidden')).toBe(false)
    expect(toggle.classList.contains('hidden')).toBe(false)
    expect(toggle.textContent).toBe('+ Advanced options')
    expect(panel.querySelector('#cond-census-target').classList.contains('hidden')).toBe(true)
    expect(form.buildPayload()).toMatchObject({ kind: 'census', target: 'exact_number', targetTotal: 2 })

    toggle.dispatchEvent(new Event('click'))

    expect(toggle.textContent).toBe('Simplify')
    expect(panel.querySelector('#cond-census-target').classList.contains('hidden')).toBe(false)
  })

  it('keeps the Advanced toggle available in region scope', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      positionAxis: 'rank',
      positionComparator: 'equal_to',
      positionTarget: 5,
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 0
    })

    const toggle = panel.querySelector('#cond-census-comparison-toggle')
    expect(toggle.classList.contains('hidden')).toBe(false)
    expect(panel.querySelector('#cond-census-target').classList.contains('hidden')).toBe(true)

    toggle.dispatchEvent(new Event('click'))
    expect(panel.querySelector('#cond-census-target').classList.contains('hidden')).toBe(false)
  })

  it('loads a region prior_board_state census straight into Advanced and round-trips spatial keys', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'rook',
      subjectFilterMode: 'include',
      positionAxis: 'rank',
      positionComparator: 'equal_to',
      positionTarget: 5,
      operator: 'count',
      comparator: 'greater_than',
      target: 'prior_board_state'
    })

    expect(panel.querySelector('#cond-census-comparison-toggle').textContent).toBe('Simplify')
    expect(panel.querySelector('#cond-census-target').classList.contains('hidden')).toBe(false)
    expect(form.buildPayload()).toEqual({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'rook',
      subjectFilterMode: 'include',
      positionAxis: 'rank',
      positionComparator: 'equal_to',
      positionTarget: 5,
      operator: 'count',
      comparator: 'greater_than',
      target: 'prior_board_state'
    })
  })

  it('loads an actor-target whole-board census straight into Advanced', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'census',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'value',
      comparator: 'greater_than',
      target: 'enemy',
      targetFilter: 'rook'
    })

    expect(panel.querySelector('#cond-census-comparison-toggle').textContent).toBe('Simplify')
    expect(panel.querySelector('#cond-census-target').classList.contains('hidden')).toBe(false)
    expect(form.buildPayload().target).toBe('enemy')
  })

  it('round-trips a non-default relational comparator through the pill', () => {
    const panel = buildPanel()
    const form = new ConditionForm(panel)
    form.attach()

    form.populate({
      version: 2,
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      subjectComparisonMetric: 'count',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 2,
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    })

    expect(panel.querySelector('#cond-left-comparator input[value="greater_than"]').checked).toBe(true)
    expect(form.buildPayload().subjectComparator).toBe('greater_than')
  })

  it('relabels the relational comparison toggle to "+ comparison (advanced)"', () => {
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

    const toggle = panel.querySelector('#cond-left-comparison-toggle')
    expect(toggle.textContent).toBe('+ comparison (advanced)')

    toggle.dispatchEvent(new Event('click'))
    expect(toggle.textContent).toBe('Hide comparison')
  })

  it('a collapsed relational comparison emits no comparison fields', () => {
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

    const payload = form.buildPayload()
    expect(payload).not.toHaveProperty('subjectComparisonMetric')
    expect(payload).not.toHaveProperty('subjectComparator')
    expect(payload).not.toHaveProperty('subjectComparisonSource')
    expect(payload).not.toHaveProperty('targetComparisonMetric')
    expect(payload).not.toHaveProperty('targetComparator')
    expect(payload).not.toHaveProperty('targetComparisonSource')
  })

  describe('identity mode', () => {
    it('loads an identity node and builds a minimal identity payload', () => {
      const panel = buildPanel()
      const form = new ConditionForm(panel)
      form.attach()

      form.populate({
        version: 2,
        kind: 'identity',
        subject: 'enemy_moved_piece',
        target: 'captured_piece'
      })

      expect(form.state.mode).toBe('identity')
      expect(panel.querySelector('#cond-identity-layout').classList.contains('hidden')).toBe(false)
      expect(form.buildPayload()).toEqual({
        version: 2,
        kind: 'identity',
        subject: 'enemy_moved_piece',
        target: 'captured_piece'
      })
    })

    it('switches to identity mode via the mode picker', () => {
      const panel = buildPanel()
      const form = new ConditionForm(panel)
      form.attach()

      panel.querySelector('#cond-mode-identity').dispatchEvent(new Event('click'))

      expect(form.state.mode).toBe('identity')
      expect(form.buildPayload()).toMatchObject({ kind: 'identity' })
    })

    it('reconstrains the target to the subject pairing when the subject changes', () => {
      const panel = buildPanel()
      const form = new ConditionForm(panel)
      form.attach()

      form.populate({
        version: 2,
        kind: 'identity',
        subject: 'enemy_moved_piece',
        target: 'captured_piece'
      })

      const subject = panel.querySelector('#cond-identity-subject')
      subject.value = 'captured_piece'
      subject.dispatchEvent(new Event('change'))

      expect(form.buildPayload()).toEqual({
        version: 2,
        kind: 'identity',
        subject: 'captured_piece',
        target: 'enemy_moved_piece'
      })
    })
  })
})
