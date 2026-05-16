import Board from 'gameplay/board'
import { buildPlan } from 'editorV2/panels/condition_preview/plans/generation_plan'
import {
  MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/shared/example_utils'
import { SINGULAR_ACTORS } from 'bot_execution/actors'
import {
  VALUE_COMPARISON_METRIC, isValueMetric,
  EXACT_NUMBER_COMPARISON_SOURCE,
  PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonRequirementsFromDescriptors,
  valueComparisonAllowsEmpty
} from 'editorV2/panels/condition_preview/plans/comparison_requirements'
import { valueSourceOptions as kingInclusiveValueSourceOptions } from 'editorV2/panels/condition_preview/plans/value_source_options'

const ALL_MOVE_KINDS = Object.freeze([MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT])

// ===== expandRelationalPlanSources =====

const NON_KING_VALUE_SPECIES = Object.freeze(new Map([
  [0, []],
  [1, [Board.PAWN]],
  [3, [Board.NIGHT, Board.BISHOP]],
  [5, [Board.ROOK]],
  [9, [Board.QUEEN]]
]))

function valueSourceOptions(descriptor) {
  switch (descriptor.source) {
    case EXACT_NUMBER_COMPARISON_SOURCE:
      return [{ resolvedTotal: Number(descriptor.total || 0), constraints: {} }]
    case 'moved_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({ resolvedTotal: value, constraints: { movedPieceSpeciesPool: speciesPool } }))
    case 'captured_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({ resolvedTotal: value, constraints: { capturedPieceSpeciesPool: speciesPool } }))
    case 'enemy_moved_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({ resolvedTotal: value, constraints: { enemyMovedPieceSpeciesPool: speciesPool } }))
    case 'enemy_captured_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({ resolvedTotal: value, constraints: { enemyCapturedPieceSpeciesPool: speciesPool } }))
    default:
      return []
  }
}

function mergeConstraintValue(left, right) {
  if (left === undefined) { return right }
  if (right === undefined) { return left }
  if (left.length === 0 || right.length === 0) {
    return left.length === right.length ? [] : null
  }
  const intersection = left.filter(species => right.includes(species))
  return intersection.length > 0 ? intersection : null
}

function mergeConstraints(base, extra) {
  const merged = { ...base }
  const keys = new Set([...Object.keys(base), ...Object.keys(extra)])
  for (const key of keys) {
    const value = mergeConstraintValue(base[key], extra[key])
    if (value === null) { return null }
    if (value !== undefined) { merged[key] = value }
  }
  return merged
}

function expandDescriptorVariants(descriptors) {
  return descriptors.reduce((variants, descriptor) => {
    const options = isValueMetric(descriptor.metric)
      ? kingInclusiveValueSourceOptions(descriptor)
      : [{ resolvedTotal: descriptor.total, constraints: {} }]

    const nextVariants = []
    variants.forEach(variant => {
      options.forEach(option => {
        const constraints = mergeConstraints(variant.sourceConstraints, option.constraints)
        if (!constraints) { return }
        nextVariants.push({
          descriptors: [...variant.descriptors, { ...descriptor, resolvedTotal: option.resolvedTotal }],
          sourceConstraints: constraints
        })
      })
    })
    return nextVariants
  }, [{ descriptors: [], sourceConstraints: {} }])
}

export function expandRelationalPlanSources(plan) {
  if (!plan.comparisonDescriptors.some(descriptor => (
    isValueMetric(descriptor.metric) &&
    ![EXACT_NUMBER_COMPARISON_SOURCE, PRIOR_BOARD_COMPARISON_SOURCE].includes(descriptor.source)
  ))) {
    return [plan]
  }

  return expandDescriptorVariants(plan.comparisonDescriptors).map(variant => ({
    ...plan,
    comparisonDescriptors: variant.descriptors,
    sourceConstraints: variant.sourceConstraints,
    requirements: comparisonRequirementsFromDescriptors(variant.descriptors)
  }))
}

// ===== Combined plan helpers =====

function intersectMoveKinds(plans) {
  return plans.reduce(
    (kinds, plan) => kinds.filter(k => plan.moveKinds.includes(k)),
    [...ALL_MOVE_KINDS]
  )
}

function extractMovedPieceSpeciesPool(plans) {
  let pool = null
  for (const plan of plans) {
    let planPool = null
    if (plan.subject === 'moved_piece') { planPool = plan.subjectSpeciesPool }
    else if (plan.target === 'moved_piece') { planPool = plan.targetSpeciesPool }
    if (planPool === null) { continue }
    pool = pool === null ? [...planPool] : pool.filter(s => planPool.includes(s))
  }
  return pool // null means unconstrained
}

function positionRequirementsFromPlans(plans) {
  return plans
    .filter(plan => (
      plan.kind === 'position' &&
      plan.positionAxis === 'square' &&
      plan.positionComparator === 'equal_to' &&
      plan.subjectFilter !== 'any'
    ))
    .map(plan => ({
      square: plan.positionTarget,
      team: plan.subjectTeam,
      filter: plan.subjectFilter
    }))
}

// Chain-level contradiction detectors.
// Adding a new detector means appending to
// CONTRADICTION_DETECTORS — no other code changes.
// Discipline: detectors describe WHY the chain is impossible.
// only definitively impossible chains get specific messages here.

function detectIncompatibleMoveKinds({ moveKinds }) {
  if (moveKinds.length === 0) {
    return 'These conditions require incompatible move types and cannot all be true simultaneously.'
  }
  return null
}

function detectImpossibleMovedPieceSpecies({ movedPieceSpeciesPool }) {
  if (movedPieceSpeciesPool !== null && movedPieceSpeciesPool.length === 0) {
    return 'These conditions require the moved piece to be two incompatible species simultaneously.'
  }
  return null
}

function detectConflictingRequiredPositions({ plans }) {
  const posReqs = positionRequirementsFromPlans(plans)
  for (let i = 0; i < posReqs.length; i += 1) {
    for (let j = i + 1; j < posReqs.length; j += 1) {
      const a = posReqs[i]
      const b = posReqs[j]
      if (a.square === b.square && (a.team !== b.team || a.filter !== b.filter)) {
        return `Two conditions require different pieces on ${Board.gridCalculator(a.square)}.`
      }
    }
  }
  return null
}

function detectIllegalPawnRanks({ plans }) {
  for (const { square, filter } of positionRequirementsFromPlans(plans)) {
    if (filter === 'pawn') {
      const rank = Board.rankIndex(square)
      if (rank === 0 || rank === 7) {
        return `A condition requires a pawn on ${Board.gridCalculator(square)}, which is never a legal pawn position.`
      }
    }
  }
  return null
}

function detectSingularActorWithImpossibleCount({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'relational') { continue }
    const descriptors = plan.comparisonDescriptors ?? []
    for (const descriptor of descriptors) {
      if (descriptor.metric !== 'count') { continue }
      if (descriptor.source !== 'exact_number') { continue }
      const total = Number(descriptor.total ?? 0)
      const actor = descriptor.side === 'subject' ? plan.subject : plan.target
      if (!SINGULAR_ACTORS.has(actor)) { continue }
      if (total > 1) {
        return `A singular actor (${actor}) cannot have count ${total}; its count is at most 1.`
      }
    }
  }
  return null
}

