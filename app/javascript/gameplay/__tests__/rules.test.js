import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'

import {
  buildBoard,
  getMove,
  moveTargets,
  playMoveSequence,
  position
} from 'gameplay/__tests__/helpers'

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function expectNotation(board, notation) {
  expect(board.movementNotation.at(-1)).toMatch(
    new RegExp(`^(\\d+\\. )?${escapeRegExp(notation)}$`)
  )
}

describe('Rules en passant', () => {
  it('returns a legal en passant move for white after a black double step', () => {
    const board = buildBoard({
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd5'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e5: 'wP',
        d5: 'bP'
      }
    })

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).not.toBe(true)
    expect(move.captureNotation).toBe('x')
    expect(move.notation()).toBe('exd6')

    board._officiallyMovePiece(move)

    expect(board.pieceObject(position('d6'))).toBe(Board.WHITE_PAWN)
    expect(board.pieceObject(position('d5'))).toBe(Board.EMPTY_SQUARE)
    expectNotation(board, 'exd6e.p.')
  })

  it('does not allow en passant after a black pawn reached the adjacent square by single step', () => {
    const board = buildBoard({
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd6', 'a3', 'd5'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e5: 'wP',
        d5: 'bP'
      }
    })

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow en passant after a black double step that was not the most recent move', () => {
    const board = buildBoard({
      allowedToMove: Board.WHITE,
      movementNotation: ['h3', 'd5', 'a3', 'Nc6'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e5: 'wP',
        d5: 'bP',
        c6: 'bN'
      }
    })

    const move = Rules.getMoveObject(position('e5'), position('d6'), board)

    expect(move.illegal).toBe(true)
  })

  it('returns a legal en passant move for black after a white double step', () => {
    const board = buildBoard({
      allowedToMove: Board.BLACK,
      movementNotation: ['e4'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d4: 'bP',
        e4: 'wP'
      }
    })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).not.toBe(true)
    expect(move.captureNotation).toBe('x')
    expect(move.notation()).toBe('dxe3')

    board._officiallyMovePiece(move)

    expect(board.pieceObject(position('e3'))).toBe(Board.BLACK_PAWN)
    expect(board.pieceObject(position('e4'))).toBe(Board.EMPTY_SQUARE)
    expectNotation(board, 'dxe3e.p.')
  })

  it('does not allow en passant for black after a white pawn reached the adjacent square by single step', () => {
    const board = buildBoard({
      allowedToMove: Board.BLACK,
      movementNotation: ['e3', 'h6', 'e4'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d4: 'bP',
        e4: 'wP'
      }
    })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow en passant for black after a white double step that was not the most recent move', () => {
    const board = buildBoard({
      allowedToMove: Board.BLACK,
      movementNotation: ['e4', 'h6', 'Nc3'],
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d4: 'bP',
        e4: 'wP',
        c3: 'wN'
      }
    })

    const move = Rules.getMoveObject(position('d4'), position('e3'), board)

    expect(move.illegal).toBe(true)
  })
})

describe('Rules attack and legality', () => {
  it('detects a rook attack on the king square', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e7: 'bR'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(true)
  })

  it('does not report an attack when a blocking piece interrupts the line', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e7: 'bR',
        e4: 'wB'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(false)
  })

  it('detects a knight attack on the king square', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        f3: 'bN'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(true)
  })

  it('detects a pawn attack on the king square', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        d2: 'bP'
      }
    })

    expect(Rules.pieceIsAttacked({ board, defensePosition: position('e1') })).toBe(true)
  })

  it('filters out moves that would expose the moving side king to attack', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e2: 'wR',
        e7: 'bR'
      }
    })

    const legalTargets = moveTargets(
      Rules.availableMovesFrom({ board, startPosition: position('e2') })
    )

    expect(legalTargets).toEqual(['e3', 'e4', 'e5', 'e6', 'e7'])
    expect(legalTargets).not.toContain('d2')
    expect(legalTargets).not.toContain('f2')
  })

  it('only allows a pinned rook to move along the line that keeps its king protected', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e2: 'wR',
        e8: 'bK',
        e7: 'bR'
      }
    })

    const legalTargets = moveTargets(
      Rules.availableMovesFrom({ board, startPosition: position('e2') })
    )

    expect(legalTargets).toEqual(['e3', 'e4', 'e5', 'e6', 'e7'])
    expect(legalTargets).not.toContain('d2')
    expect(legalTargets).not.toContain('f2')
  })
})

