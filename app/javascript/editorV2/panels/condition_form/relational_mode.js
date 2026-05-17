import {
  disableOptions, enableAllOptions, showAllOptions, pillValue, setPillChecked
} from 'editorV2/panels/condition_form/dom_helpers'

const DEFAULT_RELATIONAL_STATE = {
  left: {
    subject: 'allied',
    filter: 'any',
    filterMode: 'include',
    comparisonMetric: '',
    comparator: 'equal_to',
    comparisonSource: 'exact_number',
    comparisonSourceTotal: 1
  },
  operator: 'targets',
  right: {
    subject: 'enemy',
    filter: 'any',
    filterMode: 'include',
    comparisonMetric: '',
    comparator: 'equal_to',
    comparisonSource: 'exact_number',
    comparisonSourceTotal: 1
  },
  ui: {
    leftComparisonOpen: false,
    rightComparisonOpen: false
  }
}

// Relational condition mode. State-only: the orchestrator owns DOM events and
// render scheduling; every method takes the relational state slice.
export default class RelationalMode {
  constructor(grammarRules) {
    this.grammarRules = grammarRules
  }

  defaultState() {
    return structuredClone(DEFAULT_RELATIONAL_STATE)
  }

  fromNodeData(nodeData) {
    return {
      left: this.sideState({
        subject: nodeData.subject,
        filter: nodeData.subjectFilter,
        filterMode: nodeData.subjectFilterMode,
        comparisonMetric: nodeData.subjectComparisonMetric,
        comparator: nodeData.subjectComparator,
        comparisonSource: nodeData.subjectComparisonSource,
        comparisonSourceTotal: nodeData.subjectComparisonSourceTotal
      }),
      operator: this.uiOperatorFromPayload(nodeData.operator),
      right: this.sideState({
        subject: nodeData.target,
        filter: nodeData.targetFilter,
        filterMode: nodeData.targetFilterMode,
        comparisonMetric: nodeData.targetComparisonMetric,
        comparator: nodeData.targetComparator,
        comparisonSource: nodeData.targetComparisonSource,
        comparisonSourceTotal: nodeData.targetComparisonSourceTotal
      }),
      ui: {
        leftComparisonOpen: Boolean(nodeData.subjectComparisonMetric),
        rightComparisonOpen: Boolean(nodeData.targetComparisonMetric)
      }
    }
  }

  uiOperatorFromPayload(operator) {
    if (operator === 'attack' || operator === 'defend') { return 'targets' }
    if (operator === 'cover') { return 'shield' }
    return operator || 'targets'
  }

  sideState({ subject, filter, filterMode, comparisonMetric, comparator, comparisonSource, comparisonSourceTotal }) {
    const source = comparisonSource || 'exact_number'
    return {
      subject: subject || 'allied',
      filter: filter || 'any',
      filterMode: filterMode || 'include',
      comparisonMetric: comparisonMetric || '',
      comparator: comparator || 'equal_to',
      comparisonSource: source,
      comparisonSourceTotal: source === 'exact_number' && typeof comparisonSourceTotal === 'number' ? comparisonSourceTotal : 1
    }
  }

  readFields(rel, fields) {
    rel.left.subject = fields.leftSubject?.value || 'allied'
    rel.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
    rel.left.filter = fields.leftFilter?.value || 'any'
    rel.left.comparisonMetric = fields.leftComparisonMetric?.value || ''
    rel.left.comparator = pillValue(fields.leftComparatorInputs) || 'equal_to'
    rel.left.comparisonSource = fields.leftComparisonSource?.value || 'exact_number'
    rel.left.comparisonSourceTotal = Number(fields.leftComparisonSourceTotal?.value || 1)
    rel.operator = fields.relationalOperatorSelect?.value || 'targets'
    rel.right.subject = fields.rightSubject?.value || 'enemy'
    rel.right.filterMode = fields.rightFilterMode?.checked ? 'exclude' : 'include'
    rel.right.filter = fields.rightFilter?.value || 'any'
    rel.right.comparisonMetric = fields.rightComparisonMetric?.value || ''
    rel.right.comparator = pillValue(fields.rightComparatorInputs) || 'equal_to'
    rel.right.comparisonSource = fields.rightComparisonSource?.value || 'exact_number'
    rel.right.comparisonSourceTotal = Number(fields.rightComparisonSourceTotal?.value || 1)
  }

