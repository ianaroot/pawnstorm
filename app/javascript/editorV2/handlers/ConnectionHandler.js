/**
 * IMPORTANT: This handler never calls history.push() directly.
 * SyncManager handles history push after successful server sync.
 */
const SPACE_PAN_ACTIVE_CLASS = 'editor-space-pan-active'

class ConnectionHandler {
  
  constructor(store, syncManager, connectionRenderer, viewport = null) {
    this.store = store
    this.syncManager = syncManager
    this.connectionRenderer = connectionRenderer
    this.viewport = viewport
    this.connectionDragClass = 'connection-drag-active'
    
    // Connection drag state
    this.isConnecting = false
    this.sourceClientId = null
    this.sourceElement = null
    this.tempLine = null
    this.activePointerId = null
    
    // Pre-bound handlers (fixes removeEventListener bug)
    this.boundHandlePointerMove = this.handlePointerMove.bind(this)
    this.boundHandlePointerUp = this.handlePointerUp.bind(this)
    this.boundHandlePointerCancel = this.handlePointerCancel.bind(this)
    
    // Element-to-clientId mappings
    this.attachedElements = new WeakMap()
  }
  
  attach(element, clientId) {
    if (this.attachedElements.has(element)) { return }
    this.attachedElements.set(element, clientId)
    const outputConnector = element.querySelector('.node-connector.output')
    if (outputConnector) {
      outputConnector.addEventListener('pointerdown', (e) => {
        this.startConnection(e, clientId, outputConnector)
      })
    }
    // Handle delete button clicks (delegated from node canvas)
    // Note: Delete buttons are created by ConnectionRenderer
  }
  
  isPrimaryPointer(event) {
    return event.isPrimary !== false && (event.pointerType !== 'mouse' || event.button === 0)
  }

  startConnection(event, clientId, sourceConnector) {
    if (!this.isPrimaryPointer(event)) { return }
    if (this.isSpacePanActive()) { return }
    if (this.isConnecting) {
      this.resetConnection()
    }

    event.preventDefault()
    event.stopPropagation()
    const node = this.store.getNode(clientId)
    if (!node) { return }

    // Create temporary line for visual feedback
    const svgContainer = document.getElementById('connections-canvas')
    if (!svgContainer) {
      console.error('SVG container not found')
      return
    }

    this.isConnecting = true
    this.sourceClientId = clientId
    this.sourceElement = sourceConnector
    this.activePointerId = event.pointerId
    this.sourceElement?.setPointerCapture?.(event.pointerId)
    this.setInputConnectorHitTesting(true)
    
    // Create temp line
    this.tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    this.tempLine.classList.add('connection-temp-line')
    this.tempLine.setAttribute('stroke', '#4CAF50')
    this.tempLine.setAttribute('stroke-width', '3')
    this.tempLine.setAttribute('stroke-dasharray', '5,5')
    this.tempLine.style.pointerEvents = 'none'
    
    // Set initial position
    const { x, y } = this.getConnectorPosition(sourceConnector)
    this.tempLine.setAttribute('x1', x)
    this.tempLine.setAttribute('y1', y)
    this.tempLine.setAttribute('x2', x)
    this.tempLine.setAttribute('y2', y)
    
    svgContainer.appendChild(this.tempLine)
    
    // Add document handlers
    document.addEventListener('pointermove', this.boundHandlePointerMove)
    document.addEventListener('pointerup', this.boundHandlePointerUp)
    document.addEventListener('pointercancel', this.boundHandlePointerCancel)
    
    // Add connecting class to source node
    const nodeEl = sourceConnector.closest('.node')
    if (nodeEl) {
      nodeEl.classList.add('connecting-source')
    }
  }
  
  eventMatchesActivePointer(event) {
    return this.activePointerId !== null && event.pointerId === this.activePointerId
  }

  handlePointerMove(event) {
    if (!this.eventMatchesActivePointer(event)) { return }
    if (!this.isConnecting || !this.tempLine) { return }
    const pointer = this.viewport?.screenToGraphPoint(event.clientX, event.clientY) || {
      x: event.clientX,
      y: event.clientY
    }  
    // Update temp line endpoint
    this.tempLine.setAttribute('x2', pointer.x)
    this.tempLine.setAttribute('y2', pointer.y)
  }
  
