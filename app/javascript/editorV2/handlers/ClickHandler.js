import ConditionForm from 'editorV2/panels/ConditionForm'
import { EVENTS } from 'editorV2/constants'
import { emitEditorEvent } from 'editorV2/utils/editorEvents'

class ClickHandler {
  constructor(store, history, editorPanel = null) {
    this.store = store
    this.history = history
    this.editorPanel = editorPanel
    
    this.boundHandleClick = this.handleClick.bind(this)
    this.boundHandleDoubleClick = this.handleDoubleClick.bind(this)
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

    if (this.editorPanel) { this.attachEditorPanelHandlers() }
    this.unsubscribeStore = this.store.subscribe(this.boundHandleStoreUpdate)
  }
  
  attach(element, clientId) {
    if (this.attachedElements.has(element)) { return }
    this.attachedElements.set(element, clientId)
    element.addEventListener('click', (e) => {
      if (e.target.classList.contains('node-connector')) { return }
      if (this.store.shouldSuppressClicks()) { return }
      this.selectNode(clientId, element, { additive: this.isShiftSelection(e) })
      if (this.isPlainClick(e)) { this.openEditor(clientId) }
    })

    element.addEventListener('dblclick', (e) => {
      if (e.target.classList.contains('node-connector')) { return }
      this.openEditor(clientId)
    })
  }
  
