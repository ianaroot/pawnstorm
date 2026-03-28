export const DEFAULT_CONDITION_DATA = Object.freeze({
  subject: 'moved_piece',
  subjectSpecifier: 'any',
  relation: 'attacker',
  relationSpecifier: 'any',
  comparison: 'equal_to',
  comparisonValue: 1
})

export const DEFAULT_ACTION_DATA = Object.freeze({
  actionType: 'add',
  value: 1
})

export const CONDITION_DATA_KEYS = Object.freeze([
  'subject',
  'subjectSpecifier',
  'relation',
  'relationSpecifier',
  'comparison',
  'comparisonValue'
])

export const ACTION_DATA_KEYS = Object.freeze([
  'actionType',
  'value'
])

export function defaultNodeData(type) {
  switch (type) {
    case 'condition':
      return { ...DEFAULT_CONDITION_DATA }
    case 'action':
      return { ...DEFAULT_ACTION_DATA }
    default:
      return {}
  }
}

export function normalizeNodeData(type, data = {}) {
  if (Object.keys(data).length === 0) {
    return defaultNodeData(type)
  }

  switch (type) {
    case 'condition':
      return { ...DEFAULT_CONDITION_DATA, ...data }
    case 'action':
      return { ...DEFAULT_ACTION_DATA, ...data }
    default:
      return { ...data }
  }
}
