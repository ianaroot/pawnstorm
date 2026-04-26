import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import { originCandidatesForSpecies, sortByDistanceFromRelation } from 'editorV2/panels/condition_preview/geometry_utils'
import {
  square, unique, shuffled, clonePiecesMap, pieceCode, legalPlacementForSpecies,
  buildLayoutFromPieces, buildBoardFromLayout, weightedRandomSpecies
} from 'editorV2/panels/condition_preview/board_utils'
import { selectKingPair, collectLegalReverseMoves, moveKindForMoveObject, soundForMove, candidateIdentity } from 'editorV2/panels/condition_preview/example_utils'
import {
  roleRequiresEnemyMovedPiece, relationalActorRequiresPresence,
  subjectTargetLabels, evaluateCandidate
} from 'editorV2/panels/condition_preview/relational_utils'

const MAX_REVERSE_MOVES_PER_OPTION = 4
const MAX_EXAMPLES_PER_SKELETON = 3

export function preferredExtraMovedSpecies(subjectSpecies, targetSpecies) {
  return unique([
    Board.NIGHT,
    Board.BISHOP,
    Board.ROOK,
    Board.QUEEN,
    Board.PAWN,
    subjectSpecies,
    targetSpecies
  ])
}

export function buildEnemyRecentMoveContext(endPosition, species) {
  return buildEnemyRecentMoveContextWithCapture(endPosition, species, null)
}

export function buildEnemyRecentMoveContextWithCapture(endPosition, species, capturedSpecies = null) {
  const candidates = originCandidatesForSpecies(endPosition, species).filter(position => position !== endPosition)
  const startPosition = candidates[0] || endPosition
  return {
    moveObject: { startPosition, endPosition },
    movingTeam: Board.BLACK,
    movedPieceStartPosition: startPosition,
    movedPieceEndPosition: endPosition,
    movedPieceSpeciesBeforeMove: species,
    movedPieceSpeciesAfterMove: species,
    capturedPiecePosition: capturedSpecies ? square('a3') : null,
    capturedPieceTeam: capturedSpecies ? Board.WHITE : null,
    capturedPieceSpecies: capturedSpecies
  }
}

function valueSourceConstraintSpecies(plan, key) {
  return plan.sourceConstraints?.[key] ?? undefined
}

function randomConstrainedSpecies(random, key, plan, { includeKing = true } = {}) {
  return weightedRandomSpecies(random, {
    includeKing,
    allowedSpecies: valueSourceConstraintSpecies(plan, key)
  })
}

export function roleSquaresForMovedPiece(plan, skeleton) {
  const options = []
  if (plan.subject === 'moved_piece') {
    options.push({ square: skeleton.subjectPosition, species: skeleton.subjectSpecies, reason: 'required' })
  } else if (plan.target === 'moved_piece') {
    options.push({ square: skeleton.targetPosition, species: skeleton.targetSpecies, reason: 'required' })
  } else {
    if (plan.subject === 'allied') {
      options.push({ square: skeleton.subjectPosition, species: skeleton.subjectSpecies, reason: 'subject' })
    }
    if (plan.target === 'allied') {
      options.push({ square: skeleton.targetPosition, species: skeleton.targetSpecies, reason: 'target' })
    }
  }
  return options
}

export function movedPieceOptionSets({ plan, skeleton, variant }) {
  const movedPieceSpeciesConstraint = valueSourceConstraintSpecies(plan, 'movedPieceSpeciesPool')
  if (variant.type === 'required') {
    return roleSquaresForMovedPiece(plan, skeleton)
      .filter(option => !movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(option.species))
      .map(option => ({
        ...option,
        variantType: 'required'
      }))
  }

  if (variant.type === 'involved') {
    return roleSquaresForMovedPiece(plan, skeleton)
      .filter(option => !movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(option.species))
      .map(option => ({
        ...option,
        variantType: 'involved'
      }))
  }

  const occupied = new Set(skeleton.pieces.keys())
  const relationPositions = [skeleton.subjectPosition, skeleton.targetPosition]
  const extraSquares = sortByDistanceFromRelation(
    Array.from({ length: 64 }, (_unused, index) => index).filter(index => !occupied.has(index)),
    relationPositions
  )

  const options = []
  preferredExtraMovedSpecies(skeleton.subjectSpecies, skeleton.targetSpecies)
    .filter(species => !movedPieceSpeciesConstraint || movedPieceSpeciesConstraint.includes(species))
    .forEach(species => {
      extraSquares.forEach(squarePosition => {
        if (!legalPlacementForSpecies(squarePosition, species)) { return }
        options.push({
          square: squarePosition,
          species,
          reason: 'separate',
          variantType: 'separate'
        })
      })
    })

  return options
}

