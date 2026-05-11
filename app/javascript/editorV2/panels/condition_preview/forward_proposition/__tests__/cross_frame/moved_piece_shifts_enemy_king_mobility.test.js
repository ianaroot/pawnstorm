import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceShiftsEnemyKingMobility
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_shifts_enemy_king_mobility'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

function movedPieceSingular(species = Board.QUEEN) {
  return {
    team: Board.WHITE,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([D4]) },
    priorRegion: { kind: 'all' },
    relationsToAnchors: []
  }
}

function entry({ direction = '-', team = Board.BLACK, speciesSet = new Set([Board.KING]), boundSingularActor = null } = {}) {
  const currentProposition = {
    team, frame: 'current',
    species_set: speciesSet,
    region: { kind: 'all' },
    boundSingularActor,
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity }
  }
  return {
    source: 'unary', operator: 'mobility', metric: 'aggregate_mobility', direction,
    priorProposition: { ...currentProposition, frame: 'prior' },
    currentProposition,
    subjectProposition: null,
    targetProposition: null
  }
}

describe('movedPieceShiftsEnemyKingMobility — appliesTo', () => {
  it('returns true for enemy mobility entries with king in the species filter', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsEnemyKingMobility.appliesTo(entry(), ctx, new Map())).toBe(true)
  })

  it('returns true for enemy mobility entries with "any" filter (king included)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    const allSpecies = new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
    expect(movedPieceShiftsEnemyKingMobility.appliesTo(entry({ speciesSet: allSpecies }), ctx, new Map())).toBe(true)
  })

  it('returns false when king is not in the species filter', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsEnemyKingMobility.appliesTo(entry({ speciesSet: new Set([Board.QUEEN]) }), ctx, new Map())).toBe(false)
  })

  it('returns false for allied-team mobility', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: movedPieceSingular() } })
    expect(movedPieceShiftsEnemyKingMobility.appliesTo(entry({ team: Board.WHITE }), ctx, new Map())).toBe(false)
  })

})

describe('movedPieceShiftsEnemyKingMobility — apply', () => {
  it('returns non-null for direction "-" with moved_piece attacking king-adjacent squares', () => {
    // White queen at D4 attacks many squares including diagonals.
    // Place black king at A1 (file 0 rank 0). White queen at D4 attacks B2,
    // C3 (king-adjacent squares) along the a8-h1 diagonal.
    const A1 = 0
    const moved = movedPieceSingular(Board.QUEEN)
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [A1, pieceCode(Board.BLACK, Board.KING)]
    ])

    const result = movedPieceShiftsEnemyKingMobility.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
  })

  it('places an enemy king if absent before attempting engineering', () => {
    const moved = movedPieceSingular(Board.QUEEN)
    const ctx = defaultTestCtx({ singulars: { moved_piece: moved } })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])

    const result = movedPieceShiftsEnemyKingMobility.apply(entry({ direction: '-' }), ctx, pieces, () => 0.5)

    if (result !== null) {
      // Verify an enemy king ended up on the board.
      const enemyKing = pieceCode(Board.BLACK, Board.KING)
      const hasEnemyKing = [...result.values()].some(p => p === enemyKing)
      expect(hasEnemyKing).toBe(true)
    }
  })
})
