import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import KeyboardHandler from '../handlers/KeyboardHandler.js'

describe('KeyboardHandler', () => {
  let keyboardHandler
  let actions

  beforeEach(() => {
    actions = {
      copy: vi.fn(),
      paste: vi.fn().mockResolvedValue(null),
      undo: vi.fn().mockResolvedValue(null),
      redo: vi.fn().mockResolvedValue(null),
      deleteSelected: vi.fn(),
      togglePreview: vi.fn(),
      save: vi.fn().mockResolvedValue(null),
      navigatePreview: vi.fn(() => false),
      closeEditor: vi.fn(),
      canUndo: vi.fn(() => true),
      canRedo: vi.fn(() => true)
    }
    keyboardHandler = new KeyboardHandler()
    keyboardHandler.actions = actions
    keyboardHandler.attach()
  })

  afterEach(() => {
    keyboardHandler.destroy()
    vi.restoreAllMocks()
  })

  function fire(key, modifiers = {}) {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      isComposing: false,
      ...modifiers
    }))
  }

  it('Escape calls closeEditor even when focus is in an input', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(actions.closeEditor).toHaveBeenCalled()
    input.remove()
  })

  it('Ctrl+C calls copy', () => {
    fire('c', { ctrlKey: true })
    expect(actions.copy).toHaveBeenCalled()
  })

  it('Ctrl+V calls paste', () => {
    fire('v', { ctrlKey: true })
    expect(actions.paste).toHaveBeenCalled()
  })

  it('Ctrl+Z calls undo', () => {
    fire('z', { ctrlKey: true })
    expect(actions.undo).toHaveBeenCalled()
  })

  it('Ctrl+Shift+Z calls redo', () => {
    fire('z', { ctrlKey: true, shiftKey: true })
    expect(actions.redo).toHaveBeenCalled()
  })

  it('Ctrl+Y calls redo', () => {
    fire('y', { ctrlKey: true })
    expect(actions.redo).toHaveBeenCalled()
  })

  it('Delete calls deleteSelected', () => {
    fire('Delete')
    expect(actions.deleteSelected).toHaveBeenCalled()
  })

  it('Backspace calls deleteSelected', () => {
    fire('Backspace')
    expect(actions.deleteSelected).toHaveBeenCalled()
  })

  it('p calls togglePreview', () => {
    fire('p')
    expect(actions.togglePreview).toHaveBeenCalled()
  })

  it('Enter calls save', () => {
    fire('Enter')
    expect(actions.save).toHaveBeenCalled()
  })

  it('Shift+Enter does not call save', () => {
    fire('Enter', { shiftKey: true })
    expect(actions.save).not.toHaveBeenCalled()
  })

  it('ArrowLeft calls navigatePreview(-1)', () => {
    fire('ArrowLeft')
    expect(actions.navigatePreview).toHaveBeenCalledWith(-1)
  })

  it('ArrowRight calls navigatePreview(1)', () => {
    fire('ArrowRight')
    expect(actions.navigatePreview).toHaveBeenCalledWith(1)
  })

  it('ignores all shortcuts except Escape when focus is in an input', () => {
    const input = { tagName: 'INPUT', isContentEditable: false }
    const fakeEvent = (key, modifiers = {}) => ({
      key,
      target: input,
      preventDefault: vi.fn(),
      ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, isComposing: false,
      ...modifiers
    })

    keyboardHandler.handleKeyDown(fakeEvent('c', { ctrlKey: true }))
    keyboardHandler.handleKeyDown(fakeEvent('v', { ctrlKey: true }))
    keyboardHandler.handleKeyDown(fakeEvent('z', { ctrlKey: true }))
    keyboardHandler.handleKeyDown(fakeEvent('Delete'))
    keyboardHandler.handleKeyDown(fakeEvent('Backspace'))
    keyboardHandler.handleKeyDown(fakeEvent('p'))
    keyboardHandler.handleKeyDown(fakeEvent('Enter'))

    expect(actions.copy).not.toHaveBeenCalled()
    expect(actions.paste).not.toHaveBeenCalled()
    expect(actions.undo).not.toHaveBeenCalled()
    expect(actions.deleteSelected).not.toHaveBeenCalled()
    expect(actions.togglePreview).not.toHaveBeenCalled()
    expect(actions.save).not.toHaveBeenCalled()
  })
})
