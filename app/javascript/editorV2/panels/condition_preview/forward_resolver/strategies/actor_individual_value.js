// Strategy for ACTOR_INDIVIDUAL_VALUE { actor, team, filter, speciesPool, valueOp, value, frame }.
//
// Like RELATION_INDIVIDUAL_VALUE, this trusts the species-pool pre-filtering
// done at plan-build time. The verify pass enforces correctness; if the seed
// produced a non-conforming piece, the outer attempt loop retries.
//
// Currently no plan kind emits this hint — it's defined for symmetry. Strategy
// is a structural pass-through.

export function actorIndividualValueStrategy(pieces, hint /*, ctx */) {
  if (hint.frame !== 'current') { return null }
  return pieces
}
