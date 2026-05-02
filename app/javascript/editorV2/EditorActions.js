import { findAnchoredNodePlacement } from 'editorV2/utils/nodePlacement'
import generateUUID from 'editorV2/utils/uuid'
import Node from 'editorV2/models/Node'
import Connection from 'editorV2/models/Connection'

const CLIPBOARD_STORAGE_KEY = 'editorV2.nodeClipboard'
const CLIPBOARD_STORAGE_VERSION = 1
const PASTEABLE_NODE_TYPES = new Set(['condition', 'score', 'organizer'])

class EditorActions {
  constructor(store, history, syncManager) {
    this.store = store
    this.history = history
    this.syncManager = syncManager
    this.clipboard = this.loadClipboard()
  }

  async undo() {
    if (!this.canUndo()) return
    await this.syncManager.undo()
  }

  async redo() {
    if (!this.canRedo()) return
    await this.syncManager.redo()
  }

  canUndo() {
    return this.history.canUndo() && !this.syncManager.isUndoRedoPending
  }

  canRedo() {
    return this.history.canRedo() && !this.syncManager.isUndoRedoPending
  }

  async deleteSelected() {
    await this.clickHandler?.deleteSelectedNodes()
  }

  canDelete() {
    return (this.clickHandler?.getDeletableSelectedNodeIds()?.length ?? 0) > 0
  }

  togglePreview() {
    this.clickHandler?.togglePreview()
  }

  async save() {
    await this.clickHandler?.handleSave()
  }

  closeEditor() {
    this.clickHandler?.closeEditor()
  }

  navigatePreview(delta) {
    if (!this.boardStatePreview || this.boardStatePreview.mode === 'idle' || this.boardStatePreview.examples.length <= 1) { return false }
    this.boardStatePreview._navigate(delta)
    return true
  }

  copy() {
    return this.copySelectedNodes()
  }

  async paste() {
    return this.pasteCopiedNodes()
  }

  deepClone(value) {
    if (typeof structuredClone === 'function') { return structuredClone(value) }
    return JSON.parse(JSON.stringify(value))
  }

  storage() {
    try {
      return globalThis.localStorage
    } catch {
      return null
    }
  }

  loadClipboard() {
    const storage = this.storage()
    if (!storage) { return null }

    try {
      const rawPayload = storage.getItem(CLIPBOARD_STORAGE_KEY)
      if (!rawPayload) { return null }

      const payload = JSON.parse(rawPayload)
      if (payload?.version !== CLIPBOARD_STORAGE_VERSION || !this.isValidClipboard(payload.clipboard)) {
        this.clearStoredClipboard()
        return null
      }

      return payload.clipboard
    } catch {
      this.clearStoredClipboard()
      return null
    }
  }

  saveClipboard(clipboard) {
    const storage = this.storage()
    if (!storage || !this.isValidClipboard(clipboard)) { return }

    try {
      storage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify({
        version: CLIPBOARD_STORAGE_VERSION,
        clipboard
      }))
    } catch {
      // Copy/paste should keep working in memory if browser storage is unavailable.
    }
  }

  clearStoredClipboard() {
    const storage = this.storage()
    if (!storage) { return }

    try {
      storage.removeItem(CLIPBOARD_STORAGE_KEY)
    } catch {
      // Ignore storage cleanup failures; invalid payloads are already ignored in memory.
    }
  }

  isValidClipboard(clipboard) {
    if (!clipboard || !Array.isArray(clipboard.nodes) || !Array.isArray(clipboard.connections)) {
      return false
    }
    if (!this.isValidPosition(clipboard.anchorPosition)) { return false }

    return clipboard.nodes.every(node => (
      node &&
      PASTEABLE_NODE_TYPES.has(node.type) &&
      Number.isFinite(node.relativeX) &&
      Number.isFinite(node.relativeY)
    )) && clipboard.connections.every(connection => (
      connection &&
      Number.isInteger(connection.sourceIndex) &&
      Number.isInteger(connection.targetIndex) &&
      connection.sourceIndex >= 0 &&
      connection.targetIndex >= 0 &&
      connection.sourceIndex < clipboard.nodes.length &&
      connection.targetIndex < clipboard.nodes.length
    ))
  }

  isValidPosition(position) {
    return position && Number.isFinite(position.x) && Number.isFinite(position.y)
  }

  getCopyableSelectedNodes() {
    const selectedIds = this.store.getSelectedNodeIds()
    if (selectedIds.length === 0) { return [] }
    return selectedIds
      .map(clientId => this.store.getNode(clientId))
      .filter(node => node && node.type !== 'root')
  }

  copySelectedNodes() {
    const nodes = this.getCopyableSelectedNodes()
    if (nodes.length === 0) { return false }

    const anchorPosition = { x: nodes[0].position.x, y: nodes[0].position.y }
    const nodeIdToIndex = new Map()
    nodes.forEach((node, index) => { nodeIdToIndex.set(node.clientId, index) })

    const connections = this.store.getInternalConnections(nodes.map(n => n.clientId))
      .map(conn => ({
        sourceIndex: nodeIdToIndex.get(conn.sourceId),
        targetIndex: nodeIdToIndex.get(conn.targetId)
      }))

    this.clipboard = {
      nodes: nodes.map(node => ({
        type: node.type,
        data: this.deepClone(node.data),
        relativeX: node.position.x - anchorPosition.x,
        relativeY: node.position.y - anchorPosition.y
      })),
      connections,
      anchorPosition
    }
    this.saveClipboard(this.clipboard)
    return true
  }

  async pasteCopiedNodes() {
    if (!this.clipboard || !this.syncManager) { return null }
    if (this.clipboard.nodes.length === 0) { return null }

    const anchorType = this.clipboard.nodes[0].type
    const origin = this.store.getRecentPlacementAnchor() || this.clipboard.anchorPosition
    const anchorPosition = findAnchoredNodePlacement(this.store, anchorType, origin)

    const newClientIdMap = this.clipboard.nodes.map(() => generateUUID())

    const nodeModels = this.clipboard.nodes.map((nodeData, index) => new Node({
      clientId: newClientIdMap[index],
      type: nodeData.type,
      position: {
        x: anchorPosition.x + nodeData.relativeX,
        y: anchorPosition.y + nodeData.relativeY
      },
      data: this.deepClone(nodeData.data)
    }))

    const connectionModels = this.clipboard.connections.map(connData => new Connection({
      clientId: generateUUID(),
      sourceId: newClientIdMap[connData.sourceIndex],
      targetId: newClientIdMap[connData.targetIndex]
    }))

    const result = await this.syncManager.insertNodeSet(nodeModels, connectionModels, 'Paste nodes')
    if (result.clientIds.length > 0) {
      this.store.setSelectedNodeIds(result.clientIds)
    }
    return result
  }
}

export default EditorActions
