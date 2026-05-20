import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import {
  cloneSingular, feasibleRelationSlots, bindingFeasible
} from '../moved_binding'
import { defaultTestCtx } from './_helpers'

function sq(file, rank) { return rank * 8 + file }

function movedSingular(species, position = null) {
  return {
    team: Board.WHITE,
    species_set: new Set(Array.isArray(species) ? species : [species]),
    region: position === null
      ? { kind: 'all' }
      : { kind: 'set', squares: new Set([position]) },
    priorRegion: { kind: 'all' }
  }
}

function relation(operator, subjectSpecies, subjectTeam, targetSpecies, targetTeam) {
  const side = (team, species) => ({
    team,
    species_set: new Set(Array.isArray(species) ? species : [species]),
    region: { kind: 'all' },
    boundSingularActor: null,
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity }
  })
  return {
    operator,
    subjectSide: side(subjectTeam, subjectSpecies),
    targetSide: side(targetTeam, targetSpecies),
    sourcePlan: { tag: `${operator}-${subjectSpecies}-${targetSpecies}` }
  }
}

describe('cloneSingular', () => {
  it('deep-copies species_set and regions so mutation does not touch the original', () => {
    const s = movedSingular(Board.NIGHT, sq(2, 3))
    const c = cloneSingular(s)

    c.species_set.delete(Board.NIGHT)
    c.region.squares.add(sq(0, 0))

    expect(s.species_set.has(Board.NIGHT)).toBe(true)
    expect(s.region.squares.has(sq(0, 0))).toBe(false)
    expect(c.priorRegion).toEqual(s.priorRegion)
  })
})

describe('feasibleRelationSlots', () => {
  it('emits a (sourcePlan, role) slot for each side moved_piece is team+species eligible for', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.BISHOP]) },
      relations: [
        relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK), // subject eligible
        relation('defend', Board.BISHOP, Board.WHITE, Board.ROOK, Board.WHITE)   // subject+target both white
      ]
    })
    const slots = feasibleRelationSlots(ctx)
    const keyed = slots.map(s => `${s.sourcePlan.tag}:${s.role}`)

    expect(keyed).toContain('attack-N-Q:subject')   // moved is white knight → attack subject
    expect(keyed).toContain('defend-B-R:subject')    // moved is white bishop → defend subject
    expect(keyed).not.toContain('attack-N-Q:target') // target is black; moved is white
  })

  it('excludes a side on team mismatch and on empty species intersection', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.PAWN) },
      relations: [relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)]
    })
    expect(feasibleRelationSlots(ctx)).toEqual([])
  })
})

describe('bindingFeasible (Tier-1 oracle)', () => {
  it('true for a single slot whose species/region intersect the narrowed moved singular', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.BISHOP]) },
      relations: [relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)]
    })
    const [slot] = feasibleRelationSlots(ctx)
    expect(bindingFeasible([slot], ctx)).toBe(true)
  })

  it('false for a multi-slot set whose species intersection is empty', () => {
    // moved can be knight OR bishop; one slot demands knight, the other bishop —
    // jointly impossible for a single piece.
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.BISHOP]) },
      relations: [
        relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK),
        relation('defend', Board.BISHOP, Board.WHITE, Board.ROOK, Board.WHITE)
      ]
    })
    const slots = feasibleRelationSlots(ctx)
    const subjectSlots = slots.filter(s => s.role === 'subject')
    expect(subjectSlots.length).toBe(2)
    expect(bindingFeasible(subjectSlots, ctx)).toBe(false)
  })

  it('true for a feasible double-duty set (one species satisfies both slots)', () => {
    // Both slots admit ROOK; moved can be a rook → jointly feasible.
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.ROOK]) },
      relations: [
        relation('attack', [Board.ROOK, Board.QUEEN], Board.WHITE, Board.PAWN, Board.BLACK),
        relation('defend', [Board.ROOK, Board.BISHOP], Board.WHITE, Board.KING, Board.WHITE)
      ]
    })
    const subjectSlots = feasibleRelationSlots(ctx).filter(s => s.role === 'subject')
    expect(subjectSlots.length).toBe(2)
    expect(bindingFeasible(subjectSlots, ctx)).toBe(true)
  })

  it('the empty set (bystander) is always feasible', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT]) },
      relations: [relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)]
    })
    expect(bindingFeasible([], ctx)).toBe(true)
  })
})

