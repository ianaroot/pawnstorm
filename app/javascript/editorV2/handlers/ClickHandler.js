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
    this.editorPanel.querySelector('#cond-subject-specifier-mode')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-subject-specifier')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-relation')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-relation-specifier-mode')?.addEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel.querySelector('#cond-relation-specifier')?.addEventListener('change', this.boundHandleConditionFieldChange)
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

  selectNodeById(clientId) {
    const element = document.querySelector(`.node[data-client-id="${clientId}"]`)
    if (!element) {
      return
    }

    this.selectNode(clientId, element)
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
    const conditionEditor = this.editorPanel.querySelector('#condition-editor')
    const actionEditor = this.editorPanel.querySelector('#action-editor')
    const organizerEditor = this.editorPanel.querySelector('#organizer-editor')
    
    if (conditionEditor) {
      conditionEditor.classList.toggle('hidden', node.type !== 'condition')
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
        this.populateConditionEditor(node)
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

  // ===== Condition Editor =====

  populateConditionEditor(node) {
    if (!this.editorPanel) {
      return
    }

    const fields = this.conditionEditorFields()
    this.writeConditionEditorFields(fields, node.data)

    this.updateConditionFieldVisibility()
  }

  updateConditionFieldVisibility() {
    if (!this.editorPanel) {
      return
    }

    const fields = this.conditionEditorFields()
    this.filterConditionOptions(fields)
    this.updateConditionGroupVisibility(fields)
  }

  conditionEditorFields() {
    return {
      subject: this.editorPanel.querySelector('#cond-subject'),
      subjectSpecifierMode: this.editorPanel.querySelector('#cond-subject-specifier-mode'),
      subjectSpecifier: this.editorPanel.querySelector('#cond-subject-specifier'),
      relation: this.editorPanel.querySelector('#cond-relation'),
      relationSpecifierMode: this.editorPanel.querySelector('#cond-relation-specifier-mode'),
      relationSpecifier: this.editorPanel.querySelector('#cond-relation-specifier'),
      comparison: this.editorPanel.querySelector('#cond-comparison'),
      comparisonValueNumber: this.editorPanel.querySelector('#cond-comparison-value-number'),
      comparisonValueSource: this.editorPanel.querySelector('#cond-comparison-value-source')
    }
  }

  writeConditionEditorFields(fields, nodeData = {}) {
    if (fields.subject) fields.subject.value = nodeData.subject || 'moved_piece'
    if (fields.subjectSpecifierMode) fields.subjectSpecifierMode.value = nodeData.subjectSpecifierMode || 'include'
    if (fields.subjectSpecifier) fields.subjectSpecifier.value = nodeData.subjectSpecifier || 'any'
    if (fields.relation) fields.relation.value = nodeData.relation || 'attacker'
    if (fields.relationSpecifierMode) fields.relationSpecifierMode.value = nodeData.relationSpecifierMode || 'include'
    if (fields.relationSpecifier) fields.relationSpecifier.value = nodeData.relationSpecifier || 'any'
    if (fields.comparison) fields.comparison.value = nodeData.comparison || 'equal_to'

    if (typeof nodeData.comparisonValue === 'number') {
      if (fields.comparisonValueNumber) fields.comparisonValueNumber.value = nodeData.comparisonValue
      if (fields.comparisonValueSource) fields.comparisonValueSource.value = 'exact_number'
      return
    }

    if (fields.comparisonValueNumber) fields.comparisonValueNumber.value = 1
    if (fields.comparisonValueSource) fields.comparisonValueSource.value = nodeData.comparisonValue || 'exact_number'
  }

  currentConditionEditorState(fields) {
    const availableRelationSpecifiers = fields.relationSpecifier
      ? this.enabledOptions(fields.relationSpecifier)
      : []

    return {
      subject: fields.subject?.value,
      subjectSpecifierMode: fields.subjectSpecifierMode?.value || 'include',
      subjectSpecifier: fields.subjectSpecifier?.value,
      relation: fields.relation?.value,
      relationSpecifierMode: fields.relationSpecifierMode?.value || 'include',
      relationSpecifier: fields.relationSpecifier?.value,
      comparison: fields.comparison?.value,
      comparisonValueSource: fields.comparisonValueSource?.value,
      showRelationSpecifier: availableRelationSpecifiers.some(option => option.value !== 'any')
    }
  }

  filterConditionOptions(fields) {
    const subject = fields.subject?.value

    if (!subject || !fields.relation || !fields.relationSpecifier || !fields.comparisonValueSource) {
      return
    }

    this.filterRelationOptions(fields.relation, subject)

    const relation = fields.relation.value
    this.filterRelationSpecifierOptions(fields.relationSpecifier, subject, relation)
    this.filterSubjectSpecifierOptions(fields.subjectSpecifier, fields.subjectSpecifierMode)
    this.filterRelationSpecifierByMode(fields.relationSpecifier, fields.relationSpecifierMode)
    this.filterComparisonValueSourceOptions(fields.comparisonValueSource, subject)
  }

  filterSubjectSpecifierOptions(subjectSpecifierSelect, subjectSpecifierModeSelect) {
    this.filterSpecifierOptionsByMode(subjectSpecifierSelect, subjectSpecifierModeSelect)
  }

  filterRelationOptions(relationSelect, subject) {
    this.filterSelectOptions(relationSelect, option => {
      const validSubjects = option.dataset.validSubjects?.split(',').filter(Boolean) || []
      return validSubjects.length === 0 || validSubjects.includes(subject)
    })
  }

  filterRelationSpecifierOptions(relationSpecifierSelect, subject, relation) {
    this.filterSelectOptions(relationSpecifierSelect, option => {
      const validSubjects = option.dataset.validSubjects?.split(',').filter(Boolean) || []
      const validRelations = option.dataset.validRelations?.split(',').filter(Boolean) || []
      const subjectMatches = validSubjects.length === 0 || validSubjects.includes(subject)
      const relationMatches = validRelations.length === 0 || validRelations.includes(relation)
      return subjectMatches && relationMatches
    })
  }

  filterRelationSpecifierByMode(relationSpecifierSelect, relationSpecifierModeSelect) {
    this.filterSpecifierOptionsByMode(relationSpecifierSelect, relationSpecifierModeSelect)
  }

  filterSpecifierOptionsByMode(specifierSelect, specifierModeSelect) {
    if (!specifierSelect || !specifierModeSelect) {
      return
    }

    const anyOption = Array.from(specifierSelect.options).find(option => option.value === 'any')
    if (!anyOption) {
      return
    }

    const excludeMode = specifierModeSelect.value === 'exclude'

    if (excludeMode) {
      anyOption.hidden = true
      anyOption.disabled = true

      if (specifierSelect.value === 'any') {
        const firstValidOption = Array.from(specifierSelect.options).find(option => !option.disabled)
        if (firstValidOption) {
          specifierSelect.value = firstValidOption.value
        }
      }

      return
    }

    const validSubjects = anyOption.dataset.validSubjects?.split(',').filter(Boolean) || []
    const validRelations = anyOption.dataset.validRelations?.split(',').filter(Boolean) || []
    const currentSubject = this.editorPanel?.querySelector('#cond-subject')?.value
    const currentRelation = this.editorPanel?.querySelector('#cond-relation')?.value
    const subjectMatches = validSubjects.length === 0 || validSubjects.includes(currentSubject)
    const relationMatches = validRelations.length === 0 || validRelations.includes(currentRelation)
    const shouldShowAny = subjectMatches && relationMatches

    anyOption.hidden = !shouldShowAny
    anyOption.disabled = !shouldShowAny
  }

  filterComparisonValueSourceOptions(comparisonValueSourceSelect, subject) {
    this.filterSelectOptions(comparisonValueSourceSelect, option => {
      if (option.value === 'exact_number') {
        return true
      }

      const validSubjects = option.dataset.validSubjects?.split(',').filter(Boolean) || []
      return validSubjects.length === 0 || validSubjects.includes(subject)
    })
  }

  updateConditionGroupVisibility(fields) {
    const state = this.currentConditionEditorState(fields)
    const needsComparisonValue = Boolean(state.comparison)
    const showExactNumberInput = needsComparisonValue && state.comparisonValueSource === 'exact_number'

    this.toggleEditorGroup('#condition-specifier-group', !state.subject)
    this.toggleEditorGroup('#condition-relation-group', !state.subject || !state.subjectSpecifier)
    this.toggleEditorGroup('#condition-relation-specifier-group', !state.subject || !state.subjectSpecifier || !state.relation || !state.showRelationSpecifier)
    this.toggleEditorGroup('#condition-comparison-group', !state.subject || !state.subjectSpecifier || !state.relation || !state.relationSpecifier)
    this.toggleEditorGroup('#condition-comparison-value-group', !state.subject || !state.subjectSpecifier || !state.relation || !state.relationSpecifier || !state.comparison || !needsComparisonValue)
    fields.comparisonValueNumber?.classList.toggle('hidden', !showExactNumberInput)
  }

  toggleEditorGroup(selector, hidden) {
    this.editorPanel.querySelector(selector)?.classList.toggle('hidden', hidden)
  }

  enabledOptions(select) {
    return Array.from(select.options).filter(option => !option.disabled)
  }

  filterSelectOptions(select, predicate) {
    const options = Array.from(select.options)
    let selectedOptionIsValid = false

    options.forEach(option => {
      const isValid = predicate(option)
      option.hidden = !isValid
      option.disabled = !isValid

      if (isValid && option.value === select.value) {
        selectedOptionIsValid = true
      }
    })

    if (selectedOptionIsValid) {
      return
    }

    const firstValidOption = options.find(option => !option.disabled)
    if (firstValidOption) {
      select.value = firstValidOption.value
    }
  }

  handleConditionFieldChange() {
    this.updateConditionFieldVisibility()
  }

  buildConditionDataPayload() {
    const fields = this.conditionEditorFields()
    const comparison = fields.comparison?.value || 'equal_to'
    const comparisonValueSource = fields.comparisonValueSource?.value || 'exact_number'
    const comparisonValue = (
      comparisonValueSource === 'exact_number'
        ? Number(fields.comparisonValueNumber?.value || 1)
        : comparisonValueSource
    )

    return {
      subject: fields.subject?.value || 'moved_piece',
      subjectSpecifierMode: fields.subjectSpecifierMode?.value || 'include',
      subjectSpecifier: fields.subjectSpecifier?.value || 'any',
      relation: fields.relation?.value || 'attacker',
      relationSpecifierMode: fields.relationSpecifierMode?.value || 'include',
      relationSpecifier: fields.relationSpecifier?.value || 'any',
      comparison: comparison,
      comparisonValue: comparisonValue
    }
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
    this.editorPanel?.querySelector('#cond-subject-specifier')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-relation')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-relation-specifier')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-comparison')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    this.editorPanel?.querySelector('#cond-comparison-value-source')?.removeEventListener('change', this.boundHandleConditionFieldChange)
    
    this.attachedElements = new WeakMap()
    this.selectedNodeId = null
    this.editingNodeId = null
  }
}

export default ClickHandler
