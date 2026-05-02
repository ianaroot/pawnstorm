// rendering/ConnectionRenderer.js
// Creates and updates connection SVG lines from state

import {
  EVENTS,
  CONNECTION_COLOR,
  CONNECTION_STROKE_WIDTH,
  CONNECTION_HOVER_HITAREA_WIDTH,
  CONNECTION_DELETE_BUTTON_SIZE,
  CONNECTION_DELETE_BUTTON_MIN_SIZE,
  CONNECTION_DELETE_BUTTON_MAX_SIZE
} from 'editorV2/constants'
import { getConnectionPoints } from 'editorV2/rendering/connectionGeometry'

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) { return Math.hypot(px - x1, py - y1) }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

/**
 * ConnectionRenderer
 *
 * Subscribes to Store updates and manages connection SVG elements.
 * Pure rendering - no business logic.
 *
 * Each connection has:
 * - A visible line element
 * - A delete button positioned at the midpoint
 *
 * Hover detection uses geometric proximity via mousemove on the canvas
 * container rather than SVG hit-area elements, so overlapping connections
 * always resolve to the nearest one regardless of render order.
 */
class ConnectionRenderer {
  constructor(svgContainer, store, viewport = null) {
    this.svgContainer = svgContainer
    this.store = store
    this.viewport = viewport

    // Map: clientId → { line, deleteBtn }
    this.elements = new Map()

    // Map: clientId → { sourceX, sourceY, targetX, targetY } — lightweight snapshot for diffing on GRAPH_RESTORE
    this.connectionSnapshot = new Map()

    this._hoveredConnectionId = null
    this._rafPending = false
    this._boundHandleMouseMove = this._handleMouseMove.bind(this)
    this._boundHandleMouseLeave = this._handleMouseLeave.bind(this)

    this.unsubscribe = this.store.subscribe(this.handleChange.bind(this))
    this.unsubscribeViewport = this.viewport?.subscribe(() => this.updateDeleteButtonPositions())
  }

  currentZoom() {
    return this.viewport?.getZoom?.() || 1
  }

  scaledHoverHitAreaWidth() {
    return Math.max(CONNECTION_HOVER_HITAREA_WIDTH, CONNECTION_HOVER_HITAREA_WIDTH / this.currentZoom())
  }

  scaledDeleteButtonSize() {
    const scaled = CONNECTION_DELETE_BUTTON_SIZE / this.currentZoom()
    return Math.max(CONNECTION_DELETE_BUTTON_MIN_SIZE, Math.min(CONNECTION_DELETE_BUTTON_MAX_SIZE, scaled))
  }

  applyInteractiveSizing({ deleteBtn }) {
    if (deleteBtn) {
      const size = this.scaledDeleteButtonSize()
      deleteBtn.style.setProperty('--connection-delete-button-size', `${size}px`)
      deleteBtn.style.setProperty('--connection-delete-button-font-size', `${Math.max(12, size * 0.6)}px`)
    }
  }

  attachHoverTracking() {
    const canvas = this.svgContainer.parentElement
    if (!canvas) { return }
    canvas.addEventListener('mousemove', this._boundHandleMouseMove)
    canvas.addEventListener('mouseleave', this._boundHandleMouseLeave)
  }

  _handleMouseMove(event) {
    if (this._rafPending) { return }
    this._rafPending = true
    requestAnimationFrame(() => {
      this._rafPending = false
      this._updateHoveredConnection(event.clientX, event.clientY)
    })
  }

  _handleMouseLeave() {
    this._setHoveredConnection(null)
  }

  _updateHoveredConnection(clientX, clientY) {
    const graphPoint = this.viewport?.screenToGraphPoint(clientX, clientY) || { x: clientX, y: clientY }
    const threshold = this.scaledHoverHitAreaWidth() / 2

    let nearestId = null
    let nearestDist = threshold

    for (const [clientId, elements] of this.elements) {
      const x1 = parseFloat(elements.line.getAttribute('x1'))
      const y1 = parseFloat(elements.line.getAttribute('y1'))
      const x2 = parseFloat(elements.line.getAttribute('x2'))
      const y2 = parseFloat(elements.line.getAttribute('y2'))
      const dist = pointToSegmentDistance(graphPoint.x, graphPoint.y, x1, y1, x2, y2)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestId = clientId
      }
    }

