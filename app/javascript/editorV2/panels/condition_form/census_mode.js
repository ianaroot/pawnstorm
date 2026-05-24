import {
  disableOptions, showAllOptions, pillValue, setPillChecked
} from 'editorV2/panels/condition_form/dom_helpers'
import { censusMeasurePayload } from 'editorV2/panels/condition_form/census_payload'

const DEFAULT_CENSUS_STATE = {
  left: {
    subject: 'allied',
    filter: 'any',
    filterMode: 'include'
  },
  scope: 'region',
  regionAxis: 'rank',
  regionComparator: 'equal_to',
  regionRankTarget: 1,
  regionFileTarget: 1,
  regionSquareFile: 1,
  regionSquareRank: 1,
  advanced: false,
  operator: 'count',
  comparator: 'greater_than',
  target: 'exact_number',
  targetFilter: 'any',
  targetFilterMode: 'include',
  targetTotal: 0
}

// Census condition mode. Internal state uses region* names; the wire/payload
// keeps positionAxis/positionComparator/positionTarget — fromNodeData and
// buildPayload are the only translation points (wire rename deferred).
export default class CensusMode {
  constructor(grammarRules) {
    this.grammarRules = grammarRules
  }

  defaultState() {
    return structuredClone(DEFAULT_CENSUS_STATE)
  }

  fromNodeData(nodeData) {
    const hasRegion = nodeData.positionAxis != null
    const isSquare = nodeData.positionAxis === 'square'
    const squareFile = isSquare ? ((nodeData.positionTarget % 8) + 1) : 1
    const squareRank = isSquare ? (Math.floor(nodeData.positionTarget / 8) + 1) : 1
    return {
      left: {
        subject: nodeData.subject || 'allied',
        filter: nodeData.subjectFilter || 'any',
        filterMode: nodeData.subjectFilterMode || 'include'
      },
      scope: hasRegion ? 'region' : 'whole',
      regionAxis: nodeData.positionAxis || 'rank',
      regionComparator: nodeData.positionComparator || 'equal_to',
      regionRankTarget: nodeData.positionAxis === 'rank' ? (nodeData.positionTarget || 1) : 1,
      regionFileTarget: nodeData.positionAxis === 'file' ? (nodeData.positionTarget || 1) : 1,
      regionSquareFile: squareFile,
      regionSquareRank: squareRank,
      advanced: Boolean(nodeData.target) && nodeData.target !== 'exact_number',
      operator: nodeData.operator || 'count',
      comparator: nodeData.comparator || 'greater_than',
      target: nodeData.target || 'exact_number',
      targetFilter: nodeData.targetFilter || 'any',
      targetFilterMode: nodeData.targetFilterMode || 'include',
      targetTotal: typeof nodeData.targetTotal === 'number' ? nodeData.targetTotal : 0
    }
  }

  readFields(cen, fields) {
    cen.left.subject = fields.censusSubject?.value || 'allied'
    cen.left.filterMode = fields.censusFilterMode?.checked ? 'exclude' : 'include'
    cen.left.filter = fields.censusFilter?.value || 'any'
    if (fields.censusScopeWhole?.checked) {
      cen.scope = 'whole'
    } else if (fields.censusAxisFile?.checked) {
      cen.scope = 'region'
      cen.regionAxis = 'file'
    } else if (fields.censusAxisSquare?.checked) {
      cen.scope = 'region'
      cen.regionAxis = 'square'
    } else {
      cen.scope = 'region'
      cen.regionAxis = 'rank'
    }
    cen.regionComparator = pillValue(fields.censusRegionComparatorInputs) || 'equal_to'
    cen.regionRankTarget = Number(pillValue(fields.censusRankInputs) || 1)
    cen.regionFileTarget = Number(pillValue(fields.censusFileInputs) || 1)
    cen.regionSquareFile = Number(pillValue(fields.censusSquareFileInputs) || 1)
    cen.regionSquareRank = Number(pillValue(fields.censusSquareRankInputs) || 1)
    cen.operator = pillValue(fields.censusOperatorInputs) || 'count'
    cen.comparator = fields.censusComparator?.value || 'greater_than'
    cen.target = fields.censusTarget?.value || 'exact_number'
    cen.targetFilter = fields.censusTargetFilter?.value || 'any'
    cen.targetFilterMode = fields.censusTargetFilterMode?.checked ? 'exclude' : 'include'
    cen.targetTotal = Number(fields.censusTargetTotal?.value || 0)
  }

