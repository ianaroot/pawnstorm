import { buildUnaryWorkItems, collectUnaryExamples } from '../shared/unary_position_collection'
import { runWorkItemPipeline } from '../shared/work_item_pipeline'

export function collectReverseUnaryExamples({
  combinedPlan, unaryPlans, perPlanMs, random, maxStandardSize,
  addUnique, standardExamples, produced
}) {
  runWorkItemPipeline({
    plans: unaryPlans, combinedPlan, perPlanMs, random, maxStandardSize,
    buildWorkItems: buildUnaryWorkItems,
    collectExamples: collectUnaryExamples,
    pipelineKey: 'reverse-unary',
    addUnique, standardExamples, produced
  })
}
