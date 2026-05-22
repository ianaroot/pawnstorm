import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import ConnectionHandler from '../handlers/ConnectionHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'

function buildPointerEvent(overrides = {}) {
  return {
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    clientX: 50,
    clientY: 50,
    target: document.body,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides
  }
}

function buildNodeElement(clientId, connectorClass) {
  const node = document.createElement('div')
  node.className = 'node'
  node.dataset.clientId = clientId

  const connector = document.createElement('div')
  connector.className = `node-connector ${connectorClass}`
  connector.setPointerCapture = vi.fn()
  connector.releasePointerCapture = vi.fn()
  node.appendChild(connector)

  document.body.appendChild(node)
  return { node, connector }
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

describe('ConnectionHandler', () => {
  let store
  let syncManager
  let viewport
  let connectionHandler
  let source
  let target
  let originalElementFromPoint

  beforeEach(() => {
    document.body.innerHTML = '<svg id="connections-canvas"></svg>'
    store = new Store()
    syncManager = {
      createConnection: vi.fn().mockResolvedValue({}),
      deleteConnection: vi.fn().mockResolvedValue({})
    }
    viewport = {
      screenToGraphPoint: vi.fn((x, y) => ({ x, y })),
      getElementCenterGraphPoint: vi.fn(() => ({ x: 10, y: 20 }))
    }

    addNode(store, { clientId: 'source', type: 'condition' })
    addNode(store, { clientId: 'target', type: 'score' })

    source = buildNodeElement('source', 'output')
    target = buildNodeElement('target', 'input')

    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')
    originalElementFromPoint = document.elementFromPoint
    document.elementFromPoint = vi.fn(() => target.connector)

    connectionHandler = new ConnectionHandler(store, syncManager, null, viewport)
  })

  afterEach(() => {
    connectionHandler?.destroy()
    vi.restoreAllMocks()
    if (originalElementFromPoint) {
      document.elementFromPoint = originalElementFromPoint
    } else {
      delete document.elementFromPoint
    }
    document.body.classList.remove('editor-space-pan-active')
    document.body.innerHTML = ''
  })

  it('starts a connection from an output connector with pointer events', () => {
    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )

    const tempLine = document.querySelector('.connection-temp-line')

    expect(connectionHandler.isCurrentlyConnecting()).toBe(true)
    expect(document.body.classList.contains('connection-drag-active')).toBe(true)
    expect(source.node.classList.contains('connecting-source')).toBe(true)
    expect(source.connector.setPointerCapture).toHaveBeenCalledWith(1)
    expect(document.addEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(document.addEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function))
    expect(document.addEventListener).toHaveBeenCalledWith('pointercancel', expect.any(Function))
    expect(tempLine).not.toBe(null)
    expect(tempLine.style.pointerEvents).toBe('none')
  })

  it('does not start a connection while space-pan mode is active', () => {
    document.body.classList.add('editor-space-pan-active')

    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )

    expect(connectionHandler.isCurrentlyConnecting()).toBe(false)
    expect(document.body.classList.contains('connection-drag-active')).toBe(false)
    expect(source.connector.setPointerCapture).not.toHaveBeenCalled()
    expect(document.querySelector('.connection-temp-line')).toBe(null)
  })

  it('updates the temporary connection line as the pointer moves', () => {
    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )

    connectionHandler.handlePointerMove(buildPointerEvent({ clientX: 150, clientY: 160 }))

    const tempLine = document.querySelector('.connection-temp-line')
    expect(tempLine.getAttribute('x2')).toBe('150')
    expect(tempLine.getAttribute('y2')).toBe('160')
  })

  it('creates a connection based on the element under the release point', () => {
    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector, pointerType: 'touch', button: undefined }),
      'source',
      source.connector
    )

    connectionHandler.handlePointerUp(
      buildPointerEvent({
        clientX: 200,
        clientY: 200,
        pointerType: 'touch',
        button: undefined,
        target: source.connector
      })
    )

    expect(document.elementFromPoint).toHaveBeenCalledWith(200, 200)
    expect(syncManager.createConnection).toHaveBeenCalledWith('source', 'target')
    expect(connectionHandler.isCurrentlyConnecting()).toBe(false)
    expect(document.body.classList.contains('connection-drag-active')).toBe(false)
    expect(source.node.classList.contains('connecting-source')).toBe(false)
    expect(document.querySelector('.connection-temp-line')).toBe(null)
    expect(source.connector.releasePointerCapture).toHaveBeenCalledWith(1)
  })

  it('creates a connection when released on the node body rather than directly on the input connector', () => {
    document.elementFromPoint.mockReturnValue(target.node)

    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )
    connectionHandler.handlePointerUp(buildPointerEvent({ clientX: 200, clientY: 200 }))

    expect(syncManager.createConnection).toHaveBeenCalledWith('source', 'target')
  })

  it('does not create a connection when released away from an input connector', () => {
    document.elementFromPoint.mockReturnValue(document.body)

    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )
    connectionHandler.handlePointerUp(buildPointerEvent())

    expect(syncManager.createConnection).not.toHaveBeenCalled()
    expect(connectionHandler.isCurrentlyConnecting()).toBe(false)
    expect(document.body.classList.contains('connection-drag-active')).toBe(false)
  })

  it('cleans up without creating a connection on pointer cancel', () => {
    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )

    connectionHandler.handlePointerCancel(buildPointerEvent())

    expect(syncManager.createConnection).not.toHaveBeenCalled()
    expect(connectionHandler.isCurrentlyConnecting()).toBe(false)
    expect(document.body.classList.contains('connection-drag-active')).toBe(false)
    expect(source.node.classList.contains('connecting-source')).toBe(false)
    expect(document.querySelector('.connection-temp-line')).toBe(null)
  })

  it('resets an existing connection drag before starting another one', () => {
    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector, pointerId: 1 }),
      'source',
      source.connector
    )

    const firstTempLine = document.querySelector('.connection-temp-line')

    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector, pointerId: 2 }),
      'source',
      source.connector
    )

    expect(firstTempLine.isConnected).toBe(false)
    expect(document.querySelectorAll('.connection-temp-line')).toHaveLength(1)
    expect(source.connector.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(source.connector.setPointerCapture).toHaveBeenCalledWith(2)
  })

  it('keeps input connectors inactive until a connection drag begins', () => {
    expect(document.body.classList.contains('connection-drag-active')).toBe(false)

    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )

    expect(document.body.classList.contains('connection-drag-active')).toBe(true)

    connectionHandler.cancelConnection()

    expect(document.body.classList.contains('connection-drag-active')).toBe(false)
  })

  it('ignores release events when no active pointer is tracked', () => {
    connectionHandler.handlePointerUp(buildPointerEvent())

    expect(syncManager.createConnection).not.toHaveBeenCalled()
    expect(connectionHandler.isCurrentlyConnecting()).toBe(false)
  })

  it('does not throw when pointer capture was already released during cleanup', () => {
    source.connector.releasePointerCapture = vi.fn(() => {
      throw new Error('capture already released')
    })

    connectionHandler.startConnection(
      buildPointerEvent({ target: source.connector }),
      'source',
      source.connector
    )

    expect(() => connectionHandler.cancelConnection()).not.toThrow()
  })
})
