import { MAX_HISTORY } from '../constants.js'

class History {
  constructor(store, maxHistory = MAX_HISTORY) {
    this.store = store
    
    // Snapshot stack
    this.snapshots = []
    this.currentIndex = -1
    
    // Configuration
    this.maxHistory = maxHistory
    
    // Batch tracking to prevent orphaned batch state
    this.batchDepth = 0
    this.batchDescription = null
    
    // Flag to prevent history operations during restore
    this.isRestoring = false 
    this.updateUICallback = null
  }
  
  // ===== Core Operations =====
  
  push(description, operation = null) {
    if (this.isRestoring) { return }
    if (this.batchDepth > 0) { return }
    // Truncate any redo snapshots (we're creating a new branch)
    if (this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1)
    }
    const snapshot = {
      description,
      timestamp: Date.now(),
      state: this.store.getState(),
      operation
    }
    this.snapshots.push(snapshot)
    if (this.snapshots.length > this.maxHistory) {
      this.snapshots.shift()
    } else {
      this.currentIndex++
    }
    this.updateUI()
  }
  
  /**
   * Undo the last operation (local only - SyncManager handles server sync)
   * Restores state from previous snapshot
   */
  undo() {
    if (!this.canUndo()) { return }     
    this.isRestoring = true     
    try {
      this.currentIndex--
      const snapshot = this.snapshots[this.currentIndex]
      this.store.restoreState(snapshot.state)
      this.updateUI()
    } finally {
      this.isRestoring = false
    }
  }
  
  /**
   * Redo a previously undone operation (local only - SyncManager handles server sync)
   */
  redo() {
    if (!this.canRedo()) { return }     
    this.isRestoring = true 
    try {
      this.currentIndex++
      const snapshot = this.snapshots[this.currentIndex]
      this.store.restoreState(snapshot.state)
      this.updateUI()
    } finally {
      this.isRestoring = false
    }
  }
  
  undoLocal() {
    if (!this.canUndo()) { return }
    this.isRestoring = true
    try {
      this.currentIndex--
      const snapshot = this.snapshots[this.currentIndex]
      this.store.restoreState(snapshot.state)
      this.updateUI()
    } finally {
      this.isRestoring = false
    }
  }
  
  redoLocal() {
    if (!this.canRedo()) { return }
    this.isRestoring = true
    try {
      this.currentIndex++
      const snapshot = this.snapshots[this.currentIndex]
      this.store.restoreState(snapshot.state)
      this.updateUI()
    } finally {
      this.isRestoring = false
    }
  }
  
  // ===== Query Methods =====
  canUndo() {
    return this.currentIndex > 0
  }
  
  canRedo() {
    return this.currentIndex < this.snapshots.length - 1
  }
  
  getCurrentIndex() {
    return this.currentIndex
  }
  
  getTotalSnapshots() {
    return this.snapshots.length
  }
  
  getHistoryDisplay() {
    if (this.snapshots.length === 0) return `(0/${this.maxHistory})`
    return `(${this.currentIndex + 1}/${this.maxHistory})`
  }
  
  getCurrentDescription() {
    if (this.currentIndex < 0) return null
    return this.snapshots[this.currentIndex]?.description || null
  }
  
  getCurrentSnapshot() {
    if (this.currentIndex < 0) return null
    return this.snapshots[this.currentIndex]
  }
  
  getNextSnapshot() {
    if (this.currentIndex < 0) return null
    if (this.currentIndex >= this.snapshots.length - 1) return null
    return this.snapshots[this.currentIndex + 1]
  }
  
  // ===== Batch Operations =====
  startBatch() {
    if (this.batchDepth === 0) { this.batchDescription = null }
    this.batchDepth++
  }
  
  endBatch(description) {
    this.batchDepth--
    if (this.batchDepth < 0) {
      console.error('endBatch() called without matching startBatch()')
      this.batchDepth = 0
      return
    }
    if (this.batchDepth === 0 && description) {
      this.push(description)
    }
  }
  
  batch(description, fn) {
    this.startBatch()
    try {
      fn()
    } finally {
      this.endBatch(description)
    }
  }

  resetBatch() {
    this.batchDepth = 0
    this.batchDescription = null
  }
  
  // ===== Utility Methods =====
  clear() {
    this.snapshots = []
    this.currentIndex = -1
    this.batchDepth = 0
    this.batchDescription = null
    this.updateUI()
  }
  
  setUpdateUICallback(callback) {
    this.updateUICallback = callback
  }
  
  updateUI() {
    if (this.updateUICallback) {
      try {
        this.updateUICallback()
      } catch (error) {
        console.error('Error in history UI callback:', error)
      }
    }
  }
  
  // ===== Debugging =====
  getDebugInfo() {
    return {
      currentIndex: this.currentIndex,
      totalSnapshots: this.snapshots.length,
      maxHistory: this.maxHistory,
      batchDepth: this.batchDepth,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      descriptions: this.snapshots.map(s => s.description)
    }
  }
}

export default History