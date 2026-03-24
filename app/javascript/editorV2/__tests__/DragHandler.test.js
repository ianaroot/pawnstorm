import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import DragHandler from '../handlers/DragHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'
import Connection from '../models/Connection.js'

// Mock SyncManager
class MockSyncManager {
  constructor() {
    this.updateNodePosition = vi.fn().mockResolvedValue({})
    this.batchUpdatePositions = vi.fn().mockResolvedValue({})
  }
}

const DEFAULT_POINTER = { clientX: 50, clientY: 50 }
// helpers
function buildMouseEvent(overrides = {}) {
  return {
    button: 0,
    ...DEFAULT_POINTER,
    shiftKey: false,
    target: {
      classList: {
        contains: vi.fn(() => false)
      }
    },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides
  }
}

function addNode(store, { clientId, type = 'condition', x = 100, y = 100 }) {
  const node = new Node({
    clientId,
    type,
    position: { x, y }
  })
  store.addNode(node)
  return node
}

function addConnection(store, { clientId, sourceId, targetId }) {
  const connection = new Connection({ clientId, sourceId, targetId })
  store.addConnection(connection)
  return connection
}

const DEFAULT_VIEWPORT_BOUNDS = { left: 0, top: 0, right: 800, bottom: 600 }
function buildViewport() {
  return {
    screenToGraphPoint: vi.fn((x, y) => ({ x, y })),
    beginInteraction: vi.fn(),
    endInteraction: vi.fn(),
    container: {
      getBoundingClientRect: vi.fn(() => ({
        ...DEFAULT_VIEWPORT_BOUNDS
      })),
      scrollLeft: 0,
      scrollTop: 0
    }
  }
}

function buildElement(clientId = 'node-1') {
  return {
    addEventListener: vi.fn(),
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    },
    style: {},
    dataset: { clientId }
  }
}

describe('DragHandler', () => {
  let store
  let syncManager
  let dragHandler
  let mockElement
  let viewport

  beforeEach(() => {
    store = new Store()
    syncManager = new MockSyncManager()
    viewport = buildViewport()
     mockElement = buildElement()
    vi.spyOn(document, 'addEventListener').mockImplementation(() => {})
    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {})
    vi.spyOn(document, 'querySelector').mockImplementation(() => mockElement)

    //stub autopan animations
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1)
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
    
    
    dragHandler = new DragHandler(store, syncManager, viewport)
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('initializes with empty drag state', () => {
      expect(dragHandler.isDragging).toBe(false)
      expect(dragHandler.draggedClientId).toBe(null)
      expect(dragHandler.childOffsets.size).toBe(0)
      expect(dragHandler.shouldDragChildren).toBe(true)
    })
  })

  describe('handleMouseDown', () => {
    it('starts drag on root nodes', () => {
      addNode(store, { clientId: 'root', type: 'root', x: 0, y: 0 })

      const event = buildMouseEvent()
      dragHandler.handleMouseDown(event, 'root', mockElement)

      expect(dragHandler.isDragging).toBe(true)
    })

    it('does not start drag on right click', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const event = buildMouseEvent({ button: 2 })
      dragHandler.handleMouseDown(event, 'node-1', mockElement)

      expect(dragHandler.isDragging).toBe(false)
    })

    it('does not start drag on connector click', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const event = buildMouseEvent({ target: { classList: { contains: vi.fn(() => true) } } })
      dragHandler.handleMouseDown(event, 'node-1', mockElement)

      expect(dragHandler.isDragging).toBe(false)
    })

    it('initializes drag state for valid drag', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      
      const event = buildMouseEvent()
      dragHandler.handleMouseDown(event, 'node-1', mockElement)

      expect(dragHandler.isDragging).toBe(true)
      expect(dragHandler.draggedClientId).toBe('node-1')
      expect(dragHandler.startPosition).toEqual({ x: 100, y: 100 })
    })

    it('calculates child offsets when Shift NOT held', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      addConnection(store, { clientId: 'conn', sourceId: 'parent', targetId: 'child' })

      const event = buildMouseEvent()
      dragHandler.handleMouseDown(event, 'parent', mockElement)

      expect(dragHandler.shouldDragChildren).toBe(true)
      expect(dragHandler.childOffsets.has('child')).toBe(true)
      expect(dragHandler.childOffsets.get('child')).toEqual({
        dx: 100,
        dy: 50,
        startX: 200,
        startY: 150
      })
    })

    it('does NOT calculate child offsets when Shift held', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      addConnection(store, { clientId: 'conn', sourceId: 'parent', targetId: 'child' })

      const event = buildMouseEvent({ shiftKey: true })
      dragHandler.handleMouseDown(event, 'parent', mockElement)

      expect(dragHandler.shouldDragChildren).toBe(false)
      expect(dragHandler.childOffsets.size).toBe(0)
    })

    it('stores all descendants, not just direct children', () => {
      addNode(store, { clientId: 'root', type: 'root', x: 0, y: 0 })
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child1', type: 'action', x: 200, y: 100 })
      addNode(store, { clientId: 'grandchild', type: 'action', x: 300, y: 100 })
      addConnection(store, { clientId: 'c1', sourceId: 'root', targetId: 'parent' })
      addConnection(store, { clientId: 'c2', sourceId: 'parent', targetId: 'child1' })
      addConnection(store, { clientId: 'c3', sourceId: 'child1', targetId: 'grandchild' })
      
      const event = buildMouseEvent()
      dragHandler.handleMouseDown(event, 'parent', mockElement)

      expect(dragHandler.childOffsets.size).toBe(2)
      expect(dragHandler.childOffsets.has('child1')).toBe(true)
      expect(dragHandler.childOffsets.has('grandchild')).toBe(true)
    })
  })

  describe('cancelDrag', () => {
    it('clears drag state', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      dragHandler.handleMouseDown(startEvent, 'node-1', mockElement)

      dragHandler.cancelDrag()

      expect(dragHandler.isDragging).toBe(false)
      expect(dragHandler.draggedClientId).toBe(null)
      expect(dragHandler.startPosition).toBe(null)
    })
  })

  describe('isCurrentlyDragging', () => {
    it('returns drag state', () => {
      expect(dragHandler.isCurrentlyDragging()).toBe(false)

      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      dragHandler.handleMouseDown(startEvent, 'node-1', mockElement)

      expect(dragHandler.isCurrentlyDragging()).toBe(true)
    })
  })

  describe('getDraggedNodeId', () => {
    it('returns dragged node ID during drag', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
   
      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      dragHandler.handleMouseDown(startEvent, 'node-1', mockElement)

      expect(dragHandler.getDraggedNodeId()).toBe('node-1')
    })

    it('returns null when not dragging', () => {
      expect(dragHandler.getDraggedNodeId()).toBe(null)
    })
  })
})
