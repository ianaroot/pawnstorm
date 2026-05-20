import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { satisfyCrossFrame } from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/satisfy_cross_frame'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

describe('satisfyCrossFrame — gate', () => {
  it('returns the input pieces map unchanged when ctx.crossFrame is empty', () => {
    const ctx = defaultTestCtx({ crossFrame: [] })
    const pieces = new Map()

    expect(satisfyCrossFrame(ctx, pieces, () => 0.5)).toBe(pieces)
  })

  it('returns the input pieces map unchanged when no mechanisms apply', () => {
    const ctx = defaultTestCtx({
      crossFrame: [{
        source: 'census', operator: 'mobility', metric: 'aggregate_mobility',
        direction: '+',
        priorProposition: { team: 'w', frame: 'prior', species_set: new Set() },
        currentProposition: { team: 'w', frame: 'current', species_set: new Set() }
      }]
    })
    const pieces = new Map()

    expect(satisfyCrossFrame(ctx, pieces, () => 0.5)).toBe(pieces)
  })
})

describe('satisfyCrossFrame — fires the participates-in-attack-or-defend mechanism', () => {
  function movedPieceSingular() {
    return {
      team: Board.WHITE,
      species_set: new Set([Board.NIGHT]),
      region: { kind: 'set', squares: new Set([D4]) },
      priorRegion: { kind: 'all' },
      relationsToAnchors: []
    }
  }

  function singulars() {
    return {
      moved_piece: movedPieceSingular(),
      captured_piece: { team: Board.BLACK, species_set: new Set([null]), region: { kind: 'all' } }
    }
  }

  function attackEntry() {
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack' }
    const currentProposition = {
      team: Board.BLACK, frame: 'current',
      species_set: new Set([Board.QUEEN]), region,
      count_range: { min: 1, max: Infinity }
    }
    const priorProposition = { ...currentProposition, frame: 'prior' }
    return {
      source: 'relational', operator: 'attack', metric: 'count', direction: '+',
      priorProposition, currentProposition,
      sourcePlan: {}
    }
  }

  function bindCtxTo(ctx, entry, role) {
    ctx.movedBinding = { assignments: [{ sourcePlan: entry.sourcePlan, role, kind: 'related-to' }] }
  }

  it('adds a piece that controls moved_piece destination', () => {
    const entry = attackEntry()
    const ctx = defaultTestCtx({
      singulars: singulars(),
      crossFrame: [entry]
    })
    bindCtxTo(ctx, entry, 'target')
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    const result = satisfyCrossFrame(ctx, pieces, () => 0.5)

    expect(result.size).toBe(pieces.size + 1)
  })

  it('narrows moved_piece priorRegion via the mechanism', () => {
    const entry = attackEntry()
    const ctx = defaultTestCtx({
      singulars: singulars(),
      crossFrame: [entry]
    })
    bindCtxTo(ctx, entry, 'target')
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]])

    satisfyCrossFrame(ctx, pieces, () => 0.5)

    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
  })
})
