import Board from 'gameplay/board'
import { QUEEN_RAY_STEPS } from 'gameplay/board_query_utils'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, raySliderSpeciesForStep, walkRay, stepsForSliderSpecies
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { pairsOnLine, pairsAcrossRays } from 'editorV2/panels/condition_preview/shared/line_pairs'
import {
  singularSquare, ensureRolePieceAt, commitPriorRegion
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/cross_frame_helpers'
import { roleForPlan } from 'editorV2/panels/condition_preview/forward_proposition/moved_binding'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

export const movedPieceParticipatesShield = {
  name: 'moved-piece-participates-shield',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (entry.operator !== 'shield') { return false }
    return roleForPlan(ctx, entry.sourcePlan) !== null
  },

  apply(entry, ctx, pieces, random) {
    const role = roleForPlan(ctx, entry.sourcePlan)
    if (role === null || !ROLE_STRATEGIES[role]) { return null }
    if (entry.direction === '+') { return applyPlus(role, entry, ctx, pieces, random) }
    if (entry.direction === '-') { return applyMinus(role, entry, ctx, pieces, random) }
    return null
  }
}

// Per moved_piece role, the strategy specifies which two slots flank the
// placement, the line shape (one ray vs two halves of a ray through a pivot),
// and which step set to iterate.
const ROLE_STRATEGIES = {
  subject: {
    lineKind: 'acrossRays',
    stepsFor: () => [...QUEEN_RAY_STEPS],
    nearFor: (entry, { alliedTeam }) => ({ team: alliedTeam, speciesSet: targetSpeciesSet(entry) }),
    farFor: (entry, { attackerTeam, step }) => ({ team: attackerTeam, speciesSet: raySliderSpeciesForStep(step) })
  },
  target: {
    lineKind: 'onLine',
    stepsFor: () => [...QUEEN_RAY_STEPS],
    nearFor: (entry, { alliedTeam }) => ({ team: alliedTeam, speciesSet: shielderSpeciesSet(entry) }),
    farFor: (entry, { attackerTeam, step }) => ({ team: attackerTeam, speciesSet: raySliderSpeciesForStep(step) })
  },
  attacker: {
    lineKind: 'onLine',
    stepsFor: ({ movedSpecies }) => [...stepsForSliderSpecies(movedSpecies)],
    nearFor: (entry, { alliedTeam }) => ({ team: alliedTeam, speciesSet: shielderSpeciesSet(entry) }),
    farFor: (entry, { alliedTeam }) => ({ team: alliedTeam, speciesSet: targetSpeciesSet(entry) })
  }
}

function applyPlus(role, entry, ctx, pieces, random) {
  const destination = singularSquare(ctx.singulars.moved_piece)
  if (destination === null) { return null }
  const strategy = ROLE_STRATEGIES[role]
  const env = stepEnv(entry, ctx)

  for (const step of shuffled(strategy.stepsFor(env), random)) {
    const near = strategy.nearFor(entry, { ...env, step })
    const far = strategy.farFor(entry, { ...env, step })
    if (far.speciesSet.size === 0) { continue }
    const placed = tryPlacementAtPivot({
      strategy, pivot: destination, step, near, far, ctx, pieces, random,
      commitFor: (line, oppositeOrFarRay) => (next, indices) =>
        commitPriorRegionExcluding(ctx, next, destination, excludedRayPositions({
          lineKind: strategy.lineKind, pivot: destination, line, oppositeOrFarRay, indices
        }))
    })
    if (placed !== null) { return placed }
  }
  return null
}

function applyMinus(role, entry, ctx, pieces, random) {
  const destination = singularSquare(ctx.singulars.moved_piece)
  if (destination === null) { return null }
  const strategy = ROLE_STRATEGIES[role]
  const moved = ctx.singulars.moved_piece
  const movedSpecies = committedSpecies(moved)
  const env = stepEnv(entry, ctx)

  for (const origin of shuffled(originsFor(destination, movedSpecies, moved.team, pieces), random)) {
    for (const step of shuffled(strategy.stepsFor(env), random)) {
      const near = strategy.nearFor(entry, { ...env, step })
      const far = strategy.farFor(entry, { ...env, step })
      if (far.speciesSet.size === 0) { continue }
      const placed = tryPlacementAtPivot({
        strategy, pivot: origin, step, near, far, ctx, pieces, random,
        avoidSquare: destination,
        commitFor: () => next => commitPriorRegion(ctx, [origin], next)
      })
      if (placed !== null) { return placed }
    }
  }
  return null
}

// Walks the pivot's ray(s) per strategy.lineKind. avoidSquare (used for
// direction "-") rejects any ray that includes the destination, to keep the
// post-move geometry from re-creating the shield through origin.
function tryPlacementAtPivot({ strategy, pivot, step, near, far, ctx, pieces, random, commitFor, avoidSquare = null }) {
  if (strategy.lineKind === 'acrossRays') {
    const nearRay = rayFromPivot(pivot, -step, avoidSquare)
    const farRay = rayFromPivot(pivot, step, avoidSquare)
    if (nearRay === null || farRay === null) { return null }
    return tryPlaceBothAndCommit({
      pairs: pairsAcrossRays({ nearRay, farRay, near, far, pieces }),
      near, far, ctx, pieces, random,
      commit: commitFor(nearRay, farRay)
    })
  }
  const line = rayFromPivot(pivot, step, avoidSquare)
  if (line === null) { return null }
  const oppositeRay = avoidSquare === null ? walkRay(pivot, -step) : null
  return tryPlaceBothAndCommit({
    pairs: pairsOnLine({ line, near, far, pieces }),
    near, far, ctx, pieces, random,
    commit: commitFor(line, oppositeRay)
  })
}

function rayFromPivot(pivot, step, avoidSquare) {
  const positions = walkRay(pivot, step)
  if (avoidSquare === null) { return positions }
  if (positions.includes(avoidSquare)) { return null }
  const opposite = walkRay(pivot, -step)
  if (opposite.includes(avoidSquare)) { return null }
  return positions
}

function excludedRayPositions({ lineKind, pivot, line, oppositeOrFarRay, indices }) {
  if (lineKind === 'acrossRays') {
    const { nearIdx, farIdx } = indices
    return new Set([pivot, ...line.slice(0, nearIdx + 1), ...oppositeOrFarRay.slice(0, farIdx + 1)])
  }
  const { farIdx } = indices
  return new Set([pivot, ...line.slice(0, farIdx + 1), ...oppositeOrFarRay])
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

function stepEnv(entry, ctx) {
  const alliedTeam = entry.currentProposition.team
  return {
    alliedTeam,
    attackerTeam: Board.opposingTeam(alliedTeam),
    movedSpecies: committedSpecies(ctx.singulars.moved_piece)
  }
}

function originsFor(destination, movedSpecies, team, pieces) {
  return originCandidatesForSpecies(destination, movedSpecies, team)
    .filter(p => p !== destination && !pieces.has(p))
}

function shielderSpeciesSet(entry) {
  return entry.subjectProposition?.species_set ?? entry.currentProposition.species_set
}

function targetSpeciesSet(entry) {
  return entry.targetProposition?.species_set ?? entry.currentProposition.species_set
}

function commitPriorRegionExcluding(ctx, pieces, destination, excludedSquares) {
  const moved = ctx.singulars.moved_piece
  const movedSpecies = committedSpecies(moved)
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p) && !excludedSquares.has(p))
  return commitPriorRegion(ctx, candidates, pieces)
}
