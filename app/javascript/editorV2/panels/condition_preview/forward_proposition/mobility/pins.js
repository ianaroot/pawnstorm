import Board from 'gameplay/board'
import {
  firstOccupiedOnRay, nextPositionOnRay, sliderStep, squaresBetweenClear
} from 'gameplay/board_query_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { shieldAttackerSpeciesForStep } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'

export const pinsMechanism = {
  name: 'pins',

  appliesTo(target, ctx, frame, pieces) {
    return target.species !== Board.KING
  },

  apply(target, ctx, frame, pieces, random) {
    const kingPosition = findOwnKing(target.team, pieces)
    if (kingPosition === null) { return null }

    const step = sliderStep(kingPosition, target.position)
    if (step === null) { return null }

    const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
    if (!squaresBetweenClear({ board, attackerPosition: kingPosition, targetPosition: target.position, step })) { return null }

    const enemyTeam = Board.opposingTeam(target.team)
    const sliderSpecies = shieldAttackerSpeciesForStep(step)
    const sliderSquares = emptySquaresAlongRay(target.position, step, board)
    for (const sliderPos of shuffled(sliderSquares, random)) {
      for (const species of shuffled(sliderSpecies, random)) {
        const next = placePiece(pieces, sliderPos, pieceCode(enemyTeam, species))
        if (next !== null) { return next }
      }
    }
    return null
  },

  isActive() { return false }
}

function findOwnKing(team, pieces) {
  const code = pieceCode(team, Board.KING)
  for (const [square, piece] of pieces) {
    if (piece === code) { return square }
  }
  return null
}

function emptySquaresAlongRay(start, step, board) {
  const blocker = firstOccupiedOnRay({ board, startPosition: start, step })
  const result = []
  let current = nextPositionOnRay(start, step)
  while (current !== null && current !== blocker) {
    result.push(current)
    current = nextPositionOnRay(current, step)
  }
  return result
}
