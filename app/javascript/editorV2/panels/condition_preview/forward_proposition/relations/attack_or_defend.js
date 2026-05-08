import {
  buildBoardFromLayout, buildLayoutFromPieces, shuffled,
  legalPlacementForSpecies, WEIGHTED_SPECIES_DISTRIBUTION
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { controllingPositions } from 'gameplay/board_query_utils'
import { attackerCandidatesFor } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { matchesSide, candidatesForSide, applyOne, regionAllows } from './relation_helpers'

export function satisfyAttackOrDefend(relation, pieces, ctx, random) {
  if (alreadySatisfied(relation, pieces)) { return pieces }
  return tryPlace(relation, pieces, random)
}

function alreadySatisfied(relation, pieces) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    const controllers = controllingPositions({
      board, targetPosition: tPos, team: relation.subjectSide.team
    })
    for (const sPos of controllers) {
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

    const board = buildBoardFromLayout(buildLayoutFromPieces(piecesWithTarget))
    const subjectCandidates = shuffled(
      subjectsControlling(relation.subjectSide, target.position, piecesWithTarget, board),
      random
    )
    for (const subject of subjectCandidates) {
      const next = applyOne(piecesWithTarget, subject)
      if (next !== null) { return next }
    }
  }
  return null
}

function subjectsControlling(side, targetPos, pieces, board) {
  const candidates = []
  const controllers = controllingPositions({ board, targetPosition: targetPos, team: side.team })
  for (const sPos of controllers) {
    const piece = pieces.get(sPos)
    if (matchesSide(piece, side)) {
      candidates.push({ kind: 'existing', position: sPos, species: piece.slice(1) })
    }
  }
  for (const species of WEIGHTED_SPECIES_DISTRIBUTION) {
    if (!side.species_set.has(species)) { continue }
    const positions = attackerCandidatesFor(targetPos, species, side.team, board)
    for (const pos of positions) {
      if (pieces.has(pos)) { continue }
      if (!legalPlacementForSpecies(pos, species)) { continue }
      if (!regionAllows(side.region, pos)) { continue }
      candidates.push({ kind: 'fresh', position: pos, species, team: side.team })
    }
  }
  return candidates
}
