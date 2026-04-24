// sync/SyncManager.js
// Orchestrates server synchronization with optimistic updates and rollback

import generateUUID from 'editorV2/utils/uuid'
import Node from 'editorV2/models/Node'
import Connection from 'editorV2/models/Connection'
import { showError } from 'editorV2/utils/errors'
import { showErrorDialog } from 'editorV2/utils/ErrorDialog'
import { normalizeNodeData } from 'editorV2/utils/nodeDefaults'
import { buildTemplateInsertOperation } from 'editorV2/templates/TemplateInserter'

/**
 * SyncManager
 * 
 * Handles all server communication with optimistic updates:
 * 1. Update Store immediately (optimistic)
 * 2. Sync with server in background
 * 3. On success: Push to history, update serverId if needed
 * 4. On failure: Rollback store, show error, do NOT push to history
 * 
 * CRITICAL: Only SyncManager calls history.push(). Handlers never push directly.
 */
class SyncManager {
  /**
   * Create SyncManager
   * @param {Store} store - Store instance
   * @param {History} history - History instance
   * @param {API} api - API instance
   */
  constructor(store, history, api) {
    this.store = store
    this.history = history
    this.api = api
    
    // Track pending undo/redo to prevent concurrent operations
    this.isUndoRedoPending = false
    
    // Track in-flight operations for potential cancellation
    this.pendingOperations = new Map()

    this.onPersistedMutation = null
  }

  setPersistedMutationCallback(callback) {
    this.onPersistedMutation = callback
  }

  notifyPersistedMutation() {
    this.onPersistedMutation?.()
  }

  setRecentPlacementAnchorFromNode(node) {
    if (node?.position) {
      this.store.setRecentPlacementAnchor(node.position)
    }
  }

  setRecentPlacementAnchorForClientId(clientId) {
    this.setRecentPlacementAnchorFromNode(this.store.getNode(clientId))
  }

  setRecentPlacementAnchorForSelection() {
    const selectedId = this.store.getPrimarySelectedNode?.() || this.store.getSelectedNode?.()
    if (selectedId) {
      this.setRecentPlacementAnchorForClientId(selectedId)
      return true
    }
    return false
  }

  setRecentPlacementAnchorForOperation(operation, direction) {
    if (!operation) {
      this.setRecentPlacementAnchorForSelection()
      return
    }

    const point = this.resolveRecentPlacementAnchorPoint(operation, direction)
    if (point) {
      this.store.setRecentPlacementAnchor(point)
      return
    }

    this.setRecentPlacementAnchorForSelection()
  }

  resolveRecentPlacementAnchorPoint(operation, direction) {
    const positionFor = (value) => value && typeof value.x === 'number' && typeof value.y === 'number'
      ? { x: value.x, y: value.y }
      : null

    switch (operation.type) {
      case 'createNode':
      case 'deleteNode':
        return positionFor(operation.entity?.position)

      case 'updateNodePosition':
        return positionFor(direction === 'undo' ? operation.previousValue : operation.newValue)

      case 'updateNodePositions':
        if (operation.anchorClientId) {
          const anchorPosition = (direction === 'undo'
            ? operation.positions?.find(position => position.clientId === operation.anchorClientId)?.previousPosition
            : operation.positions?.find(position => position.clientId === operation.anchorClientId)?.newPosition)
          return positionFor(anchorPosition)
        }
        return positionFor((direction === 'undo' ? operation.positions?.[0]?.previousPosition : operation.positions?.[0]?.newPosition))

      case 'updateNodeData': {
        const node = this.store.getNode(operation.clientId)
        return positionFor(node?.position)
      }

      case 'createConnection':
      case 'deleteConnection': {
        const node = this.store.getNode(operation.targetId)
        return positionFor(node?.position)
      }

      case 'deleteNodes':
        return positionFor(operation.nodes?.[0]?.position)

      case 'insertTemplate':
        return positionFor(operation.nodes?.[0]?.entity?.position)

      default:
        return null
    }
  }

  async updateBot(updates) {
    return this.api.updateBot(updates)
  }

