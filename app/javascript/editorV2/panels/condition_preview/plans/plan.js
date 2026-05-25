import Board from 'gameplay/board'
import { buildPlan } from 'editorV2/panels/condition_preview/plans/generation_plan'
import {
  MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/shared/example_utils'
import { SINGULAR_ACTORS } from 'bot_execution/actors'
import { valueComparisonAllowsEmpty } from 'editorV2/panels/condition_preview/plans/comparison_requirements'

const ALL_MOVE_KINDS = Object.freeze([MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT])

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
      plan.kind === 'census' &&
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

// Single-condition detectors, mirroring Ruby Nodes::ConditionSatisfiability
// (condition_satisfiability.rb) — keep in sync. Ruby also declines two cases the
// generator/form already handle: vacuous comparisons (e.g. singular count < 5) and negatives.

const BASE_PAWN_RANKS = Object.freeze([2, 3, 4, 5, 6, 7])
const PAWN_HOME_RANK = Object.freeze({ moved_piece: 2, enemy_moved_piece: 7 })
const ALL_RANKS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8])

function atMostOneSet(actor, filter, filterMode) {
  return SINGULAR_ACTORS.has(actor) || (filter === 'king' && filterMode !== 'exclude')
}

function requiresMoreThanOne(comparator, total) {
  return (comparator === 'equal_to' && total > 1) ||
    (comparator === 'greater_than' && total >= 1) ||
    (comparator === 'greater_than_or_equal_to' && total > 1)
}

function assertsZero(comparator, total) {
  return (comparator === 'equal_to' && total === 0) ||
    (comparator === 'less_than' && total === 1) ||
    (comparator === 'less_than_or_equal_to' && total === 0)
}

function rankComparatorMatches(comparator, rank, target) {
  switch (comparator) {
    case 'equal_to': return rank === target
    case 'greater_than': return rank > target
    case 'greater_than_or_equal_to': return rank >= target
    case 'less_than': return rank < target
    case 'less_than_or_equal_to': return rank <= target
    default: return false
  }
}

function legalPawnRanks(subject) {
  const home = PAWN_HOME_RANK[subject]
  return home ? BASE_PAWN_RANKS.filter(rank => rank !== home) : BASE_PAWN_RANKS
}

function admittedPawnRanks(plan) {
  if (plan.positionAxis === 'square') {
    return [Board.rankIndex(plan.positionTarget) + 1]
  }
  return ALL_RANKS.filter(rank => rankComparatorMatches(plan.positionComparator, rank, plan.positionTarget))
}

function measureComparisons(plan) {
  if (plan.kind === 'census') {
    if (plan.target !== 'exact_number') { return [] }
    return [{
      metric: plan.operator, comparator: plan.comparator, total: Number(plan.targetTotal ?? 0),
      actor: plan.subject, filter: plan.subjectFilter, filterMode: plan.subjectFilterMode
    }]
  }
  if (plan.kind === 'relational') {
    return (plan.comparisonDescriptors ?? [])
      .filter(descriptor => descriptor.source === 'exact_number')
      .map(descriptor => ({
        metric: descriptor.metric, comparator: descriptor.comparator, total: Number(descriptor.total ?? 0),
        actor: descriptor.side === 'subject' ? plan.subject : plan.target,
        filter: descriptor.side === 'subject' ? plan.subjectFilter : plan.targetFilter,
        filterMode: descriptor.side === 'subject' ? plan.subjectFilterMode : plan.targetFilterMode
      }))
  }
  return []
}

function detectComparisonBelowZero({ plans }) {
  for (const plan of plans) {
    for (const comparison of measureComparisons(plan)) {
      if (comparison.comparator === 'less_than' && comparison.total === 0) {
        return 'Count, mobility, and value are never below 0; this condition can never be satisfied.'
      }
    }
  }
  return null
}

function detectImpossibleSingularCount({ plans }) {
  for (const plan of plans) {
    for (const comparison of measureComparisons(plan)) {
      if (comparison.metric === 'count'
          && atMostOneSet(comparison.actor, comparison.filter, comparison.filterMode)
          && requiresMoreThanOne(comparison.comparator, comparison.total)) {
        return 'This piece can appear at most once, so its count cannot exceed 1; this condition can never be satisfied.'
      }
    }
  }
  return null
}

function detectImpossiblePawnRank({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'census') { continue }
    if (plan.subjectFilter !== 'pawn' || plan.subjectFilterMode === 'exclude') { continue }
    if (plan.positionAxis !== 'rank' && plan.positionAxis !== 'square') { continue }
    const admitted = admittedPawnRanks(plan)
    if (admitted.length === 0) { continue }
    if (admitted.every(rank => !BASE_PAWN_RANKS.includes(rank))) {
      return 'Pawns can never be on rank 1 or 8; this condition can never be satisfied.'
    }
    if (admitted.every(rank => !legalPawnRanks(plan.subject).includes(rank))) {
      return 'A pawn that just moved cannot still be on its starting rank; this condition can never be satisfied.'
    }
  }
  return null
}

function detectAlliedFullyImmobile({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'census') { continue }
    if (plan.operator !== 'mobility') { continue }
    if (plan.subject !== 'allied' || plan.subjectFilter !== 'any') { continue }
    if (plan.positionAxis != null) { continue }
    if (plan.target !== 'exact_number') { continue }
    if (assertsZero(plan.comparator, Number(plan.targetTotal ?? 0))) {
      return 'The moving team always has a legal move, so allied mobility cannot be 0; this condition can never be satisfied.'
    }
  }
  return null
}

function detectCountExceedsPriorBoard({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'census') { continue }
    if (plan.operator !== 'count') { continue }
    if (plan.subjectFilter !== 'any') { continue }
    if (plan.positionAxis != null) { continue }
    if (plan.comparator !== 'greater_than') { continue }
    if (plan.target !== 'prior_board_state') { continue }
    return 'A team never gains pieces during a turn, so its count cannot exceed the prior board state; this condition can never be satisfied.'
  }
  return null
}

function detectMovedPieceMustExist({ plans }) {
  for (const plan of plans) {
    if (plan.kind !== 'census') { continue }
    if (plan.subject !== 'moved_piece' || plan.subjectFilter !== 'any') { continue }
    if (plan.operator !== 'count') { continue }
    if (plan.positionAxis != null) { continue }
    if (plan.target !== 'exact_number') { continue }
    if (assertsZero(plan.comparator, Number(plan.targetTotal ?? 0))) {
      return 'The moved piece must exist (a move occurred); this condition can never be satisfied.'
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

const CONTRADICTION_DETECTORS = [
  detectComparisonBelowZero,
  detectImpossibleSingularCount,
  detectImpossiblePawnRank,
  detectAlliedFullyImmobile,
  detectCountExceedsPriorBoard,
  detectMovedPieceMustExist,
  detectIncompatibleMoveKinds,
  detectImpossibleMovedPieceSpecies,
  detectConflictingRequiredPositions,
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
