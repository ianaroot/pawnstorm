import Board from 'gameplay/board'
import { placePiece } from './piece_placement'

export const MAX_PAWNS_PER_TEAM = 8

export function legalPlacementForSpecies(position, species) {
  if (species !== Board.PAWN) { return true }
  const rank = Board.rankIndex(position)
  return rank !== 0 && rank !== 7
}

export function unique(values) {
  return Array.from(new Set(values))
}

const WEIGHTED_SPECIES_DISTRIBUTION = Object.freeze([
  Board.PAWN, Board.PAWN, Board.PAWN, Board.PAWN,
  Board.PAWN, Board.PAWN, Board.PAWN, Board.PAWN,
  Board.ROOK, Board.ROOK,
  Board.NIGHT, Board.NIGHT,
  Board.BISHOP, Board.BISHOP,
  Board.QUEEN,
  Board.KING
])

export function shuffled(values, random) {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

export function weightedSpeciesCandidates({ includeKing = true, allowedSpecies = null } = {}) {
  const allowed = allowedSpecies ? new Set(allowedSpecies) : null
  return WEIGHTED_SPECIES_DISTRIBUTION.filter(species => {
    if (!includeKing && species === Board.KING) { return false }
    if (allowed && !allowed.has(species)) { return false }
    return true
  })
}

export function weightedRandomSpecies(random, options = {}) {
  const candidates = weightedSpeciesCandidates(options)
  if (candidates.length === 0) { return null }
  return candidates[Math.floor(random() * candidates.length)]
}

export function pushUnique(queue, seenKeys, entry, key) {
  if (seenKeys.has(key)) { return }
  seenKeys.add(key)
  queue.push(entry)
}

export function clonePiecesMap(piecesMap) {
  return new Map(piecesMap)
}

export function squareIsOccupied(pieces, position) {
  return pieces.has(position)
}

export function buildLayoutFromPieces(pieces) {
  const layout = Array(64).fill(Board.EMPTY_SQUARE)
  pieces.forEach((piece, position) => {
    layout[position] = piece
  })
  return layout
}

export function buildBoardFromLayout(layout, recentMoveContext = null, allowedToMove = Board.WHITE) {
  return new Board({
    layOut: layout,
    capturedPieces: [],
    allowedToMove,
    movementNotation: [],
    recentMoveContext
  })
}

export function layoutsMatch(left, right) {
  if (left.length !== right.length) { return false }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) { return false }
  }
  return true
}

export function occupiedCount(board) {
  return board.layOut.filter(piece => piece !== Board.EMPTY_SQUARE).length
}

// ===== New utilities =====

export function teamHasKing(pieces, team) {
  const kingCode = `${team}${Board.KING}`
  for (const piece of pieces.values()) {
    if (piece === kingCode) { return true }
  }
  return false
}

export function pawnsOnTeam(pieces, team) {
  const pawnCode = `${team}${Board.PAWN}`
  let count = 0
  for (const piece of pieces.values()) {
    if (piece === pawnCode) { count += 1 }
  }
  return count
}

export function legalEnrichmentSpecies(pieces, team) {
  const excludePawns = pawnsOnTeam(pieces, team) >= MAX_PAWNS_PER_TEAM
  return WEIGHTED_SPECIES_DISTRIBUTION.filter(species => {
    if (species === Board.KING) { return false }
    if (species === Board.PAWN && excludePawns) { return false }
    return true
  })
}

function squaresAreAdjacent(a, b) {
  return (
    Math.abs(Board.rankIndex(a) - Board.rankIndex(b)) <= 1 &&
    Math.abs(Board.fileIndex(a) - Board.fileIndex(b)) <= 1 &&
    a !== b
  )
}

function anyKingIsAdjacentTo(pieces, position) {
  for (const [sq, piece] of pieces.entries()) {
    if (
      (piece === Board.WHITE_KING || piece === Board.BLACK_KING) &&
      squaresAreAdjacent(sq, position)
    ) {
      return true
    }
  }
  return false
}

export function placeKingsIfAbsent(pieces, random) {
  let result = pieces

  for (const team of [Board.WHITE, Board.BLACK]) {
    if (teamHasKing(result, team)) { continue }

    const candidates = shuffled(
      Array.from({ length: 64 }, (_, i) => i).filter(pos => !result.has(pos)),
      random
    )

    let placed = false
    for (const pos of candidates) {
      if (anyKingIsAdjacentTo(result, pos)) { continue }
      const next = placePiece(result, pos, `${team}${Board.KING}`)
      if (next === null) { continue }
      result = next
      placed = true
      break
    }
    if (!placed) { return null }
  }

  return result
}
