import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode, buildBoardFromLayout, buildLayoutFromPieces } from 'editorV2/panels/condition_preview/shared/board_utils'
import { materializeRegion } from 'editorV2/panels/condition_preview/forward_proposition/materialize_region'

const D4 = 27

function knightAnchorAt(pos) {
  return {
    moved_piece: {
      team: Board.WHITE,
      species_set: new Set([Board.NIGHT]),
      region: { kind: 'set', squares: new Set([pos]) }
    }
  }
}

function boardWith(piecesMap) {
  return buildBoardFromLayout(buildLayoutFromPieces(piecesMap))
}

describe('materializeRegion — kind: all', () => {
  it('returns all 64 board positions', () => {
    const result = materializeRegion({ kind: 'all' }, { singulars: {}, board: null })
    expect(result.size).toBe(64)
  })
})

describe('materializeRegion — kind: set', () => {
  it('returns the squares set carried by the region', () => {
    const squares = new Set([1, 2, 3])
    const result = materializeRegion({ kind: 'set', squares }, { singulars: {}, board: null })
    expect(result).toBe(squares)
  })
})

describe('materializeRegion — related-to subject role (anchor attacks group)', () => {
  it('returns the 8 knight-controlled squares from a knight anchor on D4', () => {
    const singulars = knightAnchorAt(D4)
    const board = boardWith(new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]]))
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'attack' }

    const result = materializeRegion(region, { singulars, board })

    expect(result.size).toBe(8)
  })
})

describe('materializeRegion — related-to target role (group attacks anchor)', () => {
  it('returns the 27 queen-line squares from a knight anchor on D4 when placement species is QUEEN', () => {
    const singulars = knightAnchorAt(D4)
    const board = boardWith(new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]]))
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack' }

    const result = materializeRegion(region, { singulars, board, species: Board.QUEEN, team: Board.BLACK })

    expect(result.size).toBe(27)
  })

  it('returns just the two south-diagonal squares for a black pawn attacking a knight anchor on D4', () => {
    // Black pawn at C5 (34) attacks D4; black pawn at E5 (36) attacks D4. No others.
    const singulars = knightAnchorAt(D4)
    const board = boardWith(new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]]))
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack' }

    const result = materializeRegion(region, { singulars, board, species: Board.PAWN, team: Board.BLACK })

    expect(result).toEqual(new Set([34, 36]))
  })

  it('truncates the queen-attack candidate ray at the first blocker between candidate and anchor', () => {
    // Knight anchor on D4 (=27); allied piece on D6 (=43) blocks the north ray.
    // Without the blocker, candidate squares on the north ray are d5, d6, d7, d8.
    // With a blocker on d6, candidate squares on that ray are only d5 and d6 (d7/d8 excluded).
    const D6 = 43
    const D5 = 35
    const singulars = knightAnchorAt(D4)
    const board = boardWith(new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [D6, pieceCode(Board.WHITE, Board.PAWN)]
    ]))
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack' }

    const result = materializeRegion(region, { singulars, board, species: Board.QUEEN, team: Board.BLACK })

    expect(result.has(D5)).toBe(true)
    expect(result.has(D6)).toBe(true)
    expect(result.has(43 + 8)).toBe(false)  // d7
    expect(result.has(43 + 16)).toBe(false) // d8
  })
})

describe('materializeRegion — operator: shield, role: subject (empty board)', () => {
  let result
  beforeEach(() => {
    const singulars = knightAnchorAt(D4)
    const board = boardWith(new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]]))
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'shield' }
    result = materializeRegion(region, { singulars, board })
  })

  it('returns the 27 queen-line squares from D4', () => {
    expect(result.size).toBe(27)
  })
})

