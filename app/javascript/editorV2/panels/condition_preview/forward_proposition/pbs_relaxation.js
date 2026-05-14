const STABILITY_COMPARATORS = new Set([
  'equal_to', 'greater_than_or_equal_to', 'less_than_or_equal_to'
])

const RELAX_PROBABILITY = 0.25

export function relaxStabilityPbsRelations(ctx, random) {
  for (const relation of ctx.relations ?? []) {
    if (!hasStabilityPbsDescriptor(relation)) { continue }
    if (random() >= RELAX_PROBABILITY) { continue }
    relation.subjectSide.count_range = { min: 0, max: Infinity }
    relation.targetSide.count_range = { min: 0, max: Infinity }
  }
}

function hasStabilityPbsDescriptor(relation) {
  const descriptors = relation.sourcePlan?.comparisonDescriptors ?? []
  return descriptors.some(d =>
    d.source === 'prior_board_state' && STABILITY_COMPARATORS.has(d.comparator)
  )
}
