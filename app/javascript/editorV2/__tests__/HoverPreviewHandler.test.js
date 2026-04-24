import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import HoverPreviewHandler from '../handlers/HoverPreviewHandler.js'

function buildNodeElement({ type = 'condition', previewHtml = 'Preview text' } = {}) {
  const element = document.createElement('div')
  element.className = `node ${type}`
  element.dataset.type = type
  element.innerHTML = `<div class="node-preview">${previewHtml}</div>`
  element.getBoundingClientRect = vi.fn(() => ({
    left: 100,
    top: 120,
    right: 200,
    bottom: 200,
    width: 100,
    height: 80
  }))
  document.body.appendChild(element)
  return element
}

describe('HoverPreviewHandler', () => {
  let handler

  beforeEach(() => {
    document.body.innerHTML = ''
    handler = new HoverPreviewHandler()
    handler.attach()
  })

  afterEach(() => {
    handler.destroy()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('shows a preview when inspect mode is toggled on and a node is hovered', () => {
    const node = buildNodeElement({ previewHtml: '<span>Expanded preview</span>' })
    handler.attachNode(node)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', bubbles: true }))
    node.dispatchEvent(new Event('mouseenter', { bubbles: true }))

    const preview = document.querySelector('.node-hover-preview')
    expect(preview).not.toBeNull()
    expect(preview.classList.contains('hidden')).toBe(false)
    expect(preview.textContent).toContain('Condition')
    expect(preview.innerHTML).toContain('Expanded preview')
  })

  it('hides the preview when inspect mode is toggled off', () => {
    const node = buildNodeElement()
    handler.attachNode(node)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', bubbles: true }))
    node.dispatchEvent(new Event('mouseenter', { bubbles: true }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', bubbles: true }))

    const preview = document.querySelector('.node-hover-preview')
    expect(preview.classList.contains('hidden')).toBe(true)
  })

  it('hides the preview when escape exits inspect mode', () => {
    const node = buildNodeElement()
    handler.attachNode(node)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', bubbles: true }))
    node.dispatchEvent(new Event('mouseenter', { bubbles: true }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    const preview = document.querySelector('.node-hover-preview')
    expect(preview.classList.contains('hidden')).toBe(true)
  })
})