describe('materializeRegion — operator: shield, role: target (empty board)', () => {
  let result
  beforeEach(() => {
    const singulars = knightAnchorAt(D4)
    const board = boardWith(new Map([[D4, pieceCode(Board.WHITE, Board.NIGHT)]]))
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'shield' }
    result = materializeRegion(region, { singulars, board })
  })

  it('returns the 27 queen-line squares from D4 (same geometry as role: subject)', () => {
    expect(result.size).toBe(27)
  })
})

function pawnAnchorAt(pos, team = Board.WHITE) {
  return {
    moved_piece: {
      team,
      species_set: new Set([Board.QUEEN]),
      region: { kind: 'set', squares: new Set([pos]) }
    }
  }
}

describe('materializeRegion — operator: pawn-push-origin', () => {
  it('returns the single square one rank back from a white anchor', () => {
    const D8 = 59
    const D7 = 51
    const singulars = pawnAnchorAt(D8, Board.WHITE)
    const region = { kind: 'related-to', actor: 'moved_piece', operator: 'pawn-push-origin' }
    expect(materializeRegion(region, { singulars, board: null })).toEqual(new Set([D7]))
  })

  it('returns the single square one rank forward (absolute) from a black anchor', () => {
    const D1 = 3
    const D2 = 11
    const singulars = pawnAnchorAt(D1, Board.BLACK)
    const region = { kind: 'related-to', actor: 'moved_piece', operator: 'pawn-push-origin' }
    expect(materializeRegion(region, { singulars, board: null })).toEqual(new Set([D2]))
  })
})

describe('materializeRegion — operator: pawn-diag-left-origin', () => {
  it('returns the origin square (file +1, rank back) from which a white pawn could have moved diag-left to the anchor', () => {
    const D8 = 59
    const E7 = 52
    const singulars = pawnAnchorAt(D8, Board.WHITE)
    const region = { kind: 'related-to', actor: 'moved_piece', operator: 'pawn-diag-left-origin' }
    expect(materializeRegion(region, { singulars, board: null })).toEqual(new Set([E7]))
  })

  it('returns empty when anchor is on file 7 (no pawn can move diag-left from file 8)', () => {
    const H8 = 63
    const singulars = pawnAnchorAt(H8, Board.WHITE)
    const region = { kind: 'related-to', actor: 'moved_piece', operator: 'pawn-diag-left-origin' }
    expect(materializeRegion(region, { singulars, board: null })).toEqual(new Set())
  })
})

describe('materializeRegion — operator: pawn-diag-right-origin', () => {
  it('returns the origin square (file -1, rank back) from which a white pawn could have moved diag-right to the anchor', () => {
    const D8 = 59
    const C7 = 50
    const singulars = pawnAnchorAt(D8, Board.WHITE)
    const region = { kind: 'related-to', actor: 'moved_piece', operator: 'pawn-diag-right-origin' }
    expect(materializeRegion(region, { singulars, board: null })).toEqual(new Set([C7]))
  })

  it('returns empty when anchor is on file 0 (no pawn can move diag-right from file -1)', () => {
    const A8 = 56
    const singulars = pawnAnchorAt(A8, Board.WHITE)
    const region = { kind: 'related-to', actor: 'moved_piece', operator: 'pawn-diag-right-origin' }
    expect(materializeRegion(region, { singulars, board: null })).toEqual(new Set())
  })
})

describe('materializeRegion — operator: shield ray truncation at first occupant', () => {
  const D6 = 43
  const D5 = 35
  const D7 = 51
  let result
  beforeEach(() => {
    const singulars = knightAnchorAt(D4)
    const board = boardWith(new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [D6, pieceCode(Board.WHITE, Board.PAWN)]
    ]))
    const region = { kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'shield' }
    result = materializeRegion(region, { singulars, board })
  })

  it('includes the empty square between anchor and the blocker', () => {
    expect(result.has(D5)).toBe(true)
  })

  it('includes the blocker itself (matches attack/defend ray semantics)', () => {
    expect(result.has(D6)).toBe(true)
  })

  it('excludes squares beyond the blocker', () => {
    expect(result.has(D7)).toBe(false)
  })
})
