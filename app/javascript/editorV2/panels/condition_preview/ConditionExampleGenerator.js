import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { adjacentPositions, controlledSquares, nextPositionOnRay, shieldedPositions } from 'gameplay/board_query_utils'
import {
  square, emptyLayout, pieceCode, pieceTeam, pieceSpecies,
  legalPlacementForSpecies,
  unique, shuffled, pushUnique,
  clonePiecesMap, squareIsOccupied, buildLayoutFromPieces, buildBoardFromLayout, layoutsMatch,
  occupiedCount
} from 'editorV2/panels/condition_preview/board_utils'
import {
  RAY_STEPS,
  adjacentNeighborPositions, positionsForSliderOrigins, originCandidatesForSpecies,
  shieldAttackerSpeciesForStep, relationSquareDistance, sortByDistanceFromRelation
} from 'editorV2/panels/condition_preview/geometry_utils'
import {
  teamForActorWithContext, mergeRelationPieces,
  buildCandidateSkeletons, buildControlSkeletons, buildAdjacentSkeletons, buildShieldSkeletons
} from 'editorV2/panels/condition_preview/skeleton_builders'
import {
  COUNT_COMPARISON_METRIC, EXACT_NUMBER_COMPARISON_SOURCE, PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonDescriptors, comparisonRequirements, usesZeroRelationPath
} from 'editorV2/panels/condition_preview/comparison_requirements'
import {
  MOVE_KIND_STANDARD, MOVE_KIND_CASTLE,
  speciesMatchesFilter, candidateSpecies, selectKingPair, collectLegalReverseMoves,
  moveKindForMoveObject, soundForMove, candidateIdentity
} from 'editorV2/panels/condition_preview/example_utils'
import {
  teamForActor, sideSpeciesPool, roleRequiresMovedPiece, roleRequiresEnemyMovedPiece,
  relationalActorRequiresPresence, relationParams, subjectTargetLabels,
  buildExampleVariantPlan, candidateLabel, evaluateCandidate
} from 'editorV2/panels/condition_preview/relational_utils'
import { collectVerifiedExamples, buildZeroRelationExamples } from 'editorV2/panels/condition_preview/candidate_collection'

const MAX_DEFAULT_EXAMPLES = 30
const MAX_CANDIDATE_POOL = 120
const MAX_BUILD_ATTEMPTS = 1200
const MAX_CASTLE_BUILD_ATTEMPTS = 300
const MAX_EXAMPLES_PER_BUCKET = 8
const ENRICHMENT_PROBABILITY = 0.5
const MAX_ENRICHED_EXTRA_PIECES = 10
const MAX_EXTRA_RELATION_PAIRS_FOR_ENRICHMENT = 3
const ENRICHMENT_END_POSITION_WEIGHT = 4

const SUPPORTED_RELATIONAL_OPERATORS = new Set(['attack', 'defend', 'adjacent', 'shield'])
const SUPPORTED_RELATIONAL_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'])
const FILTER_LABELS = Object.freeze({
  allied: 'Allied',
  enemy: 'Enemy',
  moved_piece: 'Moved piece',
  enemy_moved_piece: 'Enemy moved piece',
  captured_piece: 'Captured piece',
  enemy_captured_piece: 'Enemy captured piece'
})

function generationContext(options = {}) {
  return {
    movingTeam: options.movingTeam || Board.WHITE,
    moveKinds: options.moveKinds || [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE]
  }
}

function actorLabel(actor) {
  return FILTER_LABELS[actor] || actor
}

function supportStatus(payload) {
  if (!payload?.kind) {
    return { status: 'unsupported', reason: 'Condition preview is not available for this condition yet.' }
  }

  if (payload.kind !== 'relational') {
    return { status: 'unsupported', reason: 'Unary previews are not supported yet.' }
  }

  if (payload.operator === 'cover') {
    return { status: 'unsupported', reason: 'Cover previews are not supported yet.' }
  }

  if (!SUPPORTED_RELATIONAL_OPERATORS.has(payload.operator)) {
    return { status: 'unsupported', reason: `${payload.operator} previews are not supported yet.` }
  }

  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.subject)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.subject)} previews are not supported yet.` }
  }

  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.target)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.target)} previews are not supported yet.` }
  }

  const comparisons = comparisonDescriptors(payload)
  if (comparisons.length > 0) {
    for (let index = 0; index < comparisons.length; index += 1) {
      const descriptor = comparisons[index]
      if (descriptor.source === PRIOR_BOARD_COMPARISON_SOURCE) {
        return {
          status: 'unsupported',
          reason: 'Prior-board relational comparisons are not supported yet.'
        }
      }
      if (descriptor.metric === 'value') {
        return {
          status: 'unsupported',
          reason: 'Value-based relational comparisons are not supported yet.'
        }
      }
      if (descriptor.metric !== COUNT_COMPARISON_METRIC) {
        return {
          status: 'unsupported',
          reason: `${descriptor.metric} relational comparisons are not supported yet.`
        }
      }
      if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) {
        return {
          status: 'unsupported',
          reason: 'This relational comparison source is not supported yet.'
        }
      }
    }
  }

  return { status: 'supported', reason: null }
}

