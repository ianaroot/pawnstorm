import { buildPositionWorkItems, collectPositionExamples } from '../shared/unary_position_collection'
import { runWorkItemPipeline } from '../shared/work_item_pipeline'

export function collectReversePositionExamples({
  combinedPlan, positionPlans, perPlanMs, random, maxStandardSize,
  addUnique, standardExamples, produced
}) {
  runWorkItemPipeline({
    plans: positionPlans, combinedPlan, perPlanMs, random, maxStandardSize,
    buildWorkItems: buildPositionWorkItems,
    collectExamples: collectPositionExamples,
    pipelineKey: 'reverse-position',
    addUnique, standardExamples, produced
  })
}
