import Board from 'gameplay/board'
import { materialValue } from 'gameplay/board_query_utils'
import { EXACT_NUMBER_COMPARISON_SOURCE } from 'editorV2/panels/condition_preview/plans/comparison_requirements'

// Shared value-source enumeration. value -> [species] is derived from
// materialValue, so the king (Infinity) participates like any other piece
// rather than being excluded by a hardcoded non-king table.
const VALUE_SPECIES = Object.freeze([
  Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING
])

const VALUE_TO_SPECIES = (() => {
  const map = new Map()
  for (const species of VALUE_SPECIES) {
    const value = materialValue(species)
    if (!map.has(value)) { map.set(value, []) }
    map.get(value).push(species)
  }
  return map
})()

const SOURCE_CONSTRAINT_KEY = Object.freeze({
  moved_piece: 'movedPieceSpeciesPool',
  captured_piece: 'capturedPieceSpeciesPool',
  enemy_moved_piece: 'enemyMovedPieceSpeciesPool',
  enemy_captured_piece: 'enemyCapturedPieceSpeciesPool'
})

export function valueSourceOptions(descriptor) {
  if (descriptor.source === EXACT_NUMBER_COMPARISON_SOURCE) {
    return [{ resolvedTotal: Number(descriptor.total || 0), constraints: {} }]
  }
  const constraintKey = SOURCE_CONSTRAINT_KEY[descriptor.source]
  if (!constraintKey) { return [] }
  return Array.from(VALUE_TO_SPECIES.entries())
    .filter(([value]) => value > 0)
    .map(([value, speciesPool]) => ({
      resolvedTotal: value,
      constraints: { [constraintKey]: speciesPool }
    }))
}
