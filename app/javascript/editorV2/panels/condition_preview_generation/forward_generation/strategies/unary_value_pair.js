// Strategy for UNARY_VALUE_PAIR — unary pair, value variant.
//
// The hint declares two singular move-event actors (subjectActor, targetActor)
// and a value comparator. Strategy engineers a move scenario where both actors
// exist with species whose material values satisfy the comparator.
//
// Actor species are stored in actorSpecies (a map from actor name to species)
// and resolved as follows:
//   moved_piece           — ctx.moverSpecies (committed by the strategy)
//   captured_piece        — ctx.capturedSpecies (move must be a capture)
//   enemy_moved_piece     — recentMoveContext.movedPieceSpeciesAfterMove
//   enemy_captured_piece  — recentMoveContext.capturedPieceSpecies
//
// The actor mix determines the move scenario:
//   - captured_piece present → move must be a capture
//   - enemy_*_piece present → recentMoveContext must be synthesized

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { materialValue } from 'gameplay/board_query_utils'
import {
  pieceCode, clonePiecesMap
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { buildRecentMoveContext } from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { piecesIntoBoard } from '../hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))
const MAX_POSITION_CANDIDATES = 8
const MAX_ORIGIN_CANDIDATES = 12
const MAX_PAIR_ATTEMPTS = 5

const COMPARATOR_FN = Object.freeze({
  equal_to: (a, b) => a === b,
  greater_than: (a, b) => a > b,
  greater_than_or_equal_to: (a, b) => a >= b,
  less_than: (a, b) => a < b,
  less_than_or_equal_to: (a, b) => a <= b
})

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

// Enumerate (subjectSpecies, targetSpecies) pairs from the supplied pools whose
// material values satisfy the comparator. Returns shuffled pairs; consumer
// picks the first viable pair for engineering.
export function valueComparablePairs(subjectPool, targetPool, valueOp, random) {
  const fn = COMPARATOR_FN[valueOp]
  if (!fn) { return [] }
  const pairs = []
  for (const s of subjectPool) {
    if (s === Board.KING) { continue }
    for (const t of targetPool) {
      if (t === Board.KING) { continue }
      if (fn(materialValue(s), materialValue(t))) { pairs.push([s, t]) }
    }
  }
  return shuffled(pairs, random)
}

export function unaryValuePairStrategy(pieces, hint, ctx) {
  const { random, movingTeam, priorPieces } = ctx
  const enemyTeam = Board.opposingTeam(movingTeam)

  const candidatePairs = valueComparablePairs(
    hint.subjectSpeciesPool, hint.targetSpeciesPool, hint.valueOp, random
  ).slice(0, MAX_PAIR_ATTEMPTS)

  for (const [subjectSpecies, targetSpecies] of candidatePairs) {
    const actorSpecies = {
      [hint.subjectActor]: subjectSpecies,
      [hint.targetActor]: targetSpecies
    }
    const result = engineerScenario({ pieces, actorSpecies, ctx, movingTeam, enemyTeam, priorPieces, random })
    if (result) { return result }
  }
  return null
}

// Engineer the move scenario per actorSpecies. Returns the resulting pieces map
// (current/after state) and mutates ctx.priorPieces, ctx.recentMoveContext,
// ctx.moverSpecies, ctx.capturedSpecies. Returns null if engineering fails for
// this species choice.
function engineerScenario({ pieces, actorSpecies, ctx, movingTeam, enemyTeam, priorPieces, random }) {
  const capturedSpecies = actorSpecies.captured_piece
  const moverSpecies = actorSpecies.moved_piece
  const enemyMovedSpecies = actorSpecies.enemy_moved_piece
  const enemyCapturedSpecies = actorSpecies.enemy_captured_piece

  const needsCapture = capturedSpecies !== undefined

  if (needsCapture) {
    return engineerCaptureScenario({
      pieces, capturedSpecies, moverSpecies, enemyMovedSpecies, enemyCapturedSpecies,
      ctx, movingTeam, enemyTeam, priorPieces, random
    })
  }

  return engineerNonCaptureScenario({
    pieces, moverSpecies, enemyMovedSpecies, enemyCapturedSpecies,
    ctx, movingTeam, enemyTeam, priorPieces, random
  })
}

function engineerCaptureScenario({ pieces, capturedSpecies, moverSpecies, enemyMovedSpecies, enemyCapturedSpecies, ctx, movingTeam, enemyTeam, priorPieces, random }) {
  const candidatePositions = shuffled(
    ALL_POSITIONS.filter(p => !pieces.has(p)), random
  ).slice(0, MAX_POSITION_CANDIDATES)

  for (const capturedPos of candidatePositions) {
    if (capturedSpecies === Board.PAWN && pawnOnStartingRank(enemyTeam, capturedPos)) { continue }

    const priorWithCaptured = placePiece(priorPieces, capturedPos, pieceCode(enemyTeam, capturedSpecies))
    if (!priorWithCaptured) { continue }

    const moverCandidates = moverSpecies
      ? [moverSpecies]
      : shuffled([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT, Board.PAWN], random)

    for (const trialMover of moverCandidates) {
      const originCandidates = shuffled(
        ALL_POSITIONS.filter(p => p !== capturedPos && !priorWithCaptured.has(p)),
        random
      ).slice(0, MAX_ORIGIN_CANDIDATES)

      for (const origin of originCandidates) {
        const trial = placePiece(priorWithCaptured, origin, pieceCode(movingTeam, trialMover))
        if (!trial) { continue }
        let moveObject
        try {
          const trialBoard = piecesIntoBoard(trial, movingTeam)
          moveObject = Rules.getMoveObject(origin, capturedPos, trialBoard)
        } catch { continue }
        if (moveObject.illegal || !moveObject.captureNotation) { continue }

        const after = clonePiecesMap(trial)
        after.delete(capturedPos)
        after.delete(origin)
        const placedAfter = placePiece(after, capturedPos, pieceCode(movingTeam, trialMover))
        if (!placedAfter) { continue }

        priorPieces.clear()
        for (const [p, piece] of trial.entries()) { priorPieces.set(p, piece) }

        ctx.moverSpecies = trialMover
        ctx.capturedSpecies = capturedSpecies
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

function engineerNonCaptureScenario({ pieces, moverSpecies, enemyMovedSpecies, enemyCapturedSpecies, ctx, movingTeam, enemyTeam, priorPieces, random }) {
  const moverCandidates = moverSpecies
    ? [moverSpecies]
    : shuffled([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT, Board.PAWN], random)

  for (const trialMover of moverCandidates) {
    const startCandidates = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)), random
    ).slice(0, MAX_POSITION_CANDIDATES)

    for (const origin of startCandidates) {
      if (trialMover === Board.PAWN && pawnOnStartingRank(movingTeam, origin)) { continue }
      const trialPrior = placePiece(priorPieces, origin, pieceCode(movingTeam, trialMover))
      if (!trialPrior) { continue }
      const priorBoard = piecesIntoBoard(trialPrior, movingTeam)
      let moves
      try { moves = Rules.availableMovesFrom({ board: priorBoard, startPosition: origin }) }
      catch { continue }
      if (!moves || moves.length === 0) { continue }

      for (const move of shuffled(moves, random)) {
        const dest = move.endPosition
        if (trialPrior.has(dest)) { continue }

        const after = clonePiecesMap(trialPrior)
        after.delete(origin)
        const placedAfter = placePiece(after, dest, pieceCode(movingTeam, trialMover))
        if (!placedAfter) { continue }

        priorPieces.clear()
        for (const [p, piece] of trialPrior.entries()) { priorPieces.set(p, piece) }

        ctx.moverSpecies = trialMover
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
