import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { qualifyingSquares } from 'editorV2/panels/condition_preview/shared/unary_position_collection'
import { buildSingulars } from 'editorV2/panels/condition_preview/forward_proposition/singulars'

const TRIVIAL_PLAN = {
  version: 2, kind: 'unary',
  subject: 'allied', subjectFilter: 'pawn',
  operator: 'count', comparator: 'greater_than_or_equal_to',
  target: 'exact_number', targetTotal: 1
}

describe('buildSingulars — initialization', () => {
  it('exposes the four move-event singular actors keyed by snake_case names', () => {
    const combinedPlan = buildCombinedPlan([TRIVIAL_PLAN])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece).toBeDefined()
    expect(singulars.captured_piece).toBeDefined()
    expect(singulars.enemy_moved_piece).toBeDefined()
    expect(singulars.enemy_captured_piece).toBeDefined()
  })

  it('assigns moved_piece and enemy_captured_piece to movingTeam, captured_piece and enemy_moved_piece to enemyTeam', () => {
    const combinedPlan = buildCombinedPlan([TRIVIAL_PLAN])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.team).toBe(Board.WHITE)
    expect(singulars.captured_piece.team).toBe(Board.BLACK)
    expect(singulars.enemy_moved_piece.team).toBe(Board.BLACK)
    expect(singulars.enemy_captured_piece.team).toBe(Board.WHITE)
  })

  it('initializes species_sets per chess rules — moved can be king, captured cannot, optional actors include null', () => {
    const combinedPlan = buildCombinedPlan([TRIVIAL_PLAN])
    const singulars = buildSingulars(combinedPlan)

    const allSpecies = [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]
    const capturable = [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]

    expect(singulars.moved_piece.species_set).toEqual(new Set(allSpecies))
    expect(singulars.captured_piece.species_set).toEqual(new Set([null, ...capturable]))
    expect(singulars.enemy_moved_piece.species_set).toEqual(new Set([null, ...allSpecies]))
    expect(singulars.enemy_captured_piece.species_set).toEqual(new Set([null, ...capturable]))
  })

  it('initializes each singular region as { kind: "all" }', () => {
    const combinedPlan = buildCombinedPlan([TRIVIAL_PLAN])
    const singulars = buildSingulars(combinedPlan)

    for (const key of ['moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece']) {
      expect(singulars[key].region).toEqual({ kind: 'all' })
    }
  })
})

describe('buildSingulars — position plan narrowing', () => {
  it('narrows singular region to qualifying squares when count > 0 on a position plan', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'position',
      subject: 'moved_piece', subjectFilter: 'any',
      positionAxis: 'rank', positionComparator: 'greater_than', positionTarget: 4,
      operator: 'count', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 0
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.region).toEqual({
      kind: 'set',
      squares: new Set(qualifyingSquares('rank', 'greater_than', 4, Board.WHITE))
    })
  })

  it('also narrows species_set to subjectSpeciesPool when count > 0 on a position plan with a filter', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'position',
      subject: 'moved_piece', subjectFilter: 'major',
      positionAxis: 'rank', positionComparator: 'greater_than', positionTarget: 4,
      operator: 'count', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 0
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.species_set).toEqual(new Set([Board.QUEEN, Board.ROOK]))
  })

  it('subtracts qualifying squares from singular region when count = 0 on a position plan', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'position',
      subject: 'moved_piece', subjectFilter: 'any',
      positionAxis: 'rank', positionComparator: 'greater_than', positionTarget: 4,
      operator: 'count', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 0
    }])
    const singulars = buildSingulars(combinedPlan)

    const excluded = new Set(qualifyingSquares('rank', 'greater_than', 4, Board.WHITE))
    expect(singulars.moved_piece.region.kind).toBe('set')
    for (const sq of excluded) {
      expect(singulars.moved_piece.region.squares.has(sq)).toBe(false)
    }
    expect(singulars.moved_piece.region.squares.size).toBe(64 - excluded.size)
  })
})

describe('buildSingulars — unary plan narrowing', () => {
  it('intersects species_set with subjectSpeciesPool when count > 0 on a unary plan', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'major',
      operator: 'count', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 0
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.species_set).toEqual(new Set([Board.QUEEN, Board.ROOK]))
  })

  it('subtracts subjectSpeciesPool from species_set when count = 0 on a unary plan, preserving null for optional actors', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'captured_piece', subjectFilter: 'major',
      operator: 'count', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 0
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.captured_piece.species_set).toEqual(new Set([null, Board.PAWN, Board.NIGHT, Board.BISHOP]))
  })
})

describe('buildSingulars — unary value narrowing on singular subject', () => {
  it('narrows species_set to species whose materialValue satisfies value > target', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'value', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 5
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.species_set).toEqual(new Set([Board.QUEEN]))
  })

  it('narrows species_set to species whose materialValue satisfies value = target (exact match)', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'value', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 3
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.species_set).toEqual(new Set([Board.NIGHT, Board.BISHOP]))
  })

  it('respects subjectFilter (major) intersected with value predicate', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'major',
      operator: 'value', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 5
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.species_set).toEqual(new Set([Board.QUEEN]))
  })
})

describe('buildSingulars — relational plan singular-side narrowing', () => {
  it('narrows the singular SUBJECT species_set by subjectFilter on a relational plan', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'enemy_moved_piece', subjectFilter: 'knight',
      operator: 'adjacent',
      target: 'allied', targetFilter: 'pawn'
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.enemy_moved_piece.species_set).toEqual(new Set([Board.NIGHT]))
  })

  it('narrows the singular TARGET species_set by targetFilter on a relational plan', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any',
      operator: 'attack',
      target: 'moved_piece', targetFilter: 'queen'
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.species_set).toEqual(new Set([Board.QUEEN]))
  })
})

describe('buildSingulars — relationsToAnchors population (cross-singular relational)', () => {
  it('records a relationsToAnchors entry on the lower-priority actor only', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'adjacent',
      target: 'enemy_moved_piece', targetFilter: 'any'
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.relationsToAnchors).toEqual([])
    expect(singulars.enemy_moved_piece.relationsToAnchors).toEqual([
      { otherActor: 'moved_piece', operator: 'adjacent', myRole: 'target' }
    ])
  })
})

describe('buildSingulars — same_piece aliasing', () => {
  it('aliases captured_piece and enemy_moved_piece into the same entry, with null excluded', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'captured_piece', subjectFilter: 'any',
      operator: 'same_piece',
      target: 'enemy_moved_piece', targetFilter: 'any'
    }])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.captured_piece).toBe(singulars.enemy_moved_piece)
    expect(singulars.captured_piece.species_set.has(null)).toBe(false)
  })
})

describe('buildSingulars — multi-plan accumulation', () => {
  it('intersects narrowings across multiple plans on the same singular', () => {
    const combinedPlan = buildCombinedPlan([
      {
        version: 2, kind: 'unary',
        subject: 'moved_piece', subjectFilter: 'major',
        operator: 'count', comparator: 'greater_than',
        target: 'exact_number', targetTotal: 0
      },
      {
        version: 2, kind: 'unary',
        subject: 'moved_piece', subjectFilter: 'queen',
        operator: 'count', comparator: 'greater_than',
        target: 'exact_number', targetTotal: 0
      }
    ])
    const singulars = buildSingulars(combinedPlan)

    expect(singulars.moved_piece.species_set).toEqual(new Set([Board.QUEEN]))
  })
})
