import TemplatePicker from '../templates/TemplatePicker.js'
import { findTemplateAnchor } from '../templates/TemplatePlacement.js'
import { findAnchoredNodePlacement } from '../utils/nodePlacement.js'


class ToolbarHandler {
  constructor(store, history, syncManager, container, clickHandler, viewport = null) {
    this.store = store
    this.history = history
    this.syncManager = syncManager
    this.container = container
    this.clickHandler = clickHandler
    this.viewport = viewport
    this.compileAndExitLink = document.getElementById('compile-and-exit-link')
    this.editorRoot = document.querySelector('.bot-editor')
    this.templatePicker = null
  }

  attach() {
    // Add Node buttons
    document.querySelectorAll('.btn-add-node').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleAddNode(e))
    })
    const templatesBtn = document.querySelector('.btn-open-templates')
    if (templatesBtn) {
      templatesBtn.addEventListener('click', () => this.openTemplatePicker())
    }
    // Undo button
    const undoBtn = document.querySelector('.btn-undo')
    if (undoBtn) {
      undoBtn.addEventListener('click', async () => {
        await this.undo()
        this.updateButtons()
      })
    }
    // Redo button
    const redoBtn = document.querySelector('.btn-redo')
    if (redoBtn) {
      redoBtn.addEventListener('click', async () => {
        await this.redo()
        this.updateButtons()
      })
    }
    // Delete node button
    const deleteBtn = document.querySelector('.btn-delete-node')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDeleteClick())
    }
    this.syncManager.setPersistedMutationCallback(() => this.markBotStale())
    this.updateCompileAction()
    this.attachTemplatePicker()
  }
  
  async handleAddNode(e) {
    const type = e.target.dataset.type
    if (!type) return
    const position = this.findPlacementPosition(type)
    try {
      await this.syncManager.createNode(type, position, {})
    } catch (err) {
      console.error('Failed to create node:', err)
    }
  }

  attachTemplatePicker() {
    const modal = document.getElementById('template-picker-modal')
    if (!modal) { return }
    this.templatePicker = new TemplatePicker(modal, {
      onInsert: async (template) => {
        const organizerAnchor = findTemplateAnchor(template, this.viewport, this.store, this.store.getRecentPlacementAnchor())
        const result = await this.syncManager.insertTemplate(template, organizerAnchor)
        if (result?.organizerClientId) {
          this.clickHandler?.selectNodeById(result.organizerClientId)
          this.updateButtons()
        }
      }
    })
    this.templatePicker.attach()
  }

  openTemplatePicker() {
    this.templatePicker?.open()
  }

  findPlacementPosition(type) {
    const origin = this.store.getRecentPlacementAnchor() || this.viewport?.getVisibleCanvasCenter() || { x: 200, y: 200 }
    return findAnchoredNodePlacement(this.store, type, origin)
  }

  async undo() {
    if (!this.history.canUndo()) return
    if (this.syncManager.isUndoRedoPending) return   
    await this.syncManager.undo()
  }

  async redo() {
    if (!this.history.canRedo()) return
    if (this.syncManager.isUndoRedoPending) return
    await this.syncManager.redo()
  }
  
  updateButtons() {
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
    this.updateDeleteButton()
    this.updateCompileAction()
  }
  
  handleDeleteClick() {
    if (this.clickHandler?.deleteSelectedNodes) {
      this.clickHandler.deleteSelectedNodes()
      return
    }
    this.clickHandler?.deleteSelectedNode?.()
  }
  
  updateDeleteButton() {
    const deleteBtn = document.querySelector('.btn-delete-node')
    if (!deleteBtn) return
    const selectedIds = this.clickHandler?.getDeletableSelectedNodeIds?.() || this.store.getSelectedNodeIds().filter(clientId => {
      const node = this.store.getNode(clientId)
      return node && node.type !== 'root'
    })

    // Disable if: no deletable selection
    const isDisabled = selectedIds.length === 0
    deleteBtn.disabled = isDisabled
  }

  isBotStale() {
    return this.editorRoot?.dataset.editorBotStaleValue === 'true'
  }

  markBotStale() {
    if (this.editorRoot) { this.editorRoot.dataset.editorBotStaleValue = 'true' }
    this.updateCompileAction()
  }

  updateCompileAction() {
    if (!this.compileAndExitLink) return
    this.compileAndExitLink.classList.toggle('hidden', !this.isBotStale())
  }
  

  // destroy() {
  //   // Event listeners are on document elements, cleaned up automatically
  // }
}

export default ToolbarHandler
