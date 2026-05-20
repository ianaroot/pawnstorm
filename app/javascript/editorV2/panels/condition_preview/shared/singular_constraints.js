function regionAllows(region, position) {
  if (region.kind === 'all') { return true }
  if (region.kind === 'set') { return region.squares.has(position) }
  return false
}

export function tryNarrowSpecies(singular, species) {
  if (!singular.species_set.has(species)) { return false }
  singular.species_set = new Set([species])
  return true
}

export function tryNarrowSingularRegion(singular, position) {
  if (!regionAllows(singular.region, position)) { return false }
  singular.region = { kind: 'set', squares: new Set([position]) }
  return true
}

export function tryNarrowSingular(singular, species, position) {
  if (!singular.species_set.has(species)) { return false }
  if (!regionAllows(singular.region, position)) { return false }
  singular.species_set = new Set([species])
  singular.region = { kind: 'set', squares: new Set([position]) }
  return true
}
