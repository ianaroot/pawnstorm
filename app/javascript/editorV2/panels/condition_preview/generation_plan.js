import Board from 'gameplay/board'
import { MOVE_KIND_STANDARD, MOVE_KIND_CASTLE } from 'editorV2/panels/condition_preview/example_utils'
import {
  teamForActor, buildExampleVariantPlan, sideSpeciesPool, relationParams
} from 'editorV2/panels/condition_preview/relational_utils'
import {
  COUNT_COMPARISON_METRIC, VALUE_COMPARISON_METRIC, EXACT_NUMBER_COMPARISON_SOURCE, PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonDescriptors, comparisonRequirements
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
    if (descriptor.source === PRIOR_BOARD_COMPARISON_SOURCE) {
      return { status: 'unsupported', reason: 'Prior-board relational comparisons are not supported yet.' }
    }
    if (![COUNT_COMPARISON_METRIC, VALUE_COMPARISON_METRIC].includes(descriptor.metric)) {
      return { status: 'unsupported', reason: `${descriptor.metric} relational comparisons are not supported yet.` }
    }
    if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) {
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
