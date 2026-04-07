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
        subject: conditionNode.subject, subjectFilter: conditionNode.subjectFilter || "any",
        subjectFilterMode: conditionNode.subjectFilterMode || null, verb: conditionNode.verb
      })
      const rightValue = analysis.comparisonValueFor({ comparisonValue: conditionNode.comparisonValue, subject: conditionNode.subject,
        subjectFilter: conditionNode.subjectFilter || "any", subjectFilterMode: conditionNode.subjectFilterMode || null, verb: conditionNode.verb
      })
      return this.compare({ comparator: conditionNode.comparator, leftValue, rightValue })
    }

    evaluateRelational(conditionNode, analysis) {
      if (conditionNode.verb === "same_piece") { return analysis.samePiece({ subject: conditionNode.subject, target: conditionNode.target }) }
      const result = analysis.relationalResult({
        subject: conditionNode.subject, subjectFilter: conditionNode.subjectFilter || "any",
        subjectFilterMode: conditionNode.subjectFilterMode || null, verb: conditionNode.verb,
        target: conditionNode.target, targetFilter: conditionNode.targetFilter || "any",
        targetFilterMode: conditionNode.targetFilterMode || null
      })
      const subjectComparisonPresent = this.relationalComparisonPresent(conditionNode, "subject")
      const targetComparisonPresent = this.relationalComparisonPresent(conditionNode, "target")
      if (!subjectComparisonPresent && !targetComparisonPresent) { 
        return result.pairs.length > 0 
      } else { 
        const subjectPasses = subjectComparisonPresent ? this.evaluateRelationalSubjectComparison(conditionNode, analysis, result) : true
        const targetPasses = targetComparisonPresent ? this.evaluateRelationalTargetComparison(conditionNode, analysis, result) : true
        return subjectPasses && targetPasses
      }
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
    
    evaluateRelationalSubjectComparison(conditionNode, analysis, result) {
      const subjectTotal = analysis.metricForPositions({
        metric: conditionNode.subjectComparisonMetric,
        positions: result.subjectPositions
      })
      const referenceTotal = this.relationalComparisonReferenceTotal({ side: "subject", conditionNode, analysis })
      return this.compare({ comparator: conditionNode.subjectComparator, leftValue: subjectTotal, rightValue: referenceTotal })
    }

    evaluateRelationalTargetComparison(conditionNode, analysis, result) {
      const targetTotal = analysis.metricForPositions({ metric: conditionNode.targetComparisonMetric, positions: result.targetPositions })
      const referenceTotal = this.relationalComparisonReferenceTotal({ side: "target", conditionNode, analysis })
      return this.compare({ comparator: conditionNode.targetComparator, leftValue: targetTotal, rightValue: referenceTotal })
    }

    relationalComparisonReferenceTotal({ side, conditionNode, analysis }) {
      const comparisonValueKey = side === "subject" ? "subjectComparisonValue" : "targetComparisonValue"
      const comparisonMetricKey = side === "subject" ? "subjectComparisonMetric" : "targetComparisonMetric"
      const comparisonValue = conditionNode[comparisonValueKey]
      if (comparisonValue === "prior_board_state") {
        const priorResult = analysis.relationalResult({
          subject: conditionNode.subject,  subjectFilter: conditionNode.subjectFilter || "any",
          subjectFilterMode: conditionNode.subjectFilterMode || null,  verb: conditionNode.verb,
          target: conditionNode.target,  targetFilter: conditionNode.targetFilter || "any",
          targetFilterMode: conditionNode.targetFilterMode || null, boardScope: "prior"
        })
        const priorPositions = side === "subject" ? priorResult.subjectPositions : priorResult.targetPositions
        return analysis.metricForPositions({ metric: conditionNode[comparisonMetricKey], positions: priorPositions, boardScope: "prior" })
      } else {
          return analysis.comparisonValueFor({
            comparisonValue,  subject: conditionNode.subject,  subjectFilter: conditionNode.subjectFilter || "any",
            subjectFilterMode: conditionNode.subjectFilterMode || null,  verb: conditionNode.verb
          })
      }
    }

    relationalComparisonPresent(conditionNode, side) {
      const metricKey = side === "subject" ? "subjectComparisonMetric" : "targetComparisonMetric"
      const comparatorKey = side === "subject" ? "subjectComparator" : "targetComparator"
      const comparisonValueKey = side === "subject" ? "subjectComparisonValue" : "targetComparisonValue"
      return Boolean(
        conditionNode[metricKey] && conditionNode[comparatorKey] &&
        conditionNode[comparisonValueKey] !== undefined && conditionNode[comparisonValueKey] !== null
      )
    }
  }

  export default ConditionEvaluatorV2