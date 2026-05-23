import { applyBoardOrientation } from 'gameplay/board_orientation'

function buildArena() {
  const arena = document.createElement('div')
  arena.innerHTML = `
    <div class="board-player-name" data-board-name="top"></div>
    <div id="W-captures"></div>
    <table id="chess-board"></table>
    <div id="B-captures"></div>
    <div class="board-player-name" data-board-name="bottom"></div>
  `
  return arena
}

describe('applyBoardOrientation', () => {
  let arena, board, top, bottom

  beforeEach(() => {
    arena = buildArena()
    board = arena.querySelector('#chess-board')
    top = arena.querySelector('[data-board-name="top"]')
    bottom = arena.querySelector('[data-board-name="bottom"]')
  })

  it('keeps white on the bottom by default', () => {
    applyBoardOrientation(arena, { flipped: false, whiteName: 'Alice', blackName: 'Bob' })
    expect(board.classList.contains('flipped')).toBe(false)
    expect(top.textContent).toBe('Bob')
    expect(top.dataset.team).toBe('B')
    expect(bottom.textContent).toBe('Alice')
    expect(bottom.dataset.team).toBe('W')
    expect(board.previousElementSibling.id).toBe('W-captures')
    expect(board.nextElementSibling.id).toBe('B-captures')
  })

  it('puts black on the bottom when flipped', () => {
    applyBoardOrientation(arena, { flipped: true, whiteName: 'Alice', blackName: 'Bob' })
    expect(board.classList.contains('flipped')).toBe(true)
    expect(top.textContent).toBe('Alice')
    expect(top.dataset.team).toBe('W')
    expect(bottom.textContent).toBe('Bob')
    expect(bottom.dataset.team).toBe('B')
    expect(board.previousElementSibling.id).toBe('B-captures')
    expect(board.nextElementSibling.id).toBe('W-captures')
  })

  it('does not throw when the arena is absent', () => {
    expect(() => applyBoardOrientation(null, { flipped: true })).not.toThrow()
  })
})
