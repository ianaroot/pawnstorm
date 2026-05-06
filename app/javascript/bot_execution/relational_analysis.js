import {
  adjacentPositions,
  cachedControlledSquares,
  coveredPositions,
  materialValue,
  shieldedPositions
} from "gameplay/board_query_utils"
import profileCollector from "gameplay/profile_collector"
import { unaryTotal } from "bot_execution/unary_analysis"
import { relationalActorPositions as baseRelationalActorPositions } from "bot_execution/actor_positions"
import { actorTeam } from "bot_execution/actor_teams"

const AFTER_BOARD = "after"
const PRIOR_BOARD = "prior"

export function samePiece(analysis, { subject, target }) {
  if (
    (subject === "enemy_moved_piece" && target === "captured_piece") ||
    (subject === "captured_piece" && target === "enemy_moved_piece")
  ) {
    return enemyMovedPieceMatchesCapturedPiece(analysis)
  } else {
    throw new Error(`Unsupported V2 samePiece comparison: ${subject} vs ${target}`)
  }
}

function enemyMovedPieceMatchesCapturedPiece(analysis) {
  const recentMove = analysis.board.recentMoveContext
  const capturedPiecePosition = analysis.capturedPiecePosition()
  const capturedPieceSpecies = analysis.capturedPieceSpecies()
  if (!recentMove || capturedPiecePosition === null || capturedPieceSpecies === null) {
    return false
  } else {
    return (
      recentMove.movedPieceEndPosition === capturedPiecePosition &&
      recentMove.movedPieceSpeciesAfterMove === capturedPieceSpecies
    )
  }
}

export function relationalResult(analysis, { subject, subjectFilter = "any", subjectFilterMode = null,
  operator,
  target, targetFilter = "any", targetFilterMode = null, boardScope = AFTER_BOARD
}) {
  const cacheKey = [
    boardScope,
    subject,
    subjectFilter,
    subjectFilterMode || "include",
    operator,
    target,
    targetFilter,
    targetFilterMode || "include"
  ].join(":")
  if (analysis._relationalResultCache.has(cacheKey)) {
    return analysis._relationalResultCache.get(cacheKey)
  }

  return profileCollector.measure('cma.v2.relational_result', () => {
    const candidateSubjectPositions = relationalActorPositions(analysis, { actor: subject, filter: subjectFilter, filterMode: subjectFilterMode, boardScope })
    const candidateTargetPositions = relationalActorPositions(analysis, { actor: target, filter: targetFilter, filterMode: targetFilterMode, boardScope })
    const candidateTargetPositionSet = profileCollector.measure('cma.v2.relational_result.target_set', () => new Set(candidateTargetPositions))
    const pairs = []
    candidateSubjectPositions.forEach((subjectPosition) => {
      const relatedTargetPositions = relatedTargetPositionsForSubject(analysis, { operator, subjectPosition, target, boardScope })
      relatedTargetPositions.forEach((targetPosition) => {
        if (!candidateTargetPositionSet.has(targetPosition)) { return }
        pairs.push({ subjectPosition, targetPosition })
      })
    })
    const result = {
      pairs,
      subjectPositions: analysis.uniquePositions(pairs.map(pair => pair.subjectPosition)),
      targetPositions: analysis.uniquePositions(pairs.map(pair => pair.targetPosition))
    }
    analysis._relationalResultCache.set(cacheKey, result)
    return result
  })
}

