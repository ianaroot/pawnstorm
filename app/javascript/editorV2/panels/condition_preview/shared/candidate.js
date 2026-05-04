import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import {
  legalPriorTurnState, soundForMove, moveKindForMoveObject
} from './example_utils'
import { layoutsMatch } from './board_utils'
import { buildAggregatedResult, buildAggregatedHighlights } from './move_collection'

// A move (priorBoard + moveObject) being considered against a chain. Holds
// the candidate state, lazily computes the after-board and analysis only when
// needed, and answers "does this satisfy the chain?" / "should this become
// an example?" Each pipeline composes the steps it needs.
//
// Verification is two questions: legal under chess rules + passes every
// payload's post-eval. matchesLayout is a separate question used by the
// special-moves pipelines, which build prior+after directly from a preset
// and need to confirm the rebuilt after matches the preset's layout.

export class Candidate {
  constructor({ combinedPlan, priorBoard, moveObject }) {
    this.combinedPlan = combinedPlan
    this.priorBoard = priorBoard
    this.moveObject = moveObject
    this._afterBoard = null
    this._analysis = null
  }

  get afterBoard() {
    if (this._afterBoard === null) {
      this._afterBoard = this.priorBoard.lightClone()
      this._afterBoard._hypotheticallyMovePiece(this.moveObject)
    }
    return this._afterBoard
  }

  get analysis() {
    if (this._analysis === null) {
      this._analysis = new CandidateMoveAnalysisV2({ board: this.priorBoard, moveObject: this.moveObject })
    }
    return this._analysis
  }

  isLegal() {
    if (this.moveObject.illegal) { return false }
    return legalPriorTurnState(this.priorBoard, this.moveObject)
  }

  passesEvaluation() {
    const evaluator = new ConditionEvaluatorV2()
    const input = { board: this.priorBoard, moveObject: this.moveObject }
    return this.combinedPlan.evaluationPayloads.every(payload => evaluator.evaluate(payload, input))
  }

  isVerified() {
    return this.isLegal() && this.passesEvaluation()
  }

  matchesLayout(expectedLayout) {
    return layoutsMatch(this.afterBoard.layOut, expectedLayout)
  }

  buildExample({ generationPath, geometryKey, moveKind = null }) {
    const aggregatedResult = buildAggregatedResult(this.combinedPlan, this.analysis)
    if (!aggregatedResult) { return null }

    const highlights = buildAggregatedHighlights(this.combinedPlan, this.moveObject, aggregatedResult, this.priorBoard)
    const movedPieceInRelation = (
      aggregatedResult.subjectPositions.includes(this.moveObject.endPosition) ||
      aggregatedResult.targetPositions.includes(this.moveObject.endPosition)
    )

    return {
      priorBoard: this.priorBoard,
      afterBoard: this.afterBoard,
      moveObject: this.moveObject,
      result: aggregatedResult,
      highlights,
      variantType: movedPieceInRelation ? 'involved' : 'separate',
      geometryKey,
      movedPieceInRelation,
      moveKind: moveKind ?? moveKindForMoveObject(this.moveObject),
      sound: soundForMove(this.priorBoard, this.afterBoard, this.moveObject),
      generationPath
    }
  }
}
