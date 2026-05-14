import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  adjacentNeighborPositions, originCandidatesForSpecies
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  singularSquare, placeableSpecies, ensureRolePieceAt, commitPriorRegion
} from './participates_helpers'

export const movedPieceParticipatesAdjacent = {
  name: 'moved-piece-participates-adjacent',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (entry.operator !== 'adjacent') { return false }
    return roleFor(entry, ctx) !== null
  },

  apply(entry, ctx, pieces, random) {
    const role = roleFor(entry, ctx)
    if (role === null) { return null }
    const otherProposition = otherSidePropositionFor(entry, role)
    if (otherProposition === null) { return null }
    if (entry.direction === '+') { return applyPlus(entry, otherProposition, ctx, pieces, random) }
    if (entry.direction === '-') { return applyMinus(entry, otherProposition, ctx, pieces, random) }
    return null
  }
}

function roleFor(entry, ctx) {
  const moved = ctx?.singulars?.moved_piece
  if (!moved) { return null }
  const region = entry.currentProposition?.region

  if (region?.kind === 'related-to' && region.actor === 'moved_piece') {
    return region.role
  }
  if (region?.kind !== 'all') { return null }

  const movedSpecies = [...moved.species_set][0]
  if (movedSpecies === null || movedSpecies === undefined) { return null }
  if (matchesProposition(moved, movedSpecies, entry.subjectProposition)) { return 'subject' }
  if (matchesProposition(moved, movedSpecies, entry.targetProposition)) { return 'target' }
  return null
}

function matchesProposition(moved, movedSpecies, proposition) {
  if (!proposition) { return false }
  return moved.team === proposition.team && proposition.species_set.has(movedSpecies)
}

function otherSidePropositionFor(entry, role) {
  const candidate = role === 'subject' ? entry.targetProposition : entry.subjectProposition
  return candidate ?? entry.currentProposition ?? null
}

// Direction '+': place a piece adjacent to moved_piece's destination so the
// adjacency relation holds on after-board. Commit priorRegion to origin
// candidates not adjacent to the new piece — so adjacency doesn't hold on
// prior-board.
function applyPlus(entry, otherProposition, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }

  const team = otherProposition.team
  const speciesPool = placeableSpecies(otherProposition.species_set)
  if (speciesPool.length === 0) { return null }

  const adjacentSquares = shuffled(adjacentNeighborPositions(destination), random)
  for (const placement of adjacentSquares) {
    if (pieces.has(placement)) { continue }
    const result = placeAdjacentAndCommitPriorRegion({
      placement, team, speciesPool, ctx, pieces, destination, random
    })
    if (result !== null) { return result }
  }
  return null
}

// Direction '-': adjacency went down. Destination must NOT be adjacent to
// any matching piece (otherwise post-pass can't make the count drop).
function applyMinus(entry, otherProposition, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const team = otherProposition.team
  const speciesSet = otherProposition.species_set

  if (anyAdjacentMatchingPiece({ pieces, square: destination, team, speciesSet })) { return null }

  const movedSpecies = [...moved.species_set][0]
  const allOrigins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))

  const readOnlyOrigins = allOrigins.filter(origin =>
    anyAdjacentMatchingPiece({ pieces, square: origin, team, speciesSet })
  )
  if (readOnlyOrigins.length > 0) {
    return commitPriorRegion(ctx, readOnlyOrigins, pieces)
  }

  const adjacentToDestination = new Set(adjacentNeighborPositions(destination))
  const placementCandidates = []
  for (const origin of allOrigins) {
    for (const placement of adjacentNeighborPositions(origin)) {
      if (placement === destination) { continue }
      if (pieces.has(placement)) { continue }
      if (adjacentToDestination.has(placement)) { continue }
      placementCandidates.push({ origin, placement })
    }
  }
  for (const { origin, placement } of shuffled(placementCandidates, random)) {
    const placed = ensureRolePieceAt({ pieces, pos: placement, team, speciesSet, ctx, random })
    if (placed === null || placed === pieces) { continue }
    const committed = commitPriorRegion(ctx, [origin], placed)
    if (committed !== null) { return committed }
  }
  return null
}

function anyAdjacentMatchingPiece({ pieces, square, team, speciesSet }) {
  for (const neighbor of adjacentNeighborPositions(square)) {
    const piece = pieces.get(neighbor)
    if (!piece) { continue }
    if (piece.charAt(0) !== team) { continue }
    if (!speciesSet.has(piece.slice(1))) { continue }
    return true
  }
  return false
}

function placeAdjacentAndCommitPriorRegion({ placement, team, speciesPool, ctx, pieces, destination, random }) {
  const next = ensureRolePieceAt({ pieces, pos: placement, team, speciesSet: new Set(speciesPool), ctx, random })
  if (next === null || next === pieces) { return null }

  const moved = ctx.singulars.moved_piece
  const movedSpecies = [...moved.species_set][0]
  const adjacentToPlacement = new Set(adjacentNeighborPositions(placement))
  const validOrigins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !next.has(p))
    .filter(origin => !adjacentToPlacement.has(origin))

  return commitPriorRegion(ctx, validOrigins, next)
}