describe('Rules castling', () => {
  it('allows kingside castling when the path is clear and untouched', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).not.toBe(true)
    expect(move.notation()).toBe('O-O')
  })

  it('does not allow castling out of check', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK',
        e7: 'bR'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling through check', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK',
        f7: 'bR'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling when a piece blocks the path', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        f1: 'wB',
        e8: 'bK'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling if the rook moved away and returned', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK',
        a7: 'bP'
      }
    })

    playMoveSequence(board, [
      { from: 'h1', to: 'h2' },
      { from: 'a7', to: 'a6' },
      { from: 'h2', to: 'h1' },
      { from: 'a6', to: 'a5' }
    ])

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling if the king moved away and returned', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK',
        a7: 'bP'
      }
    })

    playMoveSequence(board, [
      { from: 'e1', to: 'e2' },
      { from: 'a7', to: 'a6' },
      { from: 'e2', to: 'e1' },
      { from: 'a6', to: 'a5' }
    ])

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })

  it('does not allow castling if the rook has been captured', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('e1', 'g1', board)

    expect(move.illegal).toBe(true)
  })
})

describe('Rules notation recording', () => {
  it('records a simple pawn move', () => {
    const board = buildBoard({
      pieces: {
        e2: 'wP',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('e2', 'e4', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'e4')
  })

  it('records a simple piece move', () => {
    const board = buildBoard({
      pieces: {
        g1: 'wN',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('g1', 'f3', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'Nf3')
  })

  it('records a simple capture', () => {
    const board = buildBoard({
      pieces: {
        d1: 'wQ',
        d4: 'bP',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('d1', 'd4', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'Qxd4')
  })

  it('records a check suffix', () => {
    const board = buildBoard({
      pieces: {
        d1: 'wQ',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('d1', 'h5', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'Qh5+')
  })

  it('records castling in movement notation', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        h1: 'wR',
        e8: 'bK'
      }
    })

    const move = getMove('e1', 'g1', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'O-O')
  })

  it('records queen promotion with check in movement notation', () => {
    const board = buildBoard({
      pieces: {
        e7: 'wP',
        a1: 'wK',
        h8: 'bK'
      }
    })

    const move = getMove('e7', 'e8', board)
    expect(move.promotionPiece).toBe(Board.QUEEN)
    expect(move.notation()).toBe('e8=Q')
    board._officiallyMovePiece(move)

    expectNotation(board, 'e8=Q+')
    expect(board.pieceObject(position('e8'))).toBe(Board.WHITE_QUEEN)
  })

  it('records queen promotion in movement notation when it does not give check', () => {
    const board = buildBoard({
      pieces: {
        e7: 'wP',
        a1: 'wK',
        h7: 'bK'
      }
    })

    const move = getMove('e7', 'e8', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'e8=Q')
    expect(board.pieceObject(position('e8'))).toBe(Board.WHITE_QUEEN)
  })

  it('generates four promotion move objects for a pawn reaching the back rank', () => {
    const board = buildBoard({
      pieces: {
        e7: 'wP',
        a1: 'wK',
        h8: 'bK'
      }
    })

    const promotionMoves = Rules.availableMovesFrom({ board, startPosition: position('e7') })
      .filter(moveObject => moveObject.endPosition === position('e8'))

    expect(promotionMoves.map(moveObject => moveObject.promotionPiece).sort()).toEqual([
      Board.BISHOP,
      Board.NIGHT,
      Board.QUEEN,
      Board.ROOK
    ])
  })

  it('can select a non-queen promotion move when multiple promotions share a destination', () => {
    const board = buildBoard({
      pieces: {
        e7: 'wP',
        a1: 'wK',
        h8: 'bK'
      }
    })

    const move = getMove('e7', 'e8', board, Board.NIGHT)
    board._officiallyMovePiece(move)

    expect(move.promotionPiece).toBe(Board.NIGHT)
    expect(move.notation()).toBe('e8=N')
    expect(board.pieceObject(position('e8'))).toBe(Board.WHITE_NIGHT)
    expectNotation(board, 'e8=N')
  })

  it('generates capture promotions with distinct promotion pieces', () => {
    const board = buildBoard({
      pieces: {
        d7: 'wP',
        e8: 'bR',
        a1: 'wK',
        h8: 'bK'
      }
    })

    const promotionCaptures = Rules.availableMovesFrom({ board, startPosition: position('d7') })
      .filter(moveObject => moveObject.endPosition === position('e8'))

    expect(promotionCaptures.map(moveObject => moveObject.promotionPiece).sort()).toEqual([
      Board.BISHOP,
      Board.NIGHT,
      Board.QUEEN,
      Board.ROOK
    ])
    expect(promotionCaptures.every(moveObject => moveObject.captureNotation === 'x')).toBe(true)
  })

  it('applies promotion immediately on hypothetical boards', () => {
    const board = buildBoard({
      pieces: {
        e7: 'wP',
        a1: 'wK',
        h8: 'bK'
      }
    })

    const move = Rules.availableMovesFrom({ board, startPosition: position('e7') })
      .find(moveObject => moveObject.endPosition === position('e8') && moveObject.promotionPiece === Board.QUEEN)
    const copy = board.deepCopy()

    copy._hypotheticallyMovePiece(move)

    expect(copy.pieceObject(position('e8'))).toBe(Board.WHITE_QUEEN)
  })

  it('will eventually record move numbers alongside notation', () => {
    const board = buildBoard({
      pieces: {
        e2: 'wP',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('e2', 'e4', board)
    board._officiallyMovePiece(move)

    expect(board.movementNotation.at(-1)).toBe('1. e4')
  })

  it('will eventually disambiguate rook moves that share a destination', () => {
    const board = buildBoard({
      pieces: {
        a4: 'wR',
        h4: 'wR',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('a4', 'd4', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'Rad4')
  })

  it('will eventually disambiguate knight moves that share a destination', () => {
    const board = buildBoard({
      pieces: {
        c5: 'wN',
        g5: 'wN',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('c5', 'e4', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'Nce4')
  })

  it('will eventually disambiguate bishop moves that share a destination', () => {
    const board = buildBoard({
      pieces: {
        b3: 'wB',
        f3: 'wB',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('b3', 'd5', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'Bbd5')
  })

  it('will eventually disambiguate queen moves that share a destination', () => {
    const board = buildBoard({
      pieces: {
        d1: 'wQ',
        d5: 'wQ',
        e1: 'wK',
        e8: 'bK'
      }
    })

    const move = getMove('d1', 'd3', board)
    board._officiallyMovePiece(move)

    expectNotation(board, 'Q1d3')
  })

  it('records a full game notation sequence from the standard starting position', () => {
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
      { from: 'b8', to: 'c6' },
      { from: 'b7', to: 'b8' },
      { from: 'g8', to: 'f6' },
      { from: 'd1', to: 'c1' },
      { from: 'f6', to: 'd5' },
      { from: 'c1', to: 'd2' },
      { from: 'd5', to: 'b4' },
      { from: 'f1', to: 'd1' },
      { from: 'c6', to: 'a5' },
      { from: 'd2', to: 'd8' }
    ])

    expect(board.movementNotation).toEqual([
      '1. d4', 'd5',
      '2. c4', 'dxc4',
      '3. Nf3', 'c3',
      '4. e3', 'cxb2',
      '5. Be2', 'bxa1=Q',
      '6. O-O', 'Qxb1',
      '7. d5', 'c5',
      '8. dxc6e.p.', 'Qxc1',
      '9. cxb7', 'Nc6',
      '10. b8=Q', 'Nf6',
      '11. Qxc1', 'Nd5',
      '12. Qd2', 'Ndb4',
      '13. Rd1', 'Na5',
      '14. Qxd8#'
    ])
  })
})
