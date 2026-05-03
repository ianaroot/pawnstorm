import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import {
  legalPriorTurnState, soundForMove, candidateIdentity,
  MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import {
  clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout, layoutsMatch,
  placeKingsIfAbsent, shuffled
} from '../shared/board_utils'
import {
  buildSeedFromPreset, castlePresetsForTeam, promotionPresetsForTeam, enPassantPresetsForTeam
} from '../seeds/seed_builder'
import {
  buildAggregatedResult, buildAggregatedHighlights
} from './move_collection'


const CAPTURED_SPECIES_OPTIONS = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])

// ===== Shared verification helpers =====

function evaluateAndBuildExample({
  combinedPlan, priorBoard, afterLayout, afterBoard, moveObject, seed, moveKind
}) {
  if (moveObject.illegal) { return null }
  if (!legalPriorTurnState(priorBoard, moveObject)) { return null }

  const rebuiltAfter = priorBoard.lightClone()
  rebuiltAfter._hypotheticallyMovePiece(moveObject)
  if (!layoutsMatch(rebuiltAfter.layOut, afterLayout)) { return null }

  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject }
  if (!combinedPlan.evaluationPayloads.every(payload => evaluator.evaluate(payload, input))) { return null }

  const analysis = new CandidateMoveAnalysisV2({ board: priorBoard, moveObject })
  const aggregatedResult = buildAggregatedResult(combinedPlan, analysis)
  if (!aggregatedResult) { return null }

  const highlights = buildAggregatedHighlights(combinedPlan, moveObject, aggregatedResult, priorBoard)
  const movedPieceInRelation = (
    aggregatedResult.subjectPositions.includes(moveObject.endPosition) ||
    aggregatedResult.targetPositions.includes(moveObject.endPosition)
  )

  return {
    priorBoard,
    afterBoard,
    moveObject,
    result: aggregatedResult,
    highlights,
    variantType: movedPieceInRelation ? 'involved' : 'separate',
    geometryKey: seed.geometryKey,
    movedPieceInRelation,
    moveKind,
    sound: soundForMove(priorBoard, afterBoard, moveObject)
  }
}

// ===== Castle =====

export function collectCastleExamples({ combinedPlan, random, maxExamples }) {
  const presets = castlePresetsForTeam(combinedPlan.movingTeam)
  const examples = []
  const seen = new Set()

  for (const preset of presets) {
    if (examples.length >= maxExamples) { break }

    const seed = buildSeedFromPreset(combinedPlan, preset, MOVE_KIND_CASTLE, random)
    if (!seed) { continue }

    const piecesWithKings = placeKingsIfAbsent(seed.pieces, random)
    if (!piecesWithKings) { continue }

    if (piecesWithKings.get(preset.kingEnd) !== `${combinedPlan.movingTeam}${Board.KING}`) { continue }
    if (piecesWithKings.get(preset.rookEnd) !== `${combinedPlan.movingTeam}${Board.ROOK}`) { continue }

    const afterLayout = buildLayoutFromPieces(piecesWithKings)
    const afterBoard = buildBoardFromLayout(afterLayout)

    const priorPieces = clonePiecesMap(piecesWithKings)
    priorPieces.delete(preset.kingEnd)
    priorPieces.delete(preset.rookEnd)
    if (priorPieces.has(preset.kingStart) || priorPieces.has(preset.rookStart)) { continue }
    priorPieces.set(preset.kingStart, `${combinedPlan.movingTeam}${Board.KING}`)
    priorPieces.set(preset.rookStart, `${combinedPlan.movingTeam}${Board.ROOK}`)

    const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces), null, combinedPlan.movingTeam)

    let moveObject
    try {
      moveObject = Rules.getMoveObject(preset.kingStart, preset.kingEnd, priorBoard)
    } catch {
      continue
    }

    if (!moveObject.additionalActions) { continue }

    const example = evaluateAndBuildExample({
      combinedPlan, priorBoard, afterLayout, afterBoard, moveObject, seed,
      moveKind: MOVE_KIND_CASTLE
    })
    if (!example) { continue }

    const identity = candidateIdentity(example)
    if (seen.has(identity)) { continue }
    seen.add(identity)
    examples.push(example)
  }

  return examples
}

// ===== Promotion =====

function* roundRobinPromotionPresets(presets, random) {
  const bucketMap = new Map()
  for (const preset of presets) {
    const key = `${preset.promotedSpecies}-${preset.captureDirection}`
    if (!bucketMap.has(key)) { bucketMap.set(key, []) }
    bucketMap.get(key).push(preset)
  }

  const buckets = Array.from(bucketMap.values()).map(bucket => shuffled(bucket, random))
  const indices = new Array(buckets.length).fill(0)

  let remaining = true
  while (remaining) {
    remaining = false
    for (let b = 0; b < buckets.length; b++) {
      if (indices[b] < buckets[b].length) {
        yield buckets[b][indices[b]++]
        remaining = true
      }
    }
  }
}

