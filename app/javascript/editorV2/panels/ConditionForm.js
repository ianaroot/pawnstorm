import { formatConditionPreview } from 'editorV2/utils/conditionPreviewFormatter'

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
    rightComparisonOpen: false,
  }
}

const DEFAULT_MEASURE_STATE = {
  left: {
    subject: 'allied',
    filter: 'any',
    filterMode: 'include',
  },
  operator: 'count',
  unary: {
    comparator: 'greater_than',
    target: 'exact_number',
    targetFilter: 'any',
    targetFilterMode: 'include',
    targetTotal: 0
  }
}

const DEFAULT_GRAMMAR_RULES = Object.freeze({
  editorSubjects: ['allied', 'enemy', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'],
  regularRelationalSubjects: ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'],
  regularRelationalTargets: ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'],
  relationalOperatorTargetRules: {
    attack: 'opposing_team',
    defend: 'same_team',
    cover: 'same_team',
    shield: 'same_team',
    adjacent: 'any_regular'
  },
  samePieceTargets: {
    enemy_moved_piece: ['captured_piece'],
    captured_piece: ['enemy_moved_piece']
  },
  teamSubjectGroups: {
    allied: ['allied', 'moved_piece'],
    enemy: ['enemy', 'enemy_moved_piece']
  },
  opposingTeamGroups: {
    allied: 'enemy',
    enemy: 'allied'
  }
})

class ConditionForm {
  constructor(editorPanel) {
    this.editorPanel = editorPanel
    this.grammarRules = this.readGrammarRules()
    this.state = this.defaultState()
    this.boundHandleFieldChange = this.handleFieldChange.bind(this)
    this.boundHandleLeftComparisonToggle = this.toggleLeftComparison.bind(this)
    this.boundHandleRightComparisonToggle = this.toggleRightComparison.bind(this)
    this.boundHandleModeRelational = () => this.handleModeChange('relational')
    this.boundHandleModeMeasure = () => this.handleModeChange('measure')
  }

  defaultState() {
    return {
      mode: 'relational',
      relational: structuredClone(DEFAULT_RELATIONAL_STATE),
      measure: structuredClone(DEFAULT_MEASURE_STATE)
    }
  }

  readGrammarRules() {
    const element = document.getElementById('node-grammar-rules')
    if (!element?.textContent) { return DEFAULT_GRAMMAR_RULES }
    try {
      return JSON.parse(element.textContent)
    } catch {
      return DEFAULT_GRAMMAR_RULES
    }
  }

  attach() {
    const fields = this.fields()
    fields.all.forEach(field => field?.addEventListener('change', this.boundHandleFieldChange))
    fields.numberInputs.forEach(field => field?.addEventListener('input', this.boundHandleFieldChange))
    fields.leftComparisonToggle?.addEventListener('click', this.boundHandleLeftComparisonToggle)
    fields.rightComparisonToggle?.addEventListener('click', this.boundHandleRightComparisonToggle)
    fields.modeRelationalBtn?.addEventListener('click', this.boundHandleModeRelational)
    fields.modeMeasureBtn?.addEventListener('click', this.boundHandleModeMeasure)
  }

  detach() {
    const fields = this.fields()
    fields.all.forEach(field => field?.removeEventListener('change', this.boundHandleFieldChange))
    fields.numberInputs.forEach(field => field?.removeEventListener('input', this.boundHandleFieldChange))
    fields.leftComparisonToggle?.removeEventListener('click', this.boundHandleLeftComparisonToggle)
    fields.rightComparisonToggle?.removeEventListener('click', this.boundHandleRightComparisonToggle)
    fields.modeRelationalBtn?.removeEventListener('click', this.boundHandleModeRelational)
    fields.modeMeasureBtn?.removeEventListener('click', this.boundHandleModeMeasure)
  }

  fields() {
    const leftSubject = this.editorPanel.querySelector('#cond-left-subject')
    const leftFilterMode = this.editorPanel.querySelector('#cond-left-filter-mode')
    const leftFilter = this.editorPanel.querySelector('#cond-left-filter')
    const leftComparisonMetric = this.editorPanel.querySelector('#cond-left-comparison-metric')
    const leftComparator = this.editorPanel.querySelector('#cond-left-comparator')
    const leftComparisonSource = this.editorPanel.querySelector('#cond-left-comparison-source')
    const leftComparisonSourceTotal = this.editorPanel.querySelector('#cond-left-comparison-source-total')
    const relationalOperatorSelect = this.editorPanel.querySelector('#cond-relational-operator')
    const measureOperatorSelect = this.editorPanel.querySelector('#cond-measure-operator')
    const rightSubject = this.editorPanel.querySelector('#cond-right-subject')
    const rightFilterMode = this.editorPanel.querySelector('#cond-right-filter-mode')
    const rightFilter = this.editorPanel.querySelector('#cond-right-filter')
    const rightComparisonMetric = this.editorPanel.querySelector('#cond-right-comparison-metric')
    const rightComparator = this.editorPanel.querySelector('#cond-right-comparator')
    const rightComparisonSource = this.editorPanel.querySelector('#cond-right-comparison-source')
    const rightComparisonSourceTotal = this.editorPanel.querySelector('#cond-right-comparison-source-total')
    const unaryComparator = this.editorPanel.querySelector('#cond-unary-comparator')
    const unaryTarget = this.editorPanel.querySelector('#cond-unary-target')
    const unaryTargetTotal = this.editorPanel.querySelector('#cond-unary-target-total')
    const unaryTargetFilterMode = this.editorPanel.querySelector('#cond-unary-target-filter-mode')
    const unaryTargetFilter = this.editorPanel.querySelector('#cond-unary-target-filter')

    return {
      leftSubject,
      leftFilterMode,
      leftFilter,
      leftComparisonMetric,
      leftComparator,
      leftComparisonSource,
      leftComparisonSourceTotal,
      relationalOperatorSelect,
      measureOperatorSelect,
      operatorSelect: this.state.mode === 'relational' ? relationalOperatorSelect : measureOperatorSelect,
      rightSubject,
      rightFilterMode,
      rightFilter,
      rightComparisonMetric,
      rightComparator,
      rightComparisonSource,
      rightComparisonSourceTotal,
      unaryComparator,
      unaryTarget,
      unaryTargetTotal,
      unaryTargetFilterMode,
      unaryTargetFilter,
      leftComparisonToggle: this.editorPanel.querySelector('#cond-left-comparison-toggle'),
      leftComparisonBody: this.editorPanel.querySelector('#cond-left-comparison-body'),
      leftComparisonSourceStack: this.editorPanel.querySelector('#cond-left-comparison-source-stack'),
      leftFilterModeControl: leftFilterMode?.closest('.condition-form-checkbox'),
      rightComparisonToggle: this.editorPanel.querySelector('#cond-right-comparison-toggle'),
      rightComparisonBody: this.editorPanel.querySelector('#cond-right-comparison-body'),
      rightComparisonSourceStack: this.editorPanel.querySelector('#cond-right-comparison-source-stack'),
      rightFilterModeControl: rightFilterMode?.closest('.condition-form-checkbox'),
      rightCardLabel: this.editorPanel.querySelector('#cond-right-card-label'),
      rightRelationalFields: this.editorPanel.querySelector('#cond-right-relational-fields'),
      unaryComparisonSection: this.editorPanel.querySelector('#cond-unary-comparison-section'),
      unaryTargetStack: this.editorPanel.querySelector('#cond-unary-target-stack'),
      unaryTargetFilterRow: this.editorPanel.querySelector('#cond-unary-target-filter-row'),
      unaryTargetFilterModeControl: unaryTargetFilterMode?.closest('.condition-form-checkbox'),
      leftComparisonSection: this.editorPanel.querySelector('#cond-left-comparison-section'),
      leftFilterRow: this.editorPanel.querySelector('#cond-left-filter-row'),
      rightFilterRow: this.editorPanel.querySelector('#cond-right-filter-row'),
      unaryTargetSection: this.editorPanel.querySelector('#cond-unary-target-section'),
      formulationPreview: this.editorPanel.querySelector('#cond-formulation-preview'),
      modeRelationalBtn: this.editorPanel.querySelector('#cond-mode-relational'),
      modeMeasureBtn: this.editorPanel.querySelector('#cond-mode-measure'),
      measureSubjectNote: this.editorPanel.querySelector('#cond-measure-subject-note'),
      relationalTargetNote: this.editorPanel.querySelector('#cond-relational-target-note'),
      all: [
        leftSubject, leftFilterMode, leftFilter, leftComparisonMetric, leftComparator, leftComparisonSource,
        relationalOperatorSelect, measureOperatorSelect,
        rightSubject, rightFilterMode, rightFilter, rightComparisonMetric, rightComparator, rightComparisonSource,
        unaryComparator, unaryTarget, unaryTargetFilterMode, unaryTargetFilter
      ],
      numberInputs: [
        leftComparisonSourceTotal,
        rightComparisonSourceTotal,
        unaryTargetTotal
      ]
    }
  }

  populate(nodeData = {}) {
    if (this.isValidV2Node(nodeData)) {
      this.state = this.stateFromNodeData(nodeData)
    } else {
      this.state = this.defaultState()
    }
    if (this.state.mode === 'measure') {
      this.applyUnaryCompatibilityRules()
    } else {
      this.applyRelationalCompatibilityRules()
    }
    this.render()
  }

  isValidV2Node(nodeData = {}) {
    return nodeData.version === 2 && (nodeData.kind === 'relational' || nodeData.kind === 'unary')
  }

  stateFromNodeData(nodeData) {
    if (nodeData.kind === 'unary') {
      return {
        mode: 'measure',
        relational: structuredClone(DEFAULT_RELATIONAL_STATE),
        measure: {
          left: {
            subject: nodeData.subject || 'allied',
            filter: nodeData.subjectFilter || 'any',
            filterMode: nodeData.subjectFilterMode || 'include',
          },
          operator: nodeData.operator || 'count',
          unary: this.unaryStateFromNodeData(nodeData)
        }
      }
    } else {
      return {
        mode: 'relational',
        relational: {
          left: this.relationalSideState({
            subject: nodeData.subject,
            filter: nodeData.subjectFilter,
            filterMode: nodeData.subjectFilterMode,
            comparisonMetric: nodeData.subjectComparisonMetric,
            comparator: nodeData.subjectComparator,
            comparisonSource: nodeData.subjectComparisonSource,
            comparisonSourceTotal: nodeData.subjectComparisonSourceTotal
          }),
          operator: this.uiOperatorFromPayload(nodeData.operator),
          right: this.relationalSideState({
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
            rightComparisonOpen: Boolean(nodeData.targetComparisonMetric),
          }
        },
        measure: structuredClone(DEFAULT_MEASURE_STATE)
      }
    }
  }

  uiOperatorFromPayload(operator) {
    if (operator === 'attack' || operator === 'defend') { return 'targets' }
    if (operator === 'cover') { return 'shield' }
    return operator || 'targets'
  }

  relationalSideState({ subject, filter, filterMode, comparisonMetric, comparator, comparisonSource, comparisonSourceTotal }) {
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

  unaryStateFromNodeData(nodeData) {
    return {
      comparator: nodeData.comparator || 'greater_than',
      target: nodeData.target || 'exact_number',
      targetFilter: nodeData.targetFilter || 'any',
      targetFilterMode: nodeData.targetFilterMode || 'include',
      targetTotal: typeof nodeData.targetTotal === 'number' ? nodeData.targetTotal : 0
    }
  }

  render() {
    const fields = this.fields()
    const isRelational = this.state.mode === 'relational'

    fields.modeRelationalBtn?.classList.toggle('active', isRelational)
    fields.modeMeasureBtn?.classList.toggle('active', !isRelational)
    fields.relationalOperatorSelect?.classList.toggle('hidden', !isRelational)
    fields.measureOperatorSelect?.classList.toggle('hidden', isRelational)
    fields.rightRelationalFields.classList.toggle('hidden', !isRelational)
    fields.unaryComparisonSection.classList.toggle('hidden', isRelational)
    fields.unaryTargetSection?.classList.toggle('hidden', isRelational)
    fields.leftComparisonSection.classList.toggle('hidden', !isRelational || this.usesSamePiece())
    fields.unaryTargetStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', this.state.measure.unary.target === 'exact_number')

    if (isRelational) {
      this.renderRelational(fields)
    } else {
      this.renderMeasure(fields)
    }

    if (fields.formulationPreview) {
      fields.formulationPreview.textContent = formatConditionPreview(this.buildPayload()).text
    }

    if (this.onStateChange) { this.onStateChange(this.buildPayload()) }
  }

  renderRelational(fields) {
    const rel = this.state.relational
    const samePieceMode = this.usesSamePiece()
    const leftComparisonActive = !samePieceMode && rel.ui.leftComparisonOpen
    const rightComparisonActive = !samePieceMode && rel.ui.rightComparisonOpen
    const leftFilterModeAvailable = rel.left.filter !== 'any'
    const rightFilterModeAvailable = rel.right.filter !== 'any'

    if (fields.relationalOperatorSelect) fields.relationalOperatorSelect.value = rel.operator
    if (fields.leftSubject) fields.leftSubject.value = rel.left.subject
    if (fields.leftFilterMode) fields.leftFilterMode.checked = leftFilterModeAvailable && rel.left.filterMode === 'exclude'
    if (fields.leftFilter) fields.leftFilter.value = rel.left.filter
    if (fields.leftComparisonMetric) fields.leftComparisonMetric.value = rel.left.comparisonMetric || 'count'
    if (fields.leftComparator) fields.leftComparator.value = rel.left.comparator
    if (fields.leftComparisonSource) fields.leftComparisonSource.value = rel.left.comparisonSource
    if (fields.leftComparisonSourceTotal) fields.leftComparisonSourceTotal.value = rel.left.comparisonSourceTotal

    if (fields.rightSubject) fields.rightSubject.value = rel.right.subject
    if (fields.rightFilterMode) fields.rightFilterMode.checked = rightFilterModeAvailable && rel.right.filterMode === 'exclude'
    if (fields.rightFilter) fields.rightFilter.value = rel.right.filter
    if (fields.rightComparisonMetric) fields.rightComparisonMetric.value = rel.right.comparisonMetric || 'count'
    if (fields.rightComparator) fields.rightComparator.value = rel.right.comparator
    if (fields.rightComparisonSource) fields.rightComparisonSource.value = rel.right.comparisonSource
    if (fields.rightComparisonSourceTotal) fields.rightComparisonSourceTotal.value = rel.right.comparisonSourceTotal

    fields.leftComparisonBody.classList.toggle('hidden', !rel.ui.leftComparisonOpen)
    fields.rightComparisonBody.classList.toggle('hidden', !rel.ui.rightComparisonOpen)
    fields.leftComparisonSourceTotal?.classList.toggle('hidden', rel.left.comparisonSource !== 'exact_number')
    fields.rightComparisonSourceTotal?.classList.toggle('hidden', rel.right.comparisonSource !== 'exact_number')
    fields.leftComparisonSourceStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', rel.left.comparisonSource === 'exact_number')
    fields.rightComparisonSourceStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', rel.right.comparisonSource === 'exact_number')

    fields.leftFilterRow.classList.toggle('hidden', samePieceMode)
    fields.rightFilterRow.classList.toggle('hidden', samePieceMode)
    fields.leftFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !leftFilterModeAvailable)
    fields.rightFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !rightFilterModeAvailable)
    fields.rightComparisonToggle.closest('.condition-form-comparison').classList.toggle('hidden', samePieceMode)

    const leftLocked = this.comparisonLocked('left')
    const rightLocked = this.comparisonLocked('right')
    fields.leftComparisonToggle.disabled = leftLocked
    fields.rightComparisonToggle.disabled = rightLocked
    fields.leftComparisonToggle.textContent = leftLocked ? this.comparisonUnavailableText('left') : (rel.ui.leftComparisonOpen ? 'Hide comparison' : '+ comparison')
    fields.rightComparisonToggle.textContent = rightLocked ? this.comparisonUnavailableText('right') : (rel.ui.rightComparisonOpen ? 'Hide comparison' : '+ comparison')

    this.setComparisonInputsDisabled('left', fields, !leftComparisonActive)
    this.setComparisonInputsDisabled('right', fields, !rightComparisonActive)

    this.showAllOptions(fields.leftSubject)
    this.showAllOptions(fields.rightSubject)
    this.disableRelationalSubjectOptions(fields, samePieceMode)
    this.disableRelationalComparisonSourceOptions(fields)

    fields.relationalTargetNote?.classList.toggle('hidden', rel.operator !== 'shield')
    fields.measureSubjectNote?.classList.toggle('hidden', true)
  }

  renderMeasure(fields) {
    const meas = this.state.measure
    const unaryTargetFilterAvailable = this.unaryTargetUsesActor()
    const unaryTargetFilterModeAvailable = unaryTargetFilterAvailable && meas.unary.targetFilter !== 'any'

    if (fields.measureOperatorSelect) fields.measureOperatorSelect.value = meas.operator
    if (fields.leftSubject) fields.leftSubject.value = meas.left.subject
    if (fields.leftFilterMode) fields.leftFilterMode.checked = meas.left.filter !== 'any' && meas.left.filterMode === 'exclude'
    if (fields.leftFilter) fields.leftFilter.value = meas.left.filter
    if (fields.unaryComparator) fields.unaryComparator.value = meas.unary.comparator
    if (fields.unaryTarget) fields.unaryTarget.value = meas.unary.target
    if (fields.unaryTargetTotal) fields.unaryTargetTotal.value = meas.unary.targetTotal
    if (fields.unaryTargetFilter) fields.unaryTargetFilter.value = meas.unary.targetFilter
    if (fields.unaryTargetFilterMode) fields.unaryTargetFilterMode.checked = unaryTargetFilterModeAvailable && meas.unary.targetFilterMode === 'exclude'

    fields.unaryTargetTotal?.classList.toggle('hidden', meas.unary.target !== 'exact_number')
    fields.unaryTargetFilterRow?.classList.toggle('hidden', !unaryTargetFilterAvailable)
    fields.leftFilterRow.classList.toggle('hidden', false)
    fields.leftFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', meas.left.filter === 'any')
    fields.unaryTargetFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !unaryTargetFilterModeAvailable)

    this.setUnaryComparisonInputsDisabled(fields, false)

    this.showAllOptions(fields.leftSubject)
    this.showAllOptions(fields.unaryTarget)
    this.disableMeasureSubjectOptions(fields)
    this.disableUnaryTargetOptions(fields)

    fields.measureSubjectNote?.classList.toggle('hidden', meas.operator !== 'mobility')
    fields.relationalTargetNote?.classList.toggle('hidden', true)
  }

  toggleLeftComparison() {
    if (this.state.mode !== 'relational') { return }
    if (this.comparisonLocked('left')) { return }
    const rel = this.state.relational

    if (!rel.ui.leftComparisonOpen && !rel.left.comparisonMetric) {
      rel.left.comparisonMetric = 'count'
      rel.left.comparator = 'equal_to'
      rel.left.comparisonSource = 'exact_number'
      rel.left.comparisonSourceTotal ||= 1
    }

    rel.ui.leftComparisonOpen = !rel.ui.leftComparisonOpen
    this.render()
  }

  toggleRightComparison() {
    if (this.state.mode !== 'relational') { return }
    if (this.comparisonLocked('right')) { return }
    const rel = this.state.relational

    if (!rel.ui.rightComparisonOpen && !rel.right.comparisonMetric) {
      rel.right.comparisonMetric = 'count'
      rel.right.comparator = 'equal_to'
      rel.right.comparisonSource = 'exact_number'
      rel.right.comparisonSourceTotal ||= 1
    }

    rel.ui.rightComparisonOpen = !rel.ui.rightComparisonOpen
    this.render()
  }

  handleModeChange(mode) {
    if (this.state.mode === mode) { return }
    this.state.mode = mode
    this.render()
  }

  handleFieldChange(event) {
    const fields = this.fields()
    const changedId = event?.target?.id

    if (this.state.mode === 'relational') {
      this.state.relational.left.subject = fields.leftSubject?.value || 'allied'
      this.state.relational.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
      this.state.relational.left.filter = fields.leftFilter?.value || 'any'
      this.state.relational.left.comparisonMetric = fields.leftComparisonMetric?.value || ''
      this.state.relational.left.comparator = fields.leftComparator?.value || 'equal_to'
      this.state.relational.left.comparisonSource = fields.leftComparisonSource?.value || 'exact_number'
      this.state.relational.left.comparisonSourceTotal = Number(fields.leftComparisonSourceTotal?.value || 1)
      this.state.relational.operator = fields.relationalOperatorSelect?.value || 'targets'
      this.state.relational.right.subject = fields.rightSubject?.value || 'enemy'
      this.state.relational.right.filterMode = fields.rightFilterMode?.checked ? 'exclude' : 'include'
      this.state.relational.right.filter = fields.rightFilter?.value || 'any'
      this.state.relational.right.comparisonMetric = fields.rightComparisonMetric?.value || ''
      this.state.relational.right.comparator = fields.rightComparator?.value || 'equal_to'
      this.state.relational.right.comparisonSource = fields.rightComparisonSource?.value || 'exact_number'
      this.state.relational.right.comparisonSourceTotal = Number(fields.rightComparisonSourceTotal?.value || 1)
      this.applyRelationalCompatibilityRules()
    } else {
      this.state.measure.left.subject = fields.leftSubject?.value || 'allied'
      this.state.measure.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
      this.state.measure.left.filter = fields.leftFilter?.value || 'any'
      this.state.measure.operator = fields.measureOperatorSelect?.value || 'count'
      this.state.measure.unary.comparator = fields.unaryComparator?.value || 'greater_than'
      this.state.measure.unary.target = fields.unaryTarget?.value || 'exact_number'
      this.state.measure.unary.targetFilterMode = fields.unaryTargetFilterMode?.checked ? 'exclude' : 'include'
      this.state.measure.unary.targetFilter = fields.unaryTargetFilter?.value || 'any'
      this.state.measure.unary.targetTotal = Number(fields.unaryTargetTotal?.value || 0)
      this.applyUnaryCompatibilityRules(changedId)
    }

    this.render()
  }

  buildPayload() {
    if (this.state.mode === 'measure') {
      const meas = this.state.measure
      const payload = {
        version: 2,
        kind: 'unary',
        subject: meas.left.subject,
        subjectFilter: meas.left.filter,
        operator: meas.operator,
        comparator: meas.unary.comparator,
        target: meas.unary.target,
        ...(meas.left.filter !== 'any' ? { subjectFilterMode: meas.left.filterMode } : {})
      }

      if (meas.unary.target === 'exact_number') {
        payload.targetTotal = meas.unary.targetTotal
      } else if (this.unaryTargetUsesActor()) {
        payload.targetFilter = meas.unary.targetFilter
        if (meas.unary.targetFilter !== 'any') {
          payload.targetFilterMode = meas.unary.targetFilterMode
        }
      }

      return payload
    } else {
      const rel = this.state.relational
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
  }

  translateTargetsOperator(leftSubject, rightSubject, operator) {
    if (operator !== 'targets') { return operator }
    const leftTeam = this.teamGroupForSubject(leftSubject)
    const rightTeam = this.teamGroupForSubject(rightSubject)
    return leftTeam === rightTeam ? 'defend' : 'attack'
  }


  // -------------------------------- GRAMMAR RULES ----------------------------------

  usesSamePiece() {
    return this.state.mode === 'relational' && this.state.relational.operator === 'same_piece'
  }

  clearRelationalComparator(side) {
    const sideState = this.state.relational[side]
    sideState.comparisonMetric = ''
    sideState.comparator = 'equal_to'
    sideState.comparisonSource = 'exact_number'
    sideState.comparisonSourceTotal = 1
  }

  applyRelationalCompatibilityRules() {
    const rel = this.state.relational

    if (this.usesSamePiece()) {
      const allowedLeft = Object.keys(this.grammarRules.samePieceTargets)
      if (!allowedLeft.includes(rel.left.subject)) {
        rel.left.subject = allowedLeft[0]
      }
      rel.right.subject = this.samePieceTargetsFor(rel.left.subject)[0]
      rel.left.filter = 'any'
      rel.left.filterMode = 'include'
      rel.right.filter = 'any'
      rel.right.filterMode = 'include'
      this.clearRelationalComparator('left')
      this.clearRelationalComparator('right')
      rel.ui.leftComparisonOpen = false
      rel.ui.rightComparisonOpen = false
      return
    }

    if (rel.right.subject === 'captured_piece') {
      rel.right.subject = 'enemy'
    }
    const allowedLeft = this.regularRelationalSubjects()
    if (!allowedLeft.includes(rel.left.subject)) {
      rel.left.subject = 'allied'
    }

    const allowedRight = this.regularRelationalTargets()
    if (!allowedRight.includes(rel.right.subject)) {
      rel.right.subject = allowedRight[0]
    }

    if (this.leftUsesPriorBoardState()) {
      this.clearRelationalComparator('right')
      rel.ui.rightComparisonOpen = false
    }

    if (this.rightUsesPriorBoardState()) {
      this.clearRelationalComparator('left')
      rel.ui.leftComparisonOpen = false
    }

    this.applyRelationalComparisonSourceCompatibility('left')
    this.applyRelationalComparisonSourceCompatibility('right')
    this.applyFilterModeCompatibilityRules()
  }

  applyRelationalComparisonSourceCompatibility(side) {
    const sideState = this.state.relational[side]
    const allowedSources = this.allowedRelationalComparisonSourcesForMetric(sideState.comparisonMetric)
    if (!allowedSources.includes(sideState.comparisonSource)) {
      sideState.comparisonSource = 'exact_number'
      sideState.comparisonSourceTotal ||= 1
    }
  }

  leftUsesPriorBoardState() {
    const rel = this.state.relational
    return this.state.mode === 'relational' && rel.ui.leftComparisonOpen && rel.left.comparisonSource === 'prior_board_state'
  }

  rightUsesPriorBoardState() {
    const rel = this.state.relational
    return this.state.mode === 'relational' && rel.ui.rightComparisonOpen && rel.right.comparisonSource === 'prior_board_state'
  }

  comparisonLocked(side) {
    if (this.state.mode !== 'relational') { return false }
    return side === 'left' ? this.rightUsesPriorBoardState() : this.leftUsesPriorBoardState()
  }

  comparisonUnavailableText(side) {
    if (side === 'left' && this.rightUsesPriorBoardState()) {
      return '+ comparison unavailable while target uses prior'
    }
    if (side === 'right' && this.leftUsesPriorBoardState()) {
      return '+ comparison unavailable while subject uses prior'
    }
    return '+ comparison unavailable'
  }

  regularRelationalSubjects() {
    return this.grammarRules.regularRelationalSubjects
  }

  regularRelationalTargets() {
    const operator = this.state.relational.operator
    if (operator === 'targets') { return this.grammarRules.regularRelationalTargets }
    const targetRule = this.grammarRules.relationalOperatorTargetRules[operator] || 'any_regular'
    if (targetRule === 'opposing_team') {
      return this.opposingTeamTargetsFor(this.state.relational.left.subject)
    } else if (targetRule === 'same_team') {
      return this.sameTeamTargetsFor(this.state.relational.left.subject)
    } else {
      return this.grammarRules.regularRelationalTargets
    }
  }

  samePieceTargetsFor(subject) {
    return this.grammarRules.samePieceTargets[subject] || []
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

  allowedUnaryOperatorsForSubject(subject) {
    if (['captured_piece', 'enemy_captured_piece'].includes(subject)) {
      return ['count', 'value']
    } else {
      return ['count', 'mobility', 'value']
    }
  }

  applyUnaryCompatibilityRules(changedId) {
    const meas = this.state.measure
    const allowedUnaryOperators = this.allowedUnaryOperatorsForSubject(meas.left.subject)
    this.applyFilterModeCompatibilityRules()

    if (!allowedUnaryOperators.includes(meas.operator) && changedId === 'cond-measure-operator') {
      meas.left.subject = 'allied'
    } else if (!allowedUnaryOperators.includes(meas.operator)) {
      meas.operator = allowedUnaryOperators[0]
    }

    const allowedTargets = this.allowedUnaryTargetsForOperator(meas.operator)
    if (!allowedTargets.includes(meas.unary.target)) {
      meas.unary.target = 'exact_number'
      meas.unary.targetFilter = 'any'
      meas.unary.targetFilterMode = 'include'
    }
  }

  applyFilterModeCompatibilityRules() {
    if (this.state.mode === 'relational') {
      if (this.state.relational.left.filter === 'any') {
        this.state.relational.left.filterMode = 'include'
      }
      if (this.state.relational.right.filter === 'any') {
        this.state.relational.right.filterMode = 'include'
      }
    } else {
      if (this.state.measure.left.filter === 'any') {
        this.state.measure.left.filterMode = 'include'
      }
      if (this.state.measure.unary.targetFilter === 'any') {
        this.state.measure.unary.targetFilterMode = 'include'
      }
    }
  }

  disableOptions(select, disallowedValues) {
    Array.from(select.options).forEach(option => {
      option.disabled = disallowedValues.includes(option.value)
    })
  }

  enableAllOptions(select) {
    Array.from(select.options).forEach(option => {
      option.disabled = false
    })
  }

  allowedUnarySubjectsForOperator(operator) {
    if (operator === 'mobility') {
      return ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece']
    } else {
      return this.editorSubjects()
    }
  }

  unaryTargetUsesActor() {
    return !['exact_number', 'prior_board_state'].includes(this.state.measure.unary.target)
  }

  allowedUnaryTargetsForOperator(operator) {
    return [
      'exact_number',
      ...this.editorSubjects().filter(subject => this.allowedUnaryOperatorsForSubject(subject).includes(operator)),
      'prior_board_state'
    ]
  }

  setComparisonInputsDisabled(side, fields, disabled) {
    const metricKey = side === 'left' ? 'leftComparisonMetric' : 'rightComparisonMetric'
    const comparatorKey = side === 'left' ? 'leftComparator' : 'rightComparator'
    const sourceKey = side === 'left' ? 'leftComparisonSource' : 'rightComparisonSource'
    const sourceTotalKey = side === 'left' ? 'leftComparisonSourceTotal' : 'rightComparisonSourceTotal'

    fields[metricKey].disabled = disabled
    fields[comparatorKey].disabled = disabled
    fields[sourceKey].disabled = disabled
    fields[sourceTotalKey].disabled = disabled
  }

  allowedRelationalComparisonSourcesForMetric(metric) {
    if (metric === 'value') {
      return ['exact_number', 'prior_board_state', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece']
    }
    return ['exact_number', 'prior_board_state']
  }

  disableRelationalComparisonSourceOptions(fields) {
    this.disableRelationalComparisonSourceOptionsForSide('left', fields.leftComparisonSource)
    this.disableRelationalComparisonSourceOptionsForSide('right', fields.rightComparisonSource)
  }

  disableRelationalComparisonSourceOptionsForSide(side, select) {
    const allowedSources = this.allowedRelationalComparisonSourcesForMetric(this.state.relational[side].comparisonMetric || 'count')
    const allSources = Array.from(select.options).map(option => option.value)
    this.disableOptions(select, allSources.filter(value => !allowedSources.includes(value)))
  }

  setUnaryComparisonInputsDisabled(fields, disabled) {
    fields.unaryComparator.disabled = disabled
    fields.unaryTarget.disabled = disabled
    fields.unaryTargetTotal.disabled = disabled
    fields.unaryTargetFilterMode.disabled = disabled
    fields.unaryTargetFilter.disabled = disabled
  }

  disableRelationalSubjectOptions(fields, samePieceMode) {
    this.enableAllOptions(fields.leftSubject)
    this.enableAllOptions(fields.rightSubject)

    if (samePieceMode) {
      const leftAllowed = Object.keys(this.grammarRules.samePieceTargets)
      const rightAllowed = this.samePieceTargetsFor(this.state.relational.left.subject)
      this.disableOptions(fields.leftSubject, this.editorSubjects().filter(v => !leftAllowed.includes(v)))
      this.disableOptions(fields.rightSubject, this.editorSubjects().filter(v => !rightAllowed.includes(v)))
      return
    }

    this.disableOptions(fields.leftSubject, this.editorSubjects().filter(v => !this.regularRelationalSubjects().includes(v)))
    this.disableOptions(fields.rightSubject, this.editorSubjects().filter(v => !this.regularRelationalTargets().includes(v)))
  }

  disableMeasureSubjectOptions(fields) {
    const allowedSubjects = this.allowedUnarySubjectsForOperator(this.state.measure.operator)
    this.disableOptions(fields.leftSubject, this.editorSubjects().filter(v => !allowedSubjects.includes(v)))
  }

  disableUnaryTargetOptions(fields) {
    const allowedTargets = this.allowedUnaryTargetsForOperator(this.state.measure.operator)
    const allTargets = Array.from(fields.unaryTarget.options).map(option => option.value)
    this.disableOptions(fields.unaryTarget, allTargets.filter(value => !allowedTargets.includes(value)))
  }

  showAllOptions(select) {
    Array.from(select.options).forEach(option => {
      option.hidden = false
      option.disabled = false
    })
  }

  editorSubjects() {
    return this.grammarRules.editorSubjects
  }

}

export default ConditionForm
