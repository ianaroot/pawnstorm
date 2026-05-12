import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  adjacentNeighborPositions, originCandidatesForSpecies
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  movedPieceRoleIn, singularSquare, placeableSpecies, ensureRolePieceAt, commitPriorRegion
} from './participates_helpers'

export const movedPieceParticipatesAdjacent = {
  name: 'moved-piece-participates-adjacent',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (entry.operator !== 'adjacent') { return false }
    return movedPieceRoleIn(entry) !== null
  },

  apply(entry, ctx, pieces, random) {
    const role = movedPieceRoleIn(entry)
    if (role === null) { return null }
    if (entry.direction === '+') { return applyPlus(entry, ctx, pieces, random) }
    if (entry.direction === '-') { return applyMinus(entry, ctx, pieces, random) }
    return null
  }
}

// Direction '+': place a piece adjacent to moved_piece's destination so the
// adjacency relation holds on after-board. Commit priorRegion to origin
// candidates not adjacent to the new piece — so adjacency doesn't hold on
// prior-board.
function applyPlus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }

  const team = entry.currentProposition.team
  const speciesPool = placeableSpecies(entry.currentProposition.species_set)
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
// any matching piece (otherwise post-pass can't make the count drop). Commit
// priorRegion to origin candidates that ARE adjacent to a matching piece.
//
// Future extension: when no existing matching piece sits adjacent to any
// valid origin, this mechanism could place one — turning "no usable existing
// neighbor" cases into solvable ones. Today the minus path is read-only.
function applyMinus(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const team = entry.currentProposition.team
  const speciesSet = entry.currentProposition.species_set

  if (anyAdjacentMatchingPiece({ pieces, square: destination, team, speciesSet })) { return null }

  const movedSpecies = [...moved.species_set][0]
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))
    .filter(origin => anyAdjacentMatchingPiece({ pieces, square: origin, team, speciesSet }))

  if (candidates.length === 0) { return null }
  return commitPriorRegion(ctx, candidates, pieces)
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
