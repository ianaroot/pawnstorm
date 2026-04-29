import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { originCandidatesForSpecies, sortByDistanceFromRelation } from 'editorV2/panels/condition_preview/geometry_utils'
import {
  legalPriorTurnState, moveKindForMoveObject, soundForMove, candidateIdentity,
  MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/example_utils'
import { relationalActorLabels } from 'editorV2/panels/condition_preview/relational_utils'
import { PRIOR_BOARD_COMPARISON_SOURCE } from 'editorV2/panels/condition_preview/comparison_requirements'
import {
  clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout, layoutsMatch,
  shuffled, placeKingsIfAbsent, legalPlacementForSpecies, teamHasKing
} from './board_utils'

function descriptorAllowsZeroPairs(descriptor) {
  const { comparator, source } = descriptor
  if (source === PRIOR_BOARD_COMPARISON_SOURCE) {
    return comparator === 'less_than' || comparator === 'less_than_or_equal_to'
  }
  const total = Number((descriptor.resolvedTotal ?? descriptor.total) || 0)
  switch (comparator) {
    case 'equal_to': return total === 0
    case 'less_than': return total > 0
    case 'less_than_or_equal_to': return total >= 0
    default: return false
  }
}

const MAX_REVERSE_MOVES_PER_OPTION = 4
const MAX_EXAMPLES_PER_SEED = 3

// ===== Enemy recent move context =====

function buildEnemyRecentMoveContext(endPosition, species, enemyTeam, capturedSpecies, movingTeam, random) {
  const candidates = shuffled(
    originCandidatesForSpecies(endPosition, species).filter(p => p !== endPosition),
    random
  )
  const startPosition = candidates.length > 0 ? candidates[0] : endPosition
  return {
    moveObject: { startPosition, endPosition },
    movingTeam: enemyTeam,
    movedPieceStartPosition: startPosition,
    movedPieceEndPosition: endPosition,
    movedPieceSpeciesBeforeMove: species,
    movedPieceSpeciesAfterMove: species,
    capturedPiecePosition: capturedSpecies ? endPosition : null,
    capturedPieceTeam: capturedSpecies ? movingTeam : null,
    capturedPieceSpecies: capturedSpecies ?? null
  }
}

function buildComparisonRecentMoveContext({ combinedPlan, seed, random }) {
  const relationalPlans = combinedPlan.plans.filter(p => p.kind === 'relational')
  const enemyTeam = Board.opposingTeam(combinedPlan.movingTeam)

  for (let i = 0; i < relationalPlans.length; i++) {
    const plan = relationalPlans[i]
    const rp = seed.relationalPositions[i]
    if (!rp) { continue }

    if (plan.subject === 'enemy_moved_piece') {
      const capturedPool = plan.sourceConstraints?.enemyCapturedPieceSpeciesPool
      const capturedSpecies = capturedPool?.length > 0 ? capturedPool[Math.floor(random() * capturedPool.length)] : null
      return buildEnemyRecentMoveContext(rp.subjectPosition, rp.subjectSpecies, enemyTeam, capturedSpecies, combinedPlan.movingTeam, random)
    }
    if (plan.target === 'enemy_moved_piece') {
      const capturedPool = plan.sourceConstraints?.enemyCapturedPieceSpeciesPool
      const capturedSpecies = capturedPool?.length > 0 ? capturedPool[Math.floor(random() * capturedPool.length)] : null
      return buildEnemyRecentMoveContext(rp.targetPosition, rp.targetSpecies, enemyTeam, capturedSpecies, combinedPlan.movingTeam, random)
    }
  }

  for (const plan of relationalPlans) {
    const enemyMovedPool = plan.sourceConstraints?.enemyMovedPieceSpeciesPool
    const enemyCapturedPool = plan.sourceConstraints?.enemyCapturedPieceSpeciesPool
    if (enemyMovedPool || enemyCapturedPool) {
      const species = enemyMovedPool?.length > 0
        ? enemyMovedPool[Math.floor(random() * enemyMovedPool.length)]
        : Board.PAWN
      const capturedSpecies = enemyCapturedPool?.length > 0
        ? enemyCapturedPool[Math.floor(random() * enemyCapturedPool.length)]
        : null
      const freeSquares = Array.from({ length: 64 }, (_, i) => i).filter(p => !seed.pieces.has(p))
      const endPosition = freeSquares.length > 0
        ? freeSquares[Math.floor(random() * freeSquares.length)]
        : 0
      return buildEnemyRecentMoveContext(endPosition, species, enemyTeam, capturedSpecies, combinedPlan.movingTeam, random)
    }
  }

  return null
}

// ===== collectVerifiedMoves =====

export function collectVerifiedMoves({
  pieces, movedPieceSquare, movedPieceSpecies, movingTeam, attemptKind, recentMoveContext,
  capturedPieceSpeciesPool, evaluationPayloads, random, maxResults
}) {
  const piecesWithKings = placeKingsIfAbsent(pieces, random)
  if (!piecesWithKings) { return [] }

  const afterLayout = buildLayoutFromPieces(piecesWithKings)
  const afterBoard = buildBoardFromLayout(afterLayout)

  const originCandidates = shuffled(originCandidatesForSpecies(movedPieceSquare, movedPieceSpecies), random)
  const moves = []

  for (const originPosition of originCandidates) {
    if (piecesWithKings.has(originPosition)) { continue }
    if (attemptKind === MOVE_KIND_EN_PASSANT && recentMoveContext && originPosition === recentMoveContext.movedPieceEndPosition) { continue }

    const captureOptions = capturedPieceSpeciesPool === null
      ? [null]
      : (capturedPieceSpeciesPool.length === 0 ? [null] : capturedPieceSpeciesPool)

    for (const capturedSpecies of captureOptions) {
      const priorPieces = clonePiecesMap(piecesWithKings)
      priorPieces.delete(movedPieceSquare)
      priorPieces.set(originPosition, `${movingTeam}${movedPieceSpecies}`)

      if (capturedSpecies) {
        priorPieces.set(movedPieceSquare, `${Board.opposingTeam(movingTeam)}${capturedSpecies}`)
      }

      if (attemptKind === MOVE_KIND_EN_PASSANT && recentMoveContext) {
        priorPieces.set(recentMoveContext.movedPieceEndPosition, `${Board.opposingTeam(movingTeam)}${Board.PAWN}`)
      }

      const opposingTeam = Board.opposingTeam(movingTeam)
      if (!teamHasKing(priorPieces, movingTeam) || !teamHasKing(priorPieces, opposingTeam)) { continue }

      const priorLayout = buildLayoutFromPieces(priorPieces)
      const priorBoard = buildBoardFromLayout(priorLayout, recentMoveContext, movingTeam)

      let moveObject
      try {
        moveObject = Rules.getMoveObject(originPosition, movedPieceSquare, priorBoard)
      } catch {
        continue
      }

      if (moveObject.illegal) { continue }

      const captureRequired = capturedPieceSpeciesPool !== null && capturedPieceSpeciesPool.length > 0
      const captureForbidden = capturedPieceSpeciesPool !== null && capturedPieceSpeciesPool.length === 0
      if (captureRequired && !moveObject.captureNotation) { continue }
      if (captureForbidden && moveObject.captureNotation) { continue }
      if (capturedPieceSpeciesPool === null && attemptKind !== MOVE_KIND_EN_PASSANT && moveObject.captureNotation) { continue }

      if (!legalPriorTurnState(priorBoard, moveObject)) { continue }

      const rebuiltAfter = priorBoard.lightClone()
      rebuiltAfter._hypotheticallyMovePiece(moveObject)
      if (!layoutsMatch(rebuiltAfter.layOut, afterLayout)) { continue }

      const evaluator = new ConditionEvaluatorV2()
      const input = { board: priorBoard, moveObject }
      if (!evaluationPayloads.every(payload => evaluator.evaluate(payload, input))) { continue }

      moves.push({ priorBoard, moveObject, afterBoard })
      if (moves.length >= maxResults) { return moves }
    }
  }

  return moves
}

// ===== buildAggregatedResult =====

export function buildAggregatedResult(combinedPlan, analysis) {
  let subjectPositions = []
  let targetPositions = []
  let pairs = []

  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      const result = analysis.relationalResult(plan.relationParams)
      if (result.pairs.length === 0 && !plan.comparisonDescriptors?.some(descriptorAllowsZeroPairs)) { return null }
      subjectPositions = [...subjectPositions, ...result.subjectPositions]
      targetPositions = [...targetPositions, ...result.targetPositions]
      pairs = [...pairs, ...result.pairs]
    } else if (plan.kind === 'unary') {
      const positions = analysis.relationalActorPositions({
        actor: plan.subject,
        filter: plan.subjectFilter,
        filterMode: plan.subjectFilterMode
      })
      subjectPositions = [...subjectPositions, ...positions]
    } else if (plan.kind === 'position') {
      const positions = analysis.positionFilteredPositions({
        actor: plan.subject,
        filter: plan.subjectFilter,
        filterMode: plan.subjectFilterMode,
        positionAxis: plan.positionAxis,
        positionComparator: plan.positionComparator,
        positionTarget: plan.positionTarget
      })
      subjectPositions = [...subjectPositions, ...positions]
    }
  }

  return {
    subjectPositions: [...new Set(subjectPositions)],
    targetPositions: [...new Set(targetPositions)],
    pairs
  }
}

