import { QUEEN_RAY_STEPS, nextPositionOnRay } from 'gameplay/board_query_utils'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, walkRay, raySliderSpeciesForStep, SLIDER_SPECIES
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  movedPieceRoleIn, singularSquare, ensureRolePieceAt, commitPriorRegion
} from './participates_helpers'

const RELEVANT_OPERATORS = new Set(['attack', 'defend'])

export const movedPieceObstructsInAttackOrDefend = {
  name: 'moved-piece-obstructs-in-attack-or-defend',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (!RELEVANT_OPERATORS.has(entry.operator)) { return false }
    // Obstructs only fires when moved_piece isn't a relation participant —
    // participates owns the bound-singular case.
    if (movedPieceRoleIn(entry) !== null) { return false }
    // The mechanism's premise is "A attacks T along a queen-ray, blocked by
    // moved_piece's position." That premise only holds when A is a ray-
    // compatible slider. Skip when subject species can't slide at all.
    const subjectSpecies = entry.subjectProposition?.species_set
    if (!subjectSpecies) { return false }
    for (const sp of subjectSpecies) {
      if (SLIDER_SPECIES.has(sp)) { return true }
    }
    return false
  },

  apply(entry, ctx, pieces, random) {
    if (movedPieceRoleIn(entry) !== null) { return null }
    if (entry.direction === '-') { return applyMinus(entry, ctx, pieces, random) }
    if (entry.direction === '+') { return applyPlus(entry, ctx, pieces, random) }
    return null
  }
}

// Direction '-': moved_piece's destination interrupts a would-be attack from A
// to T. Place (or reuse) A and T on opposite sides of destination along a
// queen-ray with the destination as the only piece between them. priorRegion
// narrows to origin candidates NOT on the A-T segment (so on prior, the line
// was clear and the relation held).
function applyMinus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const subjectSide = entry.subjectProposition
  const targetSide = entry.targetProposition
  if (subjectSide == null || targetSide == null) { return null }

  for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
    const narrowedSubject = narrowSubjectForStep(subjectSide, step)
    if (narrowedSubject === null) { continue }
    const positiveRay = walkRay(destination, step)
    const negativeRay = walkRay(destination, -step)
    const result = tryFlankingPlacement({
      attackerRay: positiveRay, targetRay: negativeRay,
      subjectSide: narrowedSubject, targetSide, ctx, pieces, random, destination
    })
    if (result !== null) { return result }
    const swapped = tryFlankingPlacement({
      attackerRay: negativeRay, targetRay: positiveRay,
      subjectSide: narrowedSubject, targetSide, ctx, pieces, random, destination
    })
    if (swapped !== null) { return swapped }
  }
  return null
}

// Direction '+': moved_piece's origin was between an existing/placeable A and
// T on a queen-ray, blocking the relation on prior. On after, destination is
// off that ray. Find queen-ray pairs A-T whose segment contains at least one
// valid origin candidate; priorRegion narrows to those segment squares.
function applyPlus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const movedSpecies = [...moved.species_set][0]
  const subjectSide = entry.subjectProposition
  const targetSide = entry.targetProposition
  if (subjectSide == null || targetSide == null) { return null }

  const possibleOrigins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  for (const origin of shuffled(possibleOrigins, random)) {
    for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
      const narrowedSubject = narrowSubjectForStep(subjectSide, step)
      if (narrowedSubject === null) { continue }
      const positiveRay = walkRayFromOriginAvoidingDestination(origin, step, destination)
      const negativeRay = walkRayFromOriginAvoidingDestination(origin, -step, destination)
      if (positiveRay === null || negativeRay === null) { continue }
      const result = tryFlankingPlacementAroundOrigin({
        origin, attackerRay: positiveRay, targetRay: negativeRay,
        subjectSide: narrowedSubject, targetSide, ctx, pieces, random
      })
      if (result !== null) { return result }
      const swapped = tryFlankingPlacementAroundOrigin({
        origin, attackerRay: negativeRay, targetRay: positiveRay,
        subjectSide: narrowedSubject, targetSide, ctx, pieces, random
      })
      if (swapped !== null) { return swapped }
    }
  }
  return null
}