  buildPayload(rel) {
    const payload = {
      version: 2,
      kind: 'relational',
      subject: rel.left.subject,
      subjectFilter: rel.left.filter,
      operator: this.translateTargetsOperator(rel.left.subject, rel.right.subject, rel.operator),
      target: rel.right.subject,
      targetFilter: rel.right.filter
    }

    if (rel.left.filter !== 'any') {
      payload.subjectFilterMode = rel.left.filterMode
    }

    if (rel.right.filter !== 'any') {
      payload.targetFilterMode = rel.right.filterMode
    }

    if (rel.ui.leftComparisonOpen && rel.left.comparisonMetric) {
      payload.subjectComparisonMetric = rel.left.comparisonMetric
      payload.subjectComparator = rel.left.comparator
      payload.subjectComparisonSource = rel.left.comparisonSource
      if (rel.left.comparisonSource === 'exact_number') {
        payload.subjectComparisonSourceTotal = rel.left.comparisonSourceTotal
      }
    }

    if (rel.ui.rightComparisonOpen && rel.right.comparisonMetric) {
      payload.targetComparisonMetric = rel.right.comparisonMetric
      payload.targetComparator = rel.right.comparator
      payload.targetComparisonSource = rel.right.comparisonSource
      if (rel.right.comparisonSource === 'exact_number') {
        payload.targetComparisonSourceTotal = rel.right.comparisonSourceTotal
      }
    }

    return payload
  }

  toggleComparison(side, rel) {
    if (this.comparisonLocked(rel, side)) { return false }
    const sideState = rel[side]
    const uiKey = side === 'left' ? 'leftComparisonOpen' : 'rightComparisonOpen'

    if (!rel.ui[uiKey] && !sideState.comparisonMetric) {
      sideState.comparisonMetric = 'count'
      sideState.comparator = 'equal_to'
      sideState.comparisonSource = 'exact_number'
      sideState.comparisonSourceTotal ||= 1
    }

    rel.ui[uiKey] = !rel.ui[uiKey]
    return true
  }

