import Board from 'gameplay/board'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, teamHasKing
} from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, pathClearOnPieces
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { placeKingDeliberately } from 'editorV2/panels/condition_preview/shared/king_placement'
import { mobilityAt } from 'gameplay/mobility'

// Origin candidates for moved_piece moving to `destination`: same-species
// reachability, not already occupied, and a clear path on the pieces map.
export function legalOriginCandidates(pieces, destination, team, species) {
  return originCandidatesForSpecies(destination, species, team)
    .filter(p => p !== destination && !pieces.has(p))
    .filter(p => pathClearOnPieces(pieces, p, destination, species))
}

// Returns a new pieces map with moved_piece relocated from `fromSquare` to
// `toSquare` (i.e., the hypothetical other-frame board).
export function piecesWithMovedAt(pieces, fromSquare, toSquare, team, species) {
  const result = new Map(pieces)
  result.delete(fromSquare)
  result.set(toSquare, pieceCode(team, species))
  return result
}

// Mobility-at-queryPos on a hypothetical board where moved_piece has been
// moved from `fromSquare` to `toSquare`. queryPos defaults to `toSquare` —
// useful when measuring moved_piece's own mobility at its hypothetical
// position. Pass an explicit queryPos when measuring a different piece's
// mobility under the hypothetical move.
export function hypotheticalMobilityAt(pieces, fromSquare, toSquare, team, species, queryPos = toSquare) {
  const hypo = piecesWithMovedAt(pieces, fromSquare, toSquare, team, species)
  const board = buildBoardFromLayout(buildLayoutFromPieces(hypo))
  return mobilityAt(board, queryPos)
}

export function directionSatisfied(direction, afterMobility, priorMobility) {
  if (direction === '+') { return afterMobility > priorMobility }
  if (direction === '-') { return afterMobility < priorMobility }
  if (direction === '=') { return afterMobility === priorMobility }
  return false
}

export function enemyKingPosition(pieces, team) {
  const kingCode = pieceCode(team, Board.KING)
  for (const [pos, piece] of pieces) {
    if (piece === kingCode) { return pos }
  }
  return null
}

export function ensureEnemyKingPlaced(pieces, ctx, random) {
  if (teamHasKing(pieces, ctx.enemyTeam)) { return pieces }
  return placeKingDeliberately(pieces, ctx.enemyTeam, 'current', ctx, random)
}
