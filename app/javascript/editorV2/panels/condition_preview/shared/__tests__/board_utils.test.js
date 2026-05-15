import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import {
  placeKingsIfAbsent, pieceCode, teamHasKing
} from 'editorV2/panels/condition_preview/shared/board_utils'

describe('placeKingsIfAbsent — cap-respecting', () => {
  it('returns null when every legal king placement would violate a count_range.max cap on white kings', () => {
    const ctx = {
      singulars: {},
      propositions: [{
        team: Board.WHITE,
        frame: 'current',
        species_set: new Set([Board.KING]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }]
    }

    expect(placeKingsIfAbsent(new Map(), () => 0, ctx)).toBeNull()
  })

  it('places both kings when no caps are present (default ctx)', () => {
    const result = placeKingsIfAbsent(new Map(), () => 0)

    expect(result).not.toBeNull()
    expect(teamHasKing(result, Board.WHITE)).toBe(true)
    expect(teamHasKing(result, Board.BLACK)).toBe(true)
  })
})
