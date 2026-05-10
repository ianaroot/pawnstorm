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

export function earlyPlaceMobilityTargets(ctx, random) {
  let pieces = new Map()
  const constraints = mobilityConstraintsFromCtx(ctx)
  if (constraints.length === 0) { return pieces }

  const pool = buildEligiblePool(ctx)
  const pairs = collectApplicablePairs(constraints, ctx, pieces, pool)
  const filledConstraints = new Set()
  for (const { strategy, constraint } of shuffled(pairs, random)) {
    if (filledConstraints.has(constraint)) { continue }
    const next = strategy.apply(constraint, ctx, pieces, pool, random)
    if (next !== null) {
      pieces = next
      filledConstraints.add(constraint)
    }
  }
  return pieces
}

function mobilityConstraintsFromCtx(ctx) {
  const result = []
  for (const proposition of ctx.propositions ?? []) {
    if (proposition.frame !== 'current') { continue }
    const range = proposition.aggregate_mobility_range
    if (!range) { continue }
    if (range.min === 0 && range.max === Infinity) { continue }
    result.push(proposition)
  }
  return result
}

function collectApplicablePairs(constraints, ctx, pieces, pool) {
  const pairs = []
  for (const constraint of constraints) {
    for (const strategy of STRATEGIES) {
      if (strategy.appliesTo(constraint, ctx, pieces, pool)) {
        pairs.push({ strategy, constraint })
      }
    }
  }
  return pairs
}
