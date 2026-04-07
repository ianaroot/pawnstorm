 import ConditionForm from '../panels/ConditionForm'
class ClickHandler {
  constructor(store, history, editorPanel = null) {
    this.store = store
    this.history = history
    this.editorPanel = editorPanel
    
    this.boundHandleClick = this.handleClick.bind(this)
    this.boundHandleDoubleClick = this.handleDoubleClick.bind(this)
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.boundHandleSave = this.handleSave.bind(this)
    this.boundHandleCancel = this.closeEditor.bind(this)
    this.boundHandleStoreUpdate = this.handleStoreUpdate.bind(this)
    this.conditionForm = this.editorPanel ? new ConditionForm(this.editorPanel) : null
    
    // Element-to-clientId mappings
    this.attachedElements = new WeakMap()
    
    // Currently editing node
    this.editingNodeId = null
    
    // Callbacks
    this.onNodeSelected = null
    this.onNodeDeselected = null
    this.onNodeEdit = null

    if (this.editorPanel) {
      this.attachEditorPanelHandlers()
    }
    this.unsubscribeStore = this.store.subscribe(this.boundHandleStoreUpdate)
  }
  
  attach(element, clientId) {
    // Prevent duplicate attachments
    if (this.attachedElements.has(element)) {
      return
    }
    this.attachedElements.set(element, clientId)
    element.addEventListener('click', (e) => {
      if (e.target.classList.contains('node-connector')) { return }
      if (this.store.shouldSuppressClicks()) { return }
      this.selectNode(clientId, element, { additive: this.isShiftSelection(e) })
    })
    
    element.addEventListener('dblclick', (e) => {
      // Don't edit if clicking on connector
      if (e.target.classList.contains('node-connector')) { 
        return 
      }
      this.openEditor(clientId)  
    })
  }
  
  // * Setup global handlers * Call this once after all nodes are attached
  setupGlobalHandlers() {
    // Document click: deselect when clicking outside nodes
    document.addEventListener('click', this.boundHandleClick)
    
    // Keyboard: delete selected node
    document.addEventListener('keydown', this.boundHandleKeyDown)
  }

  setEditorPanel(panel) {
    this.conditionForm?.detach()
    this.editorPanel = panel
    this.conditionForm = panel ? new ConditionForm(panel) : null
    this.attachEditorPanelHandlers()
  }

  attachEditorPanelHandlers() {
    if (!this.editorPanel) { return }
    this.editorPanel.querySelector('#save-node')?.addEventListener('click', this.boundHandleSave)
    this.editorPanel.querySelector('#cancel-edit')?.addEventListener('click', this.boundHandleCancel)
    this.conditionForm?.attach()
  }

  handleStoreUpdate() {
    this.syncSelectionClasses()
  }

  syncSelectionClasses() {
    const selectedIds = new Set(this.store.getSelectedNodeIds())

    document.querySelectorAll('.node').forEach(el => {
      const clientId = el.dataset?.clientId
      el.classList.toggle('selected', selectedIds.has(clientId))
    })
  }

  isShiftSelection(event) {
    return event.shiftKey
  }

  handleClick(event) {
    if (this.store.shouldSuppressClicks()) { return }

    const clickedOnNode = event.target.closest('.node')
    const clickedOnEditor = this.editorPanel?.contains(event.target)
    if (!clickedOnNode && !clickedOnEditor) {
      this.deselectAll()
    }
  }

  handleDoubleClick(event) {
    const nodeEl = event.target.closest('.node')
    if (nodeEl) {
      const clientId = nodeEl.dataset?.clientId
      if (clientId) {
        this.openEditor(clientId)
      }
    }
  }

  handleKeyDown(event) {
    // Delete key or backspace: delete selected node
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Only if not in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }
      