  render(rel, fields) {
    const leftComparisonActive = rel.ui.leftComparisonOpen
    const rightComparisonActive = rel.ui.rightComparisonOpen
    const leftFilterModeAvailable = rel.left.filter !== 'any'
    const rightFilterModeAvailable = rel.right.filter !== 'any'

    if (fields.relationalOperatorSelect) fields.relationalOperatorSelect.value = rel.operator
    if (fields.leftSubject) fields.leftSubject.value = rel.left.subject
    if (fields.leftFilterMode) fields.leftFilterMode.checked = leftFilterModeAvailable && rel.left.filterMode === 'exclude'
    if (fields.leftFilter) fields.leftFilter.value = rel.left.filter
    if (fields.leftComparisonMetric) fields.leftComparisonMetric.value = rel.left.comparisonMetric || 'count'
    setPillChecked(fields.leftComparatorInputs, rel.left.comparator)
    if (fields.leftComparisonSource) fields.leftComparisonSource.value = rel.left.comparisonSource
    if (fields.leftComparisonSourceTotal) fields.leftComparisonSourceTotal.value = rel.left.comparisonSourceTotal

    if (fields.rightSubject) fields.rightSubject.value = rel.right.subject
    if (fields.rightFilterMode) fields.rightFilterMode.checked = rightFilterModeAvailable && rel.right.filterMode === 'exclude'
    if (fields.rightFilter) fields.rightFilter.value = rel.right.filter
    if (fields.rightComparisonMetric) fields.rightComparisonMetric.value = rel.right.comparisonMetric || 'count'
    setPillChecked(fields.rightComparatorInputs, rel.right.comparator)
    if (fields.rightComparisonSource) fields.rightComparisonSource.value = rel.right.comparisonSource
    if (fields.rightComparisonSourceTotal) fields.rightComparisonSourceTotal.value = rel.right.comparisonSourceTotal

    fields.leftComparisonBody.classList.toggle('hidden', !rel.ui.leftComparisonOpen)
    fields.rightComparisonBody.classList.toggle('hidden', !rel.ui.rightComparisonOpen)
    fields.leftComparisonSourceTotal?.classList.toggle('hidden', rel.left.comparisonSource !== 'exact_number')
    fields.rightComparisonSourceTotal?.classList.toggle('hidden', rel.right.comparisonSource !== 'exact_number')
    fields.leftComparisonSourceStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', rel.left.comparisonSource === 'exact_number')
    fields.rightComparisonSourceStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', rel.right.comparisonSource === 'exact_number')

    fields.leftFilterRow.classList.toggle('hidden', false)
    fields.rightFilterRow.classList.toggle('hidden', false)
    fields.leftFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !leftFilterModeAvailable)
    fields.rightFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !rightFilterModeAvailable)
    fields.rightComparisonToggle.closest('.condition-form-comparison').classList.toggle('hidden', false)

    const leftLocked = this.comparisonLocked(rel, 'left')
    const rightLocked = this.comparisonLocked(rel, 'right')
    fields.leftComparisonToggle.disabled = leftLocked
    fields.rightComparisonToggle.disabled = rightLocked
    fields.leftComparisonToggle.textContent = leftLocked ? this.comparisonUnavailableText(rel, 'left') : (rel.ui.leftComparisonOpen ? 'Hide comparison' : '+ comparison (advanced)')
    fields.rightComparisonToggle.textContent = rightLocked ? this.comparisonUnavailableText(rel, 'right') : (rel.ui.rightComparisonOpen ? 'Hide comparison' : '+ comparison (advanced)')

    this.setComparisonInputsDisabled('left', fields, !leftComparisonActive)
    this.setComparisonInputsDisabled('right', fields, !rightComparisonActive)

    showAllOptions(fields.leftSubject)
    showAllOptions(fields.rightSubject)
    this.disableSubjectOptions(rel, fields)
    this.disableComparisonSourceOptions(rel, fields)
    this.disableComparisonMetricOptions(rel, fields)

    fields.relationalTargetNote?.classList.toggle('hidden', rel.operator !== 'shield')
    fields.rightAggregateNote?.classList.toggle('hidden', !this.leftUsesAggregateValue(rel))
    fields.leftAggregateNote?.classList.toggle('hidden', !this.rightUsesAggregateValue(rel))
  }

  applyCompatibilityRules(rel) {
    if (rel.right.subject === 'captured_piece') {
      rel.right.subject = 'enemy'
    }
    const allowedLeft = this.regularSubjects()
    if (!allowedLeft.includes(rel.left.subject)) {
      rel.left.subject = 'allied'
    }

    const allowedRight = this.regularTargets(rel)
    if (!allowedRight.includes(rel.right.subject)) {
      rel.right.subject = allowedRight[0]
    }

    if (this.leftUsesPriorBoardState(rel)) {
      this.clearComparator(rel, 'right')
      rel.ui.rightComparisonOpen = false
    }

    if (this.rightUsesPriorBoardState(rel)) {
      this.clearComparator(rel, 'left')
      rel.ui.leftComparisonOpen = false
    }

    if (this.leftUsesAggregateValue(rel) && rel.right.comparisonMetric === 'aggregate_value') {
      rel.right.comparisonMetric = 'count'
    }

    this.applyComparisonSourceCompatibility(rel, 'left')
    this.applyComparisonSourceCompatibility(rel, 'right')
    this.applyFilterModeCompatibilityRules(rel)
  }

  applyComparisonSourceCompatibility(rel, side) {
    const sideState = rel[side]
    const allowedSources = this.allowedComparisonSourcesForMetric(sideState.comparisonMetric)
    if (!allowedSources.includes(sideState.comparisonSource)) {
      sideState.comparisonSource = 'exact_number'
      sideState.comparisonSourceTotal ||= 1
    }
  }

  applyFilterModeCompatibilityRules(rel) {
    if (rel.left.filter === 'any') { rel.left.filterMode = 'include' }
    if (rel.right.filter === 'any') { rel.right.filterMode = 'include' }
  }

  clearComparator(rel, side) {
    const sideState = rel[side]
    sideState.comparisonMetric = ''
    sideState.comparator = 'equal_to'
    sideState.comparisonSource = 'exact_number'
    sideState.comparisonSourceTotal = 1
  }

  leftUsesPriorBoardState(rel) {
    return rel.ui.leftComparisonOpen && rel.left.comparisonSource === 'prior_board_state'
  }

  rightUsesPriorBoardState(rel) {
    return rel.ui.rightComparisonOpen && rel.right.comparisonSource === 'prior_board_state'
  }

  leftUsesAggregateValue(rel) {
    return rel.ui.leftComparisonOpen && rel.left.comparisonMetric === 'aggregate_value'
  }

  rightUsesAggregateValue(rel) {
    return rel.ui.rightComparisonOpen && rel.right.comparisonMetric === 'aggregate_value'
  }

  comparisonLocked(rel, side) {
    return side === 'left' ? this.rightUsesPriorBoardState(rel) : this.leftUsesPriorBoardState(rel)
  }

  comparisonUnavailableText(rel, side) {
    if (side === 'left' && this.rightUsesPriorBoardState(rel)) {
      return '+ comparison unavailable while target uses prior'
    }
    if (side === 'right' && this.leftUsesPriorBoardState(rel)) {
      return '+ comparison unavailable while subject uses prior'
    }
    return '+ comparison unavailable'
  }

  regularSubjects() {
    return this.grammarRules.regularRelationalSubjects
  }

  regularTargets(rel) {
    const operator = rel.operator
    if (operator === 'targets') { return this.grammarRules.regularRelationalTargets }
    const targetRule = this.grammarRules.relationalOperatorTargetRules[operator] || 'any_regular'
    if (targetRule === 'opposing_team') {
      return this.opposingTeamTargetsFor(rel.left.subject)
    } else if (targetRule === 'same_team') {
      return this.sameTeamTargetsFor(rel.left.subject)
    } else {
      return this.grammarRules.regularRelationalTargets
    }
  }

  sameTeamTargetsFor(subject) {
    const team = this.teamGroupForSubject(subject)
    return team ? this.grammarRules.teamSubjectGroups[team] : []
  }

  opposingTeamTargetsFor(subject) {
    const team = this.teamGroupForSubject(subject)
    const opposingTeam = this.grammarRules.opposingTeamGroups[team]
    return opposingTeam ? this.grammarRules.teamSubjectGroups[opposingTeam] : []
  }

  teamGroupForSubject(subject) {
    return Object.keys(this.grammarRules.teamSubjectGroups).find(team => {
      return this.grammarRules.teamSubjectGroups[team].includes(subject)
    })
  }

  translateTargetsOperator(leftSubject, rightSubject, operator) {
    if (operator !== 'targets') { return operator }
    const leftTeam = this.teamGroupForSubject(leftSubject)
    const rightTeam = this.teamGroupForSubject(rightSubject)
    return leftTeam === rightTeam ? 'defend' : 'attack'
  }

  allowedComparisonSourcesForMetric(metric) {
    if (metric === 'individual_value' || metric === 'aggregate_value') {
      return ['exact_number', 'prior_board_state', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece']
    }
    return ['exact_number', 'prior_board_state']
  }

  setComparisonInputsDisabled(side, fields, disabled) {
    const metricKey = side === 'left' ? 'leftComparisonMetric' : 'rightComparisonMetric'
    const comparatorKey = side === 'left' ? 'leftComparator' : 'rightComparator'
    const comparatorInputsKey = side === 'left' ? 'leftComparatorInputs' : 'rightComparatorInputs'
    const sourceKey = side === 'left' ? 'leftComparisonSource' : 'rightComparisonSource'
    const sourceTotalKey = side === 'left' ? 'leftComparisonSourceTotal' : 'rightComparisonSourceTotal'

    fields[metricKey].disabled = disabled
    fields[sourceKey].disabled = disabled
    fields[sourceTotalKey].disabled = disabled
    fields[comparatorInputsKey]?.forEach(input => { input.disabled = disabled })
    fields[comparatorKey]?.classList.toggle('condition-form-radio-row--disabled', disabled)
  }

  disableComparisonSourceOptions(rel, fields) {
    this.disableComparisonSourceOptionsForSide(rel, 'left', fields.leftComparisonSource)
    this.disableComparisonSourceOptionsForSide(rel, 'right', fields.rightComparisonSource)
  }

  disableComparisonSourceOptionsForSide(rel, side, select) {
    const allowedSources = this.allowedComparisonSourcesForMetric(rel[side].comparisonMetric || 'count')
    const allSources = Array.from(select.options).map(option => option.value)
    disableOptions(select, allSources.filter(value => !allowedSources.includes(value)))
  }

  disableComparisonMetricOptions(rel, fields) {
    this.disableComparisonMetricOptionsForSide(rel, 'left', fields.leftComparisonMetric)
    this.disableComparisonMetricOptionsForSide(rel, 'right', fields.rightComparisonMetric)
  }

  disableComparisonMetricOptionsForSide(rel, side, select) {
    const otherUsesAggregate = side === 'left' ? this.rightUsesAggregateValue(rel) : this.leftUsesAggregateValue(rel)
    disableOptions(select, otherUsesAggregate ? ['aggregate_value'] : [])
  }

  disableSubjectOptions(rel, fields) {
    enableAllOptions(fields.leftSubject)
    enableAllOptions(fields.rightSubject)

    disableOptions(fields.leftSubject, this.editorSubjects().filter(v => !this.regularSubjects().includes(v)))
    disableOptions(fields.rightSubject, this.editorSubjects().filter(v => !this.regularTargets(rel).includes(v)))
  }

  editorSubjects() {
    return this.grammarRules.editorSubjects
  }
}
