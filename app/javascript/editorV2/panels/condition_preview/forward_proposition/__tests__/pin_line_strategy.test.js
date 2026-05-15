import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { shieldingPositions } from 'gameplay/board_query_utils'
import { pinLineStrategy } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/strategies/pin_line'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { defaultTestCtx } from './_helpers'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function constraintOf(overrides = {}) {
  return {
    team: Board.WHITE,
    frame: 'current',
    species_set: new Set([Board.NIGHT]),
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { min: 0, max: 1 },
    ...overrides
  }
}

function ctxOf(overrides = {}) {
  return defaultTestCtx(overrides)
}

function freshPoolEntry(constraint) {
  return {
    source: 'fresh',
    actorKey: null,
    team: constraint.team,
    speciesOptions: constraint.species_set,
    regionOptions: constraint.region,
    constraintRef: constraint,
    side: null
  }
}

describe('pinLineStrategy.appliesTo', () => {
  it('returns true for a typical mobility-constrained non-king proposition', () => {
    expect(pinLineStrategy.appliesTo(constraintOf(), ctxOf(), new Map(), [])).toBe(true)
  })

  it('returns false when the pin cap is already reached', () => {
    const ctx = ctxOf({ pinState: { count: 2, max: 2 } })
    expect(pinLineStrategy.appliesTo(constraintOf(), ctx, new Map(), [])).toBe(false)
  })

  it('returns false when the constraint species_set is only king', () => {
    const constraint = constraintOf({ species_set: new Set([Board.KING]) })
    expect(pinLineStrategy.appliesTo(constraint, ctxOf(), new Map(), [])).toBe(false)
  })

  it('returns false when the constraint region kind is "related-to"', () => {
    const constraint = constraintOf({
      region: { kind: 'related-to', actor: 'enemy_moved_piece', role: 'subject', operator: 'attack' }
    })
    expect(pinLineStrategy.appliesTo(constraint, ctxOf(), new Map(), [])).toBe(false)
  })
})

describe('pinLineStrategy.apply with a singular pool entry', () => {
  let movedPiece, ctx, result
  beforeEach(() => {
    movedPiece = {
      team: Board.WHITE,
      species_set: new Set([Board.NIGHT]),
      region: { kind: 'all' }
    }
    ctx = ctxOf({ singulars: { moved_piece: movedPiece } })
    const constraint = constraintOf()
    const pool = [{
      source: 'singular',
      actorKey: 'moved_piece',
      team: Board.WHITE,
      speciesOptions: movedPiece.species_set,
      regionOptions: movedPiece.region,
      constraintRef: null,
      side: null
    }]
    result = pinLineStrategy.apply(constraint, ctx, new Map(), pool, () => 0)
  })

  it('returns a non-null pieces map', () => {
    expect(result).not.toBeNull()
  })

  it('narrows moved_piece singular region to a single square', () => {
    expect(movedPiece.region.kind).toBe('set')
    expect(movedPiece.region.squares.size).toBe(1)
  })

  it('places moved_piece at its newly committed square', () => {
    const committedPos = [...movedPiece.region.squares][0]
    expect(result.get(committedPos)).toBe(pieceCode(Board.WHITE, Board.NIGHT))
  })
})

describe('pinLineStrategy.apply with a fresh pool entry', () => {
  let constraint, ctx, result
  beforeEach(() => {
    constraint = constraintOf()
    ctx = ctxOf()
    const pool = [freshPoolEntry(constraint)]
    result = pinLineStrategy.apply(constraint, ctx, new Map(), pool, () => 0)
  })

  it('returns a non-null pieces map', () => {
    expect(result).not.toBeNull()
  })

  it('places the target piece (white knight)', () => {
    const knightPos = [...result.entries()].find(([, c]) => c === pieceCode(Board.WHITE, Board.NIGHT))
    expect(knightPos).toBeDefined()
  })

  it('places the own king and the enemy slider so the knight is shielded', () => {
    const knightPos = [...result.entries()].find(([, c]) => c === pieceCode(Board.WHITE, Board.NIGHT))[0]
    const board = buildBoardFromLayout(buildLayoutFromPieces(result))
    const shielders = shieldingPositions({ board, targetPosition: knightPos, team: Board.WHITE })
    // The knight itself isn't a shielder of king; verify pin via king being shielded by knight:
    // i.e., shieldingPositions for the king should include the knight
    const kingPos = [...result.entries()].find(([, c]) => c === pieceCode(Board.WHITE, Board.KING))[0]
    const kingShielders = shieldingPositions({ board, targetPosition: kingPos, team: Board.WHITE })
    expect(kingShielders).toContain(knightPos)
  })

  it('increments ctx.pinState.count', () => {
    expect(ctx.pinState.count).toBe(1)
  })
})
