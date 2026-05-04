import Board from 'gameplay/board'
import { materialValue } from 'gameplay/board_query_utils'
import {
  COUNT_COMPARISON_METRIC,
  INDIVIDUAL_VALUE_METRIC,
  AGGREGATE_VALUE_METRIC,
  EXACT_NUMBER_COMPARISON_SOURCE,
  PRIOR_BOARD_COMPARISON_SOURCE
} from 'editorV2/panels/condition_preview/plans/comparison_requirements'
import { shuffled } from '../shared/board_utils'
import { SINGULAR_ACTORS } from '../shared/example_utils'

const HARD_SET_SIZE_CAP = 4

export function valueBoundsForDescriptor(descriptor) {
  if (!descriptor || descriptor.metric !== AGGREGATE_VALUE_METRIC) { return null }
  if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) { return null }

  const total = Number((descriptor.resolvedTotal ?? descriptor.total) || 0)
  switch (descriptor.comparator) {
    case 'equal_to': return { min: total, max: total }
    case 'greater_than': return { min: total + 1, max: Infinity }
    case 'greater_than_or_equal_to': return { min: total, max: Infinity }
    case 'less_than': return { min: 0, max: total - 1 }
    case 'less_than_or_equal_to': return { min: 0, max: total }
    default: return null
  }
}

function totalWithinBounds(total, bounds) {
  return total >= bounds.min && total <= bounds.max
}

export function aggregateSetSizeCap(plan, side) {
  if ((plan.operator === 'attack' || plan.operator === 'defend') && side === 'target') {
    const subjectPool = plan.subjectSpeciesPool ?? []
    const pawnOnly = subjectPool.length > 0 && subjectPool.every(s => s === Board.PAWN)
    return pawnOnly ? 2 : HARD_SET_SIZE_CAP
  }
  return HARD_SET_SIZE_CAP
}

export function enumerateAggregateValueSets({ pool, bounds, maxSize }) {
  const unique = [...new Set(pool)].filter(s => s !== Board.KING && materialValue(s) > 0)
  const results = []

  function recurse(startIdx, current, total) {
    if (current.length > 0 && totalWithinBounds(total, bounds)) {
      results.push([...current])
    }
    if (current.length >= maxSize) { return }
    if (bounds.max !== Infinity && total >= bounds.max) { return }
    for (let i = startIdx; i < unique.length; i++) {
      const v = materialValue(unique[i])
      if (bounds.max !== Infinity && total + v > bounds.max) { continue }
      recurse(i, [...current, unique[i]], total + v)
    }
  }

  recurse(0, [], 0)
  return results
}

export function enumerateCountMultisets({ pool, size }) {
  if (size <= 0) { return [] }
  const unique = [...new Set(pool)]
  if (unique.length === 0) { return [] }
  const results = []

  function recurse(startIdx, current) {
    if (current.length === size) {
      results.push([...current])
      return
    }
    for (let i = startIdx; i < unique.length; i++) {
      recurse(i, [...current, unique[i]])
    }
  }

  recurse(0, [])
  return results
}

function descriptorForSide(plan, side) {
  if (!plan.comparisonDescriptors) { return null }
  return plan.comparisonDescriptors.find(d => d.side === side) ?? null
}

function actorForSide(plan, side) {
  return side === 'subject' ? plan.subject : plan.target
}

function singletonsFromPool(pool, random) {
  return shuffled(pool.map(species => [species]), random)
}

function countMinimumSize(comparator, total) {
  switch (comparator) {
    case 'equal_to': return total
    case 'greater_than': return total + 1
    case 'greater_than_or_equal_to': return Math.max(1, total)
    default: return null
  }
}

export function buildSideConfigurations({ plan, side, pool, random }) {
  if (!pool || pool.length === 0) { return [] }

  const descriptor = descriptorForSide(plan, side)
  const actor = actorForSide(plan, side)
  const isSingular = SINGULAR_ACTORS.has(actor)

  if (!descriptor || descriptor.source === PRIOR_BOARD_COMPARISON_SOURCE) {
    return singletonsFromPool(pool, random)
  }

  if (isSingular) {
    return singletonsFromPool(pool, random)
  }

  if (descriptor.metric === COUNT_COMPARISON_METRIC) {
    if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) {
      return singletonsFromPool(pool, random)
    }
    const total = Number(descriptor.total || 0)
    const minimumSize = countMinimumSize(descriptor.comparator, total)
    if (minimumSize === null) {
      return singletonsFromPool(pool, random)
    }
    if (minimumSize <= 0) {
      return singletonsFromPool(pool, random)
    }
    const sizeCap = aggregateSetSizeCap(plan, side)
    const size = Math.min(minimumSize, sizeCap)
    return shuffled(enumerateCountMultisets({ pool, size }), random)
  }

  if (descriptor.metric === INDIVIDUAL_VALUE_METRIC) {
    return singletonsFromPool(pool, random)
  }

  if (descriptor.metric === AGGREGATE_VALUE_METRIC) {
    const bounds = valueBoundsForDescriptor(descriptor)
    if (!bounds) {
      return singletonsFromPool(pool, random)
    }
    const sizeCap = aggregateSetSizeCap(plan, side)
    const sets = enumerateAggregateValueSets({ pool, bounds, maxSize: sizeCap })
    if (sets.length === 0) {
      return singletonsFromPool(pool, random)
    }
    return shuffled(sets, random)
  }

  return singletonsFromPool(pool, random)
}
