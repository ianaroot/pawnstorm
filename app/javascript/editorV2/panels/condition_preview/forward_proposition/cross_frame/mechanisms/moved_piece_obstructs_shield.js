import Board from 'gameplay/board'
import { QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, raySliderSpeciesForStep, walkRay
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  singularSquare, ensureRolePieceAt, commitPriorRegion
} from './cross_frame_helpers'
import { roleForPlan } from '../../moved_binding'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

// Obstructs-shield is imprecise: depending on filters and teams, intercepting
// A→S (between attacker and shielder) vs S→T (between shielder and shielded)
// may not always produce the chain's expected delta. We try both segments;
// some chain shapes will see engineered examples rejected at CandidateVerifier.
// Refinement deferred.
export const movedPieceObstructsShield = {
  name: 'moved-piece-obstructs-shield',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (entry.operator !== 'shield') { return false }
    return roleForPlan(ctx, entry.sourcePlan) === null
  },

  apply(entry, ctx, pieces, random) {
    if (roleForPlan(ctx, entry.sourcePlan) !== null) { return null }
    if (entry.direction === '-') { return applyMinus(entry, ctx, pieces, random) }
    if (entry.direction === '+') { return applyPlus(entry, ctx, pieces, random) }
    return null
  }
}

function applyMinus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const subjectSide = entry.subjectProposition
  const targetSide = entry.targetProposition
  if (subjectSide == null || targetSide == null) { return null }
  const alliedTeam = subjectSide.team
  const attackerTeam = Board.opposingTeam(alliedTeam)

  for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
    const sliders = raySliderSpeciesForStep(step)
    if (sliders.length === 0) { continue }
    const aSeg = tryInterceptOnASegment({
      destination, step, attackerTeam, sliders, subjectSide, targetSide, ctx, pieces, random
    })
    if (aSeg !== null) { return aSeg }
    const tSeg = tryInterceptOnTSegment({
      destination, step, attackerTeam, sliders, subjectSide, targetSide, ctx, pieces, random
    })
    if (tSeg !== null) { return tSeg }
  }
  return null
}

// Attacker — moved_piece(destination) — shielder — target.
function tryInterceptOnASegment({
  destination, step, attackerTeam, sliders, subjectSide, targetSide, ctx, pieces, random
}) {
  const attackerRay = walkRay(destination, -step)
  const onwardRay = walkRay(destination, step)

  for (let aIdx = 0; aIdx < attackerRay.length; aIdx += 1) {
    const aPos = attackerRay[aIdx]
    if (!pathClear(attackerRay, 0, aIdx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, aPos, attackerTeam, new Set(sliders))) { continue }

    for (let sIdx = 0; sIdx < onwardRay.length - 1; sIdx += 1) {
      const sPos = onwardRay[sIdx]
      if (!pathClear(onwardRay, 0, sIdx, pieces)) { continue }
      if (!squareCompatibleOrEmpty(pieces, sPos, subjectSide.team, subjectSide.species_set)) { continue }

      for (let tIdx = sIdx + 1; tIdx < onwardRay.length; tIdx += 1) {
        const tPos = onwardRay[tIdx]
        if (!pathClear(onwardRay, sIdx + 1, tIdx, pieces)) { continue }
        if (!squareCompatibleOrEmpty(pieces, tPos, targetSide.team, targetSide.species_set)) { continue }

        const result = placeTripleAndCommit({
          aPos, sPos, tPos, attackerTeam, sliders, subjectSide, targetSide,
          rayPositions: collectRayPositions(destination, attackerRay, aIdx, onwardRay, tIdx),
          ctx, pieces, random, destination
        })
        if (result !== null) { return result }
      }
    }
  }
  return null
}

// Attacker — shielder — moved_piece(destination) — target.
function tryInterceptOnTSegment({
  destination, step, attackerTeam, sliders, subjectSide, targetSide, ctx, pieces, random
}) {
  const towardAttacker = walkRay(destination, -step)
  const towardTarget = walkRay(destination, step)

  for (let sIdx = 0; sIdx < towardAttacker.length - 1; sIdx += 1) {
    const sPos = towardAttacker[sIdx]
    if (!pathClear(towardAttacker, 0, sIdx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, sPos, subjectSide.team, subjectSide.species_set)) { continue }

    for (let aIdx = sIdx + 1; aIdx < towardAttacker.length; aIdx += 1) {
      const aPos = towardAttacker[aIdx]
      if (!pathClear(towardAttacker, sIdx + 1, aIdx, pieces)) { continue }
      if (!squareCompatibleOrEmpty(pieces, aPos, attackerTeam, new Set(sliders))) { continue }

      for (let tIdx = 0; tIdx < towardTarget.length; tIdx += 1) {
        const tPos = towardTarget[tIdx]
        if (!pathClear(towardTarget, 0, tIdx, pieces)) { continue }
        if (!squareCompatibleOrEmpty(pieces, tPos, targetSide.team, targetSide.species_set)) { continue }

        const result = placeTripleAndCommit({
          aPos, sPos, tPos, attackerTeam, sliders, subjectSide, targetSide,
          rayPositions: collectRayPositions(destination, towardAttacker, aIdx, towardTarget, tIdx),
          ctx, pieces, random, destination
        })
        if (result !== null) { return result }
      }
    }
  }
  return null
}

