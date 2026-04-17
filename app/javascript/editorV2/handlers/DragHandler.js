// handlers/DragHandler.js
// Handles node drag operations with optimistic updates

import {
  DRAG_AUTOPAN_EDGE_THRESHOLD,
  DRAG_AUTOPAN_SPEED,
  DRAG_START_THRESHOLD,
  NODE_DIMENSIONS
} from 'editorV2/constants'

const TOUCH_LONG_PRESS_MS = 450

/**
 * * IMPORTANT: This handler never calls history.push() directly.
 * SyncManager handles history push after successful server sync.
 */
class DragHandler {
  
  constructor(store, syncManager, viewport = null) {
    this.store = store
    this.syncManager = syncManager
    this.viewport = viewport
    
    // Drag state
    this.pendingDrag = null
    this.isDragging = false
    this.draggedClientId = null
    this.draggedNode = null
    this.startPosition = null
    this.draggedClientIds = []
    this.dragOffsets = new Map() // Map<clientId, { dx, dy, startX, startY }>
    this.offset = { x: 0, y: 0 }
    this.hasMoved = false
    this.lastPointerClient = null
    this.activePointerId = null
    this.pointerCaptureElement = null
    this.longPressTimer = null
    this.longPressFired = false
    this.autoPanFrameId = null
    this.autoPanRemainder = { x: 0, y: 0 }

    // Marquee state
    this.isMarqueeSelecting = false
    this.marqueeAdditive = false
    this.marqueeBaseSelectionIds = []
    this.marqueeElement = null
    
    // Pre-bound handlers (fixes removeEventListener bug)
    this.boundHandlePointerMove = this.handlePointerMove.bind(this)
    this.boundHandlePointerUp = this.handlePointerUp.bind(this)
    this.boundHandlePointerCancel = this.handlePointerCancel.bind(this)
    this.boundAutoPanStep = this.autoPanStep.bind(this)
    this.boundHandleBackgroundPointerDown = this.handleBackgroundPointerDown.bind(this)
    
    // Element-to-clientId mappings
    this.attachedElements = new WeakMap()

    this.attachBackgroundHandlers()
  }

  attachBackgroundHandlers() {
    ;[
      this.viewport?.nodesLayer,
      this.viewport?.svgLayer,
      this.viewport?.scene,
      this.viewport?.workspace
    ].filter(Boolean).forEach(layer => {
      layer.addEventListener('pointerdown', this.boundHandleBackgroundPointerDown)
    })
  }
  
  attach(element, clientId) {
    // Prevent duplicate attachments
    if (this.attachedElements.has(element)) { return }
    this.attachedElements.set(element, clientId)
    
    element.addEventListener('pointerdown', (e) => this.handlePointerDown(e, clientId, element))
  }
  
  isPrimaryPointer(event) {
    return event.isPrimary !== false && (event.pointerType !== 'mouse' || event.button === 0)
  }

  handlePointerDown(event, clientId, element) {
    if (!this.isPrimaryPointer(event)) { return }
    
    // Don't interfere with connector clicks
    if (event.target.classList.contains('node-connector')) { return }
    
    const node = this.store.getNode(clientId)
    if (!node) { return }
    
    event.preventDefault()
    event.stopPropagation()

    const pointer = this.viewport?.screenToGraphPoint(event.clientX, event.clientY) || {
      x: event.clientX,
      y: event.clientY
    }

    this.pendingDrag = {
      clientId,
      element,
      node,
      pointerClient: { x: event.clientX, y: event.clientY },
      pointerGraph: pointer,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      pointerId: event.pointerId,
      pointerType: event.pointerType
    }

    this.beginPointerTracking(event, element)
    this.startLongPressTimer(event, clientId)
  }

  beginPointerTracking(event, captureElement) {
    this.endPointerTracking()
    this.activePointerId = event.pointerId
    this.pointerCaptureElement = captureElement
    this.pointerCaptureElement?.setPointerCapture?.(event.pointerId)
    document.addEventListener('pointermove', this.boundHandlePointerMove)
    document.addEventListener('pointerup', this.boundHandlePointerUp)
    document.addEventListener('pointercancel', this.boundHandlePointerCancel)
  }

