const DEFAULT_STATE = Object.freeze({
  kind: 'relational',
  left: {
    subject: 'allied',
    filter: 'any',
    filterMode: 'include',
    comparisonMetric: '',
    comparator: 'equal_to',
    comparisonValueSource: 'exact_number',
    comparisonValueNumber: 1
  },
  verb: 'attack',
  right: {
    subject: 'enemy',
    filter: 'any',
    filterMode: 'include',
    comparisonMetric: '',
    comparator: 'equal_to',
    comparisonValueSource: 'exact_number',
    comparisonValueNumber: 1
  },
  unary: {
    comparator: 'greater_than',
    comparisonValueSource: 'exact_number',
    comparisonValueNumber: 0
  },
  ui: {
    leftComparisonOpen: false,
    rightComparisonOpen: false,
    legacyNotice: false
  }
})

class ConditionForm {
  constructor(editorPanel) {
    this.editorPanel = editorPanel
    this.state = structuredClone(DEFAULT_STATE)
    this.boundHandleFieldChange = this.handleFieldChange.bind(this)
    this.boundHandleLeftComparisonToggle = this.toggleLeftComparison.bind(this)
    this.boundHandleRightComparisonToggle = this.toggleRightComparison.bind(this)
  }

  attach() {
    this.fields().all.forEach(field => field?.addEventListener('change', this.boundHandleFieldChange))
    this.fields().numberInputs.forEach(field => field?.addEventListener('input', this.boundHandleFieldChange))
    this.fields().leftComparisonToggle?.addEventListener('click', this.boundHandleLeftComparisonToggle)
    this.fields().rightComparisonToggle?.addEventListener('click', this.boundHandleRightComparisonToggle)
  }

  detach() {
    this.fields().all.forEach(field => field?.removeEventListener('change', this.boundHandleFieldChange))
    this.fields().numberInputs.forEach(field => field?.removeEventListener('input', this.boundHandleFieldChange))
    this.fields().leftComparisonToggle?.removeEventListener('click', this.boundHandleLeftComparisonToggle)
    this.fields().rightComparisonToggle?.removeEventListener('click', this.boundHandleRightComparisonToggle)
  }

  fields() {
    const leftSubject = this.editorPanel.querySelector('#cond-left-subject')
    const leftFilterMode = this.editorPanel.querySelector('#cond-left-filter-mode')
    const leftFilter = this.editorPanel.querySelector('#cond-left-filter')
    const leftComparisonMetric = this.editorPanel.querySelector('#cond-left-comparison-metric')
    const leftComparator = this.editorPanel.querySelector('#cond-left-comparator')
    const leftComparisonValueSource = this.editorPanel.querySelector('#cond-left-comparison-value-source')
    const leftComparisonValueNumber = this.editorPanel.querySelector('#cond-left-comparison-value-number')
    const verb = this.editorPanel.querySelector('#cond-verb')
    const rightSubject = this.editorPanel.querySelector('#cond-right-subject')
    const rightFilterMode = this.editorPanel.querySelector('#cond-right-filter-mode')
    const rightFilter = this.editorPanel.querySelector('#cond-right-filter')
    const rightComparisonMetric = this.editorPanel.querySelector('#cond-right-comparison-metric')
    const rightComparator = this.editorPanel.querySelector('#cond-right-comparator')
    const rightComparisonValueSource = this.editorPanel.querySelector('#cond-right-comparison-value-source')
    const rightComparisonValueNumber = this.editorPanel.querySelector('#cond-right-comparison-value-number')
    const unaryComparator = this.editorPanel.querySelector('#cond-unary-comparator')
    const unaryComparisonValueSource = this.editorPanel.querySelector('#cond-unary-comparison-value-source')
    const unaryComparisonValueNumber = this.editorPanel.querySelector('#cond-unary-comparison-value-number')

    return {
      leftSubject,
      leftFilterMode,
      leftFilter,
      leftComparisonMetric,
      leftComparator,
      leftComparisonValueSource,
      leftComparisonValueNumber,
      verb,
      rightSubject,
      rightFilterMode,
      rightFilter,
      rightComparisonMetric,
      rightComparator,
      rightComparisonValueSource,
      rightComparisonValueNumber,
      unaryComparator,
      unaryComparisonValueSource,
      unaryComparisonValueNumber,
      leftComparisonToggle: this.editorPanel.querySelector('#cond-left-comparison-toggle'),
      leftComparisonBody: this.editorPanel.querySelector('#cond-left-comparison-body'),
      rightComparisonToggle: this.editorPanel.querySelector('#cond-right-comparison-toggle'),
      rightComparisonBody: this.editorPanel.querySelector('#cond-right-comparison-body'),
      rightCard: this.editorPanel.querySelector('#cond-right-card'),
      rightCardLabel: this.editorPanel.querySelector('#cond-right-card-label'),
      rightRelationalFields: this.editorPanel.querySelector('#cond-right-relational-fields'),
      unaryComparisonSection: this.editorPanel.querySelector('#cond-unary-comparison-section'),
      leftComparisonSection: this.editorPanel.querySelector('#cond-left-comparison-section'),
      leftFilterRow: this.editorPanel.querySelector('#cond-left-filter-row'),
      rightFilterRow: this.editorPanel.querySelector('#cond-right-filter-row'),
      legacyNote: this.editorPanel.querySelector('#condition-legacy-note'),
      formulationPreview: this.editorPanel.querySelector('#cond-formulation-preview'),
      all: [
        leftSubject, leftFilterMode, leftFilter, leftComparisonMetric, leftComparator, leftComparisonValueSource,
        verb,
        rightSubject, rightFilterMode, rightFilter, rightComparisonMetric, rightComparator, rightComparisonValueSource,
        unaryComparator, unaryComparisonValueSource
      ],
      numberInputs: [
        leftComparisonValueNumber,
        rightComparisonValueNumber,
        unaryComparisonValueNumber
      ]
    }
  }