function varietySignature(example) {
  const subjectPieces = example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  const targetPieces = example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  return [
    example.variantType,
    subjectPieces,
    targetPieces,
    example.geometryKey
  ].join(':')
}

function speciesPairSignature(example) {
  const subjectPieces = example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  const targetPieces = example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  return `${subjectPieces}=>${targetPieces}`
}

function subjectSpeciesSignature(example) {
  return example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
}

function targetSpeciesSignature(example) {
  return example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
}

function buildAttackOrDefendContributionCandidates({ payload, side, anchorPosition, occupied, random }) {
  if (side === 'subject') {
    const subjectTeam = teamForActor(payload.subject)
    return shuffled(sideSpeciesPool(payload, 'subject'), random).flatMap(species => {
      const positions = []
      for (let position = 0; position < 64; position += 1) {
        if (occupied.has(position) || position === anchorPosition) { continue }
        const board = buildBoardFromLayout(buildLayoutFromPieces(new Map([
          [position, pieceCode(subjectTeam, species)]
        ])))
        if (!legalPlacementForSpecies(position, species)) { continue }
        if (controlledSquares({ board, attackerPosition: position }).includes(anchorPosition)) {
          positions.push({
            side: 'subject',
            position,
            species,
            piece: pieceCode(subjectTeam, species)
          })
        }
      }
      return shuffled(positions, random)
    })
  }

  const board = buildBoardFromLayout(buildLayoutFromPieces(occupied))
  return shuffled(controlledSquares({ board, attackerPosition: anchorPosition }), random)
    .filter(position => !occupied.has(position))
    .flatMap(position => {
      return shuffled(sideSpeciesPool(payload, 'target'), random)
        .filter(species => legalPlacementForSpecies(position, species))
        .map(species => ({
          side: 'target',
          position,
          species,
          piece: pieceCode(teamForActor(payload.target), species)
        }))
    })
}

function buildAdjacentContributionCandidates({ payload, side, anchorPosition, occupied, random }) {
  const team = side === 'subject' ? teamForActor(payload.subject) : teamForActor(payload.target)
  const speciesPool = sideSpeciesPool(payload, side)
  return shuffled(adjacentNeighborPositions(anchorPosition), random)
    .filter(position => !occupied.has(position) && position !== anchorPosition)
    .flatMap(position => {
      return shuffled(speciesPool, random)
        .filter(species => legalPlacementForSpecies(position, species))
        .map(species => ({
          side,
          position,
          species,
          piece: pieceCode(team, species)
        }))
    })
}

function nextAvailableIndependentSkeletons({ payload, occupied, random }) {
  const subjectSpeciesPool = shuffled(sideSpeciesPool(payload, 'subject'), random)
  const targetSpeciesPool = shuffled(sideSpeciesPool(payload, 'target'), random)
  const skeletons = []

  subjectSpeciesPool.forEach(subjectSpecies => {
    targetSpeciesPool.forEach(targetSpecies => {
      buildCandidateSkeletons({ payload, subjectSpecies, targetSpecies }).forEach(skeleton => {
        const positions = Array.from(skeleton.pieces.keys())
        if (positions.some(position => occupied.has(position))) { return }
        skeletons.push(skeleton)
      })
    })
  })

  return shuffled(skeletons, random)
}

function addContributorsForSide({ payload, pieces, side, neededCount, anchorPosition, random }) {
  if (neededCount <= 0) { return true }

  const occupied = new Map(pieces)
  const candidates = payload.operator === 'adjacent'
    ? buildAdjacentContributionCandidates({ payload, side, anchorPosition, occupied, random })
    : buildAttackOrDefendContributionCandidates({ payload, side, anchorPosition, occupied, random })

  let added = 0
  for (let index = 0; index < candidates.length && added < neededCount; index += 1) {
    const candidate = candidates[index]
    if (pieces.has(candidate.position)) { continue }
    pieces.set(candidate.position, candidate.piece)
    added += 1
  }

  return added === neededCount
}