import { chooseMovedBinding, roleForPlan } from '../moved_binding'

function ctxWith(...specs) {
  return defaultTestCtx({
    singulars: { moved_piece: movedSingular([Board.NIGHT, Board.ROOK]) },
    relations: specs
  })
}

describe('chooseMovedBinding', () => {
  it('returns an empty (bystander) binding when there are no feasible slots', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.PAWN) },
      relations: [relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)]
    })
    const b = chooseMovedBinding(ctx, () => 0.5)
    expect(b.assignments).toEqual([])
  })

  it('only ever returns a jointly Tier-1-feasible assignment set', () => {
    // Two mutually-exclusive subject species (knight vs rook-only); a correct
    // chooser must never bind both.
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.ROOK]) },
      relations: [
        relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK),
        relation('defend', Board.ROOK, Board.WHITE, Board.KING, Board.WHITE)
      ]
    })
    for (let i = 0; i < 50; i += 1) {
      const r = (i + 0.5) / 50
      const b = chooseMovedBinding(ctx, () => r)
      expect(bindingFeasible(b.assignments, ctx)).toBe(true)
    }
  })

  it('is deterministic for a given random source', () => {
    const ctx = ctxWith(relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK))
    const a = chooseMovedBinding(ctx, () => 0.5)
    const b = chooseMovedBinding(ctx, () => 0.5)
    expect(a.assignments.map(x => `${x.sourcePlan.tag}:${x.role}`))
      .toEqual(b.assignments.map(x => `${x.sourcePlan.tag}:${x.role}`))
  })

  it('bystander stays reachable as relations compound (random=0 picks bystander)', () => {
    const ctx = ctxWith(
      relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK),
      relation('defend', Board.ROOK, Board.WHITE, Board.KING, Board.WHITE),
      relation('adjacent', Board.NIGHT, Board.WHITE, Board.PAWN, Board.BLACK)
    )
    expect(chooseMovedBinding(ctx, () => 0).assignments).toEqual([])
  })

  it('can produce a multi-slot (double-duty) binding when feasible', () => {
    // Both subject slots admit ROOK; moved is a rook → double-duty feasible.
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.ROOK]) },
      relations: [
        relation('attack', [Board.ROOK, Board.QUEEN], Board.WHITE, Board.PAWN, Board.BLACK),
        relation('defend', [Board.ROOK, Board.BISHOP], Board.WHITE, Board.KING, Board.WHITE)
      ]
    })
    let sawMulti = false
    for (let i = 0; i < 50; i += 1) {
      const b = chooseMovedBinding(ctx, () => (i + 0.5) / 50)
      expect(bindingFeasible(b.assignments, ctx)).toBe(true)
      if (b.assignments.length >= 2) { sawMulti = true }
    }
    expect(sawMulti).toBe(true)
  })

  it('roleForPlan looks up the bound role for a relation, or null', () => {
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = ctxWith(rel)
    const b = chooseMovedBinding(ctx, () => 0.99) // drive toward binding, not bystander
    if (b.assignments.length) {
      expect(roleForPlan(b, rel.sourcePlan)).toBe('subject')
    }
    expect(roleForPlan(b, { tag: 'absent' })).toBe(null)
  })
})

import { movedSpeciesPool } from '../moved_binding'

describe('movedSpeciesPool', () => {
  it('returns the singular species_set unchanged when there is no binding', () => {
    const ctx = ctxWith(relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK))
    ctx.movedBinding = { assignments: [] }
    const pool = movedSpeciesPool(ctx.singulars.moved_piece, ctx)
    expect(pool).toEqual(new Set([Board.NIGHT, Board.ROOK]))
  })

  it('intersects the singular species_set with each bound role side', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.ROOK]) },
      relations: [relation('attack', [Board.ROOK, Board.QUEEN], Board.WHITE, Board.PAWN, Board.BLACK)]
    })
    const slot = feasibleRelationSlots(ctx).find(s => s.role === 'subject')
    ctx.movedBinding = { assignments: [slot] }
    expect(movedSpeciesPool(ctx.singulars.moved_piece, ctx)).toEqual(new Set([Board.ROOK]))
  })
})
