import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import { nextPositionOnRay } from 'gameplay/board_query_utils'
import { candidateSpecies } from 'editorV2/panels/condition_preview/example_utils'

function rayStepBetween(fromPosition, toPosition) {
  const fileDiff = Board.fileIndex(toPosition) - Board.fileIndex(fromPosition)
  const rankDiff = Board.rankIndex(toPosition) - Board.rankIndex(fromPosition)
  if (fileDiff === 0 && rankDiff !== 0) { return rankDiff > 0 ? 8 : -8 }
  if (rankDiff === 0 && fileDiff !== 0) { return fileDiff > 0 ? 1 : -1 }
  if (Math.abs(fileDiff) === Math.abs(rankDiff)) {
    if (fileDiff > 0 && rankDiff > 0) { return 9 }
    if (fileDiff < 0 && rankDiff > 0) { return 7 }
    if (fileDiff > 0 && rankDiff < 0) { return -7 }
    if (fileDiff < 0 && rankDiff < 0) { return -9 }
  }
  return null
}

function shieldAttackerPositions(pairs, board) {
  const attackers = new Set()
  pairs.forEach(({ subjectPosition, targetPosition }) => {
    const stepToTarget = rayStepBetween(subjectPosition, targetPosition)
    if (stepToTarget === null) { return }
    const stepToAttacker = -stepToTarget
    for (let pos = nextPositionOnRay(subjectPosition, stepToAttacker); pos !== null; pos = nextPositionOnRay(pos, stepToAttacker)) {
      if (!board.positionEmpty(pos)) {
        attackers.add(pos)
        break
      }
    }
  })
  return [...attackers]
}

export function relationalTeamForActor(actor) {
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

export function relationalActorLabels(plan, moveObject, result, board = null) {
  const startPosition = moveObject.startPosition
  const endPosition = moveObject.endPosition
  const priorSubjectPositions = plan.subject === 'moved_piece' ? [startPosition] : result.subjectPositions
  const priorTargetPositions = plan.target === 'moved_piece' ? [startPosition] : result.targetPositions

  const attackers = (plan.operator === 'shield' && board && result.pairs?.length > 0)
    ? shieldAttackerPositions(result.pairs, board)
    : []

  return {
    prior: {
      subjectPositions: [...(priorSubjectPositions || []), ...attackers],
      targetPositions: priorTargetPositions,
      movedStartPosition: startPosition,
      movedEndPosition: null
    },
    after: {
      subjectPositions: [...(result.subjectPositions || []), ...attackers],
      targetPositions: result.targetPositions,
      movedStartPosition: null,
      movedEndPosition: endPosition
    }
  }
}

export function buildExampleVariantPlan(payload) {
  if (roleRequiresMovedPiece(payload.subject) || roleRequiresMovedPiece(payload.target)) {
    return [{ type: 'required' }]
  }

  const alliedRoles = [
    payload.subject === 'allied' ? 'subject' : null,
    payload.target === 'allied' ? 'target' : null
  ].filter(Boolean)

  if (alliedRoles.length === 0) {
    return [{ type: 'separate' }]
  }

  return [
    { type: 'involved' },
    { type: 'separate' }
  ]
}

export function sideSpeciesPool(payload, side) {
  const filter = side === 'subject' ? (payload.subjectFilter || 'any') : (payload.targetFilter || 'any')
  const filterMode = side === 'subject' ? (payload.subjectFilterMode || null) : (payload.targetFilterMode || null)
  return candidateSpecies(filter, filterMode)
}

export function evaluateRelationalCandidate({ plan, priorBoard, moveObject }) {
  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject }
  if (!evaluator.evaluate(plan.evaluationPayload, input)) { return null }

  const analysis = new CandidateMoveAnalysisV2(input)
  const result = analysis.relationalResult(plan.relationParams)
  if (result.pairs.length === 0) { return null }

  return result
}
