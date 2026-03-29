import { NODE_DIMENSIONS } from '../constants.js'

const TEMPLATE_PLACEMENT = Object.freeze({
  padding: 40,
  step: 44,
  ringSteps: 12,
  maxRings: 14
})

function organizerNodeFor(template) {
  return template.nodes.find(node => node.type === 'organizer')
}

function getVisibleBounds(viewport) {
  const rect = viewport.container.getBoundingClientRect()
  const topLeft = viewport.screenToGraphPoint(rect.left, rect.top)
  const bottomRight = viewport.screenToGraphPoint(rect.right, rect.bottom)

  return {
    minX: Math.min(topLeft.x, bottomRight.x),
    minY: Math.min(topLeft.y, bottomRight.y),
    maxX: Math.max(topLeft.x, bottomRight.x),
    maxY: Math.max(topLeft.y, bottomRight.y)
  }
}

function organizerBoundsAt(position) {
  const dims = NODE_DIMENSIONS.organizer || NODE_DIMENSIONS.default

  return {
    left: position.x,
    right: position.x + dims.width,
    top: position.y,
    bottom: position.y + dims.height
  }
}

function isWithinVisibleBounds(bounds, visibleBounds) {
  return (
    bounds.left >= visibleBounds.minX &&
    bounds.right <= visibleBounds.maxX &&
    bounds.top >= visibleBounds.minY &&
    bounds.bottom <= visibleBounds.maxY
  )
}

function isPositionClear(position, store) {
  const organizerBounds = organizerBoundsAt(position)

  return store.getNodes().every(node => {
    const dims = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS.default
    const nodeBounds = {
      left: node.position.x - TEMPLATE_PLACEMENT.padding,
      right: node.position.x + dims.width + TEMPLATE_PLACEMENT.padding,
      top: node.position.y - TEMPLATE_PLACEMENT.padding,
      bottom: node.position.y + dims.height + TEMPLATE_PLACEMENT.padding
    }

    return (
      organizerBounds.right <= nodeBounds.left ||
      organizerBounds.left >= nodeBounds.right ||
      organizerBounds.bottom <= nodeBounds.top ||
      organizerBounds.top >= nodeBounds.bottom
    )
  })
}

export function findTemplateAnchor(template, viewport, store) {
  const organizer = organizerNodeFor(template)
  if (!organizer) {
    throw new Error(`Template "${template.id}" is missing its organizer node`)
  }

  const center = viewport?.getVisibleCanvasCenter() || { x: 200, y: 200 }
  const organizerDims = NODE_DIMENSIONS.organizer || NODE_DIMENSIONS.default
  const visibleBounds = viewport ? getVisibleBounds(viewport) : null
  const centeredAnchor = {
    x: Math.max(0, Math.round(center.x - (organizerDims.width / 2))),
    y: Math.max(0, Math.round(center.y - (organizerDims.height / 2)))
  }

  if (!viewport) {
    return centeredAnchor
  }

  const fitsCentered =
    isWithinVisibleBounds(organizerBoundsAt(centeredAnchor), visibleBounds) &&
    isPositionClear(centeredAnchor, store)

  if (fitsCentered) {
    return centeredAnchor
  }

  for (let ring = 1; ring <= TEMPLATE_PLACEMENT.maxRings; ring += 1) {
    const radius = ring * TEMPLATE_PLACEMENT.step

    for (let step = 0; step < TEMPLATE_PLACEMENT.ringSteps; step += 1) {
      const angle = (Math.PI * 2 * step) / TEMPLATE_PLACEMENT.ringSteps
      const candidate = {
        x: Math.max(0, Math.round(centeredAnchor.x + (Math.cos(angle) * radius))),
        y: Math.max(0, Math.round(centeredAnchor.y + (Math.sin(angle) * radius)))
      }

      const candidateBounds = organizerBoundsAt(candidate)
      if (!isWithinVisibleBounds(candidateBounds, visibleBounds)) {
        continue
      }

      if (isPositionClear(candidate, store)) {
        return candidate
      }
    }
  }

  return centeredAnchor
}
