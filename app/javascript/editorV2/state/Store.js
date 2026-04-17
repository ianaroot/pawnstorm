import { EVENTS } from 'editorV2/constants'
import Graph from 'editorV2/models/Graph'
import Node from 'editorV2/models/Node'
import Connection from 'editorV2/models/Connection'

/**
 * Store - Single source of truth for application state
 * 
 * Contains:
 * - graph: Graph instance (nodes and connections)
 * - viewState: UI-only state (zoom, pan, selection - NOT in history)
 * 
 * NOT contained:
 * - history: Passed explicitly to components that need it (avoids circular dependency)
 */
class Store {
  constructor() {
    // Graph state (undoable)
    this.graph = new Graph()
    
    // View state (not undoable)
    this.viewState = {
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedNodeIds: [],
      primarySelectedNodeId: null,
      editingNodeId: null,
      recentPlacementAnchor: null,
      isMarqueeSelecting: false,
      marqueeStart: null,
      marqueeCurrent: null
    }
    this.subscribers = [] 
    this.isUpdating = false 
    this.destroyed = false

    // Transient click suppression used to prevent post-drag/post-marquee clicks
    // from immediately overwriting selection state.
    this.clickSuppressedUntil = 0
  }
  
  // ===== Subscriber Pattern =====
  subscribe(callback) {
    this.subscribers.push(callback)
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }
  
  emit(event, data) {
    if (this.destroyed) { return }
    if (this.isUpdating) {
      console.warn(`Recursive emit prevented: ${event}`)
      return
    } 
    this.isUpdating = true
    try {
      this.subscribers.forEach(callback => {
        try {
          callback(event, data)
        } catch (error) {
          console.error(`Error in subscriber for ${event}:`, error)
        }
      })
    } finally {
      this.isUpdating = false
    }
  }
  
  // ===== Graph State Operations =====
  replaceGraph(newGraph) {
    this.graph = newGraph
    this.emit(EVENTS.GRAPH_REPLACE, { graph: newGraph })
  }
  
  // --- Node Operations ---
  addNode(node) {
    if (!(node instanceof Node)) { throw new Error('addNode requires a Node instance') }
    this.graph = this.graph.addNode(node)
    this.emit(EVENTS.NODE_ADD, { node, clientId: node.clientId })
  }
  
  updateNode(clientId, updates) {
    const existingNode = this.graph.getNode(clientId)
    if (!existingNode) {
      console.warn(`Node ${clientId} not found, cannot update`)
      return
    }
    this.graph = this.graph.updateNode(clientId, updates)
    const updatedNode = this.graph.getNode(clientId)
    this.emit(EVENTS.NODE_UPDATE, { node: updatedNode, clientId, updates })
  }
  
  removeNode(clientId) {
    if (!this.graph.hasNode(clientId)) {
      console.warn(`Node ${clientId} not found, cannot remove`)
      return
    }
    // Get connections before removal (for emit)
    const { outgoing, incoming } = this.graph.getConnectionsFor(clientId)
    this.graph = this.graph.removeNode(clientId)
    this.emit(EVENTS.NODE_REMOVE, { clientId })
    // Emit connection removal events
    outgoing.forEach(conn => { this.emit(EVENTS.CONNECTION_REMOVE, { clientId: conn.clientId }) })
    incoming.forEach(conn => { this.emit(EVENTS.CONNECTION_REMOVE, { clientId: conn.clientId }) })
  }
  
  getNode(clientId) {
    return this.graph.getNode(clientId)
  }
  
  getNodes() {
    return this.graph.getNodes()
  }
  
  getNodesByType(type) {
    return this.graph.getNodesByType(type)
  }
  // --- Connection Operations ---
  
  addConnection(connection) {
    if (!(connection instanceof Connection)) { throw new Error('addConnection requires a Connection instance') }
    this.graph = this.graph.addConnection(connection)
    this.emit(EVENTS.CONNECTION_ADD, { connection, clientId: connection.clientId })
  }
  
  updateConnection(clientId, updates) {
    const existingConn = this.graph.getConnection(clientId)
    if (!existingConn) {
      console.warn(`Connection ${clientId} not found, cannot update`)
      return
    }
    this.graph = this.graph.updateConnection(clientId, updates)
    const updatedConn = this.graph.getConnection(clientId)
    this.emit(EVENTS.CONNECTION_UPDATE, { connection: updatedConn, clientId, updates })
  }
  
  removeConnection(clientId) {
    if (!this.graph.hasConnection(clientId)) {
      console.warn(`Connection ${clientId} not found, cannot remove`)
      return
    }
    this.graph = this.graph.removeConnection(clientId)
    this.emit(EVENTS.CONNECTION_REMOVE, { clientId })
  }
  
  getConnection(clientId) {
    return this.graph.getConnection(clientId)
  }
  
  getConnections() {
    return this.graph.getConnections()
  }
  
  findConnection(sourceClientId, targetClientId) {
    return this.graph.findConnection(sourceClientId, targetClientId)
  }
  
  getConnectionsFor(clientId) {
    return this.graph.getConnectionsFor(clientId)
  }

  getInternalConnections(clientIds) {
    const idSet = new Set(clientIds)
    const internal = []
    this.graph.getConnections().forEach(conn => {
      if (idSet.has(conn.sourceId) && idSet.has(conn.targetId)) {
        internal.push(conn)
      }
    })
    return internal
  }

  getDescendantIds(clientId) {
    return this.graph.getDescendantIds(clientId)
  }
  
// ===== View State Operations =====

  setZoom(zoom) {
    this.viewState.zoom = Math.max(0.1, Math.min(5, zoom))
  }

