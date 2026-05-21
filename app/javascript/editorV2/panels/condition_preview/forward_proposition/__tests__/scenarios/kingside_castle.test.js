import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildAttempt } from 'editorV2/panels/condition_preview/forward_proposition/build_engine'
import { kingsideCastleScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/kingside_castle'

const E1 = 4
const F1 = 5
const G1 = 6
const H1 = 7

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

describe('kingsideCastleScenario', () => {
  it('is named "kingside_castle"', () => {
    expect(kingsideCastleScenario.name).toBe('kingside_castle')
  })
})

describe('kingsideCastleScenario.buildCtxDelta (white)', () => {
  const delta = kingsideCastleScenario.buildCtxDelta({ movingTeam: Board.WHITE })

  it('narrows moved_piece species_set to {KING}', () => {
    expect(delta.singulars.moved_piece.species_set).toEqual(new Set([Board.KING]))
  })

  it('narrows moved_piece region to {G1}', () => {
    expect(delta.singulars.moved_piece.region).toEqual({ kind: 'set', squares: new Set([G1]) })
  })

  it('emits a rook proposition for the moving team at F1', () => {
    const rookProp = delta.propositions.find(p =>
      p.species_set.has(Board.ROOK) && p.species_set.size === 1 && p.team === Board.WHITE
    )
    expect(rookProp).toBeDefined()
    expect(rookProp.region).toEqual({ kind: 'set', squares: new Set([F1]) })
    expect(rookProp.count_range).toEqual({ min: 1, max: 1 })
    expect(rookProp.frame).toBe('current')
  })
})

describe('kingsideCastleScenario.resolveMoveObjectOverrides (white)', () => {
  it('returns startPosition E1, endPosition G1, pieceNotation "O-O"', () => {
    const overrides = kingsideCastleScenario.resolveMoveObjectOverrides({ movingTeam: Board.WHITE })
    expect(overrides.startPosition).toBe(E1)
    expect(overrides.endPosition).toBe(G1)
    expect(overrides.pieceNotation).toBe('O-O')
  })
})

describe('kingsideCastleScenario — end-to-end via buildAttempt (white)', () => {
  it('produces a valid kingside castle example', () => {
    const random = seededRandom(7)
    let result = null
    for (let i = 0; i < 50; i += 1) {
      const attempt = buildAttempt(buildCombinedPlan([TRIVIAL_PAYLOAD]), random, kingsideCastleScenario)
      if (attempt) { result = attempt; break }
    }
    expect(result).not.toBeNull()
    expect(result.moveObject.illegal).toBeFalsy()
    expect(result.moveObject.startPosition).toBe(E1)
    expect(result.moveObject.endPosition).toBe(G1)
    expect(result.moveObject.pieceNotation).toBe('O-O')
    expect(result.priorBoard.teamAt(E1)).toBe(Board.WHITE)
    expect(result.priorBoard.pieceTypeAt(E1)).toBe(Board.KING)
    expect(result.priorBoard.teamAt(H1)).toBe(Board.WHITE)
    expect(result.priorBoard.pieceTypeAt(H1)).toBe(Board.ROOK)
  })
})
