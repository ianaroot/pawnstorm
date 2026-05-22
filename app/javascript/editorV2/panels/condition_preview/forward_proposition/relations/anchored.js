import { MAX_SATISFY_ITERATIONS, singularPosition } from 'editorV2/panels/condition_preview/forward_proposition/relations/relation_helpers'
import { roleForPlan } from 'editorV2/panels/condition_preview/forward_proposition/moved_binding'

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

// Reads the chain-global moved_piece binding for this relation: if it's
// bound to a role here, anchor geometry via the satisfier's `tryAnchored`;
// otherwise fall back to `tryPlace`. Geometry and requirementsMet stay with
// the satisfier.
export function runAnchoredSatisfier({
  relation, pieces, ctx, random, requirementsMet, tryAnchored, tryPlace
}) {
  const role = roleForPlan(ctx, relation.sourcePlan)
  const variant = role
    ? { kind: 'moved', role, position: singularPosition(ctx, 'moved_piece') }
    : { kind: 'bystander' }
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
