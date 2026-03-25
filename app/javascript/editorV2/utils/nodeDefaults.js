export const DEFAULT_CONDITION_DATA = Object.freeze({
  subject: 'moved_piece',
  specifier: 'any',
  relation: 'attacked_after_move',
  comparison: 'any',
  comparisonValue: 1
})

export const DEFAULT_ACTION_DATA = Object.freeze({
  actionType: 'add',
  value: 1
})

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
