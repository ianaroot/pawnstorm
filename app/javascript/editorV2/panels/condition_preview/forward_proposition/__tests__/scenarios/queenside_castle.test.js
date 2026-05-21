import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildAttempt } from 'editorV2/panels/condition_preview/forward_proposition/build_engine'
import { queensideCastleScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/queenside_castle'

const A1 = 0
const C1 = 2
const D1 = 3
const E1 = 4

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

describe('queensideCastleScenario', () => {
  it('is named "queenside_castle"', () => {
    expect(queensideCastleScenario.name).toBe('queenside_castle')
  })
})

describe('queensideCastleScenario.buildCtxDelta (white)', () => {
  const delta = queensideCastleScenario.buildCtxDelta({ movingTeam: Board.WHITE })

  it('narrows moved_piece species_set to {KING}', () => {
    expect(delta.singulars.moved_piece.species_set).toEqual(new Set([Board.KING]))
  })

  it('narrows moved_piece region to {C1}', () => {
    expect(delta.singulars.moved_piece.region).toEqual({ kind: 'set', squares: new Set([C1]) })
  })

  it('narrows captured_piece species_set to {null}', () => {
    expect(delta.singulars.captured_piece.species_set).toEqual(new Set([null]))
  })

  it('emits a rook proposition for the moving team at D1', () => {
    const rookProp = delta.propositions.find(p =>
      p.species_set.has(Board.ROOK) && p.species_set.size === 1 && p.team === Board.WHITE
    )
    expect(rookProp).toBeDefined()
    expect(rookProp.region).toEqual({ kind: 'set', squares: new Set([D1]) })
    expect(rookProp.count_range).toEqual({ min: 1, max: 1 })
    expect(rookProp.frame).toBe('current')
  })
})

describe('queensideCastleScenario.resolveMoveObjectOverrides (white)', () => {
  it('returns startPosition E1, endPosition C1, pieceNotation "O-O-O"', () => {
    const overrides = queensideCastleScenario.resolveMoveObjectOverrides({ movingTeam: Board.WHITE })
    expect(overrides.startPosition).toBe(E1)
    expect(overrides.endPosition).toBe(C1)
    expect(overrides.pieceNotation).toBe('O-O-O')
  })
})

describe('queensideCastleScenario — end-to-end via buildAttempt (white)', () => {
  it('produces a valid queenside castle example', () => {
    const random = seededRandom(7)
    let result = null
    for (let i = 0; i < 50; i += 1) {
      const attempt = buildAttempt(buildCombinedPlan([TRIVIAL_PAYLOAD]), random, queensideCastleScenario)
      if (attempt) { result = attempt; break }
    }
    expect(result).not.toBeNull()
    expect(result.moveObject.illegal).toBeFalsy()
    expect(result.moveObject.startPosition).toBe(E1)
    expect(result.moveObject.endPosition).toBe(C1)
    expect(result.moveObject.pieceNotation).toBe('O-O-O')
    expect(result.priorBoard.teamAt(E1)).toBe(Board.WHITE)
    expect(result.priorBoard.pieceTypeAt(E1)).toBe(Board.KING)
    expect(result.priorBoard.teamAt(A1)).toBe(Board.WHITE)
    expect(result.priorBoard.pieceTypeAt(A1)).toBe(Board.ROOK)
  })
})
