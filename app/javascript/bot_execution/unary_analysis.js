import { materialValue } from "gameplay/board_query_utils"
import profileCollector from "gameplay/profile_collector"
import { actorTeam } from "bot_execution/actor_teams"

const AFTER_BOARD = "after"
const PRIOR_BOARD = "prior"

export function unaryTotal(analysis, { actor, filter = "any", filterMode = null, operator, boardScope = AFTER_BOARD }) {
  return profileCollector.measure('cma.v2.unary_total', () => {
    switch (actor) {
      case "allied":
      case "enemy":
        return generalSubjectUnaryTotal(analysis, { actor, filter, filterMode, operator, boardScope })
      case "moved_piece":
        return movedPieceUnaryTotal(analysis, { filter, filterMode, operator, boardScope })
      case "captured_piece":
        return capturedPieceUnaryTotal(analysis, { filter, filterMode, operator })
      case "enemy_moved_piece":
        return enemyMovedPieceUnaryTotal(analysis, { filter, filterMode, operator, boardScope })
      case "enemy_captured_piece":
        return enemyCapturedPieceUnaryTotal(analysis, { filter, filterMode, operator })
      default:
        throw new Error(`Unsupported V2 unary actor: ${actor}`)
    }
  })
}

export function priorComparisonSourceTotal(analysis, { subject, subjectFilter, subjectFilterMode, operator }) {
  return unaryTotal(analysis, { actor: subject, filter: subjectFilter, filterMode: subjectFilterMode, operator, boardScope: PRIOR_BOARD })
}

function generalSubjectUnaryTotal(analysis, { actor, filter = "any", filterMode = null, operator, boardScope = AFTER_BOARD }) {
  return profileCollector.measure('cma.v2.general_subject_unary_total', () => {
    const team = actorTeam(actor, analysis.movedPieceTeam())
    const board = analysis.boardForScope(boardScope)
    const positions = board._positionsOccupiedByTeam(team).filter(position => {
      return analysis.matchesFilter({ species: board.pieceTypeAt(position), filter, filterMode })
    })

    switch (operator) {
      case "count":
        return positions.length
      case "value":
        return profileCollector.measure('cma.v2.general_subject_unary_total.value', () => {
          return positions.reduce((sum, position) => {
            return sum + materialValue(board.pieceTypeAt(position))
          }, 0)
        })
      case "mobility":
        return profileCollector.measure('cma.v2.general_subject_unary_total.mobility', () => {
          return positions.reduce((sum, position) => {
            return sum + analysis.positionMobility(position, boardScope)
          }, 0)
        })
      default:
        throw new Error(`Unsupported V2 unary operator for ${actor}: ${operator}`)
    }
  })
}

function movedPieceUnaryTotal(analysis, { filter = "any", filterMode = null, operator, boardScope = AFTER_BOARD }) {
  return profileCollector.measure('cma.v2.moved_piece_unary_total', () => {
    const resolved = analysis.resolvedMovedPiece(boardScope)
    if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return 0 }
    switch (operator) {
      case "count":
        return 1
      case "value":
        return analysis.individualComparableValue(resolved.species)
      case "mobility":
        return analysis.positionMobility(resolved.position, boardScope)
      default:
        throw new Error(`Unsupported V2 unary operator for moved_piece: ${operator}`)
    }
  })
}

function capturedPieceUnaryTotal(analysis, { filter = "any", filterMode = null, operator }) {
  const resolved = analysis.resolvedCapturedPiece()
  if (!resolved) { return 0 }
  if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return 0 }
  switch (operator) {
    case "count":
      return 1
    case "value":
      return analysis.individualComparableValue(resolved.species)
    default:
      throw new Error(`Unsupported V2 unary operator for captured_piece: ${operator}`)
  }
}

function enemyCapturedPieceUnaryTotal(analysis, { filter = "any", filterMode = null, operator }) {
  const resolved = analysis.resolvedEnemyCapturedPiece()
  if (!resolved) { return 0 }
  if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return 0 }
  switch (operator) {
    case "count":
      return 1
    case "value":
      return analysis.individualComparableValue(resolved.species)
    default:
      throw new Error(`Unsupported V2 unary operator for enemy_captured_piece: ${operator}`)
  }
}

function enemyMovedPieceUnaryTotal(analysis, { filter = "any", filterMode = null, operator, boardScope = AFTER_BOARD }) {
  return profileCollector.measure('cma.v2.enemy_moved_piece_unary_total', () => {
    const resolved = analysis.resolvedEnemyMovedPiece(boardScope)
    if (!resolved) { return 0 }
    if (!analysis.matchesFilter({ species: resolved.species, filter, filterMode })) { return 0 }
    switch (operator) {
      case "count":
        return 1
      case "value":
        return analysis.individualComparableValue(resolved.species)
      case "mobility":
        if (!resolved.presentOnBoard) return 0
        return analysis.positionMobility(resolved.position, boardScope)
      default:
        throw new Error(`Unsupported V2 unary operator for enemy_moved_piece: ${operator}`)
    }
  })
}
