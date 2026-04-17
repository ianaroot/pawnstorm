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
function buildPointerEvent(overrides = {}) {
  return {
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
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
  const thresholdMove = moveEvent || buildPointerEvent({
    clientX: startEvent.clientX + dragDelta,
    clientY: startEvent.clientY + dragDelta,
    shiftKey: startEvent.shiftKey,
    altKey: startEvent.altKey
  })

  dragHandler.handlePointerDown(startEvent, clientId, element)
  dragHandler.handlePointerMove(thresholdMove)
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
    vi.useRealTimers()
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

  describe('handlePointerDown', () => {
    it('starts drag on root nodes', () => {
      addNode(store, { clientId: 'root', type: 'root', x: 0, y: 0 })
      const event = buildPointerEvent()
      beginDrag(dragHandler, 'root', mockElement, event)

      expect(dragHandler.isDragging).toBe(true)
    })

    it('does not start drag on right click', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
      const event = buildPointerEvent({ button: 2 })
      dragHandler.handlePointerDown(event, 'node-1', mockElement)

      expect(dragHandler.isDragging).toBe(false)
    })

    it('does not start drag on connector click', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
      const event = buildPointerEvent({ target: { classList: { contains: vi.fn(() => true) } } })
      dragHandler.handlePointerDown(event, 'node-1', mockElement)

      expect(dragHandler.isDragging).toBe(false)
    })

    it('initializes drag state for valid drag', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
      const event = buildPointerEvent()
      beginDrag(dragHandler, 'node-1', mockElement, event)

      expect(dragHandler.isDragging).toBe(true)
      expect(dragHandler.draggedClientId).toBe('node-1')
      expect(dragHandler.startPosition).toEqual({ x: 100, y: 100 })
    })

    it('calls beginInteraction on valid drag start', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
      const event = buildPointerEvent()
      beginDrag(dragHandler, 'node-1', mockElement, event)

      expect(viewport.beginInteraction).toHaveBeenCalledTimes(1)
    })


    it('selects an unselected node and prepares a drag including descendants by default', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      addConnection(store, { clientId: 'conn', sourceId: 'parent', targetId: 'child' })

      const event = buildPointerEvent()
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

      const event = buildPointerEvent({ shiftKey: true })
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

      const event = buildPointerEvent({ altKey: true })
      beginDrag(dragHandler, 'parent', mockElement, event)

      expect(dragHandler.draggedClientIds).toEqual(['parent'])
      expect(dragHandler.dragOffsets.size).toBe(0)
    })

    it('treats touch long press as additive selection without starting drag', () => {
      vi.useFakeTimers()
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
      const suppressSpy = vi.spyOn(store, 'suppressClicksFor')

      const event = buildPointerEvent({ pointerType: 'touch', button: undefined })
      dragHandler.handlePointerDown(event, 'node-1', mockElement)
      vi.advanceTimersByTime(450)
      vi.advanceTimersByTime(1000)
      dragHandler.handlePointerUp(buildPointerEvent({ pointerType: 'touch', button: undefined }))

      expect(store.getSelectedNodeIds()).toEqual(['node-1'])
      expect(dragHandler.isDragging).toBe(false)
      expect(viewport.beginInteraction).not.toHaveBeenCalled()
      expect(suppressSpy).toHaveBeenCalledTimes(2)
    })

    it('cancels touch long press when movement crosses the drag threshold', () => {
      vi.useFakeTimers()
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildPointerEvent({
        clientX: 100,
        clientY: 100,
        pointerType: 'touch',
        button: undefined
      })
      const moveEvent = buildPointerEvent({
        clientX: 100 + DRAG_START_THRESHOLD + 2,
        clientY: 100,
        pointerType: 'touch',
        button: undefined
      })

      dragHandler.handlePointerDown(startEvent, 'node-1', mockElement)
      dragHandler.handlePointerMove(moveEvent)
      vi.advanceTimersByTime(450)

      expect(dragHandler.isDragging).toBe(true)
      expect(store.getSelectedNodeIds()).toEqual(['node-1'])
      expect(viewport.beginInteraction).toHaveBeenCalledTimes(1)
    })
  })

  describe('pointer lifecycle', () => {
    it('ignores move and release events when no active pointer is tracked', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      dragHandler.handlePointerMove(buildPointerEvent({ clientX: 150, clientY: 160 }))
      dragHandler.handlePointerUp(buildPointerEvent({ clientX: 150, clientY: 160 }))

      expect(viewport.beginInteraction).not.toHaveBeenCalled()
      expect(viewport.endInteraction).not.toHaveBeenCalled()
      expect(syncManager.updateNodePosition).not.toHaveBeenCalled()
      expect(syncManager.batchUpdatePositions).not.toHaveBeenCalled()
    })

    it('does not throw when pointer capture was already released during cleanup', () => {
      const element = buildElement()
      element.releasePointerCapture = vi.fn(() => {
        throw new Error('capture already released')
      })

      expect(() => {
        dragHandler.beginPointerTracking(buildPointerEvent(), element)
        dragHandler.endPointerTracking()
      }).not.toThrow()
    })
  })

  describe('handlePointerUp', () => {
    it('calls endInteraction when drag ends', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildPointerEvent()
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      const endEvent = buildPointerEvent()
      dragHandler.handlePointerUp(endEvent)

      expect(viewport.endInteraction).toHaveBeenCalledTimes(1)
    })

    it('calls updateNodePosition for single-node drag', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildPointerEvent({ clientX: 100, clientY: 100 })
      const moveEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      const endEvent = buildPointerEvent({ clientX: 150, clientY: 160 })

      beginDrag(dragHandler, 'node-1', mockElement, startEvent)
      dragHandler.handlePointerMove(moveEvent)
      dragHandler.handlePointerUp(endEvent)

      expect(syncManager.updateNodePosition).toHaveBeenCalledTimes(1)
      expect(syncManager.batchUpdatePositions).not.toHaveBeenCalled()
    })

    it('calls batchUpdatePositions when dragging multiple selected nodes', () => {
      addNode(store, { clientId: 'parent', type: 'condition', x: 100, y: 100 })
      addNode(store, { clientId: 'child', type: 'action', x: 200, y: 150 })
      store.setSelectedNodeIds(['parent', 'child'])

      const startEvent = buildPointerEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'parent', mockElement, startEvent)

      const moveEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      dragHandler.handlePointerMove(moveEvent)

      const endEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      dragHandler.handlePointerUp(endEvent)

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

      const startEvent = buildPointerEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'parent', mockElement, startEvent)

      const moveEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      dragHandler.handlePointerMove(moveEvent)

      const endEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      dragHandler.handlePointerUp(endEvent)

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

      const startEvent = buildPointerEvent({
        clientX: 100,
        clientY: 100,
        altKey: true
      })
      beginDrag(dragHandler, 'parent', mockElement, startEvent)

      const moveEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      dragHandler.handlePointerMove(moveEvent)

      const endEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      dragHandler.handlePointerUp(endEvent)

      expect(syncManager.updateNodePosition).toHaveBeenCalledWith('parent', 150, 160)
      expect(syncManager.batchUpdatePositions).not.toHaveBeenCalled()
      expect(store.getNode('child').position).toEqual({ x: 200, y: 150 })
    })

    it('updates the recent placement anchor after a successful single-node drag', async () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
      const anchorSpy = vi.spyOn(store, 'setRecentPlacementAnchor')

      const startEvent = buildPointerEvent({ clientX: 100, clientY: 100 })
      const moveEvent = buildPointerEvent({ clientX: 150, clientY: 160 })
      const endEvent = buildPointerEvent({ clientX: 150, clientY: 160 })

      beginDrag(dragHandler, 'node-1', mockElement, startEvent)
      dragHandler.handlePointerMove(moveEvent)
      dragHandler.handlePointerUp(endEvent)

      await vi.waitFor(() => {
        expect(anchorSpy).toHaveBeenCalledWith({ x: 150, y: 160 })
      })
    })

  })

  describe('cancelDrag', () => {
    it('clears drag state', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildPointerEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      dragHandler.cancelDrag()

      expect(dragHandler.isDragging).toBe(false)
      expect(dragHandler.draggedClientId).toBe(null)
      expect(dragHandler.startPosition).toBe(null)
    })

    it('calls endInteraction', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildPointerEvent()
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      dragHandler.cancelDrag()

      expect(viewport.endInteraction).toHaveBeenCalledTimes(1)
    })
  })

  describe('isCurrentlyDragging', () => {
    it('returns drag state', () => {
      expect(dragHandler.isCurrentlyDragging()).toBe(false)

      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })

      const startEvent = buildPointerEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      expect(dragHandler.isCurrentlyDragging()).toBe(true)
    })
  })

  describe('getDraggedNodeId', () => {
    it('returns dragged node ID during drag', () => {
      addNode(store, { clientId: 'node-1', type: 'condition', x: 100, y: 100 })
   
      const startEvent = buildPointerEvent({ clientX: 100, clientY: 100 })
      beginDrag(dragHandler, 'node-1', mockElement, startEvent)

      expect(dragHandler.getDraggedNodeId()).toBe('node-1')
    })

    it('returns null when not dragging', () => {
      expect(dragHandler.getDraggedNodeId()).toBe(null)
    })
  })
})
