export function aggregateOrNull(items, fn) {
  if (items.length === 0) return null
  return items.reduce((sum, item) => sum + fn(item), 0)
}

export function compareValues(value, comparator, target) {
  switch (comparator) {
    case 'equal_to':                 return value === target
    case 'greater_than':             return value > target
    case 'less_than':                return value < target
    case 'greater_than_or_equal_to': return value >= target
    case 'less_than_or_equal_to':    return value <= target
    default:                         throw new Error(`Unknown comparator: ${comparator}`)
  }
}
