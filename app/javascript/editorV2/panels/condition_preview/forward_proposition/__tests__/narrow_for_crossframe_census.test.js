import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { narrowForCrossFrame } from 'editorV2/panels/condition_preview/forward_proposition/narrow_for_crossframe'
import { defaultTestCtx } from './_helpers'

// NEW-TDD-RED: post-merge the crossFrame entry `source` becomes 'census'
// (it is plan.kind). `forcesCapture` currently hard-requires
// source === 'unary', so the captured_piece narrowing silently stops for
// every census PBS. These pin the decided behavior: census conditions
// involving captured_piece force the capture EXCEPT when the assertion is
// count = 0 (which asserts that no capture happened).

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
  const priorProposition = { team: Board.BLACK, frame: 'prior', species_set: speciesSet }
  return { source: 'census', metric: 'count', direction: '-', priorProposition, currentProposition }
}

describe('narrowForCrossFrame — census PBS still narrows captured_piece (NEW-TDD-RED)', () => {
  it('drops null from captured_piece.species_set for a decreasing enemy count census', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [censusEnemyCountDownEntry()]
    })

    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set.has(null)).toBe(false)
  })

  it('intersects captured_piece.species_set with the census crossFrame entry species_set', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [censusEnemyCountDownEntry(new Set([Board.QUEEN]))]
    })

    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(new Set([Board.QUEEN]))
  })

  // Live under census: a decreasing-enemy census *value* PBS emits
  // {source:'census', metric:'aggregate_value', direction:'-'}
  // (propositions.js metricForOperator('value', collection) -> aggregate_value),
  // so forcesCapture fires the same as for count.
  it('handles aggregate_value metric the same as count', () => {
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [{
        ...censusEnemyCountDownEntry(new Set([Board.ROOK, Board.QUEEN])),
        metric: 'aggregate_value'
      }]
    })

    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(new Set([Board.ROOK, Board.QUEEN]))
  })

  it('leaves captured_piece untouched when the census asserts an enemy count of zero', () => {
    // count = 0 asserts NO capture occurred, so it must not force one.
    const zeroCountEntry = {
      ...censusEnemyCountDownEntry(),
      metric: 'count',
      direction: '=',
      currentProposition: { team: Board.BLACK, frame: 'current', species_set: new Set(CAPTURABLE), countIsZero: true }
    }
    const ctx = defaultTestCtx({
      singulars: { captured_piece: capturedPieceSingular() },
      crossFrame: [zeroCountEntry]
    })

    const before = new Set(ctx.singulars.captured_piece.species_set)
    narrowForCrossFrame(ctx)

    expect(ctx.singulars.captured_piece.species_set).toEqual(before)
  })
})
