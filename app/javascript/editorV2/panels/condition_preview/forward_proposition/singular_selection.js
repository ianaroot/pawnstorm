import {
  WEIGHTED_SPECIES_DISTRIBUTION, pickWeightedSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { intersectRegions } from './region'

export function buildSingularSelectionPool(singular, ctx) {
  const pool = []
  for (const species of WEIGHTED_SPECIES_DISTRIBUTION) {
    if (!singular.species_set.has(species)) { continue }
    pool.push({ kind: 'default', species, region: singular.region })
  }
  for (const rel of ctx.relations ?? []) {
    addTaggedFrom(pool, rel.subjectSide, singular)
    addTaggedFrom(pool, rel.targetSide, singular)
  }
  for (const prop of ctx.propositions ?? []) {
    if (prop.frame !== 'current') { continue }
    addTaggedFrom(pool, prop, singular)
  }
  return pool
}

function addTaggedFrom(pool, sideOrProp, singular) {
  if (sideOrProp.team !== singular.team) { return }
  if (sideOrProp.region.kind === 'related-to') { return }
  const minCount = sideOrProp.count_range?.min ?? 0
  if (minCount === 0) { return }
  const speciesSet = intersectSets(sideOrProp.species_set, singular.species_set)
  if (speciesSet.size === 0) { return }
  const region = intersectRegions(sideOrProp.region, singular.region)
  if (regionEmpty(region)) { return }
  for (let i = 0; i < minCount; i += 1) {
    pool.push({ kind: 'tagged', species_set: speciesSet, region })
  }
}

function intersectSets(a, b) {
  const result = new Set()
  for (const x of a) { if (b.has(x)) { result.add(x) } }
  return result
}

function regionEmpty(region) {
  return region.kind === 'set' && region.squares.size === 0
}

export function pickFromPool(pool, singular, random) {
  if (singular.species_set.has(null) && random() < 0.5) {
    return { species: null, region: singular.region }
  }
  if (pool.length === 0) {
    return { species: null, region: singular.region }
  }
  const entry = pool[Math.floor(random() * pool.length)]
  if (entry.kind === 'default') {
    return { species: entry.species, region: entry.region }
  }
  return { species: pickWeightedSpecies(entry.species_set, random), region: entry.region }
}
