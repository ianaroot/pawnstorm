import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import DragHandler from '../handlers/DragHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'
import Connection from '../models/Connection.js'
import { DRAG_START_THRESHOLD } from '../constants.js'

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
    altKey: false,
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

function beginDrag(dragHandler, clientId, element, startEvent, moveEvent = null) {
  const dragDelta = DRAG_START_THRESHOLD + 2
  const thresholdMove = moveEvent || buildMouseEvent({
    clientX: startEvent.clientX + dragDelta,
    clientY: startEvent.clientY + dragDelta,
    shiftKey: startEvent.shiftKey,
    altKey: startEvent.altKey
  })

  dragHandler.handleMouseDown(startEvent, clientId, element)
  dragHandler.handleMouseMove(thresholdMove)
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
      expect(dragHandler.dragOffsets.size).toBe(0)
      expect(dragHandler.draggedClientIds).toEqual([])
    })
  })

  describe('handleMouseDown', () => {
    it('starts drag on root nodes', () => {
      addNode(store, { clientId: 'root', type: 'root', x: 0, y: 0 })
      const event = buildMouseEvent()
      beginDrag(dragHandler, 'root', mockElement, event)

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
      beginDrag(dragHandler, 'node-1', mockElement, event)

      expect(dragHandler.isDragging).toBe(true)
      expect(dragHandler.draggedClientId).toBe('node-1')
      expect(dragHandler.startPosition).toEqual({ x: 100, y: 100 })
    })

    it('calls beginInteraction on valid drag start', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
      const event = buildMouseEvent()
      beginDrag(dragHandler, 'node-1', mockElement, event)

      expect(viewport.beginInteraction).toHaveBeenCalledTimes(1)
    })


    it('selects an unselected node and prepares a drag including descendants by default', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      addConnection(store, { clientId: 'conn', sourceId: 'parent', targetId: 'child' })

      const event = buildMouseEvent()
      beginDrag(dragHandler, 'parent', mockElement, event)

      expect(store.getSelectedNodeIds()).toEqual(['parent'])
      expect(dragHandler.draggedClientIds).toEqual(['parent', 'child'])
      expect(dragHandler.dragOffsets.get('child')).toEqual({
        dx: 100,
        dy: 50,
        startX: 200,
        startY: 150
      })
    })

    it('shift-drag adds an unselected node to the current drag selection', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      store.selectOnlyNode('child')

      const event = buildMouseEvent({ shiftKey: true })
      beginDrag(dragHandler, 'parent', mockElement, event)

      expect(store.getSelectedNodeIds()).toEqual(['child', 'parent'])
      expect(dragHandler.draggedClientIds).toEqual(['child', 'parent'])
      expect(dragHandler.dragOffsets.get('child')).toEqual({
        dx: 100,
        dy: 50,
        startX: 200,
        startY: 150
      })
    })

    it('option-drag moves only the grabbed node', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      store.setSelectedNodeIds(['parent', 'child'])

      const event = buildMouseEvent({ altKey: true })
      beginDrag(dragHandler, 'parent', mockElement, event)

      expect(dragHandler.draggedClientIds).toEqual(['parent'])
      expect(dragHandler.dragOffsets.size).toBe(0)
    })
  })

  describe('handleMouseUp', () => {
    it('calls endInteraction when drag ends', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildMouseEvent()
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      const endEvent = buildMouseEvent()
      dragHandler.handleMouseUp(endEvent)

      expect(viewport.endInteraction).toHaveBeenCalledTimes(1)
    })

    it('calls updateNodePosition for single-node drag', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      const moveEvent = buildMouseEvent({ clientX: 150, clientY: 160 })
      const endEvent = buildMouseEvent({ clientX: 150, clientY: 160 })

      beginDrag(dragHandler, 'node-1', mockElement, startEvent)
      dragHandler.handleMouseMove(moveEvent)
      dragHandler.handleMouseUp(endEvent)

      expect(syncManager.updateNodePosition).toHaveBeenCalledTimes(1)
      expect(syncManager.batchUpdatePositions).not.toHaveBeenCalled()
    })

    it('calls batchUpdatePositions when dragging multiple selected nodes', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      store.setSelectedNodeIds(['parent', 'child'])

      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'parent', mockElement, startEvent)

      const moveEvent = buildMouseEvent({ clientX: 150, clientY: 160 })
      dragHandler.handleMouseMove(moveEvent)

      const endEvent = buildMouseEvent({ clientX: 150, clientY: 160 })
      dragHandler.handleMouseUp(endEvent)

      expect(syncManager.batchUpdatePositions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ clientId: 'parent', x: 150, y: 160 }),
          expect.objectContaining({ clientId: 'child', x: 250, y: 210 })
        ]),
        expect.stringContaining('Move')
      )
      expect(syncManager.updateNodePosition).not.toHaveBeenCalled()
    })

    it('calls batchUpdatePositions when dragging a singly selected node with descendants', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      addConnection(store, { clientId: 'conn', sourceId: 'parent', targetId: 'child' })

      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'parent', mockElement, startEvent)

      const moveEvent = buildMouseEvent({ clientX: 150, clientY: 160 })
      dragHandler.handleMouseMove(moveEvent)

      const endEvent = buildMouseEvent({ clientX: 150, clientY: 160 })
      dragHandler.handleMouseUp(endEvent)

      expect(syncManager.batchUpdatePositions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ clientId: 'parent', x: 150, y: 160 }),
          expect.objectContaining({ clientId: 'child', x: 250, y: 210 })
        ]),
        expect.stringContaining('Move')
      )
      expect(syncManager.updateNodePosition).not.toHaveBeenCalled()
    })

    it('calls updateNodePosition when option-dragging a node out of a selected group', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      store.setSelectedNodeIds(['parent', 'child'])

      const startEvent = buildMouseEvent({
        clientX: 100,
        clientY: 100,
        altKey: true
      })
      beginDrag(dragHandler, 'parent', mockElement, startEvent)

      const moveEvent = buildMouseEvent({ clientX: 150, clientY: 160 })
      dragHandler.handleMouseMove(moveEvent)

      const endEvent = buildMouseEvent({ clientX: 150, clientY: 160 })
      dragHandler.handleMouseUp(endEvent)

      expect(syncManager.updateNodePosition).toHaveBeenCalledWith('parent', 150, 160)
      expect(syncManager.batchUpdatePositions).not.toHaveBeenCalled()
      expect(store.getNode('child').position).toEqual({ x: 200, y: 150 })
    })

  })

  describe('cancelDrag', () => {
    it('clears drag state', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      dragHandler.cancelDrag()

      expect(dragHandler.isDragging).toBe(false)
      expect(dragHandler.draggedClientId).toBe(null)
      expect(dragHandler.startPosition).toBe(null)
    })

    it('calls endInteraction', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildMouseEvent()
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      dragHandler.cancelDrag()

      expect(viewport.endInteraction).toHaveBeenCalledTimes(1)
    })
  })

  describe('isCurrentlyDragging', () => {
    it('returns drag state', () => {
      expect(dragHandler.isCurrentlyDragging()).toBe(false)

      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      expect(dragHandler.isCurrentlyDragging()).toBe(true)
    })
  })

  describe('getDraggedNodeId', () => {
    it('returns dragged node ID during drag', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
   
      const startEvent = buildMouseEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      expect(dragHandler.getDraggedNodeId()).toBe('node-1')
    })

    it('returns null when not dragging', () => {
      expect(dragHandler.getDraggedNodeId()).toBe(null)
    })
  })
})
