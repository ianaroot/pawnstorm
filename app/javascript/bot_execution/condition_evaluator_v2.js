import CandidateMoveAnalysisV2 from "bot_execution/candidate_move_analysis_v2"
import profileCollector from "gameplay/profile_collector"

class ConditionEvaluatorV2 {
    evaluate(conditionNode, analysis) {
      const v2Analysis = this.v2AnalysisFor(analysis)
      switch (conditionNode.kind) {
        case "unary":
          return this.evaluateUnary(conditionNode, v2Analysis)
        case "relational":
          return this.evaluateRelational(conditionNode, v2Analysis)
        case "position":
          return this.evaluatePosition(conditionNode, v2Analysis)
        default:
          throw new Error(`Unknown V2 condition kind: ${conditionNode.kind}`)
      }
    }

    v2AnalysisFor(analysis) {
      if (!analysis._v2Analysis) {
        profileCollector.increment('condition.v2.analysis_instances')
        analysis._v2Analysis = new CandidateMoveAnalysisV2({
          board: analysis.board,
          moveObject: analysis.moveObject
        })
      }

      return analysis._v2Analysis
    }

    evaluateUnary(conditionNode, analysis) {
      return profileCollector.measure('condition.v2.unary', () => {
        const operator = conditionNode.operator
        if (!this.unarySideCanEvaluate({
          actor: conditionNode.subject,
          filter: conditionNode.subjectFilter || "any",
          filterMode: conditionNode.subjectFilterMode || null,
          operator,
          role: "subject"
        }, analysis)) { return false }
        if (!this.unaryTargetCanEvaluate(conditionNode, analysis)) { return false }

        const leftTotal = analysis.unaryTotal({
          actor: conditionNode.subject,
          filter: conditionNode.subjectFilter || "any",
          filterMode: conditionNode.subjectFilterMode || null,
          operator
        })
        const rightTotal = this.unaryTargetTotal(conditionNode, analysis)
        return this.compare({ comparator: conditionNode.comparator, leftTotal, rightTotal })
      })
    }

