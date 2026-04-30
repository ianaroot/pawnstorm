import Board from 'gameplay/board'

export const PAWN_CAP_PER_TEAM = 8

export function legalPlacementForSpecies(position, species) {
  if (species !== Board.PAWN) { return true }
  const rank = Board.rankIndex(position)
  return rank !== 0 && rank !== 7
}

export function teamHasKing(pieces, team) {
  const code = `${team}${Board.KING}`
  for (const piece of pieces.values()) {
    if (piece === code) { return true }
  }
  return false
}

export function pawnCount(pieces, team) {
  const code = `${team}${Board.PAWN}`
  let count = 0
  for (const piece of pieces.values()) {
    if (piece === code) { count += 1 }
  }
  return count
}

function teamOf(piece) { return piece.charAt(0) }
function speciesOf(piece) { return piece.slice(1) }

export function placePiece(pieces, position, piece) {
  if (pieces.has(position)) { return null }
  const species = speciesOf(piece)
  const team = teamOf(piece)

  if (!legalPlacementForSpecies(position, species)) { return null }
  if (species === Board.KING && teamHasKing(pieces, team)) { return null }
  if (species === Board.PAWN && pawnCount(pieces, team) >= PAWN_CAP_PER_TEAM) { return null }

  const result = new Map(pieces)
  result.set(position, piece)
  return result
}

export function removePiece(pieces, position) {
  if (!pieces.has(position)) { return pieces }
  const result = new Map(pieces)
  result.delete(position)
  return result
}

export function placePieces(pieces, placements) {
  let result = pieces
  for (const { position, piece } of placements) {
    result = placePiece(result, position, piece)
    if (result === null) { return null }
  }
  return result
}

export function piecesSatisfyInvariants(pieces) {
  const teamPawnCounts = new Map()
  const teamKingPresence = new Map()
  for (const [position, piece] of pieces.entries()) {
    const species = speciesOf(piece)
    const team = teamOf(piece)
    if (!legalPlacementForSpecies(position, species)) { return false }
    if (species === Board.KING) {
      if (teamKingPresence.get(team)) { return false }
      teamKingPresence.set(team, true)
    }
    if (species === Board.PAWN) {
      const next = (teamPawnCounts.get(team) ?? 0) + 1
      if (next > PAWN_CAP_PER_TEAM) { return false }
      teamPawnCounts.set(team, next)
    }
  }
  return true
}
