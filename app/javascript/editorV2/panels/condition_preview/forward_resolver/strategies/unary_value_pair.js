// Strategy for UNARY_VALUE_PAIR — unary pair, value variant.
//
// The hint declares two singular move-event actors (subjectActor, targetActor)
// and a value comparator. Strategy engineers a move scenario where both actors
// exist with species whose material values satisfy the comparator.
//
// Subject and target species pools come from the converged chain constraints
// in ctx (ctx.{actor}.species_set) — sibling plans' species constraints flow
// through automatically. After committing, the strategy narrows ctx for both
// actors to singletons.
//
// Actor species resolve as follows (applied at engineering time):
//   moved_piece           — narrowed via ctx.movedPiece.species_set
//   captured_piece        — narrowed via ctx.capturedPiece.species_set
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
  pieceCode, clonePiecesMap, ALL_POSITIONS, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { buildRecentMoveContext } from 'editorV2/panels/condition_preview/shared/example_utils'
import { buildLayoutAndBoard } from '../hint_compiler'
import { ACTOR_TO_VAR_KEY } from '../chain_constraints'
import { respectsInventoryCaps } from '../inventory_protocol'
import {
  engineerCaptureScenario, pawnOnStartingRank, MAX_POSITION_CANDIDATES
} from './capture_engineering'

const MAX_PAIR_ATTEMPTS = 5

const COMPARATOR_FN = Object.freeze({
  equal_to: (a, b) => a === b,
  greater_than: (a, b) => a > b,
  greater_than_or_equal_to: (a, b) => a >= b,
  less_than: (a, b) => a < b,
  less_than_or_equal_to: (a, b) => a <= b
})



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

function nonNullSpecies(speciesSet) {
  return [...speciesSet].filter(s => s !== null)
}

export function unaryValuePairStrategy(pieces, hint, ctx) {
  const { random, movingTeam, enemyTeam, priorPieces } = ctx

  const subjectVarKey = ACTOR_TO_VAR_KEY[hint.subjectActor]
  const targetVarKey = ACTOR_TO_VAR_KEY[hint.targetActor]
  const subjectPool = nonNullSpecies(ctx[subjectVarKey].species_set)
  const targetPool = nonNullSpecies(ctx[targetVarKey].species_set)

  const candidatePairs = valueComparablePairs(
    subjectPool, targetPool, hint.valueOp, random
  ).slice(0, MAX_PAIR_ATTEMPTS)

  for (const [subjectSpecies, targetSpecies] of candidatePairs) {
    const actorSpecies = {
      [hint.subjectActor]: subjectSpecies,
      [hint.targetActor]: targetSpecies
    }
    const result = engineerScenario({ pieces, actorSpecies, ctx, movingTeam, enemyTeam, priorPieces, random })
    // engineerScenario narrows ctx.movedPiece (to trialMover) and ctx.capturedPiece
    // (to capturedSpecies, when capturing) on commit. enemy_moved_piece and
    // enemy_captured_piece species commits live in ctx.recentMoveContext.
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

function engineerNonCaptureScenario({ pieces, moverSpecies, enemyMovedSpecies, enemyCapturedSpecies, ctx, movingTeam, enemyTeam, priorPieces, random }) {
  const moverCandidates = moverSpecies
    ? [moverSpecies]
    : shuffled([...ctx.movedPiece.species_set].filter(s => s !== Board.KING), random)

  for (const trialMover of moverCandidates) {
    if (!respectsInventoryCaps(movingTeam, trialMover, priorPieces, ctx, 'prior')) { continue }
    if (!respectsInventoryCaps(movingTeam, trialMover, pieces, ctx, 'current')) { continue }

    const startCandidates = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)), random
    ).slice(0, MAX_POSITION_CANDIDATES)

    for (const origin of startCandidates) {
      if (trialMover === Board.PAWN && pawnOnStartingRank(movingTeam, origin)) { continue }
      const trialPrior = placePiece(priorPieces, origin, pieceCode(movingTeam, trialMover))
      if (!trialPrior) { continue }
      const priorBoard = buildLayoutAndBoard(trialPrior, movingTeam)
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

        // Narrow ctx.movedPiece to the committed mover and end position. No
        // capture happened, so ctx.capturedPiece is unchanged (still
        // includes null).
        ctx.movedPiece.species_set.clear()
        ctx.movedPiece.species_set.add(trialMover)
        ctx.movedPiece.position_set.clear()
        ctx.movedPiece.position_set.add(dest)

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
