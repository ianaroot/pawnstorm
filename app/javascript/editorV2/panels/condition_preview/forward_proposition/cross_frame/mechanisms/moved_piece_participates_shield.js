import Board from 'gameplay/board'
import {
  ROOK_RAY_STEPS, BISHOP_RAY_STEPS, QUEEN_RAY_STEPS
} from 'gameplay/board_query_utils'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, raySliderSpeciesForStep, walkRay, SLIDER_SPECIES
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  singularSquare, ensureRolePieceAt, commitPriorRegion, movedPieceRoleIn
} from './participates_helpers'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

export const movedPieceParticipatesShield = {
  name: 'moved-piece-participates-shield',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (entry.operator !== 'shield') { return false }
    return roleFor(entry, ctx) !== null
  },

  apply(entry, ctx, pieces, random) {
    const role = roleFor(entry, ctx)
    if (role === null) { return null }
    if (entry.direction !== '+' && entry.direction !== '-') { return null }
    if (role === 'subject') {
      return entry.direction === '+'
        ? applyShielder(entry, ctx, pieces, random)
        : applyShielderMinus(entry, ctx, pieces, random)
    }
    if (role === 'target') {
      return entry.direction === '+'
        ? applyShielded(entry, ctx, pieces, random)
        : applyShieldedMinus(entry, ctx, pieces, random)
    }
    if (role === 'attacker') {
      return entry.direction === '+'
        ? applyAttacker(entry, ctx, pieces, random)
        : applyAttackerMinus(entry, ctx, pieces, random)
    }
    return null
  }
}

// 'subject' = moved_piece bound on shielder side
// 'target'  = moved_piece bound on shielded side
// 'attacker' = neither side bound; moved_piece is a slider on the opposing team
function roleFor(entry, ctx) {
  const fromRelatedTo = movedPieceRoleIn(entry)
  if (fromRelatedTo !== null) { return fromRelatedTo }
  if (entry.currentProposition?.region?.kind !== 'all') { return null }

  const moved = ctx?.singulars?.moved_piece
  if (!moved) { return null }
  const movedSpecies = committedSpecies(moved)
  if (!SLIDER_SPECIES.has(movedSpecies)) { return null }
  if (moved.team === entry.currentProposition.team) { return null }
  return 'attacker'
}

function stepsForSliderSpecies(species) {
  if (species === Board.ROOK)   { return ROOK_RAY_STEPS }
  if (species === Board.BISHOP) { return BISHOP_RAY_STEPS }
  if (species === Board.QUEEN)  { return QUEEN_RAY_STEPS }
  return []
}

// moved_piece is the shielder. Place a target on one side and an attacker on
// the other side, all on the same queen-ray through destination. priorRegion
// narrows to origin candidates off the ray (so moved_piece at origin doesn't
// shield on prior).
function applyShielder(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const alliedTeam = entry.currentProposition.team
  const attackerTeam = Board.opposingTeam(alliedTeam)
  const targetSpeciesSet = entry.targetProposition?.species_set ?? entry.currentProposition.species_set

  for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
    const compatibleSliders = raySliderSpeciesForStep(step)
    if (compatibleSliders.length === 0) { continue }
    const result = placeTargetAndAttackerAroundShielder({
      destination, step, alliedTeam, attackerTeam,
      compatibleSliders, targetSpeciesSet, ctx, pieces, random
    })
    if (result !== null) { return result }
  }
  return null
}

// Direction "-" counterpart of applyShielder: moved_piece was the shielder on
// prior (at origin), not on after. Iterate origin candidates; for each, find a
// queen-ray through origin that does NOT pass through destination, then place
// attacker on one side of origin and target on the other.
function applyShielderMinus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const movedSpecies = committedSpecies(moved)
  const alliedTeam = entry.currentProposition.team
  const attackerTeam = Board.opposingTeam(alliedTeam)
  const targetSpeciesSet = entry.targetProposition?.species_set ?? entry.currentProposition.species_set

  const origins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  for (const origin of shuffled(origins, random)) {
    for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
      const compatibleSliders = raySliderSpeciesForStep(step)
      if (compatibleSliders.length === 0) { continue }
      const towardTarget = rayPositionsAvoiding(origin, -step, destination)
      const towardAttacker = rayPositionsAvoiding(origin, step, destination)
      if (towardTarget === null || towardAttacker === null) { continue }
      const result = placeTargetAndAttackerAroundOrigin({
        origin, towardTarget, towardAttacker, alliedTeam, attackerTeam,
        compatibleSliders, targetSpeciesSet, ctx, pieces, random
      })
      if (result !== null) { return result }
    }
  }
  return null
}

