import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NodeRenderer from '../rendering/NodeRenderer'
import Store from '../state/Store'
import Node from '../models/Node'
import { EVENTS } from '../constants'

describe('NodeRenderer', () => {
  let container
  let store
  let api
  let renderer

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    store = new Store()
    api = { getNodePreviewHtml: vi.fn().mockResolvedValue('<span>preview</span>') }
    renderer = new NodeRenderer(container, store, api)
  })

  afterEach(() => {
    renderer.destroy()
    container.remove()
    vi.restoreAllMocks()
  })

  it('fetches the preview when a node is persisted', () => {
    const fetchSpy = vi.spyOn(renderer, 'fetchPreview')
    store.emit(EVENTS.NODE_PERSISTED, { clientId: 'node-1' })
    expect(fetchSpy).toHaveBeenCalledWith('node-1')
  })

  it('does not fetch the preview on an optimistic data update', () => {
    store.addNode(new Node({ clientId: 'node-1', type: 'condition', position: { x: 0, y: 0 }, data: {} }))
    const fetchSpy = vi.spyOn(renderer, 'fetchPreview')
    store.updateNode('node-1', { data: { foo: 'bar' } })
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