    evaluateRelational(conditionNode, analysis) {
      return profileCollector.measure('condition.v2.relational', () => {
        const operator = conditionNode.operator
        if (operator === "same_piece") { return analysis.samePiece({ subject: conditionNode.subject, target: conditionNode.target }) }
        if (!this.relationalSingularActorsCanEvaluate(conditionNode, analysis)) { return false }
        const result = analysis.relationalResult({
          subject: conditionNode.subject, subjectFilter: conditionNode.subjectFilter || "any",
          subjectFilterMode: conditionNode.subjectFilterMode || null, operator,
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
      })
    }

    unarySideCanEvaluate({ actor, filter = "any", filterMode = null, operator, role = "subject" }, analysis) {
      if (!analysis.singularActor(actor)) { return true }
      if (role === "subject" && operator === "count") { return true }
      if (operator === "mobility") {
        return analysis.singularActorPresentForMobility({
          actor,
          filter,
          filterMode
        })
      }
      if (filter === "any") { return true }
      return analysis.singularActorMatchesFilter({
        actor,
        filter,
        filterMode
      })
    }

    unaryTargetCanEvaluate(conditionNode, analysis) {
      if (conditionNode.target === "exact_number" || conditionNode.target === "prior_board_state") { return true }
      return this.unarySideCanEvaluate({
        actor: conditionNode.target,
        filter: conditionNode.targetFilter || "any",
        filterMode: conditionNode.targetFilterMode || null,
        operator: conditionNode.operator,
        role: "target"
      }, analysis)
    }

    unaryTargetTotal(conditionNode, analysis) {
      if (conditionNode.target === "exact_number") { return conditionNode.targetTotal }
      if (conditionNode.target === "prior_board_state") {
        return analysis.unaryTotal({
          actor: conditionNode.subject,
          filter: conditionNode.subjectFilter || "any",
          filterMode: conditionNode.subjectFilterMode || null,
          operator: conditionNode.operator,
          boardScope: "prior"
        })
      }

      return analysis.unaryTotal({
        actor: conditionNode.target,
        filter: conditionNode.targetFilter || "any",
        filterMode: conditionNode.targetFilterMode || null,
        operator: conditionNode.operator
      })
    }

    relationalSingularActorsCanEvaluate(conditionNode, analysis) {
      return analysis.relationalSingularActorResolves({
        actor: conditionNode.subject,
        filter: conditionNode.subjectFilter || "any",
        filterMode: conditionNode.subjectFilterMode || null
      }) && analysis.relationalSingularActorResolves({
        actor: conditionNode.target,
        filter: conditionNode.targetFilter || "any",
        filterMode: conditionNode.targetFilterMode || null
      })
    }

    compare({ comparator, leftTotal, rightTotal }) {
      if (leftTotal === null || rightTotal === null) { return false }
      switch (comparator) {
        case "equal_to":
          return leftTotal === rightTotal
        case "greater_than":
          return leftTotal > rightTotal
        case "less_than":
          return leftTotal < rightTotal
        case "greater_than_or_equal_to":
          return leftTotal >= rightTotal
        case "less_than_or_equal_to":
          return leftTotal <= rightTotal
        default:
          throw new Error(`Unknown V2 comparator: ${comparator}`)
      }
    }    
    
    relationalValuePositions(conditionNode, analysis, result, side) {
      const actor = side === "subject" ? conditionNode.subject : conditionNode.target
      if (!analysis.singularActor(actor)) {
        return side === "subject" ? result.subjectPositions : result.targetPositions
      }
      const filter = side === "subject" ? (conditionNode.subjectFilter || "any") : (conditionNode.targetFilter || "any")
      const filterMode = side === "subject" ? (conditionNode.subjectFilterMode || null) : (conditionNode.targetFilterMode || null)
      return analysis.relationalActorPositions({ actor, filter, filterMode })
    }

    evaluateRelationalSubjectComparison(conditionNode, analysis, result) {
      const positions = conditionNode.subjectComparisonMetric === "value"
        ? this.relationalValuePositions(conditionNode, analysis, result, "subject")
        : result.subjectPositions
      const subjectTotal = analysis.metricForPositions({ metric: conditionNode.subjectComparisonMetric, positions })
      const referenceTotal = this.relationalComparisonReferenceTotal({ side: "subject", conditionNode, analysis })
      return this.compare({ comparator: conditionNode.subjectComparator, leftTotal: subjectTotal, rightTotal: referenceTotal })
    }

    evaluateRelationalTargetComparison(conditionNode, analysis, result) {
      const positions = conditionNode.targetComparisonMetric === "value"
        ? this.relationalValuePositions(conditionNode, analysis, result, "target")
        : result.targetPositions
      const targetTotal = analysis.metricForPositions({ metric: conditionNode.targetComparisonMetric, positions })
      const referenceTotal = this.relationalComparisonReferenceTotal({ side: "target", conditionNode, analysis })
      return this.compare({ comparator: conditionNode.targetComparator, leftTotal: targetTotal, rightTotal: referenceTotal })
    }

    relationalComparisonReferenceTotal({ side, conditionNode, analysis }) {
      const comparisonSourceKey = side === "subject" ? "subjectComparisonSource" : "targetComparisonSource"
      const comparisonSourceTotalKey = side === "subject" ? "subjectComparisonSourceTotal" : "targetComparisonSourceTotal"
      const comparisonMetricKey = side === "subject" ? "subjectComparisonMetric" : "targetComparisonMetric"
      const comparisonSource = conditionNode[comparisonSourceKey]
      const operator = conditionNode.operator
      if (comparisonSource === "exact_number") {
        return conditionNode[comparisonSourceTotalKey]
      }
      if (comparisonSource === "prior_board_state") {
        const priorResult = analysis.relationalResult({
          subject: conditionNode.subject,
          subjectFilter: conditionNode.subjectFilter || "any",
          subjectFilterMode: conditionNode.subjectFilterMode || null,
          operator,
          target: conditionNode.target,
          targetFilter: conditionNode.targetFilter || "any",
          targetFilterMode: conditionNode.targetFilterMode || null,
          boardScope: "prior"
        })
        const priorPositions = side === "subject" ? priorResult.subjectPositions : priorResult.targetPositions
        return analysis.metricForPositions({ metric: conditionNode[comparisonMetricKey], positions: priorPositions, boardScope: "prior" })
      } else {
        return analysis.comparisonSourceTotal({
          comparisonSource,
          subject: conditionNode.subject,
          subjectFilter: conditionNode.subjectFilter || "any",
          subjectFilterMode: conditionNode.subjectFilterMode || null,
          operator
        })
      }
    }

    evaluatePosition(conditionNode, analysis) {
      return profileCollector.measure('condition.v2.position', () => {
        if (conditionNode.subject === "enemy_moved_piece") {
          const resolved = analysis.resolvedEnemyMovedPiece()
          if (!resolved || !resolved.presentOnBoard) { return false }
        }

        const positions = analysis.positionFilteredPositions({
          actor: conditionNode.subject,
          filter: conditionNode.subjectFilter || "any",
          filterMode: conditionNode.subjectFilterMode || null,
          positionAxis: conditionNode.positionAxis,
          positionComparator: conditionNode.positionComparator,
          positionTarget: conditionNode.positionTarget
        })

        const metricTotal = analysis.positionMetricTotal({
          positions,
          operator: conditionNode.operator
        })

        return this.compare({ comparator: conditionNode.comparator, leftTotal: metricTotal, rightTotal: conditionNode.targetTotal })
      })
    }

    relationalComparisonPresent(conditionNode, side) {
      const metricKey = side === "subject" ? "subjectComparisonMetric" : "targetComparisonMetric"
      const comparatorKey = side === "subject" ? "subjectComparator" : "targetComparator"
      const comparisonSourceKey = side === "subject" ? "subjectComparisonSource" : "targetComparisonSource"
      const comparisonSourceTotalKey = side === "subject" ? "subjectComparisonSourceTotal" : "targetComparisonSourceTotal"
      return Boolean(
        conditionNode[metricKey] && conditionNode[comparatorKey] &&
        (
          conditionNode[comparisonSourceKey] ||
          conditionNode[comparisonSourceTotalKey] !== undefined
        )
      )
    }
  }

export default ConditionEvaluatorV2
