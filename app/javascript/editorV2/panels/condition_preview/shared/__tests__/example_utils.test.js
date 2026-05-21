import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  buildPriorBoard, moveKindForMoveObject,
  MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/shared/example_utils'

const D4 = 27
const F3 = 21

function singulars({ capturedSpecies = null } = {}) {
  return {
    moved_piece: { team: Board.WHITE, species_set: new Set([Board.NIGHT]) },
    captured_piece: { team: Board.BLACK, species_set: new Set([capturedSpecies]) }
  }
}

describe('buildPriorBoard', () => {
  it('moves the piece from endPos back to origin when there is no capture', () => {
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const prior = buildPriorBoard({ pieces, singulars: singulars(), origin: F3, endPos: D4 })

    expect(prior.get(F3)).toBe(pieceCode(Board.WHITE, Board.NIGHT))
    expect(prior.has(D4)).toBe(false)
  })

  it('places captured_piece at endPos when captured species is non-null', () => {
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const prior = buildPriorBoard({
      pieces, singulars: singulars({ capturedSpecies: Board.QUEEN }), origin: F3, endPos: D4
    })

    expect(prior.get(F3)).toBe(pieceCode(Board.WHITE, Board.NIGHT))
    expect(prior.get(D4)).toBe(pieceCode(Board.BLACK, Board.QUEEN))
  })
})

describe('moveKindForMoveObject', () => {
  it('tags kingside and queenside castles as castle', () => {
    expect(moveKindForMoveObject({ pieceNotation: 'O-O' })).toBe(MOVE_KIND_CASTLE)
    expect(moveKindForMoveObject({ pieceNotation: 'O-O-O' })).toBe(MOVE_KIND_CASTLE)
  })

  it('tags promotionPiece moves as promotion', () => {
    expect(moveKindForMoveObject({ promotionPiece: Board.QUEEN })).toBe(MOVE_KIND_PROMOTION)
  })

  it('tags additionalActions moves as en passant', () => {
    expect(moveKindForMoveObject({ additionalActions: [{}] })).toBe(MOVE_KIND_EN_PASSANT)
  })

  it('tags ordinary moves as standard', () => {
    expect(moveKindForMoveObject({ pieceNotation: 'Nf3' })).toBe(MOVE_KIND_STANDARD)
    expect(moveKindForMoveObject({})).toBe(MOVE_KIND_STANDARD)
  })

  it('castle notation takes precedence over a stray promotionPiece', () => {
    expect(moveKindForMoveObject({ pieceNotation: 'O-O', promotionPiece: Board.QUEEN }))
      .toBe(MOVE_KIND_CASTLE)
  })
})
