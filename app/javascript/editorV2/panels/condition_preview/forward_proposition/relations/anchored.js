import { MAX_SATISFY_ITERATIONS } from './relation_helpers'
import { chooseRelationVariant } from './relation_variants'

// Shared subject/target role list for two-sided relations (attack, defend,
// adjacent). Shield builds its own 3-role list (incl. the inferred attacker).
export function twoSidedRoles(relation) {
  return [
    { name: 'subject', side: relation.subjectSide },
    { name: 'target', side: relation.targetSide }
  ]
}

// The iteration loop common to every relation satisfier. The caller owns its
// own early guards and `requirementsMet`; `step(pieces)` returns the next
// pieces map, the same map (no progress → fail), or null.
export function satisfyLoop({ relation, pieces, ctx, requirementsMet, step }) {
  let next = pieces
  for (let i = 0; i < MAX_SATISFY_ITERATIONS; i += 1) {
    if (requirementsMet(relation, next, ctx)) { return next }
    const placed = step(next)
    if (placed === null || placed === next) { return null }
    next = placed
  }
  return requirementsMet(relation, next, ctx) ? next : null
}

// Variant-aware satisfy used by the two-sided satisfiers: pick the role
// binding once, then loop. A moved/enemy-moved variant anchors geometry via
// the satisfier's `tryAnchored`; bound/bystander fall back to `tryPlace`.
// Geometry and requirementsMet stay with the satisfier.
export function runAnchoredSatisfier({
  relation, pieces, ctx, random, roles, requirementsMet, tryAnchored, tryPlace
}) {
  const variant = chooseRelationVariant({ roles, ctx, random })
  return satisfyLoop({
    relation, pieces, ctx, requirementsMet,
    step: p => placeStep(relation, p, ctx, random, variant, tryAnchored, tryPlace)
  })
}

function placeStep(relation, pieces, ctx, random, variant, tryAnchored, tryPlace) {
  if (variant.kind === 'moved' || variant.kind === 'enemy-moved') {
    const anchored = tryAnchored(relation, variant, pieces, ctx, random)
    if (anchored !== null) { return anchored }
  }
  return tryPlace(relation, pieces, ctx, random)
}
