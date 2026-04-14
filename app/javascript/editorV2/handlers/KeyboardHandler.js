import { findAnchoredNodePlacement } from '../utils/nodePlacement.js'

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
      this.copySelectedNode()
      return
    }
    // Paste: Ctrl/Cmd+V
    if ((event.ctrlKey || event.metaKey) && key === 'v') {
      event.preventDefault()
      this.pasteCopiedNode().catch(error => {
        console.error('Failed to paste node:', error)
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

  getCopyableSelectedNode() {
    const selectedIds = this.store.getSelectedNodeIds()
    if (selectedIds.length !== 1) { return null }
    const node = this.store.getNode(selectedIds[0])
    if (!node || node.type === 'root') { return null }
    return node
  }

  copySelectedNode() {
    const node = this.getCopyableSelectedNode()
    if (!node) { return false }
    this.clipboard = {
      type: node.type,
      data: this.deepClone(node.data),
      position: { ...node.position }
    }
    return true
  }

  async pasteCopiedNode() {
    if (!this.clipboard || !this.syncManager) { return null }
    const origin = this.store.getRecentPlacementAnchor() || this.clipboard.position
    const position = findAnchoredNodePlacement(this.store, this.clipboard.type, origin)
    const clientId = await this.syncManager.createNode(
      this.clipboard.type,
      position,
      this.deepClone(this.clipboard.data)
    )
    if (clientId) { this.store.selectOnlyNode(clientId) }
    return clientId
  }
  
  destroy() {
    this.detach()
  }
}

export default KeyboardHandler
