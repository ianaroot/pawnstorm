import { findAnchoredNodePlacement } from 'editorV2/utils/nodePlacement'
import generateUUID from 'editorV2/utils/uuid'
import Node from 'editorV2/models/Node'
import Connection from 'editorV2/models/Connection'

class KeyboardHandler {
  constructor(store, history, syncManager, clickHandler = null) {
    this.store = store
    this.history = history
    this.syncManager = syncManager
    this.clickHandler = clickHandler
    this.clipboard = null
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.isAttached = false
  }
  
  attach() {
    if (this.isAttached) { return }
    document.addEventListener('keydown', this.boundHandleKeyDown)
    this.isAttached = true
  }
  
  detach() {
    if (!this.isAttached) { return }
    document.removeEventListener('keydown', this.boundHandleKeyDown)
    this.isAttached = false
  }

  handleKeyDown(event) {
    // Ignore if in input field
    if (this.isInputElement(event.target)) { return }
    const key = event.key?.toLowerCase()
    // Copy: Ctrl/Cmd+C
    if ((event.ctrlKey || event.metaKey) && key === 'c') {
      event.preventDefault()
      this.copySelectedNodes()
      return
    }
    // Paste: Ctrl/Cmd+V
    if ((event.ctrlKey || event.metaKey) && key === 'v') {
      event.preventDefault()
      this.pasteCopiedNodes().catch(error => {
        console.error('Failed to paste nodes:', error)
      })
      return
    }
    
    // Undo: Ctrl+Z / Cmd+Z
    if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) {
      event.preventDefault()
      this.undo()
      return
    }
    
    // Redo: Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y
    if ((event.ctrlKey || event.metaKey) && 
        ((key === 'z' && event.shiftKey) || key === 'y')) {
      event.preventDefault()
      this.redo()
      return
    }
  }

  isInputElement(target) {
    if (!target || !target.tagName) { return false }
    const tag = target.tagName.toLowerCase()
    const isEditable = target.isContentEditable
    return tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable
  }
  
  async undo() {
    if (!this.history.canUndo()) return
    if (this.syncManager.isUndoRedoPending) return  
    await this.syncManager.undo()
    this.updateUndoRedoUI()
  }
  
  async redo() {
    if (!this.history.canRedo()) return
    if (this.syncManager.isUndoRedoPending) return  
    await this.syncManager.redo()
    this.updateUndoRedoUI()
  }
  
  updateUndoRedoUI() {
    const undoBtn = document.querySelector('.btn-undo')
    const redoBtn = document.querySelector('.btn-redo')  
    if (undoBtn) {
      undoBtn.disabled = !this.history.canUndo() || this.syncManager.isUndoRedoPending
      undoBtn.classList.toggle('loading', this.syncManager.isUndoRedoPending)
    }
    if (redoBtn) {
      redoBtn.disabled = !this.history.canRedo() || this.syncManager.isUndoRedoPending
      redoBtn.classList.toggle('loading', this.syncManager.isUndoRedoPending)
    }
  }
  
  canUndo() {
    return this.history.canUndo() && !this.syncManager.isUndoRedoPending
  }
  
  canRedo() {
    return this.history.canRedo() && !this.syncManager.isUndoRedoPending
  }

  deepClone(value) {
    if (typeof structuredClone === 'function') { return structuredClone(value) }
    return JSON.parse(JSON.stringify(value))
  }

  getCopyableSelectedNodes() {
    const selectedIds = this.store.getSelectedNodeIds()
    if (selectedIds.length === 0) { return [] }
    return selectedIds
      .map(clientId => this.store.getNode(clientId))
      .filter(node => node && node.type !== 'root')
  }

  copySelectedNodes() {
    const nodes = this.getCopyableSelectedNodes()
    if (nodes.length === 0) { return false }

    const anchorPosition = { x: nodes[0].position.x, y: nodes[0].position.y }
    const nodeIdToIndex = new Map()
    nodes.forEach((node, index) => { nodeIdToIndex.set(node.clientId, index) })

    const connections = this.store.getInternalConnections(nodes.map(n => n.clientId))
      .map(conn => ({
        sourceIndex: nodeIdToIndex.get(conn.sourceId),
        targetIndex: nodeIdToIndex.get(conn.targetId)
      }))

    this.clipboard = {
      nodes: nodes.map(node => ({
        type: node.type,
        data: this.deepClone(node.data),
        relativeX: node.position.x - anchorPosition.x,
        relativeY: node.position.y - anchorPosition.y
      })),
      connections,
      anchorPosition
    }
    return true
  }

  async pasteCopiedNodes() {
    if (!this.clipboard || !this.syncManager) { return null }
    if (this.clipboard.nodes.length === 0) { return null }

    const anchorType = this.clipboard.nodes[0].type
    const origin = this.store.getRecentPlacementAnchor() || this.clipboard.anchorPosition
    const anchorPosition = findAnchoredNodePlacement(this.store, anchorType, origin)

    const newClientIdMap = this.clipboard.nodes.map(() => generateUUID())

    const nodeModels = this.clipboard.nodes.map((nodeData, index) => new Node({
      clientId: newClientIdMap[index],
      type: nodeData.type,
      position: {
        x: anchorPosition.x + nodeData.relativeX,
        y: anchorPosition.y + nodeData.relativeY
      },
      data: this.deepClone(nodeData.data)
    }))

    const connectionModels = this.clipboard.connections.map(connData => new Connection({
      clientId: generateUUID(),
      sourceId: newClientIdMap[connData.sourceIndex],
      targetId: newClientIdMap[connData.targetIndex]
    }))

    const result = await this.syncManager.insertNodeSet(nodeModels, connectionModels, 'Paste nodes')
    if (result.clientIds.length > 0) {
      this.store.setSelectedNodeIds(result.clientIds)
    }
    return result
  }
  
  destroy() {
    this.detach()
  }
}

export default KeyboardHandler
