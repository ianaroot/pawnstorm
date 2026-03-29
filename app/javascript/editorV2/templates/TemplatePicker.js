import { NODE_DIMENSIONS } from '../constants.js'
import {
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ORDER
} from './TemplateCategories.js'
import { TEMPLATES, templatesForCategory } from './TemplateRegistry.js'

const TEMPLATE_PREVIEW = Object.freeze({
  framePadding: 28,
  frameMinSize: 220,
  frameMaxSize: 360,
  containerInset: 32
})

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function previewBounds(template) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  template.nodes.forEach(node => {
    const dims = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS.default
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + dims.width)
    maxY = Math.max(maxY, node.position.y + dims.height)
  })

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

function nodeAnchor(node, edge) {
  const dims = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS.default

  return {
    x: node.position.x + (dims.width / 2),
    y: edge === 'bottom' ? node.position.y + dims.height : node.position.y
  }
}

function renderTemplatePreview(template) {
  const bounds = previewBounds(template)
  const previewContainer = document.querySelector('[data-template-picker-preview]')
  const availableWidth = previewContainer?.clientWidth || 320
  const frameWidth = Math.max(
    TEMPLATE_PREVIEW.frameMinSize,
    Math.min(TEMPLATE_PREVIEW.frameMaxSize, availableWidth - TEMPLATE_PREVIEW.containerInset)
  )
  const frameHeight = frameWidth
  const scale = Math.min(
    (frameWidth - (TEMPLATE_PREVIEW.framePadding * 2)) / Math.max(bounds.width, 1),
    (frameHeight - (TEMPLATE_PREVIEW.framePadding * 2)) / Math.max(bounds.height, 1),
    1
  )
  const offsetX = ((frameWidth - (bounds.width * scale)) / 2) - (bounds.minX * scale)
  const offsetY = ((frameHeight - (bounds.height * scale)) / 2) - (bounds.minY * scale)
  const nodesByKey = new Map(template.nodes.map(node => [node.key, node]))

  const svgLines = template.connections.map(connection => {
    const source = nodesByKey.get(connection.source)
    const target = nodesByKey.get(connection.target)
    const start = nodeAnchor(source, 'bottom')
    const finish = nodeAnchor(target, 'top')

    return `
      <line
        x1="${(start.x * scale) + offsetX}"
        y1="${(start.y * scale) + offsetY}"
        x2="${(finish.x * scale) + offsetX}"
        y2="${(finish.y * scale) + offsetY}"
        class="template-picker-preview__line" />
    `
  }).join('')

  const nodesHtml = template.nodes.map(node => {
    const dims = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS.default
    const left = (node.position.x * scale) + offsetX
    const top = (node.position.y * scale) + offsetY
    const width = dims.width * scale
    const height = dims.height * scale
    let content = ''

    if (node.type === 'organizer') {
      content = `
        <div class="template-picker-preview__organizer-title">${escapeHtml(node.data.title)}</div>
      `
    } else if (node.type === 'condition') {
      content = `
        <div class="template-picker-preview__condition-line">${escapeHtml(node.data.subject)} ${escapeHtml(node.data.subjectSpecifier)}</div>
        <div class="template-picker-preview__condition-line">${escapeHtml(node.data.relation)} ${escapeHtml(node.data.relationSpecifier)}</div>
      `
    } else if (node.type === 'action') {
      content = `
        <div class="template-picker-preview__action-type">${escapeHtml(node.data.actionType)}</div>
        <div class="template-picker-preview__action-value">${escapeHtml(node.data.value)}</div>
      `
    }

    return `
      <div
        class="template-picker-preview__node template-picker-preview__node--${node.type}"
        style="left:${left}px;top:${top}px;width:${width}px;height:${height}px;">
        <div class="template-picker-preview__node-content">
          ${content}
        </div>
      </div>
    `
  }).join('')

  return `
    <div class="template-picker-preview" style="width:${frameWidth}px;height:${frameHeight}px;">
      <svg class="template-picker-preview__svg" viewBox="0 0 ${frameWidth} ${frameHeight}" preserveAspectRatio="xMidYMid meet">
        ${svgLines}
      </svg>
      ${nodesHtml}
    </div>
  `
}

