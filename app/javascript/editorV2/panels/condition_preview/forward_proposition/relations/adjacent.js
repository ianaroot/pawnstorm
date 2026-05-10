import {
  shuffled, legalPlacementForSpecies, WEIGHTED_SPECIES_DISTRIBUTION
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { adjacentNeighborPositions } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  matchesSide, candidatesForSide, applyOne, regionAllows,
  requirementsMet, MAX_SATISFY_ITERATIONS
} from './relation_helpers'

export function satisfyAdjacent(relation, pieces, ctx, random) {
  if (adjacentRequirementsMet(relation, pieces)) { return pieces }
  let next = pieces
  for (let i = 0; i < MAX_SATISFY_ITERATIONS; i += 1) {
    if (adjacentRequirementsMet(relation, next)) { return next }
    const placed = tryPlace(relation, next, ctx, random)
    if (placed === null || placed === next) { return null }
    next = placed
  }
  return adjacentRequirementsMet(relation, next) ? next : null
}

function adjacentRequirementsMet(relation, pieces) {
  const { activeSubjects, activeTargets } = activeAdjacentSets(relation, pieces)
  return requirementsMet({
    subjectSide: relation.subjectSide,
    targetSide: relation.targetSide,
    activeSubjects, activeTargets, pieces
  })
}

function activeAdjacentSets(relation, pieces) {
  const activeSubjects = new Set()
  const activeTargets = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    let hasMatch = false
    for (const sPos of adjacentNeighborPositions(tPos)) {
      if (matchesSide(pieces.get(sPos), relation.subjectSide)) {
        activeSubjects.add(sPos)
        hasMatch = true
      }
    }
    if (hasMatch) { activeTargets.add(tPos) }
  }
  return { activeSubjects, activeTargets }
}

function tryPlace(relation, pieces, ctx, random) {
  const targetCandidates = shuffled(candidatesForSide(relation.targetSide, pieces), random)
  for (const target of targetCandidates) {
    const piecesWithTarget = applyOne(pieces, target, ctx)
    if (piecesWithTarget === null) { continue }

    const subjectCandidates = shuffled(
      subjectsAdjacentTo(relation.subjectSide, target.position, piecesWithTarget),
      random
    )
    for (const subject of subjectCandidates) {
      const next = applyOne(piecesWithTarget, subject, ctx)
      if (next === null) { continue }
      if (next.size === pieces.size) { continue }
      return next
    }
  }
  return null
}

function subjectsAdjacentTo(side, targetPos, pieces) {
  const candidates = []
  for (const sPos of adjacentNeighborPositions(targetPos)) {
    const piece = pieces.get(sPos)
    if (matchesSide(piece, side)) {
      candidates.push({ kind: 'existing', position: sPos, species: piece.slice(1) })
    }
  }
  for (const species of WEIGHTED_SPECIES_DISTRIBUTION) {
    if (!side.species_set.has(species)) { continue }
    for (const sPos of adjacentNeighborPositions(targetPos)) {
      if (pieces.has(sPos)) { continue }
      if (!legalPlacementForSpecies(sPos, species)) { continue }
      if (!regionAllows(side.region, sPos)) { continue }
      candidates.push({ kind: 'fresh', position: sPos, species, team: side.team })
    }
  }
  return candidates
}