function placeTargetAndAttackerAroundOrigin({
  origin, towardTarget, towardAttacker, alliedTeam, attackerTeam,
  compatibleSliders, targetSpeciesSet, ctx, pieces, random
}) {
  for (let tIdx = 0; tIdx < towardTarget.length; tIdx += 1) {
    const targetPos = towardTarget[tIdx]
    if (!pathClearOrCompatible(towardTarget, 0, tIdx, pieces, alliedTeam, targetSpeciesSet, targetPos)) { continue }
    for (let aIdx = 0; aIdx < towardAttacker.length; aIdx += 1) {
      const attackerPos = towardAttacker[aIdx]
      if (!pathClearOrCompatible(towardAttacker, 0, aIdx, pieces, attackerTeam, new Set(compatibleSliders), attackerPos)) { continue }

      let next = pieces
      next = ensureRolePieceAt({ pieces: next, pos: targetPos, team: alliedTeam, speciesSet: targetSpeciesSet, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: attackerPos, team: attackerTeam, speciesSet: new Set(compatibleSliders), ctx, random })
      if (next === null) { continue }

      const result = commitPriorRegion(ctx, [origin], next)
      if (result !== null) { return result }
    }
  }
  return null
}

// Returns walkRay(start, step) only when `avoid` is on neither half of the
// line through `start` in the step direction. Used by the direction-"-"
// branches: placed pieces on one half extend the line through origin and
// could re-create the relation with `avoid` (destination) on the other half;
// rejecting both halves prevents that.
function rayPositionsAvoiding(start, step, avoid) {
  const positive = walkRay(start, step)
  if (positive.includes(avoid)) { return null }
  const negative = walkRay(start, -step)
  if (negative.includes(avoid)) { return null }
  return positive
}

function placeTargetAndAttackerAroundShielder({
  destination, step, alliedTeam, attackerTeam, compatibleSliders,
  targetSpeciesSet, ctx, pieces, random
}) {
  const towardTarget = walkRay(destination, -step)
  const towardAttacker = walkRay(destination, step)
  for (let tIdx = 0; tIdx < towardTarget.length; tIdx += 1) {
    const targetPos = towardTarget[tIdx]
    if (!pathClearOrCompatible(towardTarget, 0, tIdx, pieces, alliedTeam, targetSpeciesSet, targetPos)) { continue }
    for (let aIdx = 0; aIdx < towardAttacker.length; aIdx += 1) {
      const attackerPos = towardAttacker[aIdx]
      if (!pathClearOrCompatible(towardAttacker, 0, aIdx, pieces, attackerTeam, new Set(compatibleSliders), attackerPos)) { continue }

      let next = pieces
      next = ensureRolePieceAt({ pieces: next, pos: targetPos, team: alliedTeam, speciesSet: targetSpeciesSet, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: attackerPos, team: attackerTeam, speciesSet: new Set(compatibleSliders), ctx, random })
      if (next === null) { continue }

      const rayPositions = new Set([
        destination,
        ...towardTarget.slice(0, tIdx + 1),
        ...towardAttacker.slice(0, aIdx + 1)
      ])
      const result = commitPriorRegionExcluding(ctx, next, destination, rayPositions)
      if (result !== null) { return result }
    }
  }
  return null
}

// moved_piece is the shielded. A shielder sits between an attacker and
// moved_piece's destination on a single ray (attacker further out, shielder
// closer to destination). priorRegion narrows to origin candidates not on
// the same ray (so the shielder doesn't also shield moved_piece's origin).
function applyShielded(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const alliedTeam = entry.currentProposition.team
  const attackerTeam = Board.opposingTeam(alliedTeam)
  const shielderSpeciesSet = entry.subjectProposition?.species_set ?? entry.currentProposition.species_set

  for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
    const compatibleSliders = raySliderSpeciesForStep(step)
    if (compatibleSliders.length === 0) { continue }
    const result = placeShielderAndAttackerThroughTarget({
      destination, step, alliedTeam, attackerTeam,
      compatibleSliders, shielderSpeciesSet, ctx, pieces, random
    })
    if (result !== null) { return result }
  }
  return null
}

