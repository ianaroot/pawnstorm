import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { controllingPositions } from 'gameplay/board_query_utils'
import {
  pieceCode, buildBoardFromLayout, buildLayoutFromPieces, teamHasKing
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { checkRestrictionStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/check_restriction'
import { defaultTestCtx } from './_helpers'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function constraintOf(overrides = {}) {
  return {
    team: Board.BLACK,
    frame: 'current',
    species_set: new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]),
    region: { kind: 'all' },
    count_range: { min: 0, max: Infinity },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { min: 0, max: 5 },
    ...overrides
  }
}

function ctxOf(overrides = {}) {
  return defaultTestCtx({ checkState: { count: 0, max: 1 }, ...overrides })
}

describe('checkRestrictionStrategy.appliesTo', () => {
  it('returns true for a typical team-wide mobility constraint on the non-mover', () => {
    expect(checkRestrictionStrategy.appliesTo(constraintOf(), ctxOf(), new Map(), [])).toBe(true)
  })

  it('returns false when the cap is already reached', () => {
    const ctx = ctxOf({ checkState: { count: 1, max: 1 } })
    expect(checkRestrictionStrategy.appliesTo(constraintOf(), ctx, new Map(), [])).toBe(false)
  })

  it('returns false when the constraint applies to the team that just moved', () => {
    const constraint = constraintOf({ team: Board.WHITE })
    expect(checkRestrictionStrategy.appliesTo(constraint, ctxOf(), new Map(), [])).toBe(false)
  })

  it('returns false for related-to regions', () => {
    const constraint = constraintOf({
      region: { kind: 'related-to', actor: 'enemy_moved_piece', role: 'subject', operator: 'attack' }
    })
    expect(checkRestrictionStrategy.appliesTo(constraint, ctxOf(), new Map(), [])).toBe(false)
  })
})

describe('checkRestrictionStrategy.apply on an empty board', () => {
  let result, ctx
  beforeEach(() => {
    ctx = ctxOf()
    result = checkRestrictionStrategy.apply(constraintOf(), ctx, new Map(), [], () => 0)
  })

  it('returns a non-null pieces map', () => {
    expect(result).not.toBeNull()
  })

  it('places the constrained team\'s king', () => {
    expect(teamHasKing(result, Board.BLACK)).toBe(true)
  })

  it('puts the constrained team\'s king in check', () => {
    let kingPos = null
    for (const [pos, code] of result) {
      if (code === pieceCode(Board.BLACK, Board.KING)) { kingPos = pos; break }
    }
    const board = buildBoardFromLayout(buildLayoutFromPieces(result))
    expect(controllingPositions({ board, targetPosition: kingPos, team: Board.WHITE }).length).toBeGreaterThan(0)
  })

  it('increments ctx.checkState.count', () => {
    expect(ctx.checkState.count).toBe(1)
  })
})
