import { QUEEN_RAY_STEPS, nextPositionOnRay } from 'gameplay/board_query_utils'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, walkRay, raySliderSpeciesForStep, SLIDER_SPECIES
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { pairsAcrossRays } from 'editorV2/panels/condition_preview/shared/line_pairs'
import {
  singularSquare, ensureRolePieceAt, commitPriorRegion
} from './cross_frame_helpers'
import { roleForPlan } from '../../moved_binding'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

const RELEVANT_OPERATORS = new Set(['attack', 'defend'])

export const movedPieceObstructsInAttackOrDefend = {
  name: 'moved-piece-obstructs-in-attack-or-defend',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (!RELEVANT_OPERATORS.has(entry.operator)) { return false }
    // Obstructs only fires when moved_piece isn't a relation participant —
    // participates owns that case.
    if (roleForPlan(ctx, entry.sourcePlan) !== null) { return false }
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
    if (roleForPlan(ctx, entry.sourcePlan) !== null) { return null }
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
  const destination = singularSquare(ctx.singulars.moved_piece)
  if (destination === null) { return null }
  const { subject, target } = sidesFromEntry(entry)
  if (subject === null || target === null) { return null }

  for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
    const attacker = narrowSubjectForStep(subject, step)
    if (attacker === null) { continue }
    for (const [nearRay, farRay] of bothOrientations(walkRay(destination, step), walkRay(destination, -step))) {
      const placed = tryPlaceBothAndCommit({
        pairs: pairsAcrossRays({ nearRay, farRay, near: attacker, far: target, pieces }),
        near: attacker, far: target, ctx, pieces, random,
        commit: (next, { nearIdx, farIdx }) => {
          const rayPositions = new Set([destination, ...nearRay.slice(0, nearIdx + 1), ...farRay.slice(0, farIdx + 1)])
          return commitPriorRegionOffRay(ctx, next, destination, rayPositions)
        }
      })
      if (placed !== null) { return placed }
    }
  }
  return null
}

// Direction '+': moved_piece's origin was between an existing/placeable A and
// T on a queen-ray, blocking the relation on prior. On after, destination is
// off that ray. Find queen-ray pairs A-T whose segment contains at least one
// valid origin candidate; priorRegion narrows to those segment squares.
function applyPlus(entry, ctx, pieces, random) {
  const destination = singularSquare(ctx.singulars.moved_piece)
  if (destination === null) { return null }
  const moved = ctx.singulars.moved_piece
  const movedSpecies = committedSpecies(moved)
  const { subject, target } = sidesFromEntry(entry)
  if (subject === null || target === null) { return null }

  const possibleOrigins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  for (const origin of shuffled(possibleOrigins, random)) {
    for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
      const attacker = narrowSubjectForStep(subject, step)
      if (attacker === null) { continue }
      const positiveRay = walkRayFromOriginAvoidingDestination(origin, step, destination)
      const negativeRay = walkRayFromOriginAvoidingDestination(origin, -step, destination)
      if (positiveRay === null || negativeRay === null) { continue }
      for (const [nearRay, farRay] of bothOrientations(positiveRay, negativeRay)) {
        const placed = tryPlaceBothAndCommit({
          pairs: pairsAcrossRays({ nearRay, farRay, near: attacker, far: target, pieces }),
          near: attacker, far: target, ctx, pieces, random,
          commit: next => commitPriorRegion(ctx, [origin], next)
        })
        if (placed !== null) { return placed }
      }
    }
  }
  return null
}

function tryPlaceBothAndCommit({ pairs, near, far, ctx, pieces, random, commit }) {
  for (const pair of shuffled(pairs, random)) {
    let next = pieces
    next = ensureRolePieceAt({ pieces: next, pos: pair.nearPos, team: near.team, speciesSet: near.speciesSet, ctx, random })
    if (next === null) { continue }
    next = ensureRolePieceAt({ pieces: next, pos: pair.farPos, team: far.team, speciesSet: far.speciesSet, ctx, random })
    if (next === null) { continue }
    const result = commit(next, pair)
    if (result !== null) { return result }
  }
  return null
}

function sidesFromEntry(entry) {
  const subjectSide = entry.subjectProposition
  const targetSide = entry.targetProposition
  if (subjectSide == null || targetSide == null) { return { subject: null, target: null } }
  return {
    subject: { team: subjectSide.team, speciesSet: subjectSide.species_set },
    target: { team: targetSide.team, speciesSet: targetSide.species_set }
  }
}

function narrowSubjectForStep(subject, step) {
  const compatible = raySliderSpeciesForStep(step)
  const narrowed = new Set()
  for (const species of subject.speciesSet) {
    if (compatible.has(species)) { narrowed.add(species) }
  }
  if (narrowed.size === 0) { return null }
  return { team: subject.team, speciesSet: narrowed }
}

// Attacker may flank from either side of destination/origin — try both.
function bothOrientations(positiveRay, negativeRay) {
  return [[positiveRay, negativeRay], [negativeRay, positiveRay]]
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

function commitPriorRegionOffRay(ctx, pieces, destination, rayPositions) {
  const moved = ctx.singulars.moved_piece
  const movedSpecies = committedSpecies(moved)
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p) && !rayPositions.has(p))
  return commitPriorRegion(ctx, candidates, pieces)
}
