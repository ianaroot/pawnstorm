import { describe, expect, it } from 'vitest'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { buildBoard, getMove } from 'gameplay/__tests__/helpers'

describe('position evaluation for captured-type actors', () => {
  function evaluate(conditionNode, board, moveObject) {
    return new ConditionEvaluatorV2().evaluate(conditionNode, { board, moveObject })
  }

  // WHITE captures BLACK pawn at d5 (absolute rank 5). captured_piece is on
  // BLACK (enemy team). From BLACK's perspective d5 is relative rank 4; from
  // WHITE's it's relative rank 5. The condition asks for relative rank 4, so
  // it should match only when the captured piece is evaluated from BLACK's
  // (enemy team) perspective.
  it('uses enemy-team perspective for captured_piece rank', () => {
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
    ).toBe(true)
  })

  // Negative companion: from WHITE's perspective d5 is rank 5, so a query for
  // rank 5 must NOT match (the captured piece does not live on WHITE's side
  // of the orientation).
  it('does not match captured_piece on moving-team rank', () => {
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
    ).toBe(false)
  })

  // BLACK previously moved e7→e5 capturing a WHITE pawn at e5 (absolute rank
  // 5). enemy_captured_piece is on WHITE (moving team). From WHITE's
  // perspective e5 is relative rank 5; from BLACK's it's relative rank 4.
  // The query for rank 5 should match only when evaluated from WHITE's
  // (moving team) perspective.
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
