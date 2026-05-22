import { pieceControlsSquare } from 'gameplay/board_query_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { mobilityAt } from 'gameplay/mobility'
import { singularSquare, commitPriorRegion } from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/cross_frame_helpers'
import {
  legalOriginCandidates, piecesWithMovedAt, directionSatisfied,
  enemyKingPosition, ensureEnemyKingPlaced
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/shifts_mobility_helpers'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'


export const movedPieceShiftsEnemyMobility = {
  name: 'moved-piece-shifts-enemy-mobility',

  appliesTo(entry, ctx, pieces) {
    if (entry.metric !== 'aggregate_mobility') { return false }
    if (entry.currentProposition?.team !== ctx.enemyTeam) { return false }
    return true
  },

  apply(entry, ctx, pieces, random) {
    const moved = ctx.singulars.moved_piece
    const destination = singularSquare(moved)
    if (destination === null) { return null }
    const movedSpecies = committedSpecies(moved)
    if (movedSpecies === null) { return null }

    const paths = shuffled([tryBlockingEnemyReach, tryCheckingEnemyKing], random)
    for (const path of paths) {
      const result = path({ entry, ctx, pieces, random, moved, destination, movedSpecies })
      if (result !== null) { return result }
    }
    return null
  }
}

// Iterate enemy pieces matching the species filter; for each, find an origin
// where the piece's mobility differs across frames (moved_piece blocks one
// frame but not the other).
function tryBlockingEnemyReach({ entry, ctx, pieces, random, moved, destination, movedSpecies }) {
  pieces = ensureEnemyKingPlaced(pieces, ctx, random)
  if (pieces === null) { return null }
  const team = entry.currentProposition.team
  const speciesSet = entry.currentProposition.species_set
  const targets = enemyTargets(pieces, team, speciesSet, destination)
  const origins = legalOriginCandidates(pieces, destination, moved.team, movedSpecies)

  for (const xPos of shuffled(targets, random)) {
    for (const origin of shuffled(origins, random)) {
      if (!targetMobilityShifts(entry.direction, pieces, destination, origin, moved.team, movedSpecies, xPos)) { continue }
      const result = commitPriorRegion(ctx, [origin], pieces)
      if (result !== null) { return result }
    }
  }
  return null
}

function enemyTargets(pieces, team, speciesSet, excludeSquare) {
  const result = []
  for (const [pos, piece] of pieces) {
    if (pos === excludeSquare) { continue }
    if (piece.charAt(0) !== team) { continue }
    if (!speciesSet.has(piece.slice(1))) { continue }
    result.push(pos)
  }
  return result
}

function targetMobilityShifts(direction, pieces, destination, origin, movedTeam, movedSpecies, targetPos) {
  const afterBoard = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const afterMobility = mobilityAt(afterBoard, targetPos)
  const priorPieces = piecesWithMovedAt(pieces, destination, origin, movedTeam, movedSpecies)
  if (priorPieces === null) { return false }
  const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces))
  const priorMobility = mobilityAt(priorBoard, targetPos)
  return directionSatisfied(direction, afterMobility, priorMobility)
}

// moved_piece's destination attacks enemy king. For '-': commit priorRegion to
// origins from which moved_piece doesn't attack king. For '+': inverse.
function tryCheckingEnemyKing({ entry, ctx, pieces, random, moved, destination, movedSpecies }) {
  const piecesWithKing = ensureEnemyKingPlaced(pieces, ctx, random)
  if (piecesWithKing === null) { return null }
  const kingPos = enemyKingPosition(piecesWithKing, ctx.enemyTeam)
  if (kingPos === null) { return null }

  const board = buildBoardFromLayout(buildLayoutFromPieces(piecesWithKing))
  const destAttacksKing = pieceControlsSquare({ board, attackerPosition: destination, targetPosition: kingPos })

  for (const origin of shuffled(legalOriginCandidates(piecesWithKing, destination, moved.team, movedSpecies), random)) {
    const originAttacksKing = originAttacksKingHypothetically(piecesWithKing, origin, destination, moved.team, movedSpecies, kingPos)
    if (!checkPatternSatisfiesDirection(entry.direction, destAttacksKing, originAttacksKing)) { continue }

    const result = commitPriorRegion(ctx, [origin], piecesWithKing)
    if (result !== null) { return result }
  }
  return null
}

function originAttacksKingHypothetically(pieces, origin, destination, team, species, kingPos) {
  const hypo = piecesWithMovedAt(pieces, destination, origin, team, species)
  if (hypo === null) { return false }
  const board = buildBoardFromLayout(buildLayoutFromPieces(hypo))
  return pieceControlsSquare({ board, attackerPosition: origin, targetPosition: kingPos })
}

function checkPatternSatisfiesDirection(direction, destAttacksKing, originAttacksKing) {
  if (direction === '-') { return destAttacksKing && !originAttacksKing }
  if (direction === '+') { return originAttacksKing && !destAttacksKing }
  return false
}
