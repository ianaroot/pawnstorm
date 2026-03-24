import { describe, it, expect } from 'vitest'
import Node from '../models/Node.js'
import {
  getNodeConnectionPoint,
  getConnectionPoints
} from '../rendering/connectionGeometry.js'

describe('connectionGeometry', () => {
  describe('getNodeConnectionPoint', () => {
    it('uses static top-center geometry for input anchors', () => {
      const node = new Node({
        clientId: 'n1',
        type: 'condition',
        position: { x: 100, y: 200 }
      })

      expect(getNodeConnectionPoint(node, 'input')).toEqual({
        x: 150,
        y: 193
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
        x: 150,
        y: 299
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
        type: 'action',
        position: { x: 300, y: 400 }
      })

      expect(
        getConnectionPoints(sourceNode, targetNode, { sourceOutputBottomOffset: 92 })
      ).toEqual({
        startX: 150,
        startY: 299,
        endX: 350,
        endY: 393
      })
    })
  })
})
