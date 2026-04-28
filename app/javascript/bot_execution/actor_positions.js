const AFTER_BOARD = "after"

export function actorPositions(analysis, { actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
  const board = analysis.boardForScope(boardScope)
  switch (actor) {
    case "allied":
    case "enemy": {
      const team = actor === "allied" ? analysis.movedPieceTeam() : analysis.enemyTeam()
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
    default:
      throw new Error(`Unsupported actor: ${actor}`)
  }
}
