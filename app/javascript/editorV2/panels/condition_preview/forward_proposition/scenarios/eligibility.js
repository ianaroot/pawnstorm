import { buildChainCtx } from 'editorV2/panels/condition_preview/forward_proposition/chain_ctx'
import { isSatisfiable } from 'editorV2/panels/condition_preview/forward_proposition/is_satisfiable'
import { mergeCtxDelta } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/merge_ctx_delta'

export function eligibleScenariosFor(combinedPlan, scenarios) {
  return scenarios.filter(scenario => {
    const ctx = buildChainCtx(combinedPlan)
    mergeCtxDelta(ctx, scenario.buildCtxDelta(combinedPlan))
    return isSatisfiable(ctx)
  })
}
