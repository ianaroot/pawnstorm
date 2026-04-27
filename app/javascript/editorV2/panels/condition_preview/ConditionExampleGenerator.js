import { shuffled, pushUnique } from 'editorV2/panels/condition_preview/board_utils'
import { buildCandidateSkeletons } from 'editorV2/panels/condition_preview/skeleton_builders'
import { usesZeroRelationPath, valueComparisonAllowsEmpty } from 'editorV2/panels/condition_preview/comparison_requirements'
import { MOVE_KIND_STANDARD, MOVE_KIND_CASTLE } from 'editorV2/panels/condition_preview/example_utils'
import { augmentSkeletonsForComparisons } from 'editorV2/panels/condition_preview/skeleton_augmentation'
import { collectVerifiedExamples, buildZeroRelationExamples } from 'editorV2/panels/condition_preview/candidate_collection'
import { varietySignature, bucketKeyForExample } from 'editorV2/panels/condition_preview/diversity_selection'
import { finalizeExamples, mergeMoveKindExamples } from 'editorV2/panels/condition_preview/enrichment'
import { collectCastleExamples } from 'editorV2/panels/condition_preview/special_move_examples'
import { buildRelationalPlan, expandRelationalPlanSources } from 'editorV2/panels/condition_preview/generation_plan'

const MAX_DEFAULT_EXAMPLES = 30
const MAX_CANDIDATE_POOL = 120
const MAX_BUILD_ATTEMPTS = 1200
const MAX_EXAMPLES_PER_BUCKET = 8

function workItemKey(item) {
  return [
    item.subjectSpecies,
    item.targetSpecies,
    item.variant.type,
    item.skeleton.geometryKey
  ].join('|')
}

function buildWorkItems({ plan, random }) {
  const items = []

  shuffled([...plan.subjectSpeciesPool], random).forEach(subjectSpecies => {
    shuffled([...plan.targetSpeciesPool], random).forEach(targetSpecies => {
      const skeletons = shuffled(buildCandidateSkeletons({ plan, subjectSpecies, targetSpecies }), random)
      skeletons.forEach(skeleton => {
        plan.variants.forEach(variant => {
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
  const totalMs = options.maxMs ?? 500

  const plan = buildRelationalPlan(payload, options)
  if (plan.status !== 'supported') {
    return { status: plan.status, reason: plan.reason, examples: [] }
  }

  const plans = expandRelationalPlanSources(plan)
  const perPlanMs = totalMs / plans.length

  let verified = []
  let castleExamples = []
  let zeroExamples = []

  plans.forEach(activePlan => {
    const planDeadline = Date.now() + perPlanMs
    if (activePlan.moveKinds.includes(MOVE_KIND_STANDARD)) {
      const workQueue = scheduleWorkItems(buildWorkItems({ plan: activePlan, random }), random)
      const buckets = new Map()
      const seenSignatures = new Set()
      let totalExamples = 0
      let attempts = 0

      for (let index = 0; index < workQueue.length; index += 1) {
        attempts += 1
        if (attempts > MAX_BUILD_ATTEMPTS || totalExamples >= MAX_CANDIDATE_POOL || Date.now() > planDeadline) { break }

        const item = workQueue[index]
        const augmentedSkeletons = augmentSkeletonsForComparisons({ plan: activePlan, skeleton: item.skeleton, random })

        for (let skeletonIndex = 0; skeletonIndex < augmentedSkeletons.length; skeletonIndex += 1) {
          const examples = collectVerifiedExamples({ plan: activePlan, skeleton: augmentedSkeletons[skeletonIndex], variant: item.variant, random })

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

      verified = [...verified, ...shuffled(Array.from(buckets.values()).flat(), random)]
    }

    if (activePlan.moveKinds.includes(MOVE_KIND_CASTLE)) {
      castleExamples = [...castleExamples, ...collectCastleExamples({ plan: activePlan, random, maxExamples: MAX_CANDIDATE_POOL })]
    }

    if (usesZeroRelationPath(activePlan.requirements) || valueComparisonAllowsEmpty(activePlan.comparisonDescriptors)) {
      zeroExamples = [...zeroExamples, ...buildZeroRelationExamples({ plan: activePlan, random, maxExamples: MAX_CANDIDATE_POOL })]
    }
  })

  if (verified.length > 0 && zeroExamples.length > 0) {
    const cappedZero = zeroExamples.length > verified.length
      ? shuffled([...zeroExamples], random).slice(0, verified.length)
      : zeroExamples
    verified = shuffled([...verified, ...cappedZero], random)
  } else if (verified.length === 0 && zeroExamples.length > 0) {
    return { status: 'ready', reason: null, examples: finalizeExamples(zeroExamples, plans[0], maxExamples, random) }
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
    examples: mergeMoveKindExamples({ standardExamples: verified, castleExamples, plan: plans[0], maxExamples, random })
  }
}

export default generateConditionExamples
