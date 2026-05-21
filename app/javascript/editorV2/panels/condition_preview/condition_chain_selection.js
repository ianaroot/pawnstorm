function buildConnectionMaps(selectedNodeIds, internalConnections) {
  const incoming = new Map()
  const outgoing = new Map()

  selectedNodeIds.forEach(nodeId => {
    incoming.set(nodeId, [])
    outgoing.set(nodeId, [])
  })

  internalConnections.forEach(connection => {
    incoming.get(connection.targetId)?.push(connection.sourceId)
    outgoing.get(connection.sourceId)?.push(connection.targetId)
  })

  return { incoming, outgoing }
}

function orderedNodeIdsFromMaps(selectedNodeIds, incoming, outgoing) {
  if (selectedNodeIds.length === 1) { return [selectedNodeIds[0]] }

  const starts = selectedNodeIds.filter(nodeId => (incoming.get(nodeId) || []).length === 0)
  const ends = selectedNodeIds.filter(nodeId => (outgoing.get(nodeId) || []).length === 0)

  if (starts.length !== 1 || ends.length !== 1) { return null }

  const ordered = []
  const visited = new Set()
  let currentId = starts[0]

  while (currentId) {
    if (visited.has(currentId)) { return null }
    visited.add(currentId)
    ordered.push(currentId)
    const nextIds = outgoing.get(currentId) || []
    currentId = nextIds[0] || null
  }

  return ordered.length === selectedNodeIds.length ? ordered : null
}

export function buildSelectedConditionChain({ selectedNodeIds, getNode, internalConnections }) {
  if (!selectedNodeIds.length) {
    return {
      status: 'unsupported',
      reason: 'Select a single linear chain of condition nodes to preview.'
    }
  }

  const nodes = selectedNodeIds.map(getNode)
  if (nodes.some(node => !node || node.type !== 'condition')) {
    return {
      status: 'unsupported',
      reason: 'Select only condition nodes to preview.'
    }
  }

  const { incoming, outgoing } = buildConnectionMaps(selectedNodeIds, internalConnections)
  const hasBranching = selectedNodeIds.some(nodeId => {
    return (incoming.get(nodeId) || []).length > 1 || (outgoing.get(nodeId) || []).length > 1
  })

  if (hasBranching) {
    return {
      status: 'unsupported',
      reason: "OR branches aren't supported in condition chain previews yet."
    }
  }

  if (internalConnections.length !== selectedNodeIds.length - 1) {
    return {
      status: 'unsupported',
      reason: 'Select a single linear chain of condition nodes to preview.'
    }
  }

  const orderedNodeIds = orderedNodeIdsFromMaps(selectedNodeIds, incoming, outgoing)
  if (!orderedNodeIds) {
    return {
      status: 'unsupported',
      reason: 'Select a single linear chain of condition nodes to preview.'
    }
  }

  return {
    status: 'ready',
    orderedNodeIds,
    payloads: orderedNodeIds.map(nodeId => getNode(nodeId).data)
  }
}

export default buildSelectedConditionChain
