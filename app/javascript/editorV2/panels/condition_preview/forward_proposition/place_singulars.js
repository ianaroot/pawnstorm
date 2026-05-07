import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'

export function placeSingulars(singulars, random) {
  let pieces = new Map()

  pieces = placeMovedPiece(singulars.moved_piece, pieces)
  if (pieces === null) { return null }

  if (singulars.enemy_moved_piece !== singulars.captured_piece) {
    pieces = placeEnemyMovedPiece(singulars.enemy_moved_piece, pieces)
    if (pieces === null) { return null }
  }

  return pieces
}

function placeMovedPiece(moved, pieces) {
  const endPos = [...moved.region.squares][0]
  const species = [...moved.species_set][0]
  return placePiece(pieces, endPos, pieceCode(moved.team, species))
}

function placeEnemyMovedPiece(enemy, pieces) {
  const species = [...enemy.species_set][0]
  if (species === null) { return pieces }
  const pos = [...enemy.region.squares][0]
  return placePiece(pieces, pos, pieceCode(enemy.team, species))
}
