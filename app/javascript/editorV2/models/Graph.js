import Node from 'editorV2/models/Node'
import Connection from 'editorV2/models/Connection'
import generateUUID from 'editorV2/utils/uuid'

class Graph {
  
  constructor(nodes = [], connections = []) {
    // Store as Maps for O(1) lookup
    this.nodes = new Map()
    this.connections = new Map()
    
    // Populate from arrays
    nodes.forEach(node => {
      if (!(node instanceof Node)) {
        throw new Error('All nodes must be Node instances')
      }
      this.nodes.set(node.clientId, node)
    })
    
    connections.forEach(conn => {
      if (!(conn instanceof Connection)) {
        throw new Error('All connections must be Connection instances')
      }
      this.connections.set(conn.clientId, conn)
    })
    
    // Freeze to prevent direct mutation
    Object.freeze(this.nodes)
    Object.freeze(this.connections)
  }
  
  // ===== Node Operations =====
  getNode(clientId) {
    return this.nodes.get(clientId)
  }
  
  hasNode(clientId) {
    return this.nodes.has(clientId)
  }
  
  getNodes() {
    return Array.from(this.nodes.values())
  }
  
  getNodesByType(type) {
    return this.getNodes().filter(node => node.type === type)
  }
  
  addNode(node) {
    if (this.nodes.has(node.clientId)) {
      console.warn(`Node with clientId ${node.clientId} already exists, replacing`)
    }
    
    const newNodes = new Map(this.nodes)
    newNodes.set(node.clientId, node)
    
    return new Graph(
      Array.from(newNodes.values()),
      Array.from(this.connections.values())
    )
  }
  
  updateNode(clientId, updates) {
    const existingNode = this.nodes.get(clientId)
    if (!existingNode) {
      console.warn(`Node ${clientId} not found, cannot update`)
      return this
    }
    
    const updatedNode = existingNode.update(updates)
    const newNodes = new Map(this.nodes)
    newNodes.set(clientId, updatedNode)
    
    return new Graph(
      Array.from(newNodes.values()),
      Array.from(this.connections.values())
    )
  }
  
  removeNode(clientId) {
    if (!this.nodes.has(clientId)) {
      console.warn(`Node ${clientId} not found, cannot remove`)
      return this
    }
    
    // Remove node
    const newNodes = new Map(this.nodes)
    newNodes.delete(clientId)
    
    // Remove connections involving this node
    const newConnections = new Map()
    this.connections.forEach((conn, connClientId) => {
      if (!conn.involvesNode(clientId)) {
        newConnections.set(connClientId, conn)
      }
    })
    
    return new Graph(
      Array.from(newNodes.values()),
      Array.from(newConnections.values())
    )
  }
  
  // ===== Connection Operations =====
  getConnection(clientId) {
    return this.connections.get(clientId)
  }
  
  hasConnection(clientId) {
    return this.connections.has(clientId)
  }
  
  getConnections() {
    return Array.from(this.connections.values())
  }
  
  findConnection(sourceClientId, targetClientId) {
    for (const conn of this.connections.values()) {
      if (conn.sourceId === sourceClientId && conn.targetId === targetClientId) {
        return conn
      }
    }
    return undefined
  }
  
  getConnectionsFor(clientId) {
    const outgoing = []
    const incoming = []
    
    this.connections.forEach(conn => {
      if (conn.sourceId === clientId) outgoing.push(conn)
      if (conn.targetId === clientId) incoming.push(conn)
    })
    
    return { outgoing, incoming }
  }
  
  getOutgoingConnections(clientId) {
    const result = []
    this.connections.forEach(conn => {
      if (conn.sourceId === clientId) result.push(conn)
    })
    return result
  }
  
  getIncomingConnections(clientId) {
    const result = []
    this.connections.forEach(conn => {
      if (conn.targetId === clientId) result.push(conn)
    })
    return result
  }
  
  getDescendantIds(clientId) {
    const descendants = new Set()
    const queue = [clientId]
    const visited = new Set()
    
    while (queue.length > 0) {
      const currentId = queue.shift()
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      // Find all children (targets of outgoing connections)
      this.connections.forEach(conn => {
        if (conn.sourceId === currentId && conn.targetId !== clientId) {
          if (!visited.has(conn.targetId)) {
            descendants.add(conn.targetId)
            queue.push(conn.targetId)
          }
        }
      })
    }
    
    return descendants
  }
  
  addConnection(connection) {
    // Validate that both source and target nodes exist
    if (!this.nodes.has(connection.sourceId)) {
      console.warn(`Source node ${connection.sourceId} does not exist`)
      return this
    }
    if (!this.nodes.has(connection.targetId)) {
      console.warn(`Target node ${connection.targetId} does not exist`)
      return this
    }
    
    // Check for duplicate connection
    const existing = this.findConnection(connection.sourceId, connection.targetId)
    if (existing) {
      console.warn(`Connection ${connection.sourceId} -> ${connection.targetId} already exists`)
      return this
    }
    
    const newConnections = new Map(this.connections)
    newConnections.set(connection.clientId, connection)
    
    return new Graph(
      Array.from(this.nodes.values()),
      Array.from(newConnections.values())
    )
  }
  
  updateConnection(clientId, updates) {
    const existingConn = this.connections.get(clientId)
    if (!existingConn) {
      console.warn(`Connection ${clientId} not found, cannot update`)
      return this
    }
    
    const updatedConn = existingConn.update(updates)
    const newConnections = new Map(this.connections)
    newConnections.set(clientId, updatedConn)
    
    return new Graph(
      Array.from(this.nodes.values()),
      Array.from(newConnections.values())
    )
  }
  
  removeConnection(clientId) {
    if (!this.connections.has(clientId)) {
      console.warn(`Connection ${clientId} not found, cannot remove`)
      return this
    }
    
    const newConnections = new Map(this.connections)
    newConnections.delete(clientId)
    
    return new Graph(
      Array.from(this.nodes.values()),
      Array.from(newConnections.values())
    )
  }
  
  // ===== Serialization =====
  toJSON() {
    return {
      nodes: this.getNodes().map(n => n.toJSON()),
      connections: this.getConnections().map(c => c.toJSON())
    }
  }
  
  static fromJSON(json) {
    const nodes = json.nodes.map(n => Node.fromJSON(n))
    const connections = json.connections.map(c => Connection.fromJSON(c))
    return new Graph(nodes, connections)
  }
  
  // ===== Utility Methods =====
  getSize() {
    return {
      nodes: this.nodes.size,
      connections: this.connections.size
    }
  }
  
  isEmpty() {
    return this.nodes.size === 0 && this.connections.size === 0
  }
  
  clone() {
    return Graph.fromJSON(this.toJSON())
  }
}

export default Graph
