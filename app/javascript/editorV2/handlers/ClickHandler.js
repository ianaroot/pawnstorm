// handlers/ClickHandler.js
// Handles node selection and editor panel

/**
 * ClickHandler
 * 
 * Handles:
 * - Click on node to select
 * - Double-click on node to open editor panel
 * - Click outside nodes to deselect
 * - Delete key to delete selected node
 * 
 * Note: Form handling is delegated to NodeFormHandler (kept separate).
 */
class ClickHandler {
  /**
   * Create ClickHandler
   * @param {Store} store - Store instance
   * @param {History} history - History instance (for UI updates)
   * @param {HTMLElement} editorPanel - Editor panel element (optional)
   */
  constructor(store, history, editorPanel = null) {
    this.store = store
    this.history = history
    this.editorPanel = editorPanel
    
    // Pre-bound handlers
    this.boundHandleClick = this.handleClick.bind(this)
    this.boundHandleDoubleClick = this.handleDoubleClick.bind(this)
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.boundHandleSave = this.handleSave.bind(this)
    this.boundHandleCancel = this.closeEditor.bind(this)
    this.boundHandleConditionFieldChange = this.handleConditionFieldChange.bind(this)
    
    // Element-to-clientId mappings
    this.attachedElements = new WeakMap()
    
    // Currently selected node
    this.selectedNodeId = null
    
    // Currently editing node
    this.editingNodeId = null
    
    // Callbacks
    this.onNodeSelected = null
    this.onNodeDeselected = null
    this.onNodeEdit = null

    if (this.editorPanel) {
      this.attachEditorPanelHandlers()
    }
  }
  
  /**
   * Attach click handlers to a node element
   * @param {HTMLElement} element - Node element
   * @param {string} clientId - Node client ID
   */
  attach(element, clientId) {
    // Prevent duplicate attachments
    if (this.attachedElements.has(element)) {
      return
    }
    
    this.attachedElements.set(element, clientId)
    
    // Single click: select node
    element.addEventListener('click', (e) => {
      // Don't select if clicking on connector
      if (e.target.classList.contains('node-connector')) {
        return
      }
      
      this.selectNode(clientId, element)
    })
    
    // Double click: open editor panel
    element.addEventListener('dblclick', (e) => {
      // Don't edit if clicking on connector
      if (e.target.classList.contains('node-connector')) {
        return
      }
      
      this.openEditor(clientId)
    })
  }
  
  /**
   * Setup global handlers
   * Call this once after all nodes are attached
   */
  setupGlobalHandlers() {
    // Document click: deselect when clicking outside nodes
    document.addEventListener('click', this.boundHandleClick)
    
    // Keyboard: delete selected node
    document.addEventListener('keydown', this.boundHandleKeyDown)
  }
  
  /**
   * Set editor panel element
   * @param {HTMLElement} panel - Editor panel element
   */
  setEditorPanel(panel) {
    this.editorPanel = panel
    this.attachEditorPanelHandlers()
  }

