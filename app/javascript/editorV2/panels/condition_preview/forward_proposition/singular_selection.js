import Board from 'gameplay/board'
import {
  WEIGHTED_SPECIES_DISTRIBUTION, pickWeightedSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { intersectRegions } from './region'

export function buildSingularSelectionPool(singular, ctx) {
  const pool = []
  for (const species of WEIGHTED_SPECIES_DISTRIBUTION) {
    if (!singular.species_set.has(species)) { continue }
    const region = regionForSpecies(singular.region, species)
    if (regionEmpty(region)) { continue }
    pool.push({ kind: 'default', species, region })
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
  let speciesSet = intersectSets(sideOrProp.species_set, singular.species_set)
  if (speciesSet.size === 0) { return }
  const region = intersectRegions(sideOrProp.region, singular.region)
  if (regionEmpty(region)) { return }
  if (speciesSet.has(Board.PAWN) && regionEmpty(regionForSpecies(region, Board.PAWN))) {
    speciesSet = new Set([...speciesSet].filter(s => s !== Board.PAWN))
    if (speciesSet.size === 0) { return }
  }
  for (let i = 0; i < minCount; i += 1) {
    pool.push({ kind: 'tagged', species_set: speciesSet, region })
  }
}

// Pawns can't legally stand on rank 0 or 7. For PAWN species, restrict the
// region to legal pawn squares; for other species, the region is unchanged.
function regionForSpecies(region, species) {
  if (species !== Board.PAWN) { return region }
  if (region.kind === 'all') {
    const squares = new Set()
    for (let pos = 8; pos < 56; pos += 1) { squares.add(pos) }
    return { kind: 'set', squares }
  }
  if (region.kind === 'set') {
    const filtered = new Set()
    for (const sq of region.squares) {
      const rank = Board.rankIndex(sq)
      if (rank !== 0 && rank !== 7) { filtered.add(sq) }
    }
    return { kind: 'set', squares: filtered }
  }
  return region
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
