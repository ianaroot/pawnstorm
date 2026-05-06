// Capture engineering — shared move-scenario synthesis for strategies that
// need to commit a current-turn capture (moved_piece lands on captured_piece's
// prior square). Narrows ctx.movedPiece + ctx.capturedPiece to singletons and
// mutates ctx.priorPieces / ctx.recentMoveContext on commit.

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import {
  pieceCode, clonePiecesMap, ALL_POSITIONS, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { buildRecentMoveContext } from 'editorV2/panels/condition_preview/shared/example_utils'
import { buildLayoutAndBoard } from '../hint_compiler'
import { respectsInventoryCaps } from '../inventory_protocol'

export const MAX_POSITION_CANDIDATES = 8
export const MAX_ORIGIN_CANDIDATES = 12

export function pawnOnStartingRank(team, position) {
  const rank = Board.rankIndex(position)
  if (team === Board.WHITE && rank === 1) { return true }
  if (team === Board.BLACK && rank === 6) { return true }
  return false
}

// Yield candidate (capturedPos, moverEndPos) geometry pairs honoring
// ctx.capturedPiece.position_set and ctx.movedPiece.position_set. Today only
// emits non-en-passant pairs (where capturedPos === moverEndPos). EP geometry
// (where the two diverge by one rank along the same file) is not engineered
// here; collectEnPassantExamples handles EP via presets. When EP engineering
// lands, this picker is the place to add the EP pair shape.
function pickCaptureGeometryCandidates(ctx, pieces, random) {
  const capturedPositions = ctx.capturedPiece.position_set
  const moverEndPositions = ctx.movedPiece.position_set
  const pairs = []
  for (const p of capturedPositions) {
    if (!moverEndPositions.has(p)) { continue }
    if (pieces.has(p)) { continue }
    pairs.push({ capturedPos: p, moverEndPos: p })
  }
  return shuffled(pairs, random).slice(0, MAX_POSITION_CANDIDATES)
}

export function engineerCaptureScenario({ pieces, capturedSpecies, moverSpecies, enemyMovedSpecies, enemyCapturedSpecies, ctx, movingTeam, enemyTeam, priorPieces, random }) {
  const candidatePairs = pickCaptureGeometryCandidates(ctx, pieces, random)

  if (!respectsInventoryCaps(enemyTeam, capturedSpecies, priorPieces, ctx, 'prior')) { return null }

  for (const { capturedPos, moverEndPos } of candidatePairs) {
    if (capturedSpecies === Board.PAWN && pawnOnStartingRank(enemyTeam, capturedPos)) { continue }

    const priorWithCaptured = placePiece(priorPieces, capturedPos, pieceCode(enemyTeam, capturedSpecies))
    if (!priorWithCaptured) { continue }

    const moverCandidates = moverSpecies
      ? [moverSpecies]
      : shuffled([...ctx.movedPiece.species_set].filter(s => s !== Board.KING), random)

    for (const trialMover of moverCandidates) {
      if (!respectsInventoryCaps(movingTeam, trialMover, priorWithCaptured, ctx, 'prior')) { continue }
      if (!respectsInventoryCaps(movingTeam, trialMover, pieces, ctx, 'current')) { continue }

      const originCandidates = shuffled(
        ALL_POSITIONS.filter(p => p !== capturedPos && p !== moverEndPos && !priorWithCaptured.has(p)),
        random
      ).slice(0, MAX_ORIGIN_CANDIDATES)

      for (const origin of originCandidates) {
        const trial = placePiece(priorWithCaptured, origin, pieceCode(movingTeam, trialMover))
        if (!trial) { continue }
        let moveObject
        try {
          const trialBoard = buildLayoutAndBoard(trial, movingTeam)
          moveObject = Rules.getMoveObject(origin, moverEndPos, trialBoard)
        } catch { continue }
        if (moveObject.illegal || !moveObject.captureNotation) { continue }

        const after = clonePiecesMap(trial)
        after.delete(capturedPos)
        after.delete(moverEndPos)
        after.delete(origin)
        const placedAfter = placePiece(after, moverEndPos, pieceCode(movingTeam, trialMover))
        if (!placedAfter) { continue }

        priorPieces.clear()
        for (const [p, piece] of trial.entries()) { priorPieces.set(p, piece) }

        ctx.movedPiece.species_set.clear()
        ctx.movedPiece.species_set.add(trialMover)
        ctx.movedPiece.position_set.clear()
        ctx.movedPiece.position_set.add(moverEndPos)
        ctx.capturedPiece.species_set.clear()
        ctx.capturedPiece.species_set.add(capturedSpecies)
        ctx.capturedPiece.position_set.clear()
        ctx.capturedPiece.position_set.add(capturedPos)

        if (enemyMovedSpecies !== undefined || enemyCapturedSpecies !== undefined) {
          ctx.recentMoveContext = buildRecentMoveContext({
            team: enemyTeam,
            species: enemyMovedSpecies,
            capturedSpecies: enemyCapturedSpecies,
            random
          })
        }
        return placedAfter
      }
    }
  }
  return null
}
