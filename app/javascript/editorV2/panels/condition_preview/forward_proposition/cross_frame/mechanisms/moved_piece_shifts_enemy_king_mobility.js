import Board from 'gameplay/board'
import { pieceControlsSquare } from 'gameplay/board_query_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, shuffled, teamHasKing
} from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  adjacentNeighborPositions, originCandidatesForSpecies, pathClearOnPieces
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { placeKingDeliberately } from 'editorV2/panels/condition_preview/shared/king_placement'
import { mobilityAt } from 'gameplay/mobility'
import {
  singularSquare, commitPriorRegion, ensureRolePieceAt
} from './participates_helpers'

// Patch 3 of mobility cross-frame: enemy king mobility shift.
//
// Fires when the chain measures enemy mobility and the species filter
// includes the king. Three king-adjacent control paths per direction:
//   attackingKingAdjacent:    moved_piece attacks a king-adjacent square in
//                             one frame but not the other.
//   occupyingKingAdjacent:    moved_piece is adjacent to enemy king and
//                             defended in one frame, not in the other.
//   discoveryAttack:          moved_piece is on the line between an allied
//                             attacker and a king-adjacent square in one
//                             frame; moving (away or onto) changes whether
//                             the attack reaches.
//
// If the enemy king isn't on the board yet, the mechanism places it via
// placeKingDeliberately before engineering.
export const movedPieceShiftsEnemyKingMobility = {
  name: 'moved-piece-shifts-enemy-king-mobility',

  appliesTo(entry, ctx, pieces) {
    if (entry.metric !== 'aggregate_mobility') { return false }
    if (movedPieceIsBoundOnEntry(entry)) { return false }
    if (entry.currentProposition?.team !== ctx.enemyTeam) { return false }
    if (!entry.currentProposition?.species_set?.has(Board.KING)) { return false }
    return true
  },

  apply(entry, ctx, pieces, random) {
    const moved = ctx.singulars.moved_piece
    const destination = singularSquare(moved)
    if (destination === null) { return null }
    const movedSpecies = [...moved.species_set][0]
    if (movedSpecies === null) { return null }

    const piecesWithKing = ensureEnemyKingPlaced(pieces, ctx, random)
    if (piecesWithKing === null) { return null }
    const kingPos = enemyKingPosition(piecesWithKing, ctx.enemyTeam)
    if (kingPos === null) { return null }

    const paths = shuffled(
      [tryAttackingKingAdjacent, tryOccupyingKingAdjacent, tryDiscoveryAttack],
      random
    )
    for (const path of paths) {
      const result = path({ entry, ctx, pieces: piecesWithKing, random, moved, destination, movedSpecies, kingPos })
      if (result !== null) { return result }
    }
    return null
  }
}

function movedPieceIsBoundOnEntry(entry) {
  if (entry.currentProposition?.boundSingularActor === 'moved_piece') { return true }
  if (entry.subjectProposition?.boundSingularActor === 'moved_piece') { return true }
  if (entry.targetProposition?.boundSingularActor === 'moved_piece') { return true }
  return false
}

function ensureEnemyKingPlaced(pieces, ctx, random) {
  if (teamHasKing(pieces, ctx.enemyTeam)) { return pieces }
  return placeKingDeliberately(pieces, ctx.enemyTeam, 'current', ctx, random)
}

function enemyKingPosition(pieces, team) {
  const kingCode = pieceCode(team, Board.KING)
  for (const [pos, piece] of pieces) {
    if (piece === kingCode) { return pos }
  }
  return null
}

function legalOriginCandidates(pieces, destination, team, species) {
  return originCandidatesForSpecies(destination, species, team)
    .filter(p => p !== destination && !pieces.has(p))
    .filter(p => pathClearOnPieces(pieces, p, destination, species))
}

// moved_piece's attack on at least one king-adjacent square exists in one
// frame and not the other. Origin selection alone — no extra placement.
function tryAttackingKingAdjacent({ entry, ctx, pieces, random, moved, destination, movedSpecies, kingPos }) {
  const kingAdjacent = adjacentNeighborPositions(kingPos)
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const destAttacks = kingAdjacent.filter(sq =>
    pieceControlsSquare({ board, attackerPosition: destination, targetPosition: sq })
  )

  for (const origin of shuffled(legalOriginCandidates(pieces, destination, moved.team, movedSpecies), random)) {
    const originAttacks = attackedKingAdjacentFromOrigin(pieces, origin, destination, moved.team, movedSpecies, kingAdjacent)
    if (!attackCountSatisfiesDirection(entry.direction, destAttacks.length, originAttacks.length)) { continue }
    if (!kingMobilitySatisfiesDirection(entry.direction, pieces, destination, origin, moved.team, movedSpecies, kingPos)) { continue }

    const result = commitPriorRegion(ctx, [origin], pieces)
    if (result !== null) { return result }
  }
  return null
}

