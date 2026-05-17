import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'

import { buildBoard, getMove } from 'gameplay/__tests__/helpers'

// CEv2 census evaluation regression. unary/position are retired, so behavior
// is pinned directly (no legacy-kind oracle). Representative coverage.

function evaluate(conditionNode, board, moveObject) {
  return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
}

describe('CEv2 census without spatial keys (board-wide)', () => {
  it('evaluates a board-wide count census', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', a2: 'wP', b2: 'wP', c2: 'wP', h7: 'bP' }
    })
    const moveObject = getMove('a2', 'a3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'allied', subjectFilter: 'pawn',
          subjectFilterMode: 'include',
          operator: 'count', comparator: 'greater_than_or_equal_to',
          target: 'exact_number', targetTotal: 2
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('evaluates a board-wide value census', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', d1: 'wQ', a1: 'wR', h7: 'bP' }
    })
    const moveObject = getMove('a1', 'b1', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'allied', subjectFilter: 'any',
          subjectFilterMode: 'include',
          operator: 'value', comparator: 'greater_than',
          target: 'exact_number', targetTotal: 10
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('evaluates a board-wide mobility census', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', d4: 'wQ', h2: 'wP' }
    })
    const moveObject = getMove('h2', 'h3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'allied', subjectFilter: 'queen',
          subjectFilterMode: 'include',
          operator: 'mobility', comparator: 'greater_than',
          target: 'exact_number', targetTotal: 0
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('evaluates a board-wide census against prior_board_state', () => {
    const board = buildBoard({ pieces: { e1: 'wK', e8: 'bK', g7: 'wP' } })
    const moveObject = getMove('g7', 'g8', board, Board.QUEEN)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'moved_piece', subjectFilter: 'any',
          operator: 'value', comparator: 'greater_than', target: 'prior_board_state'
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('evaluates a board-wide census with a distinct-piece actor target', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', e4: 'wP', d5: 'bN' }
    })
    const moveObject = getMove('e4', 'd5', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'captured_piece', subjectFilter: 'any',
          operator: 'value', comparator: 'equal_to',
          target: 'captured_piece', targetFilter: 'any'
        },
        board, moveObject
      )
    ).toBe(true)
  })
})

describe('CEv2 census with spatial keys (region)', () => {
  it('evaluates a rank-restricted count census', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', c5: 'bN', c7: 'bP', h2: 'wP' }
    })
    const moveObject = getMove('h2', 'h3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'enemy', subjectFilter: 'any',
          positionAxis: 'rank', positionComparator: 'greater_than_or_equal_to', positionTarget: 4,
          operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 3
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('evaluates a file-restricted count census', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', d1: 'wR', d3: 'wQ', a7: 'wP', h7: 'bP' }
    })
    const moveObject = getMove('a7', 'a8', board, Board.QUEEN)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'allied', subjectFilter: 'major',
          subjectFilterMode: 'include',
          positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 4,
          operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 2
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('evaluates a single-square value census', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', d4: 'wR', h2: 'wP' }
    })
    const moveObject = getMove('h2', 'h3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'allied', subjectFilter: 'any',
          positionAxis: 'square', positionComparator: 'equal_to', positionTarget: 27, // d4
          operator: 'value', comparator: 'equal_to', target: 'exact_number', targetTotal: 5
        },
        board, moveObject
      )
    ).toBe(true)
  })
})

describe('CEv2 census region restriction', () => {
  it('counts only the pieces inside the region, not the whole board', () => {
    // Three allied majors; only TWO are on rank >= 5 (moving-team perspective).
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', a5: 'wR', b6: 'wQ', a1: 'wR', h7: 'bP' }
    })
    const moveObject = getMove('e1', 'd1', board)
    const region = {
      version: 2, kind: 'census', subject: 'allied', subjectFilter: 'major',
      subjectFilterMode: 'include',
      positionAxis: 'rank', positionComparator: 'greater_than_or_equal_to', positionTarget: 5,
      operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 2
    }

    expect(evaluate(region, board, moveObject)).toBe(true)
    expect(evaluate({ ...region, targetTotal: 3 }, board, moveObject)).toBe(false)
  })
})

describe('CEv2 census against prior_board_state within a region', () => {
  it('compares the region-restricted metric between the prior and after frames', () => {
    // Rook moves from off-region (rank 1) onto rank >= 5: region count 1 -> 2.
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', a6: 'wR', a1: 'wR', h7: 'bP' }
    })
    const moveObject = getMove('a1', 'a5', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'allied', subjectFilter: 'major',
          subjectFilterMode: 'include',
          positionAxis: 'rank', positionComparator: 'greater_than_or_equal_to', positionTarget: 5,
          operator: 'count', comparator: 'greater_than', target: 'prior_board_state'
        },
        board, moveObject
      )
    ).toBe(true)
  })
})

describe('CEv2 census with a distinct-piece target within a region', () => {
  it('region-restricts the subject while leaving the distinct-piece target un-region-filtered', () => {
    const board = buildBoard({
      pieces: { e1: 'wK', e8: 'bK', a5: 'wR', b6: 'wR', d4: 'wN', h7: 'bP' }
    })
    const moveObject = getMove('d4', 'e6', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', subject: 'allied', subjectFilter: 'major',
          subjectFilterMode: 'include',
          positionAxis: 'rank', positionComparator: 'greater_than_or_equal_to', positionTarget: 5,
          operator: 'count', comparator: 'greater_than',
          target: 'moved_piece', targetFilter: 'any'
        },
        board, moveObject
      )
    ).toBe(true)
  })
})
