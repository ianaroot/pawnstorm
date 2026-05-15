import { describe, expect, it } from 'vitest'

import { compareTotals } from 'bot_execution/utils'

describe('compareTotals', () => {
  it('compares numeric totals via the named comparator', () => {
    expect(compareTotals('equal_to', 3, 3)).toBe(true)
    expect(compareTotals('equal_to', 3, 4)).toBe(false)
    expect(compareTotals('greater_than', 4, 3)).toBe(true)
    expect(compareTotals('greater_than', 3, 3)).toBe(false)
    expect(compareTotals('less_than', 3, 4)).toBe(true)
    expect(compareTotals('greater_than_or_equal_to', 3, 3)).toBe(true)
    expect(compareTotals('less_than_or_equal_to', 3, 3)).toBe(true)
  })

  it('returns false when either operand is null (vacuous-truth)', () => {
    expect(compareTotals('equal_to', null, 0)).toBe(false)
    expect(compareTotals('greater_than', 5, null)).toBe(false)
    expect(compareTotals('less_than', null, null)).toBe(false)
  })

  it('throws on unknown comparator', () => {
    expect(() => compareTotals('not_a_comparator', 1, 1)).toThrow(/Unknown comparator/)
  })
})
