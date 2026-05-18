import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { satisfyAttackOrDefend, activeAttackOrDefendSets } from '../relations/attack_or_defend'
import { satisfyAdjacent, activeAdjacentSets } from '../relations/adjacent'
import { defaultTestCtx } from './_helpers'

function sq(file, rank) { return rank * 8 + file }
const D4 = sq(3, 3)
// random=0.5 makes chooseRelationVariant pick eligible[floor(0.5*2)] = index 1
// (the single moved/enemy variant) over eligible[0] = bystander.
const half = () => 0.5

function singular(team, species, position) {
  return {
    team,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([position]) }
  }
}

function side({ team, species, boundSingularActor = null }) {
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

describe('attack/defend — anchored moved/enemy participation', () => {
  it('moved_piece is recruited as SUBJECT (target placed on a square it controls)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.NIGHT, D4) } })
    const relation = {
      operator: 'attack',
      subjectSide: side({ team: Board.WHITE, species: Board.NIGHT }),
      targetSide: side({ team: Board.BLACK, species: Board.QUEEN })
    }
    const pieces = new Map([[D4, Board.WHITE + Board.NIGHT]])

    const result = satisfyAttackOrDefend(relation, pieces, ctx, half)

    expect(result).not.toBeNull()
    const { activeSubjects } = activeAttackOrDefendSets(relation, result)
    expect(activeSubjects.has(D4)).toBe(true) // the moved knight is the subject
  })

  it('enemy_moved_piece is recruited as TARGET (a subject placed controlling it)', () => {
    const ctx = defaultTestCtx({
      singulars: { enemy_moved_piece: singular(Board.BLACK, Board.QUEEN, D4) }
    })
    const relation = {
      operator: 'attack',
      subjectSide: side({ team: Board.WHITE, species: Board.NIGHT }),
      targetSide: side({ team: Board.BLACK, species: Board.QUEEN })
    }
    const pieces = new Map([[D4, Board.BLACK + Board.QUEEN]])

    const result = satisfyAttackOrDefend(relation, pieces, ctx, half)

    expect(result).not.toBeNull()
    const { activeTargets } = activeAttackOrDefendSets(relation, result)
    expect(activeTargets.has(D4)).toBe(true) // the moved enemy queen is the target
  })

  it('defend: moved_piece recruited as SUBJECT defending an allied target', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.NIGHT, D4) } })
    const relation = {
      operator: 'defend',
      subjectSide: side({ team: Board.WHITE, species: Board.NIGHT }),
      targetSide: side({ team: Board.WHITE, species: Board.ROOK })
    }
    const pieces = new Map([[D4, Board.WHITE + Board.NIGHT]])

    const result = satisfyAttackOrDefend(relation, pieces, ctx, half)

    expect(result).not.toBeNull()
    const { activeSubjects } = activeAttackOrDefendSets(relation, result)
    expect(activeSubjects.has(D4)).toBe(true)
  })

  it('bystander variant (random=0) leaves the existing path behavior intact', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.NIGHT, D4) } })
    const relation = {
      operator: 'attack',
      subjectSide: side({ team: Board.WHITE, species: Board.NIGHT }),
      targetSide: side({ team: Board.BLACK, species: Board.QUEEN })
    }
    const pieces = new Map([[D4, Board.WHITE + Board.NIGHT]])

    // random=0 -> chooseRelationVariant returns bystander; satisfier still
    // satisfies via the pre-existing tryPlace path (non-null).
    const result = satisfyAttackOrDefend(relation, pieces, ctx, () => 0)
    expect(result).not.toBeNull()
  })
})

describe('adjacent — anchored moved/enemy participation', () => {
  it('moved_piece is recruited as SUBJECT (target placed adjacent to it)', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.BISHOP, D4) } })
    const relation = {
      operator: 'adjacent',
      subjectSide: side({ team: Board.WHITE, species: Board.BISHOP }),
      targetSide: side({ team: Board.BLACK, species: Board.QUEEN })
    }
    const pieces = new Map([[D4, Board.WHITE + Board.BISHOP]])

    const result = satisfyAdjacent(relation, pieces, ctx, half)

    expect(result).not.toBeNull()
    const { activeSubjects } = activeAdjacentSets(relation, result)
    expect(activeSubjects.has(D4)).toBe(true)
  })

  it('enemy_moved_piece is recruited as TARGET (a subject placed adjacent to it)', () => {
    const ctx = defaultTestCtx({
      singulars: { enemy_moved_piece: singular(Board.BLACK, Board.QUEEN, D4) }
    })
    const relation = {
      operator: 'adjacent',
      subjectSide: side({ team: Board.WHITE, species: Board.BISHOP }),
      targetSide: side({ team: Board.BLACK, species: Board.QUEEN })
    }
    const pieces = new Map([[D4, Board.BLACK + Board.QUEEN]])

    const result = satisfyAdjacent(relation, pieces, ctx, half)

    expect(result).not.toBeNull()
    const { activeTargets } = activeAdjacentSets(relation, result)
    expect(activeTargets.has(D4)).toBe(true)
  })
})
