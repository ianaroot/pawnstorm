import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { canCommitMovedPiece } from 'editorV2/panels/condition_preview/shared/singular_constraints'

const D4 = 27
const E5 = 36

// A binding constraint slot carries a `side` (a singular-shaped { species_set, region })
// and no `kind`. A `related-to` slot carries `kind: 'related-to'` and no `side` — it
// constrains the counterpart, not moved_piece, so it must be skipped.
function constraintSlot({ species = [Board.NIGHT], region = { kind: 'all' } } = {}) {
  return { side: { species_set: new Set(species), region } }
}

function relatedToSlot() {
  return { kind: 'related-to', role: 'target' }
}

function ctxWith(assignments) {
  return { movedBinding: { assignments } }
}

const setRegion = (...squares) => ({ kind: 'set', squares: new Set(squares) })

describe('canCommitMovedPiece', () => {
  it('is true when there is no binding to satisfy', () => {
    expect(canCommitMovedPiece(undefined, Board.NIGHT, D4)).toBe(true)
    expect(canCommitMovedPiece(ctxWith([]), Board.NIGHT, D4)).toBe(true)
  })

  it('is true when every constraint slot admits the species and position', () => {
    const ctx = ctxWith([constraintSlot({ species: [Board.NIGHT], region: setRegion(D4) })])

    expect(canCommitMovedPiece(ctx, Board.NIGHT, D4)).toBe(true)
  })

  it('is false when a constraint slot forbids the species', () => {
    const ctx = ctxWith([constraintSlot({ species: [Board.QUEEN] })])

    expect(canCommitMovedPiece(ctx, Board.NIGHT, D4)).toBe(false)
  })

  it('is false when a constraint slot region excludes the position', () => {
    const ctx = ctxWith([constraintSlot({ species: [Board.NIGHT], region: setRegion(E5) })])

    expect(canCommitMovedPiece(ctx, Board.NIGHT, D4)).toBe(false)
  })

  it('skips related-to slots — they have no side and constrain the counterpart, not moved_piece', () => {
    const ctx = ctxWith([relatedToSlot()])

    // Without the kind guard this would throw on `undefined.species_set`.
    expect(canCommitMovedPiece(ctx, Board.NIGHT, D4)).toBe(true)
  })

  it('requires every constraint slot to pass, ignoring an interleaved related-to slot', () => {
    const ctx = ctxWith([
      constraintSlot({ species: [Board.NIGHT], region: setRegion(D4) }),
      relatedToSlot(),
      constraintSlot({ species: [Board.NIGHT], region: setRegion(E5) })
    ])

    expect(canCommitMovedPiece(ctx, Board.NIGHT, D4)).toBe(false)
  })
})
