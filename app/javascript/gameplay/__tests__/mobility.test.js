import { describe, expect, it } from 'vitest'

import { mobilityAt } from 'gameplay/mobility'
import { buildBoard, position } from 'gameplay/__tests__/helpers'

describe('mobilityAt', () => {
  it('counts a knight\'s moves from an open central square', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', d4: 'wN' }
    })
    expect(mobilityAt(board, position('d4'))).toBe(8)
  })

  it('counts a knight\'s moves from a corner', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', a1: 'wN' }
    })
    expect(mobilityAt(board, position('a1'))).toBe(2)
  })

  it('counts a promoting pawn\'s straight push as a single destination', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', a8: 'bK', e7: 'wP' }
    })
    expect(mobilityAt(board, position('e7'))).toBe(1)
  })

  it('counts a promoting pawn\'s push and capture as two destinations', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', a8: 'bK', e7: 'wP', d8: 'bN' }
    })
    expect(mobilityAt(board, position('e7'))).toBe(2)
  })
})
