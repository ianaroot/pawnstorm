import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { kingAdjacentControlMechanism } from 'editorV2/panels/condition_preview/forward_proposition/mobility/king_adjacent_control'
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

const EMPTY_CTX = { propositions: [] }

describe('kingAdjacentControlMechanism.appliesTo', () => {
  it('applies to king targets', () => {
    const target = targetAt('d4', Board.WHITE, Board.KING)
    expect(kingAdjacentControlMechanism.appliesTo(target, EMPTY_CTX, 'current', new Map())).toBe(true)
  })

  it('does not apply to non-king targets', () => {
    const target = targetAt('d4', Board.WHITE, Board.QUEEN)
    expect(kingAdjacentControlMechanism.appliesTo(target, EMPTY_CTX, 'current', new Map())).toBe(false)
  })
})

describe('kingAdjacentControlMechanism.apply', () => {
  it('reduces king mobility by placing an enemy piece controlling an adjacent square', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.KING)],
      ['d8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.KING)
    const before = mobilityAt(boardFrom(pieces), position('d4'))

    const next = kingAdjacentControlMechanism.apply(target, EMPTY_CTX, 'current', pieces, () => 0)
    expect(next).not.toBeNull()
    const after = mobilityAt(boardFrom(next), position('d4'))
    expect(after).toBeLessThan(before)
  })

  it('places a piece on the enemy team', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.KING)],
      ['d8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.KING)

    const next = kingAdjacentControlMechanism.apply(target, EMPTY_CTX, 'current', pieces, () => 0)
    expect(next).not.toBeNull()
    const newSquare = [...next.keys()].find(square => !pieces.has(square))
    expect(next.get(newSquare).charAt(0)).toBe(Board.BLACK)
  })
})

describe('kingAdjacentControlMechanism.apply respecting caps', () => {
  it('returns null when every legal enemy attacker would violate a count_range.max cap', () => {
    const pieces = piecesMap([
      ['d4', pieceCode(Board.WHITE, Board.KING)],
      ['d8', pieceCode(Board.BLACK, Board.KING)]
    ])
    const target = targetAt('d4', Board.WHITE, Board.KING)
    const ctx = {
      singulars: {},
      propositions: [{
        team: Board.BLACK,
        frame: 'current',
        species_set: new Set([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT, Board.PAWN]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }]
    }

    expect(kingAdjacentControlMechanism.apply(target, ctx, 'current', pieces, () => 0)).toBeNull()
  })
})

describe('kingAdjacentControlMechanism.isActive', () => {
  it('is currently a placeholder that returns false', () => {
    const target = targetAt('d4', Board.WHITE, Board.KING)
    expect(kingAdjacentControlMechanism.isActive(target, new Map())).toBe(false)
  })
})
