// Comparators where the natural PBS delta requires after_count = 0:
// =, >=, <= permit the 0=0 (vacuous) case.
// < permits the N→0 (e.g., 1→0) case where a participant is removed.
// The relation's default count_range.min=1 prevents these shapes from arising
// naturally; this pass relaxes the relation probabilistically so the
// pipeline can produce examples matching the evaluator's coerced semantic.
const RELAXABLE_PBS_COMPARATORS = new Set([
  'equal_to', 'greater_than_or_equal_to', 'less_than_or_equal_to', 'less_than'
])

const RELAX_PROBABILITY = 0.25

export function relaxStabilityPbsRelations(ctx, random) {
  for (const relation of ctx.relations ?? []) {
    if (!hasRelaxablePbsDescriptor(relation)) { continue }
    if (random() >= RELAX_PROBABILITY) { continue }
    relation.subjectSide.count_range = { min: 0, max: Infinity }
    relation.targetSide.count_range = { min: 0, max: Infinity }
  }
}

function hasRelaxablePbsDescriptor(relation) {
  const descriptors = relation.sourcePlan?.comparisonDescriptors ?? []
  return descriptors.some(d =>
    d.source === 'prior_board_state' && RELAXABLE_PBS_COMPARATORS.has(d.comparator)
  )
}
