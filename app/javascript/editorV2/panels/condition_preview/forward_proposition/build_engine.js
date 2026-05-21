import profileCollector from 'gameplay/profile_collector'
import { placeKingsIfAbsent } from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildChainCtx } from './chain_ctx'
import { commitSingularsSpecies, applyNullStayCoinFlips } from './commit_singulars_species'
import { chooseMovedBinding } from './moved_binding'
import { commitSingularsPosition } from './commit_singulars_position'
import { earlyPlaceConstraintTargets } from './early_placement/place_constraint_targets'
import { isSatisfiable } from './is_satisfiable'
import { narrowForCrossFrame } from './narrow_for_crossframe'
import { narrowMovedPieceForRegion } from './narrow_moved_piece_for_region'
import { placeSingulars } from './place_singulars'
import { satisfyPropositions } from './satisfy_propositions'
import { satisfyRelations } from './relations/satisfy_relations'
import { satisfyMobility } from './mobility/satisfy_mobility'
import { satisfyCrossFrame } from './cross_frame/satisfy_cross_frame'
import { createBiasState } from './mobility/edge_bias'
import { synthesizeMove } from './synthesize_move'
import { mergeCtxDelta } from './scenarios/merge_ctx_delta'
import { standardScenario } from './scenarios/standard'
import { relaxStabilityPbsRelations } from './pbs_relaxation'
import { STANDARD_KEY } from './coverage_record'

// Tags which build stage produced a null so the forward-proposition
// benchmark can localize generation holes. No-op unless MATCH_PROFILE=1.
function buildFailed(stage) {
  profileCollector.increment(`forward_proposition.build_failed.${stage}`)
  return null
}

export function buildAttempt(combinedPlan, random, scenario = standardScenario, coverageRecord = null) {
  const ctx = buildChainCtx(combinedPlan)
  ctx.edgeBiasState = createBiasState()
  ctx.pinState = createBiasState()
  ctx.checkState = createBiasState(1)
  mergeCtxDelta(ctx, scenario.buildCtxDelta(combinedPlan))
  relaxStabilityPbsRelations(ctx, random)
  narrowForCrossFrame(ctx)
  narrowMovedPieceForRegion(ctx)
  if (!isSatisfiable(ctx)) { return buildFailed('not_satisfiable') }

  ctx.movedBinding = chooseMovedBinding(ctx, random, coverageRecord, scenario.moveKind ?? STANDARD_KEY)
  applyNullStayCoinFlips(ctx, random)
  // Pre-commit so strategies narrow singulars instead of stomping; caps
  // on related-to regions bypass here, fail downstream at commit.
  const earlyPieces = earlyPlaceConstraintTargets(ctx, random)
  commitSingularsSpecies(ctx, random)
  commitSingularsPosition(ctx, random, earlyPieces)

  let pieces = placeSingulars(ctx.singulars, random, earlyPieces)
  if (pieces === null) { return buildFailed('place_singulars') }

  pieces = satisfyPropositions(ctx, pieces, random)
  if (pieces === null) { return buildFailed('propositions') }

  const [first, second] = random() < 0.5 ? [satisfyMobility, satisfyCrossFrame] : [satisfyCrossFrame, satisfyMobility]
  pieces = first(ctx, pieces, random)
  if (pieces === null) { return buildFailed(first.name) }
  pieces = second(ctx, pieces, random)
  if (pieces === null) { return buildFailed(second.name) }

  pieces = satisfyRelations(ctx, pieces, random)
  if (pieces === null) { return buildFailed('relations') }

  pieces = placeKingsIfAbsent(pieces, random, ctx)
  if (pieces === null) { return buildFailed('place_kings') }

  const move = synthesizeMove(ctx, pieces, random, scenario)
  if (move === null) { return buildFailed('synthesize_move') }
  return { move, binding: ctx.movedBinding }
}
