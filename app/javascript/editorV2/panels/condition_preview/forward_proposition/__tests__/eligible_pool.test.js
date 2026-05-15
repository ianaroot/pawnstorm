import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'

import { buildEligiblePool } from 'editorV2/panels/condition_preview/forward_proposition/early_placement/eligible_pool'

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

function permissiveProposition(overrides = {}) {
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

function relationSide(overrides = {}) {
  return {
    team: Board.WHITE,
    species_set: new Set([Board.QUEEN]),
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE },
    ...overrides
  }
}

function ctxOf(overrides = {}) {
  return {
    singulars: {},
    propositions: [],
    relations: [],
    crossFrame: [],
    ...overrides
  }
}

function poolFromProp(overrides = {}) {
  return buildEligiblePool(ctxOf({ propositions: [permissiveProposition(overrides)] }))
}

function poolFromRelation(subjectOverrides = {}, targetOverrides = {}) {
  const relation = {
    operator: 'attack',
    subjectSide: relationSide({ count_range: { min: 1, max: Infinity }, ...subjectOverrides }),
    targetSide: relationSide({ count_range: { min: 1, max: Infinity }, team: Board.BLACK, ...targetOverrides })
  }
  return buildEligiblePool(ctxOf({ relations: [relation] }))
}

describe('buildEligiblePool — empty ctx', () => {
  it('returns an empty pool', () => {
    expect(buildEligiblePool(ctxOf())).toEqual([])
  })
})

describe('buildEligiblePool — singular entries', () => {
  describe('with a single real singular', () => {
    let pool
    beforeEach(() => {
      pool = buildEligiblePool(ctxOf({ singulars: { moved_piece: singular() } }))
    })

    it('contributes one singular entry to the pool', () => {
      expect(pool.filter(e => e.source === 'singular')).toHaveLength(1)
    })

    it('tags the entry with the actor key', () => {
      expect(pool.find(e => e.source === 'singular').actorKey).toBe('moved_piece')
    })
  })

  describe('with two singular keys aliased to the same object', () => {
    let pool
    beforeEach(() => {
      const shared = singular()
      pool = buildEligiblePool(ctxOf({ singulars: { captured_piece: shared, enemy_moved_piece: shared } }))
    })

    it('dedupes to a single singular entry', () => {
      expect(pool.filter(e => e.source === 'singular')).toHaveLength(1)
    })
  })

  describe('with a singular committed to null', () => {
    let pool
    beforeEach(() => {
      pool = buildEligiblePool(ctxOf({ singulars: { captured_piece: singular({ species_set: new Set([null]) }) } }))
    })

    it('excludes the null singular from the pool', () => {
      expect(pool.filter(e => e.source === 'singular')).toHaveLength(0)
    })
  })
})

describe('buildEligiblePool — proposition entries', () => {
  it('adds count_range.min entries per proposition', () => {
    expect(poolFromProp({ count_range: { min: 3, max: Infinity } }).filter(e => e.source === 'proposition'))
      .toHaveLength(3)
  })

  it('adds zero proposition entries when count_range.min is 0', () => {
    expect(poolFromProp({ count_range: { min: 0, max: Infinity } }).filter(e => e.source === 'proposition'))
      .toHaveLength(0)
  })

  it('skips propositions with frame other than "current"', () => {
    expect(poolFromProp({ frame: 'prior', count_range: { min: 2, max: Infinity } }).filter(e => e.source === 'proposition'))
      .toHaveLength(0)
  })

  it('tags proposition entries with the proposition reference', () => {
    const prop = permissiveProposition({ count_range: { min: 1, max: Infinity } })
    const pool = buildEligiblePool(ctxOf({ propositions: [prop] }))
    expect(pool.find(e => e.source === 'proposition').constraintRef).toBe(prop)
  })
})

describe('buildEligiblePool — relation-side entries', () => {
  it('adds a subject-side entry per relation when subject count_range.min is 1', () => {
    expect(poolFromRelation().filter(e => e.source === 'relation-side' && e.side === 'subject'))
      .toHaveLength(1)
  })

  it('adds a target-side entry per relation when target count_range.min is 1', () => {
    expect(poolFromRelation().filter(e => e.source === 'relation-side' && e.side === 'target'))
      .toHaveLength(1)
  })

  it('uses count_range.min for the subject-side slot count', () => {
    expect(poolFromRelation({ count_range: { min: 2, max: Infinity } }).filter(e => e.source === 'relation-side' && e.side === 'subject'))
      .toHaveLength(2)
  })
})

describe('buildEligiblePool — fresh entries', () => {
  it('adds one fresh entry per non-permissive mobility-constrained proposition', () => {
    expect(poolFromProp({ aggregate_mobility_range: { min: 0, max: 0 } }).filter(e => e.source === 'fresh'))
      .toHaveLength(1)
  })

  it('does not add a fresh entry when the proposition\'s mobility range is permissive', () => {
    expect(poolFromProp().filter(e => e.source === 'fresh'))
      .toHaveLength(0)
  })

  it('tags the fresh entry with the constraint\'s team', () => {
    expect(poolFromProp({ team: Board.BLACK, aggregate_mobility_range: { min: 0, max: 0 } }).find(e => e.source === 'fresh').team)
      .toBe(Board.BLACK)
  })

  it('tags the fresh entry with the constraint reference', () => {
    const prop = permissiveProposition({ aggregate_mobility_range: { min: 0, max: 0 } })
    const pool = buildEligiblePool(ctxOf({ propositions: [prop] }))
    expect(pool.find(e => e.source === 'fresh').constraintRef).toBe(prop)
  })
})