  // * Setup global handlers * Call this once after all nodes are attached
  setupGlobalHandlers() {
    document.addEventListener('click', this.boundHandleClick)
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

  handleStoreUpdate(event) {
    this.syncSelectionClasses()
    if (event !== EVENTS.SELECTION_CHANGE) { return }
    if (this.store.getSelectedNodeIds().length > 1) {
      if (this.editingNodeId) { this._hideEditorPanel() }
      if (this.boardStatePreview?.mode !== 'idle' && this.boardStatePreview?.isEnabled) {
        this.actions?.renderSelectionPreview()
      }
    }
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

  isPlainClick(event) {
    return !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey
  }

  handleClick(event) {
    if (this.store.shouldSuppressClicks()) { return }
    const clickedOnNode = event.target.closest('.node')
    const clickedOnEditor = this.editorPanel?.contains(event.target)
    const clickedOnPreview = this.boardStatePreview?.wrap?.contains(event.target)
    if (!clickedOnNode && !clickedOnEditor && !clickedOnPreview) {
      this.deselectAll()
      this.closeEditor()
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

  selectNode(clientId, element, { additive = false } = {}) {
    if (additive) {
      this.store.toggleNodeSelection(clientId)
      if (this.store.isNodeSelected(clientId)) {
        this.setRecentPlacementAnchorForClientId(clientId)
        if (this.onNodeSelected) {
          this.onNodeSelected(clientId)
        }
      } else if (this.onNodeDeselected) {
        this.onNodeDeselected()
      }
      return
    }
    this.store.selectOnlyNode(clientId)
    this.setRecentPlacementAnchorForClientId(clientId)
    if (this.onNodeSelected) {
      this.onNodeSelected(clientId)
    }
  }

  setRecentPlacementAnchorForClientId(clientId) {
    const node = this.store.getNode(clientId)
    if (node?.position) {
      this.store.setRecentPlacementAnchor(node.position)
    }
  }

  selectNodeById(clientId) {
    const element = document.querySelector(`.node[data-client-id="${clientId}"]`)
    if (!element) { return }
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
    if (node.type === 'root') { return }
    this.store.setRecentPlacementAnchor(node.position)
    this.editingNodeId = clientId
    this.store.setEditingNode(clientId)

    // Show editor panel
    if (this.editorPanel) {
      this.editorPanel.classList.remove('hidden')
      this.populateEditorPanel(node)
    }

    emitEditorEvent('node-editing-started', { clientId, type: node.type })

    // Callback
    if (this.onNodeEdit) {
      this.onNodeEdit(clientId, node)
    }
  }
  
  _hideEditorPanel() {
    this.actions?.cancelPreviewTimer()
    this.editingNodeId = null
    this.store.setEditingNode(null)
    if (this.editorPanel) {
      this.editorPanel.classList.add('hidden')
    }
  }

  closeEditor() {
    this._hideEditorPanel()
    this.actions?.deactivatePreview()
  }

  setBoardStatePreview(preview) {
    this.boardStatePreview = preview
  }

  setConditionPreviewOnlyMode(isPreviewOnly) {
    const conditionForm = this.editorPanel?.querySelector('#condition-form')
    const conditionLayout = this.editorPanel?.querySelector('.condition-form-layout')
    const conditionFormulation = this.editorPanel?.querySelector('.condition-form-formulation')

    conditionForm?.classList.toggle('hidden', !isPreviewOnly && this.store.getNode(this.editingNodeId)?.type !== 'condition')
    conditionLayout?.classList.toggle('hidden', isPreviewOnly)
    conditionFormulation?.classList.toggle('hidden', isPreviewOnly)
  }

  // ===== Editor Panel Population =====
  populateEditorPanel(node) {
    if (!this.editorPanel) {
      return
    }
    this.setConditionPreviewOnlyMode(false)
    
    // Update type display
    const typeSpan = this.editorPanel.querySelector('#edit-node-type')
    if (typeSpan) {
      typeSpan.textContent = node.type
    }
    
    // Hide/show appropriate editor sections
    const conditionForm = this.editorPanel.querySelector('#condition-form')
    const actionEditor = this.editorPanel.querySelector('#score-form')
    const organizerEditor = this.editorPanel.querySelector('#organizer-form')
    this.editorPanel.classList.toggle('node-form-panel--condition', node.type === 'condition')
    if (conditionForm) {
      conditionForm.classList.toggle('hidden', node.type !== 'condition')
    }
    if (actionEditor) {
      actionEditor.classList.toggle('hidden', node.type !== 'score')
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
      case 'score':
        this.actions?.deactivatePreview()
        this.populateActionEditor(node)
        break
      case 'organizer':
        this.actions?.deactivatePreview()
        this.populateOrganizerEditor(node)
        break
      default:
        break
    }
  }

  populateConditionForm(node) {
    this.conditionForm?.populate(node.data)
    if (this.conditionForm) {
      this.actions?.activateConditionPreview(this.conditionForm)
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
    if (!this.editorPanel) { return }
    const actionType = this.editorPanel.querySelector('#action-type')
    const actionValue = this.editorPanel.querySelector('#action-value')
    if (actionType) { actionType.value = node.data.actionType || node.data.action_type || 'add' }
    if (actionValue) { actionValue.value = node.data.value || 1 }
  }

  populateOrganizerEditor(node) {
    if (!this.editorPanel) { return }
    const organizerTitle = this.editorPanel.querySelector('#organizer-title')
    const organizerNotes = this.editorPanel.querySelector('#organizer-notes')
    if (organizerTitle) { organizerTitle.value = node.data.title || 'Organizer' }
    if (organizerNotes) { organizerNotes.value = node.data.notes || '' }
  }

  // ===== Save Helpers =====

  buildDataPayloadByType(node) {
    switch (node.type) {
      case 'condition':
        return this.buildConditionDataPayload()
      case 'score':
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
    await this.actions?.save()
  }

  getSelectedNodeIds() {
    return this.store.getSelectedNodeIds()
  }

  getDeletableSelectedNodeIds() {
    return this.getSelectedNodeIds().filter(clientId => {
      const node = this.store.getNode(clientId)
      return node && node.type !== 'root'
    })
  }

  getSelectedNodeId() {
    return this.store.getPrimarySelectedNode()
  }

  getEditingNodeId() {
    return this.editingNodeId
  }

  destroy() {
    document.removeEventListener('click', this.boundHandleClick)
    this.conditionForm?.detach()
    this.unsubscribeStore?.()
    this.actions?.cancelPreviewTimer()
    this.attachedElements = new WeakMap()
    this.editingNodeId = null
  }
}

export default ClickHandler