  buildPayload(cen) {
    const payload = censusMeasurePayload({
      subject: cen.left.subject,
      subjectFilter: cen.left.filter,
      subjectFilterMode: cen.left.filterMode,
      operator: cen.operator,
      comparator: cen.comparator,
      target: cen.target,
      targetFilter: cen.targetFilter,
      targetFilterMode: cen.targetFilterMode,
      targetTotal: cen.targetTotal
    })
    if (cen.scope === 'region') {
      payload.positionAxis = cen.regionAxis
      payload.positionComparator = cen.regionAxis === 'square' ? 'equal_to' : cen.regionComparator
      payload.positionTarget = this.resolvedRegionTarget(cen)
    }
    return payload
  }

  toggleAdvanced(cen) {
    cen.advanced = !cen.advanced
  }

  render(cen, fields) {
    const region = cen.scope === 'region'
    const isSquare = region && cen.regionAxis === 'square'
    const filterModeAvailable = cen.left.filter !== 'any'
    const targetUsesActor = this.targetUsesActor(cen)
    const targetFilterModeAvailable = targetUsesActor && cen.targetFilter !== 'any'

    if (fields.censusSubject) fields.censusSubject.value = cen.left.subject
    if (fields.censusFilterMode) fields.censusFilterMode.checked = filterModeAvailable && cen.left.filterMode === 'exclude'
    if (fields.censusFilter) fields.censusFilter.value = cen.left.filter
    if (fields.censusScopeWhole) fields.censusScopeWhole.checked = !region
    if (fields.censusAxisRank) fields.censusAxisRank.checked = region && cen.regionAxis === 'rank'
    if (fields.censusAxisFile) fields.censusAxisFile.checked = region && cen.regionAxis === 'file'
    if (fields.censusAxisSquare) fields.censusAxisSquare.checked = region && cen.regionAxis === 'square'
    fields.censusRegionComparatorInputs?.forEach(input => {
      input.checked = input.value === cen.regionComparator
      input.disabled = isSquare && input.value !== 'equal_to'
    })
    setPillChecked(fields.censusRankInputs, cen.regionRankTarget, true)
    setPillChecked(fields.censusFileInputs, cen.regionFileTarget, true)
    setPillChecked(fields.censusSquareFileInputs, cen.regionSquareFile, true)
    setPillChecked(fields.censusSquareRankInputs, cen.regionSquareRank, true)
    setPillChecked(fields.censusOperatorInputs, cen.operator)
    if (fields.censusComparator) fields.censusComparator.value = cen.comparator
    if (fields.censusTarget) fields.censusTarget.value = cen.target
    if (fields.censusTargetTotal) fields.censusTargetTotal.value = cen.targetTotal
    if (fields.censusTargetFilter) fields.censusTargetFilter.value = cen.targetFilter
    if (fields.censusTargetFilterMode) fields.censusTargetFilterMode.checked = targetFilterModeAvailable && cen.targetFilterMode === 'exclude'

    fields.censusRegionComparator?.classList.toggle('hidden', !region)
    fields.censusRegionComparator?.classList.toggle('condition-form-comparator-toggle--locked', isSquare)
    fields.censusRegionTarget?.classList.toggle('hidden', false)
    fields.censusRankInput?.classList.toggle('hidden', !region || isSquare || cen.regionAxis === 'file')
    fields.censusRankNote?.classList.toggle('hidden', !region || isSquare || cen.regionAxis === 'file')
    fields.censusFileInput?.classList.toggle('hidden', !region || isSquare || cen.regionAxis === 'rank')
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

    showAllOptions(fields.censusSubject)
    showAllOptions(fields.censusTarget)
    this.disableSubjectOptions(cen, fields)
    this.disableOperatorOptions(cen, fields)
    this.disableTargetOptions(cen, fields)
  }

