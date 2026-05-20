import { buildCombinedPlan, expandRelationalPlanSources } from './plans/plan'
import { candidateIdentity } from './shared/example_utils'
import { usesZeroRelationPath } from './plans/comparison_requirements'
import { assembleWithSpecialQuota } from './shared/example_assembly'
import { collectForwardResolverExamples } from './forward_resolver/collect'
import { collectForwardPatternExamples } from './forward_pattern/collect'
import { collectForwardPropositionExamples } from './forward_proposition/collect'
import { collectReverseRelationalExamples } from './reverse_relational/collect'
import { collectReverseUnaryExamples } from './reverse_unary/collect'
import { collectReversePositionExamples } from './reverse_position/collect'

const SOFT_TIMEOUT_MS = 10000
const MAX_DEFAULT_EXAMPLES = 30
const MAX_CANDIDATE_POOL = 400
const MAX_SEEDS_PER_VARIANT = 600
const FORWARD_RESOLVER_ATTEMPTS = 200
const FORWARD_PATTERN_ATTEMPTS = 200
const FORWARD_PROPOSITION_ATTEMPTS = 1200

const NO_EXAMPLES_REASON = "Couldn't build a verified example for this condition yet. This may mean the condition is unsatisfiable, or that the preview generator still needs work."

// Single source of truth for per-pipeline budget knobs. Today's allocation is
// uniform across chain shapes; chain-shape-aware weighting adds branches here.
function computeBudgets(combinedPlan, totalMs) {
  const planCount = Math.max(combinedPlan.plans.length, 1)
  return {
    forwardCap: MAX_CANDIDATE_POOL,
    forwardResolverAttempts: FORWARD_RESOLVER_ATTEMPTS,
    forwardPatternAttempts: FORWARD_PATTERN_ATTEMPTS,
    forwardPropositionAttempts: FORWARD_PROPOSITION_ATTEMPTS,
    perPlanMs: totalMs / planCount,
    maxStandardSize: MAX_CANDIDATE_POOL,
    maxSeedsPerVariant: MAX_SEEDS_PER_VARIANT
  }
}

function makeAdder(seen) {
  return function addUnique(example, pool) {
    const id = candidateIdentity(example)
    if (seen.has(id)) { return }
    seen.add(id)
    pool.push(example)
  }
}

function effectiveVariants(combinedPlan) {
  const relationalPlans = combinedPlan.plans.filter(p => p.kind === 'relational')
  if (relationalPlans.length === 0) { return [] }
  const hasRequired = relationalPlans.some(p =>
    !usesZeroRelationPath(p.requirements) &&
    p.variants?.some(v => v.type === 'required')
  )
  if (hasRequired) { return [{ type: 'required' }] }
  const hasAllied = relationalPlans.some(p => p.subject === 'allied' || p.target === 'allied')
  if (!hasAllied) { return [{ type: 'separate' }] }

  return [{ type: 'involved' }, { type: 'separate' }]
}

function buildChainVariants(combinedPlan) {
  const relationalPlans = combinedPlan.plans.filter(p => p.kind === 'relational')
  if (relationalPlans.length === 0) { return [combinedPlan] }

  const expansions = relationalPlans.map(p => expandRelationalPlanSources(p))

  let combinations = [[]]
  for (const expansion of expansions) {
    const next = []
    for (const combo of combinations) {
      for (const exp of expansion) {
        next.push([...combo, exp])
      }
    }
    combinations = next
  }

  return combinations.map(expandedRelPlans => {
    let planIndex = 0
    return {
      ...combinedPlan,
      plans: combinedPlan.plans.map(p => p.kind === 'relational' ? expandedRelPlans[planIndex++] : p)
    }
  })
}

const PIPELINE_KEYS = Object.freeze([
  'forward-resolver', 'forward-pattern', 'forward-proposition',
  'forward-proposition.standard', 'forward-proposition.special',
  'reverse-relational', 'reverse-unary', 'reverse-position'
])

const ENABLED_PIPELINES = new Set(['forward-proposition'])

function emptyPipelineCounter() {
  const counter = {}
  for (const key of PIPELINE_KEYS) { counter[key] = 0 }
  return counter
}

