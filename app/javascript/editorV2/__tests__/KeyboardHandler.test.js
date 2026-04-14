import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import KeyboardHandler from '../handlers/KeyboardHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'
import { findAnchoredNodePlacement } from '../utils/nodePlacement.js'

vi.mock('../utils/nodePlacement.js', () => ({
  findAnchoredNodePlacement: vi.fn(() => ({ x: 640, y: 480 }))
}))

describe('KeyboardHandler', () => {
  let store
  let history
  let syncManager
  let keyboardHandler

  beforeEach(() => {
    store = new Store()
    history = {
      canUndo: vi.fn(() => true),
      canRedo: vi.fn(() => true)
    }
    syncManager = {
      isUndoRedoPending: false,
      undo: vi.fn().mockResolvedValue({}),
      redo: vi.fn().mockResolvedValue({}),
      createNode: vi.fn().mockResolvedValue('copied-node')
    }
    store.addNode(new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } }))
    store.addNode(new Node({
      clientId: 'condition',
      type: 'condition',
      position: { x: 300, y: 300 },
      data: {
        nested: { value: 1 }
      }
    }))

    keyboardHandler = new KeyboardHandler(store, history, syncManager)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not copy when nothing, multiple nodes, or a root node is selected', () => {
    expect(keyboardHandler.copySelectedNode()).toBe(false)
    expect(keyboardHandler.clipboard).toBe(null)

    store.setSelectedNodeIds(['root', 'condition'])
    expect(keyboardHandler.copySelectedNode()).toBe(false)
    expect(keyboardHandler.clipboard).toBe(null)

    store.selectOnlyNode('root')
    expect(keyboardHandler.copySelectedNode()).toBe(false)
    expect(keyboardHandler.clipboard).toBe(null)
  })

  it('copies a single non-root node as a deep clone', () => {
    store.selectOnlyNode('condition')

    expect(keyboardHandler.copySelectedNode()).toBe(true)
    expect(keyboardHandler.clipboard).toEqual({
      type: 'condition',
      data: { nested: { value: 1 } },
      position: { x: 300, y: 300 }
    })

    keyboardHandler.clipboard.data.nested.value = 99

    expect(store.getNode('condition').data.nested.value).toBe(1)
  })

  it('pastes the copied node near the recent placement anchor and selects it', async () => {
    store.setSelectedNodeIds(['condition'])
    keyboardHandler.copySelectedNode()
    store.setRecentPlacementAnchor({ x: 680, y: 540 })

    await keyboardHandler.pasteCopiedNode()

    expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(
      store,
      'condition',
      { x: 680, y: 540 }
    )
    expect(syncManager.createNode).toHaveBeenCalledWith(
      'condition',
      { x: 640, y: 480 },
      { nested: { value: 1 } }
    )
    expect(store.getSelectedNodeIds()).toEqual(['copied-node'])
  })

  it('falls back to the copied node position when no recent anchor exists', async () => {
    store.selectOnlyNode('condition')
    keyboardHandler.copySelectedNode()

    await keyboardHandler.pasteCopiedNode()

    expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(
      store,
      'condition',
      { x: 300, y: 300 }
    )
  })

  it('ignores copy/paste shortcuts inside form fields and preserves undo/redo', () => {
    const inputTarget = { tagName: 'INPUT' }
    keyboardHandler.handleKeyDown({ target: inputTarget, ctrlKey: true, key: 'c', preventDefault: vi.fn() })
    keyboardHandler.handleKeyDown({ target: inputTarget, ctrlKey: true, key: 'v', preventDefault: vi.fn() })
    expect(keyboardHandler.clipboard).toBe(null)

    const editableTarget = { tagName: 'DIV', isContentEditable: true }
    keyboardHandler.handleKeyDown({ target: editableTarget, ctrlKey: true, key: 'c', preventDefault: vi.fn() })
    expect(keyboardHandler.clipboard).toBe(null)

    keyboardHandler.handleKeyDown({ target: document.body, ctrlKey: true, key: 'z', preventDefault: vi.fn() })
    keyboardHandler.handleKeyDown({ target: document.body, ctrlKey: true, shiftKey: true, key: 'z', preventDefault: vi.fn() })

    expect(syncManager.undo).toHaveBeenCalled()
    expect(syncManager.redo).toHaveBeenCalled()
  })
})