// ===== buildAggregatedHighlights =====

export function buildAggregatedHighlights(combinedPlan, moveObject, aggregatedResult, priorBoard) {
  const relationalPlans = combinedPlan.plans.filter(p => p.kind === 'relational')

  const priorSubject = new Set()
  const priorTarget = new Set()
  const afterSubject = new Set(aggregatedResult.subjectPositions)
  const afterTarget = new Set(aggregatedResult.targetPositions)

  for (const plan of relationalPlans) {
    const labels = relationalActorLabels(plan, moveObject, aggregatedResult, priorBoard)
    labels.prior.subjectPositions.forEach(p => priorSubject.add(p))
    labels.prior.targetPositions.forEach(p => priorTarget.add(p))
    labels.after.subjectPositions.forEach(p => afterSubject.add(p))
    labels.after.targetPositions.forEach(p => afterTarget.add(p))
  }

  if (relationalPlans.length === 0) {
    aggregatedResult.subjectPositions.forEach(p => priorSubject.add(p))
  }

  return {
    prior: {
      subjectPositions: [...priorSubject],
      targetPositions: [...priorTarget],
      movedStartPosition: moveObject.startPosition,
      movedEndPosition: null
    },
    after: {
      subjectPositions: [...afterSubject],
      targetPositions: [...afterTarget],
      movedStartPosition: null,
      movedEndPosition: moveObject.endPosition
    }
  }
}