function narrowSubjectForStep(subjectSide, step) {
  const compatible = raySliderSpeciesForStep(step)
  const narrowed = new Set()
  for (const sp of compatible) {
    if (subjectSide.species_set.has(sp)) { narrowed.add(sp) }
  }
  if (narrowed.size === 0) { return null }
  return { ...subjectSide, species_set: narrowed }
}

// Walk a ray from `origin` in direction `step`, returning null if the ray
// passes through `excludeSquare` (we don't want destination on the line for
// direction '+').
function walkRayFromOriginAvoidingDestination(origin, step, excludeSquare) {
  const positions = []
  let current = nextPositionOnRay(origin, step)
  while (current !== null) {
    if (current === excludeSquare) { return null }
    positions.push(current)
    current = nextPositionOnRay(current, step)
  }
  return positions
}

function tryFlankingPlacement({
  attackerRay, targetRay, subjectSide, targetSide, ctx, pieces, random, destination
}) {
  for (let aIdx = 0; aIdx < attackerRay.length; aIdx += 1) {
    const aPos = attackerRay[aIdx]
    if (!pathClear(attackerRay, 0, aIdx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, aPos, subjectSide.team, subjectSide.species_set)) { continue }

    for (let tIdx = 0; tIdx < targetRay.length; tIdx += 1) {
      const tPos = targetRay[tIdx]
      if (!pathClear(targetRay, 0, tIdx, pieces)) { continue }
      if (!squareCompatibleOrEmpty(pieces, tPos, targetSide.team, targetSide.species_set)) { continue }

      let next = ensureRolePieceAt({ pieces, pos: aPos, team: subjectSide.team, speciesSet: subjectSide.species_set, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: tPos, team: targetSide.team, speciesSet: targetSide.species_set, ctx, random })
      if (next === null) { continue }

      const rayPositions = new Set([destination, ...attackerRay.slice(0, aIdx + 1), ...targetRay.slice(0, tIdx + 1)])
      const result = commitPriorRegionOffRay(ctx, next, destination, rayPositions)
      if (result !== null) { return result }
    }
  }
  return null
}

function tryFlankingPlacementAroundOrigin({
  origin, attackerRay, targetRay, subjectSide, targetSide, ctx, pieces, random
}) {
  for (let aIdx = 0; aIdx < attackerRay.length; aIdx += 1) {
    const aPos = attackerRay[aIdx]
    if (!pathClear(attackerRay, 0, aIdx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, aPos, subjectSide.team, subjectSide.species_set)) { continue }

    for (let tIdx = 0; tIdx < targetRay.length; tIdx += 1) {
      const tPos = targetRay[tIdx]
      if (!pathClear(targetRay, 0, tIdx, pieces)) { continue }
      if (!squareCompatibleOrEmpty(pieces, tPos, targetSide.team, targetSide.species_set)) { continue }

      let next = ensureRolePieceAt({ pieces, pos: aPos, team: subjectSide.team, speciesSet: subjectSide.species_set, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: tPos, team: targetSide.team, speciesSet: targetSide.species_set, ctx, random })
      if (next === null) { continue }

      // priorRegion narrows to {origin} for this attempt.
      const candidates = [origin]
      const result = commitPriorRegion(ctx, candidates, next)
      if (result !== null) { return result }
    }
  }
  return null
}

function pathClear(squares, fromIdx, untilIdx, pieces) {
  for (let i = fromIdx; i < untilIdx; i += 1) {
    if (pieces.has(squares[i])) { return false }
  }
  return true
}

function squareCompatibleOrEmpty(pieces, pos, team, speciesSet) {
  const existing = pieces.get(pos)
  if (!existing) { return true }
  if (existing.charAt(0) !== team) { return false }
  if (!speciesSet.has(existing.slice(1))) { return false }
  return true
}

function commitPriorRegionOffRay(ctx, pieces, destination, rayPositions) {
  const moved = ctx.singulars.moved_piece
  const movedSpecies = [...moved.species_set][0]
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p) && !rayPositions.has(p))
  return commitPriorRegion(ctx, candidates, pieces)
}
