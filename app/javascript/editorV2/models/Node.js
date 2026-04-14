import generateUUID from '../utils/uuid.js'

class Node {
  constructor({ clientId, serverId = null, type, position, data = {} }) {
    this.clientId = clientId || generateUUID()
    
    // serverId may be null for new nodes until synced
    this.serverId = serverId
    
    // Validate required fields
    if (!type) { throw new Error('Node type is required') }
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new Error('Valid position { x, y } is required')
    }
    
    this.type = type
    this.position = { x: position.x, y: position.y }
    this.data = data && typeof data === 'object' ? { ...data } : {}
    
    // Freeze to enforce immutability
    Object.freeze(this)
    Object.freeze(this.position)
    Object.freeze(this.data)
  }
  
  update(updates) {
    return new Node({
      clientId: this.clientId,
      serverId: updates.serverId !== undefined ? updates.serverId : this.serverId,
      type: updates.type !== undefined ? updates.type : this.type,
      position: updates.position !== undefined ? updates.position : this.position,
      data: updates.data !== undefined ? updates.data : this.data
    })
  }
  
  updatePosition(x, y) {
    return new Node({
      clientId: this.clientId,
      serverId: this.serverId,
      type: this.type,
      position: { x, y },
      data: this.data
    })
  }
  
  updateData(newData) {
    return new Node({
      clientId: this.clientId,
      serverId: this.serverId,
      type: this.type,
      position: this.position,
      data: { ...this.data, ...newData }
    })
  }
  
  toJSON() {
    return {
      clientId: this.clientId,
      serverId: this.serverId,
      type: this.type,
      position: { x: this.position.x, y: this.position.y },
      data: { ...this.data }
    }
  }
  
  static fromJSON(json) {
    return new Node({
      clientId: json.clientId,
      serverId: json.serverId,
      type: json.type,
      position: json.position,
      data: json.data
    })
  }
  
  static fromServer(serverNode, clientId) {
    return new Node({
      clientId: clientId,
      serverId: serverNode.id,
      type: serverNode.node_type,
      position: { x: serverNode.position_x, y: serverNode.position_y },
      data: serverNode.data || {}
    })
  }
}

export default Node
