import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import {
  moveKindForMoveObject, soundForMove
} from 'editorV2/panels/condition_preview/shared/example_utils'
import { buildAggregatedResult, buildAggregatedHighlights } from '../shared/move_collection'
import { classifyPlan } from './plan_classifier'
import { PATTERNS } from './move_patterns'

const DEFAULT_ATTEMPTS_PER_DRIVER = 200

function buildExample({ priorBoard, moveObject, combinedPlan, generationPath }) {
  const analysis = new CandidateMoveAnalysisV2({ board: priorBoard, moveObject })
  const aggregatedResult = buildAggregatedResult(combinedPlan, analysis)
  if (!aggregatedResult) { return null }
  const highlights = buildAggregatedHighlights(combinedPlan, moveObject, aggregatedResult, priorBoard)

  const afterBoard = priorBoard.lightClone()
  afterBoard._hypotheticallyMovePiece(moveObject)

  const movedPieceInRelation = (
    aggregatedResult.subjectPositions.includes(moveObject.endPosition) ||
    aggregatedResult.targetPositions.includes(moveObject.endPosition)
  )

  return {
    priorBoard,
    afterBoard,
    moveObject,
    result: aggregatedResult,
    highlights,
    variantType: movedPieceInRelation ? 'involved' : 'separate',
    geometryKey: 'forward',
    movedPieceInRelation,
    moveKind: moveKindForMoveObject(moveObject),
    sound: soundForMove(priorBoard, afterBoard, moveObject),
    generationPath
  }
}

export function collectForwardPatternExamples({ combinedPlan, random, maxStandardSize, addUnique, standardExamples, produced, attemptsPerDriver = DEFAULT_ATTEMPTS_PER_DRIVER }) {
  if (combinedPlan.plans.length === 0) { return }
  const classifications = combinedPlan.plans.map(classifyPlan)
  const drivers = classifications.filter(c => c.pbsDirection !== null)
  if (drivers.length === 0) { return }

  const evaluator = new ConditionEvaluatorV2()

  // Round-robin through (driver, pattern) combinations so every applicable pattern
  // gets a turn before any single pattern fills the pool.
  roundLoop: for (let round = 0; round < attemptsPerDriver; round += 1) {
    if (standardExamples.length >= maxStandardSize) { break }
    for (const driver of drivers) {
      for (const pattern of PATTERNS) {
        if (standardExamples.length >= maxStandardSize) { break roundLoop }
        const result = pattern.generate({ driver, combinedPlan, random })
        if (!result) { continue }
        const { priorBoard, moveObject } = result
        const input = { board: priorBoard, moveObject }
        const passes = combinedPlan.evaluationPayloads.every(payload => evaluator.evaluate(payload, input))
        if (!passes) { continue }
        const example = buildExample({ priorBoard, moveObject, combinedPlan, generationPath: 'forward-pattern' })
        if (!example) { continue }
        produced['forward-pattern'] += 1
        addUnique(example, standardExamples)
      }
    }
  }
}
