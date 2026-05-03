import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { findCombinatorialQualifyingGroups } from 'bot_execution/relational_qualifying'
import { originCandidatesForSpecies, sortByDistanceFromRelation } from 'editorV2/panels/condition_preview_generation/shared/geometry_utils'
import {
  legalPriorTurnState, moveKindForMoveObject, soundForMove, candidateIdentity,
  MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { relationalActorLabels } from 'editorV2/panels/condition_preview_generation/shared/relational_utils'
import {
  PRIOR_BOARD_COMPARISON_SOURCE,
  COUNT_COMPARISON_METRIC,
  AGGREGATE_VALUE_METRIC
} from 'editorV2/panels/condition_preview_generation/plans/comparison_requirements'
import {
  clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout, layoutsMatch,
  shuffled, placeKingsIfAbsent, legalPlacementForSpecies, teamHasKing, ALL_POSITIONS
} from '../shared/board_utils'

function descriptorAllowsZeroPairs(descriptor) {
  const { comparator, source } = descriptor
  if (source === PRIOR_BOARD_COMPARISON_SOURCE) {
    return comparator === 'less_than' || comparator === 'less_than_or_equal_to' || comparator === 'equal_to'
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
      const canonical = rp.subjectPositions[0]
      return buildEnemyRecentMoveContext(canonical.position, canonical.species, enemyTeam, capturedSpecies, combinedPlan.movingTeam, random)
    }
    if (plan.target === 'enemy_moved_piece') {
      const capturedPool = plan.sourceConstraints?.enemyCapturedPieceSpeciesPool
      const capturedSpecies = capturedPool?.length > 0 ? capturedPool[Math.floor(random() * capturedPool.length)] : null
      const canonical = rp.targetPositions[0]
      return buildEnemyRecentMoveContext(canonical.position, canonical.species, enemyTeam, capturedSpecies, combinedPlan.movingTeam, random)
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
      const freeSquares = ALL_POSITIONS.filter(p => !seed.pieces.has(p))
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
  pieces, movedPieceSquare, movedPieceSpecies, movingTeam, moveKind, recentMoveContext,
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
    if (moveKind === MOVE_KIND_EN_PASSANT && recentMoveContext && originPosition === recentMoveContext.movedPieceEndPosition) { continue }

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

      if (moveKind === MOVE_KIND_EN_PASSANT && recentMoveContext) {
        priorPieces.set(recentMoveContext.movedPieceEndPosition, `${Board.opposingTeam(movingTeam)}${Board.PAWN}`)
      }

      if (!teamHasKing(priorPieces, movingTeam) || !teamHasKing(priorPieces, Board.opposingTeam(movingTeam))) {
        continue
      }

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
      if (capturedPieceSpeciesPool === null && moveKind !== MOVE_KIND_EN_PASSANT && moveObject.captureNotation) { continue }

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

function combinatorialFilterArgs(plan) {
  const descriptors = plan.comparisonDescriptors ?? []
  const subjectDescriptor = descriptors.find(d => d.side === 'subject')
  const targetDescriptor = descriptors.find(d => d.side === 'target')

  const descriptorTotal = (descriptor) => Number((descriptor.resolvedTotal ?? descriptor.total) || 0)

  if (subjectDescriptor?.metric === COUNT_COMPARISON_METRIC && targetDescriptor?.metric === AGGREGATE_VALUE_METRIC) {
    return {
      groupBySide: 'subject', valueSide: 'target',
      valueComparator: targetDescriptor.comparator,
      valueReferenceTotal: descriptorTotal(targetDescriptor),
      countComparator: subjectDescriptor.comparator,
      countReferenceTotal: descriptorTotal(subjectDescriptor)
    }
  }

  if (subjectDescriptor?.metric === AGGREGATE_VALUE_METRIC && targetDescriptor?.metric === COUNT_COMPARISON_METRIC) {
    return {
      groupBySide: 'target', valueSide: 'subject',
      valueComparator: subjectDescriptor.comparator,
      valueReferenceTotal: descriptorTotal(subjectDescriptor),
      countComparator: targetDescriptor.comparator,
      countReferenceTotal: descriptorTotal(targetDescriptor)
    }
  }

  return null
}

function applyCombinatorialFilter(plan, result, analysis) {
  const args = combinatorialFilterArgs(plan)
  if (!args) { return result }

  const qualifyingKeys = findCombinatorialQualifyingGroups({
    pairs: result.pairs, board: analysis.afterBoard(), ...args
  })
  if (qualifyingKeys === null) { return result }

  const keySet = new Set(qualifyingKeys)
  const filteredPairs = result.pairs.filter(pair => {
    const key = args.groupBySide === 'subject' ? pair.subjectPosition : pair.targetPosition
    return keySet.has(key)
  })

  return {
    pairs: filteredPairs,
    subjectPositions: [...new Set(filteredPairs.map(p => p.subjectPosition))],
    targetPositions: [...new Set(filteredPairs.map(p => p.targetPosition))]
  }
}

export function buildAggregatedResult(combinedPlan, analysis) {
  let subjectPositions = []
  let targetPositions = []
  let pairs = []

  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      // same_piece bypasses pair-aggregation — both actors resolve to the same
      // square (the captured piece's prior position). CEv2 is authoritative
      // for evaluation; we produce a synthetic single-pair result for highlighting.
      if (plan.operator === 'same_piece') {
        const capturedPos = analysis.capturedPiecePosition()
        if (capturedPos !== null && capturedPos !== undefined) {
          subjectPositions.push(capturedPos)
          targetPositions.push(capturedPos)
          pairs.push({ subject: capturedPos, target: capturedPos })
        }
        continue
      }
      const rawResult = analysis.relationalResult(plan.relationParams)
      if (rawResult.pairs.length === 0 && !plan.comparisonDescriptors?.some(descriptorAllowsZeroPairs)) { return null }
      const result = applyCombinatorialFilter(plan, rawResult, analysis)
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

  if (combinedPlan.plans.length > 1) {
    const priorRelation = [...new Set([...priorSubject, ...priorTarget])]
    const afterRelation = [...new Set([...afterSubject, ...afterTarget])]
    return {
      prior: {
        relationPositions: priorRelation,
        movedStartPosition: moveObject.startPosition,
        movedEndPosition: moveObject.endPosition
      },
      after: {
        relationPositions: afterRelation,
        movedStartPosition: null,
        movedEndPosition: moveObject.endPosition
      }
    }
  }

  return {
    prior: {
      subjectPositions: [...priorSubject],
      targetPositions: [...priorTarget],
      movedStartPosition: moveObject.startPosition,
      movedEndPosition: moveObject.endPosition
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
        rp.subjectPositions.forEach(({ position, species }) => {
          if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
            options.push({ square: position, species })
          }
        })
      }
      if (plan.target === 'moved_piece') {
        rp.targetPositions.forEach(({ position, species }) => {
          if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
            options.push({ square: position, species })
          }
        })
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
        rp.subjectPositions.forEach(({ position, species }) => {
          if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
            options.push({ square: position, species })
          }
        })
      }
      if (plan.target === 'allied' || plan.target === 'moved_piece') {
        rp.targetPositions.forEach(({ position, species }) => {
          if (!movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species)) {
            options.push({ square: position, species })
          }
        })
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
  const relationalPositionsList = seed.relationalPositions
    .filter(rp => rp !== null)
    .flatMap(rp => [
      ...rp.subjectPositions.map(p => p.position),
      ...rp.targetPositions.map(p => p.position)
    ])
  const relationalPositionSet = new Set(relationalPositionsList)
  const extraSquares = sortByDistanceFromRelation(
    ALL_POSITIONS.filter(i => !occupied.has(i) && !relationalPositionSet.has(i)),
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
      moveKind: seed.moveKind,
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
