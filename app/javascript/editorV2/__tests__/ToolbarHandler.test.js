import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ToolbarHandler from '../handlers/ToolbarHandler.js'
import Store from '../state/Store.js'
import { setConditionPreviewMode } from '../utils/conditionPreviewFormatter.js'

describe('ToolbarHandler', () => {
  let store
  let history
  let syncManager
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
        <button type="button" class="btn-undo" disabled>Undo</button>
        <button type="button" class="btn-redo" disabled>Redo</button>
      </div>
    `
    store = new Store()
    history = { canUndo: () => false, canRedo: () => false }
    syncManager = {
      setPersistedMutationCallback: vi.fn(),
      updateBot: vi.fn().mockResolvedValue({ name: 'Renamed Bot', description: 'Updated description' })
    }
    toolbarHandler = new ToolbarHandler(store, history, syncManager, document.createElement('div'), null, null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('syncPreviewModeButton reflects the current preview mode', () => {
    const btn = document.createElement('button')
    setConditionPreviewMode('sentence')
    toolbarHandler.syncPreviewModeButton(btn)
    expect(btn.textContent).toBe('Sentences: on')
    expect(btn.getAttribute('aria-pressed')).toBe('true')

    setConditionPreviewMode('chunks')
    toolbarHandler.syncPreviewModeButton(btn)
    expect(btn.textContent).toBe('Sentences: off')
    expect(btn.getAttribute('aria-pressed')).toBe('false')

    setConditionPreviewMode('sentence')
  })

  it('enables the delete button when actions.canDelete() returns true', () => {
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'btn-delete-node'
    document.body.appendChild(deleteBtn)

    toolbarHandler.actions = { canDelete: () => true, canUndo: () => false, canRedo: () => false }
    toolbarHandler.updateDeleteButton()

    expect(deleteBtn.disabled).toBe(false)
  })

  it('disables the delete button when actions.canDelete() returns false', () => {
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'btn-delete-node'
    document.body.appendChild(deleteBtn)

    toolbarHandler.actions = { canDelete: () => false, canUndo: () => false, canRedo: () => false }
    toolbarHandler.updateDeleteButton()

    expect(deleteBtn.disabled).toBe(true)
  })

  it('opens the rename modal with the current bot metadata', () => {
    toolbarHandler.openRenameModal()

    expect(document.getElementById('bot-rename-modal').classList.contains('hidden')).toBe(false)
    expect(document.getElementById('bot-rename-name').value).toBe('Alpha Bot')
    expect(document.getElementById('bot-rename-description').value).toBe('Initial description')
  })

  // ── Add-node delegation ───────────────────────────────────────────────────

  it('delegates handleAddNode to actions.addNode with the button data-type', async () => {
    toolbarHandler.actions = { addNode: vi.fn().mockResolvedValue(undefined) }

    const btn = document.createElement('button')
    btn.dataset.type = 'condition'
    await toolbarHandler.handleAddNode({ target: btn })

    expect(toolbarHandler.actions.addNode).toHaveBeenCalledWith('condition')
  })

  // ── Undo / redo delegation ────────────────────────────────────────────────

  it('delegates undo to actions.undo', async () => {
    toolbarHandler.actions = { undo: vi.fn().mockResolvedValue(undefined) }
    await toolbarHandler.undo()
    expect(toolbarHandler.actions.undo).toHaveBeenCalled()
  })

  it('delegates redo to actions.redo', async () => {
    toolbarHandler.actions = { redo: vi.fn().mockResolvedValue(undefined) }
    await toolbarHandler.redo()
    expect(toolbarHandler.actions.redo).toHaveBeenCalled()
  })

  // ── Undo / redo button state ──────────────────────────────────────────────

  it('disables undo and redo buttons when actions returns false', () => {
    toolbarHandler.actions = { canDelete: () => false, canUndo: () => false, canRedo: () => false }
    toolbarHandler.updateButtons()

    expect(document.querySelector('.btn-undo').disabled).toBe(true)
    expect(document.querySelector('.btn-redo').disabled).toBe(true)
  })

  it('enables undo and redo buttons when actions returns true', () => {
    toolbarHandler.actions = { canDelete: () => false, canUndo: () => true, canRedo: () => true }
    toolbarHandler.updateButtons()

    expect(document.querySelector('.btn-undo').disabled).toBe(false)
    expect(document.querySelector('.btn-redo').disabled).toBe(false)
  })

  it('adds loading class to undo and redo when syncManager.isUndoRedoPending', () => {
    syncManager.isUndoRedoPending = true
    toolbarHandler.actions = { canDelete: () => false, canUndo: () => false, canRedo: () => false }
    toolbarHandler.updateButtons()

    expect(document.querySelector('.btn-undo').classList.contains('loading')).toBe(true)
    expect(document.querySelector('.btn-redo').classList.contains('loading')).toBe(true)
  })

  // ── Rename ────────────────────────────────────────────────────────────────

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
