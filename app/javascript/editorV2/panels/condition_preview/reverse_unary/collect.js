import { buildUnaryWorkItems, collectUnaryExamples } from '../shared/unary_position_collection'
import { CandidateVerifier } from '../shared/candidate_verifier'
import { ExampleFactory } from '../shared/example_factory'

export function collectReverseUnaryExamples({
  combinedPlan, unaryPlans, perPlanMs, random, maxStandardSize,
  addUnique, standardExamples, produced
}) {
  const verifier = new CandidateVerifier({ combinedPlan })
  const factory = new ExampleFactory({ combinedPlan })

  for (const unaryPlan of unaryPlans) {
    const unaryDeadline = Date.now() + perPlanMs
    const workItems = buildUnaryWorkItems(unaryPlan, random)
    for (const item of workItems) {
      if (standardExamples.length >= maxStandardSize || Date.now() > unaryDeadline) { break }
      const examples = collectUnaryExamples({ combinedPlan, unaryPlan, item, random, verifier, factory })
      produced['reverse-unary'] += examples.length
      examples.forEach(ex => addUnique(ex, standardExamples))
    }
  }
}
