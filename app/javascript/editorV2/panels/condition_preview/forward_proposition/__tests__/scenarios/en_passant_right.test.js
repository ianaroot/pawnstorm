import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildAttempt } from 'editorV2/panels/condition_preview/forward_proposition/build_engine'
import { enPassantRightScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/en_passant_right'

const TRIVIAL_PAYLOAD = {
  version: 2, kind: 'census',
  subject: 'allied', subjectFilter: 'pawn',
  operator: 'count', comparator: 'greater_than_or_equal_to',
  target: 'exact_number', targetTotal: 0
}

function seededRandom(seed = 1) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

describe('enPassantRightScenario.buildCtxDelta (white)', () => {
  const delta = enPassantRightScenario.buildCtxDelta({ movingTeam: Board.WHITE })

  it('narrows moved_piece region to white EP target rank (rank 6, positions 40-47) excluding file 0', () => {
    expect(delta.singulars.moved_piece.region.squares).toEqual(new Set([41, 42, 43, 44, 45, 46, 47]))
  })

  it('aliases captured_piece and enemy_moved_piece', () => {
    expect(delta.singulars.captured_piece).toBe(delta.singulars.enemy_moved_piece)
  })
})

describe('enPassantRightScenario — end-to-end via buildAttempt (white)', () => {
  it('produces a valid en-passant-right example', () => {
    const random = seededRandom(2)
    let result = null
    for (let i = 0; i < 100; i += 1) {
      const attempt = buildAttempt(buildCombinedPlan([TRIVIAL_PAYLOAD]), random, enPassantRightScenario)
      if (attempt) { result = attempt; break }
    }
    expect(result).not.toBeNull()
    expect(result.moveObject.illegal).toBeFalsy()

    const startPos = result.moveObject.startPosition
    const endPos = result.moveObject.endPosition
    expect(Math.floor(endPos / 8)).toBe(5)
    expect(endPos - startPos).toBe(9) // capture-right: pawn moves file +1, rank +1
    expect(result.priorBoard.teamAt(startPos)).toBe(Board.WHITE)
    expect(result.priorBoard.pieceTypeAt(startPos)).toBe(Board.PAWN)
    expect(result.priorBoard.teamAt(endPos - 8)).toBe(Board.BLACK)
    expect(result.priorBoard.pieceTypeAt(endPos - 8)).toBe(Board.PAWN)
    expect(result.moveObject.captureNotation).toBe('x')
  })
})
