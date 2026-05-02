import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ToolbarHandler from '../handlers/ToolbarHandler.js'
import Store from '../state/Store.js'

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
