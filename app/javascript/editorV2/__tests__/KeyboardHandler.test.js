import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import KeyboardHandler from '../handlers/KeyboardHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'
import Connection from '../models/Connection.js'
import { findAnchoredNodePlacement } from '../utils/nodePlacement.js'

vi.mock('../utils/nodePlacement.js', () => ({
  findAnchoredNodePlacement: vi.fn(() => ({ x: 640, y: 480 }))
}))

describe('KeyboardHandler', () => {
  const clipboardStorageKey = 'editorV2.nodeClipboard'
  let store
  let history
  let syncManager
  let keyboardHandler

  beforeEach(() => {
    localStorage.clear()
    store = new Store()
    history = {
      canUndo: vi.fn(() => true),
      canRedo: vi.fn(() => true)
    }
    syncManager = {
      isUndoRedoPending: false,
      undo: vi.fn().mockResolvedValue({}),
      redo: vi.fn().mockResolvedValue({}),
      insertNodeSet: vi.fn().mockResolvedValue({ clientIds: ['pasted-1'] })
    }
    store.addNode(new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } }))
    store.addNode(new Node({
      clientId: 'condition',
      type: 'condition',
      position: { x: 300, y: 300 },
      data: { nested: { value: 1 } }
    }))

    keyboardHandler = new KeyboardHandler(store, history, syncManager)
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('copySelectedNodes', () => {
    it('returns false when nothing is selected', () => {
      expect(keyboardHandler.copySelectedNodes()).toBe(false)
      expect(keyboardHandler.clipboard).toBe(null)
    })

    it('returns false when only root nodes are selected', () => {
      store.selectOnlyNode('root')
      expect(keyboardHandler.copySelectedNodes()).toBe(false)
      expect(keyboardHandler.clipboard).toBe(null)
    })

    it('copies a single non-root node with deep-cloned data', () => {
      store.selectOnlyNode('condition')

      expect(keyboardHandler.copySelectedNodes()).toBe(true)
      expect(keyboardHandler.clipboard.nodes).toHaveLength(1)
      expect(keyboardHandler.clipboard.nodes[0].type).toBe('condition')
      expect(keyboardHandler.clipboard.nodes[0].data).toEqual({ nested: { value: 1 } })
      expect(keyboardHandler.clipboard.connections).toEqual([])
      expect(keyboardHandler.clipboard.anchorPosition).toEqual({ x: 300, y: 300 })

      keyboardHandler.clipboard.nodes[0].data.nested.value = 99
      expect(store.getNode('condition').data.nested.value).toBe(1)
    })

    it('persists copied nodes to local storage', () => {
      store.selectOnlyNode('condition')

      expect(keyboardHandler.copySelectedNodes()).toBe(true)

      const storedPayload = JSON.parse(localStorage.getItem(clipboardStorageKey))
      expect(storedPayload.version).toBe(1)
      expect(storedPayload.clipboard.nodes).toHaveLength(1)
      expect(storedPayload.clipboard.nodes[0].type).toBe('condition')
      expect(storedPayload.clipboard.nodes[0].data).toEqual({ nested: { value: 1 } })
      expect(storedPayload.clipboard.anchorPosition).toEqual({ x: 300, y: 300 })
    })

    it('copies multiple non-root nodes and their internal connections', () => {
      const node2 = new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 300 } })
      store.addNode(node2)
      store.addConnection(new Connection({ clientId: 'conn-1', sourceId: 'condition', targetId: 'score' }))

      store.setSelectedNodeIds(['condition', 'score'])
      expect(keyboardHandler.copySelectedNodes()).toBe(true)

      expect(keyboardHandler.clipboard.nodes).toHaveLength(2)
      expect(keyboardHandler.clipboard.connections).toHaveLength(1)
      expect(keyboardHandler.clipboard.connections[0].sourceIndex).toBe(0)
      expect(keyboardHandler.clipboard.connections[0].targetIndex).toBe(1)
    })

    it('excludes connections to nodes outside the selection', () => {
      const node2 = new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 300 } })
      store.addNode(node2)
      store.addConnection(new Connection({ clientId: 'conn-1', sourceId: 'condition', targetId: 'score' }))

      store.selectOnlyNode('condition')
      expect(keyboardHandler.copySelectedNodes()).toBe(true)

      expect(keyboardHandler.clipboard.nodes).toHaveLength(1)
      expect(keyboardHandler.clipboard.connections).toHaveLength(0)
    })

    it('stores relative positions from the anchor node', () => {
      const node2 = new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 350 } })
      store.addNode(node2)

      store.setSelectedNodeIds(['condition', 'score'])
      keyboardHandler.copySelectedNodes()

      const nodes = keyboardHandler.clipboard.nodes
      expect(nodes[0].relativeX).toBe(0)
      expect(nodes[0].relativeY).toBe(0)
      expect(nodes[1].relativeX).toBe(200)
      expect(nodes[1].relativeY).toBe(50)
    })
  })

  describe('pasteCopiedNodes', () => {
    it('pastes a single node near the recent placement anchor and selects it', async () => {
      syncManager.insertNodeSet.mockResolvedValue({ clientIds: ['pasted-1'] })

      store.setSelectedNodeIds(['condition'])
      keyboardHandler.copySelectedNodes()
      store.setRecentPlacementAnchor({ x: 680, y: 540 })

      await keyboardHandler.pasteCopiedNodes()

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(
        store,
        'condition',
        { x: 680, y: 540 }
      )
      expect(syncManager.insertNodeSet).toHaveBeenCalledTimes(1)
      const [nodeModels, connectionModels, description] = syncManager.insertNodeSet.mock.calls[0]
      expect(nodeModels).toHaveLength(1)
      expect(nodeModels[0].type).toBe('condition')
      expect(connectionModels).toHaveLength(0)
      expect(description).toBe('Paste nodes')
      expect(store.getSelectedNodeIds()).toEqual(['pasted-1'])
    })

    it('falls back to the clipboard anchor position when no recent anchor exists', async () => {
      store.selectOnlyNode('condition')
      keyboardHandler.copySelectedNodes()

      await keyboardHandler.pasteCopiedNodes()

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(
        store,
        'condition',
        { x: 300, y: 300 }
      )
    })

    it('pastes multiple nodes with connections', async () => {
      syncManager.insertNodeSet.mockResolvedValue({ clientIds: ['pasted-1', 'pasted-2'] })

      const node2 = new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 350 } })
      store.addNode(node2)
      store.addConnection(new Connection({ clientId: 'conn-1', sourceId: 'condition', targetId: 'score' }))

      store.setSelectedNodeIds(['condition', 'score'])
      keyboardHandler.copySelectedNodes()
      store.setRecentPlacementAnchor({ x: 680, y: 540 })

      await keyboardHandler.pasteCopiedNodes()

      const [nodeModels, connectionModels] = syncManager.insertNodeSet.mock.calls[0]
      expect(nodeModels).toHaveLength(2)
      expect(connectionModels).toHaveLength(1)
      expect(store.getSelectedNodeIds()).toEqual(['pasted-1', 'pasted-2'])
    })

    it('does nothing when clipboard is empty', async () => {
      await keyboardHandler.pasteCopiedNodes()

      expect(syncManager.insertNodeSet).not.toHaveBeenCalled()
    })

    it('hydrates persisted clipboard for a new handler instance', async () => {
      store.selectOnlyNode('condition')
      keyboardHandler.copySelectedNodes()
      const hydratedHandler = new KeyboardHandler(store, history, syncManager)

      await hydratedHandler.pasteCopiedNodes()

      expect(syncManager.insertNodeSet).toHaveBeenCalledTimes(1)
      const [nodeModels] = syncManager.insertNodeSet.mock.calls[0]
      expect(nodeModels).toHaveLength(1)
      expect(nodeModels[0].type).toBe('condition')
      expect(nodeModels[0].data).toEqual({ nested: { value: 1 } })
    })

    it('ignores and clears invalid persisted clipboard data', async () => {
      localStorage.setItem(clipboardStorageKey, JSON.stringify({
        version: 1,
        clipboard: {
          nodes: [{ type: 'condition', relativeX: 0, relativeY: 0 }],
          connections: [{ sourceIndex: 0, targetIndex: 3 }],
          anchorPosition: { x: 300, y: 300 }
        }
      }))

      const hydratedHandler = new KeyboardHandler(store, history, syncManager)

      expect(hydratedHandler.clipboard).toBe(null)
      expect(localStorage.getItem(clipboardStorageKey)).toBe(null)

      await hydratedHandler.pasteCopiedNodes()
      expect(syncManager.insertNodeSet).not.toHaveBeenCalled()
    })

    it('rejects root nodes from persisted clipboard data', async () => {
      localStorage.setItem(clipboardStorageKey, JSON.stringify({
        version: 1,
        clipboard: {
          nodes: [{ type: 'root', relativeX: 0, relativeY: 0 }],
          connections: [],
          anchorPosition: { x: 300, y: 300 }
        }
      }))

      const hydratedHandler = new KeyboardHandler(store, history, syncManager)

      expect(hydratedHandler.clipboard).toBe(null)
      expect(localStorage.getItem(clipboardStorageKey)).toBe(null)

      await hydratedHandler.pasteCopiedNodes()
      expect(syncManager.insertNodeSet).not.toHaveBeenCalled()
    })

    it('keeps in-memory clipboard available when local storage writes fail', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage unavailable')
      })
      store.selectOnlyNode('condition')

      expect(keyboardHandler.copySelectedNodes()).toBe(true)
      await keyboardHandler.pasteCopiedNodes()

      expect(setItemSpy).toHaveBeenCalled()
      expect(syncManager.insertNodeSet).toHaveBeenCalledTimes(1)
    })
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
