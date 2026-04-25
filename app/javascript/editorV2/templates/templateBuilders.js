import { DEFAULT_ACTION_DATA, DEFAULT_ORGANIZER_DATA } from 'editorV2/utils/nodeDefaults'

export function organizerNode(title, notes = '') {
  return {
    key: 'organizer',
    type: 'organizer',
    position: { x: 0, y: 0 },
    data: { ...DEFAULT_ORGANIZER_DATA, title, notes }
  }
}

export function conditionNode(key, x, y, data) {
  return {
    key,
    type: 'condition',
    position: { x, y },
    data: { ...data }
  }
}

export function actionNode(key, x, y, data) {
  return {
    key,
    type: 'score',
    position: { x, y },
    data: { ...DEFAULT_ACTION_DATA, ...data }
  }
}
