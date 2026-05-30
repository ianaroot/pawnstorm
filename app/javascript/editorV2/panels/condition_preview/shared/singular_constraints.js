export function canCommitSingularSpecies(singular, species) {
  return singular.species_set.has(species)
}

export function canCommitSingularRegion(singular, position) {
  const { region } = singular
  if (region.kind === 'all') { return true }
  if (region.kind === 'set') { return region.squares.has(position) }
  return false
}

export function canCommitSingular(singular, species, position) {
  return canCommitSingularSpecies(singular, species) &&
         canCommitSingularRegion(singular, position)
}

export function canCommitMovedPiece(ctx, species, position) {
  for (const a of ctx?.movedBinding?.assignments ?? []) {
    if (a.kind === 'related-to') { continue }
    if (!canCommitSingular(a.side, species, position)) { return false }
  }
  return true
}

export function committedSpecies(singular) {
  if (singular.species_set.size !== 1) {
    throw new Error(`committedSpecies called on uncommitted singular (species_set size ${singular.species_set.size})`)
  }
  return [...singular.species_set][0]
}

export function commitSingularRegion(singular, position) {
  if (!canCommitSingularRegion(singular, position)) { return false }
  singular.region = { kind: 'set', squares: new Set([position]) }
  return true
}

export function commitSingular(singular, species, position) {
  if (!canCommitSingular(singular, species, position)) { return false }
  singular.species_set = new Set([species])
  singular.region = { kind: 'set', squares: new Set([position]) }
  return true
}

export function commitMovedPiece(ctx, species, position) {
  const moved = ctx.singulars.moved_piece
  if (!canCommitSingular(moved, species, position)) { return false }
  if (!canCommitMovedPiece(ctx, species, position)) { return false }
  moved.species_set = new Set([species])
  moved.region = { kind: 'set', squares: new Set([position]) }
  return true
}
