import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { synthesizeMove } from 'editorV2/panels/condition_preview/forward_proposition/synthesize_move'

const D4 = 27
const E1 = 4
const E8 = 60

function singularsWith(overrides) {
  return {
    moved_piece:          { team: Board.WHITE, species_set: new Set([Board.NIGHT]),  region: { kind: 'set', squares: new Set([D4]) } },
    captured_piece:       { team: Board.BLACK, species_set: new Set([null]),         region: { kind: 'all' } },
    enemy_moved_piece:    { team: Board.BLACK, species_set: new Set([null]),         region: { kind: 'all' } },
    enemy_captured_piece: { team: Board.WHITE, species_set: new Set([null]),         region: { kind: 'all' } },
    ...overrides
  }
}

function findPieceAt(board, code) {
  for (let pos = 0; pos < 64; pos += 1) {
    if (board.layOut[pos] === code) { return pos }
  }
  return null
}

describe('synthesizeMove — basic move', () => {
  it('returns priorBoard with the moved piece at a legal origin and a non-illegal moveObject', () => {
    const ctx = { singulars: singularsWith({}) }
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [E1, pieceCode(Board.WHITE, Board.KING)],
      [E8, pieceCode(Board.BLACK, Board.KING)]
    ])

    const result = synthesizeMove(ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.priorBoard.layOut[D4]).not.toBe(pieceCode(Board.WHITE, Board.NIGHT))

    const validOrigins = originCandidatesForSpecies(D4, Board.NIGHT, Board.WHITE)
    const foundOrigin = findPieceAt(result.priorBoard, pieceCode(Board.WHITE, Board.NIGHT))
    expect(validOrigins).toContain(foundOrigin)
    expect(result.moveObject.illegal).toBeFalsy()
  })
})

describe('synthesizeMove — capture', () => {
  it('places captured_piece on priorBoard at the moved_piece end position', () => {
    const ctx = { singulars: singularsWith({
      captured_piece: { team: Board.BLACK, species_set: new Set([Board.QUEEN]), region: { kind: 'all' } }
    }) }
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [E1, pieceCode(Board.WHITE, Board.KING)],
      [E8, pieceCode(Board.BLACK, Board.KING)]
    ])

    const result = synthesizeMove(ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.priorBoard.layOut[D4]).toBe(pieceCode(Board.BLACK, Board.QUEEN))
  })

  it('handles aliased same_piece — single object becomes the captured piece on priorBoard at end', () => {
    const aliased = { team: Board.BLACK, species_set: new Set([Board.QUEEN]), region: { kind: 'all' } }
    const ctx = { singulars: singularsWith({ captured_piece: aliased, enemy_moved_piece: aliased }) }
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [E1, pieceCode(Board.WHITE, Board.KING)],
      [E8, pieceCode(Board.BLACK, Board.KING)]
    ])

    const result = synthesizeMove(ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.priorBoard.layOut[D4]).toBe(pieceCode(Board.BLACK, Board.QUEEN))
  })
})

describe('synthesizeMove — failure', () => {
  it('returns null when every legal origin square is occupied on the after-board', () => {
    const ctx = { singulars: singularsWith({}) }
    const blocker = pieceCode(Board.WHITE, Board.PAWN)
    const knightOrigins = originCandidatesForSpecies(D4, Board.NIGHT, Board.WHITE)
    const occupied = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [E1, pieceCode(Board.WHITE, Board.KING)],
      [E8, pieceCode(Board.BLACK, Board.KING)]
    ])
    for (const o of knightOrigins) { occupied.set(o, blocker) }

    expect(synthesizeMove(ctx, occupied, () => 0.5)).toBeNull()
  })
})

describe('synthesizeMove — priorRegion', () => {
  const F3 = 21 // a knight origin for D4

  it('picks an origin within moved_piece.priorRegion when constrained', () => {
    const ctx = { singulars: singularsWith({
      moved_piece: {
        team: Board.WHITE, species_set: new Set([Board.NIGHT]),
        region: { kind: 'set', squares: new Set([D4]) },
        priorRegion: { kind: 'set', squares: new Set([F3]) }
      }
    }) }
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [E1, pieceCode(Board.WHITE, Board.KING)],
      [E8, pieceCode(Board.BLACK, Board.KING)]
    ])

    const result = synthesizeMove(ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(findPieceAt(result.priorBoard, pieceCode(Board.WHITE, Board.NIGHT))).toBe(F3)
  })

  it('returns null when priorRegion excludes all valid origin candidates', () => {
    const A1 = 0 // not a knight origin for D4
    const ctx = { singulars: singularsWith({
      moved_piece: {
        team: Board.WHITE, species_set: new Set([Board.NIGHT]),
        region: { kind: 'set', squares: new Set([D4]) },
        priorRegion: { kind: 'set', squares: new Set([A1]) }
      }
    }) }
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [E1, pieceCode(Board.WHITE, Board.KING)],
      [E8, pieceCode(Board.BLACK, Board.KING)]
    ])

    expect(synthesizeMove(ctx, pieces, () => 0.5)).toBeNull()
  })
})
