import Board from 'gameplay/board'
import { intersectRegions } from './region'
import { SLIDER_SPECIES } from 'editorV2/panels/condition_preview/shared/geometry_utils'

// Decides which relation roles moved_piece fills this attempt (possibly
// none). The same decision drives the species commit and the relation
// satisfiers, so they agree.

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

export function feasibleRelatedToSlots(ctx) {
  const slots = []
  for (const prop of ctx?.propositions ?? []) {
    if (prop.region?.kind !== 'related-to') { continue }
    if (prop.region.actor !== 'moved_piece') { continue }
    slots.push({ sourcePlan: prop.sourcePlan, role: prop.region.role, kind: 'related-to' })
  }
  return slots
}

export function feasibleRelationSlots(ctx) {
  const moved = ctx?.singulars?.moved_piece
  if (!moved) { return [] }
  const slots = []
  for (const relation of ctx.relations ?? []) {
    for (const role of ['subject', 'target']) {
      const side = role === 'subject' ? relation.subjectSide : relation.targetSide
      if (side.team !== moved.team) { continue }
      if (!speciesOverlap(side.species_set, moved.species_set)) { continue }
      slots.push({ sourcePlan: relation.sourcePlan, role, side })
    }
    if (relation.operator === 'shield') {
      const attackerSide = shieldAttackerSide(relation)
      if (attackerSide.team === moved.team && speciesOverlap(attackerSide.species_set, moved.species_set)) {
        slots.push({ sourcePlan: relation.sourcePlan, role: 'attacker', side: attackerSide })
      }
    }
  }
  return slots
}

// The implicit attacker role of a shield relation. Opposing team from the
// shielder, slider species, no region constraint.
function shieldAttackerSide(shieldRelation) {
  return {
    team: Board.opposingTeam(shieldRelation.subjectSide.team),
    species_set: SLIDER_SPECIES,
    region: { kind: 'all' }
  }
}

// Whether a single moved_piece could satisfy every slot in `set` at once,
// judged only on species/region overlap (not placement geometry).
export function bindingFeasible(set, ctx) {
  const moved = ctx?.singulars?.moved_piece
  if (!moved) { return set.length === 0 }
  const probe = cloneSingular(moved)
  for (const slot of set) {
    // related-to slots constrain the counterpart, not moved_piece — nothing to narrow here
    if (slot.kind === 'related-to') { continue }
    intersectInto(probe.species_set, slot.side.species_set)
    if (probe.species_set.size === 0) { return false }
    probe.region = intersectRegions(probe.region, slot.side.region)
    if (regionEmpty(probe.region)) { return false }
  }
  return true
}

export function chooseMovedBinding(ctx, random, coverageRecord = null, scenarioName = null) {
  const bindings = enumerateFeasibleBindings(ctx)
  if (!coverageRecord) {
    return bindings[Math.floor(random() * bindings.length)]
  }
  const weights = bindings.map(b =>
    coverageRecord.weightFor(scenarioName, bindingComboKey(b, ctx.combinedPlan))
  )
  const total = weights.reduce((s, w) => s + w, 0)
  if (total === 0) {
    return bindings[Math.floor(random() * bindings.length)]
  }
  let r = random() * total
  for (let i = 0; i < bindings.length; i += 1) {
    r -= weights[i]
    if (r < 0) { return bindings[i] }
  }
  return bindings[bindings.length - 1]
}

export function movedSpeciesPool(ctx) {
  const moved = ctx?.singulars?.moved_piece
  if (!moved) { return new Set() }
  const pool = new Set(moved.species_set)
  for (const a of ctx?.movedBinding?.assignments ?? []) {
    // related-to slots constrain the counterpart, not moved_piece — nothing to intersect
    if (a.kind === 'related-to') { continue }
    intersectInto(pool, a.side.species_set)
  }
  return pool.size === 0 ? new Set(moved.species_set) : pool
}

export function roleForPlan(ctx, sourcePlan) {
  for (const a of ctx?.movedBinding?.assignments ?? []) {
    if (a.sourcePlan === sourcePlan) { return a.role }
  }
  return null
}

// Index 0 is the minimum binding (bystander, or forced-only when related-to slots exist).
export function enumerateFeasibleBindings(ctx) {
  const forced = feasibleRelatedToSlots(ctx)
  const optional = feasibleRelationSlots(ctx)
  const bindings = []
  for (const subset of subsetsOf(optional)) {
    const assignments = [...forced, ...subset]
    if (bindingFeasible(assignments, ctx)) {
      bindings.push({ assignments })
    }
  }
  return bindings
}

function subsetsOf(items) {
  const result = [[]]
  for (const item of items) {
    const len = result.length
    for (let i = 0; i < len; i += 1) {
      result.push([...result[i], item])
    }
  }
  return result
}

// Same (plan, role) pair appears once regardless of how many slots back it.
export function bindingComboKey(binding, combinedPlan) {
  const plans = combinedPlan.plans
  const pairs = new Set()
  for (const a of binding.assignments) {
    const idx = plans.indexOf(a.sourcePlan)
    if (idx < 0) { continue }
    pairs.add(`${idx}:${a.role}`)
  }
  return [...pairs].sort().join('|')
}
