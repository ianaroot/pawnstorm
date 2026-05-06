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
          kind: 'position',
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
          kind: 'position',
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
          kind: 'position',
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
