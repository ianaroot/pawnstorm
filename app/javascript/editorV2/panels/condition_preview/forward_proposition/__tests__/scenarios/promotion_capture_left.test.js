import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildAttempt } from 'editorV2/panels/condition_preview/forward_proposition/build_engine'
import { promotionCaptureLeftScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/promotion_capture_left'

const PROMOTION_SPECIES = new Set([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT])
const CAPTURABLE_NON_PAWN = new Set([Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])

const TRIVIAL_PAYLOAD = {
  version: 2, kind: 'unary',
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

describe('promotionCaptureLeftScenario.buildCtxDelta (white)', () => {
  const delta = promotionCaptureLeftScenario.buildCtxDelta({ movingTeam: Board.WHITE })

  it('narrows moved_piece region to white\'s last rank excluding file 0', () => {
    // White last rank = positions 56-63. Excluding file 0 (A8 = 56).
    expect(delta.singulars.moved_piece.region.squares).toEqual(new Set([57, 58, 59, 60, 61, 62, 63]))
  })

  it('narrows captured_piece species_set to CAPTURABLE non-pawn', () => {
    expect(delta.singulars.captured_piece.species_set).toEqual(CAPTURABLE_NON_PAWN)
  })
})

describe('promotionCaptureLeftScenario — end-to-end via buildAttempt (white)', () => {
  it('produces a valid capture-left promotion example', () => {
    const random = seededRandom(5)
    let result = null
    for (let i = 0; i < 100; i += 1) {
      const attempt = buildAttempt(buildCombinedPlan([TRIVIAL_PAYLOAD]), random, promotionCaptureLeftScenario)
      if (attempt) { result = attempt; break }
    }
    expect(result).not.toBeNull()
    expect(result.moveObject.illegal).toBeFalsy()
    expect(PROMOTION_SPECIES.has(result.moveObject.promotionPiece)).toBe(true)

    const endPos = result.moveObject.endPosition
    const startPos = result.moveObject.startPosition
    expect(Math.floor(endPos / 8)).toBe(7) // rank 8
    expect(endPos - startPos).toBe(9) // diag-left: file -1, rank +1 (for white)
    // prior board has a white pawn at the start position
    expect(result.priorBoard.teamAt(startPos)).toBe(Board.WHITE)
    expect(result.priorBoard.pieceTypeAt(startPos)).toBe(Board.PAWN)
    // prior board has an enemy non-pawn at endPos (the captured piece)
    expect(result.priorBoard.teamAt(endPos)).toBe(Board.BLACK)
    expect(CAPTURABLE_NON_PAWN.has(result.priorBoard.pieceTypeAt(endPos))).toBe(true)
  })
})
