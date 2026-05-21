import Board from 'gameplay/board'
import {
  buildBoardFromLayout, buildLayoutFromPieces,
  shuffled, pieceCode, pickPlaceableSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { raySliderSpeciesForStep, walkRay, stepsForSliderSpecies } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { QUEEN_RAY_STEPS, shieldingPositions } from 'gameplay/board_query_utils'
import { pairsOnLine, pairsAcrossRays } from 'editorV2/panels/condition_preview/shared/line_pairs'
import {
  matchesSide, candidatesForSide, applyOne,
  requirementsMet,
  boundSingularInActiveSet, singularPosition, sideAllowsPos
} from './relation_helpers'
import { respectsAllCaps } from 'editorV2/panels/condition_preview/forward_proposition/respect_caps'
import { satisfyLoop } from './anchored'
import { roleForPlan } from '../moved_binding'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

// Shield invariant: subjectSide.team === targetSide.team. Both are the "ally side"
// of the shield (shielder + shielded). The attacker is the inferred opposing team.

export function satisfyShield(relation, pieces, ctx, random) {
  if (relation.subjectSide.count_range.max === 0 || relation.targetSide.count_range.max === 0) {
    return pieces
  }
  if (shieldRequirementsMet(relation, pieces, ctx)) { return pieces }
  const role = roleForPlan(ctx, relation.sourcePlan)
  return satisfyLoop({
    relation, pieces, ctx,
    requirementsMet: shieldRequirementsMet,
    step: p => placeOneTriple(role, relation, p, ctx, random)
  })
}

function placeOneTriple(role, relation, pieces, ctx, random) {
  if (role === 'subject')  { return tryAsShielder(relation, pieces, ctx, random) }
  if (role === 'target')   { return tryAsTarget(relation, pieces, ctx, random) }
  if (role === 'attacker') { return tryAsAttacker(relation, pieces, ctx, random) }
  return tryAsBystander(relation, pieces, ctx, random)
}

function shieldRequirementsMet(relation, pieces, ctx) {
  const { activeSubjects, activeTargets } = activeShieldSets(relation, pieces)
  if (!boundSingularInActiveSet(relation.subjectSide, activeSubjects, ctx)) { return false }
  if (!boundSingularInActiveSet(relation.targetSide, activeTargets, ctx)) { return false }
  return requirementsMet({
    subjectSide: relation.subjectSide,
    targetSide: relation.targetSide,
    activeSubjects, activeTargets, pieces
  })
}

export function activeShieldSets(relation, pieces, board = null) {
  board = board ?? buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const activeSubjects = new Set()
  const activeTargets = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    if (!sideAllowsPos(relation.targetSide, tPos)) { continue }
    const shielders = shieldingPositions({ board, targetPosition: tPos, team: relation.targetSide.team })
    let hasMatch = false
    for (const sPos of shielders) {
      if (!matchesSide(pieces.get(sPos), relation.subjectSide)) { continue }
      if (!sideAllowsPos(relation.subjectSide, sPos)) { continue }
      activeSubjects.add(sPos)
      hasMatch = true
    }
    if (hasMatch) { activeTargets.add(tPos) }
  }
  return { activeSubjects, activeTargets }
}

function tryAsBystander(relation, pieces, ctx, random) {
  const attackerTeam = Board.opposingTeam(relation.targetSide.team)
  const shielder = sideAsDescriptor(relation.subjectSide)
  const targetCandidates = orderedTargetCandidates(relation, pieces, random)

  for (const target of targetCandidates) {
    const piecesWithTarget = applyOne(pieces, target, ctx)
    if (piecesWithTarget === null) { continue }

    for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
      const attacker = { team: attackerTeam, speciesSet: raySliderSpeciesForStep(step) }
      const line = walkRay(target.position, step)
      const placed = tryFirstShufflePlacement({
        pairs: pairsOnLine({ line, near: shielder, far: attacker, pieces: piecesWithTarget }),
        near: shielder, far: attacker, pieces: piecesWithTarget, ctx, random
      })
      if (placed !== null) { return placed }
    }
  }
  return null
}