  setPan(panX, panY) {
    this.viewState.panX = panX
    this.viewState.panY = panY
  }

  setSelectedNodeIds(clientIds) {
    const uniqueIds = [...new Set((clientIds || []).filter(Boolean))]
    this.viewState.selectedNodeIds = uniqueIds
    if (uniqueIds.length === 0) {
      this.viewState.primarySelectedNodeId = null
      this.emitSelectionChange()
      return
    }
    if (!uniqueIds.includes(this.viewState.primarySelectedNodeId)) {
      this.viewState.primarySelectedNodeId = uniqueIds[0]
    }
    this.emitSelectionChange()
  }

  selectOnlyNode(clientId) {
    if (!clientId) {
      this.clearSelection()
      return
    }

    this.viewState.selectedNodeIds = [clientId]
    this.viewState.primarySelectedNodeId = clientId
    this.emitSelectionChange()
  }

  addNodeToSelection(clientId) {
    if (!clientId || this.isNodeSelected(clientId)) return

    this.viewState.selectedNodeIds = [...this.viewState.selectedNodeIds, clientId]
    if (!this.viewState.primarySelectedNodeId) {
      this.viewState.primarySelectedNodeId = clientId
    }
    this.emitSelectionChange()
  }

  removeNodeFromSelection(clientId) {
    if (!clientId) return

    this.viewState.selectedNodeIds = this.viewState.selectedNodeIds.filter(id => id !== clientId)

    if (this.viewState.primarySelectedNodeId === clientId) {
      this.viewState.primarySelectedNodeId = this.viewState.selectedNodeIds[0] || null
    }
    this.emitSelectionChange()
  }

  toggleNodeSelection(clientId) {
    if (!clientId) return

    if (this.isNodeSelected(clientId)) {
      this.removeNodeFromSelection(clientId)
    } else {
      this.addNodeToSelection(clientId)
      this.viewState.primarySelectedNodeId = clientId
    }
  }

  clearSelection() {
    this.viewState.selectedNodeIds = []
    this.viewState.primarySelectedNodeId = null
    this.emitSelectionChange()
  }

  emitSelectionChange() {
    this.emit(EVENTS.SELECTION_CHANGE, {
      selectedNodeIds: this.getSelectedNodeIds(),
      primarySelectedNodeId: this.getPrimarySelectedNode()
    })
  }

  isNodeSelected(clientId) {
    return this.viewState.selectedNodeIds.includes(clientId)
  }

  getSelectedNodeIds() {
    return [...this.viewState.selectedNodeIds]
  }

  getPrimarySelectedNode() {
    return this.viewState.primarySelectedNodeId
  }

  /**
   * Backward-compatible single-selection getter.
   * Leave this in place until handlers/renderers are updated.
   * @returns {string|null}
   */
  getSelectedNode() {
    return this.viewState.primarySelectedNodeId
  }

  setEditingNode(clientId) {
    this.viewState.editingNodeId = clientId
  }

  getEditingNode() {
    return this.viewState.editingNodeId
  }

  setRecentPlacementAnchor(point) {
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
      this.viewState.recentPlacementAnchor = null
      return
    }
    this.viewState.recentPlacementAnchor = { x: point.x, y: point.y }
  }

  getRecentPlacementAnchor() {
    const anchor = this.viewState.recentPlacementAnchor
    return anchor ? { x: anchor.x, y: anchor.y } : null
  }

  clearRecentPlacementAnchor() {
    this.viewState.recentPlacementAnchor = null
  }

  startMarquee(point) {
    this.viewState.isMarqueeSelecting = true
    this.viewState.marqueeStart = point
    this.viewState.marqueeCurrent = point
  }

  updateMarquee(point) {
    if (!this.viewState.isMarqueeSelecting) return
    this.viewState.marqueeCurrent = point
  }

  finishMarquee() {
    this.viewState.isMarqueeSelecting = false
    this.viewState.marqueeStart = null
    this.viewState.marqueeCurrent = null
  }

  /**
   * Alias for finishMarquee for call-site readability.
   */
  cancelMarquee() {
    this.finishMarquee()
  }

  getMarqueeState() {
    return {
      isMarqueeSelecting: this.viewState.isMarqueeSelecting,
      marqueeStart: this.viewState.marqueeStart,
      marqueeCurrent: this.viewState.marqueeCurrent
    }
  }

  suppressClicksFor(durationMs = 150) {
    this.clickSuppressedUntil = Date.now() + durationMs
  }

  shouldSuppressClicks() {
    return Date.now() < this.clickSuppressedUntil
  }
  
  // ===== Serialization =====
  getState() {
    return {
      graph: this.graph.toJSON()
    }
  }
  
  restoreState(state) {
    this.graph = Graph.fromJSON(state.graph)
    this.emit(EVENTS.GRAPH_RESTORE, { graph: this.graph })
  }
  
  // ===== Utility ===== 
  getSize() {
    return this.graph.getSize()
  }
  
  clear() {
    this.graph = new Graph()
    this.viewState = {
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedNodeIds: [],
      primarySelectedNodeId: null,
      editingNodeId: null,
      recentPlacementAnchor: null,
      isMarqueeSelecting: false,
      marqueeStart: null,
      marqueeCurrent: null
    }
    this.clickSuppressedUntil = 0
    this.emit(EVENTS.GRAPH_REPLACE, { graph: this.graph })
  }
  
  destroy() {
    this.destroyed = true
    this.subscribers = []
    this.graph = new Graph()
    this.clickSuppressedUntil = 0
    this.viewState.recentPlacementAnchor = null
  }
}

export default Store
