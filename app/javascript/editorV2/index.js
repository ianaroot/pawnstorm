import Store from 'editorV2/state/Store'
import History from 'editorV2/state/History'
import API from 'editorV2/api'
import SyncManager from 'editorV2/sync/SyncManager'
import NodeRenderer from 'editorV2/rendering/NodeRenderer'
import ConnectionRenderer from 'editorV2/rendering/ConnectionRenderer'
import CanvasViewport from 'editorV2/rendering/CanvasViewport'
import DragHandler from 'editorV2/handlers/DragHandler'
import ConnectionHandler from 'editorV2/handlers/ConnectionHandler'
import ClickHandler from 'editorV2/handlers/ClickHandler'
import KeyboardHandler from 'editorV2/handlers/KeyboardHandler'
import HoverPreviewHandler from 'editorV2/handlers/HoverPreviewHandler'
import { EVENTS, MAX_HISTORY } from 'editorV2/constants'
import { showError } from 'editorV2/utils/errors'
import ToolbarHandler from 'editorV2/handlers/ToolbarHandler'
import BoardStatePreview from 'editorV2/panels/BoardStatePreview'
import EditorActions from 'editorV2/EditorActions'

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
  connectionRenderer.attachHoverTracking()
  
  // 3. Initialize Handlers
  const dragHandler = new DragHandler(store, syncManager, canvasViewport)
  const connectionHandler = new ConnectionHandler(store, syncManager, connectionRenderer, canvasViewport)
  const clickHandler = new ClickHandler(store, history, editorPanel)
  const hoverPreviewHandler = new HoverPreviewHandler(canvasViewport)
  const toolbarHandler = new ToolbarHandler(store, history, syncManager, container, clickHandler, canvasViewport)
  function attachHandlersToNode(element, clientId) {
    dragHandler.attach(element, clientId)
    connectionHandler.attach(element, clientId)
    clickHandler.attach(element, clientId)
    hoverPreviewHandler.attachNode(element)
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
  const boardStatePreviewWrap = document.getElementById('board-state-preview-wrap')
  const boardStatePreview = boardStatePreviewWrap ? new BoardStatePreview(boardStatePreviewWrap) : null
  if (boardStatePreview) {
    clickHandler.setBoardStatePreview(boardStatePreview)
  }
  const editorActions = new EditorActions(store, history, syncManager)
  editorActions.clickHandler = clickHandler
  editorActions.boardStatePreview = boardStatePreview
  editorActions.viewport = canvasViewport
  const keyboardHandler = new KeyboardHandler()
  keyboardHandler.actions = editorActions
  toolbarHandler.actions = editorActions
  clickHandler.actions = editorActions
  if (boardStatePreview) { boardStatePreview.actions = editorActions }
  clickHandler.setupGlobalHandlers()
  keyboardHandler.attach()
  hoverPreviewHandler.attach()
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
    toolbarHandler.updateButtons()
  })

  toolbarHandler.updateButtons()
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
    hoverPreviewHandler,
    
    // Convenience methods
    createNode: (type, position, data) => syncManager.createNode(type, position, data),
    deleteNode: (clientId) => syncManager.deleteNodes([clientId]),
    createConnection: (sourceId, targetId) => syncManager.createConnection(sourceId, targetId),
    deleteConnection: (clientId) => syncManager.deleteConnection(clientId),
    updateNodeData: (clientId, data) => syncManager.updateNodeData(clientId, data),
    
    // Undo/redo - delegate to EditorActions so all callers share one code path
    undo: async () => {
      await editorActions.undo()
      toolbarHandler.updateButtons()
    },
    redo: async () => {
      await editorActions.redo()
      toolbarHandler.updateButtons()
    },
    canUndo: () => editorActions.canUndo(),
    canRedo: () => editorActions.canRedo(),
    
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
      hoverPreviewHandler.destroy()
      unsubscribeToolbarSelection()
      store.destroy()
    }
  }
}

