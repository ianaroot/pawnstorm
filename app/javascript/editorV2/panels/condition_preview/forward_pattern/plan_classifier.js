import {
  COUNT_COMPARISON_METRIC,
  AGGREGATE_VALUE_METRIC,
  INDIVIDUAL_VALUE_METRIC,
  PRIOR_BOARD_COMPARISON_SOURCE
} from 'editorV2/panels/condition_preview/plans/comparison_requirements'

function directionFromComparator(comparator) {
  switch (comparator) {
    case 'greater_than':
    case 'greater_than_or_equal_to':
      return '+'
    case 'less_than':
    case 'less_than_or_equal_to':
      return '-'
    case 'equal_to':
      return '='
    default:
      return null
  }
}

function countMustBeZero(plan) {
  return plan.comparisonDescriptors?.some(d =>
    d.metric === COUNT_COMPARISON_METRIC &&
    d.source !== PRIOR_BOARD_COMPARISON_SOURCE &&
    Number(d.total ?? 0) === 0 &&
    (d.comparator === 'equal_to' || d.comparator === 'less_than')
  ) ?? false
}

export function classifyPlan(plan) {
  const classification = {
    plan,
    kind: plan.kind,
    pbsDirection: null,
    pbsSide: null,
    pbsMetric: null,
    isZeroRelation: false,
    requiresMover: false,
    requiresEnemyMover: false,
    requiresCapturedPiece: false,
    requiresEnemyCapturedPiece: false
  }

  if (plan.kind === 'relational') {
    if (plan.subject === 'moved_piece' || plan.target === 'moved_piece') {
      classification.requiresMover = true
    }
    if (plan.subject === 'enemy_moved_piece' || plan.target === 'enemy_moved_piece') {
      classification.requiresEnemyMover = true
    }
    const descriptors = plan.comparisonDescriptors ?? []
    for (const d of descriptors) {
      if (d.source === PRIOR_BOARD_COMPARISON_SOURCE) {
        classification.pbsDirection = directionFromComparator(d.comparator)
        classification.pbsSide = d.side
        classification.pbsMetric = d.metric
        break
      }
    }
    classification.isZeroRelation = countMustBeZero(plan)
  } else if (plan.kind === 'unary') {
    if (plan.subject === 'moved_piece') { classification.requiresMover = true }
    if (plan.subject === 'enemy_moved_piece') { classification.requiresEnemyMover = true }
    if (plan.subject === 'captured_piece') { classification.requiresCapturedPiece = true }
    if (plan.subject === 'enemy_captured_piece') { classification.requiresEnemyCapturedPiece = true }
    if (plan.target === 'prior_board_state') {
      classification.pbsDirection = directionFromComparator(plan.comparator)
      classification.pbsSide = 'subject'
      classification.pbsMetric = plan.operator
    }
  }

  return classification
}

