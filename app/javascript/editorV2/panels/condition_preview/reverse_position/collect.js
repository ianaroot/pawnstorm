import { buildPositionWorkItems, collectPositionExamples } from '../shared/unary_position_collection'

export function collectReversePositionExamples({
  combinedPlan, positionPlans, perPlanMs, random, maxStandardSize,
  addUnique, standardExamples, produced
}) {
  for (const positionPlan of positionPlans) {
    const posDeadline = Date.now() + perPlanMs
    const workItems = buildPositionWorkItems(positionPlan, combinedPlan.movingTeam, random)
    for (const item of workItems) {
      if (standardExamples.length >= maxStandardSize || Date.now() > posDeadline) { break }
      const examples = collectPositionExamples({ combinedPlan, positionPlan, item, random })
      produced['reverse-position'] += examples.length
      examples.forEach(ex => { ex.generationPath = 'reverse-position'; addUnique(ex, standardExamples) })
    }
  }
}
