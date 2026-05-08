import {
  ALL_POSITIONS, WEIGHTED_SPECIES_DISTRIBUTION, pieceCode, legalPlacementForSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'

export function matchesSide(piece, side) {
  if (!piece) { return false }
  return piece.charAt(0) === side.team && side.species_set.has(piece.slice(1))
}

export function regionAllows(region, position) {
  if (region.kind === 'all') { return true }
  if (region.kind === 'set') { return region.squares.has(position) }
  return true
}

export function candidatesForSide(side, pieces) {
  const candidates = []
  for (const [pos, piece] of pieces) {
    if (matchesSide(piece, side)) {
      candidates.push({ kind: 'existing', position: pos, species: piece.slice(1) })
    }
  }
  for (const species of WEIGHTED_SPECIES_DISTRIBUTION) {
    if (!side.species_set.has(species)) { continue }
    for (const pos of ALL_POSITIONS) {
      if (pieces.has(pos)) { continue }
      if (!legalPlacementForSpecies(pos, species)) { continue }
      if (!regionAllows(side.region, pos)) { continue }
      candidates.push({ kind: 'fresh', position: pos, species, team: side.team })
    }
  }
  return candidates
}

export function applyOne(pieces, candidate) {
  if (candidate.kind === 'existing') { return pieces }
  return placePiece(pieces, candidate.position, pieceCode(candidate.team, candidate.species))
}
