// rendering/connectionGeometry.js
// Shared graph-space geometry helpers for connection anchors.

import { NODE_DIMENSIONS } from '../constants.js'

const DEFAULT_INPUT_ANCHOR = { x: 0.5, y: 0 }
const DEFAULT_OUTPUT_ANCHOR = { x: 0.5, y: 1 }

// Preserve current root behavior for now. A later visual pass will move this.
const NODE_CONNECTION_ANCHORS = {
  root: {
    output: { x: 1, y: 0.5 }
  }
}

export function getNodeDimensionsForConnection(nodeType) {
  return NODE_DIMENSIONS[nodeType] || NODE_DIMENSIONS.default
}

export function getNodeConnectionAnchors(nodeType) {
  return {
    input: DEFAULT_INPUT_ANCHOR,
    output: DEFAULT_OUTPUT_ANCHOR,
    ...(NODE_CONNECTION_ANCHORS[nodeType] || {})
  }
}

export function getConnectionAnchorOffset(nodeType, connectorType) {
  const dimensions = getNodeDimensionsForConnection(nodeType)
  const anchors = getNodeConnectionAnchors(nodeType)
  const anchor = anchors[connectorType]

  if (!anchor) {
    return { x: 0, y: 0 }
  }

  return {
    x: dimensions.width * anchor.x,
    y: dimensions.height * anchor.y
  }
}

export function getNodeConnectionPoint(node, connectorType) {
  const offset = getConnectionAnchorOffset(node.type, connectorType)

  return {
    x: node.position.x + offset.x,
    y: node.position.y + offset.y
  }
}

export function getConnectionPoints(sourceNode, targetNode) {
  const start = getNodeConnectionPoint(sourceNode, 'output')
  const end = getNodeConnectionPoint(targetNode, 'input')

  return {
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y
  }
}

export { NODE_CONNECTION_ANCHORS }
