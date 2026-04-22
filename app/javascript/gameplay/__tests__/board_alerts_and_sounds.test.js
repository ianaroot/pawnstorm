import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'

function boardWithLastNotation(lastNotation, options = {}) {
  return new Board({
    movementNotation: lastNotation ? [lastNotation] : [],
    ...options
  })
}

describe('Board#getAlertsAndSounds', () => {
  it('plays the move sound for quiet moves', () => {
    expect(boardWithLastNotation('1. e4').getAlertsAndSounds()).toEqual({
      alert: '',
      sound: 'move'
    })
  })

  it('plays the capture sound for captures', () => {
    expect(boardWithLastNotation('1. exd5').getAlertsAndSounds()).toEqual({
      alert: '',
      sound: 'capture'
    })
  })

  it('plays the check sound for checks', () => {
    expect(boardWithLastNotation('Qh5+').getAlertsAndSounds()).toEqual({
      alert: 'check',
      sound: 'check'
    })
  })

  it('plays the check sound for captures that give check', () => {
    expect(boardWithLastNotation('Qxf7+').getAlertsAndSounds()).toEqual({
      alert: 'check',
      sound: 'check'
    })
  })

  it('plays the check sound for captures that give checkmate', () => {
    expect(boardWithLastNotation('Qxf7#').getAlertsAndSounds()).toEqual({
      alert: 'checkmate',
      sound: 'check'
    })
  })
})
