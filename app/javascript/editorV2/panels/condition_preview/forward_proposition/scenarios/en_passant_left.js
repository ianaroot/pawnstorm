import Board from 'gameplay/board'
import { HOME_RANK } from 'editorV2/panels/condition_preview/shared/board_utils'
import { emptySquareConstraintsRelativeToActor } from './proposition_helpers'

function epTargetRankIndex(team) {
  // White EP target = rank index 5 (chess rank 6). Black EP target = rank index 2 (chess rank 3).
  return team === Board.BLACK ? 2 : 5
}

function epCapturedRankIndex(team) {
  // One rank back from EP target (from the moving team's forward direction).
  return team === Board.BLACK ? 3 : 4
}

function rankSquaresExcludingFile(rankIndex, excludeFile) {
  const squares = new Set()
  for (let file = 0; file < 8; file += 1) {
    if (file === excludeFile) { continue }
    squares.add(rankIndex * 8 + file)
  }
  return squares
}

function rankSquares(rankIndex) {
  return new Set(Array.from({ length: 8 }, (_, file) => rankIndex * 8 + file))
}

export const enPassantLeftScenario = {
  name: 'en_passant_left',
  attemptWeight: 10,

  buildCtxDelta(combinedPlan) {
    const team = combinedPlan.movingTeam
    const enemyTeam = Board.opposingTeam(team)
    const aliasedEnemyPawn = {
      team: enemyTeam,
      species_set: new Set([Board.PAWN]),
      region: { kind: 'set', squares: rankSquares(epCapturedRankIndex(team)) },
      relationsToAnchors: [{ otherActor: 'moved_piece', operator: 'pawn-push-origin', myRole: 'target' }]
    }
    return {
      singulars: {
        moved_piece: {
          species_set: new Set([Board.PAWN]),
          region: { kind: 'set', squares: rankSquaresExcludingFile(epTargetRankIndex(team), 7) }
        },
        captured_piece: aliasedEnemyPawn,
        enemy_moved_piece: aliasedEnemyPawn
      },
      propositions: [
        ...emptySquareConstraintsRelativeToActor('moved_piece', 'pawn-diag-left-origin'),
        ...emptySquareConstraintsRelativeToActor('moved_piece', 'pawn-push-origin')
      ]
    }
  },

  resolveMoveObjectOverrides(ctx) {
    const moved = ctx.singulars.moved_piece
    const endPos = [...moved.region.squares][0]
    const rankDelta = ctx.movingTeam === Board.BLACK ? 1 : -1
    return {
      startPosition: endPos + 8 * rankDelta + 1,
      endPosition: endPos,
      capturedPiecePosition: endPos + 8 * rankDelta
    }
  },

  resolveRecentMoveContext(ctx) {
    const moved = ctx.singulars.moved_piece
    const endPos = [...moved.region.squares][0]
    const rankDelta = ctx.movingTeam === Board.BLACK ? 1 : -1
    const capturedPos = endPos + 8 * rankDelta
    const doubleStepOriginDelta = ctx.movingTeam === Board.BLACK ? -16 : 16
    const enemyDoubleStepStart = capturedPos + doubleStepOriginDelta
    return {
      moveObject: { startPosition: enemyDoubleStepStart, endPosition: capturedPos },
      movingTeam: Board.opposingTeam(ctx.movingTeam),
      movedPieceStartPosition: enemyDoubleStepStart,
      movedPieceEndPosition: capturedPos,
      movedPieceSpeciesBeforeMove: Board.PAWN,
      movedPieceSpeciesAfterMove: Board.PAWN,
      capturedPiecePosition: null,
      capturedPieceTeam: null,
      capturedPieceSpecies: null
    }
  }
}
