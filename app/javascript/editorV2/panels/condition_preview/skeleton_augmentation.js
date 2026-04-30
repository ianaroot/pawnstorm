import { controlledSquares } from 'gameplay/board_query_utils'
import { materialValue } from 'gameplay/board_query_utils'
import { adjacentNeighborPositions } from 'editorV2/panels/condition_preview/geometry_utils'
import {
  shuffled, legalPlacementForSpecies, pieceCode, clonePiecesMap, pieceSpecies,
  buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview/board_utils'
import { buildCandidateSkeletons } from 'editorV2/panels/condition_preview/skeleton_builders'
import {
  usesZeroRelationPath, INDIVIDUAL_VALUE_METRIC, AGGREGATE_VALUE_METRIC, PRIOR_BOARD_COMPARISON_SOURCE
} from 'editorV2/panels/condition_preview/comparison_requirements'

const MAX_VALUE_CONTRIBUTORS_PER_SIDE = 4

export function buildAttackOrDefendContributionCandidates({ plan, side, anchorPosition, occupied, random }) {
  if (side === 'subject') {
    return shuffled([...plan.subjectSpeciesPool], random).flatMap(species => {
      const positions = []
      for (let position = 0; position < 64; position += 1) {
        if (occupied.has(position) || position === anchorPosition) { continue }
        const board = buildBoardFromLayout(buildLayoutFromPieces(new Map([
          [position, pieceCode(plan.subjectTeam, species)]
        ])))
        if (!legalPlacementForSpecies(position, species)) { continue }
        if (controlledSquares({ board, attackerPosition: position }).includes(anchorPosition)) {
          positions.push({
            side: 'subject',
            position,
            species,
            piece: pieceCode(plan.subjectTeam, species)
          })
        }
      }
      return shuffled(positions, random)
    })
  }

  const board = buildBoardFromLayout(buildLayoutFromPieces(occupied))
  return shuffled(controlledSquares({ board, attackerPosition: anchorPosition }), random)
    .filter(position => !occupied.has(position))
    .flatMap(position => {
      return shuffled([...plan.targetSpeciesPool], random)
        .filter(species => legalPlacementForSpecies(position, species))
        .map(species => ({
          side: 'target',
          position,
          species,
          piece: pieceCode(plan.targetTeam, species)
        }))
    })
}

export function buildAdjacentContributionCandidates({ plan, side, anchorPosition, occupied, random }) {
  const team = side === 'subject' ? plan.subjectTeam : plan.targetTeam
  const speciesPool = side === 'subject' ? plan.subjectSpeciesPool : plan.targetSpeciesPool
  return shuffled(adjacentNeighborPositions(anchorPosition), random)
    .filter(position => !occupied.has(position) && position !== anchorPosition)
    .flatMap(position => {
      return shuffled([...speciesPool], random)
        .filter(species => legalPlacementForSpecies(position, species))
        .map(species => ({
          side,
          position,
          species,
          piece: pieceCode(team, species)
        }))
    })
}

function descriptorForSide(plan, side) {
  return plan.comparisonDescriptors.find(descriptor => descriptor.side === side) || null
}

function valueBoundsForDescriptor(descriptor) {
  if (!descriptor || descriptor.metric !== AGGREGATE_VALUE_METRIC) { return null }

  const total = Number((descriptor.resolvedTotal ?? descriptor.total) || 0)
  switch (descriptor.comparator) {
    case 'equal_to':
      return { min: total, max: total }
    case 'greater_than':
      return { min: total + 1, max: Infinity }
    case 'greater_than_or_equal_to':
      return { min: total, max: Infinity }
    case 'less_than':
      return { min: 0, max: total - 1 }
    case 'less_than_or_equal_to':
      return { min: 0, max: total }
    default:
      return null
  }
}

function totalWithinBounds(total, bounds) {
  if (!bounds) { return true }
  return total >= bounds.min && total <= bounds.max
}

function valueForSpecies(species) {
  return materialValue(species)
}

function currentRelationValue(skeleton, side) {
  const position = side === 'subject' ? skeleton.subjectPosition : skeleton.targetPosition
  const piece = skeleton.pieces.get(position)
  return piece ? valueForSpecies(pieceSpecies(piece)) : 0
}

function targetValueBounds(plan) {
  return {
    subject: valueBoundsForDescriptor(descriptorForSide(plan, 'subject')),
    target: valueBoundsForDescriptor(descriptorForSide(plan, 'target'))
  }
}

function subjectContributionCandidates({ plan, skeleton, occupied, random }) {
  if (plan.operator === 'shield') { return [] }
  return (plan.operator === 'adjacent'
    ? buildAdjacentContributionCandidates({ plan, side: 'subject', anchorPosition: skeleton.targetPosition, occupied, random })
    : buildAttackOrDefendContributionCandidates({ plan, side: 'subject', anchorPosition: skeleton.targetPosition, occupied, random })
  ).map(candidate => ({ ...candidate, value: valueForSpecies(candidate.species) }))
}

function targetContributionCandidates({ plan, skeleton, occupied, random }) {
  if (plan.operator === 'shield') { return [] }
  return (plan.operator === 'adjacent'
    ? buildAdjacentContributionCandidates({ plan, side: 'target', anchorPosition: skeleton.subjectPosition, occupied, random })
    : buildAttackOrDefendContributionCandidates({ plan, side: 'target', anchorPosition: skeleton.subjectPosition, occupied, random })
  ).map(candidate => ({ ...candidate, value: valueForSpecies(candidate.species) }))
}

function applyContributors(pieces, contributors) {
  contributors.forEach(contributor => {
    pieces.set(contributor.position, contributor.piece)
  })
}

function valueSearch({ candidates, currentTotal, bounds, maxContributors = MAX_VALUE_CONTRIBUTORS_PER_SIDE }) {
  if (totalWithinBounds(currentTotal, bounds)) { return [] }
  if (currentTotal > bounds.max) { return null }

  const uniqueCandidates = []
  const seen = new Set()
  candidates.forEach(candidate => {
    const key = `${candidate.position}:${candidate.species}`
    if (seen.has(key)) { return }
    seen.add(key)
    uniqueCandidates.push(candidate)
  })

  function search(startIndex, runningTotal, chosen) {
    if (totalWithinBounds(runningTotal, bounds)) { return chosen }
    if (chosen.length >= maxContributors) { return null }
    if (runningTotal > bounds.max) { return null }

    for (let index = startIndex; index < uniqueCandidates.length; index += 1) {
      const candidate = uniqueCandidates[index]
      const result = search(index + 1, runningTotal + candidate.value, [...chosen, candidate])
      if (result) { return result }
    }

    return null
  }

  return search(0, currentTotal, [])
}

function independentValueSkeletons({ plan, occupied, random }) {
  const skeletons = []

  shuffled([...plan.subjectSpeciesPool], random).forEach(subjectSpecies => {
    shuffled([...plan.targetSpeciesPool], random).forEach(targetSpecies => {
      buildCandidateSkeletons({ plan, subjectSpecies, targetSpecies }).forEach(skeleton => {
        const positions = Array.from(skeleton.pieces.keys())
        if (positions.some(position => occupied.has(position))) { return }
        skeletons.push({
          skeleton,
          subjectValue: currentRelationValue(skeleton, 'subject'),
          targetValue: currentRelationValue(skeleton, 'target')
        })
      })
    })
  })

  return shuffled(skeletons, random)
}

function augmentShieldForValue({ plan, skeleton, bounds, random }) {
  const pieces = clonePiecesMap(skeleton.pieces)
  let subjectTotal = currentRelationValue(skeleton, 'subject')
  let targetTotal = currentRelationValue(skeleton, 'target')

  if ((bounds.subject && subjectTotal > bounds.subject.max) || (bounds.target && targetTotal > bounds.target.max)) {
    return []
  }

  const additions = []
  const candidates = independentValueSkeletons({ plan, occupied: pieces, random })
  for (let index = 0; index < candidates.length; index += 1) {
    if (totalWithinBounds(subjectTotal, bounds.subject) && totalWithinBounds(targetTotal, bounds.target)) { break }

    const candidate = candidates[index]
    const nextSubjectTotal = subjectTotal + candidate.subjectValue
    const nextTargetTotal = targetTotal + candidate.targetValue
    if ((bounds.subject && nextSubjectTotal > bounds.subject.max) || (bounds.target && nextTargetTotal > bounds.target.max)) {
      continue
    }

    candidate.skeleton.pieces.forEach((piece, position) => {
      pieces.set(position, piece)
    })
    additions.push(candidate.skeleton.geometryKey)
    subjectTotal = nextSubjectTotal
    targetTotal = nextTargetTotal
  }

  if (!totalWithinBounds(subjectTotal, bounds.subject) || !totalWithinBounds(targetTotal, bounds.target)) {
    return []
  }

  return [{
    ...skeleton,
    pieces,
    geometryKey: `${skeleton.geometryKey}:value:${subjectTotal}:${targetTotal}:${additions.join(',')}`
  }]
}

export function augmentSkeletonsForValueComparisons({ plan, skeleton, random }) {
  const bounds = targetValueBounds(plan)
  if (!bounds.subject && !bounds.target) { return [skeleton] }

  if (plan.operator === 'shield') {
    return augmentShieldForValue({ plan, skeleton, bounds, random })
  }

  const subjectTotal = currentRelationValue(skeleton, 'subject')
  const targetTotal = currentRelationValue(skeleton, 'target')
  if ((bounds.subject && subjectTotal > bounds.subject.max) || (bounds.target && targetTotal > bounds.target.max)) {
    return []
  }

  const pieces = clonePiecesMap(skeleton.pieces)
  const occupied = new Map(pieces)

  const subjectContributors = bounds.subject
    ? valueSearch({
      candidates: subjectContributionCandidates({ plan, skeleton, occupied, random }),
      currentTotal: subjectTotal,
      bounds: bounds.subject
    })
    : []
  if (subjectContributors === null) { return [] }
  applyContributors(pieces, subjectContributors)

  const occupiedAfterSubject = new Map(pieces)
  const targetContributors = bounds.target
    ? valueSearch({
      candidates: targetContributionCandidates({ plan, skeleton, occupied: occupiedAfterSubject, random }),
      currentTotal: targetTotal,
      bounds: bounds.target
    })
    : []
  if (targetContributors === null) { return [] }
  applyContributors(pieces, targetContributors)

  return [{
    ...skeleton,
    pieces,
    geometryKey: `${skeleton.geometryKey}:value:${subjectTotal}:${targetTotal}:${subjectContributors.length}:${targetContributors.length}`
  }]
}

export function nextAvailableIndependentSkeletons({ plan, occupied, random }) {
  const subjectSpeciesPool = shuffled([...plan.subjectSpeciesPool], random)
  const targetSpeciesPool = shuffled([...plan.targetSpeciesPool], random)
  const skeletons = []

  subjectSpeciesPool.forEach(subjectSpecies => {
    targetSpeciesPool.forEach(targetSpecies => {
      buildCandidateSkeletons({ plan, subjectSpecies, targetSpecies }).forEach(skeleton => {
        const positions = Array.from(skeleton.pieces.keys())
        if (positions.some(position => occupied.has(position))) { return }
        skeletons.push(skeleton)
      })
    })
  })

  return shuffled(skeletons, random)
}

export function addContributorsForSide({ plan, pieces, side, neededCount, anchorPosition, random }) {
  if (neededCount <= 0) { return true }

  const occupied = new Map(pieces)
  const candidates = plan.operator === 'adjacent'
    ? buildAdjacentContributionCandidates({ plan, side, anchorPosition, occupied, random })
    : buildAttackOrDefendContributionCandidates({ plan, side, anchorPosition, occupied, random })

  let added = 0
  for (let index = 0; index < candidates.length && added < neededCount; index += 1) {
    const candidate = candidates[index]
    if (pieces.has(candidate.position)) { continue }
    pieces.set(candidate.position, candidate.piece)
    added += 1
  }

  return added === neededCount
}

export function augmentExistingRelation({ plan, skeleton, requirements, random }) {
  const desiredSubjectCount = requirements.subject
  const desiredTargetCount = requirements.target
  const subjectIncrement = Math.max(0, desiredSubjectCount - 1)
  const targetIncrement = Math.max(0, desiredTargetCount - 1)

  if (plan.operator === 'shield' && desiredSubjectCount !== desiredTargetCount) {
    return []
  }

  const pieces = clonePiecesMap(skeleton.pieces)

  if (plan.operator === 'shield') {
    let extraSubjectsNeeded = subjectIncrement
    let extraTargetsNeeded = targetIncrement

    while (extraSubjectsNeeded > 0 || extraTargetsNeeded > 0) {
      const independentSkeletons = nextAvailableIndependentSkeletons({ plan, occupied: pieces, random })
      const extraSkeleton = independentSkeletons[0]
      if (!extraSkeleton) { break }

      extraSkeleton.pieces.forEach((piece, position) => {
        pieces.set(position, piece)
      })
      extraSubjectsNeeded = Math.max(0, extraSubjectsNeeded - 1)
      extraTargetsNeeded = Math.max(0, extraTargetsNeeded - 1)
    }

    if (extraSubjectsNeeded > 0 || extraTargetsNeeded > 0) { return [] }
    return [{
      ...skeleton,
      pieces,
      geometryKey: `${skeleton.geometryKey}:count:${desiredSubjectCount}:${desiredTargetCount}`
    }]
  }

  const subjectOkay = addContributorsForSide({
    plan,
    pieces,
    side: 'subject',
    neededCount: subjectIncrement,
    anchorPosition: skeleton.targetPosition,
    random
  })
  if (!subjectOkay) { return [] }

  const targetOkay = addContributorsForSide({
    plan,
    pieces,
    side: 'target',
    neededCount: targetIncrement,
    anchorPosition: skeleton.subjectPosition,
    random
  })
  if (!targetOkay) { return [] }

  return [{
    ...skeleton,
    pieces,
    geometryKey: `${skeleton.geometryKey}:count:${desiredSubjectCount}:${desiredTargetCount}`
  }]
}

export function augmentSkeletonsForComparisons({ plan, skeleton, random }) {
  const requirements = plan.requirements
  if (!requirements.comparisonsPresent) { return [skeleton] }

  const hasAggregate = plan.comparisonDescriptors.some(descriptor =>
    descriptor.metric === AGGREGATE_VALUE_METRIC && descriptor.source !== PRIOR_BOARD_COMPARISON_SOURCE
  )

  let skeletons = [skeleton]

  if (hasAggregate) {
    skeletons = skeletons.flatMap(s => augmentSkeletonsForValueComparisons({ plan, skeleton: s, random }))
    if (skeletons.length === 0) { return [] }
  }

  const hasCountRequirement = requirements.exactCountComparisonsPresent &&
    requirements.subject !== null && requirements.target !== null &&
    requirements.subject >= 0 && requirements.target >= 0 &&
    !usesZeroRelationPath(requirements)

  if (!hasCountRequirement) { return skeletons }

  return skeletons.flatMap(s => augmentExistingRelation({ plan, skeleton: s, requirements, random }))
}
