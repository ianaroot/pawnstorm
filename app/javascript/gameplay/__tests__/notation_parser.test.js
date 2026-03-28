import { describe, expect, it } from 'vitest'

import NotationParser from 'gameplay/notation_parser'

describe('NotationParser', () => {
  const parser = new NotationParser()

  it('parses castling with a move number', () => {
    expect(parser.parse('6. O-O')).toEqual({
      moveNumber: 6,
      castle: 'O-O',
      pieceType: 'K',
      capture: false,
      destination: null,
      promotion: null,
      enPassant: false,
      check: false,
      mate: false,
      disambiguation: { file: null, rank: null, square: null }
    })
  })

  it('parses pawn captures with en passant notation', () => {
    expect(parser.parse('exd6e.p.')).toEqual({
      moveNumber: null,
      castle: null,
      pieceType: 'P',
      capture: true,
      destination: 'd6',
      promotion: null,
      enPassant: true,
      check: false,
      mate: false,
      disambiguation: { file: 'e', rank: null, square: null }
    })
  })

  it('parses promotion with check', () => {
    expect(parser.parse('1. e8=Q+')).toEqual({
      moveNumber: 1,
      castle: null,
      pieceType: 'P',
      capture: false,
      destination: 'e8',
      promotion: 'Q',
      enPassant: false,
      check: true,
      mate: false,
      disambiguation: { file: null, rank: null, square: null }
    })
  })

  it('parses piece disambiguation by file and rank', () => {
    expect(parser.parse('Nce4')).toEqual({
      moveNumber: null,
      castle: null,
      pieceType: 'N',
      capture: false,
      destination: 'e4',
      promotion: null,
      enPassant: false,
      check: false,
      mate: false,
      disambiguation: { file: 'c', rank: null, square: null }
    })

    expect(parser.parse('Q1d3')).toEqual({
      moveNumber: null,
      castle: null,
      pieceType: 'Q',
      capture: false,
      destination: 'd3',
      promotion: null,
      enPassant: false,
      check: false,
      mate: false,
      disambiguation: { file: null, rank: '1', square: null }
    })
  })
})
