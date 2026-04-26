import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import { candidateSpecies } from 'editorV2/panels/condition_preview/example_utils'

export function teamForActor(actor) {
  return actor === 'allied' || actor === 'moved_piece' ? Board.WHITE : Board.BLACK
}

export function roleRequiresMovedPiece(actor) {
  return actor === 'moved_piece'
}

export function roleRequiresEnemyMovedPiece(actor) {
  return actor === 'enemy_moved_piece'
}

export function relationalActorRequiresPresence(actor) {
  return roleRequiresMovedPiece(actor) || roleRequiresEnemyMovedPiece(actor)
}

export function relationParams(payload) {
  return {
    subject: payload.subject,
    subjectFilter: payload.subjectFilter || 'any',
    subjectFilterMode: payload.subjectFilterMode || null,
    operator: payload.operator,
    target: payload.target,
    targetFilter: payload.targetFilter || 'any',
    targetFilterMode: payload.targetFilterMode || null
  }
}

export function subjectTargetLabels(payload, moveObject, result) {
  const startPosition = moveObject.startPosition
  const endPosition = moveObject.endPosition
  const priorSubjectPositions = payload.subject === 'moved_piece' ? [startPosition] : result.subjectPositions
  const priorTargetPositions = payload.target === 'moved_piece' ? [startPosition] : result.targetPositions

  return {
    prior: {
      subjectPositions: priorSubjectPositions,
      targetPositions: priorTargetPositions,
      movedStartPosition: startPosition,
      movedEndPosition: null
    },
    after: {
      subjectPositions: result.subjectPositions,
      targetPositions: result.targetPositions,
      movedStartPosition: null,
      movedEndPosition: endPosition
    }
  }
}

export function buildExampleVariantPlan(payload) {
  if (roleRequiresMovedPiece(payload.subject) || roleRequiresMovedPiece(payload.target)) {
    return [{ type: 'required', label: 'Moved Piece Required' }]
  }

  const alliedRoles = [
    payload.subject === 'allied' ? 'subject' : null,
    payload.target === 'allied' ? 'target' : null
  ].filter(Boolean)

  if (alliedRoles.length === 0) {
    return [{ type: 'separate', label: 'Moved Piece Separate' }]
  }

  return [
    { type: 'involved', label: 'Moved Piece Involved' },
    { type: 'separate', label: 'Moved Piece Not Involved' }
  ]
}

export function candidateLabel(variant, payload) {
  if (variant.type === 'required') { return '' }
  return variant.label
}

export function sideSpeciesPool(payload, side) {
  const filter = side === 'subject' ? (payload.subjectFilter || 'any') : (payload.targetFilter || 'any')
  const filterMode = side === 'subject' ? (payload.subjectFilterMode || null) : (payload.targetFilterMode || null)
  return candidateSpecies(filter, filterMode)
}

export function evaluateCandidate({ payload, priorBoard, moveObject }) {
  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject }
  if (!evaluator.evaluate(payload, input)) { return null }

  const analysis = new CandidateMoveAnalysisV2(input)
  const result = analysis.relationalResult(relationParams(payload))
  if (result.pairs.length === 0) { return null }

  return result
}
