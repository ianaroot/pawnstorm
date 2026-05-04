import TemplatePicker from 'editorV2/templates/TemplatePicker'
import { findTemplateAnchor } from 'editorV2/templates/TemplatePlacement'
import { findAnchoredNodePlacement } from 'editorV2/utils/nodePlacement'


class ToolbarHandler {
  constructor(store, history, syncManager, container, clickHandler, viewport = null) {
    this.store = store
    this.history = history
    this.syncManager = syncManager
    this.container = container
    this.clickHandler = clickHandler
    this.viewport = viewport
    this.compileAndExitLink = document.getElementById('compile-and-exit-link')
    this.compileStatus = document.getElementById('compile-status')
    this.editorRoot = document.querySelector('.bot-editor')
    this.botNameDisplay = document.getElementById('bot-name-display')
    this.renameButton = document.querySelector('[data-bot-rename-open]')
    this.renameModal = document.getElementById('bot-rename-modal')
    this.renameNameInput = document.getElementById('bot-rename-name')
    this.renameDescriptionInput = document.getElementById('bot-rename-description')
    this.renameError = document.querySelector('[data-bot-rename-error]')
    this.renameSaveButton = document.querySelector('[data-bot-rename-save]')
    this.renameCancelButton = document.querySelector('[data-bot-rename-cancel]')
    this.templatePicker = null
    this.isRenameSubmitting = false

    this.boundHandleRenameOpen = this.openRenameModal.bind(this)
    this.boundHandleRenameSave = this.handleRenameSave.bind(this)
    this.boundHandleRenameCancel = this.closeRenameModal.bind(this)
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
        this.markBotStale()
        this.updateButtons()
      })
    }
    // Redo button
    const redoBtn = document.querySelector('.btn-redo')
    if (redoBtn) {
      redoBtn.addEventListener('click', async () => {
        await this.redo()
        this.markBotStale()
        this.updateButtons()
      })
    }
    // Delete node button
    const deleteBtn = document.querySelector('.btn-delete-node')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDeleteClick())
    }
    if (this.renameButton) {
      this.renameButton.addEventListener('click', this.boundHandleRenameOpen)
    }
    if (this.renameSaveButton) {
      this.renameSaveButton.addEventListener('click', this.boundHandleRenameSave)
    }
    if (this.renameCancelButton) {
      this.renameCancelButton.addEventListener('click', this.boundHandleRenameCancel)
    }
    if (this.compileAndExitLink) {
      this.compileAndExitLink.addEventListener('click', (e) => {
        e.preventDefault()
        this.handleCompile()
      })
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
    const recentAnchor = this.store.getRecentPlacementAnchor()
    const origin = recentAnchor && this.viewport?.isGraphPointVisible?.(recentAnchor)
      ? recentAnchor
      : this.viewport?.getVisibleCanvasCenter() || recentAnchor || { x: 200, y: 200 }

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

  async handleCompile() {
    if (!this.compileAndExitLink) return
    const url = this.compileAndExitLink.href
    this.compileAndExitLink.disabled = true
    this.clearCompileStatus()

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'X-CSRF-Token': csrf }
      })
      const data = await response.json()
      if (data.success) {
        if (this.editorRoot) { this.editorRoot.dataset.editorBotStaleValue = 'false' }
        this.updateCompileAction()
        this.showCompileStatus('Compiled.', false)
        document.dispatchEvent(new CustomEvent('bot:compiled'))
      } else {
        this.showCompileStatus(data.error || 'Compile failed.', true)
      }
    } catch {
      this.showCompileStatus('Compile failed.', true)
    } finally {
      this.compileAndExitLink.disabled = false
    }
  }

  showCompileStatus(message, isError) {
    if (!this.compileStatus) return
    this.compileStatus.textContent = message
    this.compileStatus.classList.remove('hidden', 'compile-status--error')
    if (isError) this.compileStatus.classList.add('compile-status--error')
    clearTimeout(this._compileStatusTimer)
    if (!isError) {
      this._compileStatusTimer = setTimeout(() => this.clearCompileStatus(), 3000)
    }
  }

  clearCompileStatus() {
    if (!this.compileStatus) return
    this.compileStatus.textContent = ''
    this.compileStatus.classList.add('hidden')
    this.compileStatus.classList.remove('compile-status--error')
  }

  updateCompileAction() {
    if (!this.compileAndExitLink) return
    this.compileAndExitLink.classList.toggle('hidden', !this.isBotStale())
  }

  openRenameModal() {
    if (!this.renameModal || !this.renameNameInput || !this.renameDescriptionInput) { return }
    this.clearRenameError()
    this.renameNameInput.value = this.editorRoot?.dataset.editorBotNameValue || this.botNameDisplay?.textContent || ''
    this.renameDescriptionInput.value = this.editorRoot?.dataset.editorBotDescriptionValue || ''
    this.renameModal.classList.remove('hidden')
    this.renameModal.setAttribute('aria-hidden', 'false')
    this.renameNameInput?.focus()
    this.renameNameInput?.select()
  }

  closeRenameModal() {
    if (!this.renameModal) { return }
    this.renameModal.classList.add('hidden')
    this.renameModal.setAttribute('aria-hidden', 'true')
    this.isRenameSubmitting = false
    if (this.renameSaveButton) {
      this.renameSaveButton.disabled = false
    }
  }

  clearRenameError() {
    if (!this.renameError) { return }
    this.renameError.textContent = ''
    this.renameError.classList.add('hidden')
  }

  showRenameError(message) {
    if (!this.renameError) { return }
    this.renameError.textContent = message
    this.renameError.classList.remove('hidden')
  }

  async handleRenameSave() {
    if (this.isRenameSubmitting || !this.renameNameInput || !this.renameDescriptionInput) { return }
    if (!this.syncManager?.updateBot) {
      this.showRenameError('Rename is unavailable right now.')
      return
    }

    const name = this.renameNameInput?.value.trim() || ''
    const description = this.renameDescriptionInput?.value || ''

    if (!name) {
      this.showRenameError('Bot name cannot be blank.')
      this.renameNameInput?.focus()
      return
    }

    this.clearRenameError()
    this.isRenameSubmitting = true
    if (this.renameSaveButton) {
      this.renameSaveButton.disabled = true
    }

    try {
      const updatedBot = await this.syncManager.updateBot({ name, description })
      this.applyRenamedBot(updatedBot || { name, description })
      this.closeRenameModal()
    } catch (error) {
      const message = error?.message || 'Failed to rename bot.'
      this.showRenameError(message)
      this.isRenameSubmitting = false
      if (this.renameSaveButton) {
        this.renameSaveButton.disabled = false
      }
    }
  }

  applyRenamedBot(bot) {
    if (!bot) { return }
    const name = bot.name || ''
    const description = bot.description || ''
    if (this.botNameDisplay) {
      this.botNameDisplay.textContent = name
      this.botNameDisplay.title = name
    }
    if (this.editorRoot) {
      this.editorRoot.dataset.editorBotNameValue = name
      this.editorRoot.dataset.editorBotDescriptionValue = description
    }
  }
  

  // destroy() {
  //   // Event listeners are on document elements, cleaned up automatically
  // }
}

export default ToolbarHandler
