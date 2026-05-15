import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildEligiblePool } from './eligible_pool'
import { edgeStrategy } from './strategies/edge'
import { pinLineStrategy } from './strategies/pin_line'
import { checkRestrictionStrategy } from './strategies/check_restriction'
import { stalemateStrategy } from './strategies/stalemate'
import { checkmateStrategy } from './strategies/checkmate'

const STRATEGIES = Object.freeze([
  edgeStrategy, pinLineStrategy, checkRestrictionStrategy, stalemateStrategy, checkmateStrategy
])

export function earlyPlaceConstraintTargets(ctx, random) {
  let pieces = new Map()
  const constraints = constraintsFromCtx(ctx)
  if (constraints.length === 0) { return pieces }

  const pool = buildEligiblePool(ctx)
  const pairs = collectApplicablePairs(constraints, ctx, pieces, pool)
  const filledConstraints = new Set()
  for (const { strategy, constraint, inner } of shuffled(pairs, random)) {
    if (filledConstraints.has(constraint)) { continue }
    const next = strategy.apply(inner, ctx, pieces, pool, random)
    if (next !== null) {
      pieces = next
      filledConstraints.add(constraint)
    }
  }
  return pieces
}

export function constraintsFromCtx(ctx) {
  const result = []
  for (const proposition of ctx.propositions ?? []) {
    if (proposition.frame !== 'current') { continue }
    const range = proposition.aggregate_mobility_range
    if (!range) { continue }
    if (range.min === 0 && range.max === Infinity) { continue }
    result.push({ kind: 'mobility', proposition })
  }
  return result
}

function collectApplicablePairs(constraints, ctx, pieces, pool) {
  const pairs = []
  for (const constraint of constraints) {
    const inner = innerFor(constraint)
    for (const strategy of STRATEGIES) {
      if (strategy.constraintKind !== constraint.kind) { continue }
      if (strategy.appliesTo(inner, ctx, pieces, pool)) {
        pairs.push({ strategy, constraint, inner })
      }
    }
  }
  return pairs
}

function innerFor(constraint) {
  if (constraint.kind === 'mobility')   { return constraint.proposition }
  if (constraint.kind === 'crossFrame') { return constraint.entry }
  return null
}
