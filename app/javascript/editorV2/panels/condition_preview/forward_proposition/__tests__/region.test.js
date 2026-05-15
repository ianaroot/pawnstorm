import { describe, expect, it } from 'vitest'
import { intersectRegions, subtractRegions } from 'editorV2/panels/condition_preview/forward_proposition/region'

describe('intersectRegions', () => {
  it('returns the other region when one side is { kind: "all" }', () => {
    const set = { kind: 'set', squares: new Set([1, 2, 3]) }
    expect(intersectRegions({ kind: 'all' }, set)).toBe(set)
    expect(intersectRegions(set, { kind: 'all' })).toBe(set)
  })

  it('returns the set intersection when both sides are sets', () => {
    const a = { kind: 'set', squares: new Set([1, 2, 3, 4]) }
    const b = { kind: 'set', squares: new Set([3, 4, 5, 6]) }
    const result = intersectRegions(a, b)
    expect(result).toEqual({ kind: 'set', squares: new Set([3, 4]) })
  })
})

describe('subtractRegions', () => {
  it('returns all-positions minus the set when subtracting a set from { kind: "all" }', () => {
    const set = { kind: 'set', squares: new Set([0, 1, 2]) }
    const result = subtractRegions({ kind: 'all' }, set)
    expect(result.kind).toBe('set')
    expect(result.squares.has(0)).toBe(false)
    expect(result.squares.has(1)).toBe(false)
    expect(result.squares.has(2)).toBe(false)
    expect(result.squares.has(3)).toBe(true)
    expect(result.squares.size).toBe(64 - 3)
  })

  it('returns the set difference when both sides are sets', () => {
    const a = { kind: 'set', squares: new Set([1, 2, 3, 4]) }
    const b = { kind: 'set', squares: new Set([3, 4, 5]) }
    const result = subtractRegions(a, b)
    expect(result).toEqual({ kind: 'set', squares: new Set([1, 2]) })
  })
})
