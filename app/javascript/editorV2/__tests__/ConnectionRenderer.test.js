import { describe, it, expect, vi } from 'vitest'
import ConnectionRenderer from '../rendering/ConnectionRenderer.js'
import Store from '../state/Store.js'
import { EVENTS } from '../constants.js'

describe('ConnectionRenderer', () => {
  function buildRenderer() {
    const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const store = new Store()
    const viewport = { subscribe: () => () => {} }
    return new ConnectionRenderer(svgContainer, store, viewport)
  }

  function buildLine(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    return line
  }

  function buildDeleteBtn() {
    const btn = document.createElement('button')
    btn.style.display = 'none'
    return btn
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

  describe('_setHoveredConnection', () => {
    it('shows the delete button for the hovered connection', () => {
      const renderer = buildRenderer()
      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 100, 0), deleteBtn: btn })

      renderer._setHoveredConnection('conn-1')

      expect(btn.style.display).toBe('block')
      expect(renderer._hoveredConnectionId).toBe('conn-1')
    })

    it('hides the previous connection button when hover moves to another', () => {
      const renderer = buildRenderer()
      const btn1 = buildDeleteBtn()
      const btn2 = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 100, 0), deleteBtn: btn1 })
      renderer.elements.set('conn-2', { line: buildLine(0, 50, 100, 50), deleteBtn: btn2 })

      renderer._setHoveredConnection('conn-1')
      renderer._setHoveredConnection('conn-2')

      expect(btn1.style.display).toBe('none')
      expect(btn2.style.display).toBe('block')
    })

    it('hides the button when called with null', () => {
      const renderer = buildRenderer()
      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 100, 0), deleteBtn: btn })

      renderer._setHoveredConnection('conn-1')
      renderer._setHoveredConnection(null)

      expect(btn.style.display).toBe('none')
      expect(renderer._hoveredConnectionId).toBe(null)
    })

    it('is a no-op when called with the already-hovered connection', () => {
      const renderer = buildRenderer()
      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 100, 0), deleteBtn: btn })

      renderer._setHoveredConnection('conn-1')
      btn.style.display = 'none' // mutate to detect re-entry
      renderer._setHoveredConnection('conn-1')

      expect(btn.style.display).toBe('none') // not re-shown — no-op
    })
  })

  describe('handleChange NODE_UPDATE', () => {
    it('clears a visible delete button when a node moves during an interaction', () => {
      const renderer = buildRenderer()
      renderer.viewport = { subscribe: () => () => {}, isInteracting: () => true }
      vi.spyOn(renderer, 'updateConnectionsFor').mockImplementation(() => {})

      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 200, 0), deleteBtn: btn })
      btn.style.display = 'block'
      renderer._hoveredConnectionId = 'conn-1'

      renderer.handleChange(EVENTS.NODE_UPDATE, { clientId: 'node-1' })

      expect(btn.style.display).toBe('none')
      expect(renderer._hoveredConnectionId).toBe(null)
    })

    it('leaves a visible delete button alone when not interacting', () => {
      const renderer = buildRenderer()
      renderer.viewport = { subscribe: () => () => {}, isInteracting: () => false }
      vi.spyOn(renderer, 'updateConnectionsFor').mockImplementation(() => {})

      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 200, 0), deleteBtn: btn })
      btn.style.display = 'block'
      renderer._hoveredConnectionId = 'conn-1'

      renderer.handleChange(EVENTS.NODE_UPDATE, { clientId: 'node-1' })

      expect(btn.style.display).toBe('block')
      expect(renderer._hoveredConnectionId).toBe('conn-1')
    })
  })

  describe('_updateHoveredConnection', () => {
    it('hovers the nearest connection within the threshold', () => {
      const renderer = buildRenderer()
      renderer.viewport = {
        subscribe: () => () => {},
        screenToGraphPoint: (x, y) => ({ x, y }),
        getZoom: () => 1
      }

      const btn1 = buildDeleteBtn()
      const btn2 = buildDeleteBtn()
      // conn-1: horizontal line at y=0
      // conn-2: horizontal line at y=100
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 200, 0), deleteBtn: btn1 })
      renderer.elements.set('conn-2', { line: buildLine(0, 100, 200, 100), deleteBtn: btn2 })

      // cursor at (100, 10) — closer to conn-1
      renderer._updateHoveredConnection(100, 10)

      expect(btn1.style.display).toBe('block')
      expect(btn2.style.display).toBe('none')
    })

    it('hovers nothing when cursor is beyond the threshold', () => {
      const renderer = buildRenderer()
      renderer.viewport = {
        subscribe: () => () => {},
        screenToGraphPoint: (x, y) => ({ x, y }),
        getZoom: () => 1
      }

      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 100, 0), deleteBtn: btn })

      // cursor far from the line (y=200, threshold is 22)
      renderer._updateHoveredConnection(50, 200)

      expect(btn.style.display).toBe('none')
      expect(renderer._hoveredConnectionId).toBe(null)
    })

    it('does not hover connections while the viewport is interacting', () => {
      const renderer = buildRenderer()
      renderer.viewport = {
        subscribe: () => () => {},
        screenToGraphPoint: (x, y) => ({ x, y }),
        getZoom: () => 1,
        isInteracting: () => true
      }

      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 200, 0), deleteBtn: btn })

      // cursor directly on the line — would hover if not interacting
      renderer._updateHoveredConnection(100, 0)

      expect(btn.style.display).toBe('none')
      expect(renderer._hoveredConnectionId).toBe(null)
    })

    it('does not hover a connection when the cursor is over a node', () => {
      const renderer = buildRenderer()
      renderer.viewport = {
        subscribe: () => () => {},
        screenToGraphPoint: (x, y) => ({ x, y }),
        getZoom: () => 1
      }

      const nodeChild = document.createElement('div')
      const nodeEl = document.createElement('div')
      nodeEl.className = 'node'
      nodeEl.appendChild(nodeChild)

      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 200, 0), deleteBtn: btn })

      // cursor directly on the line, but the event landed on a node child
      renderer._updateHoveredConnection(100, 0, nodeChild)

      expect(btn.style.display).toBe('none')
      expect(renderer._hoveredConnectionId).toBe(null)
    })

    it('still hovers a connection when the cursor is over the delete button (not a node)', () => {
      const renderer = buildRenderer()
      renderer.viewport = {
        subscribe: () => () => {},
        screenToGraphPoint: (x, y) => ({ x, y }),
        getZoom: () => 1
      }

      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 200, 0), deleteBtn: btn })

      renderer._updateHoveredConnection(100, 0, btn)

      expect(btn.style.display).toBe('block')
      expect(renderer._hoveredConnectionId).toBe('conn-1')
    })

    it('clears an already-visible delete button once the viewport starts interacting', () => {
      const renderer = buildRenderer()
      renderer.viewport = {
        subscribe: () => () => {},
        screenToGraphPoint: (x, y) => ({ x, y }),
        getZoom: () => 1,
        isInteracting: () => true
      }

      const btn = buildDeleteBtn()
      renderer.elements.set('conn-1', { line: buildLine(0, 0, 200, 0), deleteBtn: btn })
      // a hover left visible from just before the drag began
      btn.style.display = 'block'
      renderer._hoveredConnectionId = 'conn-1'

      renderer._updateHoveredConnection(100, 0)

      expect(btn.style.display).toBe('none')
      expect(renderer._hoveredConnectionId).toBe(null)
    })
  })
})
