import Board from 'gameplay/board'
import { MOVE_KIND_STANDARD, MOVE_KIND_CASTLE } from 'editorV2/panels/condition_preview/example_utils'
import {
  teamForActor, buildExampleVariantPlan, sideSpeciesPool, relationParams
} from 'editorV2/panels/condition_preview/relational_utils'
import {
  COUNT_COMPARISON_METRIC, VALUE_COMPARISON_METRIC, EXACT_NUMBER_COMPARISON_SOURCE, PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonDescriptors, comparisonRequirements, comparisonRequirementsFromDescriptors
} from 'editorV2/panels/condition_preview/comparison_requirements'

const SUPPORTED_RELATIONAL_OPERATORS = new Set(['attack', 'defend', 'adjacent', 'shield'])
const SUPPORTED_RELATIONAL_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'])
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
      VALUE_COMPARISON_METRIC
    ].includes(descriptor.metric)) {
      return { status: 'unsupported', reason: 'Prior-board relational comparisons are not supported yet.' }
    }
    if (![COUNT_COMPARISON_METRIC, VALUE_COMPARISON_METRIC].includes(descriptor.metric)) {
      return { status: 'unsupported', reason: `${descriptor.metric} relational comparisons are not supported yet.` }
    }
    if (descriptor.metric === COUNT_COMPARISON_METRIC && ![
      EXACT_NUMBER_COMPARISON_SOURCE,
      PRIOR_BOARD_COMPARISON_SOURCE
    ].includes(descriptor.source)) {
      return { status: 'unsupported', reason: 'This relational comparison source is not supported yet.' }
    }
    if (descriptor.metric === VALUE_COMPARISON_METRIC && ![
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
    subjectSpeciesPool: sideSpeciesPool(payload, 'subject'),
    targetSpeciesPool: sideSpeciesPool(payload, 'target'),
    subjectTeam: teamForActor(payload.subject),
    targetTeam: teamForActor(payload.target),
    movingTeam: options.movingTeam || Board.WHITE,
    moveKinds: options.moveKinds || [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE],
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
    const options = descriptor.metric === VALUE_COMPARISON_METRIC
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