function augmentExistingRelation({ payload, skeleton, requirements, random }) {
  const desiredSubjectCount = requirements.subject
  const desiredTargetCount = requirements.target
  const subjectIncrement = Math.max(0, desiredSubjectCount - 1)
  const targetIncrement = Math.max(0, desiredTargetCount - 1)

  if (payload.operator === 'shield' && desiredSubjectCount !== desiredTargetCount) {
    return []
  }

  const pieces = clonePiecesMap(skeleton.pieces)

  if (payload.operator === 'shield') {
    let extraSubjectsNeeded = subjectIncrement
    let extraTargetsNeeded = targetIncrement

    while (extraSubjectsNeeded > 0 || extraTargetsNeeded > 0) {
      const independentSkeletons = nextAvailableIndependentSkeletons({ payload, occupied: pieces, random })
      const extraSkeleton = independentSkeletons[0]
      if (!extraSkeleton) { break }

      extraSkeleton.pieces.forEach((piece, position) => {
        pieces.set(position, piece)
      })
      extraSubjectsNeeded = Math.max(0, extraSubjectsNeeded - 1)
      extraTargetsNeeded = Math.max(0, extraTargetsNeeded - 1)
    }

    if (extraSubjectsNeeded > 0 || extraTargetsNeeded > 0) { return [] }
    return [{
      ...skeleton,
      pieces,
      geometryKey: `${skeleton.geometryKey}:count:${desiredSubjectCount}:${desiredTargetCount}`
    }]
  }

  const subjectOkay = addContributorsForSide({
    payload,
    pieces,
    side: 'subject',
    neededCount: subjectIncrement,
    anchorPosition: skeleton.targetPosition,
    random
  })
  if (!subjectOkay) { return [] }

  const targetOkay = addContributorsForSide({
    payload,
    pieces,
    side: 'target',
    neededCount: targetIncrement,
    anchorPosition: skeleton.subjectPosition,
    random
  })
  if (!targetOkay) { return [] }

  return [{
    ...skeleton,
    pieces,
    geometryKey: `${skeleton.geometryKey}:count:${desiredSubjectCount}:${desiredTargetCount}`
  }]
}

function augmentSkeletonsForComparisons({ payload, skeleton, random }) {
  const requirements = comparisonRequirements(payload)
  if (!requirements.comparisonsPresent) { return [skeleton] }
  if (requirements.subject === null || requirements.target === null) { return [] }
  if (requirements.subject < 0 || requirements.target < 0) { return [] }
  if (usesZeroRelationPath(requirements)) { return [] }

  return augmentExistingRelation({ payload, skeleton, requirements, random })
}

function requiredRelationPairFloor(payload) {
  const requirements = comparisonRequirements(payload)
  if (!requirements.comparisonsPresent) { return 1 }
  return Math.max(requirements.subject, requirements.target)
}

function workItemKey(item) {
  return [
    item.subjectSpecies,
    item.targetSpecies,
    item.variant.type,
    item.skeleton.geometryKey
  ].join('|')
}

function uniqueExamples(examples) {
  const seen = new Set()
  return examples.filter(example => {
    const identity = candidateIdentity(example)
    if (seen.has(identity)) { return false }
    seen.add(identity)
    return true
  })
}

function bucketKeyForExample(example) {
  return [
    subjectSpeciesSignature(example),
    targetSpeciesSignature(example),
    example.variantType
  ].join('|')
}

function castlePresetForTeam(team) {
  if (team !== Board.WHITE) { return [] }

  return [
    {
      name: 'castle-kingside',
      movingTeam: team,
      moveStart: square('e1'),
      moveEnd: square('g1'),
      rookStart: square('h1'),
      rookEnd: square('f1'),
      fixedPieces: new Map([
        [square('g1'), pieceCode(team, Board.KING)],
        [square('f1'), pieceCode(team, Board.ROOK)]
      ]),
      reservedSquares: new Set([square('e1'), square('h1')])
    },
    {
      name: 'castle-queenside',
      movingTeam: team,
      moveStart: square('e1'),
      moveEnd: square('c1'),
      rookStart: square('a1'),
      rookEnd: square('d1'),
      fixedPieces: new Map([
        [square('c1'), pieceCode(team, Board.KING)],
        [square('d1'), pieceCode(team, Board.ROOK)]
      ]),
      reservedSquares: new Set([square('a1'), square('b1'), square('e1')])
    }
  ]
}

