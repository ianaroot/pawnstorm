import Board from 'gameplay/board'
import {
  ALL_POSITIONS, buildBoardFromLayout, buildLayoutFromPieces, shuffled,
  legalPlacementForSpecies, WEIGHTED_SPECIES_DISTRIBUTION
} from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  controllingPositions, pieceControlsSquare, positionsBetween, materialValue
} from 'gameplay/board_query_utils'
import { attackerCandidatesFor } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  matchesSide, candidatesForSide, applyOne, regionAllows,
  requirementsMet, MAX_SATISFY_ITERATIONS, boundSingularInActiveSet, sideAllowsPos,
  singularPosition
} from './relation_helpers'

const MAX_PLAN_COUNT = 4
const MAX_PLAN_RESAMPLES = 3
const planCache = new Map()

export function clearPlanCache() {
  planCache.clear()
}

export function satisfyAttackOrDefend(relation, pieces, ctx, random) {
  if (relation.subjectSide.count_range.max === 0 || relation.targetSide.count_range.max === 0) {
    return pieces
  }
  if (attackOrDefendRequirementsMet(relation, pieces, ctx)) { return pieces }

  if (hasAggregateValueConstraint(relation)) {
    for (let s = 0; s < MAX_PLAN_RESAMPLES; s += 1) {
      const planned = trySatisfyWithPlans(relation, pieces, ctx, random)
      if (planned !== null && attackOrDefendRequirementsMet(relation, planned, ctx)) {
        return planned
      }
    }
  }

  let next = pieces
  for (let i = 0; i < MAX_SATISFY_ITERATIONS; i += 1) {
    if (attackOrDefendRequirementsMet(relation, next, ctx)) { return next }
    const placed = tryPlace(relation, next, ctx, random)
    if (placed === null || placed === next) { return null }
    next = placed
  }
  return attackOrDefendRequirementsMet(relation, next, ctx) ? next : null
}

