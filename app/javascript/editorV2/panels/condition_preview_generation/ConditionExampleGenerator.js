import { buildCombinedPlan, expandRelationalPlanSources } from './plans/plan'
import { buildSeed } from './seeds/seed_builder'
import { collectVerifiedExamples } from './collection/move_collection'
import { collectCastleExamples, collectPromotionExamples, collectEnPassantExamples } from './collection/special_moves'
import { buildUnaryWorkItems, collectUnaryExamples, buildPositionWorkItems, collectPositionExamples } from './collection/unary_position_collection'
import { mergeMoveKindExamples } from './enrichment/enrichment'
import { collectForwardExamples } from './forward_generation/orchestrator'
import { combinedPlanHasPbs } from './forward_generation/plan_classifier'
import { chainHasNonStructuralHints } from './forward_generation/hint_compiler'
import {
  candidateIdentity, MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { usesZeroRelationPath } from 'editorV2/panels/condition_preview_generation/plans/comparison_requirements'

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

function collectSpecialMoveExamples({ chainVariant, addUnique, castle, promotion, enPassant, deadline, random }) {
  if (chainVariant.moveKinds.includes(MOVE_KIND_CASTLE) && Date.now() <= deadline) {
    collectCastleExamples({ combinedPlan: chainVariant, random, maxExamples: MAX_CANDIDATE_POOL })
      .forEach(ex => addUnique(ex, castle))
  }

  if (chainVariant.moveKinds.includes(MOVE_KIND_PROMOTION) && Date.now() <= deadline) {
    collectPromotionExamples({ combinedPlan: chainVariant, random, maxExamples: MAX_CANDIDATE_POOL })
      .forEach(ex => addUnique(ex, promotion))
  }

  if (chainVariant.moveKinds.includes(MOVE_KIND_EN_PASSANT) && Date.now() <= deadline) {
    collectEnPassantExamples({ combinedPlan: chainVariant, random, maxExamples: MAX_CANDIDATE_POOL })
      .forEach(ex => addUnique(ex, enPassant))
  }
}

function collectAllExamples({ combinedPlan, random, totalMs }) {
  const seen = new Set()
  const addUnique = makeAdder(seen)
  const standardExamples = []
  const castleExamples = []
  const promotionExamples = []
  const enPassantExamples = []

  const plans = combinedPlan.plans
  const specialMoveMs = Math.min(totalMs * 0.2, SPECIAL_MOVE_MS_RESERVE)
  const perPlanMs = (totalMs - specialMoveMs) / Math.max(plans.length, 1)

  const relationalPlans = plans.filter(p => p.kind === 'relational')
  const unaryPlans = plans.filter(p => p.kind === 'unary')
  const positionPlans = plans.filter(p => p.kind === 'position')

  const chainVariants = buildChainVariants(combinedPlan)

  // ── Forward generation (PBS drivers + hint resolver) ────────────────────
  // Cap forward's contribution to FORWARD_POOL_SHARE so reverse-gen retains room
  // to surface its own variety (random board augmentation, enrichment-driven extras).
  if (combinedPlanHasPbs(combinedPlan) || chainHasNonStructuralHints(combinedPlan)) {
    const forwardCap = Math.floor(MAX_CANDIDATE_POOL * FORWARD_POOL_SHARE)
    collectForwardExamples({ combinedPlan, random, maxExamples: forwardCap })
      .forEach(ex => addUnique(ex, standardExamples))
  }

  // ── Relational seed-based standard collection ────────────────────────────
  // Round-robin (chainVariant, variant) tuples per attempt so no single tuple
  // monopolizes the pool. chainVariants expansion + variants both interleave.
  if (relationalPlans.length > 0) {
    const relDeadline = Date.now() + perPlanMs * relationalPlans.length
    const variants = effectiveVariants(combinedPlan)
    const tuples = []
    for (const chainVariant of chainVariants) {
      for (const variant of variants) {
        tuples.push({ chainVariant, variant })
      }
    }

    const maxRounds = MAX_SEEDS_PER_VARIANT
    roundLoop: for (let round = 0; round < maxRounds; round += 1) {
      if (standardExamples.length >= MAX_CANDIDATE_POOL || Date.now() > relDeadline) { break }
      for (const { chainVariant, variant } of tuples) {
        if (standardExamples.length >= MAX_CANDIDATE_POOL || Date.now() > relDeadline) { break roundLoop }
        const seed = buildSeed(chainVariant, MOVE_KIND_STANDARD, random)
        if (!seed) { continue }
        collectVerifiedExamples({ combinedPlan: chainVariant, seed, variant, random })
          .forEach(ex => addUnique(ex, standardExamples))
      }
    }
  }

  // ── Unary work-item collection ───────────────────────────────────────────
  for (const unaryPlan of unaryPlans) {
    const unaryDeadline = Date.now() + perPlanMs
    const workItems = buildUnaryWorkItems(unaryPlan, random)
    for (const item of workItems) {
      if (standardExamples.length >= MAX_CANDIDATE_POOL || Date.now() > unaryDeadline) { break }
      collectUnaryExamples({ combinedPlan, unaryPlan, item, random })
        .forEach(ex => addUnique(ex, standardExamples))
    }
  }

  // ── Position work-item collection ────────────────────────────────────────
  for (const positionPlan of positionPlans) {
    const posDeadline = Date.now() + perPlanMs
    const workItems = buildPositionWorkItems(positionPlan, combinedPlan.movingTeam, random)
    for (const item of workItems) {
      if (standardExamples.length >= MAX_CANDIDATE_POOL || Date.now() > posDeadline) { break }
      collectPositionExamples({ combinedPlan, positionPlan, item, random })
        .forEach(ex => addUnique(ex, standardExamples))
    }
  }

  // ── Special move collection (across all active expanded plans) ───────────
  const specialDeadline = Date.now() + specialMoveMs
  for (const chainVariant of chainVariants) {
    if (Date.now() > specialDeadline) { break }
    collectSpecialMoveExamples({ chainVariant, addUnique, castle: castleExamples, promotion: promotionExamples, enPassant: enPassantExamples, deadline: specialDeadline, random })
  }

  return { standardExamples, castleExamples, promotionExamples, enPassantExamples }
}

export function generateConditionExamples(payloads, options = {}) {
  const maxExamples = options.maxExamples ?? MAX_DEFAULT_EXAMPLES
  const random = options.random ?? Math.random
  const totalMs = options.maxMs ?? 500

  const payloadArray = Array.isArray(payloads) ? payloads : [payloads]

  const combinedPlan = buildCombinedPlan(payloadArray, options)
  if (combinedPlan.status !== 'supported') {
    return { status: combinedPlan.status, reason: combinedPlan.reason, examples: [], payloadCount: payloadArray.length }
  }

  const { standardExamples, castleExamples, promotionExamples, enPassantExamples } = collectAllExamples({
    combinedPlan, random, totalMs
  })

  const total = standardExamples.length + castleExamples.length + promotionExamples.length + enPassantExamples.length
  if (total === 0) {
    return { status: 'no_examples', reason: NO_EXAMPLES_REASON, examples: [], payloadCount: payloadArray.length }
  }

  return {
    status: 'ready',
    reason: null,
    payloadCount: payloadArray.length,
    examples: mergeMoveKindExamples({
      standardExamples, castleExamples, promotionExamples, enPassantExamples,
      combinedPlan, maxExamples, random
    })
  }
}

export default generateConditionExamples
