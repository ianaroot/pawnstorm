import { describe, it, expect, vi } from 'vitest'
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

  describe('updateConnectionsFor', () => {
    it('updates all incoming and outgoing connections for a node', () => {
      const renderer = buildRenderer()
      const store = renderer.store
      const outgoing = { clientId: 'out-1' }
      const incoming = { clientId: 'in-1' }

      store.getConnectionsFor = vi.fn(() => ({ outgoing: [outgoing], incoming: [incoming] }))
      vi.spyOn(renderer, 'updateConnectionPosition').mockImplementation(() => {})

      renderer.updateConnectionsFor('node-1')

      expect(store.getConnectionsFor).toHaveBeenCalledWith('node-1')
      expect(renderer.updateConnectionPosition).toHaveBeenCalledWith('out-1')
      expect(renderer.updateConnectionPosition).toHaveBeenCalledWith('in-1')
    })
  })
})