// α: coin-flip per call to mix Way A (multiple shielders for same target) and
// Way B (multiple shielders, each with a different target). 50% prefer existing
// matching targets first (Way A leaning); 50% prefer fresh targets first (Way B).
function orderedTargetCandidates(relation, pieces, random) {
  const all = candidatesForSide(relation.targetSide, pieces)
  const existing = all.filter(c => c.kind === 'existing')
  const fresh    = all.filter(c => c.kind === 'fresh')
  if (random() < 0.5) {
    return [...shuffled(existing, random), ...shuffled(fresh, random)]
  }
  return [...shuffled(fresh, random), ...shuffled(existing, random)]
}

function tryAsTarget(relation, pieces, ctx, random) {
  const targetPos = singularPosition(ctx, 'moved_piece')
  if (targetPos === null) { return null }
  const attackerTeam = Board.opposingTeam(relation.targetSide.team)
  const shielder = sideAsDescriptor(relation.subjectSide)

  for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
    const attacker = { team: attackerTeam, speciesSet: raySliderSpeciesForStep(step) }
    const line = walkRay(targetPos, step)
    const placed = tryFirstShufflePlacement({
      pairs: pairsOnLine({ line, near: shielder, far: attacker, pieces }),
      near: shielder, far: attacker, pieces, ctx, random
    })
    if (placed !== null) { return placed }
  }
  return null
}

function tryAsShielder(relation, pieces, ctx, random) {
  const shielderPos = singularPosition(ctx, 'moved_piece')
  if (shielderPos === null) { return null }
  const attackerTeam = Board.opposingTeam(relation.targetSide.team)
  const target = sideAsDescriptor(relation.targetSide)

  for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
    const attacker = { team: attackerTeam, speciesSet: raySliderSpeciesForStep(step) }
    const nearRay = walkRay(shielderPos, -step)
    const farRay = walkRay(shielderPos, step)
    const placed = tryFirstShufflePlacement({
      pairs: pairsAcrossRays({ nearRay, farRay, near: target, far: attacker, pieces }),
      near: target, far: attacker, pieces, ctx, random
    })
    if (placed !== null) { return placed }
  }
  return null
}

function tryAsAttacker(relation, pieces, ctx, random) {
  const attackerPos = singularPosition(ctx, 'moved_piece')
  if (attackerPos === null) { return null }
  const attackerSpecies = committedSpecies(ctx.singulars.moved_piece)
  const shielder = sideAsDescriptor(relation.subjectSide)
  const target = sideAsDescriptor(relation.targetSide)

  for (const step of shuffled(stepsForSliderSpecies(attackerSpecies), random)) {
    const line = walkRay(attackerPos, step)
    const placed = tryFirstShufflePlacement({
      pairs: pairsOnLine({ line, near: shielder, far: target, pieces }),
      near: shielder, far: target, pieces, ctx, random
    })
    if (placed !== null) { return placed }
  }
  return null
}

function tryFirstShufflePlacement({ pairs, near, far, pieces, ctx, random }) {
  for (const { nearPos, farPos } of shuffled(pairs, random)) {
    const placed = placeBothStrict({ nearPos, farPos, near, far, pieces, ctx, random })
    if (placed !== null) { return placed }
  }
  return null
}

// Places `near` at nearPos and `far` at farPos if those squares are empty;
// reuses existing pieces if already there. Returns null if neither placement
// added a new piece (no progress) or if any required placement failed.
function placeBothStrict({ nearPos, farPos, near, far, pieces, ctx, random }) {
  let next = pieces
  if (!pieces.has(nearPos)) {
    next = placeAt({ team: near.team, speciesSet: near.speciesSet, pos: nearPos, ctx, pieces: next, random })
    if (next === null) { return null }
  }
  if (!pieces.has(farPos)) {
    next = placeAt({ team: far.team, speciesSet: far.speciesSet, pos: farPos, ctx, pieces: next, random })
    if (next === null) { return null }
  }
  if (next === pieces) { return null }
  return next
}

function placeAt({ team, speciesSet, pos, ctx, pieces, random }) {
  const species = pickPlaceableSpecies(speciesSet, pos, random)
  if (species === null) { return null }
  if (!respectsAllCaps(team, species, pos, ctx, pieces)) { return null }
  return placePiece(pieces, pos, pieceCode(team, species))
}

function sideAsDescriptor(side) {
  return { team: side.team, speciesSet: side.species_set }
}
