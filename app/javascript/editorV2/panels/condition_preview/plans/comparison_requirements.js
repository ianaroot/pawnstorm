export const COUNT_COMPARISON_METRIC = 'count'
export const INDIVIDUAL_VALUE_METRIC = 'individual_value'
export const AGGREGATE_VALUE_METRIC = 'aggregate_value'

export function isValueMetric(metric) {
  return metric === INDIVIDUAL_VALUE_METRIC || metric === AGGREGATE_VALUE_METRIC
}

export const EXACT_NUMBER_COMPARISON_SOURCE = 'exact_number'
export const PRIOR_BOARD_COMPARISON_SOURCE = 'prior_board_state'

export function comparisonDescriptors(payload) {
  return [
    {
      side: 'subject',
      metric: payload.subjectComparisonMetric,
      comparator: payload.subjectComparator,
      source: payload.subjectComparisonSource,
      total: payload.subjectComparisonSourceTotal
    },
    {
      side: 'target',
      metric: payload.targetComparisonMetric,
      comparator: payload.targetComparator,
      source: payload.targetComparisonSource,
      total: payload.targetComparisonSourceTotal
    }
  ].filter(descriptor => descriptor.metric && descriptor.comparator && (descriptor.source || descriptor.total !== undefined))
}

function desiredCountForComparison(descriptor) {
  const total = Number(descriptor.total || 0)
  switch (descriptor.comparator) {
    case 'equal_to':
      return total
    case 'greater_than':
      return total + 1
    case 'greater_than_or_equal_to':
      return Math.max(1, total)
    case 'less_than':
      return total > 0 ? total - 1 : 0
    case 'less_than_or_equal_to':
      return total > 0 ? 1 : 0
    default:
      return null
  }
}

export function comparisonRequirements(payload) {
  return comparisonRequirementsFromDescriptors(comparisonDescriptors(payload))
}

function comparisonRequirementsFromDescriptors(descriptors) {
  const requirements = {
    subject: 1,
    target: 1,
    comparisonsPresent: false,
    countComparisonsPresent: false,
    exactCountComparisonsPresent: false
  }

  descriptors.forEach(descriptor => {
    requirements.comparisonsPresent = true
    if (descriptor.metric !== COUNT_COMPARISON_METRIC) { return }
    if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) { return }
    requirements.countComparisonsPresent = true
    requirements.exactCountComparisonsPresent = true
    requirements[descriptor.side] = desiredCountForComparison(descriptor)
  })

  return requirements
}

function descriptorAllowsZeroValue(descriptor) {
  if (!isValueMetric(descriptor.metric)) { return false }
  const total = Number((descriptor.resolvedTotal ?? descriptor.total) || 0)
  switch (descriptor.comparator) {
    case 'equal_to': return total === 0
    case 'greater_than': return false
    case 'greater_than_or_equal_to': return total === 0
    case 'less_than': return total > 0
    case 'less_than_or_equal_to': return true
    default: return false
  }
}

export function valueComparisonAllowsEmpty(descriptors) {
  return descriptors.some(descriptorAllowsZeroValue)
}
