class ConditionEvaluator {
  evaluate(conditionNode, analysis) {
    const value = analysis.relationValue(conditionNode)
    const comparison = conditionNode.comparison
    const comparisonValue = conditionNode.comparisonValue

    switch (comparison) {
      case 'any':
        return Boolean(value)
      case 'none':
        return !value
      case 'count':
        return value === comparisonValue
      case 'greater_than':
        return value > comparisonValue
      case 'less_than':
        return value < comparisonValue
      default:
        throw new Error(`Unknown comparison: ${comparison}`)
    }
  }
}

export default ConditionEvaluator
