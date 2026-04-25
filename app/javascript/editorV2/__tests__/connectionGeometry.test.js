import { describe, it, expect } from 'vitest'
import Node from '../models/Node.js'
import { CONNECTOR_SIZE, NODE_DIMENSIONS } from '../constants.js'
import {
  getNodeConnectionPoint,
  getConnectionPoints
} from '../rendering/connectionGeometry.js'

describe('connectionGeometry', () => {
  const CONNECTOR_RADIUS = CONNECTOR_SIZE / 2

  describe('getNodeConnectionPoint', () => {
    it('uses static top-center geometry for input anchors', () => {
      const node = new Node({
        clientId: 'n1',
        type: 'condition',
        position: { x: 100, y: 200 }
      })

      expect(getNodeConnectionPoint(node, 'input')).toEqual({
        x: 100 + (NODE_DIMENSIONS.condition.width / 2),
        y: 200 - CONNECTOR_RADIUS
      })
    })

    it('uses rendered output bottom offset when provided', () => {
      const node = new Node({
        clientId: 'n1',
        type: 'condition',
        position: { x: 100, y: 200 }
      })

      expect(
        getNodeConnectionPoint(node, 'output', { renderedOutputBottomOffset: 92 })
      ).toEqual({
        x: 100 + (NODE_DIMENSIONS.condition.width / 2),
        y: 200 + 92 + CONNECTOR_RADIUS
      })
    })
  })

  describe('getConnectionPoints', () => {
    it('passes rendered output bottom offset through for the source node', () => {
      const sourceNode = new Node({
        clientId: 'source',
        type: 'condition',
        position: { x: 100, y: 200 }
      })
      const targetNode = new Node({
        clientId: 'target',
        type: 'score',
        position: { x: 300, y: 400 }
      })

      expect(
        getConnectionPoints(sourceNode, targetNode, { sourceOutputBottomOffset: 92 })
      ).toEqual({
        startX: 100 + (NODE_DIMENSIONS.condition.width / 2),
        startY: 200 + 92 + CONNECTOR_RADIUS,
        endX: 300 + (NODE_DIMENSIONS.score.width / 2),
        endY: 400 - CONNECTOR_RADIUS
      })
    })
  })
})
