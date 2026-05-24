import {
  disableOptions, showAllOptions, pillValue, setPillChecked
} from 'editorV2/panels/condition_form/dom_helpers'
import { censusMeasurePayload } from 'editorV2/panels/condition_form/census_payload'

const DEFAULT_CAPTURES_STATE = {
  subject: 'captured_piece',
  filter: 'any',
  filterMode: 'include',
  operator: 'exists',
  comparator: 'equal_to',
  target: 'exact_number',
  targetFilter: 'any',
  targetFilterMode: 'include',
  targetTotal: 1
}

const CAPTURES_SUBJECTS = ['captured_piece', 'enemy_captured_piece']
const MEASURE_OPERATORS = ['exists', 'does_not_exist', 'value']

// exists/does_not_exist → census count=1/count=0; value → census (no region keys);
// same_piece → identity.
export default class CapturesMode {
  constructor(grammarRules) {
    this.grammarRules = grammarRules
  }

  defaultState() {
    return structuredClone(DEFAULT_CAPTURES_STATE)
  }

  fromNodeData(nodeData) {
    if (nodeData.kind === 'identity') {
      return {
        ...structuredClone(DEFAULT_CAPTURES_STATE),
        operator: 'same_piece',
        subject: nodeData.subject || DEFAULT_CAPTURES_STATE.subject,
        target: nodeData.target || this.samePiecePartner(nodeData.subject),
        filter: nodeData.subjectFilter || 'any',
        filterMode: nodeData.subjectFilterMode || 'include'
      }
    }
    return {
      subject: nodeData.subject || DEFAULT_CAPTURES_STATE.subject,
      filter: nodeData.subjectFilter || 'any',
      filterMode: nodeData.subjectFilterMode || 'include',
      operator: this.censusOperator(nodeData),
      comparator: nodeData.comparator || 'equal_to',
      target: nodeData.target || 'exact_number',
      targetFilter: nodeData.targetFilter || 'any',
      targetFilterMode: nodeData.targetFilterMode || 'include',
      targetTotal: typeof nodeData.targetTotal === 'number' ? nodeData.targetTotal : 1
    }
  }

  readFields(cap, fields) {
    cap.subject = fields.capturesSubject?.value || DEFAULT_CAPTURES_STATE.subject
    cap.filterMode = fields.capturesFilterMode?.checked ? 'exclude' : 'include'
    cap.filter = fields.capturesFilter?.value || 'any'
    cap.operator = pillValue(fields.capturesOperatorInputs) || 'exists'
    cap.comparator = fields.capturesComparator?.value || 'equal_to'
    cap.target = fields.capturesTarget?.value || 'exact_number'
    cap.targetFilter = fields.capturesTargetFilter?.value || 'any'
    cap.targetFilterMode = fields.capturesTargetFilterMode?.checked ? 'exclude' : 'include'
    cap.targetTotal = Number(fields.capturesTargetTotal?.value || 0)
  }

  buildPayload(cap) {
    if (cap.operator === 'same_piece') {
      const payload = { version: 2, kind: 'identity', subject: cap.subject, target: cap.target }
      if (cap.filter !== 'any') {
        payload.subjectFilter = cap.filter
        payload.subjectFilterMode = cap.filterMode
      }
      return payload
    }
    if (cap.operator === 'exists' || cap.operator === 'does_not_exist') {
      return censusMeasurePayload({
        subject: cap.subject,
        subjectFilter: cap.filter,
        subjectFilterMode: cap.filterMode,
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: cap.operator === 'exists' ? 1 : 0
      })
    }
    return censusMeasurePayload({
      subject: cap.subject,
      subjectFilter: cap.filter,
      subjectFilterMode: cap.filterMode,
      operator: cap.operator,
      comparator: cap.comparator,
      target: cap.target,
      targetFilter: cap.targetFilter,
      targetFilterMode: cap.targetFilterMode,
      targetTotal: cap.targetTotal
    })
  }

