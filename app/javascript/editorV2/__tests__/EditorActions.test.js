import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EditorActions from '../EditorActions.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'
import Connection from '../models/Connection.js'
import { findAnchoredNodePlacement } from '../utils/nodePlacement.js'

vi.mock('../utils/nodePlacement.js', () => ({
  findAnchoredNodePlacement: vi.fn(() => ({ x: 640, y: 480 }))
}))

describe('EditorActions', () => {
  const clipboardStorageKey = 'editorV2.nodeClipboard'
  let store
  let history
  let syncManager
  let editorActions
  let clickHandler

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
      deleteNodes: vi.fn().mockResolvedValue({}),
      updateNodeData: vi.fn().mockResolvedValue({}),
      createNode: vi.fn().mockResolvedValue({}),
      insertNodeSet: vi.fn().mockResolvedValue({ clientIds: ['pasted-1'] })
    }
    store.addNode(new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } }))
    store.addNode(new Node({
      clientId: 'condition',
      type: 'condition',
      position: { x: 300, y: 300 },
      data: { nested: { value: 1 } }
    }))

    clickHandler = {
      getDeletableSelectedNodeIds: vi.fn(() =>
        store.getSelectedNodeIds().filter(id => store.getNode(id)?.type !== 'root')
      ),
      getEditingNodeId: vi.fn(() => null),
      buildDataPayloadByType: vi.fn(() => null),
      closeEditor: vi.fn(),
      syncSelectionClasses: vi.fn(),
      conditionForm: null,
      editorPanel: null
    }

    editorActions = new EditorActions(store, history, syncManager)
    editorActions.clickHandler = clickHandler
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // ===== deleteSelected =====

  describe('deleteSelected', () => {
    it('does nothing when nothing is selected', async () => {
      await editorActions.deleteSelected()
      expect(syncManager.deleteNodes).not.toHaveBeenCalled()
    })

    it('calls syncManager.deleteNodes and clears selection', async () => {
      store.setSelectedNodeIds(['condition'])
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      await editorActions.deleteSelected()

      expect(syncManager.deleteNodes).toHaveBeenCalledWith(['condition'])
      expect(store.getSelectedNodeIds()).toEqual([])
    })

    it('cancels without deleting when confirm returns false', async () => {
      store.setSelectedNodeIds(['condition'])
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      await editorActions.deleteSelected()

      expect(syncManager.deleteNodes).not.toHaveBeenCalled()
    })

    it('closes the editor if the editing node is in the deleted set', async () => {
      store.setSelectedNodeIds(['condition'])
      clickHandler.getEditingNodeId.mockReturnValue('condition')
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      await editorActions.deleteSelected()

      expect(clickHandler.closeEditor).toHaveBeenCalled()
    })

    it('does not close the editor if the editing node is not in the deleted set', async () => {
      store.addNode(new Node({ clientId: 'score', type: 'score', position: { x: 400, y: 300 } }))
      store.setSelectedNodeIds(['score'])
      clickHandler.getEditingNodeId.mockReturnValue('condition')
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      await editorActions.deleteSelected()

      expect(clickHandler.closeEditor).not.toHaveBeenCalled()
    })
  })

  // ===== save =====

  describe('save', () => {
    it('does nothing when nothing is being edited', async () => {
      await editorActions.save()
      expect(syncManager.updateNodeData).not.toHaveBeenCalled()
    })

    it('calls syncManager.updateNodeData with the payload and closes the editor', async () => {
      clickHandler.getEditingNodeId.mockReturnValue('condition')
      clickHandler.buildDataPayloadByType.mockReturnValue({ kind: 'unary', subject: 'self' })

      await editorActions.save()

      expect(syncManager.updateNodeData).toHaveBeenCalledWith('condition', { kind: 'unary', subject: 'self' })
      expect(clickHandler.closeEditor).toHaveBeenCalled()
    })

    it('closes the editor without calling updateNodeData when payload is null', async () => {
      clickHandler.getEditingNodeId.mockReturnValue('condition')
      clickHandler.buildDataPayloadByType.mockReturnValue(null)

      await editorActions.save()

      expect(syncManager.updateNodeData).not.toHaveBeenCalled()
      expect(clickHandler.closeEditor).toHaveBeenCalled()
    })
  })

  // ===== addNode =====

  describe('addNode', () => {
    let viewport

    beforeEach(() => {
      viewport = {
        getVisibleCanvasCenter: vi.fn(() => ({ x: 400, y: 300 })),
        isGraphPointVisible: vi.fn(() => true)
      }
      editorActions.viewport = viewport
    })

    it('uses the recent placement anchor as origin when visible', async () => {
      store.setRecentPlacementAnchor({ x: 500, y: 400 })

      await editorActions.addNode('condition')

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(store, 'condition', { x: 500, y: 400 })
      expect(syncManager.createNode).toHaveBeenCalledWith('condition', { x: 640, y: 480 }, {})
    })

    it('falls back to the visible canvas center when no anchor exists', async () => {
      await editorActions.addNode('score')

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(store, 'score', { x: 400, y: 300 })
    })

    it('falls back to the visible canvas center when the recent anchor is outside the viewport', async () => {
      store.setRecentPlacementAnchor({ x: 900, y: 800 })
      viewport.isGraphPointVisible.mockReturnValue(false)

      await editorActions.addNode('condition')

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(store, 'condition', { x: 400, y: 300 })
    })

    it('falls back to { x: 200, y: 200 } when no viewport and no anchor', async () => {
      editorActions.viewport = null

      await editorActions.addNode('organizer')

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(store, 'organizer', { x: 200, y: 200 })
    })
  })

  // ===== copySelectedNodes =====

  describe('copySelectedNodes', () => {
    it('returns false when nothing is selected', () => {
      expect(editorActions.copySelectedNodes()).toBe(false)
      expect(editorActions.clipboard).toBe(null)
    })

    it('returns false when only root nodes are selected', () => {
      store.selectOnlyNode('root')
      expect(editorActions.copySelectedNodes()).toBe(false)
      expect(editorActions.clipboard).toBe(null)
    })

    it('copies a single non-root node with deep-cloned data', () => {
      store.selectOnlyNode('condition')

      expect(editorActions.copySelectedNodes()).toBe(true)
      expect(editorActions.clipboard.nodes).toHaveLength(1)
      expect(editorActions.clipboard.nodes[0].type).toBe('condition')
      expect(editorActions.clipboard.nodes[0].data).toEqual({ nested: { value: 1 } })
      expect(editorActions.clipboard.connections).toEqual([])
      expect(editorActions.clipboard.anchorPosition).toEqual({ x: 300, y: 300 })

      editorActions.clipboard.nodes[0].data.nested.value = 99
      expect(store.getNode('condition').data.nested.value).toBe(1)
    })

    it('persists copied nodes to local storage', () => {
      store.selectOnlyNode('condition')

      expect(editorActions.copySelectedNodes()).toBe(true)

      const storedPayload = JSON.parse(localStorage.getItem(clipboardStorageKey))
      expect(storedPayload.version).toBe(1)
      expect(storedPayload.clipboard.nodes).toHaveLength(1)
      expect(storedPayload.clipboard.nodes[0].type).toBe('condition')
      expect(storedPayload.clipboard.nodes[0].data).toEqual({ nested: { value: 1 } })
      expect(storedPayload.clipboard.anchorPosition).toEqual({ x: 300, y: 300 })
    })

    it('copies multiple non-root nodes and their internal connections', () => {
      store.addNode(new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 300 } }))
      store.addConnection(new Connection({ clientId: 'conn-1', sourceId: 'condition', targetId: 'score' }))

      store.setSelectedNodeIds(['condition', 'score'])
      expect(editorActions.copySelectedNodes()).toBe(true)

      expect(editorActions.clipboard.nodes).toHaveLength(2)
      expect(editorActions.clipboard.connections).toHaveLength(1)
      expect(editorActions.clipboard.connections[0].sourceIndex).toBe(0)
      expect(editorActions.clipboard.connections[0].targetIndex).toBe(1)
    })

    it('excludes connections to nodes outside the selection', () => {
      store.addNode(new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 300 } }))
      store.addConnection(new Connection({ clientId: 'conn-1', sourceId: 'condition', targetId: 'score' }))

      store.selectOnlyNode('condition')
      expect(editorActions.copySelectedNodes()).toBe(true)

      expect(editorActions.clipboard.nodes).toHaveLength(1)
      expect(editorActions.clipboard.connections).toHaveLength(0)
    })

    it('stores relative positions from the anchor node', () => {
      store.addNode(new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 350 } }))

      store.setSelectedNodeIds(['condition', 'score'])
      editorActions.copySelectedNodes()

      const nodes = editorActions.clipboard.nodes
      expect(nodes[0].relativeX).toBe(0)
      expect(nodes[0].relativeY).toBe(0)
      expect(nodes[1].relativeX).toBe(200)
      expect(nodes[1].relativeY).toBe(50)
    })

    it('keeps in-memory clipboard available when local storage writes fail', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage unavailable')
      })
      store.selectOnlyNode('condition')

      expect(editorActions.copySelectedNodes()).toBe(true)
      await editorActions.pasteCopiedNodes()

      expect(setItemSpy).toHaveBeenCalled()
      expect(syncManager.insertNodeSet).toHaveBeenCalledTimes(1)
    })
  })

  // ===== pasteCopiedNodes =====

  describe('pasteCopiedNodes', () => {
    it('pastes a single node near the recent placement anchor and selects it', async () => {
      syncManager.insertNodeSet.mockResolvedValue({ clientIds: ['pasted-1'] })

      store.setSelectedNodeIds(['condition'])
      editorActions.copySelectedNodes()
      store.setRecentPlacementAnchor({ x: 680, y: 540 })

      await editorActions.pasteCopiedNodes()

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(store, 'condition', { x: 680, y: 540 })
      const [nodeModels, connectionModels, description] = syncManager.insertNodeSet.mock.calls[0]
      expect(nodeModels).toHaveLength(1)
      expect(nodeModels[0].type).toBe('condition')
      expect(connectionModels).toHaveLength(0)
      expect(description).toBe('Paste nodes')
      expect(store.getSelectedNodeIds()).toEqual(['pasted-1'])
    })

    it('falls back to the clipboard anchor position when no recent anchor exists', async () => {
      store.selectOnlyNode('condition')
      editorActions.copySelectedNodes()

      await editorActions.pasteCopiedNodes()

      expect(vi.mocked(findAnchoredNodePlacement)).toHaveBeenCalledWith(store, 'condition', { x: 300, y: 300 })
    })

    it('pastes multiple nodes with connections', async () => {
      syncManager.insertNodeSet.mockResolvedValue({ clientIds: ['pasted-1', 'pasted-2'] })

      store.addNode(new Node({ clientId: 'score', type: 'score', position: { x: 500, y: 350 } }))
      store.addConnection(new Connection({ clientId: 'conn-1', sourceId: 'condition', targetId: 'score' }))

      store.setSelectedNodeIds(['condition', 'score'])
      editorActions.copySelectedNodes()
      store.setRecentPlacementAnchor({ x: 680, y: 540 })

      await editorActions.pasteCopiedNodes()

      const [nodeModels, connectionModels] = syncManager.insertNodeSet.mock.calls[0]
      expect(nodeModels).toHaveLength(2)
      expect(connectionModels).toHaveLength(1)
      expect(store.getSelectedNodeIds()).toEqual(['pasted-1', 'pasted-2'])
    })

    it('does nothing when clipboard is empty', async () => {
      await editorActions.pasteCopiedNodes()
      expect(syncManager.insertNodeSet).not.toHaveBeenCalled()
    })

    it('hydrates persisted clipboard for a new EditorActions instance', async () => {
      store.selectOnlyNode('condition')
      editorActions.copySelectedNodes()
      const hydratedActions = new EditorActions(store, history, syncManager)

      await hydratedActions.pasteCopiedNodes()

      expect(syncManager.insertNodeSet).toHaveBeenCalledTimes(1)
      const [nodeModels] = syncManager.insertNodeSet.mock.calls[0]
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

      const hydratedActions = new EditorActions(store, history, syncManager)

      expect(hydratedActions.clipboard).toBe(null)
      expect(localStorage.getItem(clipboardStorageKey)).toBe(null)
      await hydratedActions.pasteCopiedNodes()
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

      const hydratedActions = new EditorActions(store, history, syncManager)

      expect(hydratedActions.clipboard).toBe(null)
      expect(localStorage.getItem(clipboardStorageKey)).toBe(null)
    })
  })

  // ===== renderSelectionPreview =====

  describe('renderSelectionPreview', () => {
    let boardStatePreview
    let editorPanel

    beforeEach(() => {
      editorPanel = document.createElement('div')
      editorPanel.classList.add('hidden')
      clickHandler.editorPanel = editorPanel
      boardStatePreview = {
        activate: vi.fn(),
        deactivate: vi.fn(),
        showSelectionPreview: vi.fn(),
        isEnabled: false,
        mode: 'idle'
      }
      editorActions.boardStatePreview = boardStatePreview
    })

    it('shows a ready preview for a linear condition chain', () => {
      vi.useFakeTimers()
      const conditionB = new Node({
        clientId: 'condition-b',
        type: 'condition',
        position: { x: 160, y: 100 },
        data: {
          version: 2, kind: 'relational',
          subject: 'allied', subjectFilter: 'any',
          operator: 'defend', target: 'allied', targetFilter: 'any'
        }
      })
      store.addNode(conditionB)
      store.addConnection(new Connection({ sourceId: 'condition', targetId: conditionB.clientId }))
      store.updateNode('condition', {
        data: {
          version: 2, kind: 'relational',
          subject: 'allied', subjectFilter: 'any',
          operator: 'defend', target: 'allied', targetFilter: 'pawn'
        }
      })

      store.setSelectedNodeIds(['condition', conditionB.clientId])
      editorActions.renderSelectionPreview()
      vi.runAllTimers()
      vi.useRealTimers()

      expect(boardStatePreview.showSelectionPreview).toHaveBeenCalled()
      const preview = boardStatePreview.showSelectionPreview.mock.calls.at(-1)[0]
      expect(preview.status).toBe('ready')
      expect(editorPanel.classList.contains('hidden')).toBe(false)
    })

    it('shows unsupported for a branching condition set', () => {
      const conditionB = new Node({
        clientId: 'condition-b',
        type: 'condition',
        position: { x: 160, y: 100 },
        data: {
          version: 2, kind: 'relational',
          subject: 'allied', subjectFilter: 'any',
          operator: 'defend', target: 'allied', targetFilter: 'pawn'
        }
      })
      const conditionC = new Node({
        clientId: 'condition-c',
        type: 'condition',
        position: { x: 220, y: 140 },
        data: {
          version: 2, kind: 'relational',
          subject: 'allied', subjectFilter: 'any',
          operator: 'defend', target: 'allied', targetFilter: 'any'
        }
      })
      store.updateNode('condition', {
        data: {
          version: 2, kind: 'relational',
          subject: 'allied', subjectFilter: 'any',
          operator: 'attack', target: 'enemy', targetFilter: 'any'
        }
      })
      store.addNode(conditionB)
      store.addNode(conditionC)
      store.addConnection(new Connection({ sourceId: 'condition', targetId: conditionB.clientId }))
      store.addConnection(new Connection({ sourceId: 'condition', targetId: conditionC.clientId }))

      store.setSelectedNodeIds(['condition', conditionB.clientId, conditionC.clientId])
      editorActions.renderSelectionPreview()

      const preview = boardStatePreview.showSelectionPreview.mock.calls.at(-1)[0]
      expect(preview.status).toBe('unsupported')
      expect(preview.reason).toBe("OR branches aren't supported in condition chain previews yet.")
    })
  })
})
