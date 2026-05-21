import { describe, expect, it } from 'vitest'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { buildBoard, getMove } from 'gameplay/__tests__/helpers'

describe('position evaluation for captured-type actors', () => {
  function evaluate(conditionNode, board, moveObject) {
    return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
  }

  // Position rank is always evaluated from the moving team's perspective,
  // regardless of subject. WHITE captures BLACK pawn at d5 (absolute rank 5)
  // — from WHITE's perspective d5 is rank 5.
  it('uses moving-team perspective for captured_piece rank', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e4: 'wP',
        d5: 'bP'
      }
    })
    const moveObject = getMove('e4', 'd5', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'census', target: 'exact_number',
          subject: 'captured_piece',
          subjectFilter: 'any',
          positionAxis: 'rank',
          positionComparator: 'equal_to',
          positionTarget: 5,
          operator: 'count',
          comparator: 'equal_to',
          targetTotal: 1
        },
        board,
        moveObject
      )
    ).toBe(true)
  })

  it('does not match captured_piece on a non-occupied rank from moving perspective', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e4: 'wP',
        d5: 'bP'
      }
    })
    const moveObject = getMove('e4', 'd5', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'census', target: 'exact_number',
          subject: 'captured_piece',
          subjectFilter: 'any',
          positionAxis: 'rank',
          positionComparator: 'equal_to',
          positionTarget: 4,
          operator: 'count',
          comparator: 'equal_to',
          targetTotal: 1
        },
        board,
        moveObject
      )
    ).toBe(false)
  })

  // Enemy captured one of WHITE's pawns at e5 (absolute rank 5) on their prior
  // turn. Moving team perspective for enemy_captured_piece rank — rank 5 here.
  it('uses moving-team perspective for enemy_captured_piece rank', () => {
    const board = buildBoard({
      pieces: {
        e1: 'wK',
        e8: 'bK',
        e5: 'bP',
        a2: 'wP'
      }
    })
    board.recentMoveContext = {
      moveObject: { startPosition: 52, endPosition: 36 },
      movingTeam: 'b',
      movedPieceStartPosition: 52,
      movedPieceEndPosition: 36,
      movedPieceSpeciesBeforeMove: 'P',
      movedPieceSpeciesAfterMove: 'P',
      capturedPiecePosition: 36,
      capturedPieceTeam: 'w',
      capturedPieceSpecies: 'P'
    }
    const moveObject = getMove('a2', 'a3', board)

    expect(
      evaluate(
        {
          version: 2,
          kind: 'census', target: 'exact_number',
          subject: 'enemy_captured_piece',
          subjectFilter: 'any',
          positionAxis: 'rank',
          positionComparator: 'equal_to',
          positionTarget: 5,
          operator: 'count',
          comparator: 'equal_to',
          targetTotal: 1
        },
        board,
        moveObject
      )
    ).toBe(true)
  })
})

describe('position evaluation: mobility operator', () => {
  function evaluate(conditionNode, board, moveObject) {
    return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
  }

  it('aggregates mobility across allied positions on the matched rank', () => {
    const board = buildBoard({
      pieces: { a4: 'wR', h1: 'wK', h8: 'bK', e2: 'wP' }
    })
    const moveObject = getMove('e2', 'e3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', target: 'exact_number',
          subject: 'allied', subjectFilter: 'any',
          positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 4,
          operator: 'mobility', comparator: 'greater_than', targetTotal: 0
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('is false when a real non-zero allied mobility does not satisfy equal_to 0', () => {
    const board = buildBoard({
      pieces: { a4: 'wR', h1: 'wK', h8: 'bK', d2: 'wP' }
    })
    const moveObject = getMove('d2', 'd3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', target: 'exact_number',
          subject: 'allied', subjectFilter: 'any',
          positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 4,
          operator: 'mobility', comparator: 'equal_to', targetTotal: 0
        },
        board, moveObject
      )
    ).toBe(false)
  })

  it('is false when no allied position matches the rank (equal_to 0 vacuous-truth)', () => {
    const board = buildBoard({
      pieces: { a1: 'wR', h1: 'wK', h8: 'bK', b2: 'wP' }
    })
    const moveObject = getMove('b2', 'b3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', target: 'exact_number',
          subject: 'allied', subjectFilter: 'any',
          positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5,
          operator: 'mobility', comparator: 'equal_to', targetTotal: 0
        },
        board, moveObject
      )
    ).toBe(false)
  })

  it('aggregates mobility across enemy positions on the matched rank', () => {
    const board = buildBoard({
      pieces: { a4: 'bR', h1: 'wK', h8: 'bK', e2: 'wP' }
    })
    const moveObject = getMove('e2', 'e3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', target: 'exact_number',
          subject: 'enemy', subjectFilter: 'any',
          positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 4,
          operator: 'mobility', comparator: 'greater_than', targetTotal: 0
        },
        board, moveObject
      )
    ).toBe(true)
  })

  it('is false when no enemy position matches the rank (vacuous-truth)', () => {
    const board = buildBoard({
      pieces: { a1: 'wR', h1: 'wK', h8: 'bK', c2: 'wP' }
    })
    const moveObject = getMove('c2', 'c3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', target: 'exact_number',
          subject: 'enemy', subjectFilter: 'any',
          positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 6,
          operator: 'mobility', comparator: 'equal_to', targetTotal: 0
        },
        board, moveObject
      )
    ).toBe(false)
  })

  // Pre-ab35a09, an empty positions list reduced to 0, and `less_than 100` would
  // have been true. Post-fix, empty → null → comparator returns false.
  it('does not coerce empty-positions mobility to zero (regression guard for pre-ab35a09 reduce-from-zero)', () => {
    const board = buildBoard({
      pieces: { a1: 'wR', h1: 'wK', h8: 'bK', f2: 'wP' }
    })
    const moveObject = getMove('f2', 'f3', board)

    expect(
      evaluate(
        {
          version: 2, kind: 'census', target: 'exact_number',
          subject: 'allied', subjectFilter: 'any',
          positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5,
          operator: 'mobility', comparator: 'less_than', targetTotal: 100
        },
        board, moveObject
      )
    ).toBe(false)
  })
})
