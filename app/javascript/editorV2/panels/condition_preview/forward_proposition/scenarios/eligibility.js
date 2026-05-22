import { buildChainCtx } from '../chain_ctx'
import { isSatisfiable } from '../is_satisfiable'
import { mergeCtxDelta } from './merge_ctx_delta'

export function eligibleScenariosFor(combinedPlan, scenarios) {
  return scenarios.filter(scenario => {
    const ctx = buildChainCtx(combinedPlan)
    mergeCtxDelta(ctx, scenario.buildCtxDelta(combinedPlan))
    return isSatisfiable(ctx)
  })
}
