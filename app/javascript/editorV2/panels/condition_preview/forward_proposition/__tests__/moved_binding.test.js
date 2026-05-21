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

describe('feasibleRelationSlots — shield attacker slot', () => {
  it('emits an attacker slot for a shield relation when moved_piece is opposing-team and slider', () => {
    // shield subject is allied (white), so attacker is black; moved_piece is black queen.
    const ctx = defaultTestCtx({
      singulars: { moved_piece: { ...movedSingular(Board.QUEEN), team: Board.BLACK } },
      relations: [{
        operator: 'shield',
        subjectSide: { team: Board.WHITE, species_set: new Set([Board.BISHOP]), region: { kind: 'all' } },
        targetSide: { team: Board.WHITE, species_set: new Set([Board.KING]), region: { kind: 'all' } },
        sourcePlan: { tag: 'shield-plan' }
      }]
    })
    const slots = feasibleRelationSlots(ctx)
    const attackerSlot = slots.find(s => s.role === 'attacker')
    expect(attackerSlot).toBeDefined()
    expect(attackerSlot.sourcePlan).toEqual({ tag: 'shield-plan' })
    expect(attackerSlot.side.team).toBe(Board.BLACK)
    expect(attackerSlot.side.species_set.has(Board.QUEEN)).toBe(true)
    expect(attackerSlot.side.species_set.has(Board.ROOK)).toBe(true)
    expect(attackerSlot.side.species_set.has(Board.BISHOP)).toBe(true)
    expect(attackerSlot.side.species_set.has(Board.NIGHT)).toBe(false)
  })

  it('does not emit an attacker slot for a shield relation when moved_piece is on the shielder team', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.QUEEN) }, // white queen
      relations: [{
        operator: 'shield',
        subjectSide: { team: Board.WHITE, species_set: new Set([Board.BISHOP]), region: { kind: 'all' } },
        targetSide: { team: Board.WHITE, species_set: new Set([Board.KING]), region: { kind: 'all' } },
        sourcePlan: { tag: 'shield-plan' }
      }]
    })
    const slots = feasibleRelationSlots(ctx)
    expect(slots.find(s => s.role === 'attacker')).toBeUndefined()
  })

  it('does not emit an attacker slot when moved_piece species_set contains no sliders', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: { ...movedSingular(Board.NIGHT), team: Board.BLACK } },
      relations: [{
        operator: 'shield',
        subjectSide: { team: Board.WHITE, species_set: new Set([Board.BISHOP]), region: { kind: 'all' } },
        targetSide: { team: Board.WHITE, species_set: new Set([Board.KING]), region: { kind: 'all' } },
        sourcePlan: { tag: 'shield-plan' }
      }]
    })
    const slots = feasibleRelationSlots(ctx)
    expect(slots.find(s => s.role === 'attacker')).toBeUndefined()
  })

  it('does not emit an attacker slot for non-shield relations', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: { ...movedSingular(Board.QUEEN), team: Board.BLACK } },
      relations: [relation('attack', Board.QUEEN, Board.WHITE, Board.PAWN, Board.BLACK)]
    })
    const slots = feasibleRelationSlots(ctx)
    expect(slots.find(s => s.role === 'attacker')).toBeUndefined()
  })
})

describe('bindingFeasible — attacker slot', () => {
  it('narrows moved_piece species_set to slider species when attacker slot is in the set', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: { ...movedSingular([Board.QUEEN, Board.NIGHT]), team: Board.BLACK } },
      relations: [{
        operator: 'shield',
        subjectSide: { team: Board.WHITE, species_set: new Set([Board.BISHOP]), region: { kind: 'all' } },
        targetSide: { team: Board.WHITE, species_set: new Set([Board.KING]), region: { kind: 'all' } },
        sourcePlan: { tag: 'shield-plan' }
      }]
    })
    const slots = feasibleRelationSlots(ctx)
    const attackerSlot = slots.find(s => s.role === 'attacker')
    expect(bindingFeasible([attackerSlot], ctx)).toBe(true)
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

  it('bystander stays reachable as relations compound', () => {
    const ctx = ctxWith(
      relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK),
      relation('defend', Board.ROOK, Board.WHITE, Board.KING, Board.WHITE),
      relation('adjacent', Board.NIGHT, Board.WHITE, Board.PAWN, Board.BLACK)
    )
    let sawBystander = false
    for (let i = 0; i < 50; i += 1) {
      const b = chooseMovedBinding(ctx, () => (i + 0.5) / 50)
      if (b.assignments.length === 0) { sawBystander = true; break }
    }
    expect(sawBystander).toBe(true)
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
    const ctx = { movedBinding: { assignments: [{ sourcePlan: rel.sourcePlan, role: 'subject' }] } }
    expect(roleForPlan(ctx, rel.sourcePlan)).toBe('subject')
    expect(roleForPlan(ctx, { tag: 'absent' })).toBe(null)
  })
})