  applyCompatibilityRules(cap) {
    if (!this.subjects().includes(cap.subject)) {
      cap.subject = DEFAULT_CAPTURES_STATE.subject
    }
    if (!this.allowedOperators(cap.subject).includes(cap.operator)) {
      cap.operator = 'exists'
    }
    if (cap.operator === 'same_piece') {
      cap.target = this.samePiecePartner(cap.subject)
    } else if (cap.operator === 'value' && !this.measureTargets().includes(cap.target)) {
      cap.target = 'exact_number'
      cap.targetFilter = 'any'
      cap.targetFilterMode = 'include'
    }
    if (cap.filter === 'any') { cap.filterMode = 'include' }
    if (cap.targetFilter === 'any') { cap.targetFilterMode = 'include' }
  }

  render(cap, fields) {
    const isSamePiece = cap.operator === 'same_piece'
    const isValue = cap.operator === 'value'
    const targetUsesActor = isValue && cap.target !== 'exact_number'
    const filterModeAvailable = cap.filter !== 'any'
    const targetFilterModeAvailable = targetUsesActor && cap.targetFilter !== 'any'

    if (fields.capturesSubject) fields.capturesSubject.value = cap.subject
    if (fields.capturesFilter) fields.capturesFilter.value = cap.filter
    if (fields.capturesFilterMode) fields.capturesFilterMode.checked = filterModeAvailable && cap.filterMode === 'exclude'
    setPillChecked(fields.capturesOperatorInputs, cap.operator)
    if (fields.capturesComparator) fields.capturesComparator.value = cap.comparator
    if (fields.capturesTarget) fields.capturesTarget.value = cap.target
    if (fields.capturesTargetTotal) fields.capturesTargetTotal.value = cap.targetTotal
    if (fields.capturesTargetFilter) fields.capturesTargetFilter.value = cap.targetFilter
    if (fields.capturesTargetFilterMode) fields.capturesTargetFilterMode.checked = targetFilterModeAvailable && cap.targetFilterMode === 'exclude'

    fields.capturesComparator?.classList.toggle('hidden', !isValue)
    fields.capturesTargetStack?.classList.toggle('hidden', !(isValue || isSamePiece))
    fields.capturesTargetTotal?.classList.toggle('hidden', !(isValue && cap.target === 'exact_number'))
    fields.capturesTargetFilterRow?.classList.toggle('hidden', !targetUsesActor)
    fields.capturesFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !filterModeAvailable)
    fields.capturesTargetFilterModeControl?.classList.toggle('condition-form-checkbox--unavailable', !targetFilterModeAvailable)
    fields.capturesEnemyNote?.classList.toggle('hidden', cap.subject !== 'enemy_captured_piece')

    this.disableOperatorOptions(cap, fields)
    this.disableTargetOptions(cap, fields)
  }

  disableOperatorOptions(cap, fields) {
    const allowed = this.allowedOperators(cap.subject)
    fields.capturesOperatorInputs?.forEach(input => {
      input.disabled = !allowed.includes(input.value)
    })
  }

  disableTargetOptions(cap, fields) {
    if (!fields.capturesTarget) { return }
    showAllOptions(fields.capturesTarget)
    const all = Array.from(fields.capturesTarget.options).map(o => o.value)
    const allowed = cap.operator === 'same_piece' ? [this.samePiecePartner(cap.subject)] : this.measureTargets()
    disableOptions(fields.capturesTarget, all.filter(v => !allowed.includes(v)))
  }

  censusOperator(nodeData) {
    if (nodeData.operator === 'value') { return 'value' }
    return nodeData.targetTotal === 0 ? 'does_not_exist' : 'exists'
  }

  subjects() {
    return this.grammarRules.capturesSubjects || CAPTURES_SUBJECTS
  }

  allowedOperators(subject) {
    return this.canSamePiece(subject) ? [...MEASURE_OPERATORS, 'same_piece'] : [...MEASURE_OPERATORS]
  }

  measureTargets() {
    return ['exact_number', ...(this.grammarRules.editorSubjects || [])]
  }

  canSamePiece(subject) {
    return this.samePieceTargetsFor(subject).length > 0
  }

  samePiecePartner(subject) {
    return this.samePieceTargetsFor(subject)[0] || 'enemy_moved_piece'
  }

  samePieceTargetsFor(subject) {
    return (this.grammarRules.samePieceTargets || {})[subject] || []
  }
}
