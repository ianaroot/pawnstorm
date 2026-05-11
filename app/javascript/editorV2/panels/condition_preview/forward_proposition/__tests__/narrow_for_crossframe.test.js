import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { narrowForCrossFrame } from 'editorV2/panels/condition_preview/forward_proposition/narrow_for_crossframe'
import { defaultTestCtx } from './_helpers'

const CAPTURABLE = [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]

function capturedPieceSingular() {
  return {
    team: Board.BLACK,
    species_set: new Set([null, ...CAPTURABLE]),
    region: { kind: 'all' },
    relationsToAnchors: []
  }
}

function unaryEnemyCountDownEntry(speciesSet = new Set(CAPTURABLE)) {
  const currentProposition = { team: Board.BLACK, frame: 'current', species_set: speciesSet }
  const priorProposition   = { team: Board.BLACK, frame: 'prior',   species_set: speciesSet }
  return { source: 'unary', metric: 'count', direction: '-', priorProposition, currentProposition }
}

describe('narrowForCrossFrame — narrows captured_piece for unary enemy count/value down', () => {
  it('drops null from captured_piece.species_set when source is unary, direction is "-", metric is count, team is enemy', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [unaryEnemyCountDownEntry()]
    })

    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set.has(null)).toBe(false)
  })

  it('intersects captured_piece.species_set with the crossFrame entry species_set', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [unaryEnemyCountDownEntry(new Set([Board.QUEEN]))]
    })

    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(new Set([Board.QUEEN]))
  })

  it('handles aggregate_value metric the same as count', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [{
        ...unaryEnemyCountDownEntry(new Set([Board.ROOK, Board.QUEEN])),
        metric: 'aggregate_value'
      }]
    })

    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(new Set([Board.ROOK, Board.QUEEN]))
  })
})

describe('narrowForCrossFrame — non-matching cases leave captured_piece unchanged', () => {
  it('leaves captured_piece alone when crossFrame is empty', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: []
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })

  it('leaves captured_piece alone when source is relational', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [{ ...unaryEnemyCountDownEntry(), source: 'relational' }]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })

  it('leaves captured_piece alone when direction is "+"', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [{ ...unaryEnemyCountDownEntry(), direction: '+' }]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })

  it('leaves captured_piece alone when metric is aggregate_mobility', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [{ ...unaryEnemyCountDownEntry(), metric: 'aggregate_mobility' }]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })

  it('leaves captured_piece alone when team is the moving team (unreachable in practice but defensive)', () => {
    const movingTeamEntry = unaryEnemyCountDownEntry()
    movingTeamEntry.currentProposition = { ...movingTeamEntry.currentProposition, team: Board.WHITE }
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [movingTeamEntry]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })
})
