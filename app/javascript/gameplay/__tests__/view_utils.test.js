import { updateTeamAllowedToMove } from 'gameplay/view_utils'

describe('updateTeamAllowedToMove', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <span id="team-allowed-to-move"></span>
      <div class="board-player-name" data-team="B"></div>
      <div class="board-player-name" data-team="W"></div>
    `
  })

  const labelFor = team => document.querySelector(`.board-player-name[data-team="${team}"]`)
  const isActive = team => labelFor(team).classList.contains('board-player-name--active')

  it('still sets the turn-marker text when the span is present (sandbox)', () => {
    updateTeamAllowedToMove({ allowedToMove: 'W' })
    expect(document.getElementById('team-allowed-to-move').innerText).toBe('W')
  })

  it('highlights the name label of the team to move', () => {
    updateTeamAllowedToMove({ allowedToMove: 'W' })
    expect(isActive('W')).toBe(true)
    expect(isActive('B')).toBe(false)
  })

  it('moves the highlight when the turn changes', () => {
    updateTeamAllowedToMove({ allowedToMove: 'W' })
    updateTeamAllowedToMove({ allowedToMove: 'B' })
    expect(isActive('W')).toBe(false)
    expect(isActive('B')).toBe(true)
  })

  it('does not throw when neither span nor labels are present', () => {
    document.body.innerHTML = ''
    expect(() => updateTeamAllowedToMove({ allowedToMove: 'W' })).not.toThrow()
  })
})
