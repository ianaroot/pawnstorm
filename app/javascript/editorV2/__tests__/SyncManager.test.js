import { describe, it, expect, beforeEach, vi } from 'vitest'
import SyncManager from '../sync/SyncManager.js'
import Store from '../state/Store.js'
import History from '../state/History.js'
import Node from '../models/Node.js'
import Connection from '../models/Connection.js'
import Graph from '../models/Graph.js'
import { DEFAULT_CONDITION_DATA } from '../utils/nodeDefaults.js'

describe('SyncManager', () => {
  let store
  let history
  let mockApi
  let syncManager

  beforeEach(() => {
    store = new Store()
    history = new History(store)
    
    mockApi = {
      createNode: vi.fn(),
      deleteNodes: vi.fn(),
      updateNodePosition: vi.fn(),
      updateNode: vi.fn(),
      batchUpdatePositions: vi.fn(),
      createConnection: vi.fn(),
      deleteConnection: vi.fn(),
      loadBot: vi.fn(),
      getServerId: vi.fn(),
      getClientId: vi.fn(),
      isSynced: vi.fn()
    }
    
    syncManager = new SyncManager(store, history, mockApi)
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('initializes with store, history, api', () => {
      expect(syncManager.store).toBe(store)
      expect(syncManager.history).toBe(history)
      expect(syncManager.api).toBe(mockApi)
    })

    it('sets isUndoRedoPending to false', () => {
      expect(syncManager.isUndoRedoPending).toBe(false)
    })

    it('initializes empty pendingOperations Map', () => {
      expect(syncManager.pendingOperations).toBeInstanceOf(Map)
      expect(syncManager.pendingOperations.size).toBe(0)
    })
  })

  describe('setLoading', () => {
    it('sets isUndoRedoPending to true', () => {
      syncManager.setLoading(true)
      expect(syncManager.isUndoRedoPending).toBe(true)
    })

    it('sets isUndoRedoPending to false', () => {
      syncManager.setLoading(true)
      syncManager.setLoading(false)
      expect(syncManager.isUndoRedoPending).toBe(false)
    })
  })

  describe('undo', () => {
    beforeEach(() => {
      const root = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
      store.addNode(root)
      history.push('Initial state')
    })

    it('returns failure when undo/redo pending', async () => {
      syncManager.isUndoRedoPending = true

      const result = await syncManager.undo()

      expect(result).toEqual({ success: false, reason: 'pending' })
    })

    it('returns failure when cannot undo', async () => {
      const result = await syncManager.undo()

      expect(result).toEqual({ success: false, reason: 'cannot_undo' })
    })

    it('calls undoLocal when no operation metadata', async () => {
      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 } })
      store.addNode(node)
      history.push('Add node')

      const result = await syncManager.undo()

      expect(result).toEqual({ success: true })
      expect(store.getNodes()).toHaveLength(1)
    })

    it('calls executeInverseOperation for createNode', async () => {
      mockApi.deleteNodes.mockResolvedValue({ deleted_node_ids: [], deleted_connection_ids: [] })

      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 } })
      store.addNode(node)
      history.push('Create condition node', {
        type: 'createNode',
        clientId: 'n1',
        entity: { type: 'condition', position: { x: 100, y: 100 }, data: {} }
      })

      const result = await syncManager.undo()

      expect(mockApi.deleteNodes).toHaveBeenCalledWith(['n1'])
      expect(result.success).toBe(true)
    })

    it('calls executeInverseOperation for deleteNode', async () => {
      mockApi.createNode.mockResolvedValue({ id: 123 })

      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 }, serverId: 123 })
      store.addNode(node)
      history.push('Delete node', {
        type: 'deleteNode',
        clientId: 'n1',
        serverId: 123,
        entity: { type: 'condition', position: { x: 100, y: 100 }, data: {} },
        connections: []
      })

      const result = await syncManager.undo()

      expect(mockApi.createNode).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('shows error dialog on failure', async () => {
      const error = new Error('Network error')
      mockApi.deleteNodes.mockRejectedValue(error)

      // Mock showErrorDialog to return 'cancel'
      vi.mock('../utils/ErrorDialog.js', () => ({
        showErrorDialog: vi.fn().mockResolvedValue('cancel')
      }))

      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 } })
      store.addNode(node)
      history.push('Create condition node', {
        type: 'createNode',
        clientId: 'n1',
        entity: { type: 'condition', position: { x: 100, y: 100 }, data: {} }
      })

      const result = await syncManager.undo()

      expect(result.success).toBe(false)
      expect(result.cancelled).toBe(true)
    })
  })

  describe('redo', () => {
    beforeEach(() => {
      const root = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
      store.addNode(root)
      history.push('Initial state')
    })

    it('returns failure when undo/redo pending', async () => {
      syncManager.isUndoRedoPending = true

      const result = await syncManager.redo()

      expect(result).toEqual({ success: false, reason: 'pending' })
    })

    it('returns failure when cannot redo', async () => {
      const result = await syncManager.redo()

      expect(result).toEqual({ success: false, reason: 'cannot_redo' })
    })

    it('calls redoLocal when no operation metadata', async () => {
      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 } })
      store.addNode(node)
      history.push('Add node')
      history.undo()

      const result = await syncManager.redo()

      expect(result).toEqual({ success: true })
      expect(store.getNodes()).toHaveLength(2)
    })

    it('calls executeOperation for createNode', async () => {
      mockApi.createNode.mockResolvedValue({ id: 123 })

      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 } })
      store.addNode(node)
      history.push('Create condition node', {
        type: 'createNode',
        clientId: 'n1',
        entity: { type: 'condition', position: { x: 100, y: 100 }, data: {} }
      })
      history.undo()

      const result = await syncManager.redo()

      expect(mockApi.createNode).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('executeInverseOperation', () => {
    it('handles createNode', async () => {
      mockApi.deleteNodes.mockResolvedValue({ deleted_node_ids: [], deleted_connection_ids: [] })

      await syncManager.executeInverseOperation({
        type: 'createNode',
        clientId: 'n1'
      })

      expect(mockApi.deleteNodes).toHaveBeenCalledWith(['n1'])
    })

    it('handles deleteNode', async () => {
      mockApi.createNode.mockResolvedValue({ id: 123 })

      await syncManager.executeInverseOperation({
        type: 'deleteNode',
        clientId: 'n1',
        entity: { type: 'condition', position: { x: 100, y: 100 }, data: {} },
        connections: []
      })

      expect(mockApi.createNode).toHaveBeenCalled()
    })

    it('handles deleteNode with connections', async () => {
      mockApi.createNode.mockResolvedValue({ id: 123 })
      mockApi.createConnection.mockResolvedValue({ id: 456 })

      await syncManager.executeInverseOperation({
        type: 'deleteNode',
        clientId: 'n1',
        entity: { type: 'condition', position: { x: 100, y: 100 }, data: {} },
        connections: [
          { clientId: 'c1', sourceId: 'root', targetId: 'n1' }
        ]
      })

      expect(mockApi.createNode).toHaveBeenCalled()
      expect(mockApi.createConnection).toHaveBeenCalledWith('root', 'n1', 'c1')
    })

    it('handles updateNodePosition', async () => {
      mockApi.updateNodePosition.mockResolvedValue({})

      await syncManager.executeInverseOperation({
        type: 'updateNodePosition',
        clientId: 'n1',
        previousValue: { x: 0, y: 0 }
      })

      expect(mockApi.updateNodePosition).toHaveBeenCalledWith('n1', 0, 0)
    })

    it('handles updateNodeData', async () => {
      mockApi.updateNode.mockResolvedValue({})

      await syncManager.executeInverseOperation({
        type: 'updateNodeData',
        clientId: 'n1',
        previousValue: { foo: 'bar' }
      })

      expect(mockApi.updateNode).toHaveBeenCalledWith('n1', { data: { foo: 'bar' } })
    })

    it('handles createConnection', async () => {
      mockApi.deleteConnection.mockResolvedValue({})

      await syncManager.executeInverseOperation({
        type: 'createConnection',
        clientId: 'c1',
        sourceId: 'n1'
      })

      expect(mockApi.deleteConnection).toHaveBeenCalledWith('c1', 'n1')
    })

    it('handles deleteConnection', async () => {
      mockApi.createConnection.mockResolvedValue({ id: 123 })

      await syncManager.executeInverseOperation({
        type: 'deleteConnection',
        sourceId: 'n1',
        targetId: 'n2',
        clientId: 'c1'
      })

      expect(mockApi.createConnection).toHaveBeenCalledWith('n1', 'n2', 'c1')
    })

    it('throws for unknown operation type', async () => {
      await expect(syncManager.executeInverseOperation({ type: 'unknown' }))
        .rejects.toThrow('Unknown operation type: unknown')
    })
  })

  describe('executeOperation', () => {
    it('handles createNode', async () => {
      mockApi.createNode.mockResolvedValue({ id: 123 })

      await syncManager.executeOperation({
        type: 'createNode',
        clientId: 'n1',
        entity: { type: 'condition', position: { x: 100, y: 100 }, data: {} }
      })

      expect(mockApi.createNode).toHaveBeenCalled()
    })

    it('handles deleteNode', async () => {
      mockApi.deleteNodes.mockResolvedValue({ deleted_node_ids: [], deleted_connection_ids: [] })

      await syncManager.executeOperation({
        type: 'deleteNode',
        clientId: 'n1'
      })

      expect(mockApi.deleteNodes).toHaveBeenCalledWith(['n1'])
    })

    it('handles createConnection', async () => {
      mockApi.createConnection.mockResolvedValue({ id: 123 })

      await syncManager.executeOperation({
        type: 'createConnection',
        sourceId: 'n1',
        targetId: 'n2',
        clientId: 'c1'
      })

      expect(mockApi.createConnection).toHaveBeenCalledWith('n1', 'n2', 'c1')
    })

    it('throws for unknown operation type', async () => {
      await expect(syncManager.executeOperation({ type: 'unknown' }))
        .rejects.toThrow('Unknown operation type: unknown')
    })
  })

  describe('createNode', () => {
    beforeEach(() => {
      mockApi.createNode.mockResolvedValue({ id: 123 })
    })

    it('creates node and returns clientId', async () => {
      const clientId = await syncManager.createNode('condition', { x: 100, y: 100 })

      expect(clientId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      expect(store.getNode(clientId)).toBeDefined()
      expect(store.getNode(clientId).type).toBe('condition')
      expect(store.getNode(clientId).data).toEqual(DEFAULT_CONDITION_DATA)
      expect(store.getRecentPlacementAnchor()).toEqual({ x: 100, y: 100 })
    })

    it('optimistically adds node to store', async () => {
      await syncManager.createNode('condition', { x: 100, y: 100 })

      expect(store.getNodes()).toHaveLength(1)
    })

    it('calls API with correct params', async () => {
      await syncManager.createNode('condition', { x: 100, y: 100 }, { foo: 'bar' })

      expect(mockApi.createNode).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'condition',
          position: { x: 100, y: 100 },
          data: {
            ...DEFAULT_CONDITION_DATA,
            foo: 'bar'
          }
        }),
        expect.any(String)
      )
    })

    it('applies default condition data when no data is provided', async () => {
      await syncManager.createNode('condition', { x: 100, y: 100 })

      expect(mockApi.createNode).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'condition',
          position: { x: 100, y: 100 },
          data: DEFAULT_CONDITION_DATA
        }),
        expect.any(String)
      )
    })

    it('updates node with server ID after success', async () => {
      mockApi.createNode.mockResolvedValue({ id: 456 })

      const clientId = await syncManager.createNode('condition', { x: 100, y: 100 })

      expect(store.getNode(clientId).serverId).toBe(456)
    })

    it('pushes to history after success', async () => {
      const root = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
      store.addNode(root)
      history.push('Initial')

      await syncManager.createNode('condition', { x: 100, y: 100 })

      expect(history.canUndo()).toBe(true)
    })

    it('rolls back on failure', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.createNode.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.createNode('condition', { x: 100, y: 100 }))
        .rejects.toThrow('Network error')

      expect(store.getNodes()).toHaveLength(0)
      expect(history.canUndo()).toBe(false)
    })
  })

  describe('updateNodePosition', () => {
    beforeEach(() => {
      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 0, y: 0 } })
      store.addNode(node)
      mockApi.updateNodePosition.mockResolvedValue({})
    })

    it('updates position optimistically', async () => {
      await syncManager.updateNodePosition('n1', 100, 200)

      expect(store.getNode('n1').position.x).toBe(100)
      expect(store.getNode('n1').position.y).toBe(200)
      expect(store.getRecentPlacementAnchor()).toEqual({ x: 100, y: 200 })
    })

    it('calls API with correct params', async () => {
      await syncManager.updateNodePosition('n1', 100, 200)

      expect(mockApi.updateNodePosition).toHaveBeenCalledWith('n1', 100, 200)
    })

    it('pushes to history after success', async () => {
      // Push initial state
      history.push('Initial')
      
      await syncManager.updateNodePosition('n1', 100, 200)

      expect(history.canUndo()).toBe(true)
    })

    it('rolls back on failure', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.updateNodePosition.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.updateNodePosition('n1', 100, 200))
        .rejects.toThrow('Network error')

      expect(store.getNode('n1').position.x).toBe(0)
      expect(store.getNode('n1').position.y).toBe(0)
    })

    it('warns when node not found', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await syncManager.updateNodePosition('nonexistent', 100, 200)

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'))
      expect(mockApi.updateNodePosition).not.toHaveBeenCalled()
    })
  })

  describe('updateNodeData', () => {
    beforeEach(() => {
      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 0, y: 0 }, data: { foo: 'bar' } })
      store.addNode(node)
      mockApi.updateNode.mockResolvedValue({})
    })

    it('replaces data entirely', async () => {
      await syncManager.updateNodeData('n1', { baz: 'qux' })

      expect(store.getNode('n1').data.foo).toBeUndefined()
      expect(store.getNode('n1').data.baz).toBe('qux')
      expect(mockApi.updateNode).toHaveBeenCalledWith('n1', { data: { baz: 'qux' } })
      expect(store.getRecentPlacementAnchor()).toEqual({ x: 0, y: 0 })
    })

    it('pushes to history after success', async () => {
      history.push('Initial')

      await syncManager.updateNodeData('n1', { baz: 'qux' })

      expect(history.canUndo()).toBe(true)
    })

    it('rolls back on failure', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.updateNode.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.updateNodeData('n1', { baz: 'qux' }))
        .rejects.toThrow('Network error')

      expect(store.getNode('n1').data.foo).toBe('bar')
      expect(store.getNode('n1').data.baz).toBeUndefined()
    })
  })

  describe('deleteNodes (single node)', () => {
    beforeEach(() => {
      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 0, y: 0 } })
      store.addNode(node)
      mockApi.deleteNodes.mockResolvedValue({ deleted_node_ids: [1], deleted_connection_ids: [] })
    })

    it('removes node from store optimistically', async () => {
      await syncManager.deleteNodes(['n1'])

      expect(store.getNodes()).toHaveLength(0)
      expect(store.getRecentPlacementAnchor()).toEqual({ x: 0, y: 0 })
    })

    it('stores node data for history', async () => {
      await syncManager.deleteNodes(['n1'])

      const snapshot = history.getCurrentSnapshot()
      expect(snapshot.description).toContain('Delete')
      expect(snapshot.operation.type).toBe('deleteNode')
    })

    it('handles cascade-deleted connections', async () => {
      const root = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
      const node = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 } })
      const conn = new Connection({ clientId: 'c1', sourceId: 'root', targetId: 'n1' })
      store.addNode(root)
      store.addNode(node)
      store.addConnection(conn)

      await syncManager.deleteNodes(['n1'])

      expect(store.getNodes()).toHaveLength(1)
      expect(store.getConnections()).toHaveLength(0)
    })

    it('rolls back on failure', async () => {
      mockApi.deleteNodes.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.deleteNodes(['n1']))
        .rejects.toThrow('Network error')

      expect(store.getNodes()).toHaveLength(1)
    })
  })

  describe('deleteNodes', () => {
    beforeEach(() => {
      const root = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
      const node1 = new Node({ clientId: 'n1', type: 'condition', position: { x: 100, y: 100 } })
      const node2 = new Node({ clientId: 'n2', type: 'action', position: { x: 200, y: 100 } })
      const rootConnection = new Connection({ clientId: 'c-root', sourceId: 'root', targetId: 'n1' })
      const internalConnection = new Connection({ clientId: 'c-internal', sourceId: 'n1', targetId: 'n2' })

      store.addNode(root)
      store.addNode(node1)
      store.addNode(node2)
      store.addConnection(rootConnection)
      store.addConnection(internalConnection)

      mockApi.deleteNodes.mockResolvedValue({ deleted_node_ids: [1, 2], deleted_connection_ids: [10, 11] })
    })

    it('deletes a selected node set with one history entry and ignores root nodes', async () => {
      await syncManager.deleteNodes(['root', 'n1', 'n2'])

      expect(mockApi.deleteNodes).toHaveBeenCalledWith(['n1', 'n2'])
      expect(store.getNodes().map(node => node.clientId)).toEqual(['root'])
      expect(store.getConnections()).toHaveLength(0)

      const snapshot = history.getCurrentSnapshot()
      expect(snapshot.description).toBe('Delete 2 selected nodes')
      expect(snapshot.operation.type).toBe('deleteNodes')
      expect(snapshot.operation.nodes).toHaveLength(2)
      expect(snapshot.operation.connections).toHaveLength(2)
      expect(snapshot.operation.connections.map(connection => connection.clientId)).toEqual(
        expect.arrayContaining(['c-root', 'c-internal'])
      )
    })

    it('no-ops when only root nodes are selected', async () => {
      await syncManager.deleteNodes(['root'])

      expect(mockApi.deleteNodes).not.toHaveBeenCalled()
      expect(history.getCurrentSnapshot()).toBeNull()
      expect(store.getNodes()).toHaveLength(3)
      expect(store.getConnections()).toHaveLength(2)
    })

    it('restores all deleted nodes and connections when the API call fails', async () => {
      mockApi.deleteNodes.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.deleteNodes(['n1', 'n2']))
        .rejects.toThrow('Network error')

      expect(store.getNodes()).toHaveLength(3)
      expect(store.getConnections()).toHaveLength(2)
    })

    it('restores nodes before connections during undo', async () => {
      const callOrder = []
      mockApi.createNode.mockImplementation(async () => {
        callOrder.push('createNode')
        return { id: callOrder.length }
      })
      mockApi.createConnection.mockImplementation(async () => {
        callOrder.push('createConnection')
        return { id: callOrder.length }
      })

      await syncManager.executeInverseOperation({
        type: 'deleteNodes',
        nodes: [
          { clientId: 'n1', type: 'condition', position: { x: 100, y: 100 }, data: {} },
          { clientId: 'n2', type: 'action', position: { x: 200, y: 100 }, data: {} }
        ],
        connections: [
          { clientId: 'c-internal', sourceId: 'n1', targetId: 'n2' }
        ]
      })

      expect(callOrder).toEqual(['createNode', 'createNode', 'createConnection'])
    })

    it('deletes the same node set again during redo', async () => {
      await syncManager.executeOperation({
        type: 'deleteNodes',
        nodes: [
          { clientId: 'n1', type: 'condition', position: { x: 100, y: 100 }, data: {} },
          { clientId: 'n2', type: 'action', position: { x: 200, y: 100 }, data: {} }
        ]
      })

      expect(mockApi.deleteNodes).toHaveBeenCalledWith(['n1', 'n2'])
    })
  })

  describe('createConnection', () => {
    beforeEach(() => {
      const node1 = new Node({ clientId: 'n1', type: 'root', position: { x: 0, y: 0 } })
      const node2 = new Node({ clientId: 'n2', type: 'action', position: { x: 100, y: 100 } })
      store.addNode(node1)
      store.addNode(node2)
      mockApi.createConnection.mockResolvedValue({ id: 123 })
    })

    it('creates connection and returns clientId', async () => {
      const clientId = await syncManager.createConnection('n1', 'n2')

      expect(clientId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      expect(store.getConnection(clientId)).toBeDefined()
      expect(store.getRecentPlacementAnchor()).toEqual({ x: 100, y: 100 })
    })

    it('optimistically adds connection to store', async () => {
      await syncManager.createConnection('n1', 'n2')

      expect(store.getConnections()).toHaveLength(1)
    })

    it('prevents duplicate connections', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const conn = new Connection({ clientId: 'c1', sourceId: 'n1', targetId: 'n2' })
      store.addConnection(conn)

      const clientId = await syncManager.createConnection('n1', 'n2')

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'))
      expect(clientId).toBe('c1')
      expect(mockApi.createConnection).not.toHaveBeenCalled()
    })

    it('throws when source node not found', async () => {
      await expect(syncManager.createConnection('nonexistent', 'n2'))
        .rejects.toThrow('Source node nonexistent not found')
    })

    it('throws when target node not found', async () => {
      await expect(syncManager.createConnection('n1', 'nonexistent'))
        .rejects.toThrow('Target node nonexistent not found')
    })

    it('rolls back on failure', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.createConnection.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.createConnection('n1', 'n2'))
        .rejects.toThrow('Network error')

      expect(store.getConnections()).toHaveLength(0)
    })
  })

  describe('deleteConnection', () => {
    beforeEach(() => {
      const node1 = new Node({ clientId: 'n1', type: 'root', position: { x: 0, y: 0 } })
      const node2 = new Node({ clientId: 'n2', type: 'action', position: { x: 100, y: 100 } })
      const conn = new Connection({ clientId: 'c1', sourceId: 'n1', targetId: 'n2' })
      store.addNode(node1)
      store.addNode(node2)
      store.addConnection(conn)
      mockApi.deleteConnection.mockResolvedValue({})
    })

    it('removes connection from store optimistically', async () => {
      await syncManager.deleteConnection('c1')

      expect(store.getConnections()).toHaveLength(0)
      expect(store.getRecentPlacementAnchor()).toEqual({ x: 100, y: 100 })
    })

    it('pushes to history after success', async () => {
      history.push('Initial')

      await syncManager.deleteConnection('c1')

      expect(history.canUndo()).toBe(true)
    })

    it('rolls back on failure', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.deleteConnection.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.deleteConnection('c1'))
        .rejects.toThrow('Network error')

      expect(store.getConnections()).toHaveLength(1)
    })
  })

  describe('batchUpdatePositions', () => {
    beforeEach(() => {
      const node1 = new Node({ clientId: 'n1', type: 'root', position: { x: 0, y: 0 } })
      const node2 = new Node({ clientId: 'n2', type: 'action', position: { x: 100, y: 100 } })
      store.addNode(node1)
      store.addNode(node2)
      mockApi.batchUpdatePositions.mockResolvedValue({})
    })

    it('updates all positions atomically', async () => {
      await syncManager.batchUpdatePositions([
        { clientId: 'n1', x: 50, y: 50 },
        { clientId: 'n2', x: 150, y: 150 }
      ])

      expect(store.getNode('n1').position.x).toBe(50)
      expect(store.getNode('n1').position.y).toBe(50)
      expect(store.getNode('n2').position.x).toBe(150)
      expect(store.getNode('n2').position.y).toBe(150)
    })

    it('pushes single history entry', async () => {
      history.push('Initial')

      await syncManager.batchUpdatePositions([
        { clientId: 'n1', x: 50, y: 50 },
        { clientId: 'n2', x: 150, y: 150 }
      ])

      const snapshot = history.getCurrentSnapshot()
      expect(snapshot.description).toBe('Move nodes')
    })

    it('rolls back all on failure', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.batchUpdatePositions.mockRejectedValue(new Error('Network error'))

      await expect(syncManager.batchUpdatePositions([
        { clientId: 'n1', x: 50, y: 50 },
        { clientId: 'n2', x: 150, y: 150 }
      ])).rejects.toThrow('Network error')

      expect(store.getNode('n1').position.x).toBe(0)
      expect(store.getNode('n2').position.x).toBe(100)
    })

    it('does nothing when given empty array', async () => {
      await syncManager.batchUpdatePositions([])

      expect(mockApi.batchUpdatePositions).not.toHaveBeenCalled()
    })
  })

  describe('loadBot', () => {
    it('replaces store graph with loaded graph', async () => {
      const root = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
      const graph = new Graph([root])
      mockApi.loadBot.mockResolvedValue(graph)

      await syncManager.loadBot()

      expect(store.getNodes()).toHaveLength(1)
      expect(store.getNode('root')).toBeDefined()
    })

    it('pushes initial state to history', async () => {
      const root = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
      const graph = new Graph([root])
      mockApi.loadBot.mockResolvedValue(graph)

      await syncManager.loadBot()

      expect(history.snapshots.length).toBe(1)
      expect(history.getCurrentSnapshot().description).toBe('Initial state')
    })

    it('throws on failure', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.loadBot.mockRejectedValue(new Error('Load failed'))

      await expect(syncManager.loadBot())
        .rejects.toThrow('Load failed')
    })
  })

  describe('utility methods', () => {
    it('getServerId delegates to api', () => {
      mockApi.getServerId.mockReturnValue(123)

      const result = syncManager.getServerId('client-123')

      expect(mockApi.getServerId).toHaveBeenCalledWith('client-123')
      expect(result).toBe(123)
    })

    it('getClientId delegates to api', () => {
      mockApi.getClientId.mockReturnValue('client-123')

      const result = syncManager.getClientId(123)

      expect(mockApi.getClientId).toHaveBeenCalledWith(123)
      expect(result).toBe('client-123')
    })

    it('isSynced delegates to api', () => {
      mockApi.isSynced.mockReturnValue(true)

      const result = syncManager.isSynced('client-123')

      expect(mockApi.isSynced).toHaveBeenCalledWith('client-123')
      expect(result).toBe(true)
    })
  })
})
