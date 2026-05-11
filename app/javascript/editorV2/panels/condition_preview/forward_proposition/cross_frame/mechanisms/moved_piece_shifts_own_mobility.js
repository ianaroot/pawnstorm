import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  originCandidatesForSpecies, pathClearOnPieces
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { mobilityAt } from 'gameplay/mobility'
import { blockersMechanism } from '../../mobility/blockers'
import { kingAdjacentControlMechanism } from '../../mobility/king_adjacent_control'
import { pinsMechanism } from '../../mobility/pins'
import { singularSquare, commitPriorRegion } from './participates_helpers'

const ACTIVE_MECHANISMS = Object.freeze([blockersMechanism, kingAdjacentControlMechanism, pinsMechanism])

// Patch 1 of mobility cross-frame: moved_piece's own mobility shift.
//
// For direction '+': mobility went up. We need an origin where mobility-from-
// origin < mobility-from-destination.
// For direction '-': mobility went down. We need mobility-from-origin >
// mobility-from-destination.
//
// First pass looks for an origin whose hypothetical mobility already differs
// from destination's in the right direction (no piece placement needed).
// Second pass engineers the delta by running the existing mobility mechanisms
// (blockers/king_adjacent_control/pins) with frame='prior' against an origin,
// then verifies the delta on the modified board.
export const movedPieceShiftsOwnMobility = {
  name: 'moved-piece-shifts-own-mobility',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'unary') { return false }
    if (entry.metric !== 'aggregate_mobility') { return false }
    if (entry.currentProposition?.boundSingularActor !== 'moved_piece') { return false }
    return true
  },

  apply(entry, ctx, pieces, random) {
    const moved = ctx.singulars.moved_piece
    const destination = singularSquare(moved)
    if (destination === null) { return null }
    const movedSpecies = [...moved.species_set][0]
    if (movedSpecies === null) { return null }

    const naturalResult = findOriginWithNaturalDelta(entry, ctx, pieces, random, moved, destination, movedSpecies)
    if (naturalResult !== null) { return naturalResult }

    return engineerOriginMobility(entry, ctx, pieces, random, moved, destination, movedSpecies)
  }
}

function findOriginWithNaturalDelta(entry, ctx, pieces, random, moved, destination, movedSpecies) {
  const afterBoard = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const afterMobility = mobilityAt(afterBoard, destination)

  for (const origin of shuffled(legalOriginCandidates(pieces, destination, moved.team, movedSpecies), random)) {
    const priorMobility = hypotheticalMobilityAt(pieces, destination, origin, moved.team, movedSpecies)
    if (directionSatisfied(entry.direction, afterMobility, priorMobility)) {
      const result = commitPriorRegion(ctx, [origin], pieces)
      if (result !== null) { return result }
    }
  }
  return null
}

// Engineering widens the prior↔after mobility delta by placing blockers on
// whichever frame's mobility we want to reduce:
//   direction '+': reduce mobility-from-origin (prior frame). Place moved_piece
//     at origin in a hypothetical board, run mobility mechanisms with
//     frame='prior'. Extract engineered blockers and apply to the original
//     pieces (moved_piece at destination + new blockers around origin).
//   direction '-': reduce mobility-from-destination (current frame). moved_piece
//     is already at destination, so the existing mobility mechanisms run as-is
//     with frame='current' against the actual board.
function engineerOriginMobility(entry, ctx, pieces, random, moved, destination, movedSpecies) {
  if (entry.direction === '+') {
    return engineerLowerPriorMobility(entry, ctx, pieces, random, moved, destination, movedSpecies)
  }
  if (entry.direction === '-') {
    return engineerLowerCurrentMobility(entry, ctx, pieces, random, moved, destination, movedSpecies)
  }
  return null
}