function castleAnchorPlacementsForActor({ actor, filter = 'any', filterMode = null, preset, movingTeam = Board.WHITE }) {
  const alliedAnchors = [
    { position: preset.moveEnd, species: Board.KING },
    { position: preset.rookEnd, species: Board.ROOK }
  ]

  if (actor === 'moved_piece') {
    return speciesMatchesFilter(Board.KING, filter, filterMode) ? [alliedAnchors[0]] : []
  }
  if (actor !== 'allied') { return [] }

  return alliedAnchors.filter(anchor => speciesMatchesFilter(anchor.species, filter, filterMode))
}

function collectLegalCastleMoveExamples({ afterPieces, preset, random }) {
  const piecesWithKings = selectKingPair(afterPieces, random)
  if (!piecesWithKings) { return [] }
  if (piecesWithKings.get(preset.moveEnd) !== pieceCode(preset.movingTeam, Board.KING)) { return [] }
  if (piecesWithKings.get(preset.rookEnd) !== pieceCode(preset.movingTeam, Board.ROOK)) { return [] }

  const afterLayout = buildLayoutFromPieces(piecesWithKings)
  const priorPieces = clonePiecesMap(piecesWithKings)
  priorPieces.delete(preset.moveEnd)
  priorPieces.delete(preset.rookEnd)
  if (priorPieces.has(preset.moveStart) || priorPieces.has(preset.rookStart)) { return [] }
  priorPieces.set(preset.moveStart, pieceCode(preset.movingTeam, Board.KING))
  priorPieces.set(preset.rookStart, pieceCode(preset.movingTeam, Board.ROOK))

  const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces))
  let moveObject
  try {
    moveObject = Rules.getMoveObject(preset.moveStart, preset.moveEnd, priorBoard)
  } catch {
    return []
  }
  if (moveObject.illegal || !moveObject.additionalActions || !/^O-O/.test(moveObject.pieceNotation || '')) { return [] }

  const rebuiltAfter = priorBoard.lightClone()
  rebuiltAfter._hypotheticallyMovePiece(moveObject)
  if (!layoutsMatch(rebuiltAfter.layOut, afterLayout)) { return [] }

  return [{ priorBoard, moveObject, afterBoard: rebuiltAfter }]
}

function collectCastleExamples({ payload, random, movingTeam = Board.WHITE, maxExamples = MAX_CANDIDATE_POOL }) {
  const variants = buildExampleVariantPlan(payload)
  const subjectSpeciesPool = shuffled(candidateSpecies(payload.subjectFilter || 'any', payload.subjectFilterMode || null), random)
  const targetSpeciesPool = shuffled(candidateSpecies(payload.targetFilter || 'any', payload.targetFilterMode || null), random)
  const examples = []
  const seen = new Set()
  let attempts = 0

  castlePresetForTeam(movingTeam).forEach(preset => {
    subjectSpeciesPool.forEach(subjectSpecies => {
      targetSpeciesPool.forEach(targetSpecies => {
        const subjectAnchors = [null, ...castleAnchorPlacementsForActor({
          actor: payload.subject,
          filter: payload.subjectFilter || 'any',
          filterMode: payload.subjectFilterMode || null,
          preset,
          movingTeam
        })]
        const targetAnchors = [null, ...castleAnchorPlacementsForActor({
          actor: payload.target,
          filter: payload.targetFilter || 'any',
          filterMode: payload.targetFilterMode || null,
          preset,
          movingTeam
        })]

        subjectAnchors.forEach(fixedSubjectPlacement => {
          targetAnchors.forEach(fixedTargetPlacement => {
            if (attempts >= MAX_CASTLE_BUILD_ATTEMPTS || examples.length >= maxExamples) { return }
            const skeletons = buildCandidateSkeletons({
              payload,
              subjectSpecies,
              targetSpecies,
              movingTeam,
              fixedPieces: preset.fixedPieces,
              fixedSubjectPlacement,
              fixedTargetPlacement,
              reservedSquares: preset.reservedSquares
            })

            skeletons.forEach(skeleton => {
              variants.forEach(variant => {
                attempts += 1
                if (attempts > MAX_CASTLE_BUILD_ATTEMPTS || examples.length >= maxExamples) { return }
                if (examples.length >= maxExamples) { return }
                collectLegalCastleMoveExamples({ afterPieces: skeleton.pieces, preset, random }).forEach(moveExample => {
                  const result = evaluateCandidate({
                    payload,
                    priorBoard: moveExample.priorBoard,
                    moveObject: moveExample.moveObject
                  })
                  if (!result) { return }

                  const movedPieceInRelation = (
                    result.subjectPositions.includes(moveExample.moveObject.endPosition) ||
                    result.targetPositions.includes(moveExample.moveObject.endPosition)
                  )
                  if (variant.type === 'involved' && !movedPieceInRelation) { return }
                  if (variant.type === 'separate' && movedPieceInRelation) { return }

                  const example = {
                    priorBoard: moveExample.priorBoard,
                    afterBoard: moveExample.afterBoard,
                    moveObject: moveExample.moveObject,
                    result,
                    highlights: subjectTargetLabels(payload, moveExample.moveObject, result),
                    label: candidateLabel(variant, payload),
                    variantType: movedPieceInRelation ? 'involved' : 'separate',
                    geometryKey: `${preset.name}:${skeleton.geometryKey}`,
                              movedPieceInRelation,
                    moveKind: MOVE_KIND_CASTLE,
                    sound: soundForMove(moveExample.priorBoard, moveExample.afterBoard, moveExample.moveObject)
                  }
                  const identity = candidateIdentity(example)
                  if (seen.has(identity)) { return }
                  seen.add(identity)
                  examples.push(example)
                })
              })
            })
          })
        })
      })
    })
  })

  return examples
}

