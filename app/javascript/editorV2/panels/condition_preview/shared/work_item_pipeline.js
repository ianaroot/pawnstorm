import { CandidateVerifier } from './candidate_verifier'
import { ExampleFactory } from './example_factory'

// Shared driver for the unary and position reverse pipelines. Both follow the
// same shape: iterate plans of a given kind, build work items per plan with a
// per-plan time budget, run the kind-specific collector for each item, push
// surviving examples into the shared pool. The kind-specific pieces — which
// builder, which collector, which pipeline key — are passed in.

export function runWorkItemPipeline({
  plans, combinedPlan, perPlanMs, random, maxStandardSize,
  buildWorkItems, collectExamples, pipelineKey,
  addUnique, standardExamples, produced
}) {
  const verifier = new CandidateVerifier({ combinedPlan })
  const factory = new ExampleFactory({ combinedPlan })

  for (const plan of plans) {
    const deadline = Date.now() + perPlanMs
    const workItems = buildWorkItems(plan, random, combinedPlan.movingTeam)
    for (const item of workItems) {
      if (standardExamples.length >= maxStandardSize || Date.now() > deadline) { break }
      const examples = collectExamples({ combinedPlan, plan, item, random, verifier, factory })
      produced[pipelineKey] += examples.length
      examples.forEach(ex => addUnique(ex, standardExamples))
    }
  }
}
