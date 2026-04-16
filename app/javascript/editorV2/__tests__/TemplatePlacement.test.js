import { describe, expect, it, vi } from 'vitest'
import { findTemplateAnchor } from '../templates/TemplatePlacement.js'
import { TEMPLATES } from '../templates/TemplateRegistry.js'
import Store from '../state/Store.js'

describe('TemplatePlacement', () => {
  it('places templates near the recent anchor when provided', () => {
    const store = new Store()
    const template = TEMPLATES.find(entry => entry.id === 'winning-capture')

    expect(findTemplateAnchor(template, null, store, { x: 500, y: 400 })).toEqual({ x: 430, y: 344 })
  })

  it('falls back to the visible center when no recent anchor exists', () => {
    const store = new Store()
    const template = TEMPLATES.find(entry => entry.id === 'winning-capture')
    const viewport = {
      getVisibleCanvasCenter: vi.fn(() => ({ x: 400, y: 300 })),
      container: {
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, right: 800, bottom: 600 }))
      },
      screenToGraphPoint: vi.fn((x, y) => ({ x, y }))
    }

    expect(findTemplateAnchor(template, viewport, store)).toEqual({ x: 330, y: 244 })
  })
})