      if (this.store.getPrimarySelectedNode()) {
        this.deleteSelectedNode()
      }
    }
    // Escape: close editor panel
    if (event.key === 'Escape') {
      this.closeEditor()
    }
  }

  selectNode(clientId, element, { additive = false } = {}) {
    if (additive) {
      this.store.toggleNodeSelection(clientId)

      if (this.store.isNodeSelected(clientId)) {
        if (this.onNodeSelected) {
          this.onNodeSelected(clientId)
        }
      } else if (this.onNodeDeselected) {
        this.onNodeDeselected()
      }

      return
    }

    this.store.selectOnlyNode(clientId)

    if (this.onNodeSelected) {
      this.onNodeSelected(clientId)
    }
  }

  selectNodeById(clientId) {
    const element = document.querySelector(`.node[data-client-id="${clientId}"]`)
    if (!element) {
      return
    }

    this.selectNode(clientId, element)
  }


  deselectAll() {
    this.store.clearSelection()

    if (this.onNodeDeselected) {
      this.onNodeDeselected()
    }
  }


  openEditor(clientId) {
    const node = this.store.getNode(clientId)
    if (!node) {
      console.warn(`Node ${clientId} not found`)
      return
    }
    
    // Don't edit root nodes
    if (node.type === 'root') {
      return
    }
    
    this.editingNodeId = clientId
    this.store.setEditingNode(clientId)
    
    // Show editor panel
    if (this.editorPanel) {
      this.editorPanel.classList.remove('hidden')
      this.populateEditorPanel(node)
    }
    
    // Callback
    if (this.onNodeEdit) {
      this.onNodeEdit(clientId, node)
    }
  }
  
  /**
   * Close editor panel
   */
  closeEditor() {
    this.editingNodeId = null
    this.store.setEditingNode(null)
    
    if (this.editorPanel) {
      this.editorPanel.classList.add('hidden')
    }
  }

  // ===== Editor Panel Population =====

  populateEditorPanel(node) {
    if (!this.editorPanel) {
      return
    }
    
    // Update type display
    const typeSpan = this.editorPanel.querySelector('#edit-node-type')
    if (typeSpan) {
      typeSpan.textContent = node.type
    }
    
    // Hide/show appropriate editor sections
    const conditionForm = this.editorPanel.querySelector('#condition-form')
    const actionEditor = this.editorPanel.querySelector('#action-form')
    const organizerEditor = this.editorPanel.querySelector('#organizer-form')
    this.editorPanel.classList.toggle('node-form-panel--condition', node.type === 'condition')

    if (conditionForm) {
      conditionForm.classList.toggle('hidden', node.type !== 'condition')
    }
    if (actionEditor) {
      actionEditor.classList.toggle('hidden', node.type !== 'action')
    }
    if (organizerEditor) {
      organizerEditor.classList.toggle('hidden', node.type !== 'organizer')
    }

    this.populateEditorByType(node)
  }

  populateEditorByType(node) {
    switch (node.type) {
      case 'condition':
        this.populateConditionForm(node)
        break
      case 'action':
        this.populateActionEditor(node)
        break
      case 'organizer':
        this.populateOrganizerEditor(node)
        break
      default:
        break
    }
  }

  populateConditionForm(node) {
    this.conditionForm?.populate(node.data)
  }



  // ===== Action Editor =====

  buildActionDataPayload() {
    return {
      actionType: this.editorPanel.querySelector('#action-type')?.value || 'add',
      value: Number(this.editorPanel.querySelector('#action-value')?.value || 1)
    }
  }

  // ===== Organizer Editor =====

  buildOrganizerDataPayload() {
    return {
      title: this.editorPanel.querySelector('#organizer-title')?.value?.trim() || 'Organizer',
      notes: this.editorPanel.querySelector('#organizer-notes')?.value?.trim() || ''
    }
  }

  populateActionEditor(node) {
    if (!this.editorPanel) {
      return
    }

    const actionType = this.editorPanel.querySelector('#action-type')
    const actionValue = this.editorPanel.querySelector('#action-value')

    if (actionType) {
      actionType.value = node.data.actionType || node.data.action_type || 'add'
    }

    if (actionValue) {
      actionValue.value = node.data.value || 1
    }
  }

  populateOrganizerEditor(node) {
    if (!this.editorPanel) {
      return
    }

    const organizerTitle = this.editorPanel.querySelector('#organizer-title')
    const organizerNotes = this.editorPanel.querySelector('#organizer-notes')

    if (organizerTitle) {
      organizerTitle.value = node.data.title || 'Organizer'
    }

    if (organizerNotes) {
      organizerNotes.value = node.data.notes || ''
    }
  }

  // ===== Save Helpers =====

  buildDataPayloadByType(node) {
    switch (node.type) {
      case 'condition':
        return this.buildConditionDataPayload()
      case 'action':
        return this.buildActionDataPayload()
      case 'organizer':
        return this.buildOrganizerDataPayload()
      default:
        return null
    }
  }

  buildConditionDataPayload() {
    return this.conditionForm?.buildPayload()
  }

  async handleSave() {
    if (!this.editingNodeId) {
      return
    }

    const node = this.store.getNode(this.editingNodeId)
    if (!node || !this.syncManager) {
      return
    }

    try {
      const payload = this.buildDataPayloadByType(node)
      if (payload) {
        await this.syncManager.updateNodeData(this.editingNodeId, payload)
      }

      this.closeEditor()
    } catch (error) {
      console.error('Failed to save node:', error)
    }
  }
  

  async deleteSelectedNode() {
    const selectedNodeId = this.store.getPrimarySelectedNode()
    if (!selectedNodeId) {
      return
    }

    const node = this.store.getNode(selectedNodeId)
    if (!node) {
      return
    }
    
    // Don't delete root nodes
    if (node.type === 'root') {
      console.warn('Cannot delete root node')
      return
    }
    
    // Confirm deletion
    if (!confirm('Delete this node?')) {
      return
    }
    
    const clientId = selectedNodeId
    
    // Deselect first
    this.deselectAll()
    
    // Close editor if editing this node
    if (this.editingNodeId === clientId) {
      this.closeEditor()
    }
    
    // SyncManager handles: optimistic delete, server sync, history push
    try {
      await this.syncManager?.deleteNode(clientId)
    } catch (error) {
      console.error('Failed to delete node:', error)
    }
  }
  

  setSyncManager(syncManager) {
    this.syncManager = syncManager
  }

  getSelectedNodeId() {
    return this.store.getPrimarySelectedNode()
  }

  getEditingNodeId() {
    return this.editingNodeId
  }

  destroy() {
    document.removeEventListener('click', this.boundHandleClick)
    document.removeEventListener('keydown', this.boundHandleKeyDown)
    this.conditionForm?.detach()
    this.unsubscribeStore?.()
    this.attachedElements = new WeakMap()
    this.editingNodeId = null
  }
}

export default ClickHandler
