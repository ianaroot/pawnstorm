// Strategy for RELATION_SAME_PIECE — { enemy_moved_piece, captured_piece }.
//
// Engineers a regular capture move and declares the captured piece to be the
// enemy's prior-turn moved_piece via recentMoveContext. En passant arrives
// later through its own (currently broken) collector path — when fixed, it
// will satisfy the same predicate naturally because en passant presets
// already set recentMoveContext.movedPieceEndPosition = capturedSquare.
//
// Constraints:
//   - Captured species: any non-king (we don't capture kings).
//   - Pawn-on-starting-rank guard: an enemy pawn cannot be on its own
//     starting rank as the declared enemy_moved_piece (can't have just
//     moved TO its starting rank).

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import {
  pieceCode, clonePiecesMap
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { piecesIntoBoard } from '../hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))
const SPECIES_ATTEMPTS = 5
const POSITION_CANDIDATES = 8
const ORIGIN_CANDIDATES = 12

const CAPTURABLE_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])
const MOVER_SPECIES_POOL = Object.freeze([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT, Board.PAWN, Board.KING])

function shuffled(values, random) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickRandom(values, random) {
  if (!values || values.length === 0) { return null }
  return values[Math.floor(random() * values.length)]
}

function pawnOnStartingRank(team, position) {
  const rank = Board.rankIndex(position)
  if (team === Board.WHITE && rank === 1) { return true }
  if (team === Board.BLACK && rank === 6) { return true }
  return false
}

export function relationSamePieceStrategy(pieces, hint, ctx) {
  const { random, movingTeam, priorPieces } = ctx
  const enemyTeam = Board.opposingTeam(movingTeam)

  for (let s = 0; s < SPECIES_ATTEMPTS; s += 1) {
    const capturedSpecies = pickRandom(shuffled([...CAPTURABLE_SPECIES], random), random)
    if (!capturedSpecies) { continue }

    const candidatePositions = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)), random
    ).slice(0, POSITION_CANDIDATES)

    for (const capturedPos of candidatePositions) {
      if (capturedSpecies === Board.PAWN && pawnOnStartingRank(enemyTeam, capturedPos)) { continue }

      const priorWithCaptured = placePiece(priorPieces, capturedPos, pieceCode(enemyTeam, capturedSpecies))
      if (!priorWithCaptured) { continue }

      for (const moverSpecies of shuffled([...MOVER_SPECIES_POOL], random)) {
        const originCandidates = shuffled(
          ALL_POSITIONS.filter(p => p !== capturedPos && !priorWithCaptured.has(p)),
          random
        ).slice(0, ORIGIN_CANDIDATES)

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

          ctx.recentMoveContext = synthesizeRecentMoveContext({
            capturedPos, capturedSpecies, enemyTeam, random
          })

          return placedAfter
        }
      }
    }
  }
  return null
}

// Synthesize a recentMoveContext that declares the captured piece as the
// enemy's last-turn moved_piece. The pre-prior origin is plausible-but-not-
// engineered (per user's note: minor inconsistencies are tolerable).
function synthesizeRecentMoveContext({ capturedPos, capturedSpecies, enemyTeam, random }) {
  const candidates = shuffled(ALL_POSITIONS.filter(p => p !== capturedPos), random)
  const movedPieceStartPosition = candidates[0] ?? capturedPos
  return {
    moveObject: { startPosition: movedPieceStartPosition, endPosition: capturedPos },
    movingTeam: enemyTeam,
    movedPieceStartPosition,
    movedPieceEndPosition: capturedPos,
    movedPieceSpeciesBeforeMove: capturedSpecies,
    movedPieceSpeciesAfterMove: capturedSpecies,
    capturedPiecePosition: null,
    capturedPieceTeam: null,
    capturedPieceSpecies: null
  }
}
