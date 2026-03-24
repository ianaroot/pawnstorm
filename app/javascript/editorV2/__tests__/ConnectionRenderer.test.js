import { describe, it, expect } from 'vitest'
import ConnectionRenderer from '../rendering/ConnectionRenderer.js'
import Store from '../state/Store.js'

describe('ConnectionRenderer', () => {
  function buildRenderer() {
    const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const store = new Store()
    const viewport = { subscribe: () => () => {} }
    return new ConnectionRenderer(svgContainer, store, viewport)
  }

  describe('getRenderedOutputBottomOffset', () => {
    it('returns offsetHeight for non-root source nodes', () => {
      const renderer = buildRenderer()
      const sourceNode = { type: 'condition' }
      const sourceEl = { offsetHeight: 92 }

      expect(renderer.getRenderedOutputBottomOffset(sourceNode, sourceEl)).toBe(92)
    })

    it('returns undefined for root source nodes', () => {
      const renderer = buildRenderer()
      const sourceNode = { type: 'root' }
      const sourceEl = { offsetHeight: 100 }

      expect(renderer.getRenderedOutputBottomOffset(sourceNode, sourceEl)).toBeUndefined()
    })
  })
})
