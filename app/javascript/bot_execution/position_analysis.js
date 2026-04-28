import Board from "gameplay/board"
import { materialValue, relativeRank, relativeToAbsolutePosition } from "gameplay/board_query_utils"
import profileCollector from "gameplay/profile_collector"

const AFTER_BOARD = "after"

export function positionFilteredPositions(analysis, { actor, filter = "any", filterMode = null, positionAxis, positionComparator, positionTarget, boardScope = AFTER_BOARD }) {
  return profileCollector.measure('cma.v2.position_filtered_positions', () => {
    const board = analysis.boardForScope(boardScope)
    const team = analysis.movedPieceTeam()
    const candidates = positionActorPositions(analysis, { actor, filter, filterMode, boardScope })
    return candidates.filter(position => positionSatisfied(position, team, { positionAxis, positionComparator, positionTarget }))
  })
}

export function positionMetricTotal(analysis, { positions, operator, boardScope = AFTER_BOARD }) {
  return profileCollector.measure('cma.v2.position_metric_total', () => {
    const board = analysis.boardForScope(boardScope)
    switch (operator) {
      case "count":
        return positions.length
      case "value":
        return positions.reduce((sum, position) => sum + materialValue(board.pieceTypeAt(position)), 0)
      case "mobility":
        return positions.reduce((sum, position) => sum + analysis.positionMobility(position, boardScope), 0)
      default:
        throw new Error(`Unsupported position metric operator: ${operator}`)
    }
  })
}

function positionActorPositions(analysis, { actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
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
      throw new Error(`Unsupported position actor: ${actor}`)
  }
}

function positionSatisfied(position, team, { positionAxis, positionComparator, positionTarget }) {
  switch (positionAxis) {
    case "rank": {
      const rank = relativeRank(position, team)
      return compareValues(rank, positionComparator, positionTarget)
    }
    case "file": {
      const file = Board.fileIndex(position) + 1
      return compareValues(file, positionComparator, positionTarget)
    }
    case "square": {
      const absoluteTarget = relativeToAbsolutePosition(positionTarget, team)
      return position === absoluteTarget
    }
    default:
      throw new Error(`Unsupported position axis: ${positionAxis}`)
  }
}

function compareValues(value, comparator, target) {
  switch (comparator) {
    case "equal_to": return value === target
    case "greater_than": return value > target
    case "less_than": return value < target
    case "greater_than_or_equal_to": return value >= target
    case "less_than_or_equal_to": return value <= target
    default: throw new Error(`Unknown position comparator: ${comparator}`)
  }
}
