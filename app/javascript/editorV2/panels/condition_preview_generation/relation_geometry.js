import Board from 'gameplay/board'
import { controlledSquares, nextPositionOnRay } from 'gameplay/board_query_utils'
import {
  pieceCode,
  buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview/board_utils'
import {
  RAY_STEPS, adjacentNeighborPositions, shieldAttackerSpeciesForStep
} from 'editorV2/panels/condition_preview/geometry_utils'
import { buildCandidateSkeletons } from 'editorV2/panels/condition_preview/skeleton_builders'
import { shuffled } from './board_utils'
import { placePiece, legalPlacementForSpecies, piecesSatisfyInvariants } from './piece_placement'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))

function positionsAttackingAnchor({ species, anchorPosition, occupied }) {
  const attackerTeam = Board.WHITE
  return ALL_POSITIONS.filter(position => {
    if (position === anchorPosition) { return false }
    if (occupied.has(position)) { return false }
    if (!legalPlacementForSpecies(position, species)) { return false }
    const board = buildBoardFromLayout(buildLayoutFromPieces(new Map([[position, pieceCode(attackerTeam, species)]])))
    return controlledSquares({ board, attackerPosition: position }).includes(anchorPosition)
  })
}

function positionsControlledByAnchor({ anchorSubjectPosition, currentPieces, occupied }) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(currentPieces))
  return controlledSquares({ board, attackerPosition: anchorSubjectPosition })
    .filter(position => !occupied.has(position) && position !== anchorSubjectPosition)
}

function placeAttackDefendExtras({ plan, side, extraSpecies, anchorPosition, currentPieces, reservedSquares, random }) {
  let pieces = currentPieces
  const placements = []
  for (const species of extraSpecies) {
    const occupied = new Set([...pieces.keys(), ...reservedSquares])
    let candidates
    if (side === 'subject') {
      candidates = shuffled(positionsAttackingAnchor({ species, anchorPosition, occupied }), random)
    } else {
      candidates = shuffled(
        positionsControlledByAnchor({ anchorSubjectPosition: anchorPosition, currentPieces: pieces, occupied })
          .filter(position => legalPlacementForSpecies(position, species)),
        random
      )
    }
    if (candidates.length === 0) { return null }
    const team = side === 'subject' ? plan.subjectTeam : plan.targetTeam
    let placed = null
    for (const position of candidates) {
      const next = placePiece(pieces, position, pieceCode(team, species))
      if (next !== null) { pieces = next; placed = position; break }
    }
    if (placed === null) { return null }
    placements.push({ position: placed, species })
  }
  return { pieces, placements }
}

function placeAdjacentExtras({ plan, side, extraSpecies, anchorPosition, currentPieces, reservedSquares, random }) {
  let pieces = currentPieces
  const placements = []
  for (const species of extraSpecies) {
    const occupied = new Set([...pieces.keys(), ...reservedSquares])
    const candidates = shuffled(
      adjacentNeighborPositions(anchorPosition)
        .filter(position => position !== null && !occupied.has(position) && legalPlacementForSpecies(position, species)),
      random
    )
    if (candidates.length === 0) { return null }
    const team = side === 'subject' ? plan.subjectTeam : plan.targetTeam
    let placed = null
    for (const position of candidates) {
      const next = placePiece(pieces, position, pieceCode(team, species))
      if (next !== null) { pieces = next; placed = position; break }
    }
    if (placed === null) { return null }
    placements.push({ position: placed, species })
  }
  return { pieces, placements }
}

function findShieldAttackerOnRay({ originPosition, step, occupied, random }) {
  const speciesOptions = shuffled(shieldAttackerSpeciesForStep(step), random)
  for (let distance = 1; distance <= 3; distance += 1) {
    let position = originPosition
    let valid = true
    for (let i = 0; i < distance; i += 1) {
      position = nextPositionOnRay(position, -step)
      if (position === null) { valid = false; break }
    }
    if (!valid) { continue }
    if (occupied.has(position)) { continue }
    for (const species of speciesOptions) {
      if (legalPlacementForSpecies(position, species)) {
        return { position, species }
      }
    }
  }
  return null
}