function detectFilterMatchesNoSpecies({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'relational') { continue }
    const subjectDescriptors = plan.comparisonDescriptors.filter(d => d.side === 'subject')
    const targetDescriptors  = plan.comparisonDescriptors.filter(d => d.side === 'target')
    if (plan.subjectSpeciesPool.length === 0
        && plan.requirements.subject !== 0
        && !valueComparisonAllowsEmpty(subjectDescriptors)) {
      return `The '${plan.subjectFilter}' filter matches no pieces with the required value; this condition can never be satisfied.`
    }
    if (plan.targetSpeciesPool.length === 0
        && plan.requirements.target !== 0
        && !valueComparisonAllowsEmpty(targetDescriptors)) {
      return `The '${plan.targetFilter}' filter matches no pieces with the required value; this condition can never be satisfied.`
    }
  }
  return null
}

const ALL_RELATIVE_RANKS = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7])
const ILLEGAL_PAWN_RANKS = Object.freeze(new Set([0, 7]))

function rankSatisfiesComparator(rank, comparator, target) {
  switch (comparator) {
    case 'equal_to':                 return rank === target
    case 'greater_than':             return rank > target
    case 'greater_than_or_equal_to': return rank >= target
    case 'less_than':                return rank < target
    case 'less_than_or_equal_to':    return rank <= target
    default:                         return false
  }
}

