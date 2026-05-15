import { actorTeam } from "bot_execution/actor_teams"

const AFTER_BOARD = "after"

export function relationalActorPositions(analysis, { actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
  const board = analysis.boardForScope(boardScope)
  switch (actor) {
    case "allied":
    case "enemy": {
      const team = actorTeam(actor, analysis.movedPieceTeam())
      return board._positionsOccupiedByTeam(team).filter(p =>
        analysis.matchesFilter({ species: board.pieceTypeAt(p), filter, filterMode })
      )
    }
    case "moved_piece": {
      const resolved = analysis.resolvedMovedPiece(boardScope)
      if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return [] }
      return [resolved.position]
    }
    case "enemy_moved_piece": {
      const resolved = analysis.resolvedEnemyMovedPiece(boardScope)
      if (!resolved || !resolved.presentOnBoard) { return [] }
      if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return [] }
      return [resolved.position]
    }
    case "captured_piece": {
      const resolved = analysis.resolvedCapturedPiece()
      if (!resolved) { return [] }
      if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return [] }
      return [resolved.position]
    }
    case "enemy_captured_piece": {
      const resolved = analysis.resolvedEnemyCapturedPiece()
      if (!resolved || resolved.position === null) { return [] }
      if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return [] }
      return [resolved.position]
    }
    default:
      throw new Error(`Unsupported actor: ${actor}`)
  }
}
