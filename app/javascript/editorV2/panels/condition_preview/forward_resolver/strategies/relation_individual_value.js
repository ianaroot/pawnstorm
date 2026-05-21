// Strategy for RELATION_INDIVIDUAL_VALUE { operator, subject, target, side, valueOp, value, frame }.
//
// The species pool for value-comparison sides is pre-filtered at plan-build
// time (generation_plan filters subjectSpeciesPool/targetSpeciesPool by
// individual value). So buildMinimumSeed naturally picks a piece with the
// right value. The strategy just defers to the verify pass — if the seed
// picked a satisfying species, we pass; otherwise we return null and let the
// outer attempt loop retry with a fresh RNG.

export function relationIndividualValueStrategy(pieces, hint /*, ctx */) {
  if (hint.frame !== 'current') { return null }
  return pieces
}
