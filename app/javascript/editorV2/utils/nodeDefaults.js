export const DEFAULT_CONDITION_DATA = Object.freeze({
  subject: 'moved_piece',
  specifier: 'any',
  relation: 'attacker_count',
  comparison: 'any',
  comparisonValue: null
})

export const DEFAULT_ACTION_DATA = Object.freeze({
  actionType: 'add',
  value: 1
})

export const CONDITION_DATA_KEYS = Object.freeze([
  'subject',
  'specifier',
  'relation',
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
  return Object.keys(data).length > 0 ? { ...data } : defaultNodeData(type)
}
