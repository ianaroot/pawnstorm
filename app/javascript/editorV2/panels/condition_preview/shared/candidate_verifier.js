import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import { legalPriorTurnState } from './example_utils'

// Judges whether a Candidate satisfies a chain. One verifier is created per
// pipeline call and reused across every candidate the pipeline considers,
// so the underlying ConditionEvaluatorV2 instance is shared.
//
// isLegal — chess-rules check (move not flagged illegal, prior turn state
//   doesn't leave the moving team's opponent already in check).
// passesEvaluation — every payload in the chain evaluates to true on the
//   candidate's (priorBoard, moveObject) pair.

export class CandidateVerifier {
  constructor({ combinedPlan }) {
    this.combinedPlan = combinedPlan
    this.evaluator = new ConditionEvaluatorV2()
  }

  isLegal(candidate) {
    if (candidate.moveObject.illegal) { return false }
    return legalPriorTurnState(candidate.priorBoard, candidate.moveObject)
  }

  passesEvaluation(candidate) {
    const input = { board: candidate.priorBoard, moveObject: candidate.moveObject }
    return this.combinedPlan.evaluationPayloads.every(payload => this.evaluator.evaluate(payload, input))
  }

  isVerified(candidate) {
    return this.isLegal(candidate) && this.passesEvaluation(candidate)
  }
}
