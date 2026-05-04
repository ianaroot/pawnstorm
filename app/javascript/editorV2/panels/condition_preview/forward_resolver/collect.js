import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import {
  candidateIdentity, moveKindForMoveObject, soundForMove
} from 'editorV2/panels/condition_preview/shared/example_utils'
import { buildAggregatedResult, buildAggregatedHighlights } from '../shared/move_collection'
import { resolveViaHints } from './hint_resolver'

const DEFAULT_HINT_RESOLVER_ATTEMPTS = 200

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

export function collectForwardResolverExamples({ combinedPlan, random, maxStandardSize, addUnique, standardExamples, produced }) {
  if (combinedPlan.plans.length === 0) { return }
  const evaluator = new ConditionEvaluatorV2()

  for (let attempt = 0; attempt < DEFAULT_HINT_RESOLVER_ATTEMPTS; attempt += 1) {
    if (standardExamples.length >= maxStandardSize) { break }
    const result = resolveViaHints({ combinedPlan, random })
    if (!result) { continue }
    const input = { board: result.priorBoard, moveObject: result.moveObject }
    const passes = combinedPlan.evaluationPayloads.every(payload => evaluator.evaluate(payload, input))
    if (!passes) { continue }
    const example = buildExample({ priorBoard: result.priorBoard, moveObject: result.moveObject, combinedPlan, generationPath: 'forward-resolver' })
    if (!example) { continue }
    produced['forward-resolver'] += 1
    addUnique(example, standardExamples)
  }
}