function placeTripleAndCommit({
  aPos, sPos, tPos, attackerTeam, sliders, subjectSide, targetSide,
  rayPositions, ctx, pieces, random, destination
}) {
  let next = ensureRolePieceAt({ pieces, pos: aPos, team: attackerTeam, speciesSet: new Set(sliders), ctx, random })
  if (next === null) { return null }
  next = ensureRolePieceAt({ pieces: next, pos: sPos, team: subjectSide.team, speciesSet: subjectSide.species_set, ctx, random })
  if (next === null) { return null }
  next = ensureRolePieceAt({ pieces: next, pos: tPos, team: targetSide.team, speciesSet: targetSide.species_set, ctx, random })
  if (next === null) { return null }

  return commitPriorRegionOffRay(ctx, next, destination, rayPositions)
}

function collectRayPositions(destination, ray1, idx1, ray2, idx2) {
  const positions = new Set([destination])
  for (let i = 0; i <= idx1; i += 1) { positions.add(ray1[i]) }
  for (let i = 0; i <= idx2; i += 1) { positions.add(ray2[i]) }
  return positions
}

// Direction '+': moved_piece's origin was the obstruction in prior; on
// after, the destination is off the shield ray. Iterate origin candidates,
// for each find a queen-ray through origin (not through destination) with
// an A-S-T configuration where origin is between A and S OR S and T.
function applyPlus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const subjectSide = entry.subjectProposition
  const targetSide = entry.targetProposition
  if (subjectSide == null || targetSide == null) { return null }
  const alliedTeam = subjectSide.team
  const attackerTeam = Board.opposingTeam(alliedTeam)
  const movedSpecies = committedSpecies(moved)

  const origins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  for (const origin of shuffled(origins, random)) {
    for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
      const sliders = raySliderSpeciesForStep(step)
      if (sliders.length === 0) { continue }
      const result = tryShieldThroughOrigin({
        origin, step, destination, attackerTeam, sliders,
        subjectSide, targetSide, ctx, pieces, random
      })
      if (result !== null) { return result }
    }
  }
  return null
}

function tryShieldThroughOrigin({
  origin, step, destination, attackerTeam, sliders,
  subjectSide, targetSide, ctx, pieces, random
}) {
  const positive = walkRayAvoidingSquare(origin, step, destination)
  const negative = walkRayAvoidingSquare(origin, -step, destination)
  if (positive === null || negative === null) { return null }

  // A-segment: A on negative ray, origin (moved_piece prior), then S, T on positive.
  for (let aIdx = 0; aIdx < negative.length; aIdx += 1) {
    const aPos = negative[aIdx]
    if (!pathClear(negative, 0, aIdx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, aPos, attackerTeam, new Set(sliders))) { continue }

    for (let sIdx = 0; sIdx < positive.length - 1; sIdx += 1) {
      const sPos = positive[sIdx]
      if (!pathClear(positive, 0, sIdx, pieces)) { continue }
      if (!squareCompatibleOrEmpty(pieces, sPos, subjectSide.team, subjectSide.species_set)) { continue }

      for (let tIdx = sIdx + 1; tIdx < positive.length; tIdx += 1) {
        const tPos = positive[tIdx]
        if (!pathClear(positive, sIdx + 1, tIdx, pieces)) { continue }
        if (!squareCompatibleOrEmpty(pieces, tPos, targetSide.team, targetSide.species_set)) { continue }

        let next = ensureRolePieceAt({ pieces, pos: aPos, team: attackerTeam, speciesSet: new Set(sliders), ctx, random })
        if (next === null) { continue }
        next = ensureRolePieceAt({ pieces: next, pos: sPos, team: subjectSide.team, speciesSet: subjectSide.species_set, ctx, random })
        if (next === null) { continue }
        next = ensureRolePieceAt({ pieces: next, pos: tPos, team: targetSide.team, speciesSet: targetSide.species_set, ctx, random })
        if (next === null) { continue }

        const result = commitPriorRegion(ctx, [origin], next)
        if (result !== null) { return result }
      }
    }
  }
  return null
}

function walkRayAvoidingSquare(origin, step, avoid) {
  const positions = walkRay(origin, step)
  if (positions.includes(avoid)) { return null }
  return positions
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
  const movedSpecies = committedSpecies(moved)
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p) && !rayPositions.has(p))
  return commitPriorRegion(ctx, candidates, pieces)
}