  getDeletedNodeBackups(clientIds) {
    const uniqueClientIds = [...new Set((clientIds || []).filter(Boolean))]
    return uniqueClientIds
      .map(clientId => this.store.getNode(clientId))
      .filter(node => node && node.type !== 'root')
      .map(node => ({
        clientId: node.clientId,
        serverId: node.serverId,
        type: node.type,
        position: { ...node.position },
        data: { ...node.data }
      }))
  }

  getDeletedConnectionBackups(clientIds) {
    const backups = new Map()

    clientIds.forEach(clientId => {
      const { outgoing, incoming } = this.store.getConnectionsFor(clientId)

      const touchedConnections = [...outgoing, ...incoming]

      touchedConnections.forEach(connection => {
        if (!backups.has(connection.clientId)) {
          backups.set(connection.clientId, {
            clientId: connection.clientId,
            serverId: connection.serverId,
            sourceId: connection.sourceId,
            targetId: connection.targetId
          })
        }
      })
    })

    return [...backups.values()]
  }

  restoreDeletedNodes(nodeBackups) {
    nodeBackups.forEach(nodeData => {
      this.store.addNode(new Node({
        clientId: nodeData.clientId,
        serverId: nodeData.serverId,
        type: nodeData.type,
        position: nodeData.position,
        data: nodeData.data
      }))
    })
  }

  restoreDeletedConnections(connectionBackups) {
    connectionBackups.forEach(connectionData => {
      this.store.addConnection(new Connection(connectionData))
    })
  }
  
  /**
   * Set loading state for undo/redo
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    this.isUndoRedoPending = isLoading
  }
  
  // ===== Undo/Redo Operations =====
  
  /**
   * Undo the last operation with server sync
   * @returns {Promise<Object>} Result object with success/reason
   */
  async undo() {
    // Prevent concurrent undo/redo
    if (this.isUndoRedoPending) {
      return { success: false, reason: 'pending' }
    }
    
    if (!this.history.canUndo()) {
      return { success: false, reason: 'cannot_undo' }
    }
    
    this.setLoading(true)
    
    const currentSnapshot = this.history.getCurrentSnapshot()
    const operation = currentSnapshot?.operation
    
    // If no operation metadata, just restore local state
    if (!operation) {
      this.history.undoLocal()
      this.setRecentPlacementAnchorForSelection()
      this.setLoading(false)
      return { success: true }
    }
    
    // Store pre-undo state for potential rollback
    const preUndoState = this.store.getState()
    
    try {
      // Execute inverse operation on server
      await this.executeInverseOperation(operation)
      
      // Restore client state
      this.history.undoLocal()
      this.setRecentPlacementAnchorForOperation(operation, 'undo')
      
      this.setLoading(false)
      return { success: true }
    } catch (error) {
      // Show error dialog with undo context
      const action = await showErrorDialog(`Undo: ${currentSnapshot.description}`, error)
      
      if (action === 'retry') {
        // Keep loading state - retry will manage it
        return this.undo()
      } else {
        // Cancel - restore pre-undo state
        this.store.restoreState(preUndoState)
        this.setLoading(false)
        return { success: false, cancelled: true }
      }
    }
  }
  
  /**
   * Redo a previously undone operation with server sync
   * @returns {Promise<Object>} Result object with success/reason
   */
  async redo() {
    // Prevent concurrent undo/redo
    if (this.isUndoRedoPending) {
      return { success: false, reason: 'pending' }
    }
    
    if (!this.history.canRedo()) {
      return { success: false, reason: 'cannot_redo' }
    }
    
    this.setLoading(true)
    
    const nextSnapshot = this.history.getNextSnapshot()
    const operation = nextSnapshot?.operation
    
    // If no operation metadata, just restore local state
    if (!operation) {
      this.history.redoLocal()
      this.setRecentPlacementAnchorForSelection()
      this.setLoading(false)
      return { success: true }
    }
    
    // Store pre-redo state for potential rollback
    const preRedoState = this.store.getState()
    
    try {
      // Re-execute the original operation on server
      await this.executeOperation(operation)
      
      // Advance history
      this.history.redoLocal()
      this.setRecentPlacementAnchorForOperation(operation, 'redo')
      
      this.setLoading(false)
      return { success: true }
    } catch (error) {
      // Show error dialog with redo context
      const action = await showErrorDialog(`Redo: ${nextSnapshot.description}`, error)
      
      if (action === 'retry') {
        // Keep loading state - retry will manage it
        return this.redo()
      } else {
        // Cancel - restore pre-redo state
        this.store.restoreState(preRedoState)
        this.setLoading(false)
        return { success: false, cancelled: true }
      }
    }
  }
  
