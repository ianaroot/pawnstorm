import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import NotationResolver from 'gameplay/notation_resolver'

import { buildBoard, playMoveSequence, position, square } from 'gameplay/__tests__/helpers'

describe('NotationResolver', () => {
  const resolver = new NotationResolver()

  it('resolves kingside castling from app notation', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK'
      }
    })

    const move = resolver.resolve({ board, notation: 'O-O' })

    expect(square(move.startPosition)).toBe('e1')
    expect(square(move.endPosition)).toBe('g1')
  })

  it('resolves en passant from app notation', () => {
    const board = buildBoard({
      pieces: {
        e5: 'wP',
        d5: 'bP',
        e1: 'wK',
        e8: 'bK'
      },
      movementNotation: ['h3', 'd5']
    })

    const move = resolver.resolve({ board, notation: 'exd6e.p.' })

    expect(square(move.startPosition)).toBe('e5')
    expect(square(move.endPosition)).toBe('d6')
  })

  it('resolves promotion notation', () => {
    const board = buildBoard({
      pieces: {
        e7: 'wP',
        a1: 'wK',
        h8: 'bK'
      }
    })

    const move = resolver.resolve({ board, notation: '1. e8=Q+' })

    expect(square(move.startPosition)).toBe('e7')
    expect(square(move.endPosition)).toBe('e8')
    expect(move.promotionPiece).toBe(Board.QUEEN)
  })

  it('resolves disambiguated knight notation', () => {
    const board = buildBoard({
      pieces: {
        c5: 'wN',
        g5: 'wN',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = resolver.resolve({ board, notation: 'Nce4' })

    expect(square(move.startPosition)).toBe('c5')
    expect(square(move.endPosition)).toBe('e4')
  })

  it('resolves notation through a longer real-game sequence', () => {
    const board = new Board({})
    playMoveSequence(board, [
      { from: 'd2', to: 'd4' },
      { from: 'd7', to: 'd5' },
      { from: 'c2', to: 'c4' },
      { from: 'd5', to: 'c4' },
      { from: 'g1', to: 'f3' },
      { from: 'c4', to: 'c3' },
      { from: 'e2', to: 'e3' },
      { from: 'c3', to: 'b2' },
      { from: 'f1', to: 'e2' },
      { from: 'b2', to: 'a1' },
      { from: 'e1', to: 'g1' },
      { from: 'a1', to: 'b1' },
      { from: 'd4', to: 'd5' },
      { from: 'c7', to: 'c5' },
      { from: 'd5', to: 'c6' },
      { from: 'b1', to: 'c1' },
      { from: 'c6', to: 'b7' },
      { from: 'b8', to: 'c6' }
    ])

    const move = resolver.resolve({ board, notation: '10. b8=Q' })

    expect(square(move.startPosition)).toBe('b7')
    expect(square(move.endPosition)).toBe('b8')
    expect(move.promotionPiece).toBe(Board.QUEEN)
  })
})
