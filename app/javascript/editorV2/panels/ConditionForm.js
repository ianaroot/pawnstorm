import { formatConditionPreview } from 'editorV2/utils/conditionPreviewFormatter'

const DEFAULT_STATE = Object.freeze({
  kind: 'relational',
  left: {
    subject: 'allied',
    filter: 'any',
    filterMode: 'include',
    comparisonMetric: '',
    comparator: 'equal_to',
    comparisonSource: 'exact_number',
    comparisonSourceTotal: 1
  },
  operator: 'attack',
  right: {
    subject: 'enemy',
    filter: 'any',
    filterMode: 'include',
    comparisonMetric: '',
    comparator: 'equal_to',
    comparisonSource: 'exact_number',
    comparisonSourceTotal: 1
  },
  unary: {
    comparator: 'greater_than',
    target: 'exact_number',
    targetFilter: 'any',
    targetFilterMode: 'include',
    targetTotal: 0
  },
  ui: {
    leftComparisonOpen: false,
    rightComparisonOpen: false,
  }
})

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
    this.state = structuredClone(DEFAULT_STATE)
    this.boundHandleFieldChange = this.handleFieldChange.bind(this)
    this.boundHandleLeftComparisonToggle = this.toggleLeftComparison.bind(this)
    this.boundHandleRightComparisonToggle = this.toggleRightComparison.bind(this)
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
  }

  detach() {
    const fields = this.fields()
    fields.all.forEach(field => field?.removeEventListener('change', this.boundHandleFieldChange))
    fields.numberInputs.forEach(field => field?.removeEventListener('input', this.boundHandleFieldChange))
    fields.leftComparisonToggle?.removeEventListener('click', this.boundHandleLeftComparisonToggle)
    fields.rightComparisonToggle?.removeEventListener('click', this.boundHandleRightComparisonToggle)
  }

  fields() {
    const leftSubject = this.editorPanel.querySelector('#cond-left-subject')
    const leftFilterMode = this.editorPanel.querySelector('#cond-left-filter-mode')
    const leftFilter = this.editorPanel.querySelector('#cond-left-filter')
    const leftComparisonMetric = this.editorPanel.querySelector('#cond-left-comparison-metric')
    const leftComparator = this.editorPanel.querySelector('#cond-left-comparator')
    const leftComparisonSource = this.editorPanel.querySelector('#cond-left-comparison-source')
    const leftComparisonSourceTotal = this.editorPanel.querySelector('#cond-left-comparison-source-total')
    const operator = this.editorPanel.querySelector('#cond-operator')
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
      operator,
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
      all: [
        leftSubject, leftFilterMode, leftFilter, leftComparisonMetric, leftComparator, leftComparisonSource,
        operator,
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
      this.state = structuredClone(DEFAULT_STATE)
    }
    if (this.state.kind === 'unary') {
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
        kind: 'unary',
        left: {
          subject: nodeData.subject || 'allied',
          filter: nodeData.subjectFilter || 'any',
          filterMode: nodeData.subjectFilterMode || 'include',
          comparisonMetric: '',
          comparator: 'equal_to',
          comparisonSource: 'exact_number',
          comparisonSourceTotal: 1
        },
        operator: nodeData.operator || 'count',
        right: {
          subject: 'enemy',
          filter: 'any',
          filterMode: 'include',
          comparisonMetric: '',
          comparator: 'equal_to',
          comparisonSource: 'exact_number',
          comparisonSourceTotal: 1
        },
        unary: this.unaryStateFromNodeData(nodeData),
        ui: {
          leftComparisonOpen: false,
          rightComparisonOpen: false,
        }
      }
    } else {
      return {
        kind: 'relational',
        left: this.relationalSideState({
          subject: nodeData.subject,
          filter: nodeData.subjectFilter,
          filterMode: nodeData.subjectFilterMode,
          comparisonMetric: nodeData.subjectComparisonMetric,
          comparator: nodeData.subjectComparator,
          comparisonSource: nodeData.subjectComparisonSource,
          comparisonSourceTotal: nodeData.subjectComparisonSourceTotal
        }),
        operator: nodeData.operator || 'attack',
        right: this.relationalSideState({
          subject: nodeData.target,
          filter: nodeData.targetFilter,
          filterMode: nodeData.targetFilterMode,
          comparisonMetric: nodeData.targetComparisonMetric,
          comparator: nodeData.targetComparator,
          comparisonSource: nodeData.targetComparisonSource,
          comparisonSourceTotal: nodeData.targetComparisonSourceTotal
        }),
        unary: {
          comparator: 'greater_than',
          target: 'exact_number',
          targetFilter: 'any',
          targetFilterMode: 'include',
          targetTotal: 0
        },
        ui: {
          leftComparisonOpen: Boolean(nodeData.subjectComparisonMetric),
          rightComparisonOpen: Boolean(nodeData.targetComparisonMetric),
        }
      }
    }
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
    const samePieceMode = this.usesSamePiece()
    const leftComparisonActive = this.state.kind === 'relational' && !samePieceMode && this.state.ui.leftComparisonOpen
    const rightComparisonActive = this.state.kind === 'relational' && !samePieceMode && this.state.ui.rightComparisonOpen
    const unaryComparisonActive = this.state.kind === 'unary'
    const leftFilterModeAvailable = this.state.left.filter !== 'any'
    const rightFilterModeAvailable = this.state.right.filter !== 'any'
    const unaryTargetFilterAvailable = this.unaryTargetUsesActor()
    const unaryTargetFilterModeAvailable = unaryTargetFilterAvailable && this.state.unary.targetFilter !== 'any'

    if (fields.leftSubject) fields.leftSubject.value = this.state.left.subject
    if (fields.leftFilterMode) fields.leftFilterMode.checked = leftFilterModeAvailable && this.state.left.filterMode === 'exclude'
    if (fields.leftFilter) fields.leftFilter.value = this.state.left.filter
    if (fields.leftComparisonMetric) fields.leftComparisonMetric.value = this.state.left.comparisonMetric || 'count'
    if (fields.leftComparator) fields.leftComparator.value = this.state.left.comparator
    if (fields.leftComparisonSource) fields.leftComparisonSource.value = this.state.left.comparisonSource
    if (fields.leftComparisonSourceTotal) fields.leftComparisonSourceTotal.value = this.state.left.comparisonSourceTotal

    if (fields.operator) fields.operator.value = this.state.operator

    if (fields.rightSubject) fields.rightSubject.value = this.state.right.subject
    if (fields.rightFilterMode) fields.rightFilterMode.checked = rightFilterModeAvailable && this.state.right.filterMode === 'exclude'
    if (fields.rightFilter) fields.rightFilter.value = this.state.right.filter
    if (fields.rightComparisonMetric) fields.rightComparisonMetric.value = this.state.right.comparisonMetric || 'count'
    if (fields.rightComparator) fields.rightComparator.value = this.state.right.comparator
    if (fields.rightComparisonSource) fields.rightComparisonSource.value = this.state.right.comparisonSource
    if (fields.rightComparisonSourceTotal) fields.rightComparisonSourceTotal.value = this.state.right.comparisonSourceTotal

    if (fields.unaryComparator) fields.unaryComparator.value = this.state.unary.comparator
    if (fields.unaryTarget) fields.unaryTarget.value = this.state.unary.target
    if (fields.unaryTargetTotal) fields.unaryTargetTotal.value = this.state.unary.targetTotal
    if (fields.unaryTargetFilter) fields.unaryTargetFilter.value = this.state.unary.targetFilter
    if (fields.unaryTargetFilterMode) fields.unaryTargetFilterMode.checked = unaryTargetFilterModeAvailable && this.state.unary.targetFilterMode === 'exclude'


    if (fields.formulationPreview) {
      fields.formulationPreview.textContent = formatConditionPreview(this.buildPayload()).text
    }
    fields.rightCardLabel.textContent = 'Target'
    fields.rightRelationalFields.classList.toggle('hidden', this.state.kind !== 'relational')
    fields.unaryComparisonSection.classList.toggle('hidden', this.state.kind === 'relational')
    fields.leftComparisonBody.classList.toggle('hidden', !this.state.ui.leftComparisonOpen)
    fields.rightComparisonBody.classList.toggle('hidden', !this.state.ui.rightComparisonOpen || this.state.kind !== 'relational')
    fields.leftComparisonSourceTotal?.classList.toggle('hidden', this.state.left.comparisonSource !== 'exact_number')
    fields.rightComparisonSourceTotal?.classList.toggle('hidden', this.state.right.comparisonSource !== 'exact_number')
    fields.unaryTargetTotal?.classList.toggle('hidden', this.state.unary.target !== 'exact_number')
    fields.leftComparisonSourceStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', this.state.left.comparisonSource === 'exact_number')
    fields.rightComparisonSourceStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', this.state.right.comparisonSource === 'exact_number')
    fields.unaryTargetStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', this.state.unary.target === 'exact_number')
    fields.unaryTargetFilterRow?.classList.toggle('hidden', !unaryTargetFilterAvailable)

    fields.leftFilterRow.classList.toggle('hidden', samePieceMode)
    fields.rightFilterRow.classList.toggle('hidden', samePieceMode)
    fields.leftFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !leftFilterModeAvailable)
    fields.rightFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !rightFilterModeAvailable)
    fields.unaryTargetFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !unaryTargetFilterModeAvailable)
    fields.leftComparisonSection.classList.toggle('hidden', this.state.kind !== 'relational' || samePieceMode)
    fields.rightComparisonToggle.closest('.condition-form-comparison').classList.toggle('hidden', samePieceMode)
    fields.unaryTargetSection?.classList.toggle('hidden', this.state.kind !== 'unary')
    this.setComparisonInputsDisabled('left', fields, !leftComparisonActive)
    this.setComparisonInputsDisabled('right', fields, !rightComparisonActive)
    this.setUnaryComparisonInputsDisabled(fields, !unaryComparisonActive)

    const leftLocked = this.comparisonLocked('left')
    const rightLocked = this.comparisonLocked('right')
    fields.leftComparisonToggle.disabled = leftLocked
    fields.rightComparisonToggle.disabled = rightLocked
    fields.leftComparisonToggle.textContent = leftLocked ? this.comparisonUnavailableText('left') : (this.state.ui.leftComparisonOpen ? 'Hide comparison' : '+ comparison')
    fields.rightComparisonToggle.textContent = rightLocked ? this.comparisonUnavailableText('right') : (this.state.ui.rightComparisonOpen ? 'Hide comparison' : '+ comparison')
    this.showAllOptions(fields.leftSubject)
    this.showAllOptions(fields.rightSubject)
    this.showAllOptions(fields.unaryTarget)
    this.disableSubjectOptions(fields, samePieceMode)
    this.disableRelationalComparisonSourceOptions(fields)
    this.disableUnaryTargetOptions(fields)
  }

  showAllOptions(select) {
    Array.from(select.options).forEach(option => {
      option.hidden = false
      option.disabled = false
    })
  }

  toggleLeftComparison() {
    if (this.state.kind !== 'relational') { return }
    if (this.comparisonLocked('left')) { return }

    if (!this.state.ui.leftComparisonOpen && !this.state.left.comparisonMetric) {
      this.state.left.comparisonMetric = 'count'
      this.state.left.comparator = 'equal_to'
      this.state.left.comparisonSource = 'exact_number'
      this.state.left.comparisonSourceTotal ||= 1
    }

    this.state.ui.leftComparisonOpen = !this.state.ui.leftComparisonOpen
    this.render()
  }

  toggleRightComparison() {
    if (this.state.kind !== 'relational') { return }
    if (this.comparisonLocked('right')) { return }

    if (!this.state.ui.rightComparisonOpen && !this.state.right.comparisonMetric) {
      this.state.right.comparisonMetric = 'count'
      this.state.right.comparator = 'equal_to'
      this.state.right.comparisonSource = 'exact_number'
      this.state.right.comparisonSourceTotal ||= 1
    }

    this.state.ui.rightComparisonOpen = !this.state.ui.rightComparisonOpen
    this.render()
  }
  
  handleFieldChange(event) {
    const fields = this.fields()
    const changedId = event?.target?.id
    const relationalOperator = ['attack', 'defend', 'cover', 'shield', 'adjacent', 'same_piece'].includes(fields.operator?.value)

    if (relationalOperator) {
      this.state.kind = 'relational'
      this.state.left.subject = fields.leftSubject?.value || 'allied'
      this.state.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
      this.state.left.filter = fields.leftFilter?.value || 'any'
      this.state.left.comparisonMetric = fields.leftComparisonMetric?.value || ''
      this.state.left.comparator = fields.leftComparator?.value || 'equal_to'
      this.state.left.comparisonSource = fields.leftComparisonSource?.value || 'exact_number'
      this.state.left.comparisonSourceTotal = Number(fields.leftComparisonSourceTotal?.value || 1)

      this.state.operator = fields.operator?.value || 'attack'

      this.state.right.subject = fields.rightSubject?.value || 'enemy'
      this.state.right.filterMode = fields.rightFilterMode?.checked ? 'exclude' : 'include'
      this.state.right.filter = fields.rightFilter?.value || 'any'
      this.state.right.comparisonMetric = fields.rightComparisonMetric?.value || ''
      this.state.right.comparator = fields.rightComparator?.value || 'equal_to'
      this.state.right.comparisonSource = fields.rightComparisonSource?.value || 'exact_number'
      this.state.right.comparisonSourceTotal = Number(fields.rightComparisonSourceTotal?.value || 1)
    } else {
      this.state.kind = 'unary'
      this.state.left.subject = fields.leftSubject?.value || 'allied'
      this.state.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
      this.state.left.filter = fields.leftFilter?.value || 'any'
      this.state.operator = fields.operator?.value || 'count'
      this.state.unary.comparator = fields.unaryComparator?.value || 'greater_than'
      this.state.unary.target = fields.unaryTarget?.value || 'exact_number'
      this.state.unary.targetFilterMode = fields.unaryTargetFilterMode?.checked ? 'exclude' : 'include'
      this.state.unary.targetFilter = fields.unaryTargetFilter?.value || 'any'
      this.state.unary.targetTotal = Number(fields.unaryTargetTotal?.value || 0)
      this.state.ui.rightComparisonOpen = false
      this.state.ui.leftComparisonOpen = false
      this.applyUnaryCompatibilityRules(changedId)
      this.render()
      return
    }

    this.applyRelationalCompatibilityRules()
    this.render()
  }

  buildPayload() {
    if (this.state.kind === 'unary') {
      const payload = {
        version: 2,
        kind: 'unary',
        subject: this.state.left.subject,
        subjectFilter: this.state.left.filter,
        operator: this.state.operator,
        comparator: this.state.unary.comparator,
        target: this.state.unary.target,
        ...(this.state.left.filter !== 'any' ? { subjectFilterMode: this.state.left.filterMode } : {})
      }

      if (this.state.unary.target === 'exact_number') {
        payload.targetTotal = this.state.unary.targetTotal
      } else if (this.unaryTargetUsesActor()) {
        payload.targetFilter = this.state.unary.targetFilter
        if (this.state.unary.targetFilter !== 'any') {
          payload.targetFilterMode = this.state.unary.targetFilterMode
        }
      }

      return payload
    } else {
      const payload = {
        version: 2,
        kind: 'relational',
        subject: this.state.left.subject,
        subjectFilter: this.state.left.filter,
        operator: this.state.operator,
        target: this.state.right.subject,
        targetFilter: this.state.right.filter
      }

      if (this.state.left.filter !== 'any') {
        payload.subjectFilterMode = this.state.left.filterMode
      }

      if (this.state.right.filter !== 'any') {
        payload.targetFilterMode = this.state.right.filterMode
      }

      if (this.state.ui.leftComparisonOpen && this.state.left.comparisonMetric) {
        payload.subjectComparisonMetric = this.state.left.comparisonMetric
        payload.subjectComparator = this.state.left.comparator
        payload.subjectComparisonSource = this.state.left.comparisonSource
        if (this.state.left.comparisonSource === 'exact_number') {
          payload.subjectComparisonSourceTotal = this.state.left.comparisonSourceTotal
        }
      }

      if (this.state.ui.rightComparisonOpen && this.state.right.comparisonMetric) {
        payload.targetComparisonMetric = this.state.right.comparisonMetric
        payload.targetComparator = this.state.right.comparator
        payload.targetComparisonSource = this.state.right.comparisonSource
        if (this.state.right.comparisonSource === 'exact_number') {
          payload.targetComparisonSourceTotal = this.state.right.comparisonSourceTotal
        }
      }

      return payload
    }
  }


  // -------------------------------- GRAMMAR RULES ----------------------------------

  usesSamePiece() {
    return this.state.kind === 'relational' && this.state.operator === 'same_piece'
  }

  clearComparator(side) {
    this.state[side].comparisonMetric = ''
    this.state[side].comparator = 'equal_to'
    this.state[side].comparisonSource = 'exact_number'
    this.state[side].comparisonSourceTotal = 1
  }

  applyRelationalCompatibilityRules() {
    if (this.state.kind !== 'relational') {
      return
    }

    if (this.usesSamePiece()) {
      const allowedLeft = Object.keys(this.grammarRules.samePieceTargets)
      if (!allowedLeft.includes(this.state.left.subject)) {
        this.state.left.subject = allowedLeft[0]
      }

      this.state.right.subject = this.samePieceTargetsFor(this.state.left.subject)[0]

      this.state.left.filter = 'any'
      this.state.left.filterMode = 'include'
      this.state.right.filter = 'any'
      this.state.right.filterMode = 'include'
      this.clearComparator('left')
      this.clearComparator('right')
      this.state.ui.leftComparisonOpen = false
      this.state.ui.rightComparisonOpen = false
      return
    }

    if (this.state.right.subject === 'captured_piece') {
      this.state.right.subject = 'enemy'
    }
    const allowedLeft = this.regularRelationalSubjects()
    if (!allowedLeft.includes(this.state.left.subject)) {
      this.state.left.subject = 'allied'
    }

    const allowedRight = this.regularRelationalTargets()
    if (!allowedRight.includes(this.state.right.subject)) {
      this.state.right.subject = allowedRight[0]
    }

    if (this.leftUsesPriorBoardState()) {
      this.clearComparator('right')
      this.state.ui.rightComparisonOpen = false
    }

    if (this.rightUsesPriorBoardState()) {
      this.clearComparator('left')
      this.state.ui.leftComparisonOpen = false
    }

    this.applyRelationalComparisonSourceCompatibility('left')
    this.applyRelationalComparisonSourceCompatibility('right')
    this.applyFilterModeCompatibilityRules()
  }

  applyRelationalComparisonSourceCompatibility(side) {
    const allowedSources = this.allowedRelationalComparisonSourcesForMetric(this.state[side].comparisonMetric)
    if (!allowedSources.includes(this.state[side].comparisonSource)) {
      this.state[side].comparisonSource = 'exact_number'
      this.state[side].comparisonSourceTotal ||= 1
    }
  }

  leftUsesPriorBoardState() {
    return this.state.kind === 'relational' &&
      this.state.ui.leftComparisonOpen &&
      this.state.left.comparisonSource === 'prior_board_state'
  }

  rightUsesPriorBoardState() {
    return this.state.kind === 'relational' &&
      this.state.ui.rightComparisonOpen &&
      this.state.right.comparisonSource === 'prior_board_state'
  }

  comparisonLocked(side) {
    if (this.state.kind !== 'relational') {
      return false
    }
    if (side === 'left') {
      return this.rightUsesPriorBoardState()
    } else {
      return this.leftUsesPriorBoardState()
    }
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
    const targetRule = this.grammarRules.relationalOperatorTargetRules[this.state.operator] || 'any_regular'
    if (targetRule === 'opposing_team') {
      return this.opposingTeamTargetsFor(this.state.left.subject)
    } else if (targetRule === 'same_team') {
      return this.sameTeamTargetsFor(this.state.left.subject)
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
    const allowedUnaryOperators = this.allowedUnaryOperatorsForSubject(this.state.left.subject)
    this.applyFilterModeCompatibilityRules()

    if (!allowedUnaryOperators.includes(this.state.operator) && changedId === 'cond-operator') {
      this.state.left.subject = 'allied'
    } else if (!allowedUnaryOperators.includes(this.state.operator)) {
      this.state.operator = allowedUnaryOperators[0]
    }

    const allowedTargets = this.allowedUnaryTargetsForOperator(this.state.operator)
    if (!allowedTargets.includes(this.state.unary.target)) {
      this.state.unary.target = 'exact_number'
      this.state.unary.targetFilter = 'any'
      this.state.unary.targetFilterMode = 'include'
    }
  }

  applyFilterModeCompatibilityRules() {
    if (this.state.left.filter === 'any') {
      this.state.left.filterMode = 'include'
    }

    if (this.state.right.filter === 'any') {
      this.state.right.filterMode = 'include'
    }

    if (this.state.unary.targetFilter === 'any') {
      this.state.unary.targetFilterMode = 'include'
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
    return !['exact_number', 'prior_board_state'].includes(this.state.unary.target)
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
    if (this.state.kind !== 'relational') { return }

    this.disableRelationalComparisonSourceOptionsForSide('left', fields.leftComparisonSource)
    this.disableRelationalComparisonSourceOptionsForSide('right', fields.rightComparisonSource)
  }

  disableRelationalComparisonSourceOptionsForSide(side, select) {
    const allowedSources = this.allowedRelationalComparisonSourcesForMetric(this.state[side].comparisonMetric || 'count')
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

  disableSubjectOptions(fields, samePieceMode) {
    this.enableAllOptions(fields.leftSubject)
    this.enableAllOptions(fields.rightSubject)

    if (this.state.kind === 'unary') {
      const allowedSubjects = this.allowedUnarySubjectsForOperator(this.state.operator)
      this.disableOptions(fields.leftSubject, this.editorSubjects().filter(value => !allowedSubjects.includes(value)))
      return
    }

    if (this.state.kind !== 'relational') {
      return
    }

    if (samePieceMode) {
      const leftAllowed = Object.keys(this.grammarRules.samePieceTargets)
      const rightAllowed = this.samePieceTargetsFor(this.state.left.subject)

      this.disableOptions(fields.leftSubject, this.editorSubjects().filter(value => !leftAllowed.includes(value)))
      this.disableOptions(fields.rightSubject, this.editorSubjects().filter(value => !rightAllowed.includes(value)))
      return
    }

    this.disableOptions(fields.leftSubject, this.editorSubjects().filter(value => !this.regularRelationalSubjects().includes(value)))
    this.disableOptions(fields.rightSubject, this.editorSubjects().filter(value => !this.regularRelationalTargets().includes(value)))
  }

  disableUnaryTargetOptions(fields) {
    if (this.state.kind !== 'unary') { return }

    const allowedTargets = this.allowedUnaryTargetsForOperator(this.state.operator)
    const allTargets = Array.from(fields.unaryTarget.options).map(option => option.value)
    this.disableOptions(fields.unaryTarget, allTargets.filter(value => !allowedTargets.includes(value)))
  }

  editorSubjects() {
    return this.grammarRules.editorSubjects
  }

}

export default ConditionForm
