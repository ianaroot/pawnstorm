import Board from 'gameplay/board'
import { nextPositionOnRay, knightControlledSquares, kingControlledSquares, ROOK_RAY_STEPS, BISHOP_RAY_STEPS, QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'

export { QUEEN_RAY_STEPS as RAY_STEPS }

export function stepsForSliderSpecies(species) {
  if (species === Board.ROOK)   { return ROOK_RAY_STEPS }
  if (species === Board.BISHOP) { return BISHOP_RAY_STEPS }
  if (species === Board.QUEEN)  { return QUEEN_RAY_STEPS }
  return []
}

export function adjacentNeighborPositions(position) {
  return kingControlledSquares(position)
}

function pawnControlledSquares(position, team) {
  const file = position % 8
  const dir = team === Board.WHITE ? 1 : -1
  const result = []
  if (file > 0) { result.push(position + 8 * dir - 1) }
  if (file < 7) { result.push(position + 8 * dir + 1) }
  return result.filter(p => Board._inBounds(p))
}

export function raySquaresFrom(position, steps, board) {
  const squares = []
  for (const step of steps) {
    let current = nextPositionOnRay(position, step)
    while (current !== null) {
      squares.push(current)
      if (board.layOut[current] !== Board.EMPTY_SQUARE) { break }
      current = nextPositionOnRay(current, step)
    }
  }
  return squares
}

// Use raySquaresFrom when you want to stop at the first occupied square.
export function walkRay(position, step) {
  const positions = []
  let current = nextPositionOnRay(position, step)
  while (current !== null) {
    positions.push(current)
    current = nextPositionOnRay(current, step)
  }
  return positions
}

// Verifies that a piece of `species` could legally traverse the path from
// `fromSquare` to `toSquare` on a board described by `pieces`
export function pathClearOnPieces(pieces, fromSquare, toSquare, species) {
  if (species === Board.NIGHT || species === Board.KING || species === Board.PAWN) {
    return true
  }
  const step = sliderStepBetween(fromSquare, toSquare)
  if (step === null) { return false }
  let current = nextPositionOnRay(fromSquare, step)
  while (current !== null && current !== toSquare) {
    if (pieces.has(current)) { return false }
    current = nextPositionOnRay(current, step)
  }
  return current === toSquare
}

// Computes the slider-step direction (rook or bishop offset) between two
// squares, or null if they aren't on a common slider ray.
function sliderStepBetween(fromSquare, toSquare) {
  const fileDiff = (toSquare % 8) - (fromSquare % 8)
  const rankDiff = Math.floor(toSquare / 8) - Math.floor(fromSquare / 8)
  if (fileDiff === 0 && rankDiff === 0) { return null }
  if (fileDiff === 0)            { return rankDiff > 0 ?  8 : -8 }
  if (rankDiff === 0)            { return fileDiff > 0 ?  1 : -1 }
  if (Math.abs(fileDiff) === Math.abs(rankDiff)) {
    return (rankDiff > 0 ? 8 : -8) + (fileDiff > 0 ? 1 : -1)
  }
  return null
}

// Squares the piece at `position` on `board` controls (attacks/defends)
export function controlledSquaresForPieceAt(position, board) {
  const species = board.pieceTypeAt(position)
  if (!species || species === Board.EMPTY_SQUARE) { return [] }
  const team = board.teamAt(position)

  switch (species) {
    case Board.PAWN:   return pawnControlledSquares(position, team)
    case Board.NIGHT:  return knightControlledSquares(position)
    case Board.KING:   return kingControlledSquares(position)
    case Board.BISHOP: return raySquaresFrom(position, BISHOP_RAY_STEPS, board)
    case Board.ROOK:   return raySquaresFrom(position, ROOK_RAY_STEPS, board)
    case Board.QUEEN:  return raySquaresFrom(position, QUEEN_RAY_STEPS, board)
    default:           return []
  }
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

export function originCandidatesForSpecies(endPosition, species, team = Board.WHITE) {
  switch (species) {
    case Board.PAWN: {
      const file = endPosition % 8
      const dir = team === Board.BLACK ? 1 : -1
      const candidates = [
        endPosition + 8 * dir,   // forward one
        endPosition + 16 * dir   // forward two (initial double)
      ]
      if (file > 0) { candidates.push(endPosition + 8 * dir - 1) }  // diagonal capture from file - 1
      if (file < 7) { candidates.push(endPosition + 8 * dir + 1) }  // diagonal capture from file + 1
      return candidates.filter(position => {
        if (!Board._inBounds(position)) { return false }
        const rank = Math.floor(position / 8)
        return rank !== 0 && rank !== 7
      })
    }
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

// Squares from which a hypothetical (team, species) piece could attack
// targetPosition on `board`.
// For non-pawn species the geometry is symmetric with controlledSquares; for
// pawn it differs
export function attackerCandidatesFor(targetPosition, species, team, board) {
  switch (species) {
    case Board.PAWN:   return pawnControlledSquares(targetPosition, Board.opposingTeam(team))
    case Board.NIGHT:  return knightControlledSquares(targetPosition)
    case Board.KING:   return kingControlledSquares(targetPosition)
    case Board.BISHOP: return raySquaresFrom(targetPosition, BISHOP_RAY_STEPS, board)
    case Board.ROOK:   return raySquaresFrom(targetPosition, ROOK_RAY_STEPS, board)
    case Board.QUEEN:  return raySquaresFrom(targetPosition, QUEEN_RAY_STEPS, board)
    default:           return []
  }
}

export const SLIDER_SPECIES = Object.freeze(new Set([Board.ROOK, Board.BISHOP, Board.QUEEN]))

export function raySliderSpeciesForStep(step) {
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