function engineerLowerPriorMobility(entry, ctx, pieces, random, moved, destination, movedSpecies) {
  for (const origin of shuffled(legalOriginCandidates(pieces, destination, moved.team, movedSpecies), random)) {
    const hypotheticalPieces = piecesWithMovedAt(pieces, destination, origin, moved.team, movedSpecies)
    const target = { position: origin, team: moved.team, species: movedSpecies }

    for (const mechanism of shuffled([...ACTIVE_MECHANISMS], random)) {
      if (!mechanism.appliesTo(target, ctx, 'prior', hypotheticalPieces)) { continue }
      const mechResult = mechanism.apply(target, ctx, 'prior', hypotheticalPieces, random)
      if (mechResult === null || mechResult === hypotheticalPieces) { continue }

      const finalPieces = applyEngineeredBlockers(pieces, hypotheticalPieces, mechResult, destination)
      if (!pathClearOnPieces(finalPieces, origin, destination, movedSpecies)) { continue }

      if (!deltaSatisfied(entry.direction, finalPieces, destination, origin, moved.team, movedSpecies)) { continue }

      const result = commitPriorRegion(ctx, [origin], finalPieces)
      if (result !== null) { return result }
    }
  }
  return null
}

function engineerLowerCurrentMobility(entry, ctx, pieces, random, moved, destination, movedSpecies) {
  const target = { position: destination, team: moved.team, species: movedSpecies }
  for (const mechanism of shuffled([...ACTIVE_MECHANISMS], random)) {
    if (!mechanism.appliesTo(target, ctx, 'current', pieces)) { continue }
    const mechResult = mechanism.apply(target, ctx, 'current', pieces, random)
    if (mechResult === null || mechResult === pieces) { continue }

    for (const origin of shuffled(legalOriginCandidates(mechResult, destination, moved.team, movedSpecies), random)) {
      if (!deltaSatisfied(entry.direction, mechResult, destination, origin, moved.team, movedSpecies)) { continue }
      const result = commitPriorRegion(ctx, [origin], mechResult)
      if (result !== null) { return result }
    }
  }
  return null
}

function deltaSatisfied(direction, piecesMap, destination, origin, team, species) {
  const afterBoard = buildBoardFromLayout(buildLayoutFromPieces(piecesMap))
  const afterMobility = mobilityAt(afterBoard, destination)
  const priorMobility = hypotheticalMobilityAt(piecesMap, destination, origin, team, species)
  return directionSatisfied(direction, afterMobility, priorMobility)
}

function piecesWithMovedAt(pieces, fromSquare, toSquare, team, species) {
  const result = new Map(pieces)
  result.delete(fromSquare)
  result.set(toSquare, pieceCode(team, species))
  return result
}

// Diffs the mechanism's output against the hypothetical input to extract just
// the engineered placements. Re-applies them onto the original after-board
// pieces map (moved_piece at destination), skipping any placement that would
// conflict with moved_piece's destination.
function applyEngineeredBlockers(originalPieces, hypothetical, mechanismResult, destination) {
  const final = new Map(originalPieces)
  for (const [pos, piece] of mechanismResult) {
    if (hypothetical.has(pos)) { continue }
    if (pos === destination) { continue }
    if (final.has(pos)) { continue }
    final.set(pos, piece)
  }
  return final
}

function legalOriginCandidates(pieces, destination, team, species) {
  return originCandidatesForSpecies(destination, species, team)
    .filter(p => p !== destination && !pieces.has(p))
    .filter(p => pathClearOnPieces(pieces, p, destination, species))
}

function hypotheticalMobilityAt(pieces, fromSquare, toSquare, team, species) {
  const hypo = new Map(pieces)
  hypo.delete(fromSquare)
  hypo.set(toSquare, pieceCode(team, species))
  const board = buildBoardFromLayout(buildLayoutFromPieces(hypo))
  return mobilityAt(board, toSquare)
}

function directionSatisfied(direction, afterMobility, priorMobility) {
  if (direction === '+') { return afterMobility > priorMobility }
  if (direction === '-') { return afterMobility < priorMobility }
  if (direction === '=') { return afterMobility === priorMobility }
  return false
}
