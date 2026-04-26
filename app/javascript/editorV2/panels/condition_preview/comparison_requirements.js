export const COUNT_COMPARISON_METRIC = 'count'
export const VALUE_COMPARISON_METRIC = 'value'
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

export function desiredCountForComparison(descriptor) {
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

export function comparisonRequirementsFromDescriptors(descriptors) {
  const requirements = {
    subject: 1,
    target: 1,
    comparisonsPresent: false,
    countComparisonsPresent: false
  }

  descriptors.forEach(descriptor => {
    requirements.comparisonsPresent = true
    if (descriptor.metric !== COUNT_COMPARISON_METRIC) { return }
    requirements.countComparisonsPresent = true
    requirements[descriptor.side] = desiredCountForComparison(descriptor)
  })

  return requirements
}

export function usesZeroRelationPath(requirements) {
  return requirements.countComparisonsPresent && (requirements.subject === 0 || requirements.target === 0)
}
