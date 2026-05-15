import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import {
  isEdgePosition, edgeBiasedShuffle, aggregateMobilityRangeForSingular, createBiasState
} from 'editorV2/panels/condition_preview/forward_proposition/mobility/edge_bias'
import { position } from 'gameplay/__tests__/helpers'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function singular(overrides = {}) {
  return {
    team: Board.WHITE,
    species_set: new Set([Board.QUEEN]),
    region: { kind: 'all' },
    relationsToAnchors: [],
    ...overrides
  }
}

function proposition(overrides = {}) {
  return {
    team: Board.WHITE,
    frame: 'current',
    species_set: new Set([Board.QUEEN]),
    region: { kind: 'all' },
    count_range: { ...PERMISSIVE },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE },
    ...overrides
  }
}

describe('isEdgePosition', () => {
  it('returns true for corner squares', () => {
    expect(isEdgePosition(position('a1'))).toBe(true)
    expect(isEdgePosition(position('a8'))).toBe(true)
    expect(isEdgePosition(position('h1'))).toBe(true)
    expect(isEdgePosition(position('h8'))).toBe(true)
  })

  it('returns true for non-corner edge squares', () => {
    expect(isEdgePosition(position('a4'))).toBe(true)
    expect(isEdgePosition(position('h5'))).toBe(true)
    expect(isEdgePosition(position('d1'))).toBe(true)
    expect(isEdgePosition(position('e8'))).toBe(true)
  })

  it('returns false for interior squares', () => {
    expect(isEdgePosition(position('d4'))).toBe(false)
    expect(isEdgePosition(position('e5'))).toBe(false)
    expect(isEdgePosition(position('b2'))).toBe(false)
    expect(isEdgePosition(position('g7'))).toBe(false)
  })
})

describe('edgeBiasedShuffle', () => {
  const candidates = () => [position('a1'), position('d4'), position('h8'), position('e5')]

  it('returns the same set of positions regardless of bias', () => {
    const result = edgeBiasedShuffle(candidates(), () => 0, { min: 0, max: 0 })
    expect([...result].sort()).toEqual([...candidates()].sort())
  })

  it('falls through to uniform shuffle when mobilityRange is undefined', () => {
    const result = edgeBiasedShuffle(candidates(), () => 0, undefined)
    expect(result).toHaveLength(candidates().length)
  })

  it('falls through to uniform shuffle when mobilityRange.max exceeds the threshold', () => {
    const result = edgeBiasedShuffle(candidates(), () => 0, { min: 0, max: 6 })
    expect(result).toHaveLength(candidates().length)
  })

  it('places edge squares before interior when bias triggers', () => {
    const result = edgeBiasedShuffle(candidates(), () => 0, { min: 0, max: 0 })
    expect(isEdgePosition(result[0])).toBe(true)
    expect(isEdgePosition(result[1])).toBe(true)
    expect(isEdgePosition(result[2])).toBe(false)
    expect(isEdgePosition(result[3])).toBe(false)
  })

  it('takes the uniform path when the bias roll fails', () => {
    const result = edgeBiasedShuffle(candidates(), () => 0.9, { min: 0, max: 0 })
    expect([...result].sort()).toEqual([...candidates()].sort())
  })
})

describe('aggregateMobilityRangeForSingular', () => {
  it('returns a permissive range when no propositions match', () => {
    const result = aggregateMobilityRangeForSingular(singular(), [])
    expect(result).toEqual({ min: 0, max: Infinity })
  })

  it('returns the most restrictive range from matching propositions', () => {
    const result = aggregateMobilityRangeForSingular(singular(), [
      proposition({ aggregate_mobility_range: { min: 0, max: 4 } }),
      proposition({ aggregate_mobility_range: { min: 1, max: 2 } })
    ])
    expect(result).toEqual({ min: 1, max: 2 })
  })

  it('matches when proposition species_set contains the singular\'s committed species', () => {
    const result = aggregateMobilityRangeForSingular(
      singular({ species_set: new Set([Board.NIGHT]) }),
      [proposition({
        species_set: new Set([Board.NIGHT, Board.BISHOP]),
        aggregate_mobility_range: { min: 0, max: 0 }
      })]
    )
    expect(result).toEqual({ min: 0, max: 0 })
  })

  it('does not match when proposition species_set excludes the singular\'s committed species', () => {
    const result = aggregateMobilityRangeForSingular(
      singular({ species_set: new Set([Board.QUEEN]) }),
      [proposition({
        species_set: new Set([Board.NIGHT]),
        aggregate_mobility_range: { min: 0, max: 0 }
      })]
    )
    expect(result).toEqual({ min: 0, max: Infinity })
  })

  it('does not match propositions on the opposing team', () => {
    const result = aggregateMobilityRangeForSingular(
      singular({ team: Board.WHITE }),
      [proposition({
        team: Board.BLACK,
        aggregate_mobility_range: { min: 0, max: 0 }
      })]
    )
    expect(result).toEqual({ min: 0, max: Infinity })
  })

  it('skips propositions with frame other than current', () => {
    const result = aggregateMobilityRangeForSingular(singular(), [
      proposition({
        frame: 'prior',
        aggregate_mobility_range: { min: 0, max: 0 }
      })
    ])
    expect(result).toEqual({ min: 0, max: Infinity })
  })

  it('does not match when the singular has no real species (only null)', () => {
    const result = aggregateMobilityRangeForSingular(
      singular({ species_set: new Set([null]) }),
      [proposition({ aggregate_mobility_range: { min: 0, max: 0 } })]
    )
    expect(result).toEqual({ min: 0, max: Infinity })
  })
})

describe('edgeBiasedShuffle bias cap', () => {
  const candidates = () => [position('a1'), position('d4'), position('h8'), position('e5')]
  const tightRange = { min: 0, max: 0 }

  it('increments the bias counter when a bias actually fires', () => {
    const biasState = createBiasState()
    edgeBiasedShuffle(candidates(), () => 0, tightRange, biasState)
    expect(biasState.count).toBe(1)
  })

  it('does not increment the counter when the bias roll fails', () => {
    const biasState = createBiasState()
    edgeBiasedShuffle(candidates(), () => 0.9, tightRange, biasState)
    expect(biasState.count).toBe(0)
  })

  it('does not increment the counter when the mobility range is permissive', () => {
    const biasState = createBiasState()
    edgeBiasedShuffle(candidates(), () => 0, undefined, biasState)
    expect(biasState.count).toBe(0)
  })

  it('caps bias triggers at the configured maximum across repeated calls', () => {
    const biasState = createBiasState(2)
    edgeBiasedShuffle(candidates(), () => 0, tightRange, biasState)
    edgeBiasedShuffle(candidates(), () => 0, tightRange, biasState)
    edgeBiasedShuffle(candidates(), () => 0, tightRange, biasState)
    expect(biasState.count).toBe(2)
  })

  it('returns a uniform shuffle once the bias cap is reached', () => {
    const biasState = createBiasState(2)
    edgeBiasedShuffle(candidates(), () => 0, tightRange, biasState)
    edgeBiasedShuffle(candidates(), () => 0, tightRange, biasState)
    const third = edgeBiasedShuffle(candidates(), () => 0, tightRange, biasState)
    expect([...third].sort()).toEqual([...candidates()].sort())
  })
})
