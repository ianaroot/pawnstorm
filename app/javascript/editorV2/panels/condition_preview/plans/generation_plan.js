import Board from 'gameplay/board'
import { materialValue } from 'gameplay/board_query_utils'
import { MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT, candidateSpecies, SINGULAR_ACTORS } from 'editorV2/panels/condition_preview/shared/example_utils'
import {
  relationalTeamForActor, buildExampleVariantPlan, sideSpeciesPool, relationParams
} from 'editorV2/panels/condition_preview/shared/relational_utils'
import {
  COUNT_COMPARISON_METRIC, VALUE_COMPARISON_METRIC, INDIVIDUAL_VALUE_METRIC, AGGREGATE_VALUE_METRIC, isValueMetric,
  EXACT_NUMBER_COMPARISON_SOURCE, PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonDescriptors, comparisonRequirements, comparisonRequirementsFromDescriptors
} from 'editorV2/panels/condition_preview/plans/comparison_requirements'

const SUPPORTED_UNARY_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece', 'captured_piece', 'enemy_captured_piece'])
const SUPPORTED_UNARY_OPERATORS = new Set(['count', 'value', 'mobility'])
const SUPPORTED_UNARY_TARGETS = new Set(['exact_number', 'allied', 'enemy', 'moved_piece', 'enemy_moved_piece', 'captured_piece', 'enemy_captured_piece', 'prior_board_state'])

function unaryTeamForActor(actor, movingTeam) {
  const enemyTeam = movingTeam === Board.WHITE ? Board.BLACK : Board.WHITE
  switch (actor) {
    case 'allied':
    case 'moved_piece':
    case 'captured_piece':
      return movingTeam
    case 'enemy':
    case 'enemy_moved_piece':
    case 'enemy_captured_piece':
      return enemyTeam
    default:
      return movingTeam
  }
}

function valueFilteredSpeciesPool(pool, descriptors, side) {
  const descriptor = descriptors.find(d => d.side === side)
  if (!descriptor) { return pool }
  if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) { return pool }
  const total = Number(descriptor.total || 0)

  if (descriptor.metric === INDIVIDUAL_VALUE_METRIC) {
    switch (descriptor.comparator) {
      case 'equal_to':               return pool.filter(s => materialValue(s) === total)
      case 'less_than':              return pool.filter(s => materialValue(s) < total)
      case 'less_than_or_equal_to':  return pool.filter(s => materialValue(s) <= total)
      case 'greater_than':           return pool.filter(s => materialValue(s) > total)
      case 'greater_than_or_equal_to': return pool.filter(s => materialValue(s) >= total)
      default:                       return pool
    }
  }

  if (descriptor.metric === AGGREGATE_VALUE_METRIC) {
    switch (descriptor.comparator) {
      case 'less_than':              return pool.filter(s => materialValue(s) < total)
      case 'less_than_or_equal_to':  return pool.filter(s => materialValue(s) <= total)
      default:                       return pool
    }
  }

  // legacy 'value' metric
  switch (descriptor.comparator) {
    case 'less_than':              return pool.filter(s => materialValue(s) < total)
    case 'less_than_or_equal_to':  return pool.filter(s => materialValue(s) <= total)
    default:                       return pool
  }
}

const SUPPORTED_RELATIONAL_OPERATORS = new Set(['attack', 'defend', 'adjacent', 'shield', 'same_piece'])
const SUPPORTED_RELATIONAL_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece', 'captured_piece'])
const FILTER_LABELS = Object.freeze({
  allied: 'Allied',
  enemy: 'Enemy',
  moved_piece: 'Moved piece',
  enemy_moved_piece: 'Enemy moved piece',
  captured_piece: 'Captured piece',
  enemy_captured_piece: 'Enemy captured piece'
})

const NON_KING_VALUE_SPECIES = Object.freeze(new Map([
  [0, []],
  [1, [Board.PAWN]],
  [3, [Board.NIGHT, Board.BISHOP]],
  [5, [Board.ROOK]],
  [9, [Board.QUEEN]]
]))

function actorLabel(actor) {
  return FILTER_LABELS[actor] || actor
}

