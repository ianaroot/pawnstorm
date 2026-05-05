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
