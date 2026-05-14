import { describe, expect, it } from 'vitest'

import { buildBoard } from 'gameplay/__tests__/helpers'
import { combinatorialQualifyingExists } from 'bot_execution/relational_qualifying'

describe('combinatorialQualifyingExists PBS coercion', () => {
  it('coerces null valueReferenceTotal to 0 when valueIsPbs is true', () => {
    const board = buildBoard({ pieces: { e1: 'wK', e8: 'bK', c2: 'wN', d4: 'bQ' } })
    const pairs = [{ subjectPosition: 10, targetPosition: 27 }]
    const args = {
      pairs, board,
      groupBySide: 'subject', valueSide: 'target',
      valueComparator: 'greater_than', valueReferenceTotal: null,
      countComparator: 'greater_than_or_equal_to', countReferenceTotal: 1
    }

    expect(combinatorialQualifyingExists({ ...args, valueIsPbs: true })).toBe(true)
    expect(combinatorialQualifyingExists(args)).toBe(false)
  })
})