export function buildRelationalPlan(payload, options = {}) {
  if (!payload?.kind) {
    return { status: 'unsupported', reason: 'Condition preview is not available for this condition yet.' }
  }
  if (payload.kind !== 'relational') {
    return { status: 'unsupported', reason: 'Unary previews are not supported yet.' }
  }
  if (payload.operator === 'cover') {
    return { status: 'unsupported', reason: 'Cover previews are not supported yet.' }
  }
  if (!SUPPORTED_RELATIONAL_OPERATORS.has(payload.operator)) {
    return { status: 'unsupported', reason: `${payload.operator} previews are not supported yet.` }
  }
  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.subject)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.subject)} previews are not supported yet.` }
  }
  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.target)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.target)} previews are not supported yet.` }
  }

  const comparisons = comparisonDescriptors(payload)
  for (let index = 0; index < comparisons.length; index += 1) {
    const descriptor = comparisons[index]
    if (descriptor.source === PRIOR_BOARD_COMPARISON_SOURCE && ![
      COUNT_COMPARISON_METRIC,
      INDIVIDUAL_VALUE_METRIC,
      AGGREGATE_VALUE_METRIC
    ].includes(descriptor.metric)) {
      return { status: 'unsupported', reason: 'Prior-board relational comparisons are not supported yet.' }
    }
    if (![COUNT_COMPARISON_METRIC, INDIVIDUAL_VALUE_METRIC, AGGREGATE_VALUE_METRIC].includes(descriptor.metric)) {
      return { status: 'unsupported', reason: `${descriptor.metric} relational comparisons are not supported yet.` }
    }
    if (descriptor.metric === COUNT_COMPARISON_METRIC && ![
      EXACT_NUMBER_COMPARISON_SOURCE,
      PRIOR_BOARD_COMPARISON_SOURCE
    ].includes(descriptor.source)) {
      return { status: 'unsupported', reason: 'This relational comparison source is not supported yet.' }
    }
    if (isValueMetric(descriptor.metric) && ![
      EXACT_NUMBER_COMPARISON_SOURCE,
      PRIOR_BOARD_COMPARISON_SOURCE,
      'moved_piece',
      'captured_piece',
      'enemy_moved_piece',
      'enemy_captured_piece'
    ].includes(descriptor.source)) {
      return { status: 'unsupported', reason: 'This relational comparison source is not supported yet.' }
    }
  }

  return {
    status: 'supported',
    reason: null,
    kind: 'relational',
    evaluationPayload: payload,
    operator: payload.operator,
    subject: payload.subject,
    target: payload.target,
    subjectFilter: payload.subjectFilter || 'any',
    targetFilter: payload.targetFilter || 'any',
    subjectFilterMode: payload.subjectFilterMode || null,
    targetFilterMode: payload.targetFilterMode || null,
    comparisonDescriptors: comparisons,
    requirements: comparisonRequirements(payload),
    sourceConstraints: {},
    variants: buildExampleVariantPlan(payload),
    subjectSpeciesPool: valueFilteredSpeciesPool(sideSpeciesPool(payload, 'subject'), comparisons, 'subject'),
    targetSpeciesPool: valueFilteredSpeciesPool(sideSpeciesPool(payload, 'target'), comparisons, 'target'),
    subjectTeam: relationalTeamForActor(payload.subject),
    targetTeam: relationalTeamForActor(payload.target),
    movingTeam: options.movingTeam || Board.WHITE,
    moveKinds: options.moveKinds || [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT],
    relationParams: relationParams(payload)
  }
}

function valueSourceOptions(descriptor) {
  switch (descriptor.source) {
    case EXACT_NUMBER_COMPARISON_SOURCE:
      return [{
        resolvedTotal: Number(descriptor.total || 0),
        constraints: {}
      }]
    case 'moved_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({
          resolvedTotal: value,
          constraints: { movedPieceSpeciesPool: speciesPool }
        }))
    case 'captured_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({
        resolvedTotal: value,
        constraints: { capturedPieceSpeciesPool: speciesPool }
        }))
    case 'enemy_moved_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({
        resolvedTotal: value,
        constraints: { enemyMovedPieceSpeciesPool: speciesPool }
        }))
    case 'enemy_captured_piece':
      return Array.from(NON_KING_VALUE_SPECIES.entries())
        .filter(([value]) => value > 0)
        .map(([value, speciesPool]) => ({
        resolvedTotal: value,
        constraints: { enemyCapturedPieceSpeciesPool: speciesPool }
        }))
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
      ? valueSourceOptions(descriptor)
      : [{
        resolvedTotal: descriptor.total,
        constraints: {}
      }]

    const nextVariants = []
    variants.forEach(variant => {
      options.forEach(option => {
        const constraints = mergeConstraints(variant.sourceConstraints, option.constraints)
        if (!constraints) { return }
        nextVariants.push({
          descriptors: [
            ...variant.descriptors,
            {
              ...descriptor,
              resolvedTotal: option.resolvedTotal
            }
          ],
          sourceConstraints: constraints
        })
      })
    })
    return nextVariants
  }, [{
    descriptors: [],
    sourceConstraints: {}
  }])
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

function singularActorValuePool(pool, comparator, total) {
  switch (comparator) {
    case 'equal_to':                 return pool.filter(s => materialValue(s) === total)
    case 'less_than':                return pool.filter(s => materialValue(s) < total)
    case 'less_than_or_equal_to':    return pool.filter(s => materialValue(s) <= total)
    case 'greater_than':             return pool.filter(s => materialValue(s) > total)
    case 'greater_than_or_equal_to': return pool.filter(s => materialValue(s) >= total)
    default:                         return pool
  }
}