import { movedSpeciesPool } from '../moved_binding'

describe('movedSpeciesPool', () => {
  it('returns the singular species_set unchanged when there is no binding', () => {
    const ctx = ctxWith(relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK))
    ctx.movedBinding = { assignments: [] }
    const pool = movedSpeciesPool(ctx)
    expect(pool).toEqual(new Set([Board.NIGHT, Board.ROOK]))
  })

  it('intersects the singular species_set with each bound role side', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.ROOK]) },
      relations: [relation('attack', [Board.ROOK, Board.QUEEN], Board.WHITE, Board.PAWN, Board.BLACK)]
    })
    const slot = feasibleRelationSlots(ctx).find(s => s.role === 'subject')
    ctx.movedBinding = { assignments: [slot] }
    expect(movedSpeciesPool(ctx)).toEqual(new Set([Board.ROOK]))
  })
})

import { feasibleRelatedToSlots } from '../moved_binding'

// related-to proposition: emitted for the non-singular side of a bound
// relational plan; its region points to the singular anchor (moved_piece).
// `sourcePlan` is the originating plan reference (defaults to a fresh object
// per call so each prop's plan is distinct unless an explicit ref is passed).
function relatedToProp(role, counterpart, operator = 'attack', sourcePlan = {}) {
  return {
    team: counterpart.team,
    frame: 'current',
    species_set: new Set(Array.isArray(counterpart.species) ? counterpart.species : [counterpart.species]),
    region: { kind: 'related-to', actor: 'moved_piece', role, operator },
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity },
    sourcePlan
  }
}

describe('feasibleRelatedToSlots', () => {
  it('returns empty when no related-to proposition anchors on moved_piece', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: []
    })
    expect(feasibleRelatedToSlots(ctx)).toEqual([])
  })

  it('emits a slot for each related-to proposition with region.actor === moved_piece', () => {
    const p1 = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const p2 = relatedToProp('subject', { team: Board.WHITE, species: Board.ROOK }, 'defend')
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p1, p2]
    })
    const slots = feasibleRelatedToSlots(ctx)
    expect(slots).toHaveLength(2)
    expect(slots[0].sourcePlan).toBe(p1.sourcePlan)
    expect(slots[0].role).toBe('target')
    expect(slots[0].kind).toBe('related-to')
    expect(slots[1].sourcePlan).toBe(p2.sourcePlan)
    expect(slots[1].role).toBe('subject')
  })

  it('keys slot.sourcePlan by the proposition\'s sourcePlan (the plan reference)', () => {
    const planRef = { tag: 'forced-plan' }
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN }, 'attack', planRef)
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    const [slot] = feasibleRelatedToSlots(ctx)
    expect(slot.sourcePlan).toBe(planRef)
    expect(slot.sourcePlan).not.toBe(p)
  })

  it('excludes related-to propositions anchored on other actors', () => {
    const p = {
      team: Board.WHITE, frame: 'current',
      species_set: new Set([Board.PAWN]),
      region: { kind: 'related-to', actor: 'enemy_moved_piece', role: 'target', operator: 'attack' },
      count_range: { min: 1, max: Infinity },
      aggregate_value_range: { min: 0, max: Infinity },
      aggregate_mobility_range: { min: 0, max: Infinity }
    }
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    expect(feasibleRelatedToSlots(ctx)).toEqual([])
  })

  it('excludes non-related-to propositions', () => {
    const p = {
      team: Board.WHITE, frame: 'current',
      species_set: new Set([Board.PAWN]),
      region: { kind: 'all' },
      count_range: { min: 1, max: Infinity },
      aggregate_value_range: { min: 0, max: Infinity },
      aggregate_mobility_range: { min: 0, max: Infinity }
    }
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    expect(feasibleRelatedToSlots(ctx)).toEqual([])
  })
})

describe('chooseMovedBinding — forced related-to bindings', () => {
  it('always seeds the forced related-to slot regardless of random', () => {
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    expect(chooseMovedBinding(ctx, () => 0).assignments.map(a => a.sourcePlan)).toContain(p.sourcePlan)
    expect(chooseMovedBinding(ctx, () => 0.99).assignments.map(a => a.sourcePlan)).toContain(p.sourcePlan)
  })

  it('layers optional relation slots on top of forced related-to', () => {
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p],
      relations: [rel]
    })
    let sawLayered = false
    for (let i = 0; i < 50; i += 1) {
      const b = chooseMovedBinding(ctx, () => (i + 0.5) / 50)
      const refs = b.assignments.map(a => a.sourcePlan)
      expect(refs).toContain(p.sourcePlan)
      if (refs.includes(rel.sourcePlan)) { sawLayered = true }
    }
    expect(sawLayered).toBe(true)
  })

  it('returns only the forced related-to when no relation slots exist', () => {
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    expect(chooseMovedBinding(ctx, () => 0).assignments.map(a => a.sourcePlan)).toEqual([p.sourcePlan])
  })

  it('roleForPlan resolves a forced related-to binding by plan reference', () => {
    const planRef = { tag: 'forced-plan' }
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN }, 'attack', planRef)
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    ctx.movedBinding = chooseMovedBinding(ctx, () => 0.5)
    expect(roleForPlan(ctx, planRef)).toBe('target')
  })
})