export function requiredZeroRelationPlacements({ plan, random }) {
  const placements = []

  if (roleRequiresEnemyMovedPiece(plan.subject)) {
    const subjectSpecies = plan.subjectSpeciesPool[0] || Board.NIGHT
    placements.push({
      side: 'subject',
      actor: plan.subject,
      position: square('b6'),
      species: subjectSpecies,
      team: Board.BLACK,
      recentMoveContext: buildEnemyRecentMoveContextWithCapture(
        square('b6'),
        subjectSpecies,
        randomConstrainedSpecies(random, 'enemyCapturedPieceSpeciesPool', plan, { includeKing: false })
      )
    })
  }

  if (roleRequiresEnemyMovedPiece(plan.target)) {
    const targetSpecies = plan.targetSpeciesPool[0] || Board.PAWN
    placements.push({
      side: 'target',
      actor: plan.target,
      position: square('g6'),
      species: targetSpecies,
      team: Board.BLACK,
      recentMoveContext: buildEnemyRecentMoveContextWithCapture(
        square('g6'),
        targetSpecies,
        randomConstrainedSpecies(random, 'enemyCapturedPieceSpeciesPool', plan, { includeKing: false })
      )
    })
  }

  return placements
}

function comparisonRecentMoveContext({ plan, skeleton, random }) {
  const enemyCapturedSpecies = randomConstrainedSpecies(random, 'enemyCapturedPieceSpeciesPool', plan, { includeKing: false })

  if (roleRequiresEnemyMovedPiece(plan.subject)) {
    return buildEnemyRecentMoveContextWithCapture(skeleton.subjectPosition, skeleton.subjectSpecies, enemyCapturedSpecies)
  }
  if (roleRequiresEnemyMovedPiece(plan.target)) {
    return buildEnemyRecentMoveContextWithCapture(skeleton.targetPosition, skeleton.targetSpecies, enemyCapturedSpecies)
  }

  const constrainedEnemyMovedSpecies = randomConstrainedSpecies(random, 'enemyMovedPieceSpeciesPool', plan, { includeKing: false })
  if (constrainedEnemyMovedSpecies || enemyCapturedSpecies) {
    return buildEnemyRecentMoveContextWithCapture(square('b6'), constrainedEnemyMovedSpecies || Board.PAWN, enemyCapturedSpecies)
  }

  return null
}

export function collectVerifiedExamples({ plan, skeleton, variant, random }) {
  const recentMoveContext = comparisonRecentMoveContext({ plan, skeleton, random })

  const movedOptions = shuffled(movedPieceOptionSets({ plan, skeleton, variant }), random)
  const examples = []
  const seenCandidates = new Set()

  for (let index = 0; index < movedOptions.length; index += 1) {
    const movedOption = movedOptions[index]
    const afterPieces = clonePiecesMap(skeleton.pieces)
    afterPieces.set(movedOption.square, pieceCode(Board.WHITE, movedOption.species))

    const moveExamples = collectLegalReverseMoves({
      afterPieces,
      movedPieceSquare: movedOption.square,
      movedPieceSpecies: movedOption.species,
      recentMoveContext,
      capturedPieceSpeciesPool: valueSourceConstraintSpecies(plan, 'capturedPieceSpeciesPool') ?? null,
      random,
      maxResults: MAX_REVERSE_MOVES_PER_OPTION
    })

    for (let moveIndex = 0; moveIndex < moveExamples.length; moveIndex += 1) {
      const moveExample = moveExamples[moveIndex]
      const result = evaluateCandidate({
        plan,
        priorBoard: moveExample.priorBoard,
        moveObject: moveExample.moveObject
      })
      if (!result) { continue }

      const movedPieceInRelation = (
        result.subjectPositions.includes(moveExample.moveObject.endPosition) ||
        result.targetPositions.includes(moveExample.moveObject.endPosition)
      )

      if (variant.type === 'involved' && !movedPieceInRelation) { continue }
      if (variant.type === 'separate' && movedPieceInRelation) { continue }

      const example = {
        priorBoard: moveExample.priorBoard,
        afterBoard: moveExample.afterBoard,
        moveObject: moveExample.moveObject,
        result,
        highlights: subjectTargetLabels(plan, moveExample.moveObject, result),
        variantType: movedPieceInRelation ? 'involved' : 'separate',
        geometryKey: skeleton.geometryKey,
        movedPieceInRelation,
        moveKind: moveKindForMoveObject(moveExample.moveObject),
        sound: soundForMove(moveExample.priorBoard, moveExample.afterBoard, moveExample.moveObject)
      }
      const identity = candidateIdentity(example)
      if (seenCandidates.has(identity)) { continue }

      seenCandidates.add(identity)
      examples.push(example)
      if (examples.length >= MAX_EXAMPLES_PER_SKELETON) {
        return examples
      }
    }
  }

  return examples
}