export function buildUnaryPlan(payload, options = {}) {
  if (!SUPPORTED_UNARY_ACTORS.has(payload.subject)) {
    return { status: 'unsupported', reason: `${payload.subject} unary previews are not supported yet.` }
  }
  if (!SUPPORTED_UNARY_OPERATORS.has(payload.operator)) {
    return { status: 'unsupported', reason: `${payload.operator} unary previews are not supported yet.` }
  }
  if (!SUPPORTED_UNARY_TARGETS.has(payload.target)) {
    return { status: 'unsupported', reason: `${payload.target} unary target previews are not supported yet.` }
  }

  const movingTeam = options.movingTeam || Board.WHITE
  const subjectTeam = unaryTeamForActor(payload.subject, movingTeam)
  const targetIsActor = payload.target !== EXACT_NUMBER_COMPARISON_SOURCE && payload.target !== PRIOR_BOARD_COMPARISON_SOURCE
  const targetTeam = targetIsActor ? unaryTeamForActor(payload.target, movingTeam) : null

  const baseSubjectPool = candidateSpecies(payload.subjectFilter || 'any', payload.subjectFilterMode || null)
  const subjectSpeciesPool = (SINGULAR_ACTORS.has(payload.subject) && payload.operator === 'value' && payload.target === EXACT_NUMBER_COMPARISON_SOURCE)
    ? singularActorValuePool(baseSubjectPool, payload.comparator, payload.targetTotal ?? 0)
    : baseSubjectPool

  return {
    status: 'supported',
    reason: null,
    kind: 'unary',
    evaluationPayload: payload,
    subject: payload.subject,
    subjectFilter: payload.subjectFilter || 'any',
    subjectFilterMode: payload.subjectFilterMode || null,
    operator: payload.operator,
    comparator: payload.comparator,
    target: payload.target,
    targetTotal: payload.target === EXACT_NUMBER_COMPARISON_SOURCE ? (payload.targetTotal ?? 0) : null,
    targetFilter: payload.targetFilter || 'any',
    targetFilterMode: payload.targetFilterMode || null,
    subjectSpeciesPool,
    targetSpeciesPool: targetIsActor ? candidateSpecies(payload.targetFilter || 'any', payload.targetFilterMode || null) : [],
    subjectTeam,
    targetTeam,
    movingTeam,
    moveKinds: [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT]
  }
}

const SUPPORTED_POSITION_SUBJECTS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'])
const SUPPORTED_POSITION_OPERATORS = new Set(['count', 'value', 'mobility'])
const SUPPORTED_POSITION_AXES = new Set(['rank', 'file', 'square'])

export function buildPositionPlan(payload, options = {}) {
  if (!SUPPORTED_POSITION_SUBJECTS.has(payload.subject)) {
    return { status: 'unsupported', reason: `${payload.subject} position previews are not supported yet.` }
  }
  if (!SUPPORTED_POSITION_OPERATORS.has(payload.operator)) {
    return { status: 'unsupported', reason: `${payload.operator} position previews are not supported yet.` }
  }
  if (!SUPPORTED_POSITION_AXES.has(payload.positionAxis)) {
    return { status: 'unsupported', reason: `${payload.positionAxis} position axis is not supported yet.` }
  }

  const movingTeam = options.movingTeam || Board.WHITE
  const subjectTeam = unaryTeamForActor(payload.subject, movingTeam)

  return {
    status: 'supported',
    reason: null,
    kind: 'position',
    evaluationPayload: payload,
    subject: payload.subject,
    subjectFilter: payload.subjectFilter || 'any',
    subjectFilterMode: payload.subjectFilterMode || null,
    // target is part of the polymorphic plan contract; position plans have no
    // target actor concept, so it's null. Readers comparing plan.target to an
    // actor name agnostically read false. Sub-fields (targetTeam, etc.) stay
    // kind-specific — only access after confirming plan.target is a real actor.
    target: null,
    positionAxis: payload.positionAxis,
    positionComparator: payload.positionComparator,
    positionTarget: payload.positionTarget,
    operator: payload.operator,
    comparator: payload.comparator,
    targetTotal: payload.targetTotal ?? 0,
    subjectSpeciesPool: candidateSpecies(payload.subjectFilter || 'any', payload.subjectFilterMode || null),
    subjectTeam,
    movingTeam,
    moveKinds: [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT]
  }
}

export function buildPlan(payload, options = {}) {
  if (!payload?.kind) {
    return { status: 'unsupported', reason: 'Condition preview is not available for this condition yet.' }
  }
  if (payload.kind === 'unary') { return buildUnaryPlan(payload, options) }
  if (payload.kind === 'relational') { return buildRelationalPlan(payload, options) }
  if (payload.kind === 'position') { return buildPositionPlan(payload, options) }
  return { status: 'unsupported', reason: `${payload.kind} previews are not supported yet.` }
}