// ===== buildMovedPieceOptions =====

function buildMovedPieceOptions({ combinedPlan, seed, variant, relationalPlans }) {
  const movedPieceSpeciesConstraint = combinedPlan.movedPieceSpeciesPool

  if (variant.type === 'required') {
    const options = []
    relationalPlans.forEach((plan, i) => {
      const rp = seed.relationalPositions[i]
      if (!rp) { return }
      if (plan.subject === 'moved_piece') {
        const species = rp.subjectSpecies
        if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
          options.push({ square: rp.subjectPosition, species })
        }
      }
      if (plan.target === 'moved_piece') {
        const species = rp.targetSpecies
        if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
          options.push({ square: rp.targetPosition, species })
        }
      }
    })
    return options
  }

  if (variant.type === 'involved') {
    const options = []
    relationalPlans.forEach((plan, i) => {
      const rp = seed.relationalPositions[i]
      if (!rp) { return }
      if (plan.subject === 'allied' || plan.subject === 'moved_piece') {
        const species = rp.subjectSpecies
        if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
          options.push({ square: rp.subjectPosition, species })
        }
      }
      if (plan.target === 'allied' || plan.target === 'moved_piece') {
        const species = rp.targetSpecies
        if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
          options.push({ square: rp.targetPosition, species })
        }
      }
    })
    if (options.length > 0 || relationalPlans.length > 0) { return options }

    // No relational plans (e.g. unary/position-only combined plan with en passant seed):
    // use moving-team pieces already seeded as moved piece candidates.
    seed.pieces.forEach((piece, square) => {
      if (!piece.startsWith(combinedPlan.movingTeam)) { return }
      const species = piece.slice(combinedPlan.movingTeam.length)
      if (movedPieceSpeciesConstraint && !movedPieceSpeciesConstraint.includes(species)) { return }
      options.push({ square, species })
    })
    return options
  }

  // 'separate' variant
  const occupied = new Set(seed.pieces.keys())
  const relationalPositionsList = seed.relationalPositions.filter(rp => rp !== null).flatMap(rp => [rp.subjectPosition, rp.targetPosition])
  const relationalPositionSet = new Set(relationalPositionsList)
  const extraSquares = sortByDistanceFromRelation(
    Array.from({ length: 64 }, (_, i) => i).filter(i => !occupied.has(i) && !relationalPositionSet.has(i)),
    relationalPositionsList
  )

  const speciesPool = movedPieceSpeciesConstraint
    ? [...movedPieceSpeciesConstraint]
    : [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]

  const options = []
  for (const species of speciesPool) {
    for (const square of extraSquares) {
      if (!legalPlacementForSpecies(square, species)) { continue }
      options.push({ square, species })
    }
  }
  return options
}

