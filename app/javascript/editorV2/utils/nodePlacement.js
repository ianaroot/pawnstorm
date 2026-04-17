import { NODE_DIMENSIONS } from 'editorV2/constants'

const NODE_PLACEMENT_PADDING = 40
const NODE_PLACEMENT_STEP = 36
const NODE_PLACEMENT_RING_STEPS = 10
const NODE_PLACEMENT_MAX_RINGS = 12

function getNodeDimensions(type) {
  return NODE_DIMENSIONS[type] || NODE_DIMENSIONS.default
}

function isPositionClear(store, candidate, candidateDims) {
  const candidateBounds = {
    left: candidate.x,
    right: candidate.x + candidateDims.width,
    top: candidate.y,
    bottom: candidate.y + candidateDims.height
  }
  return store.getNodes().every(node => {
    const dims = getNodeDimensions(node.type)
    const nodeBounds = {
      left: node.position.x - NODE_PLACEMENT_PADDING,
      right: node.position.x + dims.width + NODE_PLACEMENT_PADDING,
      top: node.position.y - NODE_PLACEMENT_PADDING,
      bottom: node.position.y + dims.height + NODE_PLACEMENT_PADDING
    }
    return (
      candidateBounds.right <= nodeBounds.left ||
      candidateBounds.left >= nodeBounds.right ||
      candidateBounds.bottom <= nodeBounds.top ||
      candidateBounds.top >= nodeBounds.bottom
    )
  })
}

export function findAnchoredNodePlacement(store, type, origin) {
  const dims = getNodeDimensions(type)
  const resolvedOrigin = origin || { x: 200, y: 200 }
  const anchor = {
    x: Math.max(0, Math.round(resolvedOrigin.x - (dims.width / 2))),
    y: Math.max(0, Math.round(resolvedOrigin.y - (dims.height / 2)))
  }
  if (isPositionClear(store, anchor, dims)) { return anchor }
  for (let ring = 1; ring <= NODE_PLACEMENT_MAX_RINGS; ring += 1) {
    const radius = ring * NODE_PLACEMENT_STEP
    for (let step = 0; step < NODE_PLACEMENT_RING_STEPS; step += 1) {
      const angle = (Math.PI * 2 * step) / NODE_PLACEMENT_RING_STEPS
      const candidate = {
        x: Math.max(0, Math.round(anchor.x + (Math.cos(angle) * radius))),
        y: Math.max(0, Math.round(anchor.y + (Math.sin(angle) * radius)))
      }
      if (isPositionClear(store, candidate, dims)) { return candidate }
    }
  }
  return anchor
}
