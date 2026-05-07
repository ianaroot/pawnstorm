export function isSatisfiable(ctx) {
  for (const key of Object.keys(ctx.singulars ?? {})) {
    const singular = ctx.singulars[key]
    if (singular.species_set.size === 0) { return false }
    if (singular.region.kind === 'set' && singular.region.squares.size === 0) { return false }
  }
  for (const proposition of ctx.propositions ?? []) {
    if (proposition.count_range.min > proposition.count_range.max) { return false }
    if (proposition.aggregate_value_range.min > proposition.aggregate_value_range.max) { return false }
    if (proposition.aggregate_mobility_range.min > proposition.aggregate_mobility_range.max) { return false }
  }
  return true
}
