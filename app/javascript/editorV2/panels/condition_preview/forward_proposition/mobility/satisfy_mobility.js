import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import { blockersMechanism } from './blockers'
import { kingAdjacentControlMechanism } from './king_adjacent_control'
import { pinsMechanism } from './pins'

const MECHANISMS = Object.freeze([
  blockersMechanism,
  kingAdjacentControlMechanism,
  pinsMechanism
])

export function satisfyMobility(ctx, pieces, random) {
  if (!hasMobilityConstraints(ctx)) { return pieces }
  for (const target of mobilityConstrainedTargets(pieces, ctx)) {
    const eligible = MECHANISMS.filter(m => m.appliesTo(target, ctx, 'current', pieces))
    for (const mechanism of shuffled(eligible, random)) {
      const next = mechanism.apply(target, ctx, 'current', pieces, random)
      if (next !== null) { pieces = next }
    }
  }
  return pieces
}

function mobilityConstrainedTargets(pieces, ctx) {
  const targets = []
  for (const [position, code] of pieces) {
    const team = code.charAt(0)
    const species = code.slice(1)
    if (isMobilityConstrained(team, species, ctx)) {
      targets.push({ position, team, species })
    }
  }
  return targets
}

function isMobilityConstrained(team, species, ctx) {
  for (const proposition of ctx.propositions ?? []) {
    if (proposition.frame !== 'current') { continue }
    if (proposition.team !== team) { continue }
    if (!proposition.species_set.has(species)) { continue }
    if (isPermissiveRange(proposition.aggregate_mobility_range)) { continue }
    return true
  }
  return false
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
