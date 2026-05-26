import { describe, it, expect, vi } from 'vitest'

// Stubs the geometry-heavy shieldAttackerPositions so the shield path is testable
// without constructing a real Board.
vi.mock('editorV2/panels/condition_preview/shared/relational_utils', () => ({
  shieldAttackerPositions: vi.fn(() => [99])
}))

import { buildAggregatedResult, buildAggregatedHighlights } from '../move_collection.js'
import { shieldAttackerPositions } from '../relational_utils.js'

function fakeAnalysis({
  relationalResult = { pairs: [], subjectPositions: [], targetPositions: [] },
  capturedPos = null,
  positionFilteredPositions = [],
  relationalActorPositions = []
} = {}) {
  return {
    relationalResult: () => relationalResult,
    capturedPiecePosition: () => capturedPos,
    positionFilteredPositions: () => positionFilteredPositions,
    relationalActorPositions: () => relationalActorPositions,
    afterBoard: () => ({})
  }
}

function attackPlan(overrides = {}) {
  return {
    kind: 'relational',
    operator: 'attack',
    subject: 'allied',
    target: 'enemy',
    subjectFilter: 'any',
    targetFilter: 'any',
    relationParams: {},
    comparisonDescriptors: [],
    ...overrides
  }
}

function censusPlan(overrides = {}) {
  return {
    kind: 'census',
    subject: 'allied',
    subjectFilter: 'any',
    subjectFilterMode: null,
    ...overrides
  }
}

describe('buildAggregatedResult', () => {
  it('aggregates a relational plan into subject/target/pairs plus a contribution', () => {
    const analysis = fakeAnalysis({
      relationalResult: {
        pairs: [{ subjectPosition: 10, targetPosition: 20 }],
        subjectPositions: [10],
        targetPositions: [20]
      }
    })

    const result = buildAggregatedResult({ plans: [attackPlan()] }, analysis)

    expect(result.subjectPositions).toEqual([10])
    expect(result.targetPositions).toEqual([20])
    expect(result.pairs).toEqual([{ subjectPosition: 10, targetPosition: 20 }])
    expect(result.contributions).toHaveLength(1)
    expect(result.contributions[0]).toMatchObject({
      operator: 'attack',
      subjectActor: 'allied',
      targetActor: 'enemy',
      subjectPositions: [10],
      targetPositions: [20]
    })
  })

  it('uses positionFilteredPositions for a region census; keeps positions out of the subjectPositions union', () => {
    const analysis = fakeAnalysis({ positionFilteredPositions: [12, 20] })
    const plan = censusPlan({ positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 1 })

    const result = buildAggregatedResult({ plans: [plan] }, analysis)

    expect(result.subjectPositions).toEqual([])
    expect(result.contributions[0]).toEqual({
      kind: 'census',
      subjectActor: 'allied',
      subjectPositions: [12, 20]
    })
  })

  it('uses relationalActorPositions for a plain (non-region) census; keeps positions out of the subjectPositions union', () => {
    const analysis = fakeAnalysis({ relationalActorPositions: [4, 5] })
    const result = buildAggregatedResult({ plans: [censusPlan()] }, analysis)

    expect(result.subjectPositions).toEqual([])
    expect(result.contributions[0].subjectPositions).toEqual([4, 5])
  })

  it('returns null when a relational plan has zero pairs and no descriptor allows zero', () => {
    const analysis = fakeAnalysis()
    expect(buildAggregatedResult({ plans: [attackPlan()] }, analysis)).toBe(null)
  })

  it('synthesizes a single-pair same_piece contribution at the captured square', () => {
    const analysis = fakeAnalysis({ capturedPos: 28 })
    const plan = attackPlan({ operator: 'same_piece' })

    const result = buildAggregatedResult({ plans: [plan] }, analysis)

    expect(result.subjectPositions).toEqual([28])
    expect(result.targetPositions).toEqual([28])
    expect(result.contributions[0]).toMatchObject({
      operator: 'same_piece',
      subjectPositions: [28],
      targetPositions: [28]
    })
  })
})

