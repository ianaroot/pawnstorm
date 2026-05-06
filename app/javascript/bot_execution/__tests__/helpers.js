import Board from 'gameplay/board'
import { position } from 'gameplay/__tests__/helpers'

// Builds a recentMoveContext describing the enemy's prior turn.
// Defaults: enemy (black) knight b8→c6, no capture.
// Pass `captured: { species }` to model a capture; the captured piece's team
// is inferred as the opposite of `enemyTeam`, and its position is the mover's
// landing square (i.e. moverTo).
export function buildEnemyMoveContext({
  enemyTeam = Board.BLACK,
  moverSpecies = Board.NIGHT,
  moverFrom = 'b8',
  moverTo = 'c6',
  captured = null
} = {}) {
  return {
    moveObject: { startPosition: position(moverFrom), endPosition: position(moverTo) },
    movingTeam: enemyTeam,
    movedPieceStartPosition: position(moverFrom),
    movedPieceEndPosition: position(moverTo),
    movedPieceSpeciesBeforeMove: moverSpecies,
    movedPieceSpeciesAfterMove: moverSpecies,
    capturedPiecePosition: captured ? position(moverTo) : null,
    capturedPieceTeam: captured ? Board.opposingTeam(enemyTeam) : null,
    capturedPieceSpecies: captured ? captured.species : null
  }
}
