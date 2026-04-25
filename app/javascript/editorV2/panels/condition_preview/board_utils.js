import Board from 'gameplay/board'

export function square(value) {
  return Board.gridCalculatorReverse(value)
}

export function emptyLayout() {
  return Array(64).fill(Board.EMPTY_SQUARE)
}

export function pieceCode(team, species) {
  return `${team}${species}`
}

export function pieceTeam(piece) {
  return piece ? Board.parseTeam(piece) : null
}

export function pieceSpecies(piece) {
  return piece ? Board.parseSpecies(piece) : null
}

export function rankForPosition(position) {
  return Math.floor(position / 8)
}

export function legalPlacementForSpecies(position, species) {
  if (species !== Board.PAWN) { return true }
  const rank = rankForPosition(position)
  return rank !== 0 && rank !== 7
}

export function unique(values) {
  return Array.from(new Set(values))
}

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
  const layout = emptyLayout()
  pieces.forEach((piece, position) => {
    layout[position] = piece
  })
  return layout
}

export function buildBoardFromLayout(layout, recentMoveContext = null) {
  return new Board({
    layOut: layout,
    capturedPieces: [],
    allowedToMove: Board.WHITE,
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
