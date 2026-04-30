import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import {
  candidateIdentity, moveKindForMoveObject, soundForMove
} from 'editorV2/panels/condition_preview/example_utils'
import { buildAggregatedResult, buildAggregatedHighlights } from '../move_collection'
import { classifyPlan } from './plan_classifier'
import { PATTERNS } from './move_patterns'

const DEFAULT_ATTEMPTS_PER_DRIVER = 200

function buildExample({ priorBoard, moveObject, combinedPlan }) {
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
    generationPath: 'forward'
  }
}

export function collectForwardExamples({ combinedPlan, random, maxExamples = 30, attemptsPerDriver = DEFAULT_ATTEMPTS_PER_DRIVER }) {
  const classifications = combinedPlan.plans.map(classifyPlan)
  const drivers = classifications.filter(c => c.pbsDirection !== null)
  if (drivers.length === 0) { return [] }

  const examples = []
  const seen = new Set()
  const evaluator = new ConditionEvaluatorV2()

  driverLoop: for (const driver of drivers) {
    for (const pattern of PATTERNS) {
      for (let attempt = 0; attempt < attemptsPerDriver; attempt += 1) {
        if (examples.length >= maxExamples) { break driverLoop }
        const result = pattern.generate({ driver, combinedPlan, random })
        if (!result) { continue }
        const { priorBoard, moveObject } = result
        const input = { board: priorBoard, moveObject }
        const passes = combinedPlan.evaluationPayloads.every(payload => evaluator.evaluate(payload, input))
        if (!passes) { continue }
        const example = buildExample({ priorBoard, moveObject, combinedPlan })
        if (!example) { continue }
        const id = candidateIdentity(example)
        if (seen.has(id)) { continue }
        seen.add(id)
        examples.push(example)
      }
    }
  }

  return examples
}
