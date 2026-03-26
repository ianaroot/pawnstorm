import { describe, expect, it } from 'vitest'

import MovesCalculator from 'gameplay/moves_calculator'

import { buildBoard, moveTargets, position } from 'gameplay/__tests__/helpers'

describe('MovesCalculator', () => {
  describe('pawn captures', () => {
    it('generates normal white pawn captures on both diagonals', () => {
      const board = buildBoard({
        pieces: {
          e5: 'wP',
          d6: 'bN',
          f6: 'bB',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moves = new MovesCalculator({
        board,
        startPosition: position('e5')
      }).moveObjects

      expect(moveTargets(moves)).toEqual(['d6', 'e6', 'f6'])
    })

    it('does not generate a wraparound white pawn capture from h5 to a7', () => {
      const board = buildBoard({
        pieces: {
          h5: 'wP',
          a7: 'bQ',
          g6: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moves = new MovesCalculator({
        board,
        startPosition: position('h5')
      }).moveObjects

      expect(moveTargets(moves)).toContain('g6')
      expect(moveTargets(moves)).not.toContain('a7')
    })

    it('does not generate a wraparound black pawn capture from a4 to h2', () => {
      const board = buildBoard({
        pieces: {
          a4: 'bP',
          h2: 'wQ',
          b3: 'wN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moves = new MovesCalculator({
        board,
        startPosition: position('a4')
      }).moveObjects

      expect(moveTargets(moves)).toContain('b3')
      expect(moveTargets(moves)).not.toContain('h2')
    })
  })

  describe('board boundaries', () => {
    it('does not wrap rook movement horizontally across ranks', () => {
      const board = buildBoard({
        pieces: {
          h4: 'wR',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moves = new MovesCalculator({
        board,
        startPosition: position('h4')
      }).moveObjects

      expect(moveTargets(moves)).toContain('g4')
      expect(moveTargets(moves)).not.toContain('a5')
    })

    it('stops bishop movement at a friendly blocker and does not move beyond it', () => {
      const board = buildBoard({
        pieces: {
          c1: 'wB',
          e3: 'wP',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moves = new MovesCalculator({
        board,
        startPosition: position('c1')
      }).moveObjects

      expect(moveTargets(moves)).toEqual(['a3', 'b2', 'd2'])
      expect(moveTargets(moves)).not.toContain('e3')
      expect(moveTargets(moves)).not.toContain('f4')
    })

    it('lets a queen capture an enemy blocker but not move past it', () => {
      const board = buildBoard({
        pieces: {
          d4: 'wQ',
          g7: 'bN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moves = new MovesCalculator({
        board,
        startPosition: position('d4')
      }).moveObjects

      expect(moveTargets(moves)).toContain('g7')
      expect(moveTargets(moves)).not.toContain('h8')
    })

    it('does not wrap knight movement across the board edge', () => {
      const board = buildBoard({
        pieces: {
          h1: 'wN',
          e1: 'wK',
          e8: 'bK'
        }
      })

      const moves = new MovesCalculator({
        board,
        startPosition: position('h1')
      }).moveObjects

      expect(moveTargets(moves)).toEqual(['f2', 'g3'])
    })
  })
})
