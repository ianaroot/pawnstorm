import {
  buildBoardFromLayout, buildLayoutFromPieces, shuffled,
  legalPlacementForSpecies, WEIGHTED_SPECIES_DISTRIBUTION
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { controllingPositions } from 'gameplay/board_query_utils'
import { attackerCandidatesFor } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  matchesSide, candidatesForSide, applyOne, regionAllows,
  requirementsMet, MAX_SATISFY_ITERATIONS
} from './relation_helpers'

export function satisfyAttackOrDefend(relation, pieces, ctx, random) {
  // Negative-count relations (max=0 on either side) are satisfied by absence —
  // no pairs to add. Cap enforcement in respectsAllCaps prevents other passes
  // from creating offending pairs.
  if (relation.subjectSide.count_range.max === 0 || relation.targetSide.count_range.max === 0) {
    return pieces
  }
  if (attackOrDefendRequirementsMet(relation, pieces)) { return pieces }
  let next = pieces
  for (let i = 0; i < MAX_SATISFY_ITERATIONS; i += 1) {
    if (attackOrDefendRequirementsMet(relation, next)) { return next }
    const placed = tryPlace(relation, next, ctx, random)
    if (placed === null || placed === next) { return null }
    next = placed
  }
  return attackOrDefendRequirementsMet(relation, next) ? next : null
}

function attackOrDefendRequirementsMet(relation, pieces) {
  const { activeSubjects, activeTargets } = activeAttackOrDefendSets(relation, pieces)
  return requirementsMet({
    subjectSide: relation.subjectSide,
    targetSide: relation.targetSide,
    activeSubjects, activeTargets, pieces
  })
}

export function activeAttackOrDefendSets(relation, pieces, board = null) {
  board = board ?? buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const activeSubjects = new Set()
  const activeTargets = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    const controllers = controllingPositions({
      board, targetPosition: tPos, team: relation.subjectSide.team
    })
    let hasMatch = false
    for (const sPos of controllers) {
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

    const board = buildBoardFromLayout(buildLayoutFromPieces(piecesWithTarget))
    const subjectCandidates = shuffled(
      subjectsControlling(relation.subjectSide, target.position, piecesWithTarget, board),
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
