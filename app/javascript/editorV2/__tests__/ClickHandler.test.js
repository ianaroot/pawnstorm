import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import ClickHandler from '../handlers/ClickHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'

vi.mock('../panels/ConditionForm', () => ({
  default: class {
    attach() {}
    detach() {}
    populate() {}
  }
}))

function buildNodeElement(clientId) {
  const element = document.createElement('div')
  element.className = 'node'
  element.dataset.clientId = clientId
  return element
}

function buildEditorPanel() {
  const panel = document.createElement('div')
  panel.id = 'node-form-panel'
  panel.className = 'node-form-panel hidden'
  panel.innerHTML = `
    <span id="edit-node-type"></span>
    <div id="condition-form" class="hidden"></div>
    <div id="action-form" class="hidden"></div>
    <div id="organizer-form" class="hidden"></div>
  `
  document.body.appendChild(panel)
  return panel
}

function dispatchClick(element, overrides = {}) {
  element.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    ...overrides
  }))
}

describe('ClickHandler', () => {
  let store
  let history
  let syncManager
  let editorPanel
  let clickHandler
  let rootNode
  let conditionNode
  let actionNode
  let rootElement
  let conditionElement
  let actionElement

  beforeEach(() => {
    store = new Store()
    history = {}
    editorPanel = buildEditorPanel()

    rootNode = new Node({ clientId: 'root', type: 'root', position: { x: 0, y: 0 } })
    conditionNode = new Node({ clientId: 'condition', type: 'condition', position: { x: 100, y: 100 } })
    actionNode = new Node({ clientId: 'action', type: 'action', position: { x: 200, y: 100 } })
    store.addNode(rootNode)
    store.addNode(conditionNode)
    store.addNode(actionNode)

    rootElement = buildNodeElement(rootNode.clientId)
    conditionElement = buildNodeElement(conditionNode.clientId)
    actionElement = buildNodeElement(actionNode.clientId)

    syncManager = {
      deleteNodes: vi.fn().mockResolvedValue({})
    }

    clickHandler = new ClickHandler(store, history, editorPanel)
    clickHandler.setSyncManager(syncManager)
    clickHandler.attach(rootElement, rootNode.clientId)
    clickHandler.attach(conditionElement, conditionNode.clientId)
    clickHandler.attach(actionElement, actionNode.clientId)
    clickHandler.setupGlobalHandlers()
  })

  afterEach(() => {
    clickHandler.destroy()
    editorPanel.remove()
    vi.restoreAllMocks()
  })

  it('opens the editor on a plain single-click on a non-root node', () => {
    dispatchClick(conditionElement)

    expect(store.getSelectedNodeIds()).toEqual([conditionNode.clientId])
    expect(store.getEditingNode()).toBe(conditionNode.clientId)
    expect(editorPanel.classList.contains('hidden')).toBe(false)
    expect(editorPanel.classList.contains('node-form-panel--condition')).toBe(true)
  })

  it('does not open the editor on a root node click', () => {
    dispatchClick(rootElement)

    expect(store.getSelectedNodeIds()).toEqual([rootNode.clientId])
    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)
  })

  it('does not open the editor for shift-click or alt-click selection', () => {
    dispatchClick(conditionElement, { shiftKey: true })

    expect(store.getSelectedNodeIds()).toEqual([conditionNode.clientId])
    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)

    store.selectOnlyNode(conditionNode.clientId)
    dispatchClick(actionElement, { altKey: true })

    expect(store.getSelectedNodeIds()).toEqual([actionNode.clientId])
    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)
  })

  it('keeps the editor open when clicking inside it and closes it on background clicks', () => {
    dispatchClick(conditionElement)

    const editorButton = document.createElement('button')
    editorButton.type = 'button'
    editorPanel.appendChild(editorButton)

    dispatchClick(editorButton)

    expect(store.getSelectedNodeIds()).toEqual([conditionNode.clientId])
    expect(store.getEditingNode()).toBe(conditionNode.clientId)
    expect(editorPanel.classList.contains('hidden')).toBe(false)

    dispatchClick(document.body)

    expect(store.getSelectedNodeIds()).toEqual([])
    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)
  })

  it('deletes the selected node set with one confirmation and closes the editor when needed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    dispatchClick(conditionElement)
    dispatchClick(actionElement, { shiftKey: true })

    expect(store.getSelectedNodeIds()).toEqual([conditionNode.clientId, actionNode.clientId])
    expect(store.getEditingNode()).toBe(conditionNode.clientId)

    await clickHandler.deleteSelectedNodes()

    expect(confirmSpy).toHaveBeenCalledWith('Delete 2 selected nodes?')
    expect(syncManager.deleteNodes).toHaveBeenCalledWith([conditionNode.clientId, actionNode.clientId])
    expect(store.getSelectedNodeIds()).toEqual([])
    expect(clickHandler.getEditingNodeId()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)
  })
})