function roundRobinAppend({ selected, candidatesByKey, maxExamples, seenIdentities }) {
  const queue = Array.from(candidatesByKey.entries()).map(([key, candidates]) => ({
    key,
    candidates: [...candidates]
  }))
  let added = false

  while (selected.length < maxExamples) {
    let progressed = false

    for (let index = 0; index < queue.length && selected.length < maxExamples; index += 1) {
      const bucket = queue[index]
      while (bucket.candidates.length > 0 && seenIdentities.has(candidateIdentity(bucket.candidates[0]))) {
        bucket.candidates.shift()
      }
      if (bucket.candidates.length === 0) { continue }

      const next = bucket.candidates.shift()
      selected.push(next)
      seenIdentities.add(candidateIdentity(next))
      progressed = true
      added = true
    }

    if (!progressed) { break }
  }

  return added
}

function selectDiverseExamples(candidates, maxExamples) {
  if (candidates.length <= maxExamples) { return [...candidates] }

  const selected = []
  const seenIdentities = new Set()
  const subjectBuckets = new Map()
  const targetBuckets = new Map()
  const pairBuckets = new Map()
  const variantBuckets = new Map()

  candidates.forEach(candidate => {
    const subjectKey = subjectSpeciesSignature(candidate)
    const targetKey = targetSpeciesSignature(candidate)
    const pairKey = speciesPairSignature(candidate)
    const variantKey = candidate.variantType

    if (!subjectBuckets.has(subjectKey)) { subjectBuckets.set(subjectKey, []) }
    if (!targetBuckets.has(targetKey)) { targetBuckets.set(targetKey, []) }
    if (!pairBuckets.has(pairKey)) { pairBuckets.set(pairKey, []) }
    if (!variantBuckets.has(variantKey)) { variantBuckets.set(variantKey, []) }

    subjectBuckets.get(subjectKey).push(candidate)
    targetBuckets.get(targetKey).push(candidate)
    pairBuckets.get(pairKey).push(candidate)
    variantBuckets.get(variantKey).push(candidate)
  })

  roundRobinAppend({ selected, candidatesByKey: subjectBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: targetBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: pairBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: variantBuckets, maxExamples, seenIdentities })

  if (selected.length >= maxExamples) {
    return selected.slice(0, maxExamples)
  }

  const remaining = candidates.filter(candidate => !seenIdentities.has(candidateIdentity(candidate)))
  for (let index = 0; index < remaining.length && selected.length < maxExamples; index += 1) {
    selected.push(remaining[index])
  }

  return selected
}

function movePathSquares(priorBoard, moveObject) {
  const start = moveObject.startPosition
  const end = moveObject.endPosition
  const species = priorBoard.pieceTypeAt(start)
  const squares = new Set([start, end])

  if ([Board.ROOK, Board.BISHOP, Board.QUEEN].includes(species)) {
    const fileDelta = Board.fileIndex(end) - Board.fileIndex(start)
    const rankDelta = Board.rankIndex(end) - Board.rankIndex(start)
    const stepFile = Math.sign(fileDelta)
    const stepRank = Math.sign(rankDelta)
    let file = Board.fileIndex(start) + stepFile
    let rank = Board.rankIndex(start) + stepRank

    while (file !== Board.fileIndex(end) || rank !== Board.rankIndex(end)) {
      squares.add(rank * 8 + file)
      file += stepFile
      rank += stepRank
    }
  } else if (species === Board.PAWN && Math.abs(end - start) === 16) {
    squares.add((start + end) / 2)
  }

  return squares
}

