export function canNarrowSingularSpecies(singular, species) {
  return singular.species_set.has(species)
}

export function canNarrowSingularRegion(singular, position) {
  const { region } = singular
  if (region.kind === 'all') { return true }
  if (region.kind === 'set') { return region.squares.has(position) }
  return false
}

export function canNarrowSingular(singular, species, position) {
  return canNarrowSingularSpecies(singular, species) &&
         canNarrowSingularRegion(singular, position)
}

export function canNarrowMovedPiece(ctx, species, position) {
  for (const a of ctx?.movedBinding?.assignments ?? []) {
    if (a.kind === 'related-to') { continue }
    if (!canNarrowSingular(a.side, species, position)) { return false }
  }
  return true
}

export function committedSpecies(singular) {
  if (singular.species_set.size !== 1) {
    throw new Error(`committedSpecies called on uncommitted singular (species_set size ${singular.species_set.size})`)
  }
  return [...singular.species_set][0]
}

export function tryNarrowSingularRegion(singular, position) {
  if (!canNarrowSingularRegion(singular, position)) { return false }
  singular.region = { kind: 'set', squares: new Set([position]) }
  return true
}

export function tryNarrowSingular(singular, species, position) {
  if (!canNarrowSingular(singular, species, position)) { return false }
  singular.species_set = new Set([species])
  singular.region = { kind: 'set', squares: new Set([position]) }
  return true
}

export function tryNarrowMovedPiece(ctx, species, position) {
  const moved = ctx.singulars.moved_piece
  if (!canNarrowSingular(moved, species, position)) { return false }
  if (!canNarrowMovedPiece(ctx, species, position)) { return false }
  moved.species_set = new Set([species])
  moved.region = { kind: 'set', squares: new Set([position]) }
  return true
}
