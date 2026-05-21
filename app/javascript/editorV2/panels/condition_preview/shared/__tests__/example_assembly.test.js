import { describe, expect, it } from 'vitest'
import { planSpecialQuota } from 'editorV2/panels/condition_preview/shared/example_assembly'

const GROUPS = (ep, castle, promo) => [
  { key: 'en_passant', count: ep },
  { key: 'castle', count: castle },
  { key: 'promotion', count: promo }
]
const specialTotal = takes => takes.en_passant + takes.castle + takes.promotion

describe('planSpecialQuota', () => {
  it('takes 18 standard and 4 from each special group when every pool is plentiful', () => {
    const { standardTake, groupTakes } = planSpecialQuota({
      standardCount: 100, groupCounts: GROUPS(100, 100, 100), maxExamples: 30
    })
    expect(standardTake).toBe(18)
    expect(groupTakes).toEqual({ en_passant: 4, castle: 4, promotion: 4 })
  })

  it('routes a dropped special group’s slots to standard, leaving the other groups at 4', () => {
    const { standardTake, groupTakes } = planSpecialQuota({
      standardCount: 100, groupCounts: GROUPS(100, 100, 0), maxExamples: 30
    })
    expect(groupTakes).toEqual({ en_passant: 4, castle: 4, promotion: 0 })
    expect(standardTake).toBe(22)
  })

  it('gap-fills a standard shortfall evenly across the surviving special groups', () => {
    const { standardTake, groupTakes } = planSpecialQuota({
      standardCount: 10, groupCounts: GROUPS(50, 50, 50), maxExamples: 30
    })
    expect(standardTake).toBe(10)
    expect(specialTotal(groupTakes)).toBe(20)
    const takes = [groupTakes.en_passant, groupTakes.castle, groupTakes.promotion]
    expect(Math.max(...takes) - Math.min(...takes)).toBeLessThanOrEqual(1)
    expect(standardTake + specialTotal(groupTakes)).toBe(30)
  })

  it('fills the whole set with special moves when standard is empty', () => {
    const { standardTake, groupTakes } = planSpecialQuota({
      standardCount: 0, groupCounts: GROUPS(0, 0, 100), maxExamples: 30
    })
    expect(standardTake).toBe(0)
    expect(groupTakes).toEqual({ en_passant: 0, castle: 0, promotion: 30 })
  })

  it('caps gap-fill at each group’s produced count', () => {
    const { standardTake, groupTakes } = planSpecialQuota({
      standardCount: 0, groupCounts: GROUPS(5, 100, 100), maxExamples: 30
    })
    expect(standardTake).toBe(0)
    expect(groupTakes.en_passant).toBe(5)
    expect(groupTakes.castle + groupTakes.promotion).toBe(25)
    expect(Math.abs(groupTakes.castle - groupTakes.promotion)).toBeLessThanOrEqual(1)
    expect(specialTotal(groupTakes)).toBe(30)
  })

  it('gives the whole set to standard when there are no special examples', () => {
    const { standardTake, groupTakes } = planSpecialQuota({
      standardCount: 100, groupCounts: GROUPS(0, 0, 0), maxExamples: 30
    })
    expect(standardTake).toBe(30)
    expect(specialTotal(groupTakes)).toBe(0)
  })

  it('returns fewer than maxExamples when every pool is exhausted', () => {
    const { standardTake, groupTakes } = planSpecialQuota({
      standardCount: 2, groupCounts: GROUPS(1, 0, 0), maxExamples: 30
    })
    expect(standardTake).toBe(2)
    expect(specialTotal(groupTakes)).toBe(1)
  })

  it('defaults the ceiling to 12 when omitted', () => {
    const explicit = planSpecialQuota({
      standardCount: 100, groupCounts: GROUPS(100, 100, 100), maxExamples: 30, ceiling: 12
    })
    const defaulted = planSpecialQuota({
      standardCount: 100, groupCounts: GROUPS(100, 100, 100), maxExamples: 30
    })
    expect(defaulted).toEqual(explicit)
  })
})
