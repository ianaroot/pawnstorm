import { controlledSquares } from 'gameplay/board_query_utils'
import { adjacentNeighborPositions } from 'editorV2/panels/condition_preview/geometry_utils'
import {
  shuffled, legalPlacementForSpecies, pieceCode, clonePiecesMap,
  buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview/board_utils'
import { buildCandidateSkeletons } from 'editorV2/panels/condition_preview/skeleton_builders'
import { usesZeroRelationPath } from 'editorV2/panels/condition_preview/comparison_requirements'

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
  if (requirements.subject === null || requirements.target === null) { return [] }
  if (requirements.subject < 0 || requirements.target < 0) { return [] }
  if (usesZeroRelationPath(requirements)) { return [] }

  return augmentExistingRelation({ plan, skeleton, requirements, random })
}
