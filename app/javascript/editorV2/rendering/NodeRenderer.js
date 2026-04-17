// rendering/NodeRenderer.js
// Creates and updates node DOM elements from state

import { EVENTS, NODE_COLORS } from 'editorV2/constants'
import { formatConditionPreviewElement } from 'editorV2/utils/conditionPreviewFormatter'

/**
 * NodeRenderer
 * 
 * Subscribes to Store updates and manages node DOM elements.
 * Pure rendering - no business logic.
 */
class NodeRenderer {
  /**
   * Create NodeRenderer
   * @param {HTMLElement} container - Container element for nodes
   * @param {Store} store - Store instance
   * @param {API} api - API instance (for preview fetching)
   */
  constructor(container, store, api) {
    this.container = container
    this.store = store
    this.api = api
    
    // Map: clientId → DOM element
    this.elements = new Map()
    
    // Map: clientId → { x, y, type, dataKey } — lightweight snapshot for diffing on GRAPH_RESTORE
    this.nodeSnapshot = new Map()
    
    // Pending preview fetch controllers (for cancellation)
    this.previewControllers = new Map()
    
    // Subscribe to store updates
    this.unsubscribe = this.store.subscribe(this.handleChange.bind(this))

    // Optional callback for layout-dependent follow-up work (e.g. connections)
    this.onRender = null
    this.onContentRender = null
  }
  
  /**
   * Handle store changes
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  handleChange(event, data) {
    switch (event) {
      case EVENTS.NODE_ADD:
        this.renderNode(data.node)
        break
      
      case EVENTS.NODE_UPDATE:
        this.updateNode(data.clientId, data.updates)
        break
      
      case EVENTS.NODE_REMOVE:
        this.removeNode(data.clientId)
        break
      
      case EVENTS.GRAPH_REPLACE:
        this.renderAllNodes()
        break
      
      case EVENTS.GRAPH_RESTORE:
        this.handleGraphRestore(data.graph)
        break
    }
  }
  
  renderNode(node) {
    const existing = this.elements.get(node.clientId)
    if (existing) {
      existing.remove()
    }
    
    const element = this.createNodeElement(node)
    this.container.appendChild(element)
    this.elements.set(node.clientId, element)
    this.nodeSnapshot.set(node.clientId, {
      x: node.position.x,
      y: node.position.y,
      type: node.type,
      dataKey: JSON.stringify(node.data)
    })
    this.onRender?.(node, element)
    this.fetchPreview(node.clientId)
  }
  
  /**
   * Create DOM element for a node
   * @param {Node} node - Node instance
   * @returns {HTMLElement}
   */
  createNodeElement(node) {
    const element = document.createElement('div')
    element.className = `node ${node.type}`
    if (this.store.isNodeSelected(node.clientId)) {
      element.classList.add('selected')
    }
    element.dataset.clientId = node.clientId
    element.dataset.type = node.type
    element.style.left = `${node.position.x}px`
    element.style.top = `${node.position.y}px`
    
    // Build connectors based on node type
    // Root nodes have no input connector
    let connectors = ''
    if (node.type !== 'root') {
      connectors += '<div class="node-connector input"></div>'
    }
    // Action nodes have no output connector (they are terminal)
    if (node.type !== 'action') {
      connectors += '<div class="node-connector output"></div>'
    }
    
    element.innerHTML = `
      <div class="node-content">
        <div class="node-preview">Loading...</div>
      </div>
      ${connectors}
    `
    
    return element
  }
  
  /**
   * Update an existing node
   * @param {string} clientId - Node client ID
   * @param {Object} updates - Properties that changed
   */
  updateNode(clientId, updates) {
    const element = this.elements.get(clientId)
    if (!element) {
      console.warn(`Element for node ${clientId} not found`)
      return
    }
    
    const snapshot = this.nodeSnapshot.get(clientId)

    if (updates.position) {
      element.style.left = `${updates.position.x}px`
      element.style.top = `${updates.position.y}px`
      if (snapshot) {
        this.nodeSnapshot.set(clientId, { ...snapshot, x: updates.position.x, y: updates.position.y })
      }
    }

    // Refetch preview when data changes or when the server ID arrives.
    // Newly created nodes render optimistically before they have a server ID,
    // so the first preview fetch can only succeed after sync completes.
    if (updates.data !== undefined || updates.serverId !== undefined) {
      this.fetchPreview(clientId)
      if (updates.data !== undefined && snapshot) {
        this.nodeSnapshot.set(clientId, { ...snapshot, dataKey: JSON.stringify(updates.data) })
      }
    }
  }
  
