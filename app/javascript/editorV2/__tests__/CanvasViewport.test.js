import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CanvasViewport from '../rendering/CanvasViewport'
import Store from '../state/Store'
import Node from '../models/Node'
import { ZOOM_DEFAULT, VIEWPORT_PADDING } from '../constants'

function measure(element, width, height) {
  Object.defineProperty(element, 'clientWidth', { value: width, configurable: true })
  Object.defineProperty(element, 'clientHeight', { value: height, configurable: true })
}

function buildViewport(store) {
  const container = document.createElement('div')
  const workspace = document.createElement('div')
  const scene = document.createElement('div')
  const nodesLayer = document.createElement('div')
  const svgLayer = document.createElement('div')
  container.appendChild(workspace)
  document.body.appendChild(container)

  let scrollLeft = 0
  let scrollTop = 0
  Object.defineProperty(container, 'scrollLeft', { get: () => scrollLeft, set: (v) => { scrollLeft = v }, configurable: true })
  Object.defineProperty(container, 'scrollTop', { get: () => scrollTop, set: (v) => { scrollTop = v }, configurable: true })

  const viewport = new CanvasViewport(container, workspace, scene, nodesLayer, svgLayer, store)
  return { viewport, container }
}

describe('CanvasViewport', () => {
  let store
  let zoomLabel

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback) => { callback(); return 1 })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    zoomLabel = document.createElement('div')
    zoomLabel.id = 'zoom-level'
    document.body.appendChild(zoomLabel)
    store = new Store()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('updateZoomLabel', () => {
    it('reads 100% at the default zoom rather than at 1:1', () => {
      const { viewport } = buildViewport(store)
      viewport.setZoom(ZOOM_DEFAULT)
      expect(zoomLabel.textContent).toBe('100%')
    })

    it('scales the label relative to the default zoom', () => {
      const { viewport } = buildViewport(store)
      viewport.setZoom(ZOOM_DEFAULT * 2)
      expect(zoomLabel.textContent).toBe('200%')
    })
  })

  describe('fitToGraph', () => {
    function addRoot() {
      store.addNode(new Node({ clientId: 'root', type: 'root', position: { x: 400, y: 200 }, data: {} }))
    }

    it('opens horizontally centered on the graph and anchored near its top', () => {
      addRoot()
      const { viewport, container } = buildViewport(store)
      measure(container, 800, 600)

      viewport.fitToGraph()

      const bounds = viewport.getGraphBounds()
      expect(viewport.getVisibleCanvasCenter().x).toBeCloseTo(bounds.centerX, 0)
      expect(viewport.getVisibleGraphBounds().top).toBeCloseTo(bounds.minY - VIEWPORT_PADDING, 0)
    })

    it('does not scroll when the container has not been measured yet', () => {
      addRoot()
      const { viewport, container } = buildViewport(store)
      container.scrollLeft = 123
      container.scrollTop = 456

      viewport.fitToGraph()

      expect(container.scrollLeft).toBe(123)
      expect(container.scrollTop).toBe(456)
    })
  })
})