function forbiddenSquaresForEnrichment(example) {
  const squares = new Set(movePathSquares(example.priorBoard, example.moveObject))

  example.priorBoard.layOut.forEach((piece, position) => {
    if (piece !== Board.EMPTY_SQUARE) {
      squares.add(position)
    }
  })
  example.afterBoard.layOut.forEach((piece, position) => {
    if (piece !== Board.EMPTY_SQUARE) {
      squares.add(position)
    }
  })

  return squares
}

function weightedEnrichmentCandidateSquares(example, random) {
  const forbidden = forbiddenSquaresForEnrichment(example)
  const candidates = Array.from({ length: 64 }, (_unused, position) => {
    return position
  }).filter(position => {
    if (position === example.moveObject.endPosition) { return true }
    return !forbidden.has(position)
  })
  const weighted = []

  candidates.forEach(position => {
    const weight = position === example.moveObject.endPosition ? ENRICHMENT_END_POSITION_WEIGHT : 1
    for (let count = 0; count < weight; count += 1) {
      weighted.push(position)
    }
  })

  return shuffled(weighted, random)
}

function weightedDecorationSpecies(random) {
  const roll = random()
  if (roll < 0.6) { return Board.PAWN }
  if (roll < 0.7) { return Board.NIGHT }
  if (roll < 0.8) { return Board.BISHOP }
  if (roll < 0.9) { return Board.ROOK }
  return Board.QUEEN
}

function deriveVerifiedExample({ payload, priorBoard, moveObject, baseExample, suffix }) {
  let recomputedMoveObject
  try {
    recomputedMoveObject = Rules.getMoveObject(moveObject.startPosition, moveObject.endPosition, priorBoard)
  } catch {
    return null
  }
  if (recomputedMoveObject.illegal || recomputedMoveObject.additionalActions || recomputedMoveObject.promotionPiece) {
    return null
  }

  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject: recomputedMoveObject }
  if (!evaluator.evaluate(payload, input)) { return null }

  const analysis = new CandidateMoveAnalysisV2(input)
  const result = analysis.relationalResult(relationParams(payload))
  const afterBoard = priorBoard.lightClone()
  afterBoard._hypotheticallyMovePiece(recomputedMoveObject)
  const movedPieceInRelation = (
    result.subjectPositions.includes(recomputedMoveObject.endPosition) ||
    result.targetPositions.includes(recomputedMoveObject.endPosition)
  )

  return {
    priorBoard,
    afterBoard,
    moveObject: recomputedMoveObject,
    result,
    highlights: subjectTargetLabels(payload, recomputedMoveObject, result),
    label: baseExample.label,
    variantType: movedPieceInRelation ? 'involved' : 'separate',
    geometryKey: `${baseExample.geometryKey}:${suffix}`,
    movedPieceInRelation,
    moveKind: moveKindForMoveObject(recomputedMoveObject),
    sound: soundForMove(priorBoard, afterBoard, recomputedMoveObject)
  }
}

function exampleEligibleForEnrichment(example, payload) {
  return example.result.pairs.length <= requiredRelationPairFloor(payload) + MAX_EXTRA_RELATION_PAIRS_FOR_ENRICHMENT
}

function buildEnrichmentPlacementPolicy(example, random) {
  const candidates = weightedEnrichmentCandidateSquares(example, random)
  const usedPositions = new Set()

  return {
    nextPlacement() {
      let position
      while (candidates.length > 0) {
        const candidate = candidates.shift()
        if (usedPositions.has(candidate)) { continue }
        usedPositions.add(candidate)
        position = candidate
        break
      }
      if (position === undefined) { return null }
      const species = weightedDecorationSpecies(random)
      if (!legalPlacementForSpecies(position, species)) {
        return this.nextPlacement()
      }
      const movedPieceTeam = example.priorBoard.teamAt(example.moveObject.startPosition)
      return {
        position,
        team: position === example.moveObject.endPosition
          ? Board.opposingTeam(movedPieceTeam)
          : (random() < 0.5 ? Board.WHITE : Board.BLACK),
        species
      }
    }
  }
}

