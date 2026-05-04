import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { legalPriorTurnState, soundForMove } from '../shared/example_utils'
import { layoutsMatch } from '../shared/board_utils'
import { buildAggregatedResult, buildAggregatedHighlights } from '../shared/move_collection'

// ===== Shared verification helpers =====

export function evaluateAndBuildExample({
  combinedPlan, priorBoard, afterLayout, afterBoard, moveObject, seed, moveKind
}) {
  if (moveObject.illegal) { return null }
  if (!legalPriorTurnState(priorBoard, moveObject)) { return null }

  const rebuiltAfter = priorBoard.lightClone()
  rebuiltAfter._hypotheticallyMovePiece(moveObject)
  if (!layoutsMatch(rebuiltAfter.layOut, afterLayout)) { return null }

  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject }
  if (!combinedPlan.evaluationPayloads.every(payload => evaluator.evaluate(payload, input))) { return null }

  const analysis = new CandidateMoveAnalysisV2({ board: priorBoard, moveObject })
  const aggregatedResult = buildAggregatedResult(combinedPlan, analysis)
  if (!aggregatedResult) { return null }

  const highlights = buildAggregatedHighlights(combinedPlan, moveObject, aggregatedResult, priorBoard)
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
    geometryKey: seed.geometryKey,
    movedPieceInRelation,
    moveKind,
    sound: soundForMove(priorBoard, afterBoard, moveObject)
  }
}
