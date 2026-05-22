import { findCombinatorialQualifyingKeys } from 'bot_execution/relational_qualifying'
import { relationalActorLabels } from 'editorV2/panels/condition_preview/shared/relational_utils'
import {
  PRIOR_BOARD_COMPARISON_SOURCE,
  COUNT_COMPARISON_METRIC,
  AGGREGATE_VALUE_METRIC
} from 'editorV2/panels/condition_preview/plans/comparison_requirements'

function descriptorAllowsZeroPairs(descriptor) {
  const { comparator, source } = descriptor
  if (source === PRIOR_BOARD_COMPARISON_SOURCE) {
    return comparator === 'less_than' || comparator === 'less_than_or_equal_to' || comparator === 'equal_to'
  }
  const total = Number((descriptor.resolvedTotal ?? descriptor.total) || 0)
  switch (comparator) {
    case 'equal_to': return total === 0
    case 'less_than': return total > 0
    case 'less_than_or_equal_to': return total >= 0
    default: return false
  }
}

// ===== buildAggregatedResult =====

function combinatorialFilterArgs(plan) {
  const descriptors = plan.comparisonDescriptors ?? []
  const subjectDescriptor = descriptors.find(d => d.side === 'subject')
  const targetDescriptor = descriptors.find(d => d.side === 'target')

  const descriptorTotal = (descriptor) => Number((descriptor.resolvedTotal ?? descriptor.total) || 0)

  if (subjectDescriptor?.metric === COUNT_COMPARISON_METRIC && targetDescriptor?.metric === AGGREGATE_VALUE_METRIC) {
    return {
      groupBySide: 'subject', valueSide: 'target',
      valueComparator: targetDescriptor.comparator,
      valueReferenceTotal: descriptorTotal(targetDescriptor),
      countComparator: subjectDescriptor.comparator,
      countReferenceTotal: descriptorTotal(subjectDescriptor)
    }
  }

  if (subjectDescriptor?.metric === AGGREGATE_VALUE_METRIC && targetDescriptor?.metric === COUNT_COMPARISON_METRIC) {
    return {
      groupBySide: 'target', valueSide: 'subject',
      valueComparator: subjectDescriptor.comparator,
      valueReferenceTotal: descriptorTotal(subjectDescriptor),
      countComparator: targetDescriptor.comparator,
      countReferenceTotal: descriptorTotal(targetDescriptor)
    }
  }

  return null
}

function applyCombinatorialFilter(plan, result, analysis) {
  const args = combinatorialFilterArgs(plan)
  if (!args) { return result }

  const qualifyingKeys = findCombinatorialQualifyingKeys({
    pairs: result.pairs, board: analysis.afterBoard(), ...args
  })
  if (qualifyingKeys === null) { return result }

  const keySet = new Set(qualifyingKeys)
  const filteredPairs = result.pairs.filter(pair => {
    const key = args.groupBySide === 'subject' ? pair.subjectPosition : pair.targetPosition
    return keySet.has(key)
  })

  return {
    pairs: filteredPairs,
    subjectPositions: [...new Set(filteredPairs.map(p => p.subjectPosition))],
    targetPositions: [...new Set(filteredPairs.map(p => p.targetPosition))]
  }
}

export function buildAggregatedResult(combinedPlan, analysis) {
  let subjectPositions = []
  let targetPositions = []
  let pairs = []

  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      // same_piece bypasses pair-aggregation — both actors resolve to the same
      // square (the captured piece's prior position). CEv2 is authoritative
      // for evaluation; we produce a synthetic single-pair result for highlighting.
      if (plan.operator === 'same_piece') {
        const capturedPos = analysis.capturedPiecePosition()
        if (capturedPos !== null && capturedPos !== undefined) {
          subjectPositions.push(capturedPos)
          targetPositions.push(capturedPos)
          pairs.push({ subject: capturedPos, target: capturedPos })
        }
        continue
      }
      const rawResult = analysis.relationalResult(plan.relationParams)
      if (rawResult.pairs.length === 0 && !plan.comparisonDescriptors?.some(descriptorAllowsZeroPairs)) { return null }
      const result = applyCombinatorialFilter(plan, rawResult, analysis)
      subjectPositions = [...subjectPositions, ...result.subjectPositions]
      targetPositions = [...targetPositions, ...result.targetPositions]
      pairs = [...pairs, ...result.pairs]
    } else if (plan.kind === 'unary') {
      const positions = analysis.relationalActorPositions({
        actor: plan.subject,
        filter: plan.subjectFilter,
        filterMode: plan.subjectFilterMode
      })
      subjectPositions = [...subjectPositions, ...positions]
    } else if (plan.kind === 'position') {
      const positions = analysis.positionFilteredPositions({
        actor: plan.subject,
        filter: plan.subjectFilter,
        filterMode: plan.subjectFilterMode,
        positionAxis: plan.positionAxis,
        positionComparator: plan.positionComparator,
        positionTarget: plan.positionTarget
      })
      subjectPositions = [...subjectPositions, ...positions]
    }
  }

  return {
    subjectPositions: [...new Set(subjectPositions)],
    targetPositions: [...new Set(targetPositions)],
    pairs
  }
}

// ===== buildAggregatedHighlights =====

export function buildAggregatedHighlights(combinedPlan, moveObject, aggregatedResult, priorBoard) {
  const relationalPlans = combinedPlan.plans.filter(p => p.kind === 'relational')

  const priorSubject = new Set()
  const priorTarget = new Set()
  const afterSubject = new Set(aggregatedResult.subjectPositions)
  const afterTarget = new Set(aggregatedResult.targetPositions)

  for (const plan of relationalPlans) {
    const labels = relationalActorLabels(plan, moveObject, aggregatedResult, priorBoard)
    labels.prior.subjectPositions.forEach(p => priorSubject.add(p))
    labels.prior.targetPositions.forEach(p => priorTarget.add(p))
    labels.after.subjectPositions.forEach(p => afterSubject.add(p))
    labels.after.targetPositions.forEach(p => afterTarget.add(p))
  }

  if (relationalPlans.length === 0) {
    aggregatedResult.subjectPositions.forEach(p => priorSubject.add(p))
  }

  if (combinedPlan.plans.length > 1) {
    const priorRelation = [...new Set([...priorSubject, ...priorTarget])]
    const afterRelation = [...new Set([...afterSubject, ...afterTarget])]
    return {
      prior: {
        relationPositions: priorRelation,
        movedStartPosition: moveObject.startPosition,
        movedEndPosition: moveObject.endPosition
      },
      after: {
        relationPositions: afterRelation,
        movedStartPosition: null,
        movedEndPosition: moveObject.endPosition
      }
    }
  }

  return {
    prior: {
      subjectPositions: [...priorSubject],
      targetPositions: [...priorTarget],
      movedStartPosition: moveObject.startPosition,
      movedEndPosition: moveObject.endPosition
    },
    after: {
      subjectPositions: [...afterSubject],
      targetPositions: [...afterTarget],
      movedStartPosition: null,
      movedEndPosition: moveObject.endPosition
    }
  }
}

