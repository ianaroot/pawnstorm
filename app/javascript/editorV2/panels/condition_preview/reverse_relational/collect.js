import { buildSeed } from '../seeds/seed_builder'
import { collectVerifiedExamples } from '../shared/move_collection'
import { MOVE_KIND_STANDARD } from '../shared/example_utils'

export function collectReverseRelationalExamples({
  tuples, relDeadline, random, maxStandardSize, maxRounds,
  addUnique, standardExamples, produced
}) {
  roundLoop: for (let round = 0; round < maxRounds; round += 1) {
    if (standardExamples.length >= maxStandardSize || Date.now() > relDeadline) { break }
    for (const { chainVariant, variant } of tuples) {
      if (standardExamples.length >= maxStandardSize || Date.now() > relDeadline) { break roundLoop }
      const seed = buildSeed(chainVariant, MOVE_KIND_STANDARD, random)
      if (!seed) { continue }
      const examples = collectVerifiedExamples({ combinedPlan: chainVariant, seed, variant, random })
      produced['reverse-relational'] += examples.length
      examples.forEach(ex => { ex.generationPath = 'reverse-relational'; addUnique(ex, standardExamples) })
    }
  }
}
