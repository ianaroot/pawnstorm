import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ToolbarHandler from '../handlers/ToolbarHandler.js'
import Store from '../state/Store.js'
import Node from '../models/Node.js'

function buildViewport() {
  return {
    getVisibleCanvasCenter: vi.fn(() => ({ x: 400, y: 300 })),
    isGraphPointVisible: vi.fn(() => true)
  }
}

function addNode(store, { clientId, type, x, y }) {
  store.addNode(new Node({ clientId, type, position: { x, y } }))
}

describe('ToolbarHandler', () => {
  let store
  let history
  let syncManager
  let viewport
  let toolbarHandler

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="bot-editor" data-editor-bot-name-value="Alpha Bot" data-editor-bot-description-value="Initial description">
        <div id="bot-name-display">Alpha Bot</div>
        <button type="button" data-bot-rename-open>Rename</button>
        <div id="bot-rename-modal" class="hidden" aria-hidden="true">
          <input id="bot-rename-name" type="text">
          <textarea id="bot-rename-description"></textarea>
          <p class="hidden" data-bot-rename-error></p>
          <button type="button" data-bot-rename-save>Save</button>
          <button type="button" data-bot-rename-cancel>Cancel</button>
        </div>
      </div>
    `
    store = new Store()
    history = { canUndo: () => false, canRedo: () => false }
    syncManager = {
      setPersistedMutationCallback: vi.fn(),
      updateBot: vi.fn().mockResolvedValue({ name: 'Renamed Bot', description: 'Updated description' })
    }
    viewport = buildViewport()
    toolbarHandler = new ToolbarHandler(store, history, syncManager, document.createElement('div'), null, viewport)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('places add-node inserts near the recent placement anchor', () => {
    store.setRecentPlacementAnchor({ x: 500, y: 400 })

    expect(toolbarHandler.findPlacementPosition('condition')).toEqual({ x: 450, y: 336 })
  })

  it('falls back to the visible canvas center when no anchor exists', () => {
    expect(toolbarHandler.findPlacementPosition('action')).toEqual({ x: 346, y: 246 })
  })

  it('falls back to the visible canvas center when the recent anchor is outside the viewport', () => {
    store.setRecentPlacementAnchor({ x: 900, y: 800 })
    viewport.isGraphPointVisible.mockReturnValue(false)

    expect(toolbarHandler.findPlacementPosition('condition')).toEqual({ x: 350, y: 236 })
  })

  it('searches around the recent anchor when the direct placement is blocked', () => {
    store.setRecentPlacementAnchor({ x: 500, y: 400 })
    addNode(store, { clientId: 'blocker', type: 'condition', x: 450, y: 336 })

    const position = toolbarHandler.findPlacementPosition('condition')

    expect(position).not.toEqual({ x: 450, y: 336 })
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeGreaterThanOrEqual(0)
  })

  it('enables the delete button when at least one selected node is deletable', () => {
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'btn-delete-node'
    document.body.appendChild(deleteBtn)

    addNode(store, { clientId: 'root', type: 'root', x: 0, y: 0 })
    addNode(store, { clientId: 'child', type: 'condition', x: 100, y: 100 })
    store.setSelectedNodeIds(['root', 'child'])

    toolbarHandler.updateDeleteButton()

    expect(deleteBtn.disabled).toBe(false)
  })

  it('disables the delete button when only root nodes are selected', () => {
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'btn-delete-node'
    document.body.appendChild(deleteBtn)

    addNode(store, { clientId: 'root', type: 'root', x: 0, y: 0 })
    store.setSelectedNodeIds(['root'])

    toolbarHandler.updateDeleteButton()

    expect(deleteBtn.disabled).toBe(true)
  })

  it('opens the rename modal with the current bot metadata', () => {
    toolbarHandler.openRenameModal()

    expect(document.getElementById('bot-rename-modal').classList.contains('hidden')).toBe(false)
    expect(document.getElementById('bot-rename-name').value).toBe('Alpha Bot')
    expect(document.getElementById('bot-rename-description').value).toBe('Initial description')
  })

  it('saves rename changes and updates the editor title', async () => {
    toolbarHandler.openRenameModal()
    document.getElementById('bot-rename-name').value = 'Renamed Bot'
    document.getElementById('bot-rename-description').value = 'Updated description'

    await toolbarHandler.handleRenameSave()

    expect(syncManager.updateBot).toHaveBeenCalledWith({
      name: 'Renamed Bot',
      description: 'Updated description'
    })
    expect(document.getElementById('bot-name-display').textContent).toBe('Renamed Bot')
    expect(document.getElementById('bot-name-display').title).toBe('Renamed Bot')
    expect(document.getElementById('bot-rename-modal').classList.contains('hidden')).toBe(true)
    expect(document.querySelector('.bot-editor').dataset.editorBotNameValue).toBe('Renamed Bot')
    expect(document.querySelector('.bot-editor').dataset.editorBotDescriptionValue).toBe('Updated description')
  })
})