function collectAllExamples({ combinedPlan, random, totalMs, deadline = Infinity }) {
  const seen = new Set()
  const addUnique = makeAdder(seen)
  const standardExamples = []
  const produced = emptyPipelineCounter()

  const budgets = computeBudgets(combinedPlan, totalMs)
  const plans = combinedPlan.plans
  const relationalPlans = plans.filter(p => p.kind === 'relational')
  const unaryPlans = plans.filter(p => p.kind === 'unary')
  const positionPlans = plans.filter(p => p.kind === 'position')

  const chainVariants = buildChainVariants(combinedPlan)

  if (plans.length > 0) {
    if (ENABLED_PIPELINES.has('forward-resolver')) {
      collectForwardResolverExamples({
        combinedPlan, random,
        maxStandardSize: budgets.forwardCap, attempts: budgets.forwardResolverAttempts,
        addUnique, standardExamples, produced
      })
    }
    if (ENABLED_PIPELINES.has('forward-pattern')) {
      collectForwardPatternExamples({
        combinedPlan, random,
        maxStandardSize: budgets.forwardCap, attempts: budgets.forwardPatternAttempts,
        addUnique, standardExamples, produced
      })
    }
    if (ENABLED_PIPELINES.has('forward-proposition')) {
      collectForwardPropositionExamples({
        combinedPlan, random,
        maxStandardSize: budgets.forwardCap, attempts: budgets.forwardPropositionAttempts,
        addUnique, standardExamples, produced, deadline
      })
    }
  }

  if (relationalPlans.length > 0 && ENABLED_PIPELINES.has('reverse-relational')) {
    const relDeadline = Date.now() + budgets.perPlanMs * relationalPlans.length
    const variants = effectiveVariants(combinedPlan)
    const tuples = []
    for (const chainVariant of chainVariants) {
      for (const variant of variants) {
        tuples.push({ chainVariant, variant })
      }
    }
    collectReverseRelationalExamples({
      tuples, relDeadline, random,
      maxStandardSize: budgets.maxStandardSize, maxRounds: budgets.maxSeedsPerVariant,
      addUnique, standardExamples, produced
    })
  }

  if (unaryPlans.length > 0 && ENABLED_PIPELINES.has('reverse-unary')) {
    collectReverseUnaryExamples({
      combinedPlan, unaryPlans, perPlanMs: budgets.perPlanMs, random,
      maxStandardSize: budgets.maxStandardSize,
      addUnique, standardExamples, produced
    })
  }

  if (positionPlans.length > 0 && ENABLED_PIPELINES.has('reverse-position')) {
    collectReversePositionExamples({
      combinedPlan, positionPlans, perPlanMs: budgets.perPlanMs, random,
      maxStandardSize: budgets.maxStandardSize,
      addUnique, standardExamples, produced
    })
  }

  return { standardExamples, produced }
}

function emitStats(options, payloadArray, produced, finalExamples, startTime) {
  const onComplete = options.stats?.onComplete
  if (!onComplete) { return }
  const survived = emptyPipelineCounter()
  for (const example of finalExamples) {
    if (example.enriched) { continue }
    if (example.generationPath in survived) {
      survived[example.generationPath] += 1
    }
  }
  onComplete({
    ts: new Date().toISOString(),
    node_ids: options.nodeIds ?? null,
    payloads: payloadArray,
    produced,
    survived,
    total_survived: finalExamples.length,
    elapsed_ms: Date.now() - startTime
  })
}

export function generateConditionExamples(payloads, options = {}) {
  const maxExamples = options.maxExamples ?? MAX_DEFAULT_EXAMPLES
  const random = options.random ?? Math.random
  const totalMs = options.maxMs ?? 500
  const softTimeoutMs = options.softTimeoutMs ?? SOFT_TIMEOUT_MS
  const startTime = Date.now()
  const deadline = startTime + softTimeoutMs

  const payloadArray = Array.isArray(payloads) ? payloads : [payloads]
  const combinedPlan = buildCombinedPlan(payloadArray, options)

  if (combinedPlan.status !== 'supported') {
    return { status: combinedPlan.status, reason: combinedPlan.reason, examples: [], payloadCount: payloadArray.length }
  }
  const { standardExamples, produced } = collectAllExamples({
    combinedPlan, random, totalMs, deadline
  })
  const timedOut = Date.now() > deadline
  if (standardExamples.length === 0) {
    emitStats(options, payloadArray, produced, [], startTime)
    if (timedOut) {
      return { status: 'slow', reason: `Generation paused after ${softTimeoutMs}ms — no examples found yet.`, examples: [], payloadCount: payloadArray.length }
    }
    return { status: 'no_examples', reason: NO_EXAMPLES_REASON, examples: [], payloadCount: payloadArray.length }
  }
  const finalExamples = assembleWithSpecialQuota({
    examples: standardExamples, combinedPlan, maxExamples, random
  })
  emitStats(options, payloadArray, produced, finalExamples, startTime)
  const status = timedOut && finalExamples.length < maxExamples ? 'slow' : 'ready'
  return {
    status,
    reason: status === 'slow' ? `Generation paused after ${softTimeoutMs}ms — ${finalExamples.length} examples found so far.` : null,
    payloadCount: payloadArray.length,
    examples: finalExamples
  }
}

export default generateConditionExamples
