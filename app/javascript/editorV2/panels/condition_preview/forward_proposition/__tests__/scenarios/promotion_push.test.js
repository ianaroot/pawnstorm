import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildAttempt } from 'editorV2/panels/condition_preview/forward_proposition/build_engine'
import { promotionPushScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/promotion_push'

const PROMOTION_SPECIES = new Set([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT])
const WHITE_LAST_RANK_SQUARES = new Set([56, 57, 58, 59, 60, 61, 62, 63])

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

describe('promotionPushScenario.buildCtxDelta (white)', () => {
  const delta = promotionPushScenario.buildCtxDelta({ movingTeam: Board.WHITE })

  it('narrows moved_piece species_set to the four promotion species', () => {
    expect(delta.singulars.moved_piece.species_set).toEqual(PROMOTION_SPECIES)
  })

  it('narrows moved_piece region to white\'s last rank', () => {
    expect(delta.singulars.moved_piece.region).toEqual({ kind: 'set', squares: WHITE_LAST_RANK_SQUARES })
  })

  it('narrows captured_piece species_set to {null} (push never captures)', () => {
    expect(delta.singulars.captured_piece.species_set).toEqual(new Set([null]))
  })
})

describe('promotionPushScenario — end-to-end via buildAttempt (white)', () => {
  it('produces a valid push-promotion example', () => {
    const random = seededRandom(3)
    let result = null
    for (let i = 0; i < 50; i += 1) {
      const attempt = buildAttempt(buildCombinedPlan([TRIVIAL_PAYLOAD]), random, promotionPushScenario)
      if (attempt) { result = attempt.move; break }
    }
    expect(result).not.toBeNull()
    expect(result.moveObject.illegal).toBeFalsy()
    expect(PROMOTION_SPECIES.has(result.moveObject.promotionPiece)).toBe(true)

    const endPos = result.moveObject.endPosition
    const startPos = result.moveObject.startPosition
    expect(Math.floor(endPos / 8)).toBe(7) // rank 8
    expect(endPos - startPos).toBe(8) // push: same file, one rank forward
    // prior board has a white pawn at the start position
    expect(result.priorBoard.teamAt(startPos)).toBe(Board.WHITE)
    expect(result.priorBoard.pieceTypeAt(startPos)).toBe(Board.PAWN)
  })
})
