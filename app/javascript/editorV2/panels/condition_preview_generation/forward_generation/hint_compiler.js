// Hint compiler — emits SEMANTIC hints from plans.
//
// Discipline: hints describe what must be true on the board, never what to do.
// Adding a new predicate type means adding a compile rule that emits semantic
// hints derived from the predicate's meaning. The resolver (separate module)
// is the only place that turns hints into placements.
//
// ===== Hint design rules (anti-patterns to avoid) =====
//
// Granular hints constrain the resulting board's properties (counts, totals,
// relationships, mobility) — never its specific piece-square assignments. The
// resolver retains all positional freedom. Bias creeps in only when:
//
//   1. Hints contain `square=` (procedural). Disallowed by contract — a hint
//      that names a square is a chain-shape template in disguise.
//   2. The resolver short-circuits to the first valid placement instead of
//      sampling. Mitigation: shuffled iteration + random species selection
//      (see buildMinimumSeed and Strategy A in hint_resolver).
//   3. Strategies are ordered such that one always wins. Mitigation:
//      round-robin or random strategy choice in the resolver, not always
//      "try C then A" — see hint_resolver for current strategy ordering.
//
// ===== Diversity test (guardrail when adding a hint type) =====
//
// When introducing a new hint type, generate 30 boards from the same chain
// and inspect piece-square distribution. If pieces cluster on the same square
// more than ~20% of the time, the hint is over-narrow — likely smuggling a
// position commitment, or pinning the resolver to one strategy. Loosen the
// hint or add resolver freedom before merging.

export const HINT_TYPES = Object.freeze({
  RELATION_HOLDS: 'relation_holds',
  ACTOR_MOBILITY_AT_MOST: 'actor_mobility_at_most'
})

function mobilityUpperBoundFromComparator(comparator, total) {
  switch (comparator) {
    case 'equal_to':              return total
    case 'less_than':             return Math.max(0, total - 1)
    case 'less_than_or_equal_to': return total
    default:                      return null
  }
}

function compileRelational(plan) {
  return [{ type: HINT_TYPES.RELATION_HOLDS, plan }]
}

function compileUnary(plan) {
  const hints = []
  if (plan.operator === 'mobility' && plan.target === 'exact_number') {
    const total = Number(plan.targetTotal ?? 0)
    const upperBound = mobilityUpperBoundFromComparator(plan.comparator, total)
    if (upperBound !== null) {
      hints.push({
        type: HINT_TYPES.ACTOR_MOBILITY_AT_MOST,
        actor: plan.subject,
        filter: plan.subjectFilter,
        filterMode: plan.subjectFilterMode,
        team: plan.subjectTeam,
        maxMobility: upperBound
      })
    }
  }
  return hints
}

export function compileHints(combinedPlan) {
  const hints = []
  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      hints.push(...compileRelational(plan))
    } else if (plan.kind === 'unary') {
      hints.push(...compileUnary(plan))
    }
  }
  return hints
}

export function chainHasActionableHints(combinedPlan) {
  return compileHints(combinedPlan).some(h => h.type !== HINT_TYPES.RELATION_HOLDS)
}
