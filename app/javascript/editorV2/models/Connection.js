import generateUUID from '../utils/uuid.js'

class Connection {
  
  constructor({ clientId, serverId = null, sourceId, targetId }) {
    this.clientId = clientId || generateUUID()
    // serverId may be null for new connections until synced
    this.serverId = serverId
    
    // Validate required fields
    if (!sourceId) { throw new Error('sourceId is required') }
    if (!targetId) { throw new Error('targetId is required') }
    if (sourceId === targetId) { throw new Error('sourceId and targetId cannot be the same (no self-connections)') }
    
    this.sourceId = sourceId
    this.targetId = targetId
    
    // Freeze to enforce immutability
    Object.freeze(this)
  }
  
  update(updates) {
    return new Connection({
      clientId: this.clientId,
      serverId: updates.serverId !== undefined ? updates.serverId : this.serverId,
      sourceId: updates.sourceId !== undefined ? updates.sourceId : this.sourceId,
      targetId: updates.targetId !== undefined ? updates.targetId : this.targetId
    })
  }
  
  involvesNode(nodeId) {
    return this.sourceId === nodeId || this.targetId === nodeId
  }
  
  equals(other) {
    return other instanceof Connection && this.clientId === other.clientId
  }

  connectsSameNodes(other) {
    if (!(other instanceof Connection)) return false
    return this.sourceId === other.sourceId && this.targetId === other.targetId
  }
  
  getKey() {
    return `${this.sourceId}-${this.targetId}`
  }
  
  toJSON() {
    return {
      clientId: this.clientId,
      serverId: this.serverId,
      sourceId: this.sourceId,
      targetId: this.targetId
    }
  }
  
  static fromJSON(json) {
    return new Connection({
      clientId: json.clientId,
      serverId: json.serverId,
      sourceId: json.sourceId,
      targetId: json.targetId
    })
  }
  
  static fromServer(serverConnection, sourceClientId, targetClientId, clientId) {
    return new Connection({
      clientId: clientId,
      serverId: serverConnection.id,
      sourceId: sourceClientId,
      targetId: targetClientId
    })
  }
}

export default Connection