import { buildCombinedPlan, expandRelationalPlanSources } from './plans/plan'
import { mergeMoveKindExamples } from './shared/enrichment'
import {
  candidateIdentity, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from './shared/example_utils'
import { usesZeroRelationPath } from './plans/comparison_requirements'
import { shuffled } from './shared/board_utils'
import { collectForwardResolverExamples } from './forward_resolver/collect'
import { collectForwardPatternExamples } from './forward_pattern/collect'
import { collectReverseRelationalExamples } from './reverse_relational/collect'
import { collectReverseUnaryExamples } from './reverse_unary/collect'
import { collectReversePositionExamples } from './reverse_position/collect'
import { collectCastleExamples } from './special_moves/castle'
import { collectPromotionExamples } from './special_moves/promotion'
import { collectEnPassantExamples } from './special_moves/en_passant'

const MAX_DEFAULT_EXAMPLES = 30
const MAX_CANDIDATE_POOL = 120
const FORWARD_POOL_SHARE = 0.5
const MAX_SEEDS_PER_VARIANT = 600
const SPECIAL_MOVE_MS_RESERVE = 100

const NO_EXAMPLES_REASON = "Couldn't build a verified example for this condition yet. This may mean the condition is unsatisfiable, or that the preview generator still needs work."

function makeAdder(seen) {
  return function addUnique(example, pool) {
    const id = candidateIdentity(example)
    if (seen.has(id)) { return }
    seen.add(id)
    if (!example.generationPath) { example.generationPath = 'reverse' }
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

function collectSpecialMoveExamples({ chainVariant, addUnique, castle, promotion, enPassant, deadline, random, produced }) {
  if (chainVariant.moveKinds.includes(MOVE_KIND_CASTLE) && Date.now() <= deadline) {
    const examples = collectCastleExamples({ combinedPlan: chainVariant, random, maxExamples: MAX_CANDIDATE_POOL })
    produced['castle'] += examples.length
    examples.forEach(ex => addUnique(ex, castle))
  }

  if (chainVariant.moveKinds.includes(MOVE_KIND_PROMOTION) && Date.now() <= deadline) {
    const examples = collectPromotionExamples({ combinedPlan: chainVariant, random, maxExamples: MAX_CANDIDATE_POOL })
    produced['promotion'] += examples.length
    examples.forEach(ex => addUnique(ex, promotion))
  }

  if (chainVariant.moveKinds.includes(MOVE_KIND_EN_PASSANT) && Date.now() <= deadline) {
    const examples = collectEnPassantExamples({ combinedPlan: chainVariant, random, maxExamples: MAX_CANDIDATE_POOL })
    produced['en-passant'] += examples.length
    examples.forEach(ex => addUnique(ex, enPassant))
  }
}

const PIPELINE_KEYS = Object.freeze([
  'forward-resolver', 'forward-pattern',
  'reverse-relational', 'reverse-unary', 'reverse-position',
  'castle', 'promotion', 'en-passant'
])

function emptyPipelineCounter() {
  const counter = {}
  for (const key of PIPELINE_KEYS) { counter[key] = 0 }
  return counter
}

function collectAllExamples({ combinedPlan, random, totalMs }) {
  const seen = new Set()
  const addUnique = makeAdder(seen)
  const standardExamples = []
  const castleExamples = []
  const promotionExamples = []
  const enPassantExamples = []
  const produced = emptyPipelineCounter()

  const plans = combinedPlan.plans
  const specialMoveMs = Math.min(totalMs * 0.2, SPECIAL_MOVE_MS_RESERVE)
  const perPlanMs = (totalMs - specialMoveMs) / Math.max(plans.length, 1)

  const relationalPlans = plans.filter(p => p.kind === 'relational')
  const unaryPlans = plans.filter(p => p.kind === 'unary')
  const positionPlans = plans.filter(p => p.kind === 'position')

  const chainVariants = buildChainVariants(combinedPlan)

  // ── Forward generation ──────────────────────────────────────────────────
  // Cap forward's contribution to FORWARD_POOL_SHARE so reverse-gen retains room
  // to surface its own variety. Resolver runs first, then pattern picks up if
  // any room is left under the shared cap.
  if (plans.length > 0) {
    const forwardCap = Math.floor(MAX_CANDIDATE_POOL * FORWARD_POOL_SHARE)
    collectForwardResolverExamples({ combinedPlan, random, maxStandardSize: forwardCap, addUnique, standardExamples, produced })
    collectForwardPatternExamples({ combinedPlan, random, maxStandardSize: forwardCap, addUnique, standardExamples, produced })
  }

  // ── Reverse-relational ──────────────────────────────────────────────────
  if (relationalPlans.length > 0) {
    const relDeadline = Date.now() + perPlanMs * relationalPlans.length
    const variants = effectiveVariants(combinedPlan)
    const tuples = []
    for (const chainVariant of chainVariants) {
      for (const variant of variants) {
        tuples.push({ chainVariant, variant })
      }
    }
    collectReverseRelationalExamples({
      tuples, relDeadline, random,
      maxStandardSize: MAX_CANDIDATE_POOL, maxRounds: MAX_SEEDS_PER_VARIANT,
      addUnique, standardExamples, produced
    })
  }

  // ── Reverse-unary ───────────────────────────────────────────────────────
  if (unaryPlans.length > 0) {
    collectReverseUnaryExamples({
      combinedPlan, unaryPlans, perPlanMs, random,
      maxStandardSize: MAX_CANDIDATE_POOL,
      addUnique, standardExamples, produced
    })
  }

  // ── Reverse-position ────────────────────────────────────────────────────
  if (positionPlans.length > 0) {
    collectReversePositionExamples({
      combinedPlan, positionPlans, perPlanMs, random,
      maxStandardSize: MAX_CANDIDATE_POOL,
      addUnique, standardExamples, produced
    })
  }

  // ── Special moves ───────────────────────────────────────────────────────
  const specialDeadline = Date.now() + specialMoveMs
  for (const chainVariant of chainVariants) {
    if (Date.now() > specialDeadline) { break }
    collectSpecialMoveExamples({ chainVariant, addUnique, castle: castleExamples, promotion: promotionExamples, enPassant: enPassantExamples, deadline: specialDeadline, random, produced })
  }

  return { standardExamples, castleExamples, promotionExamples, enPassantExamples, produced }
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
  const startTime = Date.now()

  const payloadArray = Array.isArray(payloads) ? payloads : [payloads]

  const combinedPlan = buildCombinedPlan(payloadArray, options)
  if (combinedPlan.status !== 'supported') {
    return { status: combinedPlan.status, reason: combinedPlan.reason, examples: [], payloadCount: payloadArray.length }
  }

  const { standardExamples, castleExamples, promotionExamples, enPassantExamples, produced } = collectAllExamples({
    combinedPlan, random, totalMs
  })

  const total = standardExamples.length + castleExamples.length + promotionExamples.length + enPassantExamples.length
  if (total === 0) {
    emitStats(options, payloadArray, produced, [], startTime)
    return { status: 'no_examples', reason: NO_EXAMPLES_REASON, examples: [], payloadCount: payloadArray.length }
  }

  const finalExamples = mergeMoveKindExamples({
    standardExamples, castleExamples, promotionExamples, enPassantExamples,
    combinedPlan, maxExamples, random
  })

  emitStats(options, payloadArray, produced, finalExamples, startTime)

  return {
    status: 'ready',
    reason: null,
    payloadCount: payloadArray.length,
    examples: shuffled(finalExamples, random)
  }
}

export default generateConditionExamples