  /**
   * Remove a node element
   * @param {string} clientId - Node client ID
   */
  removeNode(clientId) {
    const element = this.elements.get(clientId)
    if (element) {
      element.remove()
      this.elements.delete(clientId)
    }
    
    this.nodeSnapshot.delete(clientId)

    // Cancel any pending preview fetch
    const controller = this.previewControllers.get(clientId)
    if (controller) {
      controller.abort()
      this.previewControllers.delete(clientId)
    }
  }
  

  async fetchPreview(clientId) {
    // Cancel previous fetch for this node
    const existingController = this.previewControllers.get(clientId)
    if (existingController) {
      existingController.abort()
    }
    
    // Create abort controller for this fetch
    const controller = new AbortController()
    this.previewControllers.set(clientId, controller)
    
    const element = this.elements.get(clientId)
    const previewEl = element?.querySelector('.node-preview')
    
    if (!previewEl) {
      return
    }
    
    try {
      const html = await this.api.getNodePreviewHtml(clientId)
      
      // Check if element still exists and fetch wasn't aborted
      if (!controller.signal.aborted && this.elements.has(clientId)) {
        // Use textContent for simple previews
        // For HTML previews, use innerHTML (ensure server sanitizes)
        previewEl.innerHTML = html || 'Configure...'
        formatConditionPreviewElement(previewEl)
        this.onContentRender?.(clientId)
      }
    } catch (error) {
      // Don't show error if fetch was aborted
      if (error.name === 'AbortError') {
        return
      }
      
      // Show placeholder on error
      if (this.elements.has(clientId)) {
        previewEl.textContent = 'Error loading preview'
      }
      
      console.error(`Failed to fetch preview for node ${clientId}:`, error)
    } finally {
      this.previewControllers.delete(clientId)
    }
  }
  
  handleGraphRestore(graph) {
    const newNodeIds = new Set()
    const newNodes = new Map()
    for (const node of graph.getNodes()) {
      newNodeIds.add(node.clientId)
      newNodes.set(node.clientId, node)
    }

    for (const id of this.elements.keys()) {
      if (!newNodeIds.has(id)) this.removeNode(id)
    }

    for (const node of newNodes.values()) {
      this.reconcileNode(node)
    }
  }

  reconcileNode(node) {
    const existing = this.elements.get(node.clientId)
    if (!existing) {
      this.renderNode(node)
      return
    }

    const snapshot = this.nodeSnapshot.get(node.clientId)
    const typeChanged = node.type !== snapshot?.type
    const dataChanged = JSON.stringify(node.data) !== snapshot?.dataKey
    const positionChanged = node.position.x !== snapshot?.x || node.position.y !== snapshot?.y

    if (typeChanged || dataChanged) {
      this.removeNode(node.clientId)
      this.renderNode(node)
    } else if (positionChanged) {
      existing.style.left = `${node.position.x}px`
      existing.style.top = `${node.position.y}px`
      this.nodeSnapshot.set(node.clientId, {
        ...snapshot,
        x: node.position.x,
        y: node.position.y
      })
      this.onContentRender?.(node.clientId)
    }
  }

  renderAllNodes() {
    // Clear existing
    this.clear()
    
    // Render all nodes from store
    const nodes = this.store.getNodes()
    nodes.forEach(node => this.renderNode(node))
  }
  
  /**
   * Clear all nodes
   */
  clear() {
    // Cancel all pending preview fetches
    this.previewControllers.forEach(controller => controller.abort())
    this.previewControllers.clear()
    
    // Remove all elements
    this.elements.forEach(element => element.remove())
    this.elements.clear()
    this.nodeSnapshot.clear()
  }
  
  /**
   * Get DOM element for a node
   * @param {string} clientId - Node client ID
   * @returns {HTMLElement|undefined}
   */
  getElement(clientId) {
    return this.elements.get(clientId)
  }
  
  /**
   * Get all DOM elements
   * @returns {Map<string, HTMLElement>}
   */
  getAllElements() {
    return new Map(this.elements)
  }
  
  /**
   * Cleanup - remove all elements and unsubscribe
   */
  destroy() {
    this.clear()
    this.unsubscribe()
  }
}

export default NodeRenderer
