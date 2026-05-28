import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import ClickHandler from '../handlers/ClickHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'

vi.mock('../panels/ConditionForm', () => ({
  default: class {
    attach() {}
    detach() {}
    populate() {}
    buildPayload() { return {} }
  }
}))

function makeActionsMock() {
  const cache = {}
  return new Proxy({}, {
    get(_, prop) {
      if (!(prop in cache)) { cache[prop] = vi.fn() }
      return cache[prop]
    }
  })
}

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
    <div id="score-form" class="hidden">
        <select id="action-type"><option value="add">Add</option><option value="multiply">Multiply</option></select>
        <input id="action-value" type="number" value="1">
      </div>
    <div id="organizer-form" class="hidden">
      <input id="organizer-title" type="text" value="Organizer">
      <textarea id="organizer-notes"></textarea>
    </div>
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
  let editorPanel
  let clickHandler
  let rootNode, conditionNode, actionNode, organizerNode
  let rootElement, conditionElement, actionElement, organizerElement
  let boardStatePreview

  beforeEach(() => {
    store = new Store()
    editorPanel = buildEditorPanel()

    rootNode      = new Node({ clientId: 'root',      type: 'root',      position: { x: 0,   y: 0   } })
    conditionNode = new Node({ clientId: 'condition', type: 'condition', position: { x: 100, y: 100 } })
    actionNode    = new Node({ clientId: 'score',     type: 'score',     position: { x: 200, y: 100 } })
    organizerNode = new Node({ clientId: 'organizer', type: 'organizer', position: { x: 300, y: 100 } })
    store.addNode(rootNode)
    store.addNode(conditionNode)
    store.addNode(actionNode)
    store.addNode(organizerNode)

    rootElement      = buildNodeElement(rootNode.clientId)
    conditionElement = buildNodeElement(conditionNode.clientId)
    actionElement    = buildNodeElement(actionNode.clientId)
    organizerElement = buildNodeElement(organizerNode.clientId)

    clickHandler = new ClickHandler(store, {}, editorPanel)
    clickHandler.actions = makeActionsMock()

    boardStatePreview = {
      activate: vi.fn(),
      deactivate: vi.fn(),
      showSelectionPreview: vi.fn(),
      isEnabled: false,
      mode: 'idle'
    }
    clickHandler.setBoardStatePreview(boardStatePreview)
    clickHandler.attach(rootElement,      rootNode.clientId)
    clickHandler.attach(conditionElement, conditionNode.clientId)
    clickHandler.attach(actionElement,    actionNode.clientId)
    clickHandler.attach(organizerElement, organizerNode.clientId)
    clickHandler.setupGlobalHandlers()
  })

  afterEach(() => {
    clickHandler.destroy()
    editorPanel.remove()
    vi.restoreAllMocks()
  })

  // ── Editor panel visibility ────────────────────────────────────────────────

  it('shows the editor panel and condition form on a plain click of a condition node', () => {
    dispatchClick(conditionElement)

    expect(store.getEditingNode()).toBe(conditionNode.clientId)
    expect(editorPanel.classList.contains('hidden')).toBe(false)
    expect(editorPanel.classList.contains('node-form-panel--condition')).toBe(true)
    expect(editorPanel.querySelector('#condition-form').classList.contains('hidden')).toBe(false)
    expect(editorPanel.querySelector('#score-form').classList.contains('hidden')).toBe(true)
    expect(editorPanel.querySelector('#organizer-form').classList.contains('hidden')).toBe(true)
  })

  it('shows the score form and hides others when opening a score node', () => {
    dispatchClick(actionElement)

    expect(editorPanel.classList.contains('hidden')).toBe(false)
    expect(editorPanel.querySelector('#score-form').classList.contains('hidden')).toBe(false)
    expect(editorPanel.querySelector('#condition-form').classList.contains('hidden')).toBe(true)
    expect(editorPanel.querySelector('#organizer-form').classList.contains('hidden')).toBe(true)
  })

  it('shows the organizer form and hides others when opening an organizer node', () => {
    dispatchClick(organizerElement)

    expect(editorPanel.classList.contains('hidden')).toBe(false)
    expect(editorPanel.querySelector('#organizer-form').classList.contains('hidden')).toBe(false)
    expect(editorPanel.querySelector('#condition-form').classList.contains('hidden')).toBe(true)
    expect(editorPanel.querySelector('#score-form').classList.contains('hidden')).toBe(true)
  })

  it('does not open the editor on a root node click', () => {
    dispatchClick(rootElement)

    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)
  })

  it('does not open the editor for shift-click or alt-click selection', () => {
    dispatchClick(conditionElement, { shiftKey: true })
    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)

    dispatchClick(actionElement, { altKey: true })
    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)
  })

  it('keeps the editor open when clicking inside it and closes it on background clicks', () => {
    dispatchClick(conditionElement)

    const editorButton = document.createElement('button')
    editorButton.type = 'button'
    editorPanel.appendChild(editorButton)
    dispatchClick(editorButton)

    expect(store.getEditingNode()).toBe(conditionNode.clientId)
    expect(editorPanel.classList.contains('hidden')).toBe(false)

    dispatchClick(document.body)

    expect(store.getSelectedNodeIds()).toEqual([])
    expect(store.getEditingNode()).toBe(null)
    expect(editorPanel.classList.contains('hidden')).toBe(true)
  })

  // ── EditorActions delegation ───────────────────────────────────────────────

  it('delegates to actions.activateConditionPreview when opening a condition node', () => {
    dispatchClick(conditionElement)

    expect(clickHandler.actions.activateConditionPreview).toHaveBeenCalledWith(clickHandler.conditionForm)
  })

  it('delegates to actions.deactivatePreview when opening a score node', () => {
    dispatchClick(actionElement)
    expect(clickHandler.actions.deactivatePreview).toHaveBeenCalled()
  })

  it('delegates to actions.deactivatePreview when opening an organizer node', () => {
    dispatchClick(organizerElement)
    expect(clickHandler.actions.deactivatePreview).toHaveBeenCalled()
  })

  it('delegates to actions.deactivatePreview when closing the editor via background click', () => {
    dispatchClick(conditionElement)
    dispatchClick(document.body)

    expect(clickHandler.actions.deactivatePreview).toHaveBeenCalled()
  })

  it('delegates save to actions.save', async () => {
    await clickHandler.handleSave()
    expect(clickHandler.actions.save).toHaveBeenCalled()
  })

  // ── Selection ──────────────────────────────────────────────────────────────

  it('updates the recent placement anchor to the newly shift-clicked node', () => {
    dispatchClick(conditionElement)
    dispatchClick(actionElement, { shiftKey: true })

    expect(store.getSelectedNodeIds()).toEqual([conditionNode.clientId, actionNode.clientId])
    expect(store.getRecentPlacementAnchor()).toEqual(actionNode.position)
  })

  it('calls actions.renderSelectionPreview when multiple nodes are selected while preview is active', () => {
    boardStatePreview.mode = 'form'
    boardStatePreview.isEnabled = true

    store.setSelectedNodeIds([conditionNode.clientId, actionNode.clientId])

    expect(clickHandler.actions.renderSelectionPreview).toHaveBeenCalled()
  })

  // ── buildDataPayloadByType ─────────────────────────────────────────────────

  it('returns actionType and numeric value from DOM for a score node', () => {
    editorPanel.querySelector('#action-type').value = 'multiply'
    editorPanel.querySelector('#action-value').value = '3'

    const payload = clickHandler.buildDataPayloadByType(actionNode)

    expect(payload).toEqual({ actionType: 'multiply', value: 3 })
  })

  it('returns title and notes from DOM for an organizer node', () => {
    editorPanel.querySelector('#organizer-title').value = 'My Group'
    editorPanel.querySelector('#organizer-notes').value = 'Some notes'

    const payload = clickHandler.buildDataPayloadByType(organizerNode)

    expect(payload).toEqual({ title: 'My Group', notes: 'Some notes' })
  })

  it('delegates to conditionForm.buildPayload for a condition node', () => {
    const expected = { subject: 'allied', operator: 'targets', target: 'enemy' }
    clickHandler.conditionForm.buildPayload = vi.fn(() => expected)

    const payload = clickHandler.buildDataPayloadByType(conditionNode)

    expect(clickHandler.conditionForm.buildPayload).toHaveBeenCalled()
    expect(payload).toBe(expected)
  })

  describe('editor:node-editing-started event', () => {
    it('fires with clientId + type when a node opens for editing', () => {
      const handler = vi.fn()
      document.addEventListener('editor:node-editing-started', handler)

      dispatchClick(conditionElement)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler.mock.calls[0][0].detail).toEqual({
        clientId: conditionNode.clientId,
        type: 'condition'
      })
      document.removeEventListener('editor:node-editing-started', handler)
    })

    it('does not fire when a root node is clicked', () => {
      const handler = vi.fn()
      document.addEventListener('editor:node-editing-started', handler)

      dispatchClick(rootElement)

      expect(handler).not.toHaveBeenCalled()
      document.removeEventListener('editor:node-editing-started', handler)
    })
  })
})
