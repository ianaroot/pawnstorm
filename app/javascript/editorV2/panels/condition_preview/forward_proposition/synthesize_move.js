import Rules from 'gameplay/rules'
import profileCollector from 'gameplay/profile_collector'
import { buildBoardFromLayout, buildLayoutFromPieces, shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { buildPriorBoard, buildRecentMoveContext, legalPriorTurnState } from 'editorV2/panels/condition_preview/shared/example_utils'
import { regionAllows } from './region'
import { standardScenario } from './scenarios/standard'

export function synthesizeMove(ctx, pieces, random, scenario = standardScenario) {
  const moved = ctx.singulars.moved_piece
  const species = [...moved.species_set][0]
  const team = moved.team
  const overrides = scenario.resolveMoveObjectOverrides?.(ctx, pieces) ?? {}

  const endPos = overrides.endPosition ?? [...moved.region.squares][0]
  const origins = overrides.startPosition !== undefined
    ? [overrides.startPosition]
    : shuffled(
        originCandidatesForSpecies(endPos, species, team)
          .filter(p => p !== endPos && !pieces.has(p) && regionAllows(moved.priorRegion, p)),
        random
      )
  const recentMoveContext = scenario.resolveRecentMoveContext?.(ctx, random) ?? recentMoveContextForEnemy(ctx, random)

  for (const origin of origins) {
    const priorPieces = buildPriorBoard({
      pieces, singulars: ctx.singulars, origin, endPos,
      pieceNotation: overrides.pieceNotation,
      team,
      promotionPiece: overrides.promotionPiece,
      capturedPiecePosition: overrides.capturedPiecePosition
    })
    if (priorPieces === null) { profileCollector.increment('diag.synthesize_move.prior_board_null'); continue }
    const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces), recentMoveContext, team)
    let moveObject
    try { moveObject = Rules.getMoveObject(origin, endPos, priorBoard) } catch { profileCollector.increment('diag.synthesize_move.catch_hits'); continue }
    if (moveObject.illegal) { continue }
    if (!legalPriorTurnState(priorBoard, moveObject)) { continue }
    return { priorBoard, moveObject }
  }
  return null
}

function recentMoveContextForEnemy(ctx, random) {
  const enemyMoved = ctx.singulars?.enemy_moved_piece
  if (!enemyMoved) { return null }
  if (enemyMoved.region.kind !== 'set' || enemyMoved.region.squares.size !== 1) { return null }
  const species = [...enemyMoved.species_set][0]
  if (species === null || species === undefined) { return null }

  const enemyCaptured = ctx.singulars?.enemy_captured_piece
  const capturedSpecies = enemyCaptured && enemyCaptured.species_set
    ? [...enemyCaptured.species_set].find(s => s !== null) ?? null
    : null

  return buildRecentMoveContext({
    team: enemyMoved.team,
    species,
    endPosition: [...enemyMoved.region.squares][0],
    capturedSpecies,
    random
  })
}

