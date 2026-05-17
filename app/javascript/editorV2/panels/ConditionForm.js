import { formatConditionPreview } from 'editorV2/utils/conditionPreviewFormatter'

const PILL_INPUT_CACHE = new WeakMap()

function pillInputs(container) {
  if (!container) { return [] }
  let inputs = PILL_INPUT_CACHE.get(container)
  if (!inputs) {
    inputs = Array.from(container.querySelectorAll('input[type="radio"]'))
    PILL_INPUT_CACHE.set(container, inputs)
  }
  return inputs
}

function pillValue(inputs) {
  return inputs?.find(input => input.checked)?.value
}

function setPillChecked(inputs, value, numeric = false) {
  inputs?.forEach(input => {
    input.checked = (numeric ? Number(input.value) : input.value) === value
  })
}

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

const DEFAULT_CENSUS_STATE = {
  left: {
    subject: 'allied',
    filter: 'any',
    filterMode: 'include'
  },
  scope: 'region',
  positionAxis: 'rank',
  positionComparator: 'equal_to',
  positionRankTarget: 1,
  positionFileTarget: 1,
  positionSquareFile: 1,
  positionSquareRank: 1,
  advanced: false,
  operator: 'count',
  comparator: 'greater_than',
  target: 'exact_number',
  targetFilter: 'any',
  targetFilterMode: 'include',
  targetTotal: 0
}

