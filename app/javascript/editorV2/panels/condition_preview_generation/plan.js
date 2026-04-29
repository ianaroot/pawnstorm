import Board from 'gameplay/board'
import { buildPlan } from 'editorV2/panels/condition_preview/generation_plan'
import {
  MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/example_utils'
import {
  VALUE_COMPARISON_METRIC,
  EXACT_NUMBER_COMPARISON_SOURCE,
  PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonRequirementsFromDescriptors
} from 'editorV2/panels/condition_preview/comparison_requirements'

const ALL_MOVE_KINDS = Object.freeze([MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT])

// ===== expandRelationalPlanSources =====
// Moved here from generation_plan.js. Fans a relational plan with variable-value
// comparison sources into one concrete sub-plan per possible piece value.

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
    const options = descriptor.metric === VALUE_COMPARISON_METRIC
      ? valueSourceOptions(descriptor)
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
    descriptor.metric === VALUE_COMPARISON_METRIC &&
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
    if (plan.kind === 'relational') {
      if (plan.subject === 'moved_piece') { planPool = plan.subjectSpeciesPool }
      else if (plan.target === 'moved_piece') { planPool = plan.targetSpeciesPool }
    } else if (plan.kind === 'unary') {
      if (plan.subject === 'moved_piece') { planPool = plan.subjectSpeciesPool }
    }
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

function detectContradiction({ plans, moveKinds, movedPieceSpeciesPool }) {
  if (moveKinds.length === 0) {
    return 'These conditions require incompatible move types and cannot all be true simultaneously.'
  }

  if (movedPieceSpeciesPool !== null && movedPieceSpeciesPool.length === 0) {
    return 'These conditions require the moved piece to be two incompatible species simultaneously.'
  }

  const posReqs = positionRequirementsFromPlans(plans)

  for (let i = 0; i < posReqs.length; i++) {
    for (let j = i + 1; j < posReqs.length; j++) {
      const a = posReqs[i]
      const b = posReqs[j]
      if (a.square === b.square && (a.team !== b.team || a.filter !== b.filter)) {
        return `Two conditions require different pieces on ${Board.gridCalculator(a.square)}.`
      }
    }
  }

  for (const { square, filter } of posReqs) {
    if (filter === 'pawn') {
      const rank = Board.rankIndex(square)
      if (rank === 0 || rank === 7) {
        return `A condition requires a pawn on ${Board.gridCalculator(square)}, which is never a legal pawn position.`
      }
    }
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
    evaluationPayloads: payloads,
    requiredPositions: extractRequiredPositions(plans),
    movedPieceSpeciesPool
  }
}