// Direction "-" counterpart of applyShielded: moved_piece was the shielded
// (target) on prior at origin, not on after. Iterate origin candidates; for
// each, walk a queen-ray from origin in some direction that doesn't include
// destination, place shielder closer to origin and attacker further out.
function applyShieldedMinus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const movedSpecies = committedSpecies(moved)
  const alliedTeam = entry.currentProposition.team
  const attackerTeam = Board.opposingTeam(alliedTeam)
  const shielderSpeciesSet = entry.subjectProposition?.species_set ?? entry.currentProposition.species_set

  const origins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  for (const origin of shuffled(origins, random)) {
    for (const step of shuffled([...QUEEN_RAY_STEPS], random)) {
      const compatibleSliders = raySliderSpeciesForStep(step)
      if (compatibleSliders.length === 0) { continue }
      const lineSquares = rayPositionsAvoiding(origin, step, destination)
      if (lineSquares === null) { continue }
      const result = placeShielderAndAttackerAlongRayFromOrigin({
        origin, lineSquares, alliedTeam, attackerTeam,
        compatibleSliders, shielderSpeciesSet, ctx, pieces, random
      })
      if (result !== null) { return result }
    }
  }
  return null
}

function placeShielderAndAttackerAlongRayFromOrigin({
  origin, lineSquares, alliedTeam, attackerTeam, compatibleSliders,
  shielderSpeciesSet, ctx, pieces, random
}) {
  for (let sIdx = 0; sIdx < lineSquares.length - 1; sIdx += 1) {
    const shielderPos = lineSquares[sIdx]
    if (!pathClearOrCompatible(lineSquares, 0, sIdx, pieces, alliedTeam, shielderSpeciesSet, shielderPos)) { continue }
    for (let aIdx = sIdx + 1; aIdx < lineSquares.length; aIdx += 1) {
      const attackerPos = lineSquares[aIdx]
      if (!pathClearOrCompatible(lineSquares, sIdx + 1, aIdx, pieces, attackerTeam, new Set(compatibleSliders), attackerPos)) { continue }

      let next = pieces
      next = ensureRolePieceAt({ pieces: next, pos: shielderPos, team: alliedTeam, speciesSet: shielderSpeciesSet, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: attackerPos, team: attackerTeam, speciesSet: new Set(compatibleSliders), ctx, random })
      if (next === null) { continue }

      const result = commitPriorRegion(ctx, [origin], next)
      if (result !== null) { return result }
    }
  }
  return null
}

function placeShielderAndAttackerThroughTarget({
  destination, step, alliedTeam, attackerTeam, compatibleSliders,
  shielderSpeciesSet, ctx, pieces, random
}) {
  const lineSquares = walkRay(destination, step)
  const oppositeRay = walkRay(destination, -step)
  for (let sIdx = 0; sIdx < lineSquares.length - 1; sIdx += 1) {
    const shielderPos = lineSquares[sIdx]
    if (!pathClearOrCompatible(lineSquares, 0, sIdx, pieces, alliedTeam, shielderSpeciesSet, shielderPos)) { continue }
    for (let aIdx = sIdx + 1; aIdx < lineSquares.length; aIdx += 1) {
      const attackerPos = lineSquares[aIdx]
      if (!pathClearOrCompatible(lineSquares, sIdx + 1, aIdx, pieces, attackerTeam, new Set(compatibleSliders), attackerPos)) { continue }

      let next = pieces
      next = ensureRolePieceAt({ pieces: next, pos: shielderPos, team: alliedTeam, speciesSet: shielderSpeciesSet, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: attackerPos, team: attackerTeam, speciesSet: new Set(compatibleSliders), ctx, random })
      if (next === null) { continue }

      // Excluding both the engineered ray AND the opposite-direction half of
      // the same line through destination — origins on the opposite half sit
      // on the line with destination (empty on prior) between them and the
      // shielder, re-creating the shield on prior and zeroing the delta.
      const rayPositions = new Set([destination, ...lineSquares.slice(0, aIdx + 1), ...oppositeRay])
      const result = commitPriorRegionExcluding(ctx, next, destination, rayPositions)
      if (result !== null) { return result }
    }
  }
  return null
}

// moved_piece is the implicit attacker. Place a shielder and a target on a
// ray (both allied team) emanating from destination in a slider direction
// moved_piece can attack. priorRegion narrows to origins from which moved_piece
// doesn't reproduce the same shield geometry.
function applyAttacker(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const movedSpecies = committedSpecies(moved)
  const alliedTeam = entry.currentProposition.team
  const shielderSpeciesSet = entry.subjectProposition?.species_set ?? entry.currentProposition.species_set
  const targetSpeciesSet = entry.targetProposition?.species_set ?? entry.currentProposition.species_set

  for (const step of shuffled([...stepsForSliderSpecies(movedSpecies)], random)) {
    const result = placeShielderAndTargetOnAttackerRay({
      destination, step, alliedTeam,
      shielderSpeciesSet, targetSpeciesSet,
      ctx, pieces, random
    })
    if (result !== null) { return result }
  }
  return null
}