  handlePointerUp(event) {
    if (!this.eventMatchesActivePointer(event)) { return }
    
    // Check if we're over an input connector
    const releaseTarget = this.releaseTargetFor(event)
    const inputConnector = releaseTarget?.closest?.('.node-connector.input')
    if (inputConnector && this.sourceClientId) {
      const targetNode = inputConnector.closest('.node')
      const targetClientId = targetNode?.dataset.clientId
      
      if (targetClientId && targetClientId !== this.sourceClientId) {
        // Valid target - create connection
        this.finishConnection(this.sourceClientId, targetClientId)
      }
    }

    this.resetConnection()
  }

  handlePointerCancel(event) {
    if (!this.eventMatchesActivePointer(event)) { return }
    this.resetConnection()
  }

  releaseTargetFor(event) {
    return document.elementFromPoint?.(event.clientX, event.clientY) || event.target
  }
  
  async finishConnection(sourceClientId, targetClientId) {
    // Validate
    if (sourceClientId === targetClientId) {
      console.warn('Cannot connect node to itself')
      return
    }
    
    // Check for existing connection
    const existing = this.store.findConnection(sourceClientId, targetClientId)
    if (existing) {
      console.warn('Connection already exists')
      return
    }
    
    // SyncManager handles: optimistic update, server sync, history push
    try {
      await this.syncManager.createConnection(sourceClientId, targetClientId)
    } catch (error) {
      console.error('Failed to create connection:', error)
    }
  }
  
  async deleteConnection(clientId) {
    try {
      await this.syncManager.deleteConnection(clientId)
    } catch (error) {
      console.error('Failed to delete connection:', error)
    }
  }
  
  getConnectorPosition(connector) {
    return this.viewport?.getElementCenterGraphPoint(connector) || { x: 0, y: 0 }
  }
  
  setupDeleteHandler(canvas) {
    canvas.addEventListener('click', (e) => {
      if (this.isSpacePanActive()) { return }
      const deleteBtn = e.target.closest('.connection-delete-btn')
      if (deleteBtn) {
        const clientId = deleteBtn.dataset.clientId
        if (clientId) {
          this.deleteConnection(clientId)
        }
      }
    })
  }
  
  cancelConnection() {
    if (this.isConnecting) {
      this.resetConnection()
    }
  }

  resetConnection() {
    document.removeEventListener('pointermove', this.boundHandlePointerMove)
    document.removeEventListener('pointerup', this.boundHandlePointerUp)
    document.removeEventListener('pointercancel', this.boundHandlePointerCancel)
    this.setInputConnectorHitTesting(false)

    if (this.activePointerId !== null) {
      this.releasePointerCaptureSafely(this.sourceElement, this.activePointerId)
    }

    if (this.sourceElement) {
      const nodeEl = this.sourceElement.closest('.node')
      if (nodeEl) {
        nodeEl.classList.remove('connecting-source')
      }
    }

    if (this.tempLine) {
      this.tempLine.remove()
      this.tempLine = null
    }

    this.isConnecting = false
    this.sourceClientId = null
    this.sourceElement = null
    this.activePointerId = null
  }

  setInputConnectorHitTesting(isActive) {
    document.body?.classList.toggle(this.connectionDragClass, isActive)
  }

  releasePointerCaptureSafely(element, pointerId) {
    if (pointerId === null || !element?.releasePointerCapture) { return }
    if (element.hasPointerCapture?.(pointerId) === false) { return }

    try {
      element.releasePointerCapture(pointerId)
    } catch {
      // Pointer capture may already be released after browser cancellation.
    }
  }
  
  isCurrentlyConnecting() {
    return this.isConnecting
  }
  
  destroy() {
    this.cancelConnection()
    this.attachedElements = new WeakMap()
  }

  isSpacePanActive() {
    return document.body?.classList.contains(SPACE_PAN_ACTIVE_CLASS)
  }
}

export default ConnectionHandler
