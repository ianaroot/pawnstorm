import Board from "gameplay/board"

export function applyBoardOrientation(arena, { flipped, whiteName, blackName }) {
  if (!arena) { return }
  const board = arena.querySelector('#chess-board')
  board?.classList.toggle('flipped', Boolean(flipped))

  const topLabel = arena.querySelector('[data-board-name="top"]')
  const bottomLabel = arena.querySelector('[data-board-name="bottom"]')
  if (topLabel) {
    topLabel.textContent = flipped ? whiteName : blackName
    topLabel.dataset.team = flipped ? Board.WHITE : Board.BLACK
  }
  if (bottomLabel) {
    bottomLabel.textContent = flipped ? blackName : whiteName
    bottomLabel.dataset.team = flipped ? Board.BLACK : Board.WHITE
  }

  const whiteCaptures = arena.querySelector('#W-captures')
  const blackCaptures = arena.querySelector('#B-captures')
  if (board && whiteCaptures && blackCaptures) {
    board.before(flipped ? blackCaptures : whiteCaptures)
    board.after(flipped ? whiteCaptures : blackCaptures)
  }
}