export function collectPromotionExamples({ combinedPlan, random, maxExamples }) {
  const allPresets = promotionPresetsForTeam(combinedPlan.movingTeam)
  const examples = []
  const seen = new Set()
  const enemyTeam = Board.opposingTeam(combinedPlan.movingTeam)

  for (const preset of roundRobinPromotionPresets(allPresets, random)) {
    if (examples.length >= maxExamples) { break }

    const seed = buildSeedFromPreset(combinedPlan, preset, MOVE_KIND_PROMOTION, random)
    if (!seed) { continue }

    const piecesWithKings = placeKingsIfAbsent(seed.pieces, random)
    if (!piecesWithKings) { continue }

    if (piecesWithKings.get(preset.moveEnd) !== `${combinedPlan.movingTeam}${preset.promotedSpecies}`) { continue }

    const afterLayout = buildLayoutFromPieces(piecesWithKings)
    const afterBoard = buildBoardFromLayout(afterLayout)

    const basePriorPieces = clonePiecesMap(piecesWithKings)
    basePriorPieces.delete(preset.moveEnd)
    if (basePriorPieces.has(preset.moveStart)) { continue }

    const capturedOptions = preset.isCapture ? CAPTURED_SPECIES_OPTIONS : [null]

    for (const capturedSpecies of capturedOptions) {
      if (examples.length >= maxExamples) { break }

      const priorPieces = clonePiecesMap(basePriorPieces)
      if (capturedSpecies !== null) {
        priorPieces.set(preset.moveEnd, `${enemyTeam}${capturedSpecies}`)
      }
      priorPieces.set(preset.moveStart, `${combinedPlan.movingTeam}${Board.PAWN}`)

      const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces), null, combinedPlan.movingTeam)

      let moveObject
      try {
        moveObject = Rules.getMoveObject(preset.moveStart, preset.moveEnd, priorBoard, preset.promotedSpecies)
      } catch {
        continue
      }

      if (!moveObject.promotionPiece) { continue }

      const example = evaluateAndBuildExample({
        combinedPlan, priorPieces, priorBoard, afterLayout, afterBoard, moveObject, seed,
        moveKind: MOVE_KIND_PROMOTION
      })
      if (!example) { continue }

      const identity = candidateIdentity(example)
      if (seen.has(identity)) { continue }
      seen.add(identity)
      examples.push(example)
    }
  }

  return examples
}

// ===== En passant =====
//
// Constructs prior+after directly from the preset, mirroring castle and
// promotion. Bypasses collectVerifiedExamples (whose variant filter was
// rejecting en-passant in the common case where moved_piece's endPosition
// isn't in the relation — captured_piece sits at a different square in
// en-passant by definition).

export function collectEnPassantExamples({ combinedPlan, random, maxExamples }) {
  const presets = shuffled(enPassantPresetsForTeam(combinedPlan.movingTeam), random)
  const examples = []
  const seen = new Set()
  const movingTeam = combinedPlan.movingTeam
  const enemyTeam = Board.opposingTeam(movingTeam)
  const moverPiece = `${movingTeam}${Board.PAWN}`
  const enemyPawn = `${enemyTeam}${Board.PAWN}`
  const dir = movingTeam === Board.BLACK ? 1 : -1

  for (const preset of presets) {
    if (examples.length >= maxExamples) { break }

    const seed = buildSeedFromPreset(combinedPlan, preset, MOVE_KIND_EN_PASSANT, random)
    if (!seed) { continue }

    const piecesWithKings = placeKingsIfAbsent(seed.pieces, random)
    if (!piecesWithKings) { continue }

    // The preset's only fixed piece is the mover at destSquare on the after-board.
    const destSquare = preset.fixedPieces.keys().next().value
    if (piecesWithKings.get(destSquare) !== moverPiece) { continue }
    const capturedSquare = preset.recentMoveContext.movedPieceEndPosition

    // placeKingsIfAbsent doesn't know about preset.reservedSquares, so a king
    // can land on capturedSquare. Overwriting it with the captured pawn would
    // produce a kingless board. Skip this preset attempt; the next iteration
    // gets fresh RNG.
    if (piecesWithKings.has(capturedSquare)) { continue }

    const afterLayout = buildLayoutFromPieces(piecesWithKings)
    const afterBoard = buildBoardFromLayout(afterLayout)

    const file = destSquare % 8
    const originCandidates = []
    if (file > 0) { originCandidates.push(destSquare + 8 * dir - 1) }
    if (file < 7) { originCandidates.push(destSquare + 8 * dir + 1) }

    for (const origin of shuffled(originCandidates, random)) {
      if (examples.length >= maxExamples) { break }
      // Skip if origin is occupied by something other than the (about-to-move) pawn.
      // The destSquare gets cleared and re-set; origin must be empty in piecesWithKings.
      if (piecesWithKings.has(origin) && origin !== destSquare) { continue }

      const priorPieces = clonePiecesMap(piecesWithKings)
      priorPieces.delete(destSquare)
      priorPieces.set(origin, moverPiece)
      priorPieces.set(capturedSquare, enemyPawn)

      const priorBoard = buildBoardFromLayout(
        buildLayoutFromPieces(priorPieces),
        preset.recentMoveContext,
        movingTeam
      )

      let moveObject
      try { moveObject = Rules.getMoveObject(origin, destSquare, priorBoard) }
      catch { continue }
      if (moveObject.illegal) { continue }
      // Real en-passant has additionalActions (removing the captured pawn at
      // capturedSquare). If Rules didn't recognize this as en-passant, skip.
      if (!moveObject.additionalActions) { continue }

      const example = evaluateAndBuildExample({
        combinedPlan, priorBoard, afterLayout, afterBoard, moveObject, seed,
        moveKind: MOVE_KIND_EN_PASSANT
      })
      if (!example) { continue }

      const identity = candidateIdentity(example)
      if (seen.has(identity)) { continue }
      seen.add(identity)
      examples.push(example)
    }
  }

  return examples
}