  /**
   * Execute inverse operation for undo
   * @param {Object} operation - Operation metadata
   */
  async executeInverseOperation(operation) {
    switch (operation.type) {
      case 'createNode':
        await this.api.deleteNodes([operation.clientId])
        break
        
      case 'deleteNode':
        // Undo: recreate the node first (connections reference it)
        await this.api.createNode({
          type: operation.entity.type,
          position: operation.entity.position,
          data: operation.entity.data
        }, operation.clientId)
        
        if (operation.connections.length > 0) {
          await this.requireAllSettled(
            Promise.allSettled(
              operation.connections.map(conn =>
                this.api.createConnection(conn.sourceId, conn.targetId, conn.clientId)
              )
            ),
            'recreate connections'
          )
        }
        break
        
      case 'updateNodePosition':
        // Undo: restore previous position
        await this.api.updateNodePosition(
          operation.clientId,
          operation.previousValue.x,
          operation.previousValue.y
        )
        break
        
      case 'updateNodePositions':
        // Undo: restore all previous positions
        await this.api.batchUpdatePositions(
          operation.positions.map(p => ({
            clientId: p.clientId,
            x: p.previousPosition.x,
            y: p.previousPosition.y
          }))
        )
        break
        
      case 'updateNodeData':
        // Undo: restore previous data
        await this.api.updateNode(operation.clientId, { data: operation.previousValue })
        break
        
      case 'createConnection':
        // Undo: delete the created connection
        await this.api.deleteConnection(operation.clientId, operation.sourceId)
        break
        
      case 'deleteConnection':
        // Undo: recreate the deleted connection
        await this.api.createConnection(
          operation.sourceId,
          operation.targetId,
          operation.clientId
        )
        break

      case 'deleteNodes':
        if (operation.nodes.length > 0) {
          await this.requireAllSettled(
            Promise.allSettled(
              operation.nodes.map(node =>
                this.api.createNode({
                  type: node.type,
                  position: node.position,
                  data: node.data
                }, node.clientId)
              )
            ),
            'recreate nodes'
          )
        }

        if (operation.connections.length > 0) {
          await this.requireAllSettled(
            Promise.allSettled(
              operation.connections.map(connection =>
                this.api.createConnection(connection.sourceId, connection.targetId, connection.clientId)
              )
            ),
            'recreate connections'
          )
        }
        break

      case 'insertTemplate':
        if (operation.connections.length > 0) {
          await this.requireAllSettled(
            Promise.allSettled(
              operation.connections.map(conn =>
                this.api.deleteConnection(conn.clientId, conn.sourceId)
              )
            ),
            'delete connections'
          )
        }

        if (operation.nodes.length > 0) {
          await this.api.deleteNodes(operation.nodes.map(node => node.clientId))
        }
        break
        
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }
  
  /**
   * Execute operation for redo
   * @param {Object} operation - Operation metadata
   */
  async executeOperation(operation) {
    switch (operation.type) {
      case 'createNode':
        // Redo: recreate the node
        await this.api.createNode({
          type: operation.entity.type,
          position: operation.entity.position,
          data: operation.entity.data
        }, operation.clientId)
        break
        
      case 'deleteNode':
        await this.api.deleteNodes([operation.clientId])
        break
        
      case 'updateNodePosition':
        // Redo: apply the new position
        await this.api.updateNodePosition(
          operation.clientId,
          operation.newValue.x,
          operation.newValue.y
        )
        break
        
      case 'updateNodePositions':
        // Redo: apply all new positions
        await this.api.batchUpdatePositions(
          operation.positions.map(p => ({
            clientId: p.clientId,
            x: p.newPosition.x,
            y: p.newPosition.y
          }))
        )
        break
        
      case 'updateNodeData':
        // Redo: apply the new data
        await this.api.updateNode(operation.clientId, { data: operation.newValue })
        break
        
      case 'createConnection':
        // Redo: recreate the connection
        await this.api.createConnection(
          operation.sourceId,
          operation.targetId,
          operation.clientId
        )
        break
        
      case 'deleteConnection':
        // Redo: delete the connection again
        await this.api.deleteConnection(operation.clientId, operation.sourceId)
        break

      case 'deleteNodes':
        await this.api.deleteNodes(operation.nodes.map(node => node.clientId))
        break

      case 'insertTemplate':
        if (operation.nodes.length > 0) {
          await this.requireAllSettled(
            Promise.allSettled(
              operation.nodes.map(node =>
                this.api.createNode(node.entity, node.clientId)
              )
            ),
            'create nodes'
          )
        }

        if (operation.connections.length > 0) {
          await this.requireAllSettled(
            Promise.allSettled(
              operation.connections.map(connection =>
                this.api.createConnection(connection.sourceId, connection.targetId, connection.clientId)
              )
            ),
            'create connections'
          )
        }
        break
        
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }
  
  // ===== Batch Helper =====

  async requireAllSettled(settledPromise, context) {
    const results = await settledPromise
    const failures = results.filter(r => r.status === 'rejected')
    if (failures.length > 0) {
      const message = `${failures.length} of ${results.length} ${context} failed`
      const error = failures.length === 1 ? failures[0].reason : new Error(message)
      throw error
    }
  }

  // ===== Node Operations =====
  
  /**
   * Create a new node
   * @param {string} type - Node type (root, condition, action, organizer)
   * @param {Object} position - Position { x, y }
   * @param {Object} [data={}] - Node data
   * @returns {Promise<string>} Client ID of created node
   */
  async createNode(type, position, data = {}) {
    const normalizedData = normalizeNodeData(type, data)

    // Generate client ID
    const clientId = generateUUID()
    
    // Create node instance
    const node = new Node({ clientId, type, position, data: normalizedData })
    
    // 1. Optimistic update: Add to store immediately
    this.store.addNode(node)
    
    try {
      // 2. Sync with server
      const response = await this.api.createNode({ type, position, data: normalizedData }, clientId)
      
      // 3. Update with server ID
      this.store.updateNode(clientId, { serverId: response.id })
      
      // 4. Push to history ONLY after success
      this.history.push(`Create ${type} node`, {
        type: 'createNode',
        clientId,
        entity: {
          type,
          position,
          data: normalizedData
        }
      })

      this.store.setRecentPlacementAnchor(position)

      this.notifyPersistedMutation()
      
      return clientId
      
    } catch (error) {
      // 5. Rollback on failure (no history entry)
      this.store.removeNode(clientId)
      
      showError(`Failed to create node: ${error.message}`)
      console.error('Failed to create node:', error)
      
      throw error
    }
  }

  async insertNodeSet(nodeModels, connectionModels, description) {
    nodeModels.forEach(node => this.store.addNode(node))
    connectionModels.forEach(connection => this.store.addConnection(connection))

    const persistedNodes = []
    const persistedConnections = []

    try {
      if (nodeModels.length > 0) {
        await this.requireAllSettled(
          Promise.allSettled(
            nodeModels.map(nodeData =>
              this.api.createNode(
                { type: nodeData.type, position: nodeData.position, data: nodeData.data },
                nodeData.clientId
              ).then(response => {
                persistedNodes.push(nodeData)
                this.store.updateNode(nodeData.clientId, { serverId: response.id })
              })
            )
          ),
          'create nodes'
        )
      }

      if (connectionModels.length > 0) {
        await this.requireAllSettled(
          Promise.allSettled(
            connectionModels.map(connectionData =>
              this.api.createConnection(
                connectionData.sourceId,
                connectionData.targetId,
                connectionData.clientId
              ).then(response => {
                persistedConnections.push(connectionData)
                this.store.updateConnection(connectionData.clientId, { serverId: response.id })
              })
            )
          ),
          'create connections'
        )
      }

      this.history.push(description, {
        type: 'insertTemplate',
        nodes: nodeModels.map(node => ({
          clientId: node.clientId,
          serverId: node.serverId,
          entity: { type: node.type, position: { ...node.position }, data: { ...node.data } }
        })),
        connections: connectionModels.map(conn => ({
          clientId: conn.clientId,
          serverId: conn.serverId,
          sourceId: conn.sourceId,
          targetId: conn.targetId
        }))
      })

      const anchorNode = nodeModels[0]
      if (anchorNode?.position) {
        this.store.setRecentPlacementAnchor(anchorNode.position)
      }
      this.notifyPersistedMutation()

      return { clientIds: nodeModels.map(n => n.clientId) }
    } catch (error) {
      [...connectionModels].reverse().forEach(conn => this.store.removeConnection(conn.clientId))
      ;[...nodeModels].reverse().forEach(node => this.store.removeNode(node.clientId))

      for (const connection of [...persistedConnections].reverse()) {
        try {
          await this.api.deleteConnection(connection.clientId, connection.sourceId)
        } catch (rollbackError) {
          console.error('Failed to roll back connection:', rollbackError)
        }
      }

      if (persistedNodes.length > 0) {
        try {
          await this.api.deleteNodes(persistedNodes.map(node => node.clientId))
        } catch (rollbackError) {
          console.error('Failed to roll back nodes:', rollbackError)
        }
      }

      showError(`Failed to ${description.toLowerCase()}: ${error.message}`)
      console.error(`Failed to ${description.toLowerCase()}:`, error)

      throw error
    }
  }

  async insertTemplate(template, organizerAnchor) {
    const operation = buildTemplateInsertOperation(template, organizerAnchor)
    const nodeModels = operation.nodes.map(nodeData => new Node({
      clientId: nodeData.clientId,
      type: nodeData.entity.type,
      position: nodeData.entity.position,
      data: nodeData.entity.data
    }))
    const connectionModels = operation.connections.map(connectionData => new Connection(connectionData))

    const result = await this.insertNodeSet(nodeModels, connectionModels, `Insert template: ${template.name}`)
    return { organizerClientId: operation.organizerClientId, ...result }
  }
  
  /**
   * Update node position
   * @param {string} clientId - Node client ID
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Promise<void>}
   */
  async updateNodePosition(clientId, x, y, previousPositionOverride = null) {
    const existingNode = this.store.getNode(clientId)
    if (!existingNode) {
      console.warn(`Node ${clientId} not found, cannot update position`)
      return
    }
    
    // Store original position for rollback and history
    const previousPosition = previousPositionOverride
      ? { x: previousPositionOverride.x, y: previousPositionOverride.y }
      : { x: existingNode.position.x, y: existingNode.position.y }
    const newPosition = { x, y }
    
    // 1. Optimistic update
    this.store.updateNode(clientId, { position: newPosition })
    
    try {
      // 2. Sync with server
      await this.api.updateNodePosition(clientId, x, y)
      
      // 3. Push to history after success
      this.history.push('Move node', {
        type: 'updateNodePosition',
        clientId,
        previousValue: previousPosition,
        newValue: newPosition
      })

      this.store.setRecentPlacementAnchor(newPosition)

      this.notifyPersistedMutation()
      
    } catch (error) {
      // 4. Rollback on failure
      this.store.updateNode(clientId, { position: previousPosition })
      
      showError(`Failed to save position: ${error.message}`)
      console.error('Failed to update position:', error)
      
      throw error
    }
  }
  
  /**
   * Update node data
   * @param {string} clientId - Node client ID
   * @param {Object} data - Complete replacement data
   * @returns {Promise<void>}
   */
  async updateNodeData(clientId, data) {
    const existingNode = this.store.getNode(clientId)
    if (!existingNode) {
      console.warn(`Node ${clientId} not found, cannot update data`)
      return
    }
    
    // Store original data for rollback and history
    const previousData = { ...existingNode.data }
    const newData = { ...data }
    
    // 1. Optimistic update
    this.store.updateNode(clientId, { data: newData })
    
    try {
      // 2. Sync with server
      await this.api.updateNode(clientId, { data: newData })

      // 3. Re-emit the data update after the server save completes so
      // preview rendering refetches against committed server state.
      this.store.updateNode(clientId, { data: newData })
      
      // 4. Push to history after success
      this.history.push('Update node', {
        type: 'updateNodeData',
        clientId,
        previousValue: previousData,
        newValue: newData
      })

      this.notifyPersistedMutation()
      
    } catch (error) {
      // 4. Rollback on failure
      this.store.updateNode(clientId, { data: previousData })
      
      showError(`Failed to save node: ${error.message}`)
      console.error('Failed to update node data:', error)
      
      throw error
    }
  }
  
  /**
   * Delete multiple nodes selected as a set
   * @param {string[]} clientIds - Node client IDs
   * @returns {Promise<void>}
   */
  async deleteNodes(clientIds) {
    const deletedNodes = this.getDeletedNodeBackups(clientIds)
    if (deletedNodes.length === 0) {
      return
    }

    const deletedConnections = this.getDeletedConnectionBackups(deletedNodes.map(node => node.clientId))

    deletedNodes.forEach(node => {
      this.store.removeNode(node.clientId)
    })

    try {
      await this.api.deleteNodes(deletedNodes.map(node => node.clientId))

      if (deletedNodes.length === 1) {
        const deletedNode = deletedNodes[0]
        this.history.push(`Delete ${deletedNode.type} node`, {
          type: 'deleteNode',
          clientId: deletedNode.clientId,
          serverId: deletedNode.serverId,
          entity: {
            type: deletedNode.type,
            position: deletedNode.position,
            data: deletedNode.data
          },
          connections: deletedConnections
        })
      } else {
        this.history.push(`Delete ${deletedNodes.length} selected nodes`, {
          type: 'deleteNodes',
          nodes: deletedNodes,
          connections: deletedConnections
        })
      }

      this.setRecentPlacementAnchorFromNode(deletedNodes[0])
      this.notifyPersistedMutation()
    } catch (error) {
      this.restoreDeletedNodes(deletedNodes)
      this.restoreDeletedConnections(deletedConnections)

      showError(`Failed to delete nodes: ${error.message}`)
      console.error('Failed to delete nodes:', error)

      throw error
    }
  }
  
  // ===== Connection Operations =====
  
  /**
   * Create a connection between two nodes
   * @param {string} sourceClientId - Source node client ID
   * @param {string} targetClientId - Target node client ID
   * @returns {Promise<string>} Client ID of created connection
   */
  async createConnection(sourceClientId, targetClientId) {
    // Validate nodes exist
    const sourceNode = this.store.getNode(sourceClientId)
    const targetNode = this.store.getNode(targetClientId)
    
    if (!sourceNode) {
      throw new Error(`Source node ${sourceClientId} not found`)
    }
    if (!targetNode) {
      throw new Error(`Target node ${targetClientId} not found`)
    }
    
    // Check for existing connection
    const existing = this.store.findConnection(sourceClientId, targetClientId)
    if (existing) {
      console.warn('Connection already exists')
      return existing.clientId
    }
    
    // Generate client ID
    const clientId = generateUUID()
    
    // Create connection instance
    const connection = new Connection({
      clientId,
      sourceId: sourceClientId,
      targetId: targetClientId
    })
    
    // 1. Optimistic update: Add to store
    this.store.addConnection(connection)
    
    try {
      // 2. Sync with server
      const response = await this.api.createConnection(sourceClientId, targetClientId, clientId)
      
      // 3. Update with server ID
      this.store.updateConnection(clientId, { serverId: response.id })
      
      // 4. Push to history after success
      this.history.push('Create connection', {
        type: 'createConnection',
        clientId,
        sourceId: sourceClientId,
        targetId: targetClientId
      })

      this.setRecentPlacementAnchorFromNode(targetNode)

      this.notifyPersistedMutation()
      
      return clientId
      
    } catch (error) {
      // 5. Rollback on failure
      this.store.removeConnection(clientId)
      
      showError(`Failed to create connection: ${error.message}`)
      console.error('Failed to create connection:', error)
      
      throw error
    }
  }
  
  /**
   * Delete a connection
   * @param {string} clientId - Connection client ID
   * @returns {Promise<void>}
   */
  async deleteConnection(clientId) {
    const existingConn = this.store.getConnection(clientId)
    if (!existingConn) {
      console.warn(`Connection ${clientId} not found, cannot delete`)
      return
    }
    
    // Store for rollback and history
    const sourceId = existingConn.sourceId
    const targetId = existingConn.targetId
    const connBackup = existingConn
    
    // 1. Optimistic update: Remove from store
    this.store.removeConnection(clientId)
    
    try {
      // 2. Sync with server
      await this.api.deleteConnection(clientId, sourceId)
      
      // 3. Push to history after success
      this.history.push('Delete connection', {
        type: 'deleteConnection',
        clientId,
        sourceId,
        targetId
      })

      this.setRecentPlacementAnchorForClientId(targetId)

      this.notifyPersistedMutation()
      
    } catch (error) {
      // 4. Rollback: Re-add connection
      this.store.addConnection(connBackup)
      
      showError(`Failed to delete connection: ${error.message}`)
      console.error('Failed to delete connection:', error)
      
      throw error
    }
  }
  
  // ===== Batch Operations =====
  
  /**
   * Update positions of multiple nodes (for drag operations with children)
   * @param {Array<{clientId: string, x: number, y: number}>} positions
   * @param {string} [description='Move nodes'] - Description for history
   * @returns {Promise<void>}
   */
  async batchUpdatePositions(positions, description = 'Move nodes', anchorClientId = null, previousPositionsByClientId = null) {
    if (!positions || positions.length === 0) {
      return
    }
    
    // Store original positions for rollback and history
    const positionsWithPrevious = positions.map(({ clientId, x, y }) => {
      const node = this.store.getNode(clientId)
      const previousPosition = previousPositionsByClientId?.[clientId]
      return {
        clientId,
        previousPosition: previousPosition
          ? { x: previousPosition.x, y: previousPosition.y }
          : (node ? { x: node.position.x, y: node.position.y } : null),
        newPosition: { x, y }
      }
    }).filter(p => p.previousPosition !== null)
    
    // 1. Optimistic update: Update all positions
    positionsWithPrevious.forEach(({ clientId, newPosition }) => {
      this.store.updateNode(clientId, { position: newPosition })
    })
    
    try {
      // 2. Sync with server
      await this.api.batchUpdatePositions(positions)
      
      // 3. Push to history after success
      this.history.push(description, {
        type: 'updateNodePositions',
        positions: positionsWithPrevious,
        anchorClientId
      })

      if (anchorClientId) {
        this.setRecentPlacementAnchorForClientId(anchorClientId)
      }

      this.notifyPersistedMutation()
      
    } catch (error) {
      // 4. Rollback: Restore original positions
      positionsWithPrevious.forEach(({ clientId, previousPosition }) => {
        if (previousPosition) {
          this.store.updateNode(clientId, { position: previousPosition })
        }
      })
      
      showError(`Failed to save positions: ${error.message}`)
      console.error('Failed to batch update positions:', error)
      
      throw error
    }
  }

  // ===== Initialization =====
  
  /**
   * Load existing bot data from server
   * @returns {Promise<void>}
   */
  async loadBot() {
    try {
      const graph = await this.api.loadBot()
      
      // Replace store's graph with loaded graph
      this.store.replaceGraph(graph)
      
      // Push initial state to history (no operation metadata - can't undo initial state)
      this.history.push('Initial state')
      
      return graph
      
    } catch (error) {
      showError(`Failed to load bot: ${error.message}`)
      console.error('Failed to load bot:', error)
      
      throw error
    }
  }
  
  // ===== Utility =====
  
  /**
   * Get server ID for a client ID
   * @param {string} clientId - Client ID
   * @returns {number|null}
   */
  getServerId(clientId) {
    return this.api.getServerId(clientId)
  }
  
  /**
   * Get client ID for a server ID
   * @param {number} serverId - Server ID
   * @returns {string|null}
   */
  getClientId(serverId) {
    return this.api.getClientId(serverId)
  }
  
  /**
   * Check if a node is synced to server
   * @param {string} clientId - Client ID
   * @returns {boolean}
   */
  isSynced(clientId) {
    return this.api.isSynced(clientId)
  }
}

export default SyncManager