  attachEditorPanelHandlers() {
    if (!this.editorPanel) {
      return
    }

    this.editorPanel.querySelector('#save-node')?.addEventListener('click', this.boundHandleSave)
    this.editorPanel.querySelector('#cancel-edit')?.addEventListener('click', this.boundHandleCancel)

    this.editorPanel.querySelector('#cond-subject')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-specifier')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-relation')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-comparison')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-comparison-value-source')?.addEventListener('change', this.boundHandleConditionFieldChange)
  }
  
  /**
   * Handle document click (for deselection)
   * @param {MouseEvent} event
   */
  handleClick(event) {
    const clickedOnNode = event.target.closest('.node')
    const clickedOnEditor = this.editorPanel?.contains(event.target)
    
    if (!clickedOnNode && !clickedOnEditor) {
      this.deselectAll()
    }
  }
  
  /**
   * Handle double click (for editing)
   * @param {MouseEvent} event
   */
  handleDoubleClick(event) {
    const nodeEl = event.target.closest('.node')
    if (nodeEl) {
      const clientId = nodeEl.dataset?.clientId
      if (clientId) {
        this.openEditor(clientId)
      }
    }
  }
  
  /**
   * Handle keyboard events (for deletion)
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    // Delete key or backspace: delete selected node
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Only if not in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }
      
      if (this.selectedNodeId) {
        this.deleteSelectedNode()
      }
    }
    
    // Escape: close editor panel
    if (event.key === 'Escape') {
      this.closeEditor()
    }
  }
  
  /**
   * Select a node
   * @param {string} clientId - Node client ID
   * @param {HTMLElement} element - Node element
   */
  selectNode(clientId, element) {
    // Deselect previous
    this.deselectAll()
    
    // Select this node
    this.selectedNodeId = clientId
    this.store.setSelectedNode(clientId)
    element.classList.add('selected')
    
    // Callback
    if (this.onNodeSelected) {
      this.onNodeSelected(clientId)
    }
  }
  
  /**
   * Deselect all nodes
   */
  deselectAll() {
    // Remove selection from store
    this.store.setSelectedNode(null)
    
    // Remove visual selection from all nodes
    document.querySelectorAll('.node.selected').forEach(el => {
      el.classList.remove('selected')
    })
    
    this.selectedNodeId = null
    
    // Callback
    if (this.onNodeDeselected) {
      this.onNodeDeselected()
    }
  }
  
  /**
   * Open editor panel for a node
   * @param {string} clientId - Node client ID
   */
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
  
  /**
   * Populate editor panel with node data
   * Override this or use NodeFormHandler
   * @param {Node} node - Node instance
   */
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
    const conditionEditor = this.editorPanel.querySelector('#condition-editor')
    const actionEditor = this.editorPanel.querySelector('#action-editor')
    
    if (conditionEditor) {
      conditionEditor.classList.toggle('hidden', node.type !== 'condition')
    }
    if (actionEditor) {
      actionEditor.classList.toggle('hidden', node.type !== 'action')
    }

    if (node.type === 'condition') {
      this.populateConditionEditor(node)
    } else if (node.type === 'action') {
      this.populateActionEditor(node)
    }
  }

  populateConditionEditor(node) {
    if (!this.editorPanel) {
      return
    }

    const legacyRelationMap = {
      attacked_after_move: 'attacker_count',
      defended_after_move: 'defender_count',
      lost_defender: 'defender_count',
      lost_shield: 'shield_count',
      newly_attacked: 'attacker_count',
      unblocked: 'mobility'
    }

    const subject = this.editorPanel.querySelector('#cond-subject')
    const specifier = this.editorPanel.querySelector('#cond-specifier')
    const relation = this.editorPanel.querySelector('#cond-relation')
    const comparison = this.editorPanel.querySelector('#cond-comparison')
    const comparisonValueNumber = this.editorPanel.querySelector('#cond-comparison-value-number')
    const comparisonValueSource = this.editorPanel.querySelector('#cond-comparison-value-source')

    if (subject) subject.value = node.data.subject || 'moved_piece'
    if (specifier) specifier.value = node.data.specifier || 'any'
    if (relation) relation.value = legacyRelationMap[node.data.relation] || node.data.relation || 'attacker_count'
    if (comparison) comparison.value = node.data.comparison || 'any'
    if (typeof node.data.comparisonValue === 'number') {
      if (comparisonValueNumber) comparisonValueNumber.value = node.data.comparisonValue
      if (comparisonValueSource) comparisonValueSource.value = 'exact_number'
    } else {
      if (comparisonValueNumber) comparisonValueNumber.value = 1
      if (comparisonValueSource) comparisonValueSource.value = node.data.comparisonValue || 'exact_number'
    }

    this.updateConditionFieldVisibility()
  }

  updateConditionFieldVisibility() {
    if (!this.editorPanel) {
      return
    }

    const subject = this.editorPanel.querySelector('#cond-subject')?.value
    const specifier = this.editorPanel.querySelector('#cond-specifier')?.value
    const relation = this.editorPanel.querySelector('#cond-relation')?.value
    const comparison = this.editorPanel.querySelector('#cond-comparison')?.value
    const needsComparisonValue = comparison === 'count' || comparison === 'greater_than' || comparison === 'less_than'
    const comparisonValueSource = this.editorPanel.querySelector('#cond-comparison-value-source')?.value
    const showExactNumberInput = needsComparisonValue && comparisonValueSource === 'exact_number'

    this.editorPanel.querySelector('#condition-specifier-group')?.classList.toggle('hidden', !subject)
    this.editorPanel.querySelector('#condition-relation-group')?.classList.toggle('hidden', !subject || !specifier)
    this.editorPanel.querySelector('#condition-comparison-group')?.classList.toggle('hidden', !subject || !specifier || !relation)
    this.editorPanel.querySelector('#condition-comparison-value-group')?.classList.toggle('hidden', !subject || !specifier || !relation || !comparison || !needsComparisonValue)
    this.editorPanel.querySelector('#cond-comparison-value-number')?.classList.toggle('hidden', !showExactNumberInput)
  }

  handleConditionFieldChange() {
    this.updateConditionFieldVisibility()
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

  async handleSave() {
    if (!this.editingNodeId) {
      return
    }

    const node = this.store.getNode(this.editingNodeId)
    if (!node || !this.syncManager) {
      return
    }

    try {
      if (node.type === 'condition') {
        await this.syncManager.updateNodeData(this.editingNodeId, {
          subject: this.editorPanel.querySelector('#cond-subject')?.value || 'moved_piece',
          specifier: this.editorPanel.querySelector('#cond-specifier')?.value || 'any',
          relation: this.editorPanel.querySelector('#cond-relation')?.value || 'attacker_count',
          comparison: this.editorPanel.querySelector('#cond-comparison')?.value || 'any',
          comparisonValue: this.editorPanel.querySelector('#cond-comparison-value-source')?.value === 'exact_number'
            ? Number(this.editorPanel.querySelector('#cond-comparison-value-number')?.value || 1)
            : (this.editorPanel.querySelector('#cond-comparison-value-source')?.value || 'exact_number')
        })
      } else if (node.type === 'action') {
        await this.syncManager.updateNodeData(this.editingNodeId, {
          actionType: this.editorPanel.querySelector('#action-type')?.value || 'add',
          value: Number(this.editorPanel.querySelector('#action-value')?.value || 1)
        })
      }

      this.closeEditor()
    } catch (error) {
      console.error('Failed to save node:', error)
    }
  }
  
  /**
   * Delete the currently selected node
   */
  async deleteSelectedNode() {
    if (!this.selectedNodeId) {
      return
    }
    
    const node = this.store.getNode(this.selectedNodeId)
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
    
    const clientId = this.selectedNodeId
    
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
  
  /**
   * Set sync manager (needed for delete)
   * @param {SyncManager} syncManager
   */
  setSyncManager(syncManager) {
    this.syncManager = syncManager
  }
  
  /**
   * Get currently selected node ID
   * @returns {string|null}
   */
  getSelectedNodeId() {
    return this.selectedNodeId
  }
  
  /**
   * Get currently editing node ID
   * @returns {string|null}
   */
  getEditingNodeId() {
    return this.editingNodeId
  }
  
  /**
   * Cleanup on destroy
   */
  destroy() {
    document.removeEventListener('click', this.boundHandleClick)
    document.removeEventListener('keydown', this.boundHandleKeyDown)

    this.editorPanel?.querySelector('#save-node')?.removeEventListener('click', this.boundHandleSave)
    this.editorPanel?.querySelector('#cancel-edit')?.removeEventListener('click', this.boundHandleCancel)
    this.editorPanel?.querySelector('#cond-subject')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-specifier')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-relation')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-comparison')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-comparison-value-source')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    
    this.attachedElements = new WeakMap()
    this.selectedNodeId = null
    this.editingNodeId = null
  }
}

export default ClickHandler
