import { shuffled, WEIGHTED_SPECIES_DISTRIBUTION } from 'editorV2/panels/condition_preview/shared/board_utils'
import { legalPlacementForSpecies } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { adjacentNeighborPositions } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  matchesSide, candidatesForSide, applyOne, regionPossiblyContains,
  requirementsMet, boundSingularInActiveSet, sideAllowsPos
} from './relation_helpers'
import { runAnchoredSatisfier } from './anchored'

export function satisfyAdjacent(relation, pieces, ctx, random) {
  if (relation.subjectSide.count_range.max === 0 || relation.targetSide.count_range.max === 0) {
    return pieces
  }
  if (adjacentRequirementsMet(relation, pieces, ctx)) { return pieces }

  return runAnchoredSatisfier({
    relation, pieces, ctx, random,
    requirementsMet: adjacentRequirementsMet,
    tryAnchored, tryPlace
  })
}

function tryAnchored(relation, variant, pieces, ctx, random) {
  const anchorPos = variant.position
  if (anchorPos === null || !pieces.has(anchorPos)) { return null }

  if (variant.role === 'target') {
    // Anchor is the target; place a fresh subject adjacent to it.
    for (const subject of shuffled(subjectsAdjacentTo(relation.subjectSide, anchorPos, pieces), random)) {
      if (subject.kind === 'existing') { continue }
      const placed = applyOne(pieces, subject, ctx)
      if (placed !== null && placed !== pieces) { return placed }
    }
    return null
  }

  // Anchor is the subject (already on the board); place a target on a square
  // adjacent to it.
  for (const pos of shuffled(adjacentNeighborPositions(anchorPos), random)) {
    if (pieces.has(pos)) { continue }
    for (const species of shuffled([...relation.targetSide.species_set].filter(s => s !== null), random)) {
      if (!legalPlacementForSpecies(pos, species)) { continue }
      if (!regionPossiblyContains(relation.targetSide.region, pos)) { continue }
      const placed = applyOne(pieces, { kind: 'fresh', position: pos, species, team: relation.targetSide.team }, ctx)
      if (placed !== null && placed !== pieces) { return placed }
    }
  }
  return null
}

function adjacentRequirementsMet(relation, pieces, ctx) {
  const { activeSubjects, activeTargets } = activeAdjacentSets(relation, pieces)
  if (!boundSingularInActiveSet(relation.subjectSide, activeSubjects, ctx)) { return false }
  if (!boundSingularInActiveSet(relation.targetSide, activeTargets, ctx)) { return false }
  return requirementsMet({
    subjectSide: relation.subjectSide,
    targetSide: relation.targetSide,
    activeSubjects, activeTargets, pieces
  })
}

export function activeAdjacentSets(relation, pieces, _board = null) {
  const activeSubjects = new Set()
  const activeTargets = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    if (!sideAllowsPos(relation.targetSide, tPos)) { continue }
    let hasMatch = false
    for (const sPos of adjacentNeighborPositions(tPos)) {
      if (!matchesSide(pieces.get(sPos), relation.subjectSide)) { continue }
      if (!sideAllowsPos(relation.subjectSide, sPos)) { continue }
      activeSubjects.add(sPos)
      hasMatch = true
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
      if (!regionPossiblyContains(side.region, sPos)) { continue }
      candidates.push({ kind: 'fresh', position: sPos, species, team: side.team })
    }
  }
  return candidates
}
