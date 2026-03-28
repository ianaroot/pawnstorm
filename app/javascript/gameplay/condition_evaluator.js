class ConditionEvaluator {
  evaluate(conditionNode, analysis) {
    const query = {
      subject: conditionNode.subject,
      subjectSpecifier: conditionNode.subjectSpecifier || 'any',
      relation: conditionNode.relation,
      relationSpecifier: conditionNode.relationSpecifier || 'any'
    }
    const value = analysis.queryValue(query, 'after')
    const comparison = conditionNode.comparison
    const comparisonValue = this.comparisonValueFor(conditionNode, analysis, query)

    switch (comparison) {
      case 'equal_to':
        return value === comparisonValue
      case 'greater_than':
        return value > comparisonValue
      case 'less_than':
        return value < comparisonValue
      default:
        throw new Error(`Unknown comparison: ${comparison}`)
    }
  }

  comparisonValueFor(conditionNode, analysis, query) {
    switch (conditionNode.comparisonValue) {
      case 'moved_piece_value':
        return analysis.movedPieceValue()
      case 'captured_piece_value':
        return analysis.capturedPieceValue()
      case 'prior_board_state':
        return analysis.queryValue(query, 'prior')
      default:
        return conditionNode.comparisonValue
    }
  }
}

export default ConditionEvaluator
