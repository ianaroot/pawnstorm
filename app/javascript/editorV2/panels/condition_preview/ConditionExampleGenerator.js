import Board from 'gameplay/board'
import { shuffled, pushUnique } from 'editorV2/panels/condition_preview/board_utils'
import { buildCandidateSkeletons } from 'editorV2/panels/condition_preview/skeleton_builders'
import {
  COUNT_COMPARISON_METRIC, EXACT_NUMBER_COMPARISON_SOURCE, PRIOR_BOARD_COMPARISON_SOURCE,
  comparisonDescriptors, comparisonRequirements, usesZeroRelationPath
} from 'editorV2/panels/condition_preview/comparison_requirements'
import { MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, candidateSpecies } from 'editorV2/panels/condition_preview/example_utils'
import { buildExampleVariantPlan } from 'editorV2/panels/condition_preview/relational_utils'
import { augmentSkeletonsForComparisons } from 'editorV2/panels/condition_preview/skeleton_augmentation'
import { collectVerifiedExamples, buildZeroRelationExamples } from 'editorV2/panels/condition_preview/candidate_collection'
import { varietySignature, bucketKeyForExample } from 'editorV2/panels/condition_preview/diversity_selection'
import { finalizeExamples, mergeMoveKindExamples } from 'editorV2/panels/condition_preview/enrichment'
import { collectCastleExamples } from 'editorV2/panels/condition_preview/special_move_examples'

const MAX_DEFAULT_EXAMPLES = 30
const MAX_CANDIDATE_POOL = 120
const MAX_BUILD_ATTEMPTS = 1200
const MAX_EXAMPLES_PER_BUCKET = 8

const SUPPORTED_RELATIONAL_OPERATORS = new Set(['attack', 'defend', 'adjacent', 'shield'])
const SUPPORTED_RELATIONAL_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'])
const FILTER_LABELS = Object.freeze({
  allied: 'Allied',
  enemy: 'Enemy',
  moved_piece: 'Moved piece',
  enemy_moved_piece: 'Enemy moved piece',
  captured_piece: 'Captured piece',
  enemy_captured_piece: 'Enemy captured piece'
})

function generationContext(options = {}) {
  return {
    movingTeam: options.movingTeam || Board.WHITE,
    moveKinds: options.moveKinds || [MOVE_KIND_STANDARD, MOVE_KIND_CASTLE]
  }
}

function actorLabel(actor) {
  return FILTER_LABELS[actor] || actor
}

function supportStatus(payload) {
  if (!payload?.kind) {
    return { status: 'unsupported', reason: 'Condition preview is not available for this condition yet.' }
  }

  if (payload.kind !== 'relational') {
    return { status: 'unsupported', reason: 'Unary previews are not supported yet.' }
  }

  if (payload.operator === 'cover') {
    return { status: 'unsupported', reason: 'Cover previews are not supported yet.' }
  }

  if (!SUPPORTED_RELATIONAL_OPERATORS.has(payload.operator)) {
    return { status: 'unsupported', reason: `${payload.operator} previews are not supported yet.` }
  }

  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.subject)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.subject)} previews are not supported yet.` }
  }

  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.target)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.target)} previews are not supported yet.` }
  }

  const comparisons = comparisonDescriptors(payload)
  if (comparisons.length > 0) {
    for (let index = 0; index < comparisons.length; index += 1) {
      const descriptor = comparisons[index]
      if (descriptor.source === PRIOR_BOARD_COMPARISON_SOURCE) {
        return {
          status: 'unsupported',
          reason: 'Prior-board relational comparisons are not supported yet.'
        }
      }
      if (descriptor.metric === 'value') {
        return {
          status: 'unsupported',
          reason: 'Value-based relational comparisons are not supported yet.'
        }
      }
      if (descriptor.metric !== COUNT_COMPARISON_METRIC) {
        return {
          status: 'unsupported',
          reason: `${descriptor.metric} relational comparisons are not supported yet.`
        }
      }
      if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) {
        return {
          status: 'unsupported',
          reason: 'This relational comparison source is not supported yet.'
        }
      }
    }
  }

  return { status: 'supported', reason: null }
}

function workItemKey(item) {
  return [
    item.subjectSpecies,
    item.targetSpecies,
    item.variant.type,
    item.skeleton.geometryKey
  ].join('|')
}

function buildWorkItems({ payload, subjectSpeciesPool, targetSpeciesPool, variants, random }) {
  const items = []

  subjectSpeciesPool.forEach(subjectSpecies => {
    targetSpeciesPool.forEach(targetSpecies => {
      const skeletons = shuffled(buildCandidateSkeletons({ payload, subjectSpecies, targetSpecies }), random)
      skeletons.forEach(skeleton => {
        variants.forEach(variant => {
          items.push({ subjectSpecies, targetSpecies, skeleton, variant })
        })
      })
    })
  })

  return shuffled(items, random)
}

