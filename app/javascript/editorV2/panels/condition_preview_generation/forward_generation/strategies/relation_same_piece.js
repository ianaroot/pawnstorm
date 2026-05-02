// Strategy for RELATION_SAME_PIECE — { enemy_moved_piece, captured_piece }.
//
// Engineers a regular capture move and declares the captured piece to be the
// enemy's prior-turn moved_piece via recentMoveContext. En passant arrives
// later through its own (currently broken) collector path — when fixed, it
// will satisfy the same predicate naturally because en passant presets
// already set recentMoveContext.movedPieceEndPosition = capturedSquare.
//
// Captured/mover species pools are read from the converged chain constraints
// in ctx (ctx.capturedPiece.species_set, ctx.movedPiece.species_set) so this
// strategy stays consistent with sibling plans' species constraints. After
// committing, the strategy narrows ctx to singletons.
//
// Constraints:
//   - Captured species: any non-king (kings can't be captured; pre-pass
//     initial domain already excludes king from capturedPiece.species_set).
//   - Pawn-on-starting-rank guard: an enemy pawn cannot be on its own
//     starting rank as the declared enemy_moved_piece (can't have just
//     moved TO its starting rank).

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import {
  pieceCode, clonePiecesMap, ALL_POSITIONS, shuffled, pickRandom
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { buildRecentMoveContext } from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { piecesIntoBoard } from '../hint_compiler'

const MAX_SPECIES_ATTEMPTS = 5
const MAX_POSITION_CANDIDATES = 8
const MAX_ORIGIN_CANDIDATES = 12



function pawnOnStartingRank(team, position) {
  const rank = Board.rankIndex(position)
  if (team === Board.WHITE && rank === 1) { return true }
  if (team === Board.BLACK && rank === 6) { return true }
  return false
}

function nonNullSpecies(speciesSet) {
  return [...speciesSet].filter(s => s !== null)
}

export function relationSamePieceStrategy(pieces, hint, ctx) {
  const { random, movingTeam, priorPieces } = ctx
  const enemyTeam = Board.opposingTeam(movingTeam)

  const capturedCandidates = nonNullSpecies(ctx.capturedPiece.species_set)
  const moverCandidates = [...ctx.movedPiece.species_set]
  if (capturedCandidates.length === 0 || moverCandidates.length === 0) { return null }

  for (let s = 0; s < MAX_SPECIES_ATTEMPTS; s += 1) {
    const capturedSpecies = pickRandom(shuffled(capturedCandidates, random), random)
    if (!capturedSpecies) { continue }

    const candidatePositions = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)), random
    ).slice(0, MAX_POSITION_CANDIDATES)

    for (const capturedPos of candidatePositions) {
      if (capturedSpecies === Board.PAWN && pawnOnStartingRank(enemyTeam, capturedPos)) { continue }

      const priorWithCaptured = placePiece(priorPieces, capturedPos, pieceCode(enemyTeam, capturedSpecies))
      if (!priorWithCaptured) { continue }

      for (const moverSpecies of shuffled(moverCandidates, random)) {
        const originCandidates = shuffled(
          ALL_POSITIONS.filter(p => p !== capturedPos && !priorWithCaptured.has(p)),
          random
        ).slice(0, MAX_ORIGIN_CANDIDATES)

        for (const origin of originCandidates) {
          const trial = placePiece(priorWithCaptured, origin, pieceCode(movingTeam, moverSpecies))
          if (!trial) { continue }
          const trialBoard = piecesIntoBoard(trial, movingTeam)
          let moveObject
          try { moveObject = Rules.getMoveObject(origin, capturedPos, trialBoard) } catch { continue }
          if (moveObject.illegal) { continue }
          if (!moveObject.captureNotation) { continue }

          // Build after-board: prior with mover moved from origin to capturedPos
          // and captured piece gone.
          const after = clonePiecesMap(trial)
          after.delete(capturedPos)
          after.delete(origin)
          const placedAfter = placePiece(after, capturedPos, pieceCode(movingTeam, moverSpecies))
          if (!placedAfter) { continue }

          // Mutate ctx state.
          priorPieces.clear()
          for (const [p, piece] of trial.entries()) { priorPieces.set(p, piece) }

          // Narrow ctx species sets to the committed singletons so sibling
          // strategies see the commit.
          ctx.capturedPiece.species_set.clear()
          ctx.capturedPiece.species_set.add(capturedSpecies)
          ctx.movedPiece.species_set.clear()
          ctx.movedPiece.species_set.add(moverSpecies)

          // The captured piece IS the enemy's prior moved_piece — declare
          // that via recentMoveContext for same_piece evaluation.
          ctx.recentMoveContext = buildRecentMoveContext({
            team: enemyTeam, species: capturedSpecies, endPosition: capturedPos, random
          })

          return placedAfter
        }
      }
    }
  }
  return null
}
