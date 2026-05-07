import { placeKingsIfAbsent } from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildChainCtx } from './chain_ctx'
import { commitSingulars } from './commit_singulars'
import { isSatisfiable } from './is_satisfiable'
import { placeSingulars } from './place_singulars'
import { satisfyPropositions } from './satisfy_propositions'
import { synthesizeMove } from './synthesize_move'

export function buildAttempt(combinedPlan, random) {
  const ctx = buildChainCtx(combinedPlan)
  if (!isSatisfiable(ctx)) { return null }
  commitSingulars(ctx.singulars, random)

  let pieces = placeSingulars(ctx.singulars, random)
  if (pieces === null) { return null }

  pieces = satisfyPropositions(ctx, pieces, random)
  if (pieces === null) { return null }

  pieces = placeKingsIfAbsent(pieces, random)
  if (pieces === null) { return null }

  return synthesizeMove(ctx, pieces, random)
}
