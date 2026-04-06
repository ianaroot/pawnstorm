  import CandidateMoveAnalysisV2 from "bot_execution/candidate_move_analysis_v2"

  class ConditionEvaluatorV2 {
    evaluate(conditionNode, analysis) {
      const v2Analysis = new CandidateMoveAnalysisV2({
        board: analysis.board,
        moveObject: analysis.moveObject
      })

      switch (conditionNode.kind) {
        case "unary":
          return this.evaluateUnary(conditionNode, v2Analysis)
        case "relational":
          return this.evaluateRelational(conditionNode, v2Analysis)
        default:
          throw new Error(`Unknown V2 condition kind: ${conditionNode.kind}`)
      }
    }

    evaluateUnary(conditionNode, analysis) {
      const leftValue = analysis.unaryValue({
        subject: conditionNode.subject,
        subjectFilter: conditionNode.subjectFilter || "any",
        subjectFilterMode: conditionNode.subjectFilterMode || null,
        verb: conditionNode.verb
      })
      const rightValue = analysis.comparisonValueFor({
        comparisonValue: conditionNode.comparisonValue,
        subject: conditionNode.subject,
        subjectFilter: conditionNode.subjectFilter || "any",
        subjectFilterMode: conditionNode.subjectFilterMode || null,
        verb: conditionNode.verb
      })
      return this.compare({
        comparator: conditionNode.comparator,
        leftValue,
        rightValue
      })
    }

    evaluateRelational(conditionNode, analysis) {
      throw new Error(`V2 relational condition evaluation not implemented yet: ${JSON.stringify(conditionNode)}`)
    }

    compare({ comparator, leftValue, rightValue }) {
      switch (comparator) {
        case "equal_to":
          return leftValue === rightValue
        case "greater_than":
          return leftValue > rightValue
        case "less_than":
          return leftValue < rightValue
        default:
          throw new Error(`Unknown V2 comparator: ${comparator}`)
      }
    }
  }

  export default ConditionEvaluatorV2