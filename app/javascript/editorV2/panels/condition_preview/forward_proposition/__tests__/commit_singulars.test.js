import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildSingulars } from 'editorV2/panels/condition_preview/forward_proposition/singulars'
import { commitSingularsSpecies } from 'editorV2/panels/condition_preview/forward_proposition/commit_singulars_species'
import { commitSingularsPosition } from 'editorV2/panels/condition_preview/forward_proposition/commit_singulars_position'

const TRIVIAL_PLAN = {
  version: 2, kind: 'unary',
  subject: 'allied', subjectFilter: 'pawn',
  operator: 'count', comparator: 'greater_than_or_equal_to',
  target: 'exact_number', targetTotal: 1
}

function ctxFor(combinedPlan) {
  const singulars = buildSingulars(combinedPlan)
  return { singulars, relations: [], propositions: [] }
}

describe('commitSingularsPosition — cap-respecting via virtual pieces', () => {
  it('sets singular region to empty set when no candidate respects caps', () => {
    const ctx = ctxFor(buildCombinedPlan([TRIVIAL_PLAN]))
    ctx.propositions = [{
      team: Board.WHITE,
      frame: 'current',
      species_set: new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]),
      region: { kind: 'all' },
      count_range: { min: 0, max: 0 },
      aggregate_value_range: { min: 0, max: Infinity },
      aggregate_mobility_range: { min: 0, max: Infinity }
    }]
    commitSingularsSpecies(ctx, () => 0.0)
    commitSingularsPosition(ctx, () => 0.0)

    expect(ctx.singulars.moved_piece.region.squares.size).toBe(0)
  })
})

describe('commitSingularsPosition — captured-piece actors bypass cap checks', () => {
  it('commits captured_piece even when an after-board cap on its species has max=0', () => {
    const ctx = ctxFor(buildCombinedPlan([TRIVIAL_PLAN]))
    ctx.propositions = [{
      team: Board.BLACK,
      frame: 'current',
      species_set: new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]),
      region: { kind: 'all' },
      count_range: { min: 0, max: 0 },
      aggregate_value_range: { min: 0, max: Infinity },
      aggregate_mobility_range: { min: 0, max: Infinity }
    }]
    commitSingularsSpecies(ctx, () => 0.999)
    commitSingularsPosition(ctx, () => 0.5)

    expect(ctx.singulars.captured_piece.region.kind).toBe('set')
    expect(ctx.singulars.captured_piece.region.squares.size).toBe(1)
  })

  it('commits enemy_captured_piece even when an after-board cap on its species has max=0', () => {
    const ctx = ctxFor(buildCombinedPlan([TRIVIAL_PLAN]))
    ctx.propositions = [{
      team: Board.WHITE,
      frame: 'current',
      species_set: new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]),
      region: { kind: 'all' },
      count_range: { min: 0, max: 0 },
      aggregate_value_range: { min: 0, max: Infinity },
      aggregate_mobility_range: { min: 0, max: Infinity }
    }]
    commitSingularsSpecies(ctx, () => 0.999)
    commitSingularsPosition(ctx, () => 0.5)

    expect(ctx.singulars.enemy_captured_piece.region.kind).toBe('set')
    expect(ctx.singulars.enemy_captured_piece.region.squares.size).toBe(1)
  })
})

describe('commitSingulars — moved_piece (random 0.0)', () => {
  let ctx
  beforeEach(() => {
    ctx = ctxFor(buildCombinedPlan([TRIVIAL_PLAN]))
    commitSingularsSpecies(ctx, () => 0.0)
    commitSingularsPosition(ctx, () => 0.0)
  })

  it('narrows moved_piece species_set to a single species', () => {
    expect(ctx.singulars.moved_piece.species_set.size).toBe(1)
  })

  it('sets moved_piece region kind to "set"', () => {
    expect(ctx.singulars.moved_piece.region.kind).toBe('set')
  })

  it('narrows moved_piece region to a single square', () => {
    expect(ctx.singulars.moved_piece.region.squares.size).toBe(1)
  })
})

describe('commitSingulars — optional actors (random 0.0 selects null)', () => {
  let ctx
  beforeEach(() => {
    ctx = ctxFor(buildCombinedPlan([TRIVIAL_PLAN]))
    commitSingularsSpecies(ctx, () => 0.0)
    commitSingularsPosition(ctx, () => 0.0)
  })

  it('commits captured_piece species_set to {null}', () => {
    expect(ctx.singulars.captured_piece.species_set).toEqual(new Set([null]))
  })
})

describe('commitSingulars — optional actors (random 0.999 selects past null)', () => {
  let ctx
  beforeEach(() => {
    ctx = ctxFor(buildCombinedPlan([TRIVIAL_PLAN]))
    commitSingularsSpecies(ctx, () => 0.999)
    commitSingularsPosition(ctx, () => 0.999)
  })

  it('removes null from captured_piece species_set', () => {
    expect(ctx.singulars.captured_piece.species_set.has(null)).toBe(false)
  })

  it('narrows captured_piece species_set to a single species', () => {
    expect(ctx.singulars.captured_piece.species_set.size).toBe(1)
  })

  it('sets captured_piece region kind to "set"', () => {
    expect(ctx.singulars.captured_piece.region.kind).toBe('set')
  })

  it('narrows captured_piece region to a single square', () => {
    expect(ctx.singulars.captured_piece.region.squares.size).toBe(1)
  })
})

describe('commitSingulars — relationsToAnchors narrowing', () => {
  const D4 = 27
  let enemyPos
  beforeEach(() => {
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
    const ctx = { singulars, relations: [], propositions: [] }
    commitSingularsSpecies(ctx, () => 0.0)
    commitSingularsPosition(ctx, () => 0.0)
    enemyPos = [...ctx.singulars.enemy_moved_piece.region.squares][0]
  })

  it('places enemy_moved_piece on a square adjacent to the anchor (moved_piece at D4)', () => {
    const fileDiff = Math.abs(Board.fileIndex(enemyPos) - Board.fileIndex(D4))
    const rankDiff = Math.abs(Board.rankIndex(enemyPos) - Board.rankIndex(D4))
    expect(Math.max(fileDiff, rankDiff)).toBe(1)
  })
})

describe('commitSingulars — aliased singulars (same_piece)', () => {
  let ctx
  beforeEach(() => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'captured_piece', subjectFilter: 'any',
      operator: 'same_piece',
      target: 'enemy_moved_piece', targetFilter: 'any'
    }])
    ctx = ctxFor(combinedPlan)
    commitSingularsSpecies(ctx, () => 0.5)
    commitSingularsPosition(ctx, () => 0.5)
  })

  it('aliases captured_piece and enemy_moved_piece to the same object reference', () => {
    expect(ctx.singulars.captured_piece).toBe(ctx.singulars.enemy_moved_piece)
  })

  it('commits the aliased species_set to a single species', () => {
    expect(ctx.singulars.captured_piece.species_set.size).toBe(1)
  })

  it('removes null from the aliased species_set', () => {
    expect(ctx.singulars.captured_piece.species_set.has(null)).toBe(false)
  })

  it('narrows the aliased region to a single square', () => {
    expect(ctx.singulars.captured_piece.region.squares.size).toBe(1)
  })
})
