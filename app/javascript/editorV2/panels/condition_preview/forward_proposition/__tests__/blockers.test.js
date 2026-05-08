import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { blockersMechanism } from 'editorV2/panels/condition_preview/forward_proposition/mobility/blockers'
import { mobilityAt } from 'gameplay/mobility'
import { buildBoardFromLayout, buildLayoutFromPieces, pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { position } from 'gameplay/__tests__/helpers'

function piecesMap(entries) {
  return new Map(entries.map(([sq, code]) => [position(sq), code]))
}

function boardFrom(pieces) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces))
}

function targetAt(square, team, species) {
  return { position: position(square), team, species }
}

describe('blockersMechanism.appliesTo', () => {
  it('applies to non-knight species', () => {
    const target = targetAt('d4', Board.WHITE, Board.QUEEN)
    expect(blockersMechanism.appliesTo(target, {}, 'current', new Map())).toBe(true)
  })

  it('applies to knights too — blocking one jump still reduces mobility', () => {
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    expect(blockersMechanism.appliesTo(target, {}, 'current', new Map())).toBe(true)
  })
})

describe('blockersMechanism.apply', () => {
  it('reduces a queen\'s mobility by placing a same-team blocker on a ray', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.QUEEN)],
      ['e1', pieceCode(Board.WHITE, Board.KING)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.QUEEN)
    const before = mobilityAt(boardFrom(pieces), position('d4'))

    const next = blockersMechanism.apply(target, {}, 'current', pieces, () => 0)
    expect(next).not.toBeNull()
    const after = mobilityAt(boardFrom(next), position('d4'))
    expect(after).toBeLessThan(before)
    const newSquare = [...next.keys()].find(square => !pieces.has(square))
    expect(next.get(newSquare).charAt(0)).toBe(Board.WHITE)
  })

  it('reduces a queen\'s mobility by placing an enemy blocker on a ray', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.QUEEN)],
      ['e1', pieceCode(Board.WHITE, Board.KING)],
      ['e8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.QUEEN)
    const before = mobilityAt(boardFrom(pieces), position('d4'))

    const next = blockersMechanism.apply(target, {}, 'current', pieces, () => 0.7)
    expect(next).not.toBeNull()
    const after = mobilityAt(boardFrom(next), position('d4'))
    expect(after).toBeLessThan(before)
    const newSquare = [...next.keys()].find(square => !pieces.has(square))
    expect(next.get(newSquare).charAt(0)).toBe(Board.BLACK)
  })

  it('reduces a knight\'s mobility by occupying one of its jump squares with same-team piece', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.NIGHT)],
      ['a1', pieceCode(Board.WHITE, Board.KING)],
      ['h8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    const before = mobilityAt(boardFrom(pieces), position('d4'))

    const next = blockersMechanism.apply(target, {}, 'current', pieces, () => 0)
    expect(next).not.toBeNull()
    const after = mobilityAt(boardFrom(next), position('d4'))
    expect(after).toBe(before - 1)
  })

  it('returns null when the target has no available moves', () => {
    const pieces = piecesMap([
      ['a1', pieceCode(Board.WHITE, Board.KING)],
      ['a2', pieceCode(Board.WHITE, Board.PAWN)],
      ['b1', pieceCode(Board.WHITE, Board.PAWN)],
      ['b2', pieceCode(Board.WHITE, Board.PAWN)],
      ['h8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('a1', Board.WHITE, Board.KING)

    const next = blockersMechanism.apply(target, {}, 'current', pieces, () => 0)
    expect(next).toBeNull()
  })
})

describe('blockersMechanism.isActive', () => {
  it('is currently a placeholder that returns false', () => {
    const target = targetAt('d4', Board.WHITE, Board.QUEEN)
    expect(blockersMechanism.isActive(target, new Map())).toBe(false)
  })
})
