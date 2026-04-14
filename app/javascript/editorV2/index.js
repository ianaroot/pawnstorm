import Store from './state/Store.js'
import History from './state/History.js'
import API from './api.js'
import SyncManager from './sync/SyncManager.js'
import NodeRenderer from './rendering/NodeRenderer.js'
import ConnectionRenderer from './rendering/ConnectionRenderer.js'
import CanvasViewport from './rendering/CanvasViewport.js'
import DragHandler from './handlers/DragHandler.js'
import ConnectionHandler from './handlers/ConnectionHandler.js'
import ClickHandler from './handlers/ClickHandler.js'
import KeyboardHandler from './handlers/KeyboardHandler.js'
import { EVENTS, MAX_HISTORY } from './constants.js'
import { showError } from './utils/errors.js'
import ToolbarHandler from './handlers/ToolbarHandler.js'

export async function initEditor(botId, container, svgContainer, editorPanel = null) {
  if (!container) { throw new Error('Container element is required') }
  if (!svgContainer) { throw new Error('SVG container element is required') }
  const workspace = document.getElementById('canvas-workspace')
  const scene = document.getElementById('canvas-scene')
  const canvasContainer = container.closest('.canvas-container')

  if (!workspace || !scene || !canvasContainer) { throw new Error('Canvas viewport elements are required') }
  
  // 1. Initialize core state/services
  const api = new API(botId)
  const store = new Store()
  const history = new History(store, MAX_HISTORY)
  const syncManager = new SyncManager(store, history, api)
  const canvasViewport = new CanvasViewport(
    canvasContainer,
    workspace,
    scene,
    container,
    svgContainer,
    store
  )
  
  // 2. Initialize renderers
  const nodeRenderer = new NodeRenderer(container, store, api)
  const connectionRenderer = new ConnectionRenderer(svgContainer, store, canvasViewport)
  connectionRenderer.container = container
  
  // 3. Initialize Handlers
  const dragHandler = new DragHandler(store, syncManager, canvasViewport)
  const connectionHandler = new ConnectionHandler(store, syncManager, connectionRenderer, canvasViewport)
  const clickHandler = new ClickHandler(store, history, editorPanel)
  const toolbarHandler = new ToolbarHandler(store, history, syncManager, container, clickHandler, canvasViewport)
  function attachHandlersToNode(element, clientId) {
    dragHandler.attach(element, clientId)
    connectionHandler.attach(element, clientId)
    clickHandler.attach(element, clientId)
  }

  // 4. Wire renderer callbacks
  nodeRenderer.onRender = (node, element) => {
    attachHandlersToNode(element, node.clientId)
  }
  nodeRenderer.onContentRender = (clientId) => {
    connectionRenderer.updateConnectionsFor(clientId)
  }

  // 5. Load initial graph
  await syncManager.loadBot()
  
  // 6. Attach Global UI handlers
  clickHandler.setSyncManager(syncManager)
  const keyboardHandler = new KeyboardHandler(store, history, syncManager, clickHandler)
  clickHandler.setupGlobalHandlers()
  keyboardHandler.attach()
  toolbarHandler.attach()
  clickHandler.onNodeSelected = () => toolbarHandler.updateButtons()
  clickHandler.onNodeDeselected = () => toolbarHandler.updateButtons()
  const unsubscribeToolbarSelection = store.subscribe((event) => {
    if (event === EVENTS.SELECTION_CHANGE) {
      toolbarHandler.updateButtons()
    }
  })
  const deleteButtonContainer = svgContainer.parentElement
  connectionHandler.setupDeleteHandler(deleteButtonContainer)

  // 7. Initialize Undo/Redo UI Callbacks
  history.setUpdateUICallback(() => {
    updateUndoRedoUI(history)
  })
  
  updateUndoRedoUI(history)
  requestAnimationFrame(() => {
    canvasViewport.fitToGraph()
  })
  
  // 8. Return public API
  return {
    store,
    history,
    syncManager,
    api,
    nodeRenderer,
    connectionRenderer,
    canvasViewport,
    dragHandler,
    connectionHandler,
    clickHandler,
    keyboardHandler,
    toolbarHandler,
    
    // Convenience methods
    createNode: (type, position, data) => syncManager.createNode(type, position, data),
    deleteNode: (clientId) => syncManager.deleteNode(clientId),
    createConnection: (sourceId, targetId) => syncManager.createConnection(sourceId, targetId),
    deleteConnection: (clientId) => syncManager.deleteConnection(clientId),
    updateNodeData: (clientId, data) => syncManager.updateNodeData(clientId, data),
    
    // Undo/redo - async because they sync with server
    undo: async () => {
      await syncManager.undo()
      updateUndoRedoUI(history)
    },
    redo: async () => {
      await syncManager.redo()
      updateUndoRedoUI(history)
    },
    canUndo: () => history.canUndo() && !syncManager.isUndoRedoPending,
    canRedo: () => history.canRedo() && !syncManager.isUndoRedoPending,
    
    // Selection
    getSelectedNode: () => clickHandler.getSelectedNodeId(),
    getEditingNode: () => clickHandler.getEditingNodeId(),
    
    // Cleanup
    destroy: () => {
      nodeRenderer.destroy()
      connectionRenderer.destroy()
      canvasViewport.destroy()
      dragHandler.destroy()
      connectionHandler.destroy()
      clickHandler.destroy()
      keyboardHandler.destroy()
      unsubscribeToolbarSelection()
      store.destroy()
    }
  }
}

function updateUndoRedoUI(history) {
  const undoBtn = document.querySelector('.btn-undo')
  const redoBtn = document.querySelector('.btn-redo')
  const countDisplay = document.querySelector('.undo-count')
  
  if (undoBtn)      { undoBtn.disabled = !history.canUndo() }
  if (redoBtn)      { redoBtn.disabled = !history.canRedo() }
  if (countDisplay) { countDisplay.textContent = history.getHistoryDisplay() }
}