import { bindingComboKey, enumerateFeasibleBindings } from '../moved_binding'

describe('chooseMovedBinding — coverage-record-driven weighting', () => {
  function ctxFor(rel) {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      relations: [rel]
    })
    ctx.combinedPlan = { plans: [rel.sourcePlan] }
    return ctx
  }

  it('excludes a shape whose coverage weight is 0', () => {
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = ctxFor(rel)
    const record = {
      weightFor: (_scenario, key) => key === '' ? 1 : 0  // freeze single-slot, keep bystander
    }
    for (let i = 0; i < 50; i += 1) {
      const b = chooseMovedBinding(ctx, () => (i + 0.5) / 50, record, 'standard')
      expect(b.assignments.length).toBe(0)
    }
  })

  it('always picks the only non-zero-weight shape', () => {
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = ctxFor(rel)
    const record = {
      weightFor: (_scenario, key) => key === '0:subject' ? 1 : 0
    }
    for (let i = 0; i < 50; i += 1) {
      const b = chooseMovedBinding(ctx, () => (i + 0.5) / 50, record, 'standard')
      expect(b.assignments.length).toBe(1)
      expect(b.assignments[0].role).toBe('subject')
    }
  })

  it('falls back to uniform pick when all weights are 0', () => {
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = ctxFor(rel)
    const record = { weightFor: () => 0 }
    let sawBystander = false
    let sawSingle = false
    for (let i = 0; i < 50; i += 1) {
      const b = chooseMovedBinding(ctx, () => (i + 0.5) / 50, record, 'standard')
      if (b.assignments.length === 0) { sawBystander = true }
      else { sawSingle = true }
    }
    expect(sawBystander).toBe(true)
    expect(sawSingle).toBe(true)
  })

  it('passes scenarioName through to weightFor', () => {
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = ctxFor(rel)
    const seen = new Set()
    const record = {
      weightFor: (scenario) => { seen.add(scenario); return 1 }
    }
    chooseMovedBinding(ctx, () => 0.5, record, 'castle')
    expect(seen.has('castle')).toBe(true)
  })

  it('preserves uniform-pick behavior when coverageRecord is null', () => {
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = ctxFor(rel)
    let sawBystander = false
    let sawSingle = false
    for (let i = 0; i < 50; i += 1) {
      const b = chooseMovedBinding(ctx, () => (i + 0.5) / 50, null, null)
      if (b.assignments.length === 0) { sawBystander = true }
      else { sawSingle = true }
    }
    expect(sawBystander).toBe(true)
    expect(sawSingle).toBe(true)
  })
})

describe('bindingComboKey', () => {
  it('returns the empty string for an empty (bystander) binding', () => {
    const plan = { tag: 'p0' }
    const combinedPlan = { plans: [plan] }
    expect(bindingComboKey({ assignments: [] }, combinedPlan)).toBe('')
  })

  it('encodes a single slot as <planIndex>:<role>', () => {
    const plan = { tag: 'p0' }
    const combinedPlan = { plans: [plan] }
    const binding = { assignments: [{ sourcePlan: plan, role: 'subject' }] }
    expect(bindingComboKey(binding, combinedPlan)).toBe('0:subject')
  })

  it('joins multiple pairs with "|" in canonical sorted order', () => {
    const p0 = { tag: 'p0' }
    const p1 = { tag: 'p1' }
    const combinedPlan = { plans: [p0, p1] }
    const binding = { assignments: [
      { sourcePlan: p1, role: 'subject' },
      { sourcePlan: p0, role: 'target' }
    ] }
    expect(bindingComboKey(binding, combinedPlan)).toBe('0:target|1:subject')
  })

  it('dedupes pairs: same (plan, role) appears once even if multiple slots back it', () => {
    // PBS-bound related-to: priorProp and currentProp both surface a slot
    // for the same plan + role. Shape key collapses them to one pair so the
    // PBS-bound and non-PBS-bound variants of the same logical relation share
    // the same shape key.
    const plan = { tag: 'p0' }
    const combinedPlan = { plans: [plan] }
    const binding = { assignments: [
      { sourcePlan: plan, role: 'target', kind: 'related-to' },
      { sourcePlan: plan, role: 'target', kind: 'related-to' }
    ] }
    expect(bindingComboKey(binding, combinedPlan)).toBe('0:target')
  })

  it('uses planIndex 0 for the first plan in combinedPlan.plans', () => {
    const p0 = { tag: 'p0' }
    const p1 = { tag: 'p1' }
    const p2 = { tag: 'p2' }
    const combinedPlan = { plans: [p0, p1, p2] }
    const binding = { assignments: [{ sourcePlan: p2, role: 'subject' }] }
    expect(bindingComboKey(binding, combinedPlan)).toBe('2:subject')
  })
})

