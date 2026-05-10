import {
  ALL_POSITIONS, buildBoardFromLayout, buildLayoutFromPieces,
  pieceCode, shuffled, legalPlacementForSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { mobilityAt } from 'gameplay/mobility'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { placeKingInStalemate } from 'editorV2/panels/condition_preview/shared/king_placement'
import { respectsAllCaps } from 'editorV2/panels/condition_preview/forward_proposition/respect_caps'

// Stalemate strategy: places the constrained team's king in a stalemate
// configuration (not in check, no legal escape squares). Shares ctx.checkState
// with checkRestriction (a team is in at most one mobility-restricting king
// arrangement at a time).
export const stalemateStrategy = {
  name: 'stalemate',

  appliesTo(constraint, ctx, pieces, pool) {
    if (ctx.checkState.count >= ctx.checkState.max) { return false }
    if (constraint.region.kind === 'related-to') { return false }
    if (constraint.team === teamThatJustMoved(constraint.frame, ctx)) { return false }
    return true
  },

  apply(constraint, ctx, pieces, pool, random) {
    if (ctx.checkState.count >= ctx.checkState.max) { return null }
    let next = placeKingInStalemate({
      pieces, team: constraint.team, frame: constraint.frame, ctx, random
    })
    if (next === null) { return null }

    next = handleEnemyMovedPiece(next, ctx, random)
    if (next === null) { return null }

    ctx.checkState.count += 1
    return next
  }
}

function teamThatJustMoved(frame, ctx) {
  return frame === 'current' ? ctx.movingTeam : ctx.enemyTeam
}

// If enemy_moved_piece is committed (will be placed), pick a random empty
// square for it and check its mobility. If 0, commit region there. If >0,
// arrange capture: alias captured_piece = enemy_moved_piece, force moved_piece
// to capture at a square reachable for its species. Returns null if no
// arrangement works.
function handleEnemyMovedPiece(pieces, ctx, random) {
  const enemyMoved = ctx.singulars.enemy_moved_piece
  if (!enemyMoved) { return pieces }
  const species = [...enemyMoved.species_set][0]
  if (species === null || species === undefined) { return pieces }

  const tryPos = pickPlacementCandidate(pieces, enemyMoved.team, species, random)
  if (tryPos !== null) {
    const candidate = placePiece(pieces, tryPos, pieceCode(enemyMoved.team, species))
    if (candidate !== null) {
      const board = buildBoardFromLayout(buildLayoutFromPieces(candidate))
      if (mobilityAt(board, tryPos) === 0) {
        enemyMoved.region = { kind: 'set', squares: new Set([tryPos]) }
        return candidate
      }
    }
  }
  return arrangeCapture(pieces, ctx, random)
}

function pickPlacementCandidate(pieces, team, species, random) {
  for (const pos of shuffled(ALL_POSITIONS, random)) {
    if (pieces.has(pos)) { continue }
    if (!legalPlacementForSpecies(pos, species)) { continue }
    return pos
  }
  return null
}

function arrangeCapture(pieces, ctx, random) {
  const moved = ctx.singulars.moved_piece
  const enemyMoved = ctx.singulars.enemy_moved_piece
  const movedSpecies = [...moved.species_set][0]
  if (movedSpecies === null || movedSpecies === undefined) { return null }

  for (const x of shuffled(ALL_POSITIONS, random)) {
    if (pieces.has(x)) { continue }
    if (!legalPlacementForSpecies(x, movedSpecies)) { continue }
    if (!legalPlacementForSpecies(x, [...enemyMoved.species_set][0])) { continue }
    const origins = originCandidatesForSpecies(x, movedSpecies, moved.team)
      .filter(o => !pieces.has(o) && o !== x)
    if (origins.length === 0) { continue }
    if (!respectsAllCaps(moved.team, movedSpecies, x, ctx, pieces)) { continue }
    moved.region = { kind: 'set', squares: new Set([x]) }
    enemyMoved.region = { kind: 'set', squares: new Set([x]) }
    ctx.singulars.captured_piece = enemyMoved
    return pieces
  }
  return null
}
