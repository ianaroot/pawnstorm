import Board from 'gameplay/board'
import { materialValue } from 'gameplay/board_query_utils'
import { MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT, candidateSpecies } from 'editorV2/panels/condition_preview/shared/example_utils'
import { SINGULAR_ACTORS } from 'bot_execution/actors'
import { actorTeam } from 'bot_execution/actor_teams'
import {
  buildExampleVariantPlan, sideSpeciesPool, relationParams
} from 'editorV2/panels/condition_preview/shared/relational_utils'
import {
  COUNT_COMPARISON_METRIC, INDIVIDUAL_VALUE_METRIC, AGGREGATE_VALUE_METRIC, isValueMetric,
  EXACT_NUMBER_COMPARISON_SOURCE, PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonDescriptors, comparisonRequirements
} from 'editorV2/panels/condition_preview/plans/comparison_requirements'

const SUPPORTED_UNARY_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece', 'captured_piece', 'enemy_captured_piece'])
const SUPPORTED_UNARY_OPERATORS = new Set(['count', 'value', 'mobility'])
const SUPPORTED_UNARY_TARGETS = new Set(['exact_number', 'allied', 'enemy', 'moved_piece', 'enemy_moved_piece', 'captured_piece', 'enemy_captured_piece', 'prior_board_state'])

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

function actorLabel(actor) {
  return FILTER_LABELS[actor] || actor
}

function buildRelationalPlan(payload, options = {}, teams = {}) {
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

  const { movingTeam, enemyTeam } = teams

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
    subjectTeam: actorTeam(payload.subject, movingTeam),
    targetTeam: actorTeam(payload.target, movingTeam),
    movingTeam,
    enemyTeam,
    moveKinds: options.moveKinds || [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT],
    relationParams: relationParams(payload)
  }
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

const SUPPORTED_POSITION_SUBJECTS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'])
const SUPPORTED_POSITION_AXES = new Set(['rank', 'file', 'square'])

function buildCensusPlan(payload, options = {}, teams = {}) {
  const hasRegion = payload.positionAxis !== undefined && payload.positionAxis !== null
  const supportedSubjects = hasRegion ? SUPPORTED_POSITION_SUBJECTS : SUPPORTED_UNARY_ACTORS
  if (!supportedSubjects.has(payload.subject)) {
    return { status: 'unsupported', reason: `${payload.subject} census previews are not supported yet.` }
  }
  if (!SUPPORTED_UNARY_OPERATORS.has(payload.operator)) {
    return { status: 'unsupported', reason: `${payload.operator} census previews are not supported yet.` }
  }
  if (!SUPPORTED_UNARY_TARGETS.has(payload.target)) {
    return { status: 'unsupported', reason: `${payload.target} census target previews are not supported yet.` }
  }
  if (hasRegion && !SUPPORTED_POSITION_AXES.has(payload.positionAxis)) {
    return { status: 'unsupported', reason: `${payload.positionAxis} census axis is not supported yet.` }
  }

  const { movingTeam, enemyTeam } = teams
  const subjectTeam = actorTeam(payload.subject, movingTeam)
  const targetIsActor = payload.target !== EXACT_NUMBER_COMPARISON_SOURCE && payload.target !== PRIOR_BOARD_COMPARISON_SOURCE
  const targetTeam = targetIsActor ? actorTeam(payload.target, movingTeam) : null

  const baseSubjectPool = candidateSpecies(payload.subjectFilter || 'any', payload.subjectFilterMode || null)
  const subjectSpeciesPool = (SINGULAR_ACTORS.has(payload.subject) && payload.operator === 'value' && payload.target === EXACT_NUMBER_COMPARISON_SOURCE)
    ? singularActorValuePool(baseSubjectPool, payload.comparator, payload.targetTotal ?? 0)
    : baseSubjectPool

  return {
    status: 'supported',
    reason: null,
    kind: 'census',
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
    positionAxis: hasRegion ? payload.positionAxis : null,
    positionComparator: hasRegion ? payload.positionComparator : null,
    positionTarget: hasRegion ? payload.positionTarget : null,
    subjectSpeciesPool,
    targetSpeciesPool: targetIsActor ? candidateSpecies(payload.targetFilter || 'any', payload.targetFilterMode || null) : [],
    subjectTeam,
    targetTeam,
    movingTeam,
    enemyTeam,
    moveKinds: [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT]
  }
}

export function buildPlan(payload, options = {}) {
  if (!payload?.kind) {
    return { status: 'unsupported', reason: 'Condition preview is not available for this condition yet.' }
  }

  const movingTeam = options.movingTeam || Board.WHITE
  const enemyTeam = Board.opposingTeam(movingTeam)
  const teams = { movingTeam, enemyTeam }

  if (payload.kind === 'relational') { return buildRelationalPlan(payload, options, teams) }
  if (payload.kind === 'census') { return buildCensusPlan(payload, options, teams) }
  if (payload.kind === 'identity') {
    // Verification still runs the identity payload — CandidateVerifier reads
    // evaluationPayloads, not this plan. The subject filter flows through to
    // narrow the captured piece's species pool; the target stays unfiltered.
    return buildRelationalPlan(
      { ...payload, kind: 'relational', operator: 'same_piece', targetFilter: 'any', targetFilterMode: null },
      options,
      teams
    )
  }
  return { status: 'unsupported', reason: `${payload.kind} previews are not supported yet.` }
}
