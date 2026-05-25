import { describe, it, expect } from 'vitest'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'

// Fast detector coverage: buildCombinedPlan runs detectContradiction without
// the generation pipeline. Mirrors the single-condition rules in Ruby
// Nodes::ConditionSatisfiability.
function result(payload) {
  return buildCombinedPlan([payload])
}

function census(overrides = {}) {
  return {
    version: 2, kind: 'census',
    subject: 'allied', subjectFilter: 'any',
    operator: 'count', comparator: 'equal_to',
    target: 'exact_number', targetTotal: 1,
    ...overrides
  }
}

function relational(overrides = {}) {
  return {
    version: 2, kind: 'relational',
    subject: 'moved_piece', subjectFilter: 'any',
    operator: 'attack', target: 'enemy', targetFilter: 'any',
    ...overrides
  }
}

describe('plan contradictions', () => {
  describe('at-most-one count ceiling', () => {
    it('flags a singular census count of 2', () => {
      expect(result(census({ subject: 'moved_piece', targetTotal: 2 })).reason).toMatch(/at most once/i)
    })

    it('flags a captured-piece census count greater than 1', () => {
      expect(result(census({ subject: 'captured_piece', comparator: 'greater_than', targetTotal: 1 })).reason).toMatch(/at most once/i)
    })

    it('flags a king-filtered census count of 2', () => {
      expect(result(census({ subjectFilter: 'king', subjectFilterMode: 'include', targetTotal: 2 })).reason).toMatch(/at most once/i)
    })

    it('allows a king-exclude group count above 1', () => {
      expect(result(census({ subjectFilter: 'king', subjectFilterMode: 'exclude', comparator: 'greater_than', targetTotal: 1 })).status).not.toBe('contradictory')
    })

    it('flags a singular relational subject count of 2', () => {
      expect(result(relational({
        subjectComparisonMetric: 'count', subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 2
      })).reason).toMatch(/at most once/i)
    })

    it('flags a singular relational target count of 2', () => {
      expect(result(relational({
        target: 'enemy_moved_piece',
        targetComparisonMetric: 'count', targetComparator: 'equal_to',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 2
      })).reason).toMatch(/at most once/i)
    })

    it('flags a relational singular count > 1 (operand 1)', () => {
      expect(result(relational({
        subjectComparisonMetric: 'count', subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 1
      })).reason).toMatch(/at most once/i)
    })

    it('allows a singular count of 1', () => {
      expect(result(census({ subject: 'moved_piece', targetTotal: 1 })).status).not.toBe('contradictory')
    })

    it('allows a group count above 1', () => {
      expect(result(census({ subject: 'allied', comparator: 'greater_than', targetTotal: 5 })).status).not.toBe('contradictory')
    })

    it('allows a vacuous singular upper bound (count < 5)', () => {
      expect(result(census({ subject: 'moved_piece', comparator: 'less_than', targetTotal: 5 })).status).not.toBe('contradictory')
    })
  })

  describe('pawn rank legality', () => {
    function pawn(overrides = {}) {
      return census({
        subjectFilter: 'pawn', subjectFilterMode: 'include',
        comparator: 'greater_than', targetTotal: 0,
        positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5,
        ...overrides
      })
    }

    it('flags a pawn on rank 1', () => {
      expect(result(pawn({ positionTarget: 1 })).reason).toMatch(/rank 1 or 8/i)
    })

    it('flags a pawn on rank 8', () => {
      expect(result(pawn({ positionTarget: 8 })).reason).toMatch(/rank 1 or 8/i)
    })

    it('flags a pawn pinned to rank 1 by a range comparator', () => {
      expect(result(pawn({ positionComparator: 'less_than_or_equal_to', positionTarget: 1 })).reason).toMatch(/rank 1 or 8/i)
    })

    it('flags a pawn on a square that sits on rank 1', () => {
      expect(result(pawn({ positionAxis: 'square', positionComparator: 'equal_to', positionTarget: 3 })).reason).toMatch(/rank 1 or 8/i)
    })

    it('flags a moved_piece pawn on its home rank (2)', () => {
      expect(result(pawn({ subject: 'moved_piece', positionTarget: 2 })).reason).toMatch(/starting rank/i)
    })

    it('flags an enemy_moved_piece pawn on its home rank (7)', () => {
      expect(result(pawn({ subject: 'enemy_moved_piece', positionTarget: 7 })).reason).toMatch(/starting rank/i)
    })

    it('allows a pawn on rank 5', () => {
      expect(result(pawn({ positionTarget: 5 })).status).not.toBe('contradictory')
    })

    it('allows a pawn on rank 2 for a non-moved subject', () => {
      expect(result(pawn({ subject: 'allied', positionTarget: 2 })).status).not.toBe('contradictory')
    })

    it('ignores an excluded pawn filter', () => {
      expect(result(pawn({ subjectFilterMode: 'exclude', positionTarget: 1 })).status).not.toBe('contradictory')
    })

    it('ignores the file axis', () => {
      expect(result(pawn({ positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 1 })).status).not.toBe('contradictory')
    })
  })

  describe('allied team cannot be fully immobile', () => {
    function mob(overrides = {}) {
      return census({ subject: 'allied', subjectFilter: 'any', operator: 'mobility', comparator: 'equal_to', targetTotal: 0, ...overrides })
    }

    it('flags allied any mobility = 0', () => {
      expect(result(mob()).reason).toMatch(/allied mobility/i)
    })

    it('allows allied any mobility = 0 within a region', () => {
      expect(result(mob({ positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5 })).status).not.toBe('contradictory')
    })

    it('allows enemy any mobility = 0', () => {
      expect(result(mob({ subject: 'enemy' })).status).not.toBe('contradictory')
    })

    it('allows allied filtered mobility = 0', () => {
      expect(result(mob({ subjectFilter: 'queen', subjectFilterMode: 'include' })).status).not.toBe('contradictory')
    })
  })

  describe('count cannot exceed the prior board state', () => {
    function growth(overrides = {}) {
      return census({ subject: 'allied', subjectFilter: 'any', operator: 'count', comparator: 'greater_than', target: 'prior_board_state', ...overrides })
    }

    it('flags allied any count > PBS', () => {
      expect(result(growth()).reason).toMatch(/prior board state/i)
    })

    it('flags enemy any count > PBS', () => {
      expect(result(growth({ subject: 'enemy' })).reason).toMatch(/prior board state/i)
    })

    it('allows count > PBS within a region', () => {
      expect(result(growth({ positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5 })).status).not.toBe('contradictory')
    })

    it('allows a filtered count > PBS', () => {
      expect(result(growth({ subjectFilter: 'queen', subjectFilterMode: 'include' })).status).not.toBe('contradictory')
    })
  })

  describe('the moved piece must exist', () => {
    function moved(overrides = {}) {
      return census({ subject: 'moved_piece', subjectFilter: 'any', operator: 'count', comparator: 'equal_to', targetTotal: 0, ...overrides })
    }

    it('flags moved_piece any count = 0 whole-board', () => {
      expect(result(moved()).reason).toMatch(/moved piece must exist/i)
    })

    it('allows moved_piece any count = 0 within a region', () => {
      expect(result(moved({ positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5 })).status).not.toBe('contradictory')
    })

    it('allows a filtered moved_piece count = 0', () => {
      expect(result(moved({ subjectFilter: 'queen', subjectFilterMode: 'include' })).status).not.toBe('contradictory')
    })

    it('allows enemy_moved_piece any count = 0', () => {
      expect(result(moved({ subject: 'enemy_moved_piece' })).status).not.toBe('contradictory')
    })
  })

  describe('comparison below zero', () => {
    it('flags census mobility < 0', () => {
      expect(result(census({ subject: 'moved_piece', operator: 'mobility', comparator: 'less_than', targetTotal: 0 })).reason).toMatch(/below 0/i)
    })

    it('flags relational count < 0', () => {
      expect(result(relational({
        subjectComparisonMetric: 'count', subjectComparator: 'less_than',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 0
      })).reason).toMatch(/below 0/i)
    })

    it('allows a count of 0', () => {
      expect(result(census({ subject: 'allied', operator: 'count', comparator: 'equal_to', targetTotal: 0 })).status).not.toBe('contradictory')
    })
  })
})
