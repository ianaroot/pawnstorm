import {
  shuffled, legalPlacementForSpecies, WEIGHTED_SPECIES_DISTRIBUTION
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { adjacentNeighborPositions } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { matchesSide, candidatesForSide, applyOne, regionAllows } from './relation_helpers'

export function satisfyAdjacent(relation, pieces, ctx, random) {
  if (alreadySatisfied(relation, pieces)) { return pieces }
  return tryPlace(relation, pieces, random)
}

function alreadySatisfied(relation, pieces) {
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    for (const sPos of adjacentNeighborPositions(tPos)) {
      if (matchesSide(pieces.get(sPos), relation.subjectSide)) { return true }
    }
  }
  return false
}

function tryPlace(relation, pieces, random) {
  const targetCandidates = shuffled(candidatesForSide(relation.targetSide, pieces), random)
  for (const target of targetCandidates) {
    const piecesWithTarget = applyOne(pieces, target)
    if (piecesWithTarget === null) { continue }

    const subjectCandidates = shuffled(
      subjectsAdjacentTo(relation.subjectSide, target.position, piecesWithTarget),
      random
    )
    for (const subject of subjectCandidates) {
      const next = applyOne(piecesWithTarget, subject)
      if (next !== null) { return next }
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
