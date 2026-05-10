import { buildBoardFromLayout, buildLayoutFromPieces, shuffled, teamHasKing } from 'editorV2/panels/condition_preview/shared/board_utils'
import { mobilityAt } from 'gameplay/mobility'
import { blockersMechanism } from './blockers'
import { kingAdjacentControlMechanism } from './king_adjacent_control'
import { pinsMechanism } from './pins'

const MECHANISMS = Object.freeze([
  blockersMechanism,
  kingAdjacentControlMechanism,
  pinsMechanism
])

const MAX_PER_TARGET_ITERATIONS = 30

export function satisfyMobility(ctx, pieces, random) {
  if (!hasMobilityConstraints(ctx)) { return pieces }
  for (const target of mobilityConstrainedTargets(pieces, ctx)) {
    if (!targetIsConstrained(target, ctx, pieces)) { continue }
    for (let i = 0; i < MAX_PER_TARGET_ITERATIONS; i += 1) {
      if (!targetIsConstrained(target, ctx, pieces)) { break }
      const next = applyOneMechanism(target, ctx, pieces, random)
      if (next === pieces) { break }
      pieces = next
    }
  }
  return pieces
}

function targetIsConstrained(target, ctx, pieces) {
  const satisfied = computeSatisfiedProps(pieces, ctx)
  return isMobilityConstrained(target.position, target.team, target.species, ctx, satisfied)
}

// Applies the first successful mechanism from a shuffled eligible list. If
// every eligible mechanism returns null, returns the input pieces map
// unchanged — caller treats that as "no progress, stop iterating".
// Future: precise-reduction-aware selection plugs in here.
function applyOneMechanism(target, ctx, pieces, random) {
  const eligible = MECHANISMS.filter(m => m.appliesTo(target, ctx, 'current', pieces))
  for (const mechanism of shuffled(eligible, random)) {
    const next = mechanism.apply(target, ctx, 'current', pieces, random)
    if (next !== null) { return next }
  }
  return pieces
}

function mobilityConstrainedTargets(pieces, ctx) {
  const satisfied = computeSatisfiedProps(pieces, ctx)
  const targets = []
  for (const [position, code] of pieces) {
    const team = code.charAt(0)
    const species = code.slice(1)
    if (isMobilityConstrained(position, team, species, ctx, satisfied)) {
      targets.push({ position, team, species })
    }
  }
  return targets
}

function computeSatisfiedProps(pieces, ctx) {
  const satisfied = new Set()
  for (const proposition of ctx.propositions ?? []) {
    if (proposition.frame !== 'current') { continue }
    if (isPermissiveRange(proposition.aggregate_mobility_range)) { continue }
    if (!teamHasKing(pieces, proposition.team)) { continue }
    const total = aggregateMobility(proposition, ctx, pieces)
    const range = proposition.aggregate_mobility_range
    if (total >= range.min && total <= range.max) { satisfied.add(proposition) }
  }
  return satisfied
}

function isMobilityConstrained(position, team, species, ctx, satisfiedProps) {
  for (const proposition of ctx.propositions ?? []) {
    if (proposition.frame !== 'current') { continue }
    if (proposition.team !== team) { continue }
    if (!proposition.species_set.has(species)) { continue }
    if (isPermissiveRange(proposition.aggregate_mobility_range)) { continue }
    if (proposition.boundSingularActor && singularPosition(ctx, proposition.boundSingularActor) !== position) { continue }
    if (satisfiedProps.has(proposition)) { continue }
    return true
  }
  return false
}

function aggregateMobility(proposition, ctx, pieces) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  let total = 0
  for (const [pos, code] of pieces) {
    if (code.charAt(0) !== proposition.team) { continue }
    if (!proposition.species_set.has(code.slice(1))) { continue }
    if (proposition.boundSingularActor && singularPosition(ctx, proposition.boundSingularActor) !== pos) { continue }
    total += mobilityAt(board, pos)
  }
  return total
}

function singularPosition(ctx, actorKey) {
  const singular = ctx?.singulars?.[actorKey]
  if (!singular) { return null }
  if (singular.region.kind !== 'set' || singular.region.squares.size !== 1) { return null }
  return [...singular.region.squares][0]
}

function hasMobilityConstraints(ctx) {
  for (const proposition of ctx.propositions ?? []) {
    if (!isPermissiveRange(proposition.aggregate_mobility_range)) { return true }
  }
  return false
}

function isPermissiveRange(range) {
  if (!range) { return true }
  return range.min === 0 && range.max === Infinity
}
