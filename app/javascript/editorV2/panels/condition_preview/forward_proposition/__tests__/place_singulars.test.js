import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { placeSingulars } from 'editorV2/panels/condition_preview/forward_proposition/place_singulars'

const D4 = 27
const A8 = 56

function singularsWith(overrides) {
  return {
    moved_piece:          { team: Board.WHITE, species_set: new Set([Board.NIGHT]),  region: { kind: 'set', squares: new Set([D4]) } },
    captured_piece:       { team: Board.BLACK, species_set: new Set([null]),         region: { kind: 'all' } },
    enemy_moved_piece:    { team: Board.BLACK, species_set: new Set([null]),         region: { kind: 'all' } },
    enemy_captured_piece: { team: Board.WHITE, species_set: new Set([null]),         region: { kind: 'all' } },
    ...overrides
  }
}

describe('placeSingulars — moved_piece', () => {
  it('places moved_piece at its committed end position with its committed species', () => {
    const pieces = placeSingulars(singularsWith({}), () => 0.0)

    expect(pieces.get(D4)).toBe(pieceCode(Board.WHITE, Board.NIGHT))
  })
})

describe('placeSingulars — captured_piece', () => {
  it('does not place captured_piece on the after-board (it lives only on prior, derived in synthesizeMove)', () => {
    const singulars = singularsWith({
      captured_piece: { team: Board.BLACK, species_set: new Set([Board.QUEEN]), region: { kind: 'all' } }
    })

    const pieces = placeSingulars(singulars, () => 0.0)

    for (const piece of pieces.values()) {
      expect(piece.charAt(0)).not.toBe(Board.BLACK)
    }
  })
})

describe('placeSingulars — enemy_moved_piece', () => {
  it('places enemy_moved_piece at its committed position when not aliased and species is non-null', () => {
    const singulars = singularsWith({
      enemy_moved_piece: { team: Board.BLACK, species_set: new Set([Board.QUEEN]), region: { kind: 'set', squares: new Set([A8]) } }
    })

    const pieces = placeSingulars(singulars, () => 0.0)

    expect(pieces.get(A8)).toBe(pieceCode(Board.BLACK, Board.QUEEN))
  })

  it('does not place enemy_moved_piece when species is null', () => {
    const pieces = placeSingulars(singularsWith({}), () => 0.0)

    for (const piece of pieces.values()) {
      expect(piece.charAt(0)).not.toBe(Board.BLACK)
    }
  })

  it('does not place aliased enemy_moved_piece + captured_piece on the after-board', () => {
    const aliased = { team: Board.BLACK, species_set: new Set([Board.QUEEN]), region: { kind: 'all' } }
    const singulars = singularsWith({ captured_piece: aliased, enemy_moved_piece: aliased })

    const pieces = placeSingulars(singulars, () => 0.0)

    for (const piece of pieces.values()) {
      expect(piece).not.toBe(pieceCode(Board.BLACK, Board.QUEEN))
    }
  })

  it('returns null when enemy_moved_piece would conflict with moved_piece end position', () => {
    const singulars = singularsWith({
      enemy_moved_piece: { team: Board.BLACK, species_set: new Set([Board.QUEEN]), region: { kind: 'set', squares: new Set([D4]) } }
    })

    expect(placeSingulars(singulars, () => 0.0)).toBeNull()
  })
})

describe('placeSingulars — empty-set region as commit-failure abort signal', () => {
  it('returns null when moved_piece region is a set with size 0', () => {
    const singulars = singularsWith({
      moved_piece: { team: Board.WHITE, species_set: new Set([Board.NIGHT]), region: { kind: 'set', squares: new Set() } }
    })

    expect(placeSingulars(singulars, () => 0.0)).toBeNull()
  })
})

describe('placeSingulars — already placed by early-placement', () => {
  it('skips placing moved_piece when its position already has the matching piece', () => {
    const initialPieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])
    const pieces = placeSingulars(singularsWith({}), () => 0.0, initialPieces)
    expect(pieces.size).toBe(1)
  })

  it('returns null when the existing piece at moved_piece\'s position is the wrong piece', () => {
    const initialPieces = new Map([[D4, pieceCode(Board.BLACK, Board.QUEEN)]])
    expect(placeSingulars(singularsWith({}), () => 0.0, initialPieces)).toBeNull()
  })
})
