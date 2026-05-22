import profileCollector from 'gameplay/profile_collector'
import { intersectRegions } from 'editorV2/panels/condition_preview/forward_proposition/region'

export function mergeCtxDelta(ctx, delta) {
  if (delta.singulars) {
    for (const group of groupAliasedKeys(delta.singulars)) {
      mergeGroup(ctx, group, delta.singulars)
    }
  }
  if (delta.propositions) {
    ctx.propositions.push(...delta.propositions)
  }
  return ctx
}

function groupAliasedKeys(deltaSingulars) {
  const groups = new Map()
  for (const key of Object.keys(deltaSingulars)) {
    const ref = deltaSingulars[key]
    if (!groups.has(ref)) { groups.set(ref, []) }
    groups.get(ref).push(key)
  }
  return [...groups.values()]
}

function mergeGroup(ctx, keys, deltaSingulars) {
  const target = ctx.singulars[keys[0]]
  if (!target) { profileCollector.increment('diag.merge_ctx_delta.missing_singular'); return }
  const deltaSingular = deltaSingulars[keys[0]]
  const extraRelations = []
  const extraUnaryComparisons = []
  for (let i = 1; i < keys.length; i += 1) {
    const other = ctx.singulars[keys[i]]
    if (!other) { continue }
    target.species_set = intersectSets(target.species_set, other.species_set)
    target.region = intersectRegions(target.region, other.region)
    extraRelations.push(...(other.relationsToAnchors ?? []))
    extraUnaryComparisons.push(...(other.valueComparisonsToAnchors ?? []))
  }
  if (deltaSingular.species_set) {
    target.species_set = intersectSets(target.species_set, deltaSingular.species_set)
  }
  if (deltaSingular.region) {
    target.region = intersectRegions(target.region, deltaSingular.region)
  }
  if (keys.length > 1) {
    target.species_set.delete(null)
  }
  target.relationsToAnchors = [
    ...(target.relationsToAnchors ?? []),
    ...extraRelations,
    ...(deltaSingular.relationsToAnchors ?? [])
  ]
  target.valueComparisonsToAnchors = [
    ...(target.valueComparisonsToAnchors ?? []),
    ...extraUnaryComparisons,
    ...(deltaSingular.valueComparisonsToAnchors ?? [])
  ]
  for (const key of keys) {
    ctx.singulars[key] = target
  }
}

function intersectSets(a, b) {
  const result = new Set()
  for (const value of a) {
    if (b.has(value)) { result.add(value) }
  }
  return result
}
