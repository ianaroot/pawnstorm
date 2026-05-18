import {
  buildBoardFromLayout, buildLayoutFromPieces, teamHasKing
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildPriorBoard } from 'editorV2/panels/condition_preview/shared/example_utils'
import { mobilityAt, mobilityFromMoveObjects } from 'gameplay/mobility'
import MovesCalculator from 'gameplay/moves_calculator'
import { singularPosition } from '../relations/relation_helpers'
import {
  singularSquare, firstSquareOf, compareWithDirection
} from './mechanisms/participates_helpers'

export function mobilityDeltaSatisfied(entry, ctx, afterPieces) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return true }
  const origin = firstSquareOf(moved.priorRegion)
  if (origin === null) { return true }
  return mobilityDeltaForOrigin(entry, ctx, afterPieces, origin, destination)
}

// origin/destination explicit so a constructor can verify pre-commit.
export function mobilityDeltaForOrigin(entry, ctx, afterPieces, origin, destination) {
  const priorPieces = buildPriorBoard({
    pieces: afterPieces, singulars: ctx.singulars, origin, endPos: destination,
    capturedPiecePosition: singularPosition(ctx, 'captured_piece') ?? undefined
  })
  if (priorPieces === null) { return false }

  const prop = entry.currentProposition
  const after = aggregateMobility(prop, afterPieces)
  const prior = aggregateMobility(prop, priorPieces)
  return compareWithDirection(after, prior, entry.direction)
}

// King-aware mobility (matches the evaluator) when the team's king is on the
// board; pseudo-legal otherwise, since kings are placed after this stage.
export function aggregateMobility(proposition, pieces) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const kingAware = teamHasKing(pieces, proposition.team)
  const region = proposition.region?.kind === 'set' ? proposition.region.squares : null
  let total = 0
  for (const [pos, piece] of pieces) {
    if (region && !region.has(pos)) { continue }
    if (piece.charAt(0) !== proposition.team) { continue }
    if (!proposition.species_set.has(piece.slice(1))) { continue }
    total += kingAware
      ? mobilityAt(board, pos)
      : mobilityFromMoveObjects(board.pieceTypeAt(pos), new MovesCalculator({ board, startPosition: pos }).moveObjects)
  }
  return total
}