export function buildZeroRelationExamples({ plan, random, maxExamples }) {
  const subjectSpeciesPool = shuffled([...plan.subjectSpeciesPool], random)
  const targetSpeciesPool = shuffled([...plan.targetSpeciesPool], random)
  const movedSpeciesPool = shuffled(unique([
    Board.NIGHT,
    Board.BISHOP,
    ...subjectSpeciesPool,
    ...targetSpeciesPool
  ]), random)
  const subjectPositions = [square('a4'), square('b5'), square('c6'), square('d7')]
  const targetPositions = [square('h4'), square('g5'), square('f6'), square('e7')]
  const movedEndPositions = [square('e2'), square('d2'), square('f2'), square('c2')]
  const requiredPlacements = requiredZeroRelationPlacements({ plan, random })
  const examples = []
  const seenCandidates = new Set()

  for (let movedIndex = 0; movedIndex < movedSpeciesPool.length; movedIndex += 1) {
    for (let endIndex = 0; endIndex < movedEndPositions.length; endIndex += 1) {
      const movedSpecies = movedSpeciesPool[movedIndex]
      const movedPieceSquare = movedEndPositions[endIndex]
      const pieces = new Map([[movedPieceSquare, pieceCode(Board.WHITE, movedSpecies)]])
      let recentMoveContext = null

      if (!relationalActorRequiresPresence(plan.subject)) {
        // General actors may be absent in a zero-count relation.
      } else if (plan.subject !== 'moved_piece') {
        const subjectSpecies = subjectSpeciesPool[0]
        if (!subjectSpecies) { continue }
        pieces.set(subjectPositions[0], pieceCode(plan.subjectTeam, subjectSpecies))
      }

      if (!relationalActorRequiresPresence(plan.target)) {
        // General actors may be absent in a zero-count relation.
      } else if (plan.target !== 'moved_piece') {
        const targetSpecies = targetSpeciesPool[0]
        if (!targetSpecies) { continue }
        pieces.set(targetPositions[0], pieceCode(plan.targetTeam, targetSpecies))
      }

      requiredPlacements.forEach(placement => {
        pieces.set(placement.position, pieceCode(placement.team, placement.species))
        recentMoveContext ||= placement.recentMoveContext
      })

      recentMoveContext ||= comparisonRecentMoveContext({
        plan,
        skeleton: {
          subjectPosition: subjectPositions[0],
          targetPosition: targetPositions[0],
          subjectSpecies: subjectSpeciesPool[0] || Board.BISHOP,
          targetSpecies: targetSpeciesPool[0] || Board.PAWN
        },
        random
      })

      const moveExamples = collectLegalReverseMoves({
        afterPieces: pieces,
        movedPieceSquare,
        movedPieceSpecies: movedSpecies,
        recentMoveContext,
        capturedPieceSpeciesPool: valueSourceConstraintSpecies(plan, 'capturedPieceSpeciesPool') ?? null,
        random,
        maxResults: 1
      })

      for (let moveIndex = 0; moveIndex < moveExamples.length; moveIndex += 1) {
        const moveExample = moveExamples[moveIndex]
        const evaluator = new ConditionEvaluatorV2()
        const input = { board: moveExample.priorBoard, moveObject: moveExample.moveObject }
        if (!evaluator.evaluate(plan.evaluationPayload, input)) { continue }

        const analysis = new CandidateMoveAnalysisV2(input)
        const result = analysis.relationalResult(plan.relationParams)
        const example = {
          priorBoard: moveExample.priorBoard,
          afterBoard: moveExample.afterBoard,
          moveObject: moveExample.moveObject,
          result,
          highlights: subjectTargetLabels(plan, moveExample.moveObject, result),
          variantType: 'required',
          geometryKey: `zero:${movedPieceSquare}:${movedSpecies}`,
          movedPieceInRelation: false,
          moveKind: moveKindForMoveObject(moveExample.moveObject),
          sound: soundForMove(moveExample.priorBoard, moveExample.afterBoard, moveExample.moveObject)
        }
        const identity = candidateIdentity(example)
        if (seenCandidates.has(identity)) { continue }

        seenCandidates.add(identity)
        examples.push(example)
        if (examples.length >= maxExamples) {
          return examples
        }
      }
    }
  }

  return examples
}
