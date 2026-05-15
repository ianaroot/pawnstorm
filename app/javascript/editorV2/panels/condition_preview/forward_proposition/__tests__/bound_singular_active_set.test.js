import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { satisfyAttackOrDefend } from 'editorV2/panels/condition_preview/forward_proposition/relations/attack_or_defend'
import { satisfyAdjacent } from 'editorV2/panels/condition_preview/forward_proposition/relations/adjacent'
import { defaultTestCtx } from './_helpers'

function sq(file, rank) { return rank * 8 + file }
const noopRandom = () => 0.5

function singular(team, species, position) {
  return {
    team,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([position]) },
    relationsToAnchors: []
  }
}

function relationSide({ team, species, boundSingularActor = null }) {
  return {
    team,
    species_set: new Set(Array.isArray(species) ? species : [species]),
    region: { kind: 'all' },
    boundSingularActor,
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity }
  }
}

describe('attackOrDefendRequirementsMet honors bound singular subject', () => {
  it('RED: declines success when bound singular subject is not in active set even if another piece is', () => {
    const movedPos = sq(2, 3)   // c4 — white pawn here attacks b5/d5, NOT e4
    const otherPawnPos = sq(3, 2) // d3 — white pawn here attacks c4/e4
    const queenPos = sq(4, 3)   // e4
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular('W', 'P', movedPos) }
    })
    const relation = {
      operator: 'attack',
      subjectSide: relationSide({ team: 'W', species: 'P', boundSingularActor: 'moved_piece' }),
      targetSide:  relationSide({ team: 'B', species: 'Q' })
    }
    const pieces = new Map([
      [movedPos,      'WP'],
      [otherPawnPos,  'WP'],
      [queenPos,      'BQ']
    ])
    const result = satisfyAttackOrDefend(relation, pieces, ctx, noopRandom)
    // With bug: satisfier sees activeSubjects={d3}, declares done, returns pieces unchanged.
    // After fix: bound singular (c4) not in active set, so requirements NOT met.
    //   The satisfier can't move moved_piece into attack position, so returns null.
    expect(result).not.toBe(pieces)
  })

  it('GREEN: succeeds when bound singular subject IS in the active set', () => {
    const movedPos = sq(3, 2)   // d3 — attacks e4
    const queenPos = sq(4, 3)   // e4
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular('W', 'P', movedPos) }
    })
    const relation = {
      operator: 'attack',
      subjectSide: relationSide({ team: 'W', species: 'P', boundSingularActor: 'moved_piece' }),
      targetSide:  relationSide({ team: 'B', species: 'Q' })
    }
    const pieces = new Map([[movedPos, 'WP'], [queenPos, 'BQ']])
    const result = satisfyAttackOrDefend(relation, pieces, ctx, noopRandom)
    expect(result).toBe(pieces)
  })

  it('GREEN: when subject side is not bound, population-style satisfaction works', () => {
    const otherPawnPos = sq(3, 2) // d3 — attacks e4
    const queenPos = sq(4, 3)    // e4
    const ctx = defaultTestCtx({})
    const relation = {
      operator: 'attack',
      subjectSide: relationSide({ team: 'W', species: 'P' }),  // no boundSingularActor
      targetSide:  relationSide({ team: 'B', species: 'Q' })
    }
    const pieces = new Map([[otherPawnPos, 'WP'], [queenPos, 'BQ']])
    const result = satisfyAttackOrDefend(relation, pieces, ctx, noopRandom)
    expect(result).toBe(pieces)
  })
})

describe('adjacentRequirementsMet honors bound singular subject', () => {
  it('RED: declines success when bound singular subject is not in active set even if another piece is', () => {
    const movedPos = sq(0, 0)        // a1 — not adjacent to e4
    const otherPos = sq(3, 3)        // d4 — adjacent to e4
    const targetPos = sq(4, 3)       // e4
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular('W', 'P', movedPos) }
    })
    const relation = {
      operator: 'adjacent',
      subjectSide: relationSide({ team: 'W', species: 'P', boundSingularActor: 'moved_piece' }),
      targetSide:  relationSide({ team: 'B', species: 'Q' })
    }
    const pieces = new Map([[movedPos, 'WP'], [otherPos, 'WP'], [targetPos, 'BQ']])
    const result = satisfyAdjacent(relation, pieces, ctx, noopRandom)
    expect(result).not.toBe(pieces)
  })

  it('GREEN: succeeds when bound singular subject IS adjacent to target', () => {
    const movedPos = sq(3, 3)   // d4 — adjacent to e4
    const targetPos = sq(4, 3)  // e4
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular('W', 'P', movedPos) }
    })
    const relation = {
      operator: 'adjacent',
      subjectSide: relationSide({ team: 'W', species: 'P', boundSingularActor: 'moved_piece' }),
      targetSide:  relationSide({ team: 'B', species: 'Q' })
    }
    const pieces = new Map([[movedPos, 'WP'], [targetPos, 'BQ']])
    const result = satisfyAdjacent(relation, pieces, ctx, noopRandom)
    expect(result).toBe(pieces)
  })

  it('GREEN: when subject side is not bound, population-style adjacency works', () => {
    const otherPos = sq(3, 3)   // d4 — adjacent to e4
    const targetPos = sq(4, 3)  // e4
    const ctx = defaultTestCtx({})
    const relation = {
      operator: 'adjacent',
      subjectSide: relationSide({ team: 'W', species: 'P' }),
      targetSide:  relationSide({ team: 'B', species: 'Q' })
    }
    const pieces = new Map([[otherPos, 'WP'], [targetPos, 'BQ']])
    const result = satisfyAdjacent(relation, pieces, ctx, noopRandom)
    expect(result).toBe(pieces)
  })
})
