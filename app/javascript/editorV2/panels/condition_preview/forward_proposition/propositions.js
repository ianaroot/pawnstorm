import { materialValue } from 'gameplay/board_query_utils'
import { compareValues } from 'bot_execution/utils'
import { candidateSpecies } from 'editorV2/panels/condition_preview/shared/example_utils'
import { qualifyingSquares } from 'editorV2/panels/condition_preview/shared/unary_position_collection'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

const SINGULAR_ACTORS = new Set(['moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'])

const OPERATOR_TO_RANGE_KEY = Object.freeze({
  count:    'count_range',
  value:    'aggregate_value_range',
  mobility: 'aggregate_mobility_range'
})

function metricForOperator(operator, subject) {
  if (operator === 'count') { return 'count' }
  const isSingular = SINGULAR_ACTORS.has(subject)
  if (operator === 'value')    { return isSingular ? 'individual_value' : 'aggregate_value' }
  if (operator === 'mobility') { return 'aggregate_mobility' }
  return null
}

const COMPARATOR_TO_DIRECTION = Object.freeze({
  greater_than: '+',
  less_than:    '-',
  equal_to:     '='
})

export function emitConstraintsFromPlan(plan) {
  if (plan.kind === 'relational') {
    return constraintsFromRelationalPlan(plan)
  }
  if (plan.target === 'prior_board_state') {
    return constraintsFromPbsUnaryOrPositionPlan(plan)
  }
  return { propositions: [propositionFromUnaryOrPositionPlan(plan)], relations: [], crossFrame: [] }
}

function constraintsFromPbsUnaryOrPositionPlan(plan) {
  const sideShape = {
    team: plan.subjectTeam,
    species_set: new Set(candidateSpecies(plan.subjectFilter, plan.subjectFilterMode)),
    region: regionFromPlan(plan)
  }
  const priorProp   = { ...sideShape, frame: 'prior',   ...freshRanges() }
  const currentProp = { ...sideShape, frame: 'current', ...freshRanges() }
  return {
    propositions: [priorProp, currentProp],
    relations: [],
    crossFrame: [{
      metric: metricForOperator(plan.operator, plan.subject),
      direction: COMPARATOR_TO_DIRECTION[plan.comparator] ?? '=',
      priorProposition: priorProp,
      currentProposition: currentProp
    }]
  }
}

function propositionFromUnaryOrPositionPlan(plan) {
  const rangeKey = OPERATOR_TO_RANGE_KEY[plan.operator]
  const ranges = freshRanges()
  if (rangeKey) {
    ranges[rangeKey] = rangeFromComparator(plan.comparator, plan.targetTotal)
  }
  return {
    team: plan.subjectTeam,
    frame: 'current',
    species_set: new Set(candidateSpecies(plan.subjectFilter, plan.subjectFilterMode)),
    region: regionFromPlan(plan),
    ...ranges
  }
}

function constraintsFromRelationalPlan(plan) {
  const subjectIsSingular = SINGULAR_ACTORS.has(plan.subject)
  const targetIsSingular = SINGULAR_ACTORS.has(plan.target)

  if (!subjectIsSingular && !targetIsSingular) {
    return { propositions: [], relations: [buildRelation(plan)], crossFrame: [] }
  }

  const propositions = []
  const crossFrame = []
  for (const side of ['subject', 'target']) {
    const sideIsSingular = side === 'subject' ? subjectIsSingular : targetIsSingular
    if (sideIsSingular) { continue }
    const otherIsSingular = side === 'subject' ? targetIsSingular : subjectIsSingular
    const pbsDescriptor = (plan.comparisonDescriptors ?? []).find(
      d => d.side === side && d.source === 'prior_board_state'
    )
    if (pbsDescriptor) {
      const { priorProp, currentProp, crossEntry } = buildPbsPair(plan, side, otherIsSingular, pbsDescriptor)
      propositions.push(priorProp, currentProp)
      crossFrame.push(crossEntry)
    } else {
      propositions.push(buildRelationalSideProposition(plan, side, otherIsSingular))
    }
  }
  return { propositions, relations: [], crossFrame }
}

