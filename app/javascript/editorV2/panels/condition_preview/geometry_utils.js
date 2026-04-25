import Board from 'gameplay/board'
import { nextPositionOnRay, knightControlledSquares, kingControlledSquares, ROOK_RAY_STEPS, BISHOP_RAY_STEPS, QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'

export { QUEEN_RAY_STEPS as RAY_STEPS }

export function adjacentNeighborPositions(position) {
  return kingControlledSquares(position)
}

export function positionsForSliderOrigins(endPosition, steps) {
  const origins = []
  steps.forEach(step => {
    for (let current = nextPositionOnRay(endPosition, step); current !== null; current = nextPositionOnRay(current, step)) {
      origins.push(current)
    }
  })
  return origins
}

export function originCandidatesForSpecies(endPosition, species) {
  switch (species) {
    case Board.PAWN:
      return [endPosition - 8, endPosition - 16].filter(position => Board._inBounds(position))
    case Board.NIGHT:
      return knightControlledSquares(endPosition)
    case Board.BISHOP:
      return positionsForSliderOrigins(endPosition, BISHOP_RAY_STEPS)
    case Board.ROOK:
      return positionsForSliderOrigins(endPosition, ROOK_RAY_STEPS)
    case Board.QUEEN:
      return positionsForSliderOrigins(endPosition, QUEEN_RAY_STEPS)
    case Board.KING:
      return kingControlledSquares(endPosition)
    default:
      return []
  }
}

export function shieldAttackerSpeciesForStep(step) {
  return ROOK_RAY_STEPS.includes(step) ? [Board.ROOK, Board.QUEEN] : [Board.BISHOP, Board.QUEEN]
}

export function relationSquareDistance(subjectPosition, targetPosition) {
  if (subjectPosition === undefined || targetPosition === undefined) {
    return Number.POSITIVE_INFINITY
  }
  const fileDiff = Math.abs(Board.fileIndex(subjectPosition) - Board.fileIndex(targetPosition))
  const rankDiff = Math.abs(Board.rankIndex(subjectPosition) - Board.rankIndex(targetPosition))
  return fileDiff + rankDiff
}

export function sortByDistanceFromRelation(positions, relationPositions) {
  const distanceFor = (position) => relationPositions.reduce((best, relatedPosition) => {
    const fileDiff = Math.abs(Board.fileIndex(position) - Board.fileIndex(relatedPosition))
    const rankDiff = Math.abs(Board.rankIndex(position) - Board.rankIndex(relatedPosition))
    return Math.min(best, fileDiff + rankDiff)
  }, Number.POSITIVE_INFINITY)

  return [...positions].sort((left, right) => distanceFor(right) - distanceFor(left))
}
