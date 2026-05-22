import Board from 'gameplay/board'

export function actorTeam(actor, movingTeam) {
  switch (actor) {
    case 'allied':
    case 'moved_piece':
    case 'enemy_captured_piece':
      return movingTeam
    case 'enemy':
    case 'enemy_moved_piece':
    case 'captured_piece':
      return Board.opposingTeam(movingTeam)
    default:
      throw new Error(`Unsupported actor: ${actor}`)
  }
}
