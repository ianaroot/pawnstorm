class HoverPreviewHandler {
  constructor(viewport = null) {
    this.viewport = viewport
    this.hoveredElement = null
    this.inspectModeActive = false
    this.previewElement = null
    this.attachedElements = new WeakMap()

    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
  }

  attach() {
    document.addEventListener('keydown', this.boundHandleKeyDown)
  }

  attachNode(element) {
    if (this.attachedElements.has(element)) { return }
    this.attachedElements.set(element, true)

    element.addEventListener('mouseenter', () => {
      this.hoveredElement = element
      this.renderPreview()
    })

    element.addEventListener('mouseleave', () => {
      if (this.hoveredElement === element) {
        this.hoveredElement = null
      }
      this.hidePreview()
    })
  }

  handleKeyDown(event) {
    if (this.isEditableTarget(event.target) || event.repeat) { return }

    if (event.key === 'Escape') {
      if (!this.inspectModeActive) { return }
      this.inspectModeActive = false
      this.hidePreview()
      return
    }

    if (event.key.toLowerCase() !== 'i') { return }

    this.inspectModeActive = !this.inspectModeActive
    if (!this.inspectModeActive) {
      this.hidePreview()
      return
    }

    this.renderPreview()
  }

  isEditableTarget(target) {
    if (!target || !target.tagName) { return false }
    const tag = target.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
  }

  ensurePreviewElement() {
    if (this.previewElement) { return this.previewElement }

    this.previewElement = document.createElement('div')
    this.previewElement.className = 'node-hover-preview hidden'
    document.body.appendChild(this.previewElement)
    return this.previewElement
  }

  renderPreview() {
    if (!this.inspectModeActive || !this.hoveredElement) {
      this.hidePreview()
      return
    }

    const previewSource = this.hoveredElement.querySelector('.node-preview')
    if (!previewSource) {
      this.hidePreview()
      return
    }

    const previewEl = this.ensurePreviewElement()
    const nodeType = this.hoveredElement.dataset.type
    const rect = this.hoveredElement.getBoundingClientRect()
    const gap = 16
    const margin = 12

    previewEl.innerHTML = `
      <div class="node-hover-preview__label">${this.labelFor(nodeType)}</div>
      <div class="node-hover-preview__content">${previewSource.innerHTML}</div>
    `
    previewEl.dataset.nodeType = nodeType || 'default'

    previewEl.classList.remove('hidden')

    const previewRect = previewEl.getBoundingClientRect()
    let left = rect.right + gap
    let top = rect.top

    if (left + previewRect.width > window.innerWidth - margin) {
      left = rect.left - previewRect.width - gap
    }

    if (left < margin) {
      left = margin
    }

    if (top + previewRect.height > window.innerHeight - margin) {
      top = window.innerHeight - previewRect.height - margin
    }

    if (top < margin) {
      top = margin
    }

    previewEl.style.left = `${left}px`
    previewEl.style.top = `${top}px`
  }

  labelFor(nodeType) {
    switch (nodeType) {
    case 'condition':
      return 'Condition'
    case 'action':
      return 'Action'
    case 'organizer':
      return 'Organizer'
    case 'root':
      return 'Root'
    default:
      return 'Node'
    }
  }

  hidePreview() {
    if (!this.previewElement) { return }
    this.previewElement.classList.add('hidden')
  }

  destroy() {
    document.removeEventListener('keydown', this.boundHandleKeyDown)
    this.previewElement?.remove()
    this.previewElement = null
    this.hoveredElement = null
    this.attachedElements = new WeakMap()
  }
}

export default HoverPreviewHandler