// ===== collectVerifiedExamples =====

export function collectVerifiedExamples({ combinedPlan, seed, variant, capturedPieceSpeciesPool = null, random }) {
  const relationalPlans = combinedPlan.plans.filter(p => p.kind === 'relational')
  const recentMoveContext = seed.recentMoveContext
    ?? buildComparisonRecentMoveContext({ combinedPlan, seed, random })

  const movedOptions = shuffled(
    buildMovedPieceOptions({ combinedPlan, seed, variant, relationalPlans }),
    random
  )

  const examples = []
  const seenCandidates = new Set()

  for (const option of movedOptions) {
    const afterPieces = clonePiecesMap(seed.pieces)
    afterPieces.set(option.square, `${combinedPlan.movingTeam}${option.species}`)

    const moveExamples = collectVerifiedMoves({
      pieces: afterPieces,
      movedPieceSquare: option.square,
      movedPieceSpecies: option.species,
      movingTeam: combinedPlan.movingTeam,
      attemptKind: seed.attemptKind,
      recentMoveContext,
      capturedPieceSpeciesPool,
      evaluationPayloads: combinedPlan.evaluationPayloads,
      random,
      maxResults: MAX_REVERSE_MOVES_PER_OPTION
    })

    for (const moveExample of moveExamples) {
      const analysis = new CandidateMoveAnalysisV2({ board: moveExample.priorBoard, moveObject: moveExample.moveObject })
      const aggregatedResult = buildAggregatedResult(combinedPlan, analysis)
      if (!aggregatedResult) { continue }

      const movedPieceInRelation = (
        aggregatedResult.subjectPositions.includes(moveExample.moveObject.endPosition) ||
        aggregatedResult.targetPositions.includes(moveExample.moveObject.endPosition)
      )

      if (variant.type === 'involved' && !movedPieceInRelation) { continue }
      if (variant.type === 'separate' && movedPieceInRelation) { continue }

      const highlights = buildAggregatedHighlights(
        combinedPlan, moveExample.moveObject, aggregatedResult, moveExample.priorBoard
      )

      const example = {
        priorBoard: moveExample.priorBoard,
        afterBoard: moveExample.afterBoard,
        moveObject: moveExample.moveObject,
        result: aggregatedResult,
        highlights,
        variantType: movedPieceInRelation ? 'involved' : 'separate',
        geometryKey: seed.geometryKey,
        movedPieceInRelation,
        moveKind: moveKindForMoveObject(moveExample.moveObject),
        sound: soundForMove(moveExample.priorBoard, moveExample.afterBoard, moveExample.moveObject)
      }

      const identity = candidateIdentity(example)
      if (seenCandidates.has(identity)) { continue }
      seenCandidates.add(identity)
      examples.push(example)

      if (examples.length >= MAX_EXAMPLES_PER_SEED) { return examples }
    }
  }

  return examples
}
