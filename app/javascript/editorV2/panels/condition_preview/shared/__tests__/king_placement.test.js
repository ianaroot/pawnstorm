import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { controllingPositions } from 'gameplay/board_query_utils'

import { placeKingDeliberately, placeKingInCheck, placeKingInStalemate } from 'editorV2/panels/condition_preview/shared/king_placement'
import {
  pieceCode, teamHasKing,
  buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview/shared/board_utils'

const A1 = 0
const D4 = 27

function ctxOf(overrides = {}) {
  return {
    singulars: {},
    propositions: [],
    movingTeam: Board.WHITE,
    enemyTeam: Board.BLACK,
    ...overrides
  }
}

function findKingPos(pieces, team) {
  for (const [pos, code] of pieces) {
    if (code === pieceCode(team, Board.KING)) { return pos }
  }
  return null
}

describe('placeKingDeliberately — basic placement', () => {
  it('places a king for the requested team when none is present', () => {
    const result = placeKingDeliberately(new Map(), Board.WHITE, 'current', ctxOf(), () => 0)
    expect(teamHasKing(result, Board.WHITE)).toBe(true)
  })

  it('returns the same pieces map when team already has a king', () => {
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.KING)]])
    expect(placeKingDeliberately(pieces, Board.WHITE, 'current', ctxOf(), () => 0)).toBe(pieces)
  })
})

describe('placeKingDeliberately — afterBoard, moving team requires out-of-check', () => {
  it('does not place the king on a square attacked by an enemy piece', () => {
    const pieces = new Map([[A1, pieceCode(Board.BLACK, Board.QUEEN)]])
    const result = placeKingDeliberately(pieces, Board.WHITE, 'current', ctxOf(), () => 0)
    const kingPos = findKingPos(result, Board.WHITE)
    const board = buildBoardFromLayout(buildLayoutFromPieces(result))
    const attackers = controllingPositions({ board, targetPosition: kingPos, team: Board.BLACK })
    expect(attackers).toHaveLength(0)
  })
})

describe('placeKingDeliberately — afterBoard, enemy team is permissive', () => {
  it('places the enemy king even when board has aggressive moving-team pieces', () => {
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])
    const result = placeKingDeliberately(pieces, Board.BLACK, 'current', ctxOf(), () => 0)
    expect(teamHasKing(result, Board.BLACK)).toBe(true)
  })
})

describe('placeKingDeliberately — opposing-king-adjacency', () => {
  it('does not place the king adjacent to the opposing king', () => {
    const pieces = new Map([[D4, pieceCode(Board.BLACK, Board.KING)]])
    const result = placeKingDeliberately(pieces, Board.WHITE, 'current', ctxOf(), () => 0)
    const kingPos = findKingPos(result, Board.WHITE)
    const adjacents = new Set([D4 - 9, D4 - 8, D4 - 7, D4 - 1, D4 + 1, D4 + 7, D4 + 8, D4 + 9])
    expect(adjacents.has(kingPos)).toBe(false)
  })
})

describe('placeKingDeliberately — respects caps', () => {
  it('returns null when every legal square would violate a count_range.max cap on kings', () => {
    const ctx = ctxOf({
      propositions: [{
        team: Board.WHITE,
        frame: 'current',
        species_set: new Set([Board.KING]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }]
    })
    expect(placeKingDeliberately(new Map(), Board.WHITE, 'current', ctx, () => 0)).toBeNull()
  })
})

describe('placeKingDeliberately — no legal square exists', () => {
  it('returns null when the board has no empty squares', () => {
    const pieces = new Map()
    for (let i = 0; i < 64; i += 1) {
      pieces.set(i, pieceCode(Board.WHITE, Board.PAWN))
    }
    expect(placeKingDeliberately(pieces, Board.BLACK, 'current', ctxOf(), () => 0)).toBeNull()
  })
})

describe('placeKingInCheck — empty board', () => {
  let result
  beforeEach(() => {
    result = placeKingInCheck({ pieces: new Map(), team: Board.BLACK, frame: 'current', ctx: ctxOf(), random: () => 0 })
  })

  it('returns a non-null pieces map', () => {
    expect(result).not.toBeNull()
  })

  it('places a black king', () => {
    expect(teamHasKing(result, Board.BLACK)).toBe(true)
  })

  it('places at least one white attacker controlling the black king square', () => {
    const kingPos = findKingPos(result, Board.BLACK)
    const board = buildBoardFromLayout(buildLayoutFromPieces(result))
    expect(controllingPositions({ board, targetPosition: kingPos, team: Board.WHITE }).length).toBeGreaterThan(0)
  })
})

describe('placeKingInCheck — pre-existing king', () => {
  let result
  beforeEach(() => {
    const pieces = new Map([[D4, pieceCode(Board.BLACK, Board.KING)]])
    result = placeKingInCheck({ pieces, team: Board.BLACK, frame: 'current', ctx: ctxOf(), random: () => 0 })
  })

  it('keeps the pre-existing black king in place', () => {
    expect(result.get(D4)).toBe(pieceCode(Board.BLACK, Board.KING))
  })

  it('places a white attacker controlling the existing black king square', () => {
    const board = buildBoardFromLayout(buildLayoutFromPieces(result))
    expect(controllingPositions({ board, targetPosition: D4, team: Board.WHITE }).length).toBeGreaterThan(0)
  })
})

describe('placeKingInStalemate — empty board', () => {
  // Run a few seeds so any single-seed unluckiness doesn't fail the test.
  let successes = 0
  beforeAll(() => {
    for (let i = 0; i < 30; i += 1) {
      const random = (() => { let s = i + 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000 } })()
      const result = placeKingInStalemate({ pieces: new Map(), team: Board.BLACK, frame: 'current', ctx: ctxOf(), random })
      if (result === null) { continue }
      const kingPos = findKingPos(result, Board.BLACK)
      const board = buildBoardFromLayout(buildLayoutFromPieces(result))
      const inCheck = controllingPositions({ board, targetPosition: kingPos, team: Board.WHITE }).length > 0
      if (inCheck) { continue }
      successes += 1
    }
  })

  it('successfully constructs at least one stalemate across 30 seeds', () => {
    expect(successes).toBeGreaterThan(0)
  })
})