    this._setHoveredConnection(nearestId)
  }

  _setHoveredConnection(clientId) {
    if (this._hoveredConnectionId === clientId) { return }
    if (this._hoveredConnectionId) {
      const prev = this.elements.get(this._hoveredConnectionId)
      if (prev) { prev.deleteBtn.style.display = 'none' }
    }
    if (clientId) {
      const curr = this.elements.get(clientId)
      if (curr) { curr.deleteBtn.style.display = 'block' }
    }
    this._hoveredConnectionId = clientId
  }

  /**
   * Handle store changes
   */
  handleChange(event, data) {
    switch (event) {
      case EVENTS.CONNECTION_ADD:
        this.renderConnection(data.connection)
        break

      case EVENTS.CONNECTION_REMOVE:
        this.removeConnection(data.clientId)
        break

      case EVENTS.NODE_UPDATE:
        this.updateConnectionsFor(data.clientId)
        break

      case EVENTS.NODE_REMOVE:
        this.removeConnectionsForNode(data.clientId)
        break

      case EVENTS.GRAPH_REPLACE:
        this.renderAllConnections()
        break

      case EVENTS.GRAPH_RESTORE:
        this.handleGraphRestore(data.graph)
        break
    }
  }

  /**
   * Render a single connection
   */
  renderConnection(connection) {
    const existing = this.elements.get(connection.clientId)
    if (existing) {
      this.removeConnectionElements(existing)
    }

    const sourceNode = this.store.getNode(connection.sourceId)
    const targetNode = this.store.getNode(connection.targetId)

    if (!sourceNode || !targetNode) {
      console.warn(`Cannot render connection ${connection.clientId}: missing node`, connection.sourceId, connection.targetId)
      return
    }

    const sourceEl = this.container.querySelector(`[data-client-id="${connection.sourceId}"]`)
    const targetEl = this.container.querySelector(`[data-client-id="${connection.targetId}"]`)

    if (!sourceEl || !targetEl) {
      console.warn(`Cannot render connection ${connection.clientId}: missing node element`, connection.sourceId, connection.targetId)
      return
    }

    const { startX, startY, endX, endY } = this.getConnectionPoints(sourceNode, targetNode)

    const { line, deleteBtn } = this.createConnectionElements(
      connection.clientId,
      connection.sourceId,
      connection.targetId,
      startX, startY, endX, endY
    )

    this.svgContainer.appendChild(line)

    const canvas = this.svgContainer.parentElement
    if (canvas) {
      canvas.appendChild(deleteBtn)
    }

    this.elements.set(connection.clientId, { line, deleteBtn })
    this.connectionSnapshot.set(connection.clientId, {
      sourceX: sourceNode.position.x,
      sourceY: sourceNode.position.y,
      targetX: targetNode.position.x,
      targetY: targetNode.position.y
    })
  }

  getConnectionPoints(sourceNode, targetNode) {
    const sourceEl = this.container?.querySelector(`[data-client-id="${sourceNode.clientId}"]`)
    const sourceOutputBottomOffset = this.getRenderedOutputBottomOffset(sourceNode, sourceEl)
    return getConnectionPoints(sourceNode, targetNode, { sourceOutputBottomOffset })
  }

  getRenderedOutputBottomOffset(sourceNode, sourceEl) {
    if (!sourceEl || sourceNode.type === 'root') {
      return undefined
    }
    return sourceEl.offsetHeight
  }

  /**
   * Create connection SVG line and delete button
   */
  createConnectionElements(clientId, sourceId, targetId, startX, startY, endX, endY) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.classList.add('connection-line')
    line.setAttribute('x1', startX)
    line.setAttribute('y1', startY)
    line.setAttribute('x2', endX)
    line.setAttribute('y2', endY)
    line.setAttribute('stroke', CONNECTION_COLOR)
    line.setAttribute('stroke-width', CONNECTION_STROKE_WIDTH)
    line.style.pointerEvents = 'none'
    line.dataset.clientId = clientId
    line.dataset.sourceId = sourceId
    line.dataset.targetId = targetId

    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const sceneMidpoint = this.viewport?.graphToScenePoint(midX, midY) || { x: midX, y: midY }

    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'connection-delete-btn'
    deleteBtn.textContent = ''
    deleteBtn.setAttribute('aria-label', 'Delete connection')
    deleteBtn.style.cssText = `
      position: absolute;
      left: ${sceneMidpoint.x}px;
      top: ${sceneMidpoint.y}px;
      background: #e94560;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      line-height: 1;
      display: none;
      pointer-events: auto;
      transform: translate(-50%, -50%);
      z-index: 100;
    `
    deleteBtn.dataset.clientId = clientId
    deleteBtn.dataset.sourceId = sourceId
    deleteBtn.dataset.targetId = targetId
    this.applyInteractiveSizing({ deleteBtn })

    return { line, deleteBtn }
  }

  /**
   * Update connection positions for a node
   */
  updateConnectionsFor(clientId) {
    const { outgoing, incoming } = this.store.getConnectionsFor(clientId)
    const allConnections = [...outgoing, ...incoming]
    allConnections.forEach(conn => {
      this.updateConnectionPosition(conn.clientId)
    })
  }

  /**
   * Update a single connection's position
   */
  updateConnectionPosition(clientId) {
    const elements = this.elements.get(clientId)
    const connection = this.store.getConnection(clientId)

    if (!elements || !connection) { return }

    const sourceNode = this.store.getNode(connection.sourceId)
    const targetNode = this.store.getNode(connection.targetId)

    if (!sourceNode || !targetNode) { return }

    const { startX, startY, endX, endY } = this.getConnectionPoints(sourceNode, targetNode)

    elements.line.setAttribute('x1', startX)
    elements.line.setAttribute('y1', startY)
    elements.line.setAttribute('x2', endX)
    elements.line.setAttribute('y2', endY)

    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const sceneMidpoint = this.viewport?.graphToScenePoint(midX, midY) || { x: midX, y: midY }
    elements.deleteBtn.style.left = `${sceneMidpoint.x}px`
    elements.deleteBtn.style.top = `${sceneMidpoint.y}px`
    this.applyInteractiveSizing(elements)

    this.connectionSnapshot.set(clientId, {
      sourceX: sourceNode.position.x,
      sourceY: sourceNode.position.y,
      targetX: targetNode.position.x,
      targetY: targetNode.position.y
    })
  }

  updateDeleteButtonPositions() {
    this.elements.forEach((elements, clientId) => {
      const connection = this.store.getConnection(clientId)
      if (!connection) { return }

      const sourceNode = this.store.getNode(connection.sourceId)
      const targetNode = this.store.getNode(connection.targetId)

      if (!sourceNode || !targetNode) { return }

      const midX = (elements.line.x1.baseVal.value + elements.line.x2.baseVal.value) / 2
      const midY = (elements.line.y1.baseVal.value + elements.line.y2.baseVal.value) / 2
      const sceneMidpoint = this.viewport?.graphToScenePoint(midX, midY) || { x: midX, y: midY }

      elements.deleteBtn.style.left = `${sceneMidpoint.x}px`
      elements.deleteBtn.style.top = `${sceneMidpoint.y}px`
      this.applyInteractiveSizing(elements)
    })
  }

  /**
   * Remove a connection
   */
  removeConnection(clientId) {
    if (clientId === this._hoveredConnectionId) {
      this._hoveredConnectionId = null
    }
    const elements = this.elements.get(clientId)
    if (elements) {
      this.removeConnectionElements(elements)
      this.elements.delete(clientId)
    }
    this.connectionSnapshot.delete(clientId)
  }

  removeConnectionElements(elements) {
    elements.line?.remove()
    elements.deleteBtn?.remove()
  }

  removeConnectionsForNode(clientId) {
    this.elements.forEach((elements, connClientId) => {
      const conn = this.store.getConnection(connClientId)
      if (!conn) {
        if (connClientId === this._hoveredConnectionId) {
          this._hoveredConnectionId = null
        }
        this.removeConnectionElements(elements)
        this.elements.delete(connClientId)
        this.connectionSnapshot.delete(connClientId)
      }
    })
  }

  handleGraphRestore(graph) {
    const newConnectionIds = new Set()
    const newConnections = new Map()
    for (const conn of graph.getConnections()) {
      newConnectionIds.add(conn.clientId)
      newConnections.set(conn.clientId, conn)
    }

    for (const id of this.elements.keys()) {
      if (!newConnectionIds.has(id)) this.removeConnection(id)
    }

    for (const conn of newConnections.values()) {
      this.reconcileConnection(conn)
    }
  }

  reconcileConnection(conn) {
    const existing = this.elements.get(conn.clientId)
    if (!existing) {
      this.renderConnection(conn)
      return
    }

    const sourceNode = this.store.getNode(conn.sourceId)
    const targetNode = this.store.getNode(conn.targetId)
    // Safety net: nodes should always exist by this point (NodeRenderer processes GRAPH_RESTORE
    // first), but if a connection references a missing node, rebuild it from scratch.
    if (!sourceNode || !targetNode) {
      this.removeConnection(conn.clientId)
      this.renderConnection(conn)
      return
    }

    const snapshot = this.connectionSnapshot.get(conn.clientId)
    const sourceMoved = !snapshot || sourceNode.position.x !== snapshot.sourceX || sourceNode.position.y !== snapshot.sourceY
    const targetMoved = !snapshot || targetNode.position.x !== snapshot.targetX || targetNode.position.y !== snapshot.targetY

    if (sourceMoved || targetMoved) {
      this.updateConnectionPosition(conn.clientId)
    }
  }

  renderAllConnections() {
    this.clear()
    const connections = this.store.getConnections()
    connections.forEach(conn => this.renderConnection(conn))
  }

  clear() {
    this.elements.forEach(elements => {
      this.removeConnectionElements(elements)
    })
    this.elements.clear()
    this.connectionSnapshot.clear()
    this._hoveredConnectionId = null
  }

  getDeleteButton(clientId) {
    return this.elements.get(clientId)?.deleteBtn
  }

  /**
   * Cleanup - remove all elements and unsubscribe
   */
  destroy() {
    const canvas = this.svgContainer.parentElement
    if (canvas) {
      canvas.removeEventListener('mousemove', this._boundHandleMouseMove)
      canvas.removeEventListener('mouseleave', this._boundHandleMouseLeave)
    }
    this.clear()
    this.unsubscribe()
    this.unsubscribeViewport?.()
  }
}

export default ConnectionRenderer