function buildPbsPair(plan, side, otherIsSingular, descriptor) {
  const sideShape = relationalSideShape(plan, side, otherIsSingular)
  const priorProp   = { ...sideShape, frame: 'prior',   ...freshRanges() }
  const currentProp = { ...sideShape, frame: 'current', ...freshRanges() }
  return {
    priorProp,
    currentProp,
    crossEntry: {
      metric: descriptor.metric,
      direction: COMPARATOR_TO_DIRECTION[descriptor.comparator] ?? '=',
      priorProposition: priorProp,
      currentProposition: currentProp
    }
  }
}

function buildRelation(plan) {
  return {
    operator: plan.operator,
    subjectSide: buildRelationSide(plan, 'subject'),
    targetSide: buildRelationSide(plan, 'target'),
    sourcePlan: plan
  }
}

function buildRelationSide(plan, side) {
  return {
    team: side === 'subject' ? plan.subjectTeam : plan.targetTeam,
    species_set: speciesSetForRelationalSide(plan, side),
    region: { kind: 'all' },
    ...rangesForRelationalSide(plan, side)
  }
}

function buildRelationalSideProposition(plan, side, otherIsSingular) {
  return {
    ...relationalSideShape(plan, side, otherIsSingular),
    frame: 'current',
    ...rangesForRelationalSide(plan, side)
  }
}

function relationalSideShape(plan, side, otherIsSingular) {
  const team = side === 'subject' ? plan.subjectTeam : plan.targetTeam
  const otherActor = side === 'subject' ? plan.target : plan.subject
  return {
    team,
    species_set: speciesSetForRelationalSide(plan, side),
    region: otherIsSingular
      ? { kind: 'related-to', actor: otherActor, role: side === 'subject' ? 'target' : 'subject', operator: plan.operator }
      : { kind: 'all' }
  }
}

function speciesSetForRelationalSide(plan, side) {
  const filter = side === 'subject' ? plan.subjectFilter : plan.targetFilter
  const filterMode = side === 'subject' ? plan.subjectFilterMode : plan.targetFilterMode
  let speciesSet = new Set(candidateSpecies(filter, filterMode))
  for (const d of plan.comparisonDescriptors ?? []) {
    if (d.side !== side) { continue }
    if (d.metric !== 'individual_value') { continue }
    if (d.source !== 'exact_number') { continue }
    const total = Number(d.resolvedTotal ?? d.total ?? 0)
    speciesSet = new Set([...speciesSet].filter(s => compareValues(materialValue(s), d.comparator, total)))
  }
  return speciesSet
}

function rangesForRelationalSide(plan, side) {
  const ranges = freshRanges()
  ranges.count_range = { min: 1, max: Infinity }
  for (const d of plan.comparisonDescriptors ?? []) {
    if (d.side !== side) { continue }
    if (d.source !== 'exact_number') { continue }
    const total = Number(d.resolvedTotal ?? d.total ?? 0)
    const range = rangeFromComparator(d.comparator, total)
    if (d.metric === 'count')                  { ranges.count_range = range }
    else if (d.metric === 'aggregate_value')   { ranges.aggregate_value_range = range }
  }
  return ranges
}

function freshRanges() {
  return {
    count_range:              { ...PERMISSIVE },
    aggregate_value_range:    { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE }
  }
}

function regionFromPlan(plan) {
  if (plan.kind === 'position') {
    return {
      kind: 'set',
      squares: new Set(qualifyingSquares(plan.positionAxis, plan.positionComparator, plan.positionTarget, plan.subjectTeam))
    }
  }
  return { kind: 'all' }
}

function rangeFromComparator(comparator, total) {
  switch (comparator) {
    case 'greater_than_or_equal_to': return { min: total, max: Infinity }
    case 'greater_than':             return { min: total + 1, max: Infinity }
    case 'equal_to':                 return { min: total, max: total }
    case 'less_than':                return { min: 0, max: total - 1 }
    case 'less_than_or_equal_to':    return { min: 0, max: total }
  }
  return { min: 0, max: Infinity }
}