class TemplatePicker {
  constructor(modal, options = {}) {
    this.modal = modal
    this.onInsert = options.onInsert
    this.activeCategory = TEMPLATE_CATEGORY_ORDER[0]
    this.selectedTemplateId = null
    this.isSubmitting = false

    this.boundHandleBackdropClick = this.handleBackdropClick.bind(this)
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.boundHandleCategoryClick = this.handleCategoryClick.bind(this)
    this.boundHandleTemplateClick = this.handleTemplateClick.bind(this)
    this.boundHandleInsert = this.handleInsert.bind(this)

    this.categoryList = modal?.querySelector('[data-template-picker-categories]')
    this.templateList = modal?.querySelector('[data-template-picker-list]')
    this.templateTitle = modal?.querySelector('[data-template-picker-title]')
    this.templateCategory = modal?.querySelector('[data-template-picker-category]')
    this.templateDescription = modal?.querySelector('[data-template-picker-description]')
    this.templatePreview = modal?.querySelector('[data-template-picker-preview]')
    this.insertButton = modal?.querySelector('[data-template-picker-insert]')
    this.closeButtons = modal?.querySelectorAll('[data-template-picker-close]') || []
  }

  attach() {
    if (!this.modal) {
      return
    }

    this.modal.addEventListener('click', this.boundHandleBackdropClick)
    this.categoryList?.addEventListener('click', this.boundHandleCategoryClick)
    this.templateList?.addEventListener('click', this.boundHandleTemplateClick)
    this.insertButton?.addEventListener('click', this.boundHandleInsert)
    this.closeButtons.forEach(button => {
      button.addEventListener('click', () => this.close())
    })
  }

  open() {
    if (!this.modal) {
      return
    }

    this.activeCategory = TEMPLATE_CATEGORY_ORDER[0]
    const firstTemplate = templatesForCategory(this.activeCategory)[0] || TEMPLATES[0] || null
    this.selectedTemplateId = firstTemplate?.id || null
    this.render()

    this.modal.classList.remove('hidden')
    this.modal.setAttribute('aria-hidden', 'false')
    document.addEventListener('keydown', this.boundHandleKeyDown)
  }

  close() {
    if (!this.modal) {
      return
    }

    this.modal.classList.add('hidden')
    this.modal.setAttribute('aria-hidden', 'true')
    document.removeEventListener('keydown', this.boundHandleKeyDown)
  }

  render() {
    this.renderCategories()
    this.renderTemplateList()
    this.renderDetail()
  }

  renderCategories() {
    if (!this.categoryList) {
      return
    }

    this.categoryList.innerHTML = TEMPLATE_CATEGORY_ORDER.map(category => `
      <button
        type="button"
        class="template-picker__category ${category === this.activeCategory ? 'is-active' : ''}"
        data-category="${category}">
        ${escapeHtml(TEMPLATE_CATEGORY_LABELS[category])}
      </button>
    `).join('')
  }

  renderTemplateList() {
    if (!this.templateList) {
      return
    }

    const templates = templatesForCategory(this.activeCategory)
    if (!templates.find(template => template.id === this.selectedTemplateId)) {
      this.selectedTemplateId = templates[0]?.id || null
    }

    this.templateList.innerHTML = templates.map(template => `
      <button
        type="button"
        class="template-picker__card ${template.id === this.selectedTemplateId ? 'is-selected' : ''}"
        data-template-id="${template.id}">
        <span class="template-picker__card-title">${escapeHtml(template.name)}</span>
        <span class="template-picker__card-description">${escapeHtml(template.description)}</span>
      </button>
    `).join('')
  }

  renderDetail() {
    const template = TEMPLATES.find(item => item.id === this.selectedTemplateId) || null
    const categoryLabel = template ? TEMPLATE_CATEGORY_LABELS[template.category] : ''

    if (this.templateTitle) {
      this.templateTitle.textContent = template?.name || ''
    }
    if (this.templateCategory) {
      this.templateCategory.textContent = categoryLabel
    }
    if (this.templateDescription) {
      this.templateDescription.textContent = template?.description || ''
    }
    if (this.templatePreview) {
      this.templatePreview.innerHTML = template ? renderTemplatePreview(template) : ''
    }
    if (this.insertButton) {
      this.insertButton.disabled = !template || this.isSubmitting
    }
  }

  handleBackdropClick(event) {
    if (event.target === this.modal || event.target.hasAttribute('data-template-picker-close')) {
      this.close()
    }
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.close()
    }
  }

  handleCategoryClick(event) {
    const button = event.target.closest('[data-category]')
    if (!button) {
      return
    }

    this.activeCategory = button.dataset.category
    this.selectedTemplateId = templatesForCategory(this.activeCategory)[0]?.id || null
    this.render()
  }

  handleTemplateClick(event) {
    const button = event.target.closest('[data-template-id]')
    if (!button) {
      return
    }

    this.selectedTemplateId = button.dataset.templateId
    this.render()
  }

  async handleInsert() {
    const template = TEMPLATES.find(item => item.id === this.selectedTemplateId)
    if (!template || !this.onInsert || this.isSubmitting) {
      return
    }

    this.isSubmitting = true
    this.renderDetail()

    try {
      await this.onInsert(template)
      this.close()
    } finally {
      this.isSubmitting = false
      this.renderDetail()
    }
  }
}

export default TemplatePicker
