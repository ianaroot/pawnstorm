// Live consultation helpers for ctx.inventory.
//
// Strategies and seed-builder placements call respectsInventoryCaps before
// committing a piece to the board. The check walks every filter the species
// belongs to (any + specific filter + major/minor when applicable) and bails
// if adding the piece would exceed any cell's count_range.max or
// value_range.max.
//
// chain_constraints.js owns the pre-pass that BUILDS the inventory ranges.
// This file owns the runtime CONSULTATION protocol. Cells are read-only here;
// `pieces` is the single source of truth for actual board state.

import { materialValue } from 'gameplay/board_query_utils'
import { speciesMatchesFilter } from 'editorV2/panels/condition_preview/shared/example_utils'
import { INVENTORY_FILTERS } from './chain_constraints'

// Number of pieces matching (team, filter) on `pieces`.
export function actualCountForFilter(pieces, team, filter) {
  let count = 0
  for (const piece of pieces.values()) {
    if (piece.charAt(0) !== team) { continue }
    if (speciesMatchesFilter(piece.slice(1), filter, null)) { count += 1 }
  }
  return count
}

// Sum of materialValue for pieces matching (team, filter) on `pieces`.
export function actualValueForFilter(pieces, team, filter) {
  let total = 0
  for (const piece of pieces.values()) {
    if (piece.charAt(0) !== team) { continue }
    if (!speciesMatchesFilter(piece.slice(1), filter, null)) { continue }
    total += materialValue(piece.slice(1))
  }
  return total
}

// True if placing `species` for `team` on the given frame would not push any
// inventory cell over its count_range.max or value_range.max. Walks every
// filter the species belongs to (any, specific filter, major/minor as
// applicable). When ctx.inventory is missing or a cell is missing for some
// filter, that filter is skipped (defensive).
export function respectsInventoryCaps(team, species, pieces, ctx, frame = 'current') {
  if (!ctx?.inventory) { return true }
  const speciesValue = materialValue(species)
  for (const filter of INVENTORY_FILTERS) {
    if (!speciesMatchesFilter(species, filter, null)) { continue }
    const cell = ctx.inventory[team]?.[frame]?.[filter]
    if (!cell) { continue }
    const currentCount = actualCountForFilter(pieces, team, filter)
    if (currentCount + 1 > cell.count_range.max) { return false }
    const currentValue = actualValueForFilter(pieces, team, filter)
    if (currentValue + speciesValue > cell.value_range.max) { return false }
  }
  return true
}
