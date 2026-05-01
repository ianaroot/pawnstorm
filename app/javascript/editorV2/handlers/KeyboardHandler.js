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
    if (this.isInputElement(event.target)) { return }
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
      this.actions?.navigatePreview(-1)
      return
    }
    if (event.key === 'ArrowRight') {
      this.actions?.navigatePreview(1)
      return
    }
  }

  isInputElement(target) {
    if (!target || !target.tagName) { return false }
    const tag = target.tagName.toLowerCase()
    const isEditable = target.isContentEditable
    return tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable
  }

  canUndo() { return this.actions?.canUndo() ?? false }
  canRedo() { return this.actions?.canRedo() ?? false }

  destroy() {
    this.detach()
  }
}

export default KeyboardHandler
