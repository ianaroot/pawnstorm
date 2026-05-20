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
    region: regionFromPlan(plan),
    boundSingularActor: SINGULAR_ACTORS.has(plan.subject) ? plan.subject : null
  }
  const priorProp   = { ...sideShape, frame: 'prior',   ...freshRanges() }
  const currentProp = { ...sideShape, frame: 'current', ...freshRanges() }
  return {
    propositions: [priorProp, currentProp],
    relations: [],
    crossFrame: [{
      source: plan.kind,
      operator: plan.operator,
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
    const range = rangeFromComparator(plan.comparator, plan.targetTotal)
    ranges[rangeKey] = SINGULAR_ACTORS.has(plan.subject)
      ? { min: range.min, max: Infinity }
      : range
  }
  return {
    team: plan.subjectTeam,
    frame: 'current',
    species_set: new Set(candidateSpecies(plan.subjectFilter, plan.subjectFilterMode)),
    region: regionFromPlan(plan),
    boundSingularActor: SINGULAR_ACTORS.has(plan.subject) ? plan.subject : null,
    ...ranges
  }
}

function constraintsFromRelationalPlan(plan) {
  const subjectIsSingular = SINGULAR_ACTORS.has(plan.subject)
  const targetIsSingular = SINGULAR_ACTORS.has(plan.target)

  // Shield always emits a relation (the third-piece slider attacker is placed
  // by satisfyShield). Shield also emits PBS crossFrame entries when applicable.
  if (plan.operator === 'shield') {
    return constraintsFromShieldPlan(plan, subjectIsSingular, targetIsSingular)
  }

  if (!subjectIsSingular && !targetIsSingular) {
    return constraintsFromNonBoundRelationalPlan(plan)
  }

  return constraintsFromBoundRelationalPlan(plan, subjectIsSingular, targetIsSingular)
}

function constraintsFromBoundRelationalPlan(plan, subjectIsSingular, targetIsSingular) {
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

// Non-bound relational plans (neither subject nor target is a singular
// actor). The relation is emitted for current-frame satisfaction; if there's
// a PBS descriptor, we additionally emit a crossFrame entry via buildPbsPair.
function constraintsFromNonBoundRelationalPlan(plan) {
  const propositions = []
  const crossFrame = []
  const relations = [buildRelation(plan)]
  for (const side of ['subject', 'target']) {
    const pbsDescriptor = (plan.comparisonDescriptors ?? []).find(
      d => d.side === side && d.source === 'prior_board_state'
    )
    if (!pbsDescriptor) { continue }
    const { priorProp, currentProp, crossEntry } = buildPbsPair(plan, side, /* otherIsSingular */ false, pbsDescriptor)
    propositions.push(priorProp, currentProp)
    crossFrame.push(crossEntry)
  }
  return { propositions, relations, crossFrame }
}

// Shield: relation always emitted (third-piece attacker handled by
// satisfyShield). When a PBS descriptor exists, crossFrame entries get
// emitted so post-pass mechanisms can engineer shield deltas.
function constraintsFromShieldPlan(plan, subjectIsSingular, targetIsSingular) {
  const propositions = []
  const crossFrame = []
  const relations = [buildRelation(plan)]
  for (const side of ['subject', 'target']) {
    const pbsDescriptor = (plan.comparisonDescriptors ?? []).find(
      d => d.side === side && d.source === 'prior_board_state'
    )
    if (!pbsDescriptor) { continue }
    const sideIsSingular = side === 'subject' ? subjectIsSingular : targetIsSingular
    if (sideIsSingular) { continue }
    const otherIsSingular = side === 'subject' ? targetIsSingular : subjectIsSingular
    const { priorProp, currentProp, crossEntry } = buildPbsPair(plan, side, otherIsSingular, pbsDescriptor)
    propositions.push(priorProp, currentProp)
    crossFrame.push(crossEntry)
  }
  return { propositions, relations, crossFrame }
}

function buildPbsPair(plan, side, otherIsSingular, descriptor) {
  const sideShape = relationalSideShape(plan, side, otherIsSingular)
  const priorProp   = { ...sideShape, frame: 'prior',   ...freshRanges() }
  const currentProp = { ...sideShape, frame: 'current', ...freshRanges() }

  // When the other side is bound to a singular, no proposition is emitted
  // for it — placement comes from the singular. Otherwise we emit a current-
  // frame proposition for the other side so mechanisms (esp. obstructs) can
  // engineer toward both teams.
  let otherProp = null
  if (!otherIsSingular) {
    const otherShape = relationalSideShape(plan, side === 'subject' ? 'target' : 'subject', false)
    otherProp = { ...otherShape, frame: 'current', ...freshRanges() }
  }

  return {
    priorProp,
    currentProp,
    crossEntry: {
      source: 'relational',
      operator: plan.operator,
      metric: descriptor.metric,
      direction: COMPARATOR_TO_DIRECTION[descriptor.comparator] ?? '=',
      priorProposition: priorProp,
      currentProposition: currentProp,
      subjectProposition: side === 'subject' ? currentProp : otherProp,
      targetProposition: side === 'target' ? currentProp : otherProp
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
  const actor = side === 'subject' ? plan.subject : plan.target
  return {
    team: side === 'subject' ? plan.subjectTeam : plan.targetTeam,
    species_set: speciesSetForRelationalSide(plan, side),
    region: { kind: 'all' },
    boundSingularActor: SINGULAR_ACTORS.has(actor) ? actor : null,
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
      : { kind: 'all' },
    sourcePlan: plan
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
  // Mobility metrics are intentionally not handled here — relational mobility
  // comparisons are rejected upstream at generation_plan.js's relational
  // descriptor validation. Mate-style chains use multi-payload composition
  // (e.g. "allied attack enemy_king && enemy mobility = 0").
  const ranges = freshRanges()
  ranges.count_range = { min: 1, max: Infinity }
  const actor = side === 'subject' ? plan.subject : plan.target
  const sideIsSingular = SINGULAR_ACTORS.has(actor)
  for (const d of plan.comparisonDescriptors ?? []) {
    if (d.side !== side) { continue }
    if (d.source !== 'exact_number') { continue }
    const total = Number(d.resolvedTotal ?? d.total ?? 0)
    const range = rangeFromComparator(d.comparator, total)
    const finalRange = sideIsSingular ? { min: range.min, max: Infinity } : range
    if (d.metric === 'count')                  { ranges.count_range = finalRange }
    else if (d.metric === 'aggregate_value')   { ranges.aggregate_value_range = finalRange }
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
  if (plan.positionAxis !== undefined && plan.positionAxis !== null) {
    return {
      kind: 'set',
      squares: new Set(qualifyingSquares(plan.positionAxis, plan.positionComparator, plan.positionTarget, plan.movingTeam))
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