function attackOrDefendRequirementsMet(relation, pieces, ctx) {
  const { activeSubjects, activeTargets } = activeAttackOrDefendSets(relation, pieces)
  if (!boundSingularInActiveSet(relation.subjectSide, activeSubjects, ctx)) { return false }
  if (!boundSingularInActiveSet(relation.targetSide, activeTargets, ctx)) { return false }
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
    if (!sideAllowsPos(relation.targetSide, tPos)) { continue }
    const controllers = controllingPositions({
      board, targetPosition: tPos, team: relation.subjectSide.team
    })
    let hasMatch = false
    for (const sPos of controllers) {
      if (!matchesSide(pieces.get(sPos), relation.subjectSide)) { continue }
      if (!sideAllowsPos(relation.subjectSide, sPos)) { continue }
      activeSubjects.add(sPos)
      hasMatch = true
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

function hasAggregateValueConstraint(relation) {
  return hasSideAggregateValueConstraint(relation.subjectSide) ||
         hasSideAggregateValueConstraint(relation.targetSide)
}

function hasSideAggregateValueConstraint(side) {
  const v = side.aggregate_value_range
  return v.min > 0 || v.max !== Infinity
}

function trySatisfyWithPlans(relation, pieces, ctx, random) {
  const subjectPlans = hasSideAggregateValueConstraint(relation.subjectSide) ? plansIfMultipleForSide(relation.subjectSide) : null
  const targetPlans = hasSideAggregateValueConstraint(relation.targetSide) ? plansIfMultipleForSide(relation.targetSide) : null
  if (!subjectPlans && !targetPlans) { return null }
  if (subjectPlans && targetPlans) { return trySatisfyWithBothPlans(relation, pieces, ctx, random, subjectPlans, targetPlans) }
  if (subjectPlans) { return trySatisfyWithSubjectPlan(relation, pieces, ctx, random, subjectPlans) }
  return trySatisfyWithTargetPlan(relation, pieces, ctx, random, targetPlans)
}

function plansIfMultipleForSide(side) {
  const byK = plansForSide(side)
  if (byK.length === 0) { return null }
  if (byK.length === 1 && byK[0].length === 1) { return null }
  return byK
}

function trySatisfyWithTargetPlan(relation, pieces, ctx, random, plans) {
  const plan = pickFromPlans(plans, random)
  if (plan === null) { return null }
  let next = pieces
  for (const species of plan) {
    const placed = placeTargetSpeciesWithSubject(relation, next, ctx, random, species)
    if (placed === null) { return null }
    next = placed
  }
  return next
}

function trySatisfyWithSubjectPlan(relation, pieces, ctx, random, plans) {
  const plan = pickFromPlans(plans, random)
  if (plan === null) { return null }
  let next = pieces
  for (const species of plan) {
    const placed = placeSubjectSpeciesWithTarget(relation, next, ctx, random, species)
    if (placed === null) { return null }
    next = placed
  }
  return next
}

function trySatisfyWithBothPlans(relation, pieces, ctx, random, subjectPlans, targetPlans) {
  const targetPlan = pickFromPlans(targetPlans, random)
  const subjectPlan = pickFromPlans(subjectPlans, random)
  if (targetPlan === null || subjectPlan === null) { return null }
  let next = pieces
  const placedTargetPositions = []
  for (const species of targetPlan) {
    const result = placeTargetOnly(relation, next, ctx, random, species)
    if (result === null) { return null }
    next = result.pieces
    placedTargetPositions.push(result.position)
  }
  const board = buildBoardFromLayout(buildLayoutFromPieces(next))
  for (const species of subjectPlan) {
    let placed = null
    for (const hookPos of shuffled(placedTargetPositions, random)) {
      placed = placeSubjectAttackingHook(relation, next, ctx, random, species, hookPos, board)
      if (placed !== null) { break }
    }
    if (placed === null) { return null }
    next = placed
  }
  return next
}

function pickFromPlans(byK, random) {
  if (byK.length === 0) { return null }
  const choices = byK[Math.floor(random() * byK.length)]
  return choices[Math.floor(random() * choices.length)]
}

function placeTargetSpeciesWithSubject(relation, pieces, ctx, random, targetSpecies) {
  const targetCandidates = shuffled(targetCandidatesOfSpecies(relation.targetSide, pieces, targetSpecies), random)
  for (const target of targetCandidates) {
    const piecesWithTarget = applyOne(pieces, target, ctx, { skipRelation: relation })
    if (piecesWithTarget === null) { continue }
    const board = buildBoardFromLayout(buildLayoutFromPieces(piecesWithTarget))
    const subjectCandidates = shuffled(
      subjectsControlling(relation.subjectSide, target.position, piecesWithTarget, board),
      random
    )
    for (const subject of subjectCandidates) {
      const next = applyOne(piecesWithTarget, subject, ctx, { skipRelation: relation })
      if (next === null) { continue }
      return next
    }
  }
  return null
}

function placeSubjectSpeciesWithTarget(relation, pieces, ctx, random, subjectSpecies) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  for (const hookPos of shuffled(targetHookPositions(relation.targetSide, pieces, ctx), random)) {
    const placed = placeSubjectAttackingHook(relation, pieces, ctx, random, subjectSpecies, hookPos, board)
    if (placed !== null) { return placed }
  }
  for (const targetSpecies of shuffled([...relation.targetSide.species_set].filter(s => s !== null), random)) {
    const targetCandidates = shuffled(targetCandidatesOfSpecies(relation.targetSide, pieces, targetSpecies), random)
    for (const target of targetCandidates) {
      const piecesWithTarget = applyOne(pieces, target, ctx, { skipRelation: relation })
      if (piecesWithTarget === null) { continue }
      const boardWithTarget = buildBoardFromLayout(buildLayoutFromPieces(piecesWithTarget))
      const placed = placeSubjectAttackingHook(relation, piecesWithTarget, ctx, random, subjectSpecies, target.position, boardWithTarget)
      if (placed !== null) { return placed }
    }
  }
  return null
}

function placeSubjectAttackingHook(relation, pieces, ctx, random, subjectSpecies, hookPos, board) {
  const positions = shuffled([...attackerCandidatesFor(hookPos, subjectSpecies, relation.subjectSide.team, board)], random)
  for (const pos of positions) {
    if (pieces.has(pos)) { continue }
    if (!legalPlacementForSpecies(pos, subjectSpecies)) { continue }
    if (!regionAllows(relation.subjectSide.region, pos)) { continue }
    const candidate = { kind: 'fresh', position: pos, species: subjectSpecies, team: relation.subjectSide.team }
    const next = applyOne(pieces, candidate, ctx, { skipRelation: relation })
    if (next !== null) { return next }
  }
  return null
}

function placeTargetOnly(relation, pieces, ctx, random, targetSpecies) {
  const candidates = shuffled(targetCandidatesOfSpecies(relation.targetSide, pieces, targetSpecies), random)
  for (const target of candidates) {
    const piecesWithTarget = applyOne(pieces, target, ctx, { skipRelation: relation })
    if (piecesWithTarget === null) { continue }
    return { pieces: piecesWithTarget, position: target.position }
  }
  return null
}

function targetHookPositions(targetSide, pieces, ctx) {
  const set = new Set()
  if (targetSide.boundSingularActor) {
    const pos = singularPosition(ctx, targetSide.boundSingularActor)
    if (pos !== null) { set.add(pos) }
  }
  for (const [pos, piece] of pieces) {
    if (matchesSide(piece, targetSide)) { set.add(pos) }
  }
  return [...set]
}

function targetCandidatesOfSpecies(side, pieces, species) {
  const result = []
  for (const pos of ALL_POSITIONS) {
    if (pieces.has(pos)) { continue }
    if (!legalPlacementForSpecies(pos, species)) { continue }
    if (!regionAllows(side.region, pos)) { continue }
    result.push({ kind: 'fresh', position: pos, species, team: side.team })
  }
  return result
}

function plansForSide(side) {
  const key = planSignature(side)
  const cached = planCache.get(key)
  if (cached) { return cached }
  const plans = enumeratePlans(side)
  planCache.set(key, plans)
  return plans
}

function planSignature(side) {
  const species = [...side.species_set].sort().join(',')
  const c = side.count_range
  const v = side.aggregate_value_range
  return `${species}|${c.min}-${c.max}|${v.min}-${v.max}`
}

function enumeratePlans(side) {
  const species = [...side.species_set].filter(s => s !== null)
  const kMin = Math.max(side.count_range.min, 1)
  const kMax = Math.min(side.count_range.max, MAX_PLAN_COUNT)
  const valueMin = side.aggregate_value_range.min
  const valueMax = side.aggregate_value_range.max
  const byK = []
  for (let k = kMin; k <= kMax; k += 1) {
    const multisets = []
    recurseMultisets(species, k, 0, [], 0, valueMin, valueMax, multisets)
    if (multisets.length > 0) { byK.push(multisets) }
  }
  return byK
}

function recurseMultisets(species, remaining, startIdx, current, currentSum, vMin, vMax, out) {
  if (remaining === 0) {
    if (currentSum >= vMin && currentSum <= vMax) { out.push([...current]) }
    return
  }
  for (let i = startIdx; i < species.length; i += 1) {
    const sp = species[i]
    current.push(sp)
    recurseMultisets(species, remaining - 1, i, current, currentSum + materialValue(sp), vMin, vMax, out)
    current.pop()
  }
}
