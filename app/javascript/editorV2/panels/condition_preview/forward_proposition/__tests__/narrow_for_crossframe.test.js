import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { narrowForCrossFrame } from 'editorV2/panels/condition_preview/forward_proposition/narrow_for_crossframe'
import { defaultTestCtx } from './_helpers'

// Kind retirement: crossFrame entry `source` is now 'census' (it is plan.kind).
// The positive census narrowing path (drops null / intersects species_set, and
// the formerly-dormant aggregate_value variant — now live under census value
// PBS) lives in narrow_for_crossframe_census.test.js; that redundant describe
// block was deleted from here to avoid duplication. Retained here: the
// non-matching guard cases, re-based on source:'census' so each fails the
// narrowing for the field under test — not vacuously because the source is dead.

const CAPTURABLE = [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]

function capturedPieceSingular() {
  return {
    team: Board.BLACK,
    species_set: new Set([null, ...CAPTURABLE]),
    region: { kind: 'all' },
    relationsToAnchors: []
  }
}

function censusEnemyCountDownEntry(speciesSet = new Set(CAPTURABLE)) {
  const currentProposition = { team: Board.BLACK, frame: 'current', species_set: speciesSet }
  const priorProposition   = { team: Board.BLACK, frame: 'prior',   species_set: speciesSet }
  return { source: 'census', metric: 'count', direction: '-', priorProposition, currentProposition }
}

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
      crossFrame: [{ ...censusEnemyCountDownEntry(), source: 'relational' }]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })

  it('leaves captured_piece alone when direction is "+"', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [{ ...censusEnemyCountDownEntry(), direction: '+' }]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })

  it('leaves captured_piece alone when metric is aggregate_mobility', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [{ ...censusEnemyCountDownEntry(), metric: 'aggregate_mobility' }]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })

  it('leaves captured_piece alone when team is the moving team (unreachable in practice but defensive)', () => {
    const movingTeamEntry = censusEnemyCountDownEntry()
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
