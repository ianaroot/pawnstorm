import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { pinsMechanism } from 'editorV2/panels/condition_preview/forward_proposition/mobility/pins'
import { mobilityAt } from 'gameplay/mobility'
import { buildBoardFromLayout, buildLayoutFromPieces, pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { position } from 'gameplay/__tests__/helpers'
import { defaultTestCtx } from './_helpers'

function piecesMap(entries) {
  return new Map(entries.map(([square, code]) => [position(square), code]))
}

function boardFrom(pieces) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces))
}

function targetAt(square, team, species) {
  return { position: position(square), team, species }
}

const EMPTY_CTX = defaultTestCtx()

describe('pinsMechanism.appliesTo', () => {
  it('applies to non-king targets', () => {
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    expect(pinsMechanism.appliesTo(target, EMPTY_CTX, 'current', new Map())).toBe(true)
  })

  it('does not apply to king targets', () => {
    const target = targetAt('d4', Board.WHITE, Board.KING)
    expect(pinsMechanism.appliesTo(target, EMPTY_CTX, 'current', new Map())).toBe(false)
  })
})

describe('pinsMechanism.apply', () => {
  it('pins a knight by placing an enemy slider beyond the target on the king\'s line', () => {
    const pieces = piecesMap([
      ['d1', pieceCode(Board.WHITE, Board.KING)],
      ['d4', pieceCode(Board.WHITE, Board.NIGHT)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    const before = mobilityAt(boardFrom(pieces), position('d4'))

    const next = pinsMechanism.apply(target, EMPTY_CTX, 'current', pieces, () => 0)
    expect(next).not.toBeNull()
    const after = mobilityAt(boardFrom(next), position('d4'))
    expect(after).toBeLessThan(before)
  })

  it('returns null when target is not collinear with own king', () => {
    const pieces = piecesMap([
      ['d1', pieceCode(Board.WHITE, Board.KING)],
      ['e3', pieceCode(Board.WHITE, Board.NIGHT)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('e3', Board.WHITE, Board.NIGHT)

    const next = pinsMechanism.apply(target, EMPTY_CTX, 'current', pieces, () => 0)
    expect(next).toBeNull()
  })

  it('returns null when path between king and target is blocked by another piece', () => {
    const pieces = piecesMap([
      ['d1', pieceCode(Board.WHITE, Board.KING)],
      ['d2', pieceCode(Board.WHITE, Board.PAWN)],
      ['d4', pieceCode(Board.WHITE, Board.NIGHT)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)

    const next = pinsMechanism.apply(target, EMPTY_CTX, 'current', pieces, () => 0)
    expect(next).toBeNull()
  })
})

describe('pinsMechanism.apply when own king is missing', () => {
  it('places own king on a viable ray and sets up the pin', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.NIGHT)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)

    const next = pinsMechanism.apply(target, EMPTY_CTX, 'current', pieces, () => 0)

    expect(next).not.toBeNull()
    const whiteKingExists = [...next.values()].some(p => p === pieceCode(Board.WHITE, Board.KING))
    expect(whiteKingExists).toBe(true)
  })
})

describe('pinsMechanism.apply increments pinState counter', () => {
  it('bumps ctx.pinState.count on a successful pin', () => {
    const pieces = piecesMap([
      ['d1', pieceCode(Board.WHITE, Board.KING)],
      ['d4', pieceCode(Board.WHITE, Board.NIGHT)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    const ctx = defaultTestCtx()

    pinsMechanism.apply(target, ctx, 'current', pieces, () => 0)

    expect(ctx.pinState.count).toBe(1)
  })
})

describe('pinsMechanism.appliesTo respects pinState cap', () => {
  it('returns false when ctx.pinState.count has reached max', () => {
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    const ctx = defaultTestCtx({ pinState: { count: 2, max: 2 } })

    expect(pinsMechanism.appliesTo(target, ctx, 'current', new Map())).toBe(false)
  })
})

describe('pinsMechanism.apply respecting caps', () => {
  it('returns null when every legal slider species/position would violate a count_range.max cap', () => {
    const pieces = piecesMap([
      ['d1', pieceCode(Board.WHITE, Board.KING)],
      ['d4', pieceCode(Board.WHITE, Board.NIGHT)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    const ctx = defaultTestCtx({
      propositions: [{
        team: Board.BLACK,
        frame: 'current',
        species_set: new Set([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT, Board.PAWN]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }]
    })

    expect(pinsMechanism.apply(target, ctx, 'current', pieces, () => 0)).toBeNull()
  })
})

