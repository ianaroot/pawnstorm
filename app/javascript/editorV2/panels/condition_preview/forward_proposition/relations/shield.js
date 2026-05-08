import Board from 'gameplay/board'
import {
  buildBoardFromLayout, buildLayoutFromPieces,
  shuffled, pieceCode, legalPlacementForSpecies, pickWeightedSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import {
  ROOK_RAY_STEPS, QUEEN_RAY_STEPS, shieldingPositions, nextPositionOnRay
} from 'gameplay/board_query_utils'
import { matchesSide, candidatesForSide, applyOne } from './relation_helpers'

export function satisfyShield(relation, pieces, ctx, random) {
  if (alreadySatisfied(relation, pieces)) { return pieces }
  return tryPlace(relation, pieces, random)
}

function alreadySatisfied(relation, pieces) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    const shielders = shieldingPositions({
      board, targetPosition: tPos, team: relation.targetSide.team
    })
    for (const sPos of shielders) {
      if (matchesSide(pieces.get(sPos), relation.subjectSide)) { return true }
    }
  }
  return false
}

function tryPlace(relation, pieces, random) {
  const attackerTeam = Board.opposingTeam(relation.targetSide.team)
  const targetCandidates = shuffled(candidatesForSide(relation.targetSide, pieces), random)

  for (const target of targetCandidates) {
    const piecesWithTarget = applyOne(pieces, target)
    if (piecesWithTarget === null) { continue }

    for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
      const compatibleSliders = ROOK_RAY_STEPS.includes(step)
        ? [Board.ROOK, Board.QUEEN]
        : [Board.BISHOP, Board.QUEEN]
      const lineSquares = walkRay(target.position, step)
      const placed = tryPlaceOnLine({
        relation, attackerTeam, compatibleSliders,
        lineSquares, pieces: piecesWithTarget, random
      })
      if (placed !== null) { return placed }
    }
  }
  return null
}

function tryPlaceOnLine({ relation, attackerTeam, compatibleSliders, lineSquares, pieces, random }) {
  for (let shielderIdx = 0; shielderIdx < lineSquares.length - 1; shielderIdx += 1) {
    if (lineSquares.slice(0, shielderIdx).some(p => pieces.has(p))) { continue }

    const shielderPos = lineSquares[shielderIdx]
    const existingShielder = pieces.get(shielderPos)
    if (existingShielder && !matchesSide(existingShielder, relation.subjectSide)) { continue }

    for (let attackerIdx = shielderIdx + 1; attackerIdx < lineSquares.length; attackerIdx += 1) {
      let middleClear = true
      for (let i = shielderIdx + 1; i < attackerIdx; i += 1) {
        if (pieces.has(lineSquares[i])) { middleClear = false; break }
      }
      if (!middleClear) { continue }

      const attackerPos = lineSquares[attackerIdx]
      const existingAttacker = pieces.get(attackerPos)
      if (existingAttacker && !validAttacker(existingAttacker, attackerTeam, compatibleSliders)) {
        continue
      }

      let next = pieces
      if (!existingShielder) {
        const species = pickSpeciesFromSet(relation.subjectSide.species_set, shielderPos, random)
        if (species === null) { continue }
        next = placePiece(next, shielderPos, pieceCode(relation.subjectSide.team, species))
        if (next === null) { continue }
      }
      if (!existingAttacker) {
        const species = pickSpeciesFromSet(new Set(compatibleSliders), attackerPos, random)
        if (species === null) { continue }
        next = placePiece(next, attackerPos, pieceCode(attackerTeam, species))
        if (next === null) { continue }
      }
      return next
    }
  }
  return null
}

function validAttacker(piece, attackerTeam, compatibleSliders) {
  return Board.parseTeam(piece) === attackerTeam && compatibleSliders.includes(Board.parseSpecies(piece))
}

function pickSpeciesFromSet(speciesSet, position, random) {
  const filtered = new Set([...speciesSet].filter(s => s !== null && legalPlacementForSpecies(position, s)))
  if (filtered.size === 0) { return null }
  return pickWeightedSpecies(filtered, random)
}

function walkRay(origin, step) {
  const positions = []
  let current = nextPositionOnRay(origin, step)
  while (current !== null) {
    positions.push(current)
    current = nextPositionOnRay(current, step)
  }
  return positions
}
