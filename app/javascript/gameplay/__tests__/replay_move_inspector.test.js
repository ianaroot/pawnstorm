import { describe, expect, it } from 'vitest'

import ReplayMoveInspector from 'gameplay/replay_move_inspector'

describe('ReplayMoveInspector', () => {
  it('returns top-score ties and traces only the selected move', () => {
    const moveA = { startPosition: 1, endPosition: 9 }
    const moveB = { startPosition: 2, endPosition: 10 }
    const moveC = { startPosition: 2, endPosition: 18, promotionPiece: 'Q' }
    const botRunner = {
      scoreLegalMoves: () => ([
        { moveObject: moveA, score: 7 },
        { moveObject: moveB, score: 9 },
        { moveObject: moveC, score: 9 }
      ]),
      scoreMove: ({ moveObject, withTrace }) => ({
        score: moveObject === moveB ? 9 : 7,
        halted: false,
        trace: withTrace ? [{ nodeId: 'selected', nodeType: 'action' }] : null
      })
    }
    const notationResolver = {
      resolve: () => moveC
    }
    const inspector = new ReplayMoveInspector({
      compiledProgram: {},
      botRunner,
      notationResolver
    })

    const result = inspector.inspectPosition({
      board: {},
      actualMoveNotation: 'some-notation',
      selectedMoveKey: ReplayMoveInspector.moveKey(moveB)
    })

    expect(result.topScore).toBe(9)
    expect(result.tiedTopMoveKeys).toEqual([
      ReplayMoveInspector.moveKey(moveB),
      ReplayMoveInspector.moveKey(moveC)
    ])
    expect(result.actualMoveKey).toBe(ReplayMoveInspector.moveKey(moveC))
    expect(result.selectedMoveKey).toBe(ReplayMoveInspector.moveKey(moveB))
    expect(result.selectedMove.moveObject).toBe(moveB)
    expect(result.selectedTrace).toEqual({
      score: 9,
      halted: false,
      trace: [{ nodeId: 'selected', nodeType: 'action' }]
    })
    expect(result.actualMoveWasTopScored).toBe(true)
  })

  it('can narrow visible moves to a selected starting square without changing global ties', () => {
    const moveA = { startPosition: 1, endPosition: 9 }
    const moveB = { startPosition: 1, endPosition: 17 }
    const moveC = { startPosition: 2, endPosition: 10 }
    const inspector = new ReplayMoveInspector({
      compiledProgram: {},
      botRunner: {
        scoreLegalMoves: () => ([
          { moveObject: moveA, score: 4 },
          { moveObject: moveB, score: 6 },
          { moveObject: moveC, score: 6 }
        ]),
        scoreMove: () => ({ score: 6, halted: false, trace: [] })
      },
      notationResolver: { resolve: () => { throw new Error('unused') } }
    })

    const result = inspector.inspectPosition({
      board: {},
      restrictToStartPosition: 1
    })

    expect(result.visibleMoves.map(result => result.moveObject)).toEqual([moveA, moveB])
    expect(result.tiedTopMoveKeys).toEqual([
      ReplayMoveInspector.moveKey(moveB),
      ReplayMoveInspector.moveKey(moveC)
    ])
  })
})
