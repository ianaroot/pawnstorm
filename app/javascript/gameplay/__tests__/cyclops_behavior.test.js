import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import Layout from 'gameplay/layout'
import NotationResolver from 'gameplay/notation_resolver'
import ReplayMoveInspector from 'gameplay/replay_move_inspector'

import behaviorFixture from 'gameplay/__fixtures__/cyclops_behavior_fixture.json'

const notationResolver = new NotationResolver()

function buildBoardFromNotationPrefix(notationPrefix) {
  const board = new Board({
    layOut: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: [],
    previousLayouts: JSON.stringify([])
  })

  notationPrefix.forEach(notation => {
    const moveObject = notationResolver.resolve({ board, notation })
    board._officiallyMovePiece(moveObject)
  })

  return board
}

function moveLabel(moveObject) {
  const start = Board.gridCalculator(moveObject.startPosition)
  const finish = Board.gridCalculator(moveObject.endPosition)
  const promotion = moveObject.promotionPiece ? `=${moveObject.promotionPiece}` : ''
  return `${start}-${finish}${promotion}`
}

function sorted(array) {
  return [...array].sort()
}

describe('Cyclops behavior preservation', () => {
  const inspector = new ReplayMoveInspector({ compiledProgram: behaviorFixture.compiledProgram })

  behaviorFixture.positions.forEach(positionFixture => {
    it(`preserves top moves for match ${positionFixture.matchId} ply ${positionFixture.plyNumber}`, () => {
      const board = buildBoardFromNotationPrefix(positionFixture.notationPrefix)

      const result = inspector.inspectPosition({
        board,
        actualMoveNotation: positionFixture.actualMoveNotation
      })

      const actualTopMoves = result.scoredMoves
        .filter(move => move.score === result.topScore)
        .map(move => moveLabel(move.moveObject))

      expect(sorted(actualTopMoves)).toEqual(sorted(positionFixture.topMoves))
      expect(result.tiedTopMoveKeys.length).toBe(positionFixture.tiedTopCount)

      if (positionFixture.tiedTopCount === 1) {
        expect(result.selectedMove).not.toBeNull()
        expect(moveLabel(result.selectedMove.moveObject)).toBe(positionFixture.selectedMove)
      }
    })
  })
})
