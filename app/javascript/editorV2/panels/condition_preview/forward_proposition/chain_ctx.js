import { buildSingulars } from './singulars'
import { emitConstraintsFromPlan } from './propositions'

export function buildChainCtx(combinedPlan) {
  const singulars = buildSingulars(combinedPlan)
  const propositions = []
  const relations = []
  const crossFrame = []
  for (const plan of combinedPlan.plans) {
    const emitted = emitConstraintsFromPlan(plan)
    propositions.push(...emitted.propositions)
    relations.push(...emitted.relations)
    crossFrame.push(...emitted.crossFrame)
  }
  return { singulars, propositions, relations, crossFrame }
}
