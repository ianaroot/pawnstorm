import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import {
  buildSingularSelectionPool, pickFromPool
} from 'editorV2/panels/condition_preview/forward_proposition/singular_selection'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })
const ALL_SPECIES = [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]

function singular(team, species, region = { kind: 'all' }) {
  return { team, species_set: new Set(species), region, relationsToAnchors: [] }
}

function side({ team, species, region = { kind: 'all' }, count = 1 }) {
  return {
    team,
    species_set: new Set(species),
    region,
    count_range: { min: count, max: Infinity },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE }
  }
}

function relation(subjectSide, targetSide, operator = 'attack') {
  return { operator, subjectSide, targetSide }
}

function proposition({ team, frame = 'current', species, region = { kind: 'all' }, count = 1 }) {
  return {
    team,
    frame,
    species_set: new Set(species),
    region,
    count_range: { min: count, max: Infinity },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE }
  }
}

describe('buildSingularSelectionPool — default entries', () => {
  it('produces 16 weighted-distribution default entries when species_set has all six species', () => {
    const moved = singular(Board.WHITE, ALL_SPECIES)
    const pool = buildSingularSelectionPool(moved, { relations: [], propositions: [] })

    const defaults = pool.filter(e => e.kind === 'default')
    expect(defaults.length).toBe(16)
    expect(defaults.filter(e => e.species === Board.PAWN).length).toBe(8)
    expect(defaults.filter(e => e.species === Board.QUEEN).length).toBe(1)
  })

  it('filters default entries by singular.species_set', () => {
    const moved = singular(Board.WHITE, [Board.QUEEN])
    const pool = buildSingularSelectionPool(moved, { relations: [], propositions: [] })

    const defaults = pool.filter(e => e.kind === 'default')
    expect(defaults.length).toBe(1)
    expect(defaults[0].species).toBe(Board.QUEEN)
  })
})

describe('buildSingularSelectionPool — tagged entries from relations', () => {
  it('adds a tagged entry for a relation side whose team matches the singular', () => {
    const moved = singular(Board.WHITE, ALL_SPECIES)
    const ctx = {
      relations: [relation(
        side({ team: Board.WHITE, species: [Board.QUEEN] }),
        side({ team: Board.BLACK, species: [Board.KING] })
      )],
      propositions: []
    }
    const pool = buildSingularSelectionPool(moved, ctx)

    const tagged = pool.filter(e => e.kind === 'tagged')
    expect(tagged.length).toBe(1)
    expect(tagged[0].species_set).toEqual(new Set([Board.QUEEN]))
  })

  it('does not add tagged entries for team-mismatched sides', () => {
    const moved = singular(Board.WHITE, ALL_SPECIES)
    const ctx = {
      relations: [relation(
        side({ team: Board.BLACK, species: [Board.QUEEN] }),
        side({ team: Board.BLACK, species: [Board.KING] })
      )],
      propositions: []
    }
    const pool = buildSingularSelectionPool(moved, ctx)

    expect(pool.filter(e => e.kind === 'tagged').length).toBe(0)
  })

  it('adds count_range.min tagged entries when min > 1', () => {
    const moved = singular(Board.WHITE, ALL_SPECIES)
    const ctx = {
      relations: [relation(
        side({ team: Board.WHITE, species: [Board.BISHOP], count: 3 }),
        side({ team: Board.BLACK, species: [Board.KING] })
      )],
      propositions: []
    }
    const pool = buildSingularSelectionPool(moved, ctx)

    expect(pool.filter(e => e.kind === 'tagged').length).toBe(3)
  })
})

describe('buildSingularSelectionPool — tagged entries from propositions', () => {
  it('adds tagged entries for current-frame propositions matching team', () => {
    const moved = singular(Board.WHITE, ALL_SPECIES)
    const ctx = {
      relations: [],
      propositions: [proposition({ team: Board.WHITE, species: [Board.BISHOP] })]
    }
    const pool = buildSingularSelectionPool(moved, ctx)

    expect(pool.filter(e => e.kind === 'tagged').length).toBe(1)
  })

  it('skips PBS-frame (prior) propositions', () => {
    const moved = singular(Board.WHITE, ALL_SPECIES)
    const ctx = {
      relations: [],
      propositions: [proposition({ team: Board.WHITE, frame: 'prior', species: [Board.BISHOP] })]
    }
    const pool = buildSingularSelectionPool(moved, ctx)

    expect(pool.filter(e => e.kind === 'tagged').length).toBe(0)
  })
})

describe('buildSingularSelectionPool — species_set intersection', () => {
  it('drops tagged entries whose species_set has empty intersection with singular.species_set', () => {
    const moved = singular(Board.WHITE, [Board.QUEEN])
    const ctx = {
      relations: [relation(
        side({ team: Board.WHITE, species: [Board.BISHOP] }),
        side({ team: Board.BLACK, species: [Board.KING] })
      )],
      propositions: []
    }
    const pool = buildSingularSelectionPool(moved, ctx)

    expect(pool.filter(e => e.kind === 'tagged').length).toBe(0)
  })
})

describe('pickFromPool', () => {
  it('returns null roughly half the time when species_set contains null', () => {
    const moved = singular(Board.BLACK, [null, ...ALL_SPECIES])
    const pool = buildSingularSelectionPool(moved, { relations: [], propositions: [] })

    let nullCount = 0
    let speciesCount = 0
    let i = 0
    const random = () => { i += 1; return ((i * 9301 + 49297) % 233280) / 233280 }
    for (let k = 0; k < 200; k += 1) {
      const result = pickFromPool(pool, moved, random)
      if (result.species === null) { nullCount += 1 } else { speciesCount += 1 }
    }
    expect(nullCount).toBeGreaterThan(50)
    expect(speciesCount).toBeGreaterThan(50)
  })

  it('returns the tagged region when a tagged entry is picked', () => {
    const moved = singular(Board.WHITE, [Board.QUEEN])
    const taggedRegion = { kind: 'set', squares: new Set([0, 1, 2]) }
    const ctx = {
      relations: [relation(
        side({ team: Board.WHITE, species: [Board.QUEEN], region: taggedRegion }),
        side({ team: Board.BLACK, species: [Board.KING] })
      )],
      propositions: []
    }
    const pool = buildSingularSelectionPool(moved, ctx)

    // Drive picker to land on the tagged entry (last in the pool here).
    const result = pickFromPool(pool, moved, () => 0.99)
    expect(result.species).toBe(Board.QUEEN)
    expect(result.region.kind).toBe('set')
  })
})
