export const DEFAULT_CONDITION_DATA = Object.freeze({
  subject: 'moved_piece',
  subjectSpecifier: 'any',
  subjectSpecifierMode: 'include',
  relation: 'attacker',
  relationSpecifier: 'any',
  relationSpecifierMode: 'include',
  comparison: 'equal_to',
  comparisonValue: 1
})

export const DEFAULT_ACTION_DATA = Object.freeze({
  actionType: 'add',
  value: 1
})

export const DEFAULT_ORGANIZER_DATA = Object.freeze({
  title: 'Organizer',
  notes: ''
})

export const CONDITION_DATA_KEYS = Object.freeze([
  'subject',
  'subjectSpecifier',
  'subjectSpecifierMode',
  'relation',
  'relationSpecifier',
  'relationSpecifierMode',
  'comparison',
  'comparisonValue'
])

export const ACTION_DATA_KEYS = Object.freeze([
  'actionType',
  'value'
])

export const ORGANIZER_DATA_KEYS = Object.freeze([
  'title',
  'notes'
])

export function defaultNodeData(type) {
  switch (type) {
    case 'condition':
      return { ...DEFAULT_CONDITION_DATA }
    case 'action':
      return { ...DEFAULT_ACTION_DATA }
    case 'organizer':
      return { ...DEFAULT_ORGANIZER_DATA }
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
    case 'organizer':
      return { ...DEFAULT_ORGANIZER_DATA, ...data }
    default:
      return { ...data }
  }
}