const DEFAULT_GRAMMAR_RULES = Object.freeze({
  editorSubjects: ['allied', 'enemy', 'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'],
  positionSubjects: ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'],
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
    this.boundHandleModeCensus = () => this.handleModeChange('census')
    this.boundHandleCensusComparisonToggle = this.toggleCensusComparison.bind(this)
  }

  defaultState() {
    return {
      mode: 'census',
      relational: structuredClone(DEFAULT_RELATIONAL_STATE),
      census: structuredClone(DEFAULT_CENSUS_STATE)
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
    fields.modeCensusBtn?.addEventListener('click', this.boundHandleModeCensus)
    fields.censusComparisonToggle?.addEventListener('click', this.boundHandleCensusComparisonToggle)
  }

  detach() {
    const fields = this.fields()
    fields.all.forEach(field => field?.removeEventListener('change', this.boundHandleFieldChange))
    fields.numberInputs.forEach(field => field?.removeEventListener('input', this.boundHandleFieldChange))
    fields.leftComparisonToggle?.removeEventListener('click', this.boundHandleLeftComparisonToggle)
    fields.rightComparisonToggle?.removeEventListener('click', this.boundHandleRightComparisonToggle)
    fields.modeRelationalBtn?.removeEventListener('click', this.boundHandleModeRelational)
    fields.modeCensusBtn?.removeEventListener('click', this.boundHandleModeCensus)
    fields.censusComparisonToggle?.removeEventListener('click', this.boundHandleCensusComparisonToggle)
  }

  fields() {
    const leftSubject = this.editorPanel.querySelector('#cond-left-subject')
    const leftFilterMode = this.editorPanel.querySelector('#cond-left-filter-mode')
    const leftFilter = this.editorPanel.querySelector('#cond-left-filter')
    const leftComparisonMetric = this.editorPanel.querySelector('#cond-left-comparison-metric')
    const leftComparator = this.editorPanel.querySelector('#cond-left-comparator')
    const leftComparatorInputs = pillInputs(leftComparator)
    const leftComparisonSource = this.editorPanel.querySelector('#cond-left-comparison-source')
    const leftComparisonSourceTotal = this.editorPanel.querySelector('#cond-left-comparison-source-total')
    const relationalOperatorSelect = this.editorPanel.querySelector('#cond-relational-operator')
    const rightSubject = this.editorPanel.querySelector('#cond-right-subject')
    const rightFilterMode = this.editorPanel.querySelector('#cond-right-filter-mode')
    const rightFilter = this.editorPanel.querySelector('#cond-right-filter')
    const rightComparisonMetric = this.editorPanel.querySelector('#cond-right-comparison-metric')
    const rightComparator = this.editorPanel.querySelector('#cond-right-comparator')
    const rightComparatorInputs = pillInputs(rightComparator)
    const rightComparisonSource = this.editorPanel.querySelector('#cond-right-comparison-source')
    const rightComparisonSourceTotal = this.editorPanel.querySelector('#cond-right-comparison-source-total')
    const censusSubject = this.editorPanel.querySelector('#cond-census-subject')
    const censusFilterMode = this.editorPanel.querySelector('#cond-census-filter-mode')
    const censusFilter = this.editorPanel.querySelector('#cond-census-filter')
    const censusOperator = this.editorPanel.querySelector('#cond-census-operator')
    const censusComparator = this.editorPanel.querySelector('#cond-census-comparator')
    const censusComparatorInputs = pillInputs(censusComparator)
    const censusTarget = this.editorPanel.querySelector('#cond-census-target')
    const censusTargetTotal = this.editorPanel.querySelector('#cond-census-target-total')
    const censusTargetFilter = this.editorPanel.querySelector('#cond-census-target-filter')
    const censusTargetFilterMode = this.editorPanel.querySelector('#cond-census-target-filter-mode')
    const censusScopeWhole = this.editorPanel.querySelector('#cond-census-scope-whole')
    const censusAxisRank = this.editorPanel.querySelector('#cond-census-axis-rank')
    const censusAxisFile = this.editorPanel.querySelector('#cond-census-axis-file')
    const censusAxisSquare = this.editorPanel.querySelector('#cond-census-axis-square')
    const censusRegionComparator = this.editorPanel.querySelector('#cond-census-region-comparator')
    const censusRegionComparatorInputs = pillInputs(censusRegionComparator)
    const censusRankInput = this.editorPanel.querySelector('#cond-census-rank-input')
    const censusFileInput = this.editorPanel.querySelector('#cond-census-file-input')
    const censusSquareFile = this.editorPanel.querySelector('#cond-census-square-file')
    const censusSquareRank = this.editorPanel.querySelector('#cond-census-square-rank')
    const censusRankInputs = pillInputs(censusRankInput)
    const censusFileInputs = pillInputs(censusFileInput)
    const censusSquareFileInputs = pillInputs(censusSquareFile)
    const censusSquareRankInputs = pillInputs(censusSquareRank)

    return {
      leftSubject,
      leftFilterMode,
      leftFilter,
      leftComparisonMetric,
      leftComparator,
      leftComparatorInputs,
      leftComparisonSource,
      leftComparisonSourceTotal,
      relationalOperatorSelect,
      operatorSelect: this.state.mode === 'relational' ? relationalOperatorSelect : censusOperator,
      rightSubject,
      rightFilterMode,
      rightFilter,
      rightComparisonMetric,
      rightComparator,
      rightComparatorInputs,
      rightComparisonSource,
      rightComparisonSourceTotal,
      censusSubject,
      censusFilterMode,
      censusFilter,
      censusOperator,
      censusComparator,
      censusComparatorInputs,
      censusTarget,
      censusTargetTotal,
      censusTargetFilter,
      censusTargetFilterMode,
      censusScopeWhole,
      censusAxisRank,
      censusAxisFile,
      censusAxisSquare,
      censusRegionComparator,
      censusRegionComparatorInputs,
      censusRankInput,
      censusFileInput,
      censusSquareFile,
      censusSquareRank,
      censusRankInputs,
      censusFileInputs,
      censusSquareFileInputs,
      censusSquareRankInputs,
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
      leftComparisonSection: this.editorPanel.querySelector('#cond-left-comparison-section'),
      leftFilterRow: this.editorPanel.querySelector('#cond-left-filter-row'),
      rightFilterRow: this.editorPanel.querySelector('#cond-right-filter-row'),
      formulationPreview: this.editorPanel.querySelector('#cond-formulation-preview'),
      modeRelationalBtn: this.editorPanel.querySelector('#cond-mode-relational'),
      modeCensusBtn: this.editorPanel.querySelector('#cond-mode-census'),
      relationalTargetNote: this.editorPanel.querySelector('#cond-relational-target-note'),
      leftAggregateNote: this.editorPanel.querySelector('#cond-left-aggregate-note'),
      rightAggregateNote: this.editorPanel.querySelector('#cond-right-aggregate-note'),
      mainLayout: this.editorPanel.querySelector('.condition-form-layout:not(.condition-form-position-layout)'),
      censusLayout: this.editorPanel.querySelector('#cond-census-layout'),
      censusFilterRow: this.editorPanel.querySelector('#cond-census-filter-row'),
      censusFilterModeControl: censusFilterMode?.closest('.condition-form-checkbox'),
      censusComparisonToggle: this.editorPanel.querySelector('#cond-census-comparison-toggle'),
      censusComparisonBody: this.editorPanel.querySelector('#cond-census-comparison-body'),
      censusTargetStack: this.editorPanel.querySelector('#cond-census-target-stack'),
      censusTargetFilterRow: this.editorPanel.querySelector('#cond-census-target-filter-row'),
      censusTargetFilterModeControl: censusTargetFilterMode?.closest('.condition-form-checkbox'),
      censusScope: this.editorPanel.querySelector('#cond-census-scope'),
      censusSquareInputs: this.editorPanel.querySelector('#cond-census-square-inputs'),
      censusRegionTarget: this.editorPanel.querySelector('#cond-census-region-target'),
      all: [
        leftSubject, leftFilterMode, leftFilter, leftComparisonMetric, ...leftComparatorInputs, leftComparisonSource,
        relationalOperatorSelect,
        rightSubject, rightFilterMode, rightFilter, rightComparisonMetric, ...rightComparatorInputs, rightComparisonSource,
        censusSubject, censusFilterMode, censusFilter, censusOperator, ...censusComparatorInputs,
        censusTarget, censusTargetFilter, censusTargetFilterMode,
        censusScopeWhole, censusAxisRank, censusAxisFile, censusAxisSquare, ...censusRegionComparatorInputs,
        ...censusRankInputs, ...censusFileInputs, ...censusSquareFileInputs, ...censusSquareRankInputs
      ],
      numberInputs: [
        leftComparisonSourceTotal,
        rightComparisonSourceTotal,
        censusTargetTotal
      ]
    }
  }

  populate(nodeData = {}) {
    if (this.isValidV2Node(nodeData)) {
      this.state = this.stateFromNodeData(nodeData)
    } else {
      this.state = this.defaultState()
    }
    if (this.state.mode === 'census') {
      this.applyCensusCompatibilityRules()
    } else {
      this.applyRelationalCompatibilityRules()
    }
    this.render()
  }

  isValidV2Node(nodeData = {}) {
    return nodeData.version === 2 && (nodeData.kind === 'relational' || nodeData.kind === 'census')
  }

  stateFromNodeData(nodeData) {
    if (nodeData.kind === 'census') {
      const hasRegion = nodeData.positionAxis !== undefined && nodeData.positionAxis !== null
      const isSquare = nodeData.positionAxis === 'square'
      const squareFile = isSquare ? ((nodeData.positionTarget % 8) + 1) : 1
      const squareRank = isSquare ? (Math.floor(nodeData.positionTarget / 8) + 1) : 1
      return {
        mode: 'census',
        relational: structuredClone(DEFAULT_RELATIONAL_STATE),
        census: {
          left: {
            subject: nodeData.subject || 'allied',
            filter: nodeData.subjectFilter || 'any',
            filterMode: nodeData.subjectFilterMode || 'include'
          },
          scope: hasRegion ? 'region' : 'whole',
          positionAxis: nodeData.positionAxis || 'rank',
          positionComparator: nodeData.positionComparator || 'equal_to',
          positionRankTarget: nodeData.positionAxis === 'rank' ? (nodeData.positionTarget || 1) : 1,
          positionFileTarget: nodeData.positionAxis === 'file' ? (nodeData.positionTarget || 1) : 1,
          positionSquareFile: squareFile,
          positionSquareRank: squareRank,
          advanced: Boolean(nodeData.target) && nodeData.target !== 'exact_number',
          operator: nodeData.operator || 'count',
          comparator: nodeData.comparator || 'greater_than',
          target: nodeData.target || 'exact_number',
          targetFilter: nodeData.targetFilter || 'any',
          targetFilterMode: nodeData.targetFilterMode || 'include',
          targetTotal: typeof nodeData.targetTotal === 'number' ? nodeData.targetTotal : 0
        }
      }
    } else {
      return {
        mode: 'relational',
        census: structuredClone(DEFAULT_CENSUS_STATE),
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
        }
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

  render() {
    const fields = this.fields()
    const isRelational = this.state.mode === 'relational'
    const isCensus = this.state.mode === 'census'

    fields.modeRelationalBtn?.classList.toggle('active', isRelational)
    fields.modeCensusBtn?.classList.toggle('active', isCensus)

    fields.relationalOperatorSelect?.classList.toggle('hidden', !isRelational)
    fields.rightRelationalFields?.classList.toggle('hidden', !isRelational)
    fields.leftComparisonSection?.classList.toggle('hidden', !isRelational || this.usesSamePiece())
    fields.mainLayout?.classList.toggle('hidden', isCensus)
    fields.censusLayout?.classList.toggle('hidden', !isCensus)

    if (isCensus) {
      this.renderCensus(fields)
    } else {
      this.renderRelational(fields)
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

    fields.leftFilterRow.classList.toggle('hidden', samePieceMode)
    fields.rightFilterRow.classList.toggle('hidden', samePieceMode)
    fields.leftFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !leftFilterModeAvailable)
    fields.rightFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !rightFilterModeAvailable)
    fields.rightComparisonToggle.closest('.condition-form-comparison').classList.toggle('hidden', samePieceMode)

    const leftLocked = this.comparisonLocked('left')
    const rightLocked = this.comparisonLocked('right')
    fields.leftComparisonToggle.disabled = leftLocked
    fields.rightComparisonToggle.disabled = rightLocked
    fields.leftComparisonToggle.textContent = leftLocked ? this.comparisonUnavailableText('left') : (rel.ui.leftComparisonOpen ? 'Hide comparison' : '+ comparison (advanced)')
    fields.rightComparisonToggle.textContent = rightLocked ? this.comparisonUnavailableText('right') : (rel.ui.rightComparisonOpen ? 'Hide comparison' : '+ comparison (advanced)')

    this.setComparisonInputsDisabled('left', fields, !leftComparisonActive)
    this.setComparisonInputsDisabled('right', fields, !rightComparisonActive)

    this.showAllOptions(fields.leftSubject)
    this.showAllOptions(fields.rightSubject)
    this.disableRelationalSubjectOptions(fields, samePieceMode)
    this.disableRelationalComparisonSourceOptions(fields)
    this.disableRelationalComparisonMetricOptions(fields)

    fields.relationalTargetNote?.classList.toggle('hidden', rel.operator !== 'shield')
    fields.rightAggregateNote?.classList.toggle('hidden', !this.leftUsesAggregateValue())
    fields.leftAggregateNote?.classList.toggle('hidden', !this.rightUsesAggregateValue())
  }

  renderCensus(fields) {
    const cen = this.state.census
    const region = cen.scope === 'region'
    const isSquare = region && cen.positionAxis === 'square'
    const filterModeAvailable = cen.left.filter !== 'any'
    const targetUsesActor = this.censusTargetUsesActor()
    const targetFilterModeAvailable = targetUsesActor && cen.targetFilter !== 'any'

    if (fields.censusSubject) fields.censusSubject.value = cen.left.subject
    if (fields.censusFilterMode) fields.censusFilterMode.checked = filterModeAvailable && cen.left.filterMode === 'exclude'
    if (fields.censusFilter) fields.censusFilter.value = cen.left.filter
    if (fields.censusScopeWhole) fields.censusScopeWhole.checked = !region
    if (fields.censusAxisRank) fields.censusAxisRank.checked = region && cen.positionAxis === 'rank'
    if (fields.censusAxisFile) fields.censusAxisFile.checked = region && cen.positionAxis === 'file'
    if (fields.censusAxisSquare) fields.censusAxisSquare.checked = region && cen.positionAxis === 'square'
    fields.censusRegionComparatorInputs?.forEach(input => {
      input.checked = input.value === cen.positionComparator
      input.disabled = isSquare && input.value !== 'equal_to'
    })
    setPillChecked(fields.censusRankInputs, cen.positionRankTarget, true)
    setPillChecked(fields.censusFileInputs, cen.positionFileTarget, true)
    setPillChecked(fields.censusSquareFileInputs, cen.positionSquareFile, true)
    setPillChecked(fields.censusSquareRankInputs, cen.positionSquareRank, true)
    if (fields.censusOperator) fields.censusOperator.value = cen.operator
    setPillChecked(fields.censusComparatorInputs, cen.comparator)
    if (fields.censusTarget) fields.censusTarget.value = cen.target
    if (fields.censusTargetTotal) fields.censusTargetTotal.value = cen.targetTotal
    if (fields.censusTargetFilter) fields.censusTargetFilter.value = cen.targetFilter
    if (fields.censusTargetFilterMode) fields.censusTargetFilterMode.checked = targetFilterModeAvailable && cen.targetFilterMode === 'exclude'

    fields.censusRegionComparator?.classList.toggle('hidden', !region)
    fields.censusRegionComparator?.classList.toggle('condition-form-comparator-toggle--locked', isSquare)
    fields.censusRegionTarget?.classList.toggle('hidden', false)
    fields.censusRankInput?.classList.toggle('hidden', !region || isSquare || cen.positionAxis === 'file')
    fields.censusFileInput?.classList.toggle('hidden', !region || isSquare || cen.positionAxis === 'rank')
    fields.censusSquareInputs?.classList.toggle('hidden', region && !isSquare)
    fields.censusSquareInputs?.classList.toggle('condition-form-radio-list--disabled', !region)
    const squareTargetInputs = [...(fields.censusSquareFileInputs || []), ...(fields.censusSquareRankInputs || [])]
    squareTargetInputs.forEach(input => { input.disabled = !region })

    fields.censusTarget?.classList.toggle('hidden', !cen.advanced)
    fields.censusTargetTotal?.classList.toggle('hidden', cen.target !== 'exact_number')
    fields.censusTargetFilterRow?.classList.toggle('hidden', !targetUsesActor)
    fields.censusTargetStack?.classList.toggle('condition-form-comparison-source-stack--inline-number', cen.target === 'exact_number')

    fields.censusComparisonBody?.classList.toggle('hidden', false)
    fields.censusComparisonToggle?.classList.toggle('hidden', false)
    if (fields.censusComparisonToggle) {
      fields.censusComparisonToggle.textContent = cen.advanced ? 'Simplify' : '+ Advanced options'
    }

    fields.censusFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !filterModeAvailable)
    fields.censusTargetFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !targetFilterModeAvailable)

    this.showAllOptions(fields.censusSubject)
    this.showAllOptions(fields.censusTarget)
    this.disableCensusSubjectOptions(fields)
    this.disableCensusOperatorOptions(fields)
    this.disableCensusTargetOptions(fields)
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

  toggleCensusComparison() {
    if (this.state.mode !== 'census') { return }
    this.state.census.advanced = !this.state.census.advanced
    this.applyCensusCompatibilityRules()
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

  handleFieldChange() {
    const fields = this.fields()

    if (this.state.mode === 'relational') {
      this.state.relational.left.subject = fields.leftSubject?.value || 'allied'
      this.state.relational.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
      this.state.relational.left.filter = fields.leftFilter?.value || 'any'
      this.state.relational.left.comparisonMetric = fields.leftComparisonMetric?.value || ''
      this.state.relational.left.comparator = pillValue(fields.leftComparatorInputs) || 'equal_to'
      this.state.relational.left.comparisonSource = fields.leftComparisonSource?.value || 'exact_number'
      this.state.relational.left.comparisonSourceTotal = Number(fields.leftComparisonSourceTotal?.value || 1)
      this.state.relational.operator = fields.relationalOperatorSelect?.value || 'targets'
      this.state.relational.right.subject = fields.rightSubject?.value || 'enemy'
      this.state.relational.right.filterMode = fields.rightFilterMode?.checked ? 'exclude' : 'include'
      this.state.relational.right.filter = fields.rightFilter?.value || 'any'
      this.state.relational.right.comparisonMetric = fields.rightComparisonMetric?.value || ''
      this.state.relational.right.comparator = pillValue(fields.rightComparatorInputs) || 'equal_to'
      this.state.relational.right.comparisonSource = fields.rightComparisonSource?.value || 'exact_number'
      this.state.relational.right.comparisonSourceTotal = Number(fields.rightComparisonSourceTotal?.value || 1)
      this.applyRelationalCompatibilityRules()
    } else {
      const cen = this.state.census
      cen.left.subject = fields.censusSubject?.value || 'allied'
      cen.left.filterMode = fields.censusFilterMode?.checked ? 'exclude' : 'include'
      cen.left.filter = fields.censusFilter?.value || 'any'
      if (fields.censusScopeWhole?.checked) {
        cen.scope = 'whole'
      } else if (fields.censusAxisFile?.checked) {
        cen.scope = 'region'
        cen.positionAxis = 'file'
      } else if (fields.censusAxisSquare?.checked) {
        cen.scope = 'region'
        cen.positionAxis = 'square'
      } else {
        cen.scope = 'region'
        cen.positionAxis = 'rank'
      }
      cen.positionComparator = pillValue(fields.censusRegionComparatorInputs) || 'equal_to'
      cen.positionRankTarget = Number(pillValue(fields.censusRankInputs) || 1)
      cen.positionFileTarget = Number(pillValue(fields.censusFileInputs) || 1)
      cen.positionSquareFile = Number(pillValue(fields.censusSquareFileInputs) || 1)
      cen.positionSquareRank = Number(pillValue(fields.censusSquareRankInputs) || 1)
      cen.operator = fields.censusOperator?.value || 'count'
      cen.comparator = pillValue(fields.censusComparatorInputs) || 'greater_than'
      cen.target = fields.censusTarget?.value || 'exact_number'
      cen.targetFilter = fields.censusTargetFilter?.value || 'any'
      cen.targetFilterMode = fields.censusTargetFilterMode?.checked ? 'exclude' : 'include'
      cen.targetTotal = Number(fields.censusTargetTotal?.value || 0)
      this.applyCensusCompatibilityRules()
    }

    this.render()
  }

  buildPayload() {
    if (this.state.mode === 'census') {
      const cen = this.state.census
      const payload = {
        version: 2,
        kind: 'census',
        subject: cen.left.subject,
        subjectFilter: cen.left.filter,
        operator: cen.operator,
        comparator: cen.comparator
      }
      if (cen.left.filter !== 'any') {
        payload.subjectFilterMode = cen.left.filterMode
      }
      if (cen.scope === 'region') {
        payload.positionAxis = cen.positionAxis
        payload.positionComparator = cen.positionAxis === 'square' ? 'equal_to' : cen.positionComparator
        payload.positionTarget = this.resolvedPositionTarget(cen)
      }
      payload.target = cen.target
      if (cen.target === 'exact_number') {
        payload.targetTotal = cen.targetTotal
      } else if (this.censusTargetUsesActor()) {
        payload.targetFilter = cen.targetFilter
        if (cen.targetFilter !== 'any') {
          payload.targetFilterMode = cen.targetFilterMode
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

    if (this.leftUsesAggregateValue() && rel.right.comparisonMetric === 'aggregate_value') {
      rel.right.comparisonMetric = 'count'
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

  leftUsesAggregateValue() {
    const rel = this.state.relational
    return this.state.mode === 'relational' && rel.ui.leftComparisonOpen && rel.left.comparisonMetric === 'aggregate_value'
  }

  rightUsesAggregateValue() {
    const rel = this.state.relational
    return this.state.mode === 'relational' && rel.ui.rightComparisonOpen && rel.right.comparisonMetric === 'aggregate_value'
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

  allowedCensusOperatorsForSubject(subject) {
    if (['captured_piece', 'enemy_captured_piece'].includes(subject)) {
      return ['count', 'value']
    } else {
      return ['count', 'mobility', 'value']
    }
  }

  censusSubjectsForScope() {
    const census = this.grammarRules.census || {}
    if (this.state.census.scope === 'region') {
      return census.regionSubjects || this.grammarRules.positionSubjects || ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece']
    }
    return census.wholeBoardSubjects || this.editorSubjects()
  }

  censusTargetUsesActor() {
    const cen = this.state.census
    return cen.advanced && !['exact_number', 'prior_board_state'].includes(cen.target)
  }

  allowedCensusTargetsForOperator(operator) {
    return [
      'exact_number',
      ...this.editorSubjects().filter(subject => this.allowedCensusOperatorsForSubject(subject).includes(operator)),
      'prior_board_state'
    ]
  }

  applyCensusCompatibilityRules() {
    const cen = this.state.census
    const allowedSubjects = this.censusSubjectsForScope()
    if (!allowedSubjects.includes(cen.left.subject)) {
      cen.left.subject = 'allied'
    }
    const allowedOperators = this.allowedCensusOperatorsForSubject(cen.left.subject)
    if (!allowedOperators.includes(cen.operator)) {
      cen.operator = 'count'
    }
    if (cen.scope === 'region' && cen.positionAxis === 'square') {
      cen.positionComparator = 'equal_to'
    }
    if (!cen.advanced) {
      cen.target = 'exact_number'
      cen.targetFilter = 'any'
      cen.targetFilterMode = 'include'
    } else {
      const allowedTargets = this.allowedCensusTargetsForOperator(cen.operator)
      if (!allowedTargets.includes(cen.target)) {
        cen.target = 'exact_number'
        cen.targetFilter = 'any'
        cen.targetFilterMode = 'include'
      }
    }
    this.applyFilterModeCompatibilityRules()
  }

  resolvedPositionTarget(pos) {
    if (pos.positionAxis === 'rank') { return pos.positionRankTarget }
    if (pos.positionAxis === 'file') { return pos.positionFileTarget }
    return (pos.positionSquareRank - 1) * 8 + (pos.positionSquareFile - 1)
  }

  disableCensusSubjectOptions(fields) {
    const allowed = this.censusSubjectsForScope()
    this.disableOptions(fields.censusSubject, this.editorSubjects().filter(v => !allowed.includes(v)))
  }

  disableCensusOperatorOptions(fields) {
    const allowed = this.allowedCensusOperatorsForSubject(this.state.census.left.subject)
    const all = Array.from(fields.censusOperator?.options || []).map(o => o.value)
    this.disableOptions(fields.censusOperator, all.filter(v => !allowed.includes(v)))
  }

  disableCensusTargetOptions(fields) {
    if (!fields.censusTarget) { return }
    const all = Array.from(fields.censusTarget.options).map(o => o.value)
    const allowed = this.allowedCensusTargetsForOperator(this.state.census.operator)
    this.disableOptions(fields.censusTarget, all.filter(v => !allowed.includes(v)))
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
      if (this.state.census.left.filter === 'any') {
        this.state.census.left.filterMode = 'include'
      }
      if (this.state.census.targetFilter === 'any') {
        this.state.census.targetFilterMode = 'include'
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

  allowedRelationalComparisonSourcesForMetric(metric) {
    if (metric === 'individual_value' || metric === 'aggregate_value') {
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

  disableRelationalComparisonMetricOptions(fields) {
    this.disableRelationalComparisonMetricOptionsForSide('left', fields.leftComparisonMetric)
    this.disableRelationalComparisonMetricOptionsForSide('right', fields.rightComparisonMetric)
  }

  disableRelationalComparisonMetricOptionsForSide(side, select) {
    const otherUsesAggregate = side === 'left' ? this.rightUsesAggregateValue() : this.leftUsesAggregateValue()
    this.disableOptions(select, otherUsesAggregate ? ['aggregate_value'] : [])
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
