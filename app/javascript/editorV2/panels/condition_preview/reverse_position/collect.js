import { buildPositionWorkItems, collectPositionExamples } from '../shared/unary_position_collection'
import { CandidateVerifier } from '../shared/candidate_verifier'
import { ExampleFactory } from '../shared/example_factory'

export function collectReversePositionExamples({
  combinedPlan, positionPlans, perPlanMs, random, maxStandardSize,
  addUnique, standardExamples, produced
}) {
  const verifier = new CandidateVerifier({ combinedPlan })
  const factory = new ExampleFactory({ combinedPlan })

  for (const positionPlan of positionPlans) {
    const posDeadline = Date.now() + perPlanMs
    const workItems = buildPositionWorkItems(positionPlan, combinedPlan.movingTeam, random)
    for (const item of workItems) {
      if (standardExamples.length >= maxStandardSize || Date.now() > posDeadline) { break }
      const examples = collectPositionExamples({ combinedPlan, positionPlan, item, random, verifier, factory })
      produced['reverse-position'] += examples.length
      examples.forEach(ex => addUnique(ex, standardExamples))
    }
  }
}
