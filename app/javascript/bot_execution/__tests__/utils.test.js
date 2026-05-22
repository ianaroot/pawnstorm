import { describe, expect, it } from 'vitest'

import { compareTotals, compareValues } from 'bot_execution/utils'

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

  it('handles Infinity operands without producing NaN or null', () => {
    expect(compareTotals('greater_than', Infinity, 9)).toBe(true)
    expect(compareTotals('equal_to', Infinity, Infinity)).toBe(true)
    expect(compareTotals('less_than', 9, Infinity)).toBe(true)
    expect(compareTotals('greater_than', 9, Infinity)).toBe(false)
    expect(compareTotals('less_than', Infinity, Infinity)).toBe(false)
    expect(compareTotals('greater_than_or_equal_to', Infinity, Infinity)).toBe(true)
  })

  it('still returns false when an operand is null even if the other is Infinity', () => {
    expect(compareTotals('equal_to', null, Infinity)).toBe(false)
    expect(compareTotals('greater_than', Infinity, null)).toBe(false)
  })
})

describe('compareValues', () => {
  it('compares finite values via the named comparator', () => {
    expect(compareValues(3, 'equal_to', 3)).toBe(true)
    expect(compareValues(4, 'greater_than', 3)).toBe(true)
    expect(compareValues(3, 'less_than', 4)).toBe(true)
  })

  it('handles Infinity (king value) without NaN', () => {
    expect(compareValues(Infinity, 'greater_than', 9)).toBe(true)
    expect(compareValues(Infinity, 'equal_to', Infinity)).toBe(true)
    expect(compareValues(9, 'less_than', Infinity)).toBe(true)
    expect(compareValues(Infinity, 'less_than', Infinity)).toBe(false)
  })

  it('throws on unknown comparator', () => {
    expect(() => compareValues(1, 'not_a_comparator', 1)).toThrow(/Unknown comparator/)
  })
})