function enrichExample(example, payload, random) {
  if (!exampleEligibleForEnrichment(example, payload)) { return null }

  const policy = buildEnrichmentPlacementPolicy(example, random)
  const basePriorBoard = example.priorBoard.lightClone()
  let bestExample = example
  let addedCount = 0

  while (addedCount < MAX_ENRICHED_EXTRA_PIECES) {
    const placement = policy.nextPlacement()
    if (!placement) { break }

    const trialPriorBoard = basePriorBoard.lightClone()
    trialPriorBoard._placePiece({
      position: placement.position,
      pieceObject: pieceCode(placement.team, placement.species)
    })
    const derived = deriveVerifiedExample({
      payload,
      priorBoard: trialPriorBoard,
      moveObject: example.moveObject,
      baseExample: example,
      suffix: `enriched:${addedCount + 1}:${placement.position}:${placement.team}${placement.species}`
    })

    if (!derived) { break }
    if (!exampleEligibleForEnrichment(derived, payload)) { break }

    bestExample = derived
    basePriorBoard.layOut = Board._deepCopy(trialPriorBoard.layOut)
    addedCount += 1
  }

  return addedCount > 0 ? bestExample : null
}

function finalizeExamples(baseExamples, payload, maxExamples, random) {
  const enrichedCandidates = []

  baseExamples.forEach(example => {
    if (random() >= ENRICHMENT_PROBABILITY) { return }
    const enriched = enrichExample(example, payload, random)
    if (enriched) {
      enrichedCandidates.push(enriched)
    }
  })

  if (enrichedCandidates.length === 0) {
    return selectDiverseExamples(baseExamples, maxExamples)
  }

  const desiredEnrichedCount = Math.min(
    enrichedCandidates.length,
    Math.max(1, Math.round(maxExamples * ENRICHMENT_PROBABILITY))
  )
  const selectedEnriched = selectDiverseExamples(uniqueExamples(enrichedCandidates), desiredEnrichedCount)
  const selectedEnrichedIds = new Set(selectedEnriched.map(candidateIdentity))
  const remainingBase = baseExamples.filter(example => !selectedEnrichedIds.has(candidateIdentity(example)))
  const selectedBase = selectDiverseExamples(remainingBase, Math.max(0, maxExamples - selectedEnriched.length))
  const combined = shuffled(uniqueExamples([...selectedBase, ...selectedEnriched]), random)

  if (combined.length >= maxExamples) {
    return selectDiverseExamples(combined, maxExamples)
  }

  const fallbackPool = shuffled(uniqueExamples([...combined, ...baseExamples, ...enrichedCandidates]), random)
  return selectDiverseExamples(fallbackPool, maxExamples)
}

function mergeMoveKindExamples({ standardExamples, castleExamples, payload, maxExamples, random }) {
  if (castleExamples.length === 0) {
    return finalizeExamples(standardExamples, payload, maxExamples, random)
  }

  const selectedCastle = selectDiverseExamples(castleExamples, 1)
  const selectedCastleIds = new Set(selectedCastle.map(candidateIdentity))
  const remainingStandard = standardExamples.filter(example => !selectedCastleIds.has(candidateIdentity(example)))
  const selectedStandard = finalizeExamples(remainingStandard, payload, Math.max(0, maxExamples - selectedCastle.length), random)
  return selectDiverseExamples(uniqueExamples([...selectedCastle, ...selectedStandard]), maxExamples)
}

function buildWorkItems({ payload, subjectSpeciesPool, targetSpeciesPool, variants, random }) {
  const items = []

  subjectSpeciesPool.forEach(subjectSpecies => {
    targetSpeciesPool.forEach(targetSpecies => {
      const skeletons = shuffled(buildCandidateSkeletons({ payload, subjectSpecies, targetSpecies }), random)
      skeletons.forEach(skeleton => {
        variants.forEach(variant => {
          items.push({ subjectSpecies, targetSpecies, skeleton, variant })
        })
      })
    })
  })

  return shuffled(items, random)
}