function scheduleWorkItems(items, random) {
  const queue = []
  const seen = new Set()
  const bySubject = new Map()
  const byTarget = new Map()
  const byPair = new Map()

  items.forEach(item => {
    const subjectKey = item.subjectSpecies
    const targetKey = item.targetSpecies
    const pairKey = `${subjectKey}|${targetKey}`

    if (!bySubject.has(subjectKey)) { bySubject.set(subjectKey, []) }
    if (!byTarget.has(targetKey)) { byTarget.set(targetKey, []) }
    if (!byPair.has(pairKey)) { byPair.set(pairKey, []) }

    bySubject.get(subjectKey).push(item)
    byTarget.get(targetKey).push(item)
    byPair.get(pairKey).push(item)
  })

  const roundRobinAppend = (groups) => {
    const buckets = shuffled(Array.from(groups.values()).map(group => shuffled(group, random)), random)
    let progressed = true

    while (progressed) {
      progressed = false
      buckets.forEach(bucket => {
        const item = bucket.shift()
        if (!item) { return }
        pushUnique(queue, seen, item, workItemKey(item))
        progressed = true
      })
    }
  }

  roundRobinAppend(bySubject)
  roundRobinAppend(byTarget)
  roundRobinAppend(byPair)
  shuffled(items, random).forEach(item => {
    pushUnique(queue, seen, item, workItemKey(item))
  })

  return queue
}

export function generateConditionExamples(payload, options = {}) {
  const maxExamples = options.maxExamples || MAX_DEFAULT_EXAMPLES
  const random = options.random || Math.random
  const context = generationContext(options)
  const support = supportStatus(payload)
  if (support.status !== 'supported') {
    return {
      status: support.status,
      reason: support.reason,
      examples: []
    }
  }

  let verified = []
  if (context.moveKinds.includes(MOVE_KIND_STANDARD)) {
    const variants = buildExampleVariantPlan(payload)
    const subjectSpeciesPool = shuffled(candidateSpecies(payload.subjectFilter || 'any', payload.subjectFilterMode || null), random)
    const targetSpeciesPool = shuffled(candidateSpecies(payload.targetFilter || 'any', payload.targetFilterMode || null), random)
    const workQueue = scheduleWorkItems(
      buildWorkItems({ payload, subjectSpeciesPool, targetSpeciesPool, variants, random }),
      random
    )
    const buckets = new Map()
    const seenSignatures = new Set()
    let totalExamples = 0
    let attempts = 0

    for (let index = 0; index < workQueue.length; index += 1) {
      attempts += 1
      if (attempts > MAX_BUILD_ATTEMPTS || totalExamples >= MAX_CANDIDATE_POOL) { break }

      const item = workQueue[index]
      const augmentedSkeletons = augmentSkeletonsForComparisons({
        payload,
        skeleton: item.skeleton,
        random
      })

      for (let skeletonIndex = 0; skeletonIndex < augmentedSkeletons.length; skeletonIndex += 1) {
        const examples = collectVerifiedExamples({
          payload,
          skeleton: augmentedSkeletons[skeletonIndex],
          variant: item.variant,
          random
        })

        for (let exampleIndex = 0; exampleIndex < examples.length; exampleIndex += 1) {
          const example = examples[exampleIndex]
          const signature = varietySignature(example)
          if (seenSignatures.has(signature)) { continue }

          const key = bucketKeyForExample(example)
          const bucket = buckets.get(key) || []
          if (bucket.length >= MAX_EXAMPLES_PER_BUCKET) { continue }

          seenSignatures.add(signature)
          bucket.push(example)
          buckets.set(key, bucket)
          totalExamples += 1

          if (totalExamples >= MAX_CANDIDATE_POOL) { break }
        }

        if (totalExamples >= MAX_CANDIDATE_POOL) { break }
      }
    }

    verified = Array.from(buckets.values()).flat()
  }
  const castleExamples = context.moveKinds.includes(MOVE_KIND_CASTLE)
    ? collectCastleExamples({ payload, random, movingTeam: context.movingTeam, maxExamples: MAX_CANDIDATE_POOL })
    : []
  if (verified.length === 0 && usesZeroRelationPath(comparisonRequirements(payload))) {
    const zeroExamples = buildZeroRelationExamples({ payload, random, maxExamples: MAX_CANDIDATE_POOL })
    if (zeroExamples.length > 0) {
      return {
        status: 'ready',
        reason: null,
        examples: finalizeExamples(zeroExamples, payload, maxExamples, random)
      }
    }
  }

  if (verified.length === 0 && castleExamples.length === 0) {
    return {
      status: 'no_examples',
      reason: "Couldn't build a verified example for this condition yet. This may mean the condition is unsatisfiable, or that the preview generator still needs work.",
      examples: []
    }
  }

  return {
    status: 'ready',
    reason: null,
    examples: mergeMoveKindExamples({
      standardExamples: verified,
      castleExamples,
      payload,
      maxExamples,
      random
    })
  }
}

export default generateConditionExamples
