import { isEditableTarget } from 'editorV2/utils/dom'

class KeyboardHandler {
  constructor() {
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
    // Escape fires even with focus in an input
    if (event.key === 'Escape') {
      this.actions?.closeEditor()
      return
    }

    // Ignore if in input field
    if (isEditableTarget(event.target)) { return }
    const key = event.key?.toLowerCase()

    // Copy: Ctrl/Cmd+C
    if ((event.ctrlKey || event.metaKey) && key === 'c') {
      event.preventDefault()
      this.actions?.copy()
      return
    }

    // Paste: Ctrl/Cmd+V
    if ((event.ctrlKey || event.metaKey) && key === 'v') {
      event.preventDefault()
      this.actions?.paste().catch(error => {
        console.error('Failed to paste nodes:', error)
      })
      return
    }

    // Undo: Ctrl+Z / Cmd+Z
    if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) {
      event.preventDefault()
      this.actions?.undo()
      return
    }

    // Redo: Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y
    if ((event.ctrlKey || event.metaKey) &&
        ((key === 'z' && event.shiftKey) || key === 'y')) {
      event.preventDefault()
      this.actions?.redo()
      return
    }

    // Delete / Backspace: delete selected nodes
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.actions?.deleteSelected()
      return
    }

    // p: toggle board state preview
    if (key === 'p' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing) {
      event.preventDefault()
      this.actions?.togglePreview()
      return
    }

    // Enter: save editing node
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing) {
      event.preventDefault()
      this.actions?.save()
      return
    }

    // Arrow keys: navigate board state preview
    if (event.key === 'ArrowLeft') {
      if (this.actions?.navigatePreview(-1)) { event.preventDefault() }
      return
    }
    if (event.key === 'ArrowRight') {
      if (this.actions?.navigatePreview(1)) { event.preventDefault() }
      return
    }
  }

  destroy() {
    this.detach()
  }
}

export default KeyboardHandler
