import Board from 'gameplay/board'
import {
  buildBoardFromLayout, buildLayoutFromPieces, shuffled,
  legalPlacementForSpecies, WEIGHTED_SPECIES_DISTRIBUTION
} from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  controllingPositions, pieceControlsSquare, positionsBetween, materialValue
} from 'gameplay/board_query_utils'
import { attackerCandidatesFor } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  matchesSide, candidatesForSide, applyOne, regionAllows,
  requirementsMet, MAX_SATISFY_ITERATIONS
} from './relation_helpers'

export function satisfyAttackOrDefend(relation, pieces, ctx, random) {
  if (relation.subjectSide.count_range.max === 0 || relation.targetSide.count_range.max === 0) {
    return pieces
  }
  if (attackOrDefendRequirementsMet(relation, pieces)) { return pieces }
  let next = pieces
  for (let i = 0; i < MAX_SATISFY_ITERATIONS; i += 1) {
    if (attackOrDefendRequirementsMet(relation, next)) { return next }
    const placed = tryPlace(relation, next, ctx, random)
    if (placed === null || placed === next) { return null }
    next = placed
  }
  return attackOrDefendRequirementsMet(relation, next) ? next : null
}

function attackOrDefendRequirementsMet(relation, pieces) {
  const { activeSubjects, activeTargets } = activeAttackOrDefendSets(relation, pieces)
  return requirementsMet({
    subjectSide: relation.subjectSide,
    targetSide: relation.targetSide,
    activeSubjects, activeTargets, pieces
  })
}

export function activeAttackOrDefendSets(relation, pieces, board = null) {
  board = board ?? buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const activeSubjects = new Set()
  const activeTargets = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    const controllers = controllingPositions({
      board, targetPosition: tPos, team: relation.subjectSide.team
    })
    let hasMatch = false
    for (const sPos of controllers) {
      if (matchesSide(pieces.get(sPos), relation.subjectSide)) {
        activeSubjects.add(sPos)
        hasMatch = true
      }
    }
    if (hasMatch) { activeTargets.add(tPos) }
  }
  return { activeSubjects, activeTargets }
}

function tryPlace(relation, pieces, ctx, random) {
  const targetCandidates = shuffled(candidatesForSide(relation.targetSide, pieces), random)
  for (const target of targetCandidates) {
    const piecesWithTarget = applyOne(pieces, target, ctx)
    if (piecesWithTarget === null) { continue }

    const board = buildBoardFromLayout(buildLayoutFromPieces(piecesWithTarget))
    const subjectCandidates = shuffled(
      subjectsControlling(relation.subjectSide, target.position, piecesWithTarget, board),
      random
    )

    const baseline = baselineFor(relation, piecesWithTarget, board)

    for (const subject of subjectCandidates) {
      let next
      if (subject.kind === 'existing' || baseline.interference.has(subject.position)) {
        next = applyOne(piecesWithTarget, subject, ctx)
      } else {
        if (!subjectFitsRelationCaps(relation, subject, baseline, piecesWithTarget, board)) { continue }
        next = applyOne(piecesWithTarget, subject, ctx, { skipRelation: relation })
      }
      if (next === null) { continue }
      if (next.size === pieces.size) { continue }
      return next
    }
  }
  return null
}

function baselineFor(relation, pieces, board) {
  const { activeSubjects, activeTargets } = activeAttackOrDefendSets(relation, pieces, board)
  return {
    activeSubjects,
    activeTargets,
    subjectValue: sumPieceValues(activeSubjects, pieces),
    targetValue:  sumPieceValues(activeTargets,  pieces),
    interference: interferenceSquaresFor(activeSubjects, activeTargets, pieces, board)
  }
}

function sumPieceValues(positions, pieces) {
  let total = 0
  for (const pos of positions) {
    const piece = pieces.get(pos)
    if (piece) { total += materialValue(piece.slice(1)) }
  }
  return total
}

function interferenceSquaresFor(activeSubjects, activeTargets, pieces, board) {
  const result = new Set()
  for (const subjPos of activeSubjects) {
    const piece = pieces.get(subjPos)
    if (!piece) { continue }
    const species = piece.slice(1)
    if (species !== Board.BISHOP && species !== Board.ROOK && species !== Board.QUEEN) { continue }
    for (const tgtPos of activeTargets) {
      if (!pieceControlsSquare({ board, attackerPosition: subjPos, targetPosition: tgtPos })) { continue }
      for (const sq of positionsBetween(subjPos, tgtPos)) { result.add(sq) }
    }
  }
  return result
}

function subjectFitsRelationCaps(relation, subject, baseline, pieces, board) {
  const subjectIsNewActive = !baseline.activeSubjects.has(subject.position)
  let newTargetCount = 0
  let newTargetValue = 0
  for (const [tp, tpc] of pieces) {
    if (!matchesSide(tpc, relation.targetSide)) { continue }
    if (baseline.activeTargets.has(tp)) { continue }
    if (!candidateAttacks(subject, tp, board)) { continue }
    newTargetCount += 1
    newTargetValue += materialValue(tpc.slice(1))
  }
  const finalSubjectCount = baseline.activeSubjects.size + (subjectIsNewActive ? 1 : 0)
  const finalTargetCount  = baseline.activeTargets.size  + newTargetCount
  const finalSubjectValue = baseline.subjectValue + (subjectIsNewActive ? materialValue(subject.species) : 0)
  const finalTargetValue  = baseline.targetValue  + newTargetValue
  if (finalSubjectCount > relation.subjectSide.count_range.max) { return false }
  if (finalTargetCount  > relation.targetSide.count_range.max)  { return false }
  if (finalSubjectValue > relation.subjectSide.aggregate_value_range.max) { return false }
  if (finalTargetValue  > relation.targetSide.aggregate_value_range.max)  { return false }
  return true
}

function candidateAttacks(subject, targetPos, board) {
  for (const ap of attackerCandidatesFor(targetPos, subject.species, subject.team, board)) {
    if (ap === subject.position) { return true }
  }
  return false
}

function subjectsControlling(side, targetPos, pieces, board) {
  const candidates = []
  const controllers = controllingPositions({ board, targetPosition: targetPos, team: side.team })
  for (const sPos of controllers) {
    const piece = pieces.get(sPos)
    if (matchesSide(piece, side)) {
      candidates.push({ kind: 'existing', position: sPos, species: piece.slice(1) })
    }
  }
  for (const species of WEIGHTED_SPECIES_DISTRIBUTION) {
    if (!side.species_set.has(species)) { continue }
    const positions = attackerCandidatesFor(targetPos, species, side.team, board)
    for (const pos of positions) {
      if (pieces.has(pos)) { continue }
      if (!legalPlacementForSpecies(pos, species)) { continue }
      if (!regionAllows(side.region, pos)) { continue }
      candidates.push({ kind: 'fresh', position: pos, species, team: side.team })
    }
  }
  return candidates
}
