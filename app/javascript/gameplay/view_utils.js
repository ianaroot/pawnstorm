import Board from "gameplay/board"

const unicodePieces = {
  WK: '\&#9812',
  BK: '\&#9818',
  WQ: '\&#9813',
  BQ: '\&#9819',
  WR: '\&#9814',
  BR: '\&#9820',
  WB: '\&#9815',
  BB: '\&#9821',
  WN: '\&#9816',
  BN: '\&#9822',
  WP: '\&#9817',
  BP: '\&#9823'
}

export function displayAlerts(message) {
  const notifications = document.getElementById('notifications')
  if (!notifications) { return }
  notifications.innerHTML = message
}

export function clearAlerts() {
  const notifications = document.getElementById('notifications')
  if (!notifications) { return }
  notifications.innerHTML = ""
}

export function undisplayPiece(gridPosition) {
  const element = document.getElementById(gridPosition)
  if (!element) { return }

  element.innerHTML = ""
  element.classList.remove(Board.WHITE)
  element.classList.remove(Board.BLACK)
}

export function displayPiece({ pieceInitials, gridPosition }) {
  const element = document.getElementById(gridPosition)
  if (!element) { return }

  element.innerHTML = ""
  element.appendChild(buildPieceGlyph(pieceInitials))
  element.classList.add(pieceInitials[0])
  element.style.color = "black"
}

function buildPieceGlyph(pieceInitials, className = 'board-piece-glyph') {
  const glyph = document.createElement('span')
  glyph.className = `${className} ${pieceInitials[0]}`
  glyph.innerHTML = unicodePieces[pieceInitials]
  return glyph
}

export function pieceInitials(pieceObject) {
  return Board.parseTeam(pieceObject) + Board.parseSpecies(pieceObject)
}

export function renderBoardPieces(board) {
  const layOut = board.layOut
  for (let i = 0; i < layOut.length; i++) {
    const gridPosition = Board.gridCalculator(i)
    undisplayPiece(gridPosition)
    const pieceObject = board.pieceObject(i)
    if (Board.parseTeam(pieceObject) !== Board.EMPTY) {
      displayPiece({ pieceInitials: pieceInitials(pieceObject), gridPosition })
    }
  }
}

export function updateTeamAllowedToMove(board) {
  const span = document.getElementById("team-allowed-to-move")
  if (!span) { return }
  span.innerText = board.allowedToMove
}

export function updateCaptures(board) {
  const blackCaptureDiv = document.getElementById("B-captures")
  const whiteCaptureDiv = document.getElementById("W-captures")
  if (!blackCaptureDiv || !whiteCaptureDiv) { return }
  blackCaptureDiv.innerHTML = "<br><br><br>"
  whiteCaptureDiv.innerHTML = "<br><br><br>"
  for (let i = 0; i < board.capturedPieces.length; i++) {
    const pieceObject = board.capturedPieces[i]
    const team = Board.parseTeam(pieceObject)
    const captureDiv = document.getElementById(team + "-captures")
    if (!captureDiv) { continue }
    captureDiv.appendChild(buildPieceGlyph(pieceInitials(pieceObject), 'capture-piece-glyph'))
  }
}

function capturedCountForTeam(board, team) {
  let total = 0
  for (let i = 0; i < board.capturedPieces.length; i++) {
    if (Board.parseTeam(board.capturedPieces[i]) === team) { total++ }
  }
  return total
}

export function updateCaptureAreaSizing(board) {
  const whiteCaptureDiv = document.getElementById("W-captures")
  const blackCaptureDiv = document.getElementById("B-captures")
  if (whiteCaptureDiv && capturedCountForTeam(board, Board.WHITE) === 11) {
    whiteCaptureDiv.style.height = 98
  }
  if (blackCaptureDiv && capturedCountForTeam(board, Board.BLACK) === 11) {
    blackCaptureDiv.style.height = 98
  }
}