describe('buildAggregatedHighlights', () => {
  const moveObject = { startPosition: 12, endPosition: 28 }

  function build(plans, contributions) {
    return buildAggregatedHighlights(
      { plans },
      moveObject,
      { subjectPositions: [], targetPositions: [], pairs: [], contributions },
      {} // priorBoard — shieldAttackerPositions is mocked
    )
  }

  it('tags an attack contribution with attacker + targetAttack roles', () => {
    const highlights = build([attackPlan()], [{
      operator: 'attack',
      subjectActor: 'allied',
      targetActor: 'enemy',
      subjectPositions: [10],
      targetPositions: [20],
      pairs: []
    }])
    expect(highlights.after.roles).toEqual({ attacker: [10], targetAttack: [20] })
    expect(highlights.prior.roles).toEqual({ attacker: [10], targetAttack: [20] })
    expect(highlights.prior.movedStartPosition).toBe(12)
    expect(highlights.after.movedStartPosition).toBe(null)
    expect(highlights.prior.movedEndPosition).toBe(28)
    expect(highlights.after.movedEndPosition).toBe(28)
  })

  it('tags defend, shield (with its external attacker), and adjacent under their roles', () => {
    const shieldPairs = [{ subjectPosition: 13, targetPosition: 23 }]
    const priorBoard = {}
    const highlights = buildAggregatedHighlights(
      { plans: [attackPlan(), attackPlan(), attackPlan()] },
      moveObject,
      { subjectPositions: [], targetPositions: [], pairs: [], contributions: [
        { operator: 'defend', subjectActor: 'allied', targetActor: 'enemy', subjectPositions: [11], targetPositions: [21], pairs: [] },
        { operator: 'shield', subjectActor: 'allied', targetActor: 'enemy', subjectPositions: [13], targetPositions: [23], pairs: shieldPairs },
        { operator: 'adjacent', subjectActor: 'allied', targetActor: 'enemy', subjectPositions: [14], targetPositions: [24], pairs: [] }
      ] },
      priorBoard
    )
    expect(highlights.after.roles.defender).toEqual([11])
    expect(highlights.after.roles.targetDefend).toEqual([21])
    expect(highlights.after.roles.shield).toEqual([13])
    expect(highlights.after.roles.targetShield).toEqual([23])
    expect(highlights.after.roles.attacker).toEqual([99]) // mocked shieldAttackerPositions
    expect(highlights.after.roles.subject).toEqual([14])
    expect(highlights.after.roles.targetGeneric).toEqual([24])
    expect(shieldAttackerPositions).toHaveBeenCalledWith(shieldPairs, priorBoard)
  })

  it('rewrites the prior position to startPosition when subject/target is moved_piece', () => {
    const highlights = build(
      [attackPlan()],
      [{
        operator: 'attack',
        subjectActor: 'moved_piece',
        targetActor: 'moved_piece',
        subjectPositions: [28],
        targetPositions: [28],
        pairs: []
      }]
    )
    expect(highlights.prior.roles.attacker).toEqual([12])
    expect(highlights.prior.roles.targetAttack).toEqual([12])
    expect(highlights.after.roles.attacker).toEqual([28])
    expect(highlights.after.roles.targetAttack).toEqual([28])
  })

  it('tags census subjects under positionSubject', () => {
    const highlights = build(
      [censusPlan()],
      [{ kind: 'census', subjectActor: 'allied', subjectPositions: [4, 5] }]
    )
    expect(highlights.prior.roles.positionSubject).toEqual([4, 5])
    expect(highlights.after.roles.positionSubject).toEqual([4, 5])
  })

  it('aggregates multiple contributions in a chain so one piece can carry multiple roles', () => {
    const highlights = build(
      [attackPlan(), attackPlan()],
      [
        { operator: 'attack',   subjectActor: 'allied', targetActor: 'enemy', subjectPositions: [10], targetPositions: [20], pairs: [] },
        { operator: 'defend',   subjectActor: 'allied', targetActor: 'enemy', subjectPositions: [20], targetPositions: [30], pairs: [] }
      ]
    )
    expect(highlights.after.roles.attacker).toEqual([10])
    expect(highlights.after.roles.targetAttack).toEqual([20])
    expect(highlights.after.roles.defender).toEqual([20]) // 20 plays target-of-attack AND defender — both retained
    expect(highlights.after.roles.targetDefend).toEqual([30])
  })

  it('produces no roles when there are no contributions, but keeps the moved markers', () => {
    const highlights = build([], [])
    expect(highlights.prior.roles).toEqual({})
    expect(highlights.after.roles).toEqual({})
    expect(highlights.prior.movedStartPosition).toBe(12)
    expect(highlights.prior.movedEndPosition).toBe(28)
    expect(highlights.after.movedEndPosition).toBe(28)
  })
})
