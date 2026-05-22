import { buildSingulars } from 'editorV2/panels/condition_preview/forward_proposition/singulars'
import { emitConstraintsFromPlan } from 'editorV2/panels/condition_preview/forward_proposition/propositions'
import { defaultStructuralPropositions } from 'editorV2/panels/condition_preview/forward_proposition/structural_invariants'

export function buildChainCtx(combinedPlan) {
  const singulars = buildSingulars(combinedPlan)
  const propositions = [...defaultStructuralPropositions()]
  const relations = []
  const crossFrame = []
  for (const plan of combinedPlan.plans) {
    const emitted = emitConstraintsFromPlan(plan)
    propositions.push(...emitted.propositions)
    relations.push(...emitted.relations)
    crossFrame.push(...emitted.crossFrame)
  }
  return {
    singulars, propositions, relations, crossFrame,
    combinedPlan,
    movingTeam: combinedPlan.movingTeam,
    enemyTeam: combinedPlan.enemyTeam
  }
}