  populate(nodeData = {}) {
    if (this.isValidV2Node(nodeData)) {
      this.state = this.stateFromNodeData(nodeData)
    } else {
      this.state = structuredClone(DEFAULT_STATE)
      this.state.ui.legacyNotice = true
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
          comparisonValueSource: 'exact_number',
          comparisonValueNumber: 1
        },
        verb: nodeData.verb || 'count',
        right: {
          subject: 'enemy',
          filter: 'any',
          filterMode: 'include',
          comparisonMetric: '',
          comparator: 'equal_to',
          comparisonValueSource: 'exact_number',
          comparisonValueNumber: 1
        },
        unary: this.unaryStateFromNodeData(nodeData),
        ui: {
          leftComparisonOpen: false,
          rightComparisonOpen: false,
          legacyNotice: false
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
          comparisonValue: nodeData.subjectComparisonValue
        }),
        verb: nodeData.verb || 'attack',
        right: this.relationalSideState({
          subject: nodeData.target,
          filter: nodeData.targetFilter,
          filterMode: nodeData.targetFilterMode,
          comparisonMetric: nodeData.targetComparisonMetric,
          comparator: nodeData.targetComparator,
          comparisonValue: nodeData.targetComparisonValue
        }),
        unary: {
          comparator: 'greater_than',
          comparisonValueSource: 'exact_number',
          comparisonValueNumber: 0
        },
        ui: {
          leftComparisonOpen: Boolean(nodeData.subjectComparisonMetric),
          rightComparisonOpen: Boolean(nodeData.targetComparisonMetric),
          legacyNotice: false
        }
      }
    }
  }
  
  relationalSideState({ subject, filter, filterMode, comparisonMetric, comparator, comparisonValue }) {
    return {
      subject: subject || 'allied',
      filter: filter || 'any',
      filterMode: filterMode || 'include',
      comparisonMetric: comparisonMetric || '',
      comparator: comparator || 'equal_to',
      comparisonValueSource: typeof comparisonValue === 'number' ? 'exact_number' : (comparisonValue || 'exact_number'),
      comparisonValueNumber: typeof comparisonValue === 'number' ? comparisonValue : 1
    }
  }

  unaryStateFromNodeData(nodeData) {
    const comparisonValue = nodeData.comparisonValue
    return {
      comparator: nodeData.comparator || 'greater_than',
      comparisonValueSource: typeof comparisonValue === 'number' ? 'exact_number' : (comparisonValue || 'exact_number'),
      comparisonValueNumber: typeof comparisonValue === 'number' ? comparisonValue : 0
    }
  }

  render() {
    const fields = this.fields()

    if (fields.leftSubject) fields.leftSubject.value = this.state.left.subject
    if (fields.leftFilterMode) fields.leftFilterMode.checked = this.state.left.filterMode === 'exclude'
    if (fields.leftFilter) fields.leftFilter.value = this.state.left.filter
    if (fields.leftComparisonMetric) fields.leftComparisonMetric.value = this.state.left.comparisonMetric || 'count'
    if (fields.leftComparator) fields.leftComparator.value = this.state.left.comparator
    if (fields.leftComparisonValueSource) fields.leftComparisonValueSource.value = this.state.left.comparisonValueSource
    if (fields.leftComparisonValueNumber) fields.leftComparisonValueNumber.value = this.state.left.comparisonValueNumber

    if (fields.verb) fields.verb.value = this.state.verb

    if (fields.rightSubject) fields.rightSubject.value = this.state.right.subject
    if (fields.rightFilterMode) fields.rightFilterMode.checked = this.state.right.filterMode === 'exclude'
    if (fields.rightFilter) fields.rightFilter.value = this.state.right.filter
    if (fields.rightComparisonMetric) fields.rightComparisonMetric.value = this.state.right.comparisonMetric || 'count'
    if (fields.rightComparator) fields.rightComparator.value = this.state.right.comparator
    if (fields.rightComparisonValueSource) fields.rightComparisonValueSource.value = this.state.right.comparisonValueSource
    if (fields.rightComparisonValueNumber) fields.rightComparisonValueNumber.value = this.state.right.comparisonValueNumber

    if (fields.unaryComparator) fields.unaryComparator.value = this.state.unary.comparator
    if (fields.unaryComparisonValueSource) fields.unaryComparisonValueSource.value = this.state.unary.comparisonValueSource
    if (fields.unaryComparisonValueNumber) fields.unaryComparisonValueNumber.value = this.state.unary.comparisonValueNumber

    if (fields.legacyNote) {
      fields.legacyNote.textContent = this.state.ui.legacyNotice
        ? 'Legacy V1 condition node. Preview remains unchanged until you save. Saving will replace this node with a V2 condition.'
        : ''
      fields.legacyNote.classList.toggle('hidden', !this.state.ui.legacyNotice)
    }

    if (fields.formulationPreview) {
      fields.formulationPreview.textContent = this.state.kind === 'relational'
        ? `${this.state.left.subject} : ${this.state.verb} : ${this.state.right.subject}`
        : `${this.state.left.subject} : ${this.state.verb} : ${this.state.unary.comparator}`
    }
    fields.rightCardLabel.textContent = this.state.kind === 'relational' ? 'Target' : 'Comparison'
    fields.rightRelationalFields.classList.toggle('hidden', this.state.kind !== 'relational')
    fields.unaryComparisonSection.classList.toggle('hidden', this.state.kind === 'relational')
    fields.leftComparisonBody.classList.toggle('hidden', !this.state.ui.leftComparisonOpen)
    fields.rightComparisonBody.classList.toggle('hidden', !this.state.ui.rightComparisonOpen || this.state.kind !== 'relational')

    fields.leftComparisonToggle.textContent = this.state.ui.leftComparisonOpen ? 'Hide comparison' : '+ comparison'
    fields.rightComparisonToggle.textContent = this.state.ui.rightComparisonOpen ? 'Hide comparison' : '+ comparison'
  }

  toggleLeftComparison() {
    if (this.state.kind !== 'relational') { return }

    if (!this.state.ui.leftComparisonOpen && !this.state.left.comparisonMetric) {
      this.state.left.comparisonMetric = 'count'
      this.state.left.comparator = 'equal_to'
      this.state.left.comparisonValueSource = 'exact_number'
      this.state.left.comparisonValueNumber ||= 1
    }

    this.state.ui.leftComparisonOpen = !this.state.ui.leftComparisonOpen
    this.render()
  }

  toggleRightComparison() {
    if (this.state.kind !== 'relational') { return }

    if (!this.state.ui.rightComparisonOpen && !this.state.right.comparisonMetric) {
      this.state.right.comparisonMetric = 'count'
      this.state.right.comparator = 'equal_to'
      this.state.right.comparisonValueSource = 'exact_number'
      this.state.right.comparisonValueNumber ||= 1
    }

    this.state.ui.rightComparisonOpen = !this.state.ui.rightComparisonOpen
    this.render()
  }

  handleFieldChange() {
    const fields = this.fields()
    const relationalVerb = ['attack', 'defend', 'cover', 'shield', 'adjacent', 'same_piece'].includes(fields.verb?.value)

    if (relationalVerb) {
      this.state.kind = 'relational'
      this.state.left.subject = fields.leftSubject?.value || 'allied'
      this.state.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
      this.state.left.filter = fields.leftFilter?.value || 'any'
      this.state.left.comparisonMetric = fields.leftComparisonMetric?.value || ''
      this.state.left.comparator = fields.leftComparator?.value || 'equal_to'
      this.state.left.comparisonValueSource = fields.leftComparisonValueSource?.value || 'exact_number'
      this.state.left.comparisonValueNumber = Number(fields.leftComparisonValueNumber?.value || 1)

      this.state.verb = fields.verb?.value || 'attack'

      this.state.right.subject = fields.rightSubject?.value || 'enemy'
      this.state.right.filterMode = fields.rightFilterMode?.checked ? 'exclude' : 'include'
      this.state.right.filter = fields.rightFilter?.value || 'any'
      this.state.right.comparisonMetric = fields.rightComparisonMetric?.value || ''
      this.state.right.comparator = fields.rightComparator?.value || 'equal_to'
      this.state.right.comparisonValueSource = fields.rightComparisonValueSource?.value || 'exact_number'
      this.state.right.comparisonValueNumber = Number(fields.rightComparisonValueNumber?.value || 1)
    } else {
      this.state.kind = 'unary'
      this.state.left.subject = fields.leftSubject?.value || 'allied'
      this.state.left.filterMode = fields.leftFilterMode?.checked ? 'exclude' : 'include'
      this.state.left.filter = fields.leftFilter?.value || 'any'
      this.state.verb = fields.verb?.value || 'count'
      this.state.unary.comparator = fields.unaryComparator?.value || 'greater_than'
      this.state.unary.comparisonValueSource = fields.unaryComparisonValueSource?.value || 'exact_number'
      this.state.unary.comparisonValueNumber = Number(fields.unaryComparisonValueNumber?.value || 0)
      this.state.ui.rightComparisonOpen = false
      this.state.ui.leftComparisonOpen = false
    }

    this.render()
  }

  buildPayload() {
    if (this.state.kind === 'unary') {
      return {
        version: 2,
        kind: 'unary',
        subject: this.state.left.subject,
        subjectFilter: this.state.left.filter,
        verb: this.state.verb,
        comparator: this.state.unary.comparator,
        comparisonValue: this.comparisonValuePayload(
          this.state.unary.comparisonValueSource,
          this.state.unary.comparisonValueNumber
        ),
        ...(this.state.left.filter !== 'any' ? { subjectFilterMode: this.state.left.filterMode } : {})
      }
    } else {
      const payload = {
        version: 2,
        kind: 'relational',
        subject: this.state.left.subject,
        subjectFilter: this.state.left.filter,
        verb: this.state.verb,
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
        payload.subjectComparisonValue = this.comparisonValuePayload(
          this.state.left.comparisonValueSource,
          this.state.left.comparisonValueNumber
        )
      }

      if (this.state.ui.rightComparisonOpen && this.state.right.comparisonMetric) {
        payload.targetComparisonMetric = this.state.right.comparisonMetric
        payload.targetComparator = this.state.right.comparator
        payload.targetComparisonValue = this.comparisonValuePayload(
          this.state.right.comparisonValueSource,
          this.state.right.comparisonValueNumber
        )
      }

      return payload
    }
  }

  comparisonValuePayload(source, number) {
    if (source === 'exact_number') {
      return number
    } else {
      return source
    }
  }
  
}

export default ConditionForm