function scheduleWorkItems(items, random) {
  const queue = []
  const seen = new Set()
  const bySubject = new Map()
  const byTarget = new Map()
  const byPair = new Map()

  items.forEach(item => {
    const subjectKey = item.subjectSpecies
    const targetKey = item.targetSpecies
    const pairKey = `${subjectKey}|${targetKey}`

    if (!bySubject.has(subjectKey)) { bySubject.set(subjectKey, []) }
    if (!byTarget.has(targetKey)) { byTarget.set(targetKey, []) }
    if (!byPair.has(pairKey)) { byPair.set(pairKey, []) }

    bySubject.get(subjectKey).push(item)
    byTarget.get(targetKey).push(item)
    byPair.get(pairKey).push(item)
  })

  const roundRobinAppend = (groups) => {
    const buckets = shuffled(Array.from(groups.values()).map(group => shuffled(group, random)), random)
    let progressed = true

    while (progressed) {
      progressed = false
      buckets.forEach(bucket => {
        const item = bucket.shift()
        if (!item) { return }
        pushUnique(queue, seen, item, workItemKey(item))
        progressed = true
      })
    }
  }

  roundRobinAppend(bySubject)
  roundRobinAppend(byTarget)
  roundRobinAppend(byPair)
  shuffled(items, random).forEach(item => {
    pushUnique(queue, seen, item, workItemKey(item))
  })

  return queue
}

export function generateConditionExamples(payload, options = {}) {
  const maxExamples = options.maxExamples || MAX_DEFAULT_EXAMPLES
  const random = options.random || Math.random
  const context = generationContext(options)
  const support = supportStatus(payload)
  if (support.status !== 'supported') {
    return {
      status: support.status,
      reason: support.reason,
      examples: []
    }
  }

  let verified = []
  if (context.moveKinds.includes(MOVE_KIND_STANDARD)) {
    const variants = buildExampleVariantPlan(payload)
    const subjectSpeciesPool = shuffled(candidateSpecies(payload.subjectFilter || 'any', payload.subjectFilterMode || null), random)
    const targetSpeciesPool = shuffled(candidateSpecies(payload.targetFilter || 'any', payload.targetFilterMode || null), random)
    const workQueue = scheduleWorkItems(
      buildWorkItems({ payload, subjectSpeciesPool, targetSpeciesPool, variants, random }),
      random
    )
    const buckets = new Map()
    const seenSignatures = new Set()
    let totalExamples = 0
    let attempts = 0

    for (let index = 0; index < workQueue.length; index += 1) {
      attempts += 1
      if (attempts > MAX_BUILD_ATTEMPTS || totalExamples >= MAX_CANDIDATE_POOL) { break }

      const item = workQueue[index]
      const augmentedSkeletons = augmentSkeletonsForComparisons({
        payload,
        skeleton: item.skeleton,
        random
      })

      for (let skeletonIndex = 0; skeletonIndex < augmentedSkeletons.length; skeletonIndex += 1) {
        const examples = collectVerifiedExamples({
          payload,
          skeleton: augmentedSkeletons[skeletonIndex],
          variant: item.variant,
          random
        })

        for (let exampleIndex = 0; exampleIndex < examples.length; exampleIndex += 1) {
          const example = examples[exampleIndex]
          const signature = varietySignature(example)
          if (seenSignatures.has(signature)) { continue }

          const key = bucketKeyForExample(example)
          const bucket = buckets.get(key) || []
          if (bucket.length >= MAX_EXAMPLES_PER_BUCKET) { continue }

          seenSignatures.add(signature)
          bucket.push(example)
          buckets.set(key, bucket)
          totalExamples += 1

          if (totalExamples >= MAX_CANDIDATE_POOL) { break }
        }

        if (totalExamples >= MAX_CANDIDATE_POOL) { break }
      }
    }

    verified = Array.from(buckets.values()).flat()
  }
  const castleExamples = context.moveKinds.includes(MOVE_KIND_CASTLE)
    ? collectCastleExamples({ payload, random, movingTeam: context.movingTeam, maxExamples: MAX_CANDIDATE_POOL })
    : []
  if (verified.length === 0 && usesZeroRelationPath(comparisonRequirements(payload))) {
    const zeroExamples = buildZeroRelationExamples({ payload, random, maxExamples: MAX_CANDIDATE_POOL })
    if (zeroExamples.length > 0) {
      return {
        status: 'ready',
        reason: null,
        examples: finalizeExamples(zeroExamples, payload, maxExamples, random)
      }
    }
  }

  if (verified.length === 0 && castleExamples.length === 0) {
    return {
      status: 'no_examples',
      reason: "Couldn't build a verified example for this condition yet. This may mean the condition is unsatisfiable, or that the preview generator still needs work.",
      examples: []
    }
  }

  return {
    status: 'ready',
    reason: null,
    examples: mergeMoveKindExamples({
      standardExamples: verified,
      castleExamples,
      payload,
      maxExamples,
      random
    })
  }
}

export default generateConditionExamples