// Direction "-" counterpart of applyAttacker: moved_piece was the implicit
// attacker on prior (at origin), not on after. Iterate origin candidates; for
// each, walk a ray from origin in moved_piece's slider directions that doesn't
// include destination, and place shielder closer to origin with target further.
function applyAttackerMinus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const movedSpecies = committedSpecies(moved)
  const alliedTeam = entry.currentProposition.team
  const shielderSpeciesSet = entry.subjectProposition?.species_set ?? entry.currentProposition.species_set
  const targetSpeciesSet = entry.targetProposition?.species_set ?? entry.currentProposition.species_set

  const origins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  for (const origin of shuffled(origins, random)) {
    for (const step of shuffled([...stepsForSliderSpecies(movedSpecies)], random)) {
      const lineSquares = rayPositionsAvoiding(origin, step, destination)
      if (lineSquares === null) { continue }
      const result = placeShielderAndTargetAlongRayFromOrigin({
        origin, lineSquares, alliedTeam,
        shielderSpeciesSet, targetSpeciesSet, ctx, pieces, random
      })
      if (result !== null) { return result }
    }
  }
  return null
}

function placeShielderAndTargetAlongRayFromOrigin({
  origin, lineSquares, alliedTeam, shielderSpeciesSet, targetSpeciesSet,
  ctx, pieces, random
}) {
  for (let sIdx = 0; sIdx < lineSquares.length - 1; sIdx += 1) {
    const shielderPos = lineSquares[sIdx]
    if (!pathClearOrCompatible(lineSquares, 0, sIdx, pieces, alliedTeam, shielderSpeciesSet, shielderPos)) { continue }
    for (let tIdx = sIdx + 1; tIdx < lineSquares.length; tIdx += 1) {
      const targetPos = lineSquares[tIdx]
      if (!pathClearOrCompatible(lineSquares, sIdx + 1, tIdx, pieces, alliedTeam, targetSpeciesSet, targetPos)) { continue }

      let next = pieces
      next = ensureRolePieceAt({ pieces: next, pos: shielderPos, team: alliedTeam, speciesSet: shielderSpeciesSet, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: targetPos, team: alliedTeam, speciesSet: targetSpeciesSet, ctx, random })
      if (next === null) { continue }

      const result = commitPriorRegion(ctx, [origin], next)
      if (result !== null) { return result }
    }
  }
  return null
}

function placeShielderAndTargetOnAttackerRay({
  destination, step, alliedTeam, shielderSpeciesSet, targetSpeciesSet,
  ctx, pieces, random
}) {
  const lineSquares = walkRay(destination, step)
  const oppositeRay = walkRay(destination, -step)
  for (let sIdx = 0; sIdx < lineSquares.length - 1; sIdx += 1) {
    const shielderPos = lineSquares[sIdx]
    if (!pathClearOrCompatible(lineSquares, 0, sIdx, pieces, alliedTeam, shielderSpeciesSet, shielderPos)) { continue }
    for (let tIdx = sIdx + 1; tIdx < lineSquares.length; tIdx += 1) {
      const targetPos = lineSquares[tIdx]
      if (!pathClearOrCompatible(lineSquares, sIdx + 1, tIdx, pieces, alliedTeam, targetSpeciesSet, targetPos)) { continue }

      let next = pieces
      next = ensureRolePieceAt({ pieces: next, pos: shielderPos, team: alliedTeam, speciesSet: shielderSpeciesSet, ctx, random })
      if (next === null) { continue }
      next = ensureRolePieceAt({ pieces: next, pos: targetPos, team: alliedTeam, speciesSet: targetSpeciesSet, ctx, random })
      if (next === null) { continue }

      // Exclude both the engineered ray AND the opposite-direction half of
      // the same line — origins there sit on the line with destination
      // (empty on prior) between them and the shielder, re-creating the
      // shield on prior with moved_piece-at-origin as the attacker.
      const rayPositions = new Set([destination, ...lineSquares.slice(0, tIdx + 1), ...oppositeRay])
      const result = commitPriorRegionExcluding(ctx, next, destination, rayPositions)
      if (result !== null) { return result }
    }
  }
  return null
}

function pathClearOrCompatible(squares, fromIdx, untilIdx, pieces, team, speciesSet, endPos) {
  for (let i = fromIdx; i < untilIdx; i += 1) {
    if (pieces.has(squares[i])) { return false }
  }
  const existing = pieces.get(endPos)
  if (existing) {
    if (existing.charAt(0) !== team) { return false }
    if (!speciesSet.has(existing.slice(1))) { return false }
  }
  return true
}

function commitPriorRegionExcluding(ctx, pieces, destination, excludedSquares) {
  const moved = ctx.singulars.moved_piece
  const movedSpecies = committedSpecies(moved)
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p) && !excludedSquares.has(p))
  return commitPriorRegion(ctx, candidates, pieces)
}
