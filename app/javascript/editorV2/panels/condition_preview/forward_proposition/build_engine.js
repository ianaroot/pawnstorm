import { placeKingsIfAbsent } from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildChainCtx } from './chain_ctx'
import { commitSingularsSpecies } from './commit_singulars_species'
import { commitSingularsPosition } from './commit_singulars_position'
import { earlyPlaceConstraintTargets } from './early_placement/place_constraint_targets'
import { isSatisfiable } from './is_satisfiable'
import { narrowForCrossFrame } from './narrow_for_crossframe'
import { placeSingulars } from './place_singulars'
import { satisfyPropositions } from './satisfy_propositions'
import { satisfyRelations } from './relations/satisfy_relations'
import { satisfyMobility } from './mobility/satisfy_mobility'
import { satisfyCrossFrame } from './cross_frame/satisfy_cross_frame'
import { createBiasState } from './mobility/edge_bias'
import { synthesizeMove } from './synthesize_move'

export function buildAttempt(combinedPlan, random) {
  const ctx = buildChainCtx(combinedPlan)
  ctx.edgeBiasState = createBiasState()
  ctx.pinState = createBiasState()
  ctx.checkState = createBiasState(1)
  narrowForCrossFrame(ctx)
  if (!isSatisfiable(ctx)) { return null }

  commitSingularsSpecies(ctx, random)
  const earlyPieces = earlyPlaceConstraintTargets(ctx, random)
  commitSingularsPosition(ctx, random, earlyPieces)

  let pieces = placeSingulars(ctx.singulars, random, earlyPieces)
  if (pieces === null) { return null }

  pieces = satisfyPropositions(ctx, pieces, random)
  if (pieces === null) { return null }

  pieces = satisfyRelations(ctx, pieces, random)
  if (pieces === null) { return null }

  const [first, second] = random() < 0.5
    ? [satisfyMobility, satisfyCrossFrame]
    : [satisfyCrossFrame, satisfyMobility]
  pieces = first(ctx, pieces, random)
  if (pieces === null) { return null }
  pieces = second(ctx, pieces, random)
  if (pieces === null) { return null }

  pieces = placeKingsIfAbsent(pieces, random, ctx)
  if (pieces === null) { return null }

  return synthesizeMove(ctx, pieces, random)
}
