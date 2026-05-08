import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildSingulars } from 'editorV2/panels/condition_preview/forward_proposition/singulars'
import { commitSingulars } from 'editorV2/panels/condition_preview/forward_proposition/commit_singulars'

const TRIVIAL_PLAN = {
  version: 2, kind: 'unary',
  subject: 'allied', subjectFilter: 'pawn',
  operator: 'count', comparator: 'greater_than_or_equal_to',
  target: 'exact_number', targetTotal: 1
}

describe('commitSingulars — moved_piece', () => {
  it('narrows moved_piece species_set and region to singletons', () => {
    const singulars = buildSingulars(buildCombinedPlan([TRIVIAL_PLAN]))

    commitSingulars({ singulars, relations: [], propositions: [] }, () => 0.0)

    expect(singulars.moved_piece.species_set.size).toBe(1)
    expect(singulars.moved_piece.region.kind).toBe('set')
    expect(singulars.moved_piece.region.squares.size).toBe(1)
  })
})

describe('commitSingulars — optional actors', () => {
  it('commits captured_piece to {null} when random selects the null slot', () => {
    const singulars = buildSingulars(buildCombinedPlan([TRIVIAL_PLAN]))

    commitSingulars({ singulars, relations: [], propositions: [] }, () => 0.0)

    expect(singulars.captured_piece.species_set).toEqual(new Set([null]))
  })

  it('commits captured_piece to a real species and a singleton region when random selects past the null slot', () => {
    const singulars = buildSingulars(buildCombinedPlan([TRIVIAL_PLAN]))

    commitSingulars({ singulars, relations: [], propositions: [] }, () => 0.999)

    expect(singulars.captured_piece.species_set.has(null)).toBe(false)
    expect(singulars.captured_piece.species_set.size).toBe(1)
    expect(singulars.captured_piece.region.kind).toBe('set')
    expect(singulars.captured_piece.region.squares.size).toBe(1)
  })
})

describe('commitSingulars — relationsToAnchors narrowing', () => {
  it('narrows the lower-priority actor region against an already-committed anchor (adjacent)', () => {
    const D4 = 27
    const singulars = {
      moved_piece: {
        team: Board.WHITE, species_set: new Set([Board.NIGHT]),
        region: { kind: 'set', squares: new Set([D4]) },
        relationsToAnchors: []
      },
      captured_piece:       { team: Board.BLACK, species_set: new Set([null]), region: { kind: 'all' }, relationsToAnchors: [] },
      enemy_moved_piece: {
        team: Board.BLACK, species_set: new Set([Board.PAWN]), region: { kind: 'all' },
        relationsToAnchors: [{ otherActor: 'moved_piece', operator: 'adjacent', myRole: 'target' }]
      },
      enemy_captured_piece: { team: Board.WHITE, species_set: new Set([null]), region: { kind: 'all' }, relationsToAnchors: [] }
    }

    commitSingulars({ singulars, relations: [], propositions: [] }, () => 0.0)

    const enemyPos = [...singulars.enemy_moved_piece.region.squares][0]
    expect(enemyPos).toBeDefined()
    const fileDiff = Math.abs(Board.fileIndex(enemyPos) - Board.fileIndex(D4))
    const rankDiff = Math.abs(Board.rankIndex(enemyPos) - Board.rankIndex(D4))
    expect(Math.max(fileDiff, rankDiff)).toBe(1)
  })
})

describe('commitSingulars — aliased singulars', () => {
  it('commits aliased actors once (same reference) when same_piece collapses them', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'captured_piece', subjectFilter: 'any',
      operator: 'same_piece',
      target: 'enemy_moved_piece', targetFilter: 'any'
    }])
    const singulars = buildSingulars(combinedPlan)

    commitSingulars({ singulars, relations: [], propositions: [] }, () => 0.5)

    expect(singulars.captured_piece).toBe(singulars.enemy_moved_piece)
    expect(singulars.captured_piece.species_set.size).toBe(1)
    expect(singulars.captured_piece.species_set.has(null)).toBe(false)
    expect(singulars.captured_piece.region.squares.size).toBe(1)
  })
})
