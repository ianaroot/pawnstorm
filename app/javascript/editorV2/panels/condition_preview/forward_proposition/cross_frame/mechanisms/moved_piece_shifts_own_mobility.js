import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { mobilityAt } from 'gameplay/mobility'
import { singularSquare, commitPriorRegion } from './participates_helpers'

// Patch 1 of mobility cross-frame: moved_piece's own mobility shift.
//
// For direction '+': mobility went up after the move. We need origin where
// mobility-from-origin < mobility-from-destination.
// For direction '-': mobility went down. We need origin where
// mobility-from-origin > mobility-from-destination.
//
// First iteration does NATURAL checks only — finds an origin candidate whose
// hypothetical mobility already differs from destination's in the right
// direction. Active engineering via existing mobility mechanisms is deferred.
export const movedPieceShiftsOwnMobility = {
  name: 'moved-piece-shifts-own-mobility',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'unary') { return false }
    if (entry.metric !== 'aggregate_mobility') { return false }
    if (entry.currentProposition?.boundSingularActor !== 'moved_piece') { return false }
    return true
  },

  apply(entry, ctx, pieces, random) {
    const moved = ctx.singulars.moved_piece
    const destination = singularSquare(moved)
    if (destination === null) { return null }
    const movedSpecies = [...moved.species_set][0]
    if (movedSpecies === null) { return null }

    const afterBoard = buildBoardFromLayout(buildLayoutFromPieces(pieces))
    const afterMobility = mobilityAt(afterBoard, destination)

    const origins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
      .filter(p => p !== destination && !pieces.has(p))

    for (const origin of shuffled(origins, random)) {
      const priorMobility = hypotheticalMobilityAt(pieces, destination, origin, moved.team, movedSpecies)
      if (directionSatisfied(entry.direction, afterMobility, priorMobility)) {
        const result = commitPriorRegion(ctx, [origin], pieces)
        if (result !== null) { return result }
      }
    }
    return null
  }
}

function hypotheticalMobilityAt(pieces, fromSquare, toSquare, team, species) {
  const hypo = new Map(pieces)
  hypo.delete(fromSquare)
  hypo.set(toSquare, pieceCode(team, species))
  const board = buildBoardFromLayout(buildLayoutFromPieces(hypo))
  return mobilityAt(board, toSquare)
}

function directionSatisfied(direction, afterMobility, priorMobility) {
  if (direction === '+') { return afterMobility > priorMobility }
  if (direction === '-') { return afterMobility < priorMobility }
  if (direction === '=') { return afterMobility === priorMobility }
  return false
}
