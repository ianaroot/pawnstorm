// rendering/connectionGeometry.js
// Shared graph-space geometry helpers for connection anchors.

import { NODE_DIMENSIONS, CONNECTOR_SIZE } from '../constants.js'

const DEFAULT_INPUT_ANCHOR = { x: 0.5, y: 0 }
const DEFAULT_OUTPUT_ANCHOR = { x: 0.5, y: 1 }
const CONNECTOR_RADIUS = CONNECTOR_SIZE / 2

const NODE_CONNECTION_ANCHORS = {
  root: {
    output: { x: 0.5, y: 1 }
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

export function getConnectionAnchorCenterOffset(nodeType, connectorType) {
  const offset = getConnectionAnchorOffset(nodeType, connectorType)

  if (connectorType === 'input') {
    return {
      x: offset.x,
      y: offset.y - CONNECTOR_RADIUS
    }
  }

  if (connectorType === 'output') {
    return {
      x: offset.x,
      y: offset.y + CONNECTOR_RADIUS
    }
  }

  return offset
}

export function getNodeConnectionPoint(node, connectorType, options = {}) {
  const offset = getConnectionAnchorCenterOffset(node.type, connectorType)
  const { renderedOutputBottomOffset } = options

  if (connectorType === 'output' && renderedOutputBottomOffset !== undefined) {
    return {
      x: node.position.x + offset.x,
      y: node.position.y + renderedOutputBottomOffset + CONNECTOR_RADIUS
    }
  }

  return {
    x: node.position.x + offset.x,
    y: node.position.y + offset.y
  }
}

export function getConnectionPoints(sourceNode, targetNode, options = {}) {
  const start = getNodeConnectionPoint(sourceNode, 'output', {
    renderedOutputBottomOffset: options.sourceOutputBottomOffset
  })
  const end = getNodeConnectionPoint(targetNode, 'input')

  return {
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y
  }
}

export { NODE_CONNECTION_ANCHORS }
