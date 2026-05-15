import { ALL_POSITIONS } from 'editorV2/panels/condition_preview/shared/board_utils'

export function isSatisfiable(ctx) {
  for (const key of Object.keys(ctx.singulars ?? {})) {
    const singular = ctx.singulars[key]
    if (singular.species_set.size === 0) { return false }
    if (regionIsEmpty(singular.region)) { return false }
    if (regionIsEmpty(singular.priorRegion)) { return false }
  }
  for (const proposition of ctx.propositions ?? []) {
    if (proposition.count_range.min > proposition.count_range.max) { return false }
    if (proposition.aggregate_value_range.min > proposition.aggregate_value_range.max) { return false }
    if (proposition.aggregate_mobility_range.min > proposition.aggregate_mobility_range.max) { return false }
  }
  if (hasPairwiseCountContradiction(ctx.propositions ?? [])) { return false }
  return true
}

function hasPairwiseCountContradiction(propositions) {
  for (let i = 0; i < propositions.length; i += 1) {
    for (let j = i + 1; j < propositions.length; j += 1) {
      if (pairContradictsOnCount(propositions[i], propositions[j])) { return true }
    }
  }
  return false
}

function pairContradictsOnCount(a, b) {
  if (a.team !== b.team) { return false }
  if (a.frame !== b.frame) { return false }
  if (a.region.kind === 'related-to' || b.region.kind === 'related-to') { return false }

  const aSubsetB = isSubset(a.species_set, b.species_set)
  const bSubsetA = isSubset(b.species_set, a.species_set)
  if (!aSubsetB && !bSubsetA) { return false }

  const aSquares = squaresOf(a.region)
  const bSquares = squaresOf(b.region)

  if (aSubsetB && countContradicts(a, b, aSquares, bSquares)) { return true }
  if (bSubsetA && countContradicts(b, a, bSquares, aSquares)) { return true }
  return false
}

function countContradicts(demander, capper, demanderSquares, capperSquares) {
  if (demander.count_range.min === 0) { return false }
  const free = setDifferenceSize(demanderSquares, capperSquares)
  const forced = Math.max(0, demander.count_range.min - free)
  return forced > capper.count_range.max
}

function squaresOf(region) {
  if (region.kind === 'all') { return new Set(ALL_POSITIONS) }
  return region.squares
}

function setDifferenceSize(a, b) {
  let n = 0
  for (const x of a) {
    if (!b.has(x)) { n += 1 }
  }
  return n
}

function isSubset(small, large) {
  if (small.size > large.size) { return false }
  for (const x of small) {
    if (!large.has(x)) { return false }
  }
  return true
}

function regionIsEmpty(region) {
  if (!region) { return false }
  return region.kind === 'set' && region.squares.size === 0
}
