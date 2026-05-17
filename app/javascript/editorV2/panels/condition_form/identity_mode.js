import { disableOptions, showAllOptions } from 'editorV2/panels/condition_form/dom_helpers'

const DEFAULT_IDENTITY_STATE = {
  subject: 'enemy_moved_piece',
  target: 'captured_piece'
}

// Identity condition mode: a same-piece pairing of subject and target.
export default class IdentityMode {
  constructor(grammarRules) {
    this.grammarRules = grammarRules
  }

  defaultState() {
    return structuredClone(DEFAULT_IDENTITY_STATE)
  }

  fromNodeData(nodeData) {
    return {
      subject: nodeData.subject || DEFAULT_IDENTITY_STATE.subject,
      target: nodeData.target || DEFAULT_IDENTITY_STATE.target
    }
  }

  readFields(id, fields) {
    id.subject = fields.identitySubject?.value || DEFAULT_IDENTITY_STATE.subject
    id.target = fields.identityTarget?.value || DEFAULT_IDENTITY_STATE.target
  }

  applyCompatibilityRules(id) {
    const allowedSubjects = Object.keys(this.grammarRules.samePieceTargets)
    if (!allowedSubjects.includes(id.subject)) {
      id.subject = allowedSubjects[0]
    }
    const allowedTargets = this.samePieceTargetsFor(id.subject)
    if (!allowedTargets.includes(id.target)) {
      id.target = allowedTargets[0]
    }
  }

  buildPayload(id) {
    return {
      version: 2,
      kind: 'identity',
      subject: id.subject,
      target: id.target
    }
  }

  render(id, fields) {
    if (fields.identitySubject) fields.identitySubject.value = id.subject
    if (fields.identityTarget) {
      fields.identityTarget.value = id.target
      const allowed = this.samePieceTargetsFor(id.subject)
      showAllOptions(fields.identityTarget)
      disableOptions(
        fields.identityTarget,
        Array.from(fields.identityTarget.options).map(o => o.value).filter(v => !allowed.includes(v))
      )
    }
  }

  samePieceTargetsFor(subject) {
    return this.grammarRules.samePieceTargets[subject] || []
  }
}
