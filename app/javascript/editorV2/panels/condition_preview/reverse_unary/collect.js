import { buildUnaryWorkItems, collectUnaryExamples } from '../shared/unary_position_collection'

export function collectReverseUnaryExamples({
  combinedPlan, unaryPlans, perPlanMs, random, maxStandardSize,
  addUnique, standardExamples, produced
}) {
  for (const unaryPlan of unaryPlans) {
    const unaryDeadline = Date.now() + perPlanMs
    const workItems = buildUnaryWorkItems(unaryPlan, random)
    for (const item of workItems) {
      if (standardExamples.length >= maxStandardSize || Date.now() > unaryDeadline) { break }
      const examples = collectUnaryExamples({ combinedPlan, unaryPlan, item, random })
      produced['reverse-unary'] += examples.length
      examples.forEach(ex => { ex.generationPath = 'reverse-unary'; addUnique(ex, standardExamples) })
    }
  }
}
