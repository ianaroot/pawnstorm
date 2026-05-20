import { intersectRegions } from './region'

// Decides which relation roles moved_piece fills this attempt (possibly
// none). The same decision drives the species commit and the relation
// satisfiers, so they agree.

const POOL_ACTOR = 'moved_piece'

export function cloneSingular(singular) {
  return {
    team: singular.team,
    species_set: new Set(singular.species_set),
    region: cloneRegion(singular.region),
    priorRegion: cloneRegion(singular.priorRegion)
  }
}

function cloneRegion(region) {
  if (!region) { return region }
  if (region.kind === 'set') {
    return { kind: 'set', squares: new Set(region.squares) }
  }
  return { ...region }
}

function regionEmpty(region) {
  return region != null && region.kind === 'set' && region.squares.size === 0
}

function intersectInto(speciesSet, other) {
  for (const s of [...speciesSet]) {
    if (!other.has(s)) { speciesSet.delete(s) }
  }
}

function speciesOverlap(a, b) {
  for (const s of a) { if (b.has(s)) { return true } }
  return false
}

export function feasibleRelationSlots(ctx) {
  const moved = ctx?.singulars?.[POOL_ACTOR]
  if (!moved) { return [] }
  const slots = []
  for (const relation of ctx.relations ?? []) {
    for (const role of ['subject', 'target']) {
      const side = role === 'subject' ? relation.subjectSide : relation.targetSide
      if (side.team !== moved.team) { continue }
      if (!speciesOverlap(side.species_set, moved.species_set)) { continue }
      slots.push({ sourcePlan: relation.sourcePlan, role, side })
    }
  }
  return slots
}

// Whether a single moved_piece could satisfy every slot in `set` at once,
// judged only on species/region overlap (not placement geometry).
export function bindingFeasible(set, ctx) {
  const moved = ctx?.singulars?.[POOL_ACTOR]
  if (!moved) { return set.length === 0 }
  const probe = cloneSingular(moved)
  for (const slot of set) {
    intersectInto(probe.species_set, slot.side.species_set)
    if (probe.species_set.size === 0) { return false }
    probe.region = intersectRegions(probe.region, slot.side.region)
    if (regionEmpty(probe.region)) { return false }
  }
  return true
}

// Grows the set one feasible slot at a time. The chance of stopping (leaving
// moved_piece a bystander) is held roughly steady no matter how many
// relations the chain has, instead of shrinking as more slots appear.
export function chooseMovedBinding(ctx, random) {
  const all = feasibleRelationSlots(ctx)
  const chosen = []
  const remaining = all.slice()
  for (;;) {
    const addable = remaining.filter(slot => bindingFeasible([...chosen, slot], ctx))
    if (addable.length === 0) { break }
    // bystander entries first so random()===0 stops; one per addable slot,
    // keeping stop and continue evenly balanced each step.
    const options = [...addable.map(() => null), ...addable]
    const pick = options[Math.floor(random() * options.length)]
    if (pick === null) { break }
    chosen.push(pick)
    remaining.splice(remaining.indexOf(pick), 1)
  }
  return { assignments: chosen }
}

export function movedSpeciesPool(singular, ctx) {
  const pool = new Set(singular.species_set)
  for (const a of ctx?.movedBinding?.assignments ?? []) {
    intersectInto(pool, a.side.species_set)
  }
  return pool.size === 0 ? new Set(singular.species_set) : pool
}

export function roleForPlan(binding, sourcePlan) {
  for (const a of binding.assignments) {
    if (a.sourcePlan === sourcePlan) { return a.role }
  }
  return null
}
