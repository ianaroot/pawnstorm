import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import MatchRunner from 'gameplay/match_runner'

import { buildBoard, getMove, position } from 'gameplay/__tests__/helpers'

describe('MatchRunner', () => {
  it('uses the current team provider to select and apply a move', () => {
    const board = buildBoard({
      pieces: {
        e2: 'wP',
        e7: 'bP',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const whiteMove = getMove('e2', 'e4', board)
    const blackProvider = { selectMove: () => null }
    const whiteProvider = { selectMove: () => whiteMove }

    const runner = new MatchRunner({
      board,
      moveProviders: {
        [Board.WHITE]: whiteProvider,
        [Board.BLACK]: blackProvider
      }
    })

    const result = runner.playTurn()

    expect(result).toEqual({
      team: Board.WHITE,
      moveObject: whiteMove
    })
    expect(board.pieceObject(position('e4'))).toBe(Board.WHITE_PAWN)
    expect(board.allowedToMove).toBe(Board.BLACK)
  })

  it('alternates providers across plies', () => {
    const board = buildBoard({
      pieces: {
        e2: 'wP',
        e7: 'bP',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const whiteProvider = {
      selectMove: ({ board: currentBoard }) => getMove('e2', 'e4', currentBoard)
    }
    const blackProvider = {
      selectMove: ({ board: currentBoard }) => getMove('e7', 'e5', currentBoard)
    }

    const runner = new MatchRunner({
      board,
      moveProviders: {
        [Board.WHITE]: whiteProvider,
        [Board.BLACK]: blackProvider
      }
    })

    const turns = runner.play({ maxPlies: 2 })

    expect(turns).toHaveLength(2)
    expect(turns[0].team).toBe(Board.WHITE)
    expect(turns[1].team).toBe(Board.BLACK)
    expect(board.pieceObject(position('e4'))).toBe(Board.WHITE_PAWN)
    expect(board.pieceObject(position('e5'))).toBe(Board.BLACK_PAWN)
    expect(board.allowedToMove).toBe(Board.WHITE)
  })

  it('returns null without mutating the board when a provider yields no move', () => {
    const board = buildBoard({
      pieces: {
        e2: 'wP',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const runner = new MatchRunner({
      board,
      moveProviders: {
        [Board.WHITE]: { selectMove: () => null },
        [Board.BLACK]: { selectMove: () => null }
      }
    })

    expect(runner.playTurn()).toBe(null)
    expect(board.pieceObject(position('e2'))).toBe(Board.WHITE_PAWN)
    expect(board.allowedToMove).toBe(Board.WHITE)
  })

  it('throws when the current side has no configured move provider', () => {
    const board = buildBoard({
      pieces: {
        e2: 'wP',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const runner = new MatchRunner({
      board,
      moveProviders: {
        [Board.BLACK]: { selectMove: () => null }
      }
    })

    expect(() => runner.selectMove()).toThrow(/No move provider configured/)
  })
})