function placeShieldExtras({ plan, side, extraSpecies, anchorRelationPosition, anchorOtherPosition, currentPieces, reservedSquares, random }) {
  let pieces = currentPieces
  const placements = []
  const attackerTeam = Board.opposingTeam(plan.targetTeam)
  const usedSquares = new Set([...pieces.keys(), ...reservedSquares])
  const usedSteps = new Set()

  for (const species of extraSpecies) {
    let chosen = null
    for (const step of shuffled(RAY_STEPS, random)) {
      if (usedSteps.has(step)) { continue }

      let relationPosition
      let attackerOriginPosition
      if (side === 'subject') {
        relationPosition = nextPositionOnRay(anchorRelationPosition, -step)
        attackerOriginPosition = relationPosition
      } else {
        relationPosition = nextPositionOnRay(anchorOtherPosition, step)
        attackerOriginPosition = anchorOtherPosition
      }
      if (relationPosition === null) { continue }
      if (usedSquares.has(relationPosition)) { continue }
      if (!legalPlacementForSpecies(relationPosition, species)) { continue }

      const attacker = findShieldAttackerOnRay({
        originPosition: attackerOriginPosition,
        step,
        occupied: new Set([...usedSquares, relationPosition]),
        random
      })
      if (!attacker) { continue }

      chosen = { step, relationPosition, attackerPosition: attacker.position, attackerSpecies: attacker.species }
      break
    }

    if (!chosen) { return null }

    const relationTeam = side === 'subject' ? plan.subjectTeam : plan.targetTeam
    const afterRelation = placePiece(pieces, chosen.relationPosition, pieceCode(relationTeam, species))
    if (afterRelation === null) { return null }
    const afterAttacker = placePiece(afterRelation, chosen.attackerPosition, pieceCode(attackerTeam, chosen.attackerSpecies))
    if (afterAttacker === null) { return null }
    pieces = afterAttacker
    placements.push({ position: chosen.relationPosition, species })
    usedSquares.add(chosen.relationPosition)
    usedSquares.add(chosen.attackerPosition)
    usedSteps.add(chosen.step)
  }

  return { pieces, placements }
}

export function placeExtraPiecesForSide({ plan, side, extraSpecies, anchorRelationPosition, anchorOtherPosition, currentPieces, reservedSquares, random }) {
  if (!extraSpecies || extraSpecies.length === 0) {
    return { pieces: currentPieces, placements: [] }
  }

  switch (plan.operator) {
    case 'attack':
    case 'defend':
      return placeAttackDefendExtras({
        plan, side, extraSpecies,
        anchorPosition: side === 'subject' ? anchorOtherPosition : anchorRelationPosition,
        currentPieces, reservedSquares, random
      })
    case 'adjacent':
      return placeAdjacentExtras({
        plan, side, extraSpecies,
        anchorPosition: side === 'subject' ? anchorOtherPosition : anchorRelationPosition,
        currentPieces, reservedSquares, random
      })
    case 'shield':
      return placeShieldExtras({
        plan, side, extraSpecies,
        anchorRelationPosition, anchorOtherPosition,
        currentPieces, reservedSquares, random
      })
    default:
      return null
  }
}

export function buildConfigSkeletons({
  plan, subjectConfig, targetConfig,
  fixedPieces = new Map(), fixedSubjectPlacement = null, fixedTargetPlacement = null,
  reservedSquares = new Set(), random
}) {
  if (!subjectConfig || !targetConfig || subjectConfig.length === 0 || targetConfig.length === 0) {
    return []
  }

  const canonicalSubjectSpecies = subjectConfig[0]
  const canonicalTargetSpecies = targetConfig[0]
  const extraSubjectSpecies = subjectConfig.slice(1)
  const extraTargetSpecies = targetConfig.slice(1)

  const baseSkeletons = shuffled(
    buildCandidateSkeletons({
      plan,
      subjectSpecies: canonicalSubjectSpecies,
      targetSpecies: canonicalTargetSpecies,
      fixedPieces,
      fixedSubjectPlacement,
      fixedTargetPlacement,
      reservedSquares
    }).filter(skeleton => piecesSatisfyInvariants(skeleton.pieces)),
    random
  )

  const results = []
  for (const base of baseSkeletons) {
    const subjectPlacements = [{ position: base.subjectPosition, species: canonicalSubjectSpecies }]
    const targetPlacements = [{ position: base.targetPosition, species: canonicalTargetSpecies }]

    let pieces = base.pieces
    let geometryKey = base.geometryKey

    if (extraSubjectSpecies.length > 0) {
      const placed = placeExtraPiecesForSide({
        plan, side: 'subject',
        extraSpecies: extraSubjectSpecies,
        anchorRelationPosition: base.subjectPosition,
        anchorOtherPosition: base.targetPosition,
        currentPieces: pieces,
        reservedSquares,
        random
      })
      if (!placed) { continue }
      pieces = placed.pieces
      placed.placements.forEach(p => subjectPlacements.push(p))
      geometryKey += `:s+${placed.placements.length}`
    }

    if (extraTargetSpecies.length > 0) {
      const placed = placeExtraPiecesForSide({
        plan, side: 'target',
        extraSpecies: extraTargetSpecies,
        anchorRelationPosition: base.targetPosition,
        anchorOtherPosition: base.subjectPosition,
        currentPieces: pieces,
        reservedSquares,
        random
      })
      if (!placed) { continue }
      pieces = placed.pieces
      placed.placements.forEach(p => targetPlacements.push(p))
      geometryKey += `:t+${placed.placements.length}`
    }

    results.push({
      pieces,
      subjectPosition: base.subjectPosition,
      subjectSpecies: canonicalSubjectSpecies,
      targetPosition: base.targetPosition,
      targetSpecies: canonicalTargetSpecies,
      subjectPlacements,
      targetPlacements,
      geometryKey
    })
  }

  return results
}
