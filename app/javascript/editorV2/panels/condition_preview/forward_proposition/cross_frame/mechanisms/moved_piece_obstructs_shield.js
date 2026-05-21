import Board from 'gameplay/board'
import { QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, raySliderSpeciesForStep, walkRay
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { singletonsOnLine, pairsOnLine } from 'editorV2/panels/condition_preview/shared/line_pairs'
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
  const destination = singularSquare(ctx.singulars.moved_piece)
  if (destination === null) { return null }
  const slots = slotsFromEntry(entry)
  if (slots === null) { return null }

  for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
    const attacker = { team: slots.attackerTeam, speciesSet: raySliderSpeciesForStep(step) }
    if (attacker.speciesSet.size === 0) { continue }
    const aSeg = tryInterceptOnASegment({ destination, step, attacker, slots, ctx, pieces, random })
    if (aSeg !== null) { return aSeg }
    const tSeg = tryInterceptOnTSegment({ destination, step, attacker, slots, ctx, pieces, random })
    if (tSeg !== null) { return tSeg }
  }
  return null
}

// Attacker — moved_piece(destination) — shielder — target.
function tryInterceptOnASegment({ destination, step, attacker, slots, ctx, pieces, random }) {
  const attackerRay = walkRay(destination, -step)
  const onwardRay = walkRay(destination, step)
  return placeASTAndCommit({
    singletonRay: attackerRay, singletonSlot: attacker,
    pairRay: onwardRay, nearSlot: slots.shielder, farSlot: slots.target,
    ctx, pieces, random,
    commit: (next, { singletonIdx, farIdx }) =>
      commitPriorRegionOffRay(ctx, next, destination, collectRayPositions(destination, attackerRay, singletonIdx, onwardRay, farIdx))
  })
}

// Attacker — shielder — moved_piece(destination) — target.
function tryInterceptOnTSegment({ destination, step, attacker, slots, ctx, pieces, random }) {
  const towardAttacker = walkRay(destination, -step)
  const towardTarget = walkRay(destination, step)
  return placeASTAndCommit({
    singletonRay: towardTarget, singletonSlot: slots.target,
    pairRay: towardAttacker, nearSlot: slots.shielder, farSlot: attacker,
    ctx, pieces, random,
    commit: (next, { singletonIdx, farIdx }) =>
      commitPriorRegionOffRay(ctx, next, destination, collectRayPositions(destination, towardTarget, singletonIdx, towardAttacker, farIdx))
  })
}

// Direction '+': moved_piece's origin was the obstruction in prior; on
// after, the destination is off the shield ray. Iterate origin candidates,
// for each find a queen-ray through origin (not through destination) with
// an A-S-T configuration where origin is between A and S OR S and T.
function applyPlus(entry, ctx, pieces, random) {
  const destination = singularSquare(ctx.singulars.moved_piece)
  if (destination === null) { return null }
  const moved = ctx.singulars.moved_piece
  const movedSpecies = committedSpecies(moved)
  const slots = slotsFromEntry(entry)
  if (slots === null) { return null }

  const origins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  for (const origin of shuffled(origins, random)) {
    for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
      const attacker = { team: slots.attackerTeam, speciesSet: raySliderSpeciesForStep(step) }
      if (attacker.speciesSet.size === 0) { continue }
      const placed = tryShieldThroughOrigin({ origin, step, destination, attacker, slots, ctx, pieces, random })
      if (placed !== null) { return placed }
    }
  }
  return null
}

// A-segment placement around origin: A on negative ray from origin, (S, T) on positive ray.
function tryShieldThroughOrigin({ origin, step, destination, attacker, slots, ctx, pieces, random }) {
  const positive = walkRayAvoidingSquare(origin, step, destination)
  const negative = walkRayAvoidingSquare(origin, -step, destination)
  if (positive === null || negative === null) { return null }
  return placeASTAndCommit({
    singletonRay: negative, singletonSlot: attacker,
    pairRay: positive, nearSlot: slots.shielder, farSlot: slots.target,
    ctx, pieces, random,
    commit: next => commitPriorRegion(ctx, [origin], next)
  })
}

function placeASTAndCommit({
  singletonRay, singletonSlot, pairRay, nearSlot, farSlot,
  ctx, pieces, random, commit
}) {
  const singletons = singletonsOnLine({ line: singletonRay, slot: singletonSlot, pieces })
  const pairs = pairsOnLine({ line: pairRay, near: nearSlot, far: farSlot, pieces })
  const triples = []
  for (const sng of singletons) {
    for (const pair of pairs) {
      triples.push({ sng, pair })
    }
  }
  for (const { sng, pair } of shuffled(triples, random)) {
    let next = pieces
    next = ensureRolePieceAt({ pieces: next, pos: sng.pos, team: singletonSlot.team, speciesSet: singletonSlot.speciesSet, ctx, random })
    if (next === null) { continue }
    next = ensureRolePieceAt({ pieces: next, pos: pair.nearPos, team: nearSlot.team, speciesSet: nearSlot.speciesSet, ctx, random })
    if (next === null) { continue }
    next = ensureRolePieceAt({ pieces: next, pos: pair.farPos, team: farSlot.team, speciesSet: farSlot.speciesSet, ctx, random })
    if (next === null) { continue }
    const result = commit(next, { singletonIdx: sng.idx, nearIdx: pair.nearIdx, farIdx: pair.farIdx })
    if (result !== null) { return result }
  }
  return null
}

function slotsFromEntry(entry) {
  const subjectSide = entry.subjectProposition
  const targetSide = entry.targetProposition
  if (subjectSide == null || targetSide == null) { return null }
  return {
    shielder: { team: subjectSide.team, speciesSet: subjectSide.species_set },
    target: { team: targetSide.team, speciesSet: targetSide.species_set },
    attackerTeam: Board.opposingTeam(subjectSide.team)
  }
}

function collectRayPositions(destination, ray1, idx1, ray2, idx2) {
  const positions = new Set([destination])
  for (let i = 0; i <= idx1; i += 1) { positions.add(ray1[i]) }
  for (let i = 0; i <= idx2; i += 1) { positions.add(ray2[i]) }
  return positions
}

function walkRayAvoidingSquare(origin, step, avoid) {
  const positions = walkRay(origin, step)
  if (positions.includes(avoid)) { return null }
  return positions
}

function commitPriorRegionOffRay(ctx, pieces, destination, rayPositions) {
  const moved = ctx.singulars.moved_piece
  const movedSpecies = committedSpecies(moved)
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p) && !rayPositions.has(p))
  return commitPriorRegion(ctx, candidates, pieces)
}
