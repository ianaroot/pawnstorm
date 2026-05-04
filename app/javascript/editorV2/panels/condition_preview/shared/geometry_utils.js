import Board from 'gameplay/board'
import { nextPositionOnRay, knightControlledSquares, kingControlledSquares, ROOK_RAY_STEPS, BISHOP_RAY_STEPS, QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'

export { QUEEN_RAY_STEPS as RAY_STEPS }

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

function sliderControlledSquaresFromBoard(position, steps, board) {
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

// Squares the piece at `position` on `board` controls (attacks/defends).
// Used when a singular actor is the SUBJECT of a relational position
// constraint — the dependent group-side piece must be placed at a square
// the singular reaches.
export function controlledSquaresForPieceAt(position, board) {
  const species = board.pieceTypeAt(position)
  if (!species || species === Board.EMPTY_SQUARE) { return [] }
  const team = board.teamAt(position)

  switch (species) {
    case Board.PAWN:   return pawnControlledSquares(position, team)
    case Board.NIGHT:  return knightControlledSquares(position)
    case Board.KING:   return kingControlledSquares(position)
    case Board.BISHOP: return sliderControlledSquaresFromBoard(position, BISHOP_RAY_STEPS, board)
    case Board.ROOK:   return sliderControlledSquaresFromBoard(position, ROOK_RAY_STEPS, board)
    case Board.QUEEN:  return sliderControlledSquaresFromBoard(position, QUEEN_RAY_STEPS, board)
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

// Pawn origin candidates depend on team: white pawns came from south of
// endPosition (rank - 1), black pawns from north (rank + 1). Diagonal capture
// origins are included so en-passant and regular pawn captures can be
// reconstructed by Rules.getMoveObject. File-wrap protected so a-file/h-file
// don't pull in cross-file diagonals.
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
      return candidates.filter(position => Board._inBounds(position))
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
