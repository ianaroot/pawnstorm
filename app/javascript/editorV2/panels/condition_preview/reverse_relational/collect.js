import { buildSeed } from '../seeds/seed_builder'
import { collectVerifiedExamples } from '../shared/move_collection'
import { MOVE_KIND_STANDARD } from '../shared/example_utils'
import { CandidateVerifier } from '../shared/candidate_verifier'
import { ExampleFactory } from '../shared/example_factory'

export function collectReverseRelationalExamples({
  tuples, relDeadline, random, maxStandardSize, maxRounds,
  addUnique, standardExamples, produced
}) {
  // Each chainVariant is its own combinedPlan with potentially different
  // evaluationPayloads, so verifier and factory are per-variant. One pair
  // per unique variant, reused across all rounds.
  const verifierByVariant = new Map()
  const factoryByVariant = new Map()
  for (const { chainVariant } of tuples) {
    if (!verifierByVariant.has(chainVariant)) {
      verifierByVariant.set(chainVariant, new CandidateVerifier({ combinedPlan: chainVariant }))
      factoryByVariant.set(chainVariant, new ExampleFactory({ combinedPlan: chainVariant }))
    }
  }

  roundLoop: for (let round = 0; round < maxRounds; round += 1) {
    if (standardExamples.length >= maxStandardSize || Date.now() > relDeadline) { break }
    for (const { chainVariant, variant } of tuples) {
      if (standardExamples.length >= maxStandardSize || Date.now() > relDeadline) { break roundLoop }
      const seed = buildSeed(chainVariant, MOVE_KIND_STANDARD, random)
      if (!seed) { continue }
      const examples = collectVerifiedExamples({
        combinedPlan: chainVariant, seed, variant, random,
        verifier: verifierByVariant.get(chainVariant),
        factory: factoryByVariant.get(chainVariant)
      })
      produced['reverse-relational'] += examples.length
      examples.forEach(ex => addUnique(ex, standardExamples))
    }
  }
}