export function relationalActorPositions(analysis, { actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
  const cacheKey = `${boardScope}:${actor}:${filter}:${filterMode || "include"}`
  if (analysis._relationalActorPositionsCache.has(cacheKey)) {
    return analysis._relationalActorPositionsCache.get(cacheKey)
  }

  return profileCollector.measure('cma.v2.relational_actor_positions', () => {
    const positions = baseRelationalActorPositions(analysis, { actor, filter, filterMode, boardScope })
    analysis._relationalActorPositionsCache.set(cacheKey, positions)
    return positions
  })
}


function relatedTargetPositionsForSubject(analysis, { operator, subjectPosition, target, boardScope = AFTER_BOARD }) {
  const cacheKey = `${boardScope}:${operator}:${subjectPosition}:${target}`
  if (analysis._relatedTargetPositionsCache.has(cacheKey)) {
    return analysis._relatedTargetPositionsCache.get(cacheKey)
  }

  return profileCollector.measure('cma.v2.related_target_positions_for_subject', () => {
    const board = analysis.boardForScope(boardScope)
    const targetTeam = relationalTeamForActor(target, analysis.movedPieceTeam())
    let positions
    switch (operator) {
      case "attack": {
        const subjectTeam = board.teamAt(subjectPosition)
        positions = cachedControlledSquares({
          board,
          attackerPosition: subjectPosition,
          cache: analysis._boardQueryCache,
          cacheScope: boardScope
        }).filter((targetPosition) => {
          return board.teamAt(targetPosition) === targetTeam && targetTeam !== subjectTeam
        })
        break
      }
      case "defend": {
        const subjectTeam = board.teamAt(subjectPosition)
        positions = cachedControlledSquares({
          board,
          attackerPosition: subjectPosition,
          cache: analysis._boardQueryCache,
          cacheScope: boardScope
        }).filter((targetPosition) => {
          return board.teamAt(targetPosition) === targetTeam && targetTeam === subjectTeam
        })
        break
      }
      case "adjacent":
        positions = adjacentPositions({ board, targetPosition: subjectPosition, team: targetTeam })
        break
      case "shield":
        positions = shieldedPositions({ board, sourcePosition: subjectPosition, team: targetTeam })
        break
      case "cover":
        positions = coveredPositions({
          board,
          sourcePosition: subjectPosition,
          team: targetTeam,
          cache: analysis._boardQueryCache,
          cacheScope: boardScope
        })
        break
      default:
        throw new Error(`Unsupported V2 relational operator: ${operator}`)
    }
    analysis._relatedTargetPositionsCache.set(cacheKey, positions)
    return positions
  })
}

function relationalTeamForActor(actor, movingTeam) {
  switch (actor) {
    case "allied":
    case "moved_piece":
    case "enemy":
    case "enemy_moved_piece":
      return actorTeam(actor, movingTeam)
    case "captured_piece":
    case "enemy_captured_piece":
      throw new Error(`Captured types not supported in relational context: ${actor}`)
    default:
      throw new Error(`Unsupported V2 relational team actor: ${actor}`)
  }
}

export function metricForPositions(analysis, { metric, positions, boardScope = AFTER_BOARD }) {
  return profileCollector.measure('cma.v2.metric_for_positions', () => {
    switch (metric) {
      case "count":
        return positions.length
      case "individual_value":
      case "aggregate_value":
        return valueOfPositions(analysis, positions, boardScope)
      default:
        throw new Error(`Unsupported V2 relational metric: ${metric}`)
    }
  })
}

function valueOfPositions(analysis, positions, boardScope = AFTER_BOARD) {
  if (positions.length === 0) { return null }
  const board = analysis.boardForScope(boardScope)
  return positions.reduce((sum, position) => {
    return sum + materialValue(board.pieceTypeAt(position))
  }, 0)
}

export function comparisonSourceTotal(analysis, { comparisonSource, subject, subjectFilter = "any", subjectFilterMode = null, operator }) {
  return profileCollector.measure('cma.v2.comparison_source_total', () => {
    switch (comparisonSource) {
      case "moved_piece":
      case "enemy_moved_piece":
      case "captured_piece":
      case "enemy_captured_piece":
        return analysis.singularActorValue(comparisonSource)
      case "prior_board_state":
        return priorRelationalComparisonSourceTotal(analysis, { subject, subjectFilter, subjectFilterMode, operator })
      default:
        throw new Error(`Unsupported V2 comparison source: ${comparisonSource}`)
    }
  })
}

function priorRelationalComparisonSourceTotal(analysis, { subject, subjectFilter, subjectFilterMode, operator }) {
  return unaryTotal(analysis, { actor: subject, filter: subjectFilter, filterMode: subjectFilterMode, operator, boardScope: PRIOR_BOARD })
}
