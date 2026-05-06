// Strategy for CAPTURE_EXISTENCE — engineers (or refrains from engineering) a
// capture event for captured_piece / enemy_captured_piece subjects.
//
// Trusts ctx: picks captured species from ctx.{actor}.species_set without
// re-applying filter+filterMode. Correctness of the species pool is ctx's
// responsibility; the strategy commits whatever the pool allows.
//
//   captured_piece        — engineer a current-turn capture via
//                           engineerCaptureScenario.
//   enemy_captured_piece  — synthesize a recentMoveContext describing the
//                           enemy's prior turn capturing an allied piece.
//
// Polarity (per hint.countOp + hint.n):
//   present  (count > 0, count >= 1, count = 1)  — engineer a capture.
//   absent   (count = 0 with filter or filterMode = 'exclude') — coin flip
//            per attempt: skip engineering (no capture happens) OR engineer
//            a capture from the ctx pool. The orchestrator's many attempts
//            diversify naturally.

import Board from 'gameplay/board'
import { pickRandom } from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildRecentMoveContext } from 'editorV2/panels/condition_preview/shared/example_utils'
import { engineerCaptureScenario } from './capture_engineering'

function isPresentPolarity(hint) {
  if (hint.countOp === 'greater_than' && hint.n === 0) { return true }
  if (hint.countOp === 'greater_than_or_equal_to' && hint.n === 1) { return true }
  if (hint.countOp === 'equal_to' && hint.n === 1) { return true }
  return false
}

function nonNullSpecies(speciesSet) {
  return [...speciesSet].filter(s => s !== null)
}

function engineerCapturedPiece(pieces, ctx) {
  const speciesPool = nonNullSpecies(ctx.capturedPiece.species_set)
  if (speciesPool.length === 0) { return null }
  const capturedSpecies = pickRandom(speciesPool, ctx.random)
  return engineerCaptureScenario({
    pieces,
    capturedSpecies,
    moverSpecies: undefined,
    enemyMovedSpecies: undefined,
    enemyCapturedSpecies: undefined,
    ctx,
    movingTeam: ctx.movingTeam,
    enemyTeam: ctx.enemyTeam,
    priorPieces: ctx.priorPieces,
    random: ctx.random
  })
}

function synthesizeEnemyCapture({ ctx, capturedSpecies }) {
  const moverPool = nonNullSpecies(ctx.enemyMovedPiece.species_set).filter(s => s !== Board.KING)
  if (moverPool.length === 0) { return false }
  const moverSpecies = pickRandom(moverPool, ctx.random)

  const capturedPositions = ctx.enemyCapturedPiece.position_set
  const moverEndPositions = ctx.enemyMovedPiece.position_set
  const endCandidates = [...capturedPositions].filter(p => moverEndPositions.has(p))
  const endPosition = endCandidates.length > 0
    ? pickRandom(endCandidates, ctx.random)
    : null

  ctx.recentMoveContext = buildRecentMoveContext({
    team: ctx.enemyTeam,
    species: moverSpecies,
    endPosition,
    capturedSpecies,
    random: ctx.random
  })

  ctx.enemyMovedPiece.species_set.clear()
  ctx.enemyMovedPiece.species_set.add(moverSpecies)
  ctx.enemyCapturedPiece.species_set.clear()
  ctx.enemyCapturedPiece.species_set.add(capturedSpecies)
  if (endPosition !== null) {
    ctx.enemyMovedPiece.position_set.clear()
    ctx.enemyMovedPiece.position_set.add(endPosition)
    ctx.enemyCapturedPiece.position_set.clear()
    ctx.enemyCapturedPiece.position_set.add(endPosition)
  }
  return true
}

function commitNoEnemyCapture(ctx) {
  ctx.enemyCapturedPiece.species_set.clear()
  ctx.enemyCapturedPiece.species_set.add(null)
}

function engineerEnemyCapturedPiece(pieces, hint, ctx) {
  const speciesPool = nonNullSpecies(ctx.enemyCapturedPiece.species_set)
  const present = isPresentPolarity(hint)

  if (present) {
    if (speciesPool.length === 0) { return null }
    const capturedSpecies = pickRandom(speciesPool, ctx.random)
    if (!synthesizeEnemyCapture({ ctx, capturedSpecies })) { return null }
    return pieces
  }

  // Absent polarity: half the time, no enemy capture.
  if (ctx.random() < 0.5 || speciesPool.length === 0) {
    commitNoEnemyCapture(ctx)
    return pieces
  }
  const capturedSpecies = pickRandom(speciesPool, ctx.random)
  if (!synthesizeEnemyCapture({ ctx, capturedSpecies })) {
    commitNoEnemyCapture(ctx)
  }
  return pieces
}

export function captureExistenceStrategy(pieces, hint, ctx) {
  if (hint.actor === 'captured_piece') {
    if (isPresentPolarity(hint)) {
      return engineerCapturedPiece(pieces, ctx)
    }
    // Absent polarity: half the time, skip engineering (default seed → non-capture).
    if (ctx.random() < 0.5) { return pieces }
    const result = engineerCapturedPiece(pieces, ctx)
    return result ?? pieces
  }
  if (hint.actor === 'enemy_captured_piece') {
    return engineerEnemyCapturedPiece(pieces, hint, ctx)
  }
  return null
}
