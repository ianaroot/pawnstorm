import Rules from 'gameplay/rules'
import { buildBoardFromLayout, buildLayoutFromPieces, shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { buildPriorBoard, buildRecentMoveContext, legalPriorTurnState } from 'editorV2/panels/condition_preview/shared/example_utils'
import { regionAllows } from './region'

export function synthesizeMove(ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const endPos = [...moved.region.squares][0]
  const species = [...moved.species_set][0]
  const team = moved.team

  const candidates = shuffled(
    originCandidatesForSpecies(endPos, species, team)
      .filter(p => p !== endPos && !pieces.has(p) && regionAllows(moved.priorRegion, p)),
    random
  )

  const recentMoveContext = recentMoveContextForEnemy(ctx, random)

  for (const origin of candidates) {
    const priorPieces = buildPriorBoard({ pieces, singulars: ctx.singulars, origin, endPos })
    const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces), recentMoveContext, team)
    let moveObject
    try { moveObject = Rules.getMoveObject(origin, endPos, priorBoard) } catch { continue }
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

