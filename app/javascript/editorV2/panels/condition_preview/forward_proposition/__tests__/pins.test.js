import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { pinsMechanism } from 'editorV2/panels/condition_preview/forward_proposition/mobility/pins'
import { mobilityAt } from 'gameplay/mobility'
import { buildBoardFromLayout, buildLayoutFromPieces, pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { position } from 'gameplay/__tests__/helpers'

function piecesMap(entries) {
  return new Map(entries.map(([square, code]) => [position(square), code]))
}

function boardFrom(pieces) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces))
}

function targetAt(square, team, species) {
  return { position: position(square), team, species }
}

describe('pinsMechanism.appliesTo', () => {
  it('applies to non-king targets', () => {
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    expect(pinsMechanism.appliesTo(target, {}, 'current', new Map())).toBe(true)
  })

  it('does not apply to king targets', () => {
    const target = targetAt('d4', Board.WHITE, Board.KING)
    expect(pinsMechanism.appliesTo(target, {}, 'current', new Map())).toBe(false)
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

    const next = pinsMechanism.apply(target, {}, 'current', pieces, () => 0)
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

    const next = pinsMechanism.apply(target, {}, 'current', pieces, () => 0)
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

    const next = pinsMechanism.apply(target, {}, 'current', pieces, () => 0)
    expect(next).toBeNull()
  })
})

describe('pinsMechanism.isActive', () => {
  it('is currently a placeholder that returns false', () => {
    const target = targetAt('d4', Board.WHITE, Board.NIGHT)
    expect(pinsMechanism.isActive(target, new Map())).toBe(false)
  })
})