  applyCompatibilityRules(cen) {
    const allowedSubjects = this.subjectsForScope(cen)
    if (!allowedSubjects.includes(cen.left.subject)) {
      cen.left.subject = 'allied'
    }
    const allowedOperators = this.allowedOperatorsForSubject(cen.left.subject)
    if (!allowedOperators.includes(cen.operator)) {
      cen.operator = 'count'
    }
    if (cen.scope === 'region' && cen.regionAxis === 'square') {
      cen.regionComparator = 'equal_to'
    }
    if (!cen.advanced) {
      cen.target = 'exact_number'
      cen.targetFilter = 'any'
      cen.targetFilterMode = 'include'
    } else {
      const allowedTargets = this.allowedTargetsForOperator(cen.operator)
      if (!allowedTargets.includes(cen.target)) {
        cen.target = 'exact_number'
        cen.targetFilter = 'any'
        cen.targetFilterMode = 'include'
      }
    }
    this.applyFilterModeCompatibilityRules(cen)
  }

  applyFilterModeCompatibilityRules(cen) {
    if (cen.left.filter === 'any') { cen.left.filterMode = 'include' }
    if (cen.targetFilter === 'any') { cen.targetFilterMode = 'include' }
  }

  resolvedRegionTarget(cen) {
    if (cen.regionAxis === 'rank') { return cen.regionRankTarget }
    if (cen.regionAxis === 'file') { return cen.regionFileTarget }
    return (cen.regionSquareRank - 1) * 8 + (cen.regionSquareFile - 1)
  }

  allowedOperatorsForSubject(subject) {
    if (['captured_piece', 'enemy_captured_piece'].includes(subject)) {
      return ['count', 'value']
    } else {
      return ['count', 'mobility', 'value']
    }
  }

  subjectsForScope(cen) {
    const census = this.grammarRules.census || {}
    if (cen.scope === 'region') {
      return census.regionSubjects || this.grammarRules.positionSubjects || ['allied', 'enemy', 'moved_piece', 'enemy_moved_piece']
    }
    return census.wholeBoardSubjects || this.editorSubjects()
  }

  targetUsesActor(cen) {
    return cen.advanced && !['exact_number', 'prior_board_state'].includes(cen.target)
  }

  allowedTargetsForOperator(operator) {
    return [
      'exact_number',
      ...this.editorSubjects().filter(subject => this.allowedOperatorsForSubject(subject).includes(operator)),
      'prior_board_state'
    ]
  }

  disableSubjectOptions(cen, fields) {
    const allowed = this.subjectsForScope(cen)
    disableOptions(fields.censusSubject, this.editorSubjects().filter(v => !allowed.includes(v)))
  }

  disableOperatorOptions(cen, fields) {
    const allowed = this.allowedOperatorsForSubject(cen.left.subject)
    const all = Array.from(fields.censusOperator?.options || []).map(o => o.value)
    disableOptions(fields.censusOperator, all.filter(v => !allowed.includes(v)))
  }

  disableTargetOptions(cen, fields) {
    if (!fields.censusTarget) { return }
    const all = Array.from(fields.censusTarget.options).map(o => o.value)
    const allowed = this.allowedTargetsForOperator(cen.operator)
    disableOptions(fields.censusTarget, all.filter(v => !allowed.includes(v)))
  }

  editorSubjects() {
    return this.grammarRules.editorSubjects
  }
}
