import Board from 'gameplay/board'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { adjacentNeighborPositions, attackerCandidatesFor } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { respectsAllCaps } from 'editorV2/panels/condition_preview/forward_proposition/respect_caps'

const ENEMY_ATTACKER_SPECIES = Object.freeze([
  Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT, Board.PAWN
])

export const kingAdjacentControlMechanism = {
  name: 'king_adjacent_control',

  appliesTo(target, ctx, frame, pieces) {
    return target.species === Board.KING
  },

  apply(target, ctx, frame, pieces, random) {
    const enemyTeam = Board.opposingTeam(target.team)
    const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
    const adjacents = shuffled(adjacentNeighborPositions(target.position), random)
    for (const adjacentSquare of adjacents) {
      const occupant = pieces.get(adjacentSquare)
      if (occupant && occupant.charAt(0) === target.team) { continue }
      const result = tryPlaceEnemyAttacker(adjacentSquare, enemyTeam, board, ctx, pieces, random)
      if (result !== null) { return result }
    }
    return null
  },

  isActive() { return false }
}

function tryPlaceEnemyAttacker(targetSquare, enemyTeam, board, ctx, pieces, random) {
  for (const species of shuffled(ENEMY_ATTACKER_SPECIES, random)) {
    const attackerPositions = shuffled(
      attackerCandidatesFor(targetSquare, species, enemyTeam, board),
      random
    )
    for (const attackerPos of attackerPositions) {
      if (!respectsAllCaps(enemyTeam, species, attackerPos, ctx, pieces)) { continue }
      const next = placePiece(pieces, attackerPos, pieceCode(enemyTeam, species))
      if (next !== null) { return next }
    }
  }
  return null
}