  endPointerTracking() {
    if (this.activePointerId !== null) {
      this.releasePointerCaptureSafely(this.pointerCaptureElement, this.activePointerId)
    }
    document.removeEventListener('pointermove', this.boundHandlePointerMove)
    document.removeEventListener('pointerup', this.boundHandlePointerUp)
    document.removeEventListener('pointercancel', this.boundHandlePointerCancel)
    this.activePointerId = null
    this.pointerCaptureElement = null
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

  eventMatchesActivePointer(event) {
    return this.activePointerId !== null && event.pointerId === this.activePointerId
  }

  startLongPressTimer(event, clientId) {
    this.clearLongPressTimer()
    this.longPressFired = false
    if (event.pointerType !== 'touch') { return }

    this.longPressTimer = window.setTimeout(() => {
      if (!this.pendingDrag || this.pendingDrag.clientId !== clientId) { return }
      this.store.toggleNodeSelection(clientId)
      this.pendingDrag = null
      this.longPressFired = true
      this.store.suppressClicksFor()
    }, TOUCH_LONG_PRESS_MS)
  }

  clearLongPressTimer() {
    if (this.longPressTimer) {
      window.clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  resolveDragTargetIds(event, clientId) {
    const selectedIds = this.store.getSelectedNodeIds()
    const nodeIsSelected = this.store.isNodeSelected(clientId)

    if (event.altKey) {
      if (!nodeIsSelected) {
        this.store.selectOnlyNode(clientId)
      }
      return [clientId]
    }

    if (event.shiftKey) {
      if (!nodeIsSelected) {
        this.store.addNodeToSelection(clientId)
      }
      return this.store.getSelectedNodeIds()
    }

    if (nodeIsSelected) {
      if (selectedIds.length > 1) {
        return selectedIds
      }
      return [clientId, ...this.store.getDescendantIds(clientId)]
    }

    this.store.selectOnlyNode(clientId)
    return [clientId, ...this.store.getDescendantIds(clientId)]
  }

  handleBackgroundPointerDown(event) {
    if (!this.isPrimaryPointer(event)) { return }
    if (event.target.closest('.node') || event.target.closest('.node-connector')) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const startPoint = this.viewport?.screenToGraphPoint(event.clientX, event.clientY) || {
      x: event.clientX,
      y: event.clientY
    }

    this.pendingDrag = {
      background: true,
      pointerClient: { x: event.clientX, y: event.clientY },
      pointerGraph: startPoint,
      shiftKey: event.shiftKey,
      pointerId: event.pointerId,
      pointerType: event.pointerType
    }

    this.beginPointerTracking(event, event.currentTarget)
  }
  
  handlePointerMove(event) {
    if (!this.eventMatchesActivePointer(event)) { return }

    if (this.isMarqueeSelecting) {
      const point = this.viewport?.screenToGraphPoint(event.clientX, event.clientY) || {
        x: event.clientX,
        y: event.clientY
      }
      this.store.updateMarquee(point)
      this.renderMarquee()
      return
    }

    if (this.isDragging && this.draggedClientId) {
      this.lastPointerClient = { x: event.clientX, y: event.clientY }
      this.updateDragPosition(event.clientX, event.clientY)
      return
    }

    if (this.pendingDrag) {
      const dx = event.clientX - this.pendingDrag.pointerClient.x
      const dy = event.clientY - this.pendingDrag.pointerClient.y

      if (Math.hypot(dx, dy) < DRAG_START_THRESHOLD) {
        return
      }

      this.clearLongPressTimer()

      if (this.pendingDrag.background) {
        this.beginMarqueeSelection(this.pendingDrag)
      } else {
        this.beginNodeDrag(this.pendingDrag)
        this.lastPointerClient = { x: event.clientX, y: event.clientY }
        this.updateDragPosition(event.clientX, event.clientY)
      }
    }
  }

  beginNodeDrag(pendingDrag) {
    const { clientId, node, pointerGraph } = pendingDrag

    this.pendingDrag = null
    this.isDragging = true
    this.draggedClientId = clientId
    this.draggedNode = node
    this.hasMoved = false

    const dragTargetIds = this.resolveDragTargetIds(pendingDrag, clientId)
    this.draggedClientIds = dragTargetIds
    this.startPosition = { ...node.position }
    this.dragOffsets.clear()

    dragTargetIds.forEach(id => {
      if (id === clientId) return

      const draggedNode = this.store.getNode(id)
      if (draggedNode) {
        this.dragOffsets.set(id, {
          dx: draggedNode.position.x - node.position.x,
          dy: draggedNode.position.y - node.position.y,
          startX: draggedNode.position.x,
          startY: draggedNode.position.y
        })
      }
    })

    dragTargetIds.forEach(id => {
      const draggedElement = document.querySelector(`[data-client-id="${id}"]`)
      draggedElement?.classList.add('dragging')
    })

    this.autoPanRemainder = { x: 0, y: 0 }
    this.offset = {
      x: pointerGraph.x - node.position.x,
      y: pointerGraph.y - node.position.y
    }

    this.viewport?.beginInteraction()
    this.startAutoPanLoop()
  }

  beginMarqueeSelection(pendingDrag) {
    this.pendingDrag = null
    this.isMarqueeSelecting = true
    this.marqueeAdditive = pendingDrag.shiftKey
    this.marqueeBaseSelectionIds = pendingDrag.shiftKey ? this.store.getSelectedNodeIds() : []
    this.store.startMarquee(pendingDrag.pointerGraph)
    this.renderMarquee()
  }
  
  handlePointerUp(event) {
    if (!this.eventMatchesActivePointer(event)) { return }

    if (this.longPressFired) {
      this.clearLongPressTimer()
      this.endPointerTracking()
      this.longPressFired = false
      this.store.suppressClicksFor()
      return
    }

    if (this.pendingDrag) {
      this.clearLongPressTimer()
      this.endPointerTracking()
      this.pendingDrag = null
      return
    }

    if (this.isMarqueeSelecting) {
      this.endPointerTracking()
      this.finishMarqueeSelection()
      return
    }

    this.stopAutoPanLoop()
    this.viewport?.endInteraction()

    // Remove document handlers immediately
    this.clearLongPressTimer()
    this.endPointerTracking()
    
    // Remove visual feedback
    this.draggedClientIds.forEach(id => {
      const element = document.querySelector(`[data-client-id="${id}"]`)
      element?.classList.remove('dragging')
    })
    
    // Sync with server if we moved
    if (this.hasMoved && this.draggedClientId && this.draggedNode) {
      const node = this.store.getNode(this.draggedClientId)
      const anchorPoint = node ? { x: node.position.x, y: node.position.y } : null
      if (node) {
        if (this.draggedClientIds.length > 1) {
          // Multi-node drag: use batch update
          const positions = this.draggedClientIds.map(id => {
            const draggedNode = this.store.getNode(id)
            return draggedNode ? { clientId: id, x: draggedNode.position.x, y: draggedNode.position.y } : null
          }).filter(Boolean)

          const additionalCount = this.draggedClientIds.length - 1
          const description = `Move ${this.draggedNode.type} node (+ ${additionalCount} selected)`
          
          this.syncManager.batchUpdatePositions(positions, description)
            .then(() => {
              if (anchorPoint) {
                this.store.setRecentPlacementAnchor(anchorPoint)
              }
            })
            .catch(err => {
              console.error('Failed to sync drag positions:', err)
            })
        } else {
          // Single-node drag
          this.syncManager.updateNodePosition(
            this.draggedClientId,
            node.position.x,
            node.position.y
          ).then(() => {
            if (anchorPoint) {
              this.store.setRecentPlacementAnchor(anchorPoint)
            }
          }).catch(err => {
            console.error('Failed to sync drag position:', err)
          })
        }
      }
    }

    if (this.hasMoved) {
      this.store.suppressClicksFor()
    }
    
    // Reset state
    this.isDragging = false
    this.draggedClientId = null
    this.draggedNode = null
    this.startPosition = null
    this.draggedClientIds = []
    this.hasMoved = false
    this.lastPointerClient = null
    this.longPressFired = false
    this.autoPanRemainder = { x: 0, y: 0 }
    this.dragOffsets.clear()
  }

  handlePointerCancel(event) {
    if (!this.eventMatchesActivePointer(event)) { return }
    this.cancelDrag()
    this.store.suppressClicksFor()
  }

  updateDragPosition(clientX, clientY) {
    const pointer = this.viewport?.screenToGraphPoint(clientX, clientY) || {
      x: clientX,
      y: clientY
    }
    const x = pointer.x - this.offset.x
    const y = pointer.y - this.offset.y

    const node = this.store.getNode(this.draggedClientId)
    if (node && node.position.x === x && node.position.y === y) {
      return
    }

    this.hasMoved = true
    this.store.updateNode(this.draggedClientId, { position: { x, y } })

    const element = document.querySelector(`[data-client-id="${this.draggedClientId}"]`)
    if (element) {
      element.style.left = `${x}px`
      element.style.top = `${y}px`
    }

    this.dragOffsets.forEach((offset, childId) => {
        const childX = x + offset.dx
        const childY = y + offset.dy

        this.store.updateNode(childId, { position: { x: childX, y: childY } })

        const childElement = document.querySelector(`[data-client-id="${childId}"]`)
        if (childElement) {
          childElement.style.left = `${childX}px`
          childElement.style.top = `${childY}px`
        }
      })
  }

  finishMarqueeSelection() {
    const hitIds = this.getMarqueeHitNodeIds()
    const nextSelectionIds = this.marqueeAdditive
      ? [...new Set([...this.marqueeBaseSelectionIds, ...hitIds])]
      : hitIds

    this.store.setSelectedNodeIds(nextSelectionIds)
    this.store.suppressClicksFor()
    this.clearMarquee()
  }

  getMarqueeHitNodeIds() {
    const { marqueeStart, marqueeCurrent } = this.store.getMarqueeState()
    if (!marqueeStart || !marqueeCurrent) {
      return []
    }

    const left = Math.min(marqueeStart.x, marqueeCurrent.x)
    const right = Math.max(marqueeStart.x, marqueeCurrent.x)
    const top = Math.min(marqueeStart.y, marqueeCurrent.y)
    const bottom = Math.max(marqueeStart.y, marqueeCurrent.y)

    return this.store.getNodes().filter(node => {
      const dims = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS.default
      const nodeLeft = node.position.x
      const nodeRight = node.position.x + dims.width
      const nodeTop = node.position.y
      const nodeBottom = node.position.y + dims.height

      return (
        nodeRight >= left &&
        nodeLeft <= right &&
        nodeBottom >= top &&
        nodeTop <= bottom
      )
    }).map(node => node.clientId)
  }

  ensureMarqueeElement() {
    if (this.marqueeElement || !this.viewport?.nodesLayer) {
      return this.marqueeElement
    }
    this.marqueeElement = document.createElement('div')
    this.marqueeElement.className = 'selection-marquee'
    this.viewport.nodesLayer.appendChild(this.marqueeElement)
    return this.marqueeElement
  }

  renderMarquee() {
    const { isMarqueeSelecting, marqueeStart, marqueeCurrent } = this.store.getMarqueeState()
    const marqueeEl = this.ensureMarqueeElement()
    if (!marqueeEl) { return }
    if (!isMarqueeSelecting || !marqueeStart || !marqueeCurrent) {
      marqueeEl.classList.add('hidden')
      return
    }

    const left = Math.min(marqueeStart.x, marqueeCurrent.x)
    const top = Math.min(marqueeStart.y, marqueeCurrent.y)
    const width = Math.abs(marqueeCurrent.x - marqueeStart.x)
    const height = Math.abs(marqueeCurrent.y - marqueeStart.y)

    marqueeEl.classList.remove('hidden')
    marqueeEl.style.left = `${left}px`
    marqueeEl.style.top = `${top}px`
    marqueeEl.style.width = `${width}px`
    marqueeEl.style.height = `${height}px`
  }

  clearMarquee() {
    this.isMarqueeSelecting = false
    this.marqueeAdditive = false
    this.marqueeBaseSelectionIds = []
    this.store.finishMarquee()

    if (this.marqueeElement) {
      this.marqueeElement.classList.add('hidden')
      this.marqueeElement.style.left = '0px'
      this.marqueeElement.style.top = '0px'
      this.marqueeElement.style.width = '0px'
      this.marqueeElement.style.height = '0px'
    }
  }

  startAutoPanLoop() {
    if (!this.viewport?.container || this.autoPanFrameId) { return }
    this.autoPanFrameId = requestAnimationFrame(this.boundAutoPanStep)
  }

  stopAutoPanLoop() {
    if (!this.autoPanFrameId) {
      return
    }

    cancelAnimationFrame(this.autoPanFrameId)
    this.autoPanFrameId = null
  }

  autoPanStep() {
    this.autoPanFrameId = null

    if (!this.isDragging || !this.lastPointerClient || !this.viewport?.container) {
      return
    }

    const container = this.viewport.container
    const rect = container.getBoundingClientRect()
    const deltaX = this.getAutoPanDelta(
      this.lastPointerClient.x,
      rect.left,
      rect.right
    )
    const deltaY = this.getAutoPanDelta(
      this.lastPointerClient.y,
      rect.top,
      rect.bottom
    )

    if (deltaX !== 0 || deltaY !== 0) {
      this.autoPanRemainder.x += deltaX
      this.autoPanRemainder.y += deltaY

      const scrollDeltaX = this.extractScrollDelta('x')
      const scrollDeltaY = this.extractScrollDelta('y')

      if (scrollDeltaX !== 0 || scrollDeltaY !== 0) {
        container.scrollLeft += scrollDeltaX
        container.scrollTop += scrollDeltaY
        this.updateDragPosition(this.lastPointerClient.x, this.lastPointerClient.y)
      }
    }

    this.autoPanFrameId = requestAnimationFrame(this.boundAutoPanStep)
  }

  getAutoPanDelta(pointer, minEdge, maxEdge) {
    const distanceToMin = pointer - minEdge
    if (distanceToMin < DRAG_AUTOPAN_EDGE_THRESHOLD) {
      return -DRAG_AUTOPAN_SPEED
    }

    const distanceToMax = maxEdge - pointer
    if (distanceToMax < DRAG_AUTOPAN_EDGE_THRESHOLD) {
      return DRAG_AUTOPAN_SPEED
    }

    return 0
  }

  extractScrollDelta(axis) {
    const remainder = this.autoPanRemainder[axis]
    const delta = remainder > 0 ? Math.floor(remainder) : Math.ceil(remainder)
    this.autoPanRemainder[axis] = remainder - delta
    return delta
  }
  
  isCurrentlyDragging() {
    return this.isDragging
  }
  
  getDraggedNodeId() {
    return this.draggedClientId
  }
  
  cancelDrag() {
    this.clearLongPressTimer()
    this.pendingDrag = null

    if (this.isMarqueeSelecting) {
      this.endPointerTracking()
      this.clearMarquee()
      return
    }

    if (this.isDragging) {
      // Restore dragged node position
      if (this.startPosition && this.draggedClientId) {
        this.store.updateNode(this.draggedClientId, { position: this.startPosition })
        
        const element = document.querySelector(`[data-client-id="${this.draggedClientId}"]`)
        if (element) {
          element.style.left = `${this.startPosition.x}px`
          element.style.top = `${this.startPosition.y}px`
        }
      }
      
      // Restore descendant positions
      this.dragOffsets.forEach((offset, childId) => {
          this.store.updateNode(childId, { position: { x: offset.startX, y: offset.startY } })
          
          const childElement = document.querySelector(`[data-client-id="${childId}"]`)
          if (childElement) {
            childElement.style.left = `${offset.startX}px`
            childElement.style.top = `${offset.startY}px`
          }
        })

      this.draggedClientIds.forEach(id => {
        const draggedElement = document.querySelector(`[data-client-id="${id}"]`)
        draggedElement?.classList.remove('dragging')
      })
      
      // Remove handlers
      this.endPointerTracking()
      this.stopAutoPanLoop()
      this.viewport?.endInteraction()
      
      // Reset state
      this.isDragging = false
      this.draggedClientId = null
      this.draggedNode = null
      this.draggedClientIds = []
      this.startPosition = null
      this.hasMoved = false
      this.lastPointerClient = null
      this.longPressFired = false
      this.autoPanRemainder = { x: 0, y: 0 }
      this.dragOffsets.clear()
    }

    if (!this.isDragging && !this.isMarqueeSelecting) {
      this.endPointerTracking()
      this.longPressFired = false
    }
  }
  
  destroy() {
    // Cancel any active drag
    this.cancelDrag()
    this.clearMarquee()
    ;[
      this.viewport?.nodesLayer,
      this.viewport?.svgLayer,
      this.viewport?.scene,
      this.viewport?.workspace
    ].filter(Boolean).forEach(layer => {
      layer.removeEventListener('pointerdown', this.boundHandleBackgroundPointerDown)
    })
    this.marqueeElement?.remove()
    
    // Clear mappings
    this.attachedElements = new WeakMap()
  }
}

export default DragHandler
