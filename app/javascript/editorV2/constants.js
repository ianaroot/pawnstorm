// constants.js
// Shared configuration and event names for editorV2

// Node dimensions
export const NODE_WIDTH = 100
export const NODE_HEIGHT = 60
export const CONNECTOR_SIZE = 14
export const NODE_DIMENSIONS = {
  root: { width: 100, height: 100 },
  condition: { width: 100, height: 128 },
  score: { width: 108, height: 108 },
  organizer: { width: 140, height: 112 },
  default: { width: NODE_WIDTH, height: NODE_HEIGHT }
}

// Connection styling
export const CONNECTION_COLOR = '#4CAF50'
export const CONNECTION_STROKE_WIDTH = 2
export const CONNECTION_HITAREA_WIDTH = 20
export const CONNECTION_HOVER_HITAREA_WIDTH = 44
export const CONNECTION_DELETE_BUTTON_SIZE = 26
export const CONNECTION_DELETE_BUTTON_MIN_SIZE = 26
export const CONNECTION_DELETE_BUTTON_MAX_SIZE = 44

// Temp line styling (during connection drag)
export const TEMP_LINE_COLOR = '#4CAF50'
export const TEMP_LINE_STROKE_WIDTH = 3
export const TEMP_LINE_STROKE_DASHARRAY = '5,5'

// History
export const MAX_HISTORY = 50

// Viewport / zoom behavior
export const ZOOM_DEFAULT = 0.6
export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 2
export const ZOOM_STEP = 0.1
export const VIEWPORT_PADDING = 200
export const FIT_PADDING = 120
export const DRAG_AUTOPAN_EDGE_THRESHOLD = 24
export const DRAG_AUTOPAN_SPEED = 1
export const DRAG_START_THRESHOLD = 4

// Node type colors (matching existing CSS)
export const NODE_COLORS = {
  root: '#FFD700',
  condition: '#e94560',
  score: '#4CAF50',
  organizer: '#3b82f6'
}

// Event names for Store subscriber pattern
// Use these constants to prevent typos and enable IDE autocomplete
export const EVENTS = {
  NODE_ADD: 'node:add',
  NODE_UPDATE: 'node:update',
  NODE_PERSISTED: 'node:persisted',
  NODE_REMOVE: 'node:remove',
  CONNECTION_ADD: 'connection:add',
  CONNECTION_UPDATE: 'connection:update',
  CONNECTION_REMOVE: 'connection:remove',
  SELECTION_CHANGE: 'selection:change',
  GRAPH_REPLACE: 'graph:replace',
  GRAPH_RESTORE: 'graph:restore'
}

// Default position for new nodes
export const DEFAULT_NODE_POSITION = { x: 100, y: 100 }