function attackedKingAdjacentFromOrigin(pieces, origin, destination, team, species, kingAdjacent) {
  const hypothetical = new Map(pieces)
  hypothetical.delete(destination)
  hypothetical.set(origin, pieceCode(team, species))
  const board = buildBoardFromLayout(buildLayoutFromPieces(hypothetical))
  return kingAdjacent.filter(sq =>
    pieceControlsSquare({ board, attackerPosition: origin, targetPosition: sq })
  )
}

function attackCountSatisfiesDirection(direction, destAttacks, originAttacks) {
  if (direction === '-') { return destAttacks > originAttacks }
  if (direction === '+') { return originAttacks > destAttacks }
  return false
}

// moved_piece is adjacent to enemy king (and defended) in the relevant frame.
function tryOccupyingKingAdjacent({ entry, ctx, pieces, random, moved, destination, movedSpecies, kingPos }) {
  const kingAdjacent = new Set(adjacentNeighborPositions(kingPos))

  if (entry.direction === '-') {
    if (!kingAdjacent.has(destination)) { return null }
    const withDefender = ensureDefenderOf(pieces, destination, moved.team, ctx, random)
    if (withDefender === null) { return null }
    const origins = legalOriginCandidates(withDefender, destination, moved.team, movedSpecies)
      .filter(p => !kingAdjacent.has(p))
    return commitFirstOriginMatchingKingMobility(entry, ctx, withDefender, origins, random, moved, destination, movedSpecies, kingPos)
  }

  if (entry.direction === '+') {
    const origins = legalOriginCandidates(pieces, destination, moved.team, movedSpecies)
      .filter(p => kingAdjacent.has(p))
    return commitFirstOriginMatchingKingMobility(entry, ctx, pieces, origins, random, moved, destination, movedSpecies, kingPos)
  }
  return null
}

function commitFirstOriginMatchingKingMobility(entry, ctx, pieces, origins, random, moved, destination, movedSpecies, kingPos) {
  for (const origin of shuffled(origins, random)) {
    if (!kingMobilitySatisfiesDirection(entry.direction, pieces, destination, origin, moved.team, movedSpecies, kingPos)) { continue }
    const result = commitPriorRegion(ctx, [origin], pieces)
    if (result !== null) { return result }
  }
  return null
}

function ensureDefenderOf(pieces, square, defenderTeam, ctx, random) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  for (const [pos, piece] of pieces) {
    if (piece.charAt(0) !== defenderTeam) { continue }
    if (pieceControlsSquare({ board, attackerPosition: pos, targetPosition: square })) { return pieces }
  }
  const defenderSpecies = new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])
  for (const pos of shuffled(adjacentNeighborPositions(square), random)) {
    if (pieces.has(pos)) { continue }
    const placed = ensureRolePieceAt({ pieces, pos, team: defenderTeam, speciesSet: defenderSpecies, ctx, random })
    if (placed !== null && placed !== pieces) { return placed }
  }
  return null
}

// Discovery: an allied attacker controls a king-adjacent square in one frame
// and is blocked by moved_piece in the other. First iteration handles
// direction '-' (move reveals the attack); direction '+' (move blocks an
// existing attack) follows the same pattern with roles inverted.
function tryDiscoveryAttack({ entry, ctx, pieces, random, moved, destination, movedSpecies, kingPos }) {
  if (entry.direction !== '-') { return null }
  const kingAdjacent = adjacentNeighborPositions(kingPos)
  const attackerSpecies = new Set([Board.QUEEN, Board.ROOK, Board.BISHOP])

  for (const kAdj of shuffled([...kingAdjacent], random)) {
    if (pieces.has(kAdj)) { continue }
    const attackerSquare = pickAttackerCandidateNear(kAdj, random)
    if (attackerSquare === null) { continue }
    const placed = ensureRolePieceAt({
      pieces, pos: attackerSquare, team: moved.team, speciesSet: attackerSpecies, ctx, random
    })
    if (placed === null || placed === pieces) { continue }

    for (const origin of shuffled(legalOriginCandidates(placed, destination, moved.team, movedSpecies), random)) {
      if (!kingMobilitySatisfiesDirection(entry.direction, placed, destination, origin, moved.team, movedSpecies, kingPos)) { continue }
      const result = commitPriorRegion(ctx, [origin], placed)
      if (result !== null) { return result }
    }
  }
  return null
}

function pickAttackerCandidateNear(target, random) {
  const candidates = adjacentNeighborPositions(target)
  if (candidates.length === 0) { return null }
  return candidates[Math.floor(random() * candidates.length)]
}

function kingMobilitySatisfiesDirection(direction, pieces, destination, origin, movedTeam, movedSpecies, kingPos) {
  const afterBoard = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const afterMobility = mobilityAt(afterBoard, kingPos)

  const hypothetical = new Map(pieces)
  hypothetical.delete(destination)
  hypothetical.set(origin, pieceCode(movedTeam, movedSpecies))
  const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(hypothetical))
  const priorMobility = mobilityAt(priorBoard, kingPos)

  if (direction === '+') { return afterMobility > priorMobility }
  if (direction === '-') { return afterMobility < priorMobility }
  if (direction === '=') { return afterMobility === priorMobility }
  return false
}
