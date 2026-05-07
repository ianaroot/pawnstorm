import Rules from 'gameplay/rules'
import { buildBoardFromLayout, buildLayoutFromPieces, pieceCode, pickRandom, shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { legalPriorTurnState } from 'editorV2/panels/condition_preview/shared/example_utils'

export function synthesizeMove(ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const endPos = [...moved.region.squares][0]
  const species = [...moved.species_set][0]
  const team = moved.team

  const candidates = shuffled(
    originCandidatesForSpecies(endPos, species, team).filter(p => p !== endPos && !pieces.has(p)),
    random
  )

  for (const origin of candidates) {
    const priorPieces = buildPriorBoard(pieces, ctx.singulars, origin, endPos, species, team)
    const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces), null, team)
    let moveObject
    try { moveObject = Rules.getMoveObject(origin, endPos, priorBoard) } catch { continue }
    if (moveObject.illegal) { continue }
    if (!legalPriorTurnState(priorBoard, moveObject)) { continue }
    return { priorBoard, moveObject }
  }
  return null
}

function buildPriorBoard(pieces, singulars, origin, endPos, movedSpecies, movedTeam) {
  const priorBoard = new Map(pieces)
  priorBoard.delete(endPos)
  priorBoard.set(origin, pieceCode(movedTeam, movedSpecies))
  const capturedSpecies = [...singulars.captured_piece.species_set][0]
  if (capturedSpecies !== null) {
    priorBoard.set(endPos, pieceCode(singulars.captured_piece.team, capturedSpecies))
  }
  return priorBoard
}
