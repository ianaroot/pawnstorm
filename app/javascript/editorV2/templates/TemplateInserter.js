import generateUUID from '../utils/uuid.js'
import { normalizeNodeData } from '../utils/nodeDefaults.js'

export function buildTemplateInsertOperation(template, organizerAnchor) {
  const nodeIdMap = new Map()

  const nodes = template.nodes.map(node => {
    const clientId = generateUUID()
    nodeIdMap.set(node.key, clientId)

    return {
      clientId,
      templateKey: node.key,
      entity: {
        type: node.type,
        position: {
          x: organizerAnchor.x + node.position.x,
          y: organizerAnchor.y + node.position.y
        },
        data: normalizeNodeData(node.type, node.data)
      }
    }
  })

  const organizer = template.nodes.find(node => node.type === 'organizer')
  const organizerClientId = organizer ? nodeIdMap.get(organizer.key) : null

  const connections = template.connections.map(connection => ({
    clientId: generateUUID(),
    sourceId: nodeIdMap.get(connection.source),
    targetId: nodeIdMap.get(connection.target)
  }))

  return {
    type: 'insertTemplate',
    templateId: template.id,
    templateName: template.name,
    organizerClientId,
    nodes,
    connections
  }
}