function detectImpossiblePawnPosition({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'position') { continue }
    if (plan.subjectFilter !== 'pawn') { continue }
    if (plan.positionAxis !== 'rank') { continue }
    const matching = ALL_RELATIVE_RANKS.filter(r =>
      rankSatisfiesComparator(r, plan.positionComparator, plan.positionTarget)
    )
    // Empty matching set is a different impossibility (out-of-range comparator/target);
    // leave that for upstream/other detectors. We fire only when the satisfying ranks
    // exist but every one of them is a pawn-illegal rank.
    if (matching.length === 0) { continue }
    if (matching.every(r => ILLEGAL_PAWN_RANKS.has(r))) {
      const ranksText = matching.map(r => r + 1).join(' or ')
      return `Pawns cannot be on rank ${ranksText} relative to the moving team; this condition can never be satisfied.`
    }
  }
  return null
}

function detectSingularActorWithAggregateValue({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'relational') { continue }
    const descriptors = plan.comparisonDescriptors ?? []
    for (const descriptor of descriptors) {
      if (descriptor.metric !== 'aggregate_value') { continue }
      const actor = descriptor.side === 'subject' ? plan.subject : plan.target
      if (SINGULAR_ACTORS.has(actor)) {
        return `Aggregate value cannot be combined with a singular actor (${actor}); use individual_value instead.`
      }
    }
  }
  return null
}

function detectSingularActorWithImpossibleUnaryCount({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'unary') { continue }
    if (!SINGULAR_ACTORS.has(plan.subject)) { continue }
    if (plan.operator !== 'count') { continue }
    if (plan.target !== 'exact_number') { continue }
    const total = Number(plan.targetTotal ?? 0)
    const requiresMoreThanOne =
      (plan.comparator === 'equal_to' && total > 1) ||
      (plan.comparator === 'greater_than' && total >= 1) ||
      (plan.comparator === 'greater_than_or_equal_to' && total > 1)
    if (requiresMoreThanOne) {
      return `A singular actor (${plan.subject}) cannot have count > 1; its count is at most 1.`
    }
  }
  return null
}

function detectMovedPieceWithCountZero({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'unary') { continue }
    if (plan.subject !== 'moved_piece') { continue }
    if (plan.operator !== 'count') { continue }
    if (plan.target !== 'exact_number') { continue }
    const total = Number(plan.targetTotal ?? 0)
    const requiresZero =
      (plan.comparator === 'equal_to' && total === 0) ||
      (plan.comparator === 'less_than' && total <= 1) ||
      (plan.comparator === 'less_than_or_equal_to' && total === 0)
    if (requiresZero) {
      return 'moved_piece must exist (a move occurred), but a condition requires its count to be zero.'
    }
  }
  return null
}

const CONTRADICTION_DETECTORS = [
  detectIncompatibleMoveKinds,
  detectImpossibleMovedPieceSpecies,
  detectConflictingRequiredPositions,
  detectIllegalPawnRanks,
  detectImpossiblePawnPosition,
  detectSingularActorWithImpossibleCount,
  detectSingularActorWithImpossibleUnaryCount,
  detectMovedPieceWithCountZero,
  detectFilterMatchesNoSpecies
]

function detectContradiction(context) {
  for (const detector of CONTRADICTION_DETECTORS) {
    const reason = detector(context)
    if (reason) { return reason }
  }
  return null
}

function extractRequiredPositions(plans) {
  const positions = new Map()
  for (const { square, team, filter } of positionRequirementsFromPlans(plans)) {
    positions.set(square, { team, filter })
  }
  return positions
}

// ===== buildCombinedPlan =====

export function buildCombinedPlan(payloads, options = {}) {
  if (!payloads || payloads.length === 0) {
    return { status: 'unsupported', reason: 'No conditions provided.' }
  }

  const movingTeam = options.movingTeam || Board.WHITE
  const enemyTeam = Board.opposingTeam(movingTeam)
  const plans = []

  for (const payload of payloads) {
    const plan = buildPlan(payload, { ...options, movingTeam })
    if (plan.status !== 'supported') { return plan }
    plans.push(plan)
  }

  const moveKinds = intersectMoveKinds(plans)
  const movedPieceSpeciesPool = extractMovedPieceSpeciesPool(plans)

  const contradiction = detectContradiction({ plans, moveKinds, movedPieceSpeciesPool })
  if (contradiction) {
    return { status: 'contradictory', reason: contradiction }
  }

  return {
    status: 'supported',
    reason: null,
    plans,
    moveKinds,
    movingTeam,
    enemyTeam,
    evaluationPayloads: payloads,
    requiredPositions: extractRequiredPositions(plans),
    movedPieceSpeciesPool
  }
}