describe('enumerateFeasibleBindings', () => {
  it('returns just the empty binding when there are no feasible slots', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.PAWN) },
      relations: [relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)]
    })
    const bindings = enumerateFeasibleBindings(ctx)
    expect(bindings).toHaveLength(1)
    expect(bindings[0].assignments).toEqual([])
  })

  it('returns 2 bindings (bystander + single-slot) for one feasible optional slot', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      relations: [relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)]
    })
    const bindings = enumerateFeasibleBindings(ctx)
    expect(bindings.map(b => b.assignments.length).sort()).toEqual([0, 1])
  })

  it('returns 4 bindings (empty, A, B, AB) for two jointly-feasible optional slots', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.ROOK]) },
      relations: [
        relation('attack', [Board.ROOK, Board.QUEEN], Board.WHITE, Board.PAWN, Board.BLACK),
        relation('defend', [Board.ROOK, Board.BISHOP], Board.WHITE, Board.KING, Board.WHITE)
      ]
    })
    const bindings = enumerateFeasibleBindings(ctx)
    // 2 relations × 2 sides each — but only the subject side is moved_piece
    // eligible (target sides are wrong team or species). So 2 optional slots → 4 subsets.
    const subjectSlotCounts = bindings.map(b => b.assignments.filter(a => a.role === 'subject').length).sort()
    expect(subjectSlotCounts).toEqual([0, 1, 1, 2])
  })

  it('omits the joint binding when slots are mutually infeasible', () => {
    // moved can be knight OR bishop; slot A demands knight, slot B demands bishop.
    // Jointly infeasible for one piece → enumerated set is {empty, A, B}, no AB.
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.BISHOP]) },
      relations: [
        relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK),
        relation('defend', Board.BISHOP, Board.WHITE, Board.ROOK, Board.WHITE)
      ]
    })
    const bindings = enumerateFeasibleBindings(ctx)
    const lens = bindings.map(b => b.assignments.length).sort()
    expect(lens).toEqual([0, 1, 1])
  })

  it('always includes forced related-to slots in every enumerated binding', () => {
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p],
      relations: [rel]
    })
    const bindings = enumerateFeasibleBindings(ctx)
    for (const b of bindings) {
      expect(b.assignments.map(a => a.sourcePlan)).toContain(p.sourcePlan)
    }
  })

  it('returns just the forced binding when no optional relation slots exist', () => {
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    const bindings = enumerateFeasibleBindings(ctx)
    expect(bindings).toHaveLength(1)
    expect(bindings[0].assignments.map(a => a.sourcePlan)).toEqual([p.sourcePlan])
  })

  it('places the minimum binding (bystander or forced-only) first in the returned list', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular([Board.NIGHT, Board.ROOK]) },
      relations: [
        relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK),
        relation('defend', Board.ROOK, Board.WHITE, Board.KING, Board.WHITE)
      ]
    })
    const bindings = enumerateFeasibleBindings(ctx)
    expect(bindings[0].assignments).toEqual([])
  })
})

describe('bindingFeasible — related-to slots', () => {
  it('treats related-to slots as feasible without narrowing moved_piece species/region', () => {
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p]
    })
    const [slot] = feasibleRelatedToSlots(ctx)
    expect(bindingFeasible([slot], ctx)).toBe(true)
  })

  it('combines related-to + relation slots without spurious narrowing', () => {
    const p = relatedToProp('target', { team: Board.BLACK, species: Board.QUEEN })
    const rel = relation('attack', Board.NIGHT, Board.WHITE, Board.QUEEN, Board.BLACK)
    const ctx = defaultTestCtx({
      singulars: { moved_piece: movedSingular(Board.NIGHT) },
      propositions: [p],
      relations: [rel]
    })
    const relSlot = feasibleRelationSlots(ctx).find(s => s.role === 'subject')
    const relatedSlot = feasibleRelatedToSlots(ctx)[0]
    expect(bindingFeasible([relatedSlot, relSlot], ctx)).toBe(true)
  })
})
