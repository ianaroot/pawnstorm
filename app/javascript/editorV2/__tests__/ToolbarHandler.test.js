import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ToolbarHandler from '../handlers/ToolbarHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'

function buildViewport() {
  return {
    getVisibleCanvasCenter: vi.fn(() => ({ x: 400, y: 300 }))
  }
}

function addNode(store, { clientId, type, x, y }) {
  store.addNode(new Node({ clientId, type, position: { x, y } }))
}

describe('ToolbarHandler', () => {
  let store
  let history
  let syncManager
  let viewport
  let toolbarHandler

  beforeEach(() => {
    document.body.innerHTML = '<div class="bot-editor"></div>'
    store = new Store()
    history = { canUndo: () => false, canRedo: () => false }
    syncManager = { setPersistedMutationCallback: vi.fn() }
    viewport = buildViewport()
    toolbarHandler = new ToolbarHandler(store, history, syncManager, document.createElement('div'), null, viewport)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('places add-node inserts near the recent placement anchor', () => {
    store.setRecentPlacementAnchor({ x: 500, y: 400 })

    expect(toolbarHandler.findPlacementPosition('condition')).toEqual({ x: 450, y: 336 })
  })

  it('falls back to the visible canvas center when no anchor exists', () => {
    expect(toolbarHandler.findPlacementPosition('action')).toEqual({ x: 346, y: 246 })
  })

  it('searches around the recent anchor when the direct placement is blocked', () => {
    store.setRecentPlacementAnchor({ x: 500, y: 400 })
    addNode(store, { clientId: 'blocker', type: 'condition', x: 450, y: 336 })

    const position = toolbarHandler.findPlacementPosition('condition')

    expect(position).not.toEqual({ x: 450, y: 336 })
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeGreaterThanOrEqual(0)
  })
})
