import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import generateConditionExamples from 'editorV2/panels/condition_preview/ConditionExampleGenerator'
import { shuffled } from 'editorV2/panels/condition_preview/board_utils'
import { buildRelationalPlan } from 'editorV2/panels/condition_preview/generation_plan'
import { subjectTargetLabels } from 'editorV2/panels/condition_preview/relational_utils'

const DEFAULT_MAX_EXAMPLES = 30
const NO_EXAMPLES_REASON = "Couldn't build a verified example for this condition chain yet. This may mean the chain is unsatisfiable, or that the preview generator still needs work."

function chainExampleIdentity(example) {
  return JSON.stringify({
    prior: example.priorBoard.layOut,
    after: example.afterBoard.layOut,
    recentMoveContext: example.priorBoard.recentMoveContext || null,
    startPosition: example.moveObject.startPosition,
    endPosition: example.moveObject.endPosition,
    pieceNotation: example.moveObject.pieceNotation || null,
    captureNotation: example.moveObject.captureNotation || null,
    promotionPiece: example.moveObject.promotionPiece || null
  })
}

function unionPositions(set, positions = []) {
  positions.forEach(position => set.add(position))
}

function aggregateHighlights(plans, moveObject, results) {
  const priorSubjectPositions = new Set()
  const priorTargetPositions = new Set()
  const afterSubjectPositions = new Set()
  const afterTargetPositions = new Set()

  results.forEach((result, index) => {
    const labels = subjectTargetLabels(plans[index], moveObject, result)
    unionPositions(priorSubjectPositions, labels.prior.subjectPositions)
    unionPositions(priorTargetPositions, labels.prior.targetPositions)
    unionPositions(afterSubjectPositions, labels.after.subjectPositions)
    unionPositions(afterTargetPositions, labels.after.targetPositions)
  })

  return {
    prior: {
      subjectPositions: [...priorSubjectPositions],
      targetPositions: [...priorTargetPositions],
      movedStartPosition: moveObject.startPosition,
      movedEndPosition: null
    },
    after: {
      subjectPositions: [...afterSubjectPositions],
      targetPositions: [...afterTargetPositions],
      movedStartPosition: null,
      movedEndPosition: moveObject.endPosition
    }
  }
}

function buildChainExample(example, plans) {
  const input = { board: example.priorBoard, moveObject: example.moveObject }
  const analysis = new CandidateMoveAnalysisV2(input)
  const results = plans.map(plan => analysis.relationalResult(plan.relationParams))

  return {
    ...example,
    chainResults: results,
    result: results[0],
    highlights: aggregateHighlights(plans, example.moveObject, results)
  }
}

export function generateConditionChainExamples(payloads, options = {}) {
  const maxExamples = options.maxExamples || DEFAULT_MAX_EXAMPLES
  const random = options.random || Math.random

  if (!Array.isArray(payloads) || payloads.length === 0) {
    return {
      status: 'unsupported',
      reason: 'Select a single linear chain of condition nodes to preview.',
      examples: []
    }
  }

  const plans = []
  for (let index = 0; index < payloads.length; index += 1) {
    const payload = payloads[index]
    if (payload?.kind !== 'relational') {
      return {
        status: 'unsupported',
        reason: 'Unary condition previews are not supported yet.',
        examples: []
      }
    }

    const plan = buildRelationalPlan(payload, options)
    if (plan.status !== 'supported') {
      return { status: plan.status, reason: plan.reason, examples: [] }
    }
    plans.push(plan)
  }

  const msPerPayload = Math.floor((options.maxMs ?? 500) / payloads.length)
  const candidateExamples = []
  payloads.forEach(payload => {
    const preview = generateConditionExamples(payload, { ...options, maxExamples, maxMs: msPerPayload })
    if (preview.status === 'ready') {
      candidateExamples.push(...preview.examples)
    }
  })

  if (candidateExamples.length === 0) {
    return { status: 'no_examples', reason: NO_EXAMPLES_REASON, examples: [] }
  }

  const evaluator = new ConditionEvaluatorV2()
  const acceptedExamples = []
  const seen = new Set()

  shuffled(candidateExamples, random).forEach(example => {
    if (acceptedExamples.length >= maxExamples) { return }

    const identity = chainExampleIdentity(example)
    if (seen.has(identity)) { return }

    const input = { board: example.priorBoard, moveObject: example.moveObject }
    const satisfiesChain = payloads.every(payload => evaluator.evaluate(payload, input))
    if (!satisfiesChain) { return }

    seen.add(identity)
    acceptedExamples.push(buildChainExample(example, plans))
  })

  if (acceptedExamples.length === 0) {
    return { status: 'no_examples', reason: NO_EXAMPLES_REASON, examples: [] }
  }

  return { status: 'ready', reason: null, examples: acceptedExamples }
}

export default generateConditionChainExamples
