import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { qualifyingSquares } from 'editorV2/panels/condition_preview/shared/unary_position_collection'
import { emitConstraintsFromPlan } from 'editorV2/panels/condition_preview/forward_proposition/propositions'

describe('emitConstraintsFromPlan — unary group count', () => {
  it('emits one proposition with team, frame, species_set, region, and count_range', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'count', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 2
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)

    expect(propositions).toHaveLength(1)
    const [p] = propositions
    expect(p.team).toBe(Board.WHITE)
    expect(p.frame).toBe('current')
    expect(p.species_set).toEqual(new Set([Board.PAWN]))
    expect(p.region).toEqual({ kind: 'all' })
    expect(p.count_range).toEqual({ min: 2, max: Infinity })
  })

  it('emits count_range with equal min and max for comparator equal_to', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'count', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 3
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.count_range).toEqual({ min: 3, max: 3 })
  })

  it('emits count_range capped at total - 1 for comparator less_than', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'count', comparator: 'less_than',
      target: 'exact_number', targetTotal: 4
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.count_range).toEqual({ min: 0, max: 3 })
  })

  it('emits species_set as the complement when subjectFilterMode is exclude', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'pawn', subjectFilterMode: 'exclude',
      operator: 'count', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 1
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.species_set).toEqual(new Set([Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]))
  })

  it('emits aggregate_value_range for unary value plans, with permissive default count_range', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'any',
      operator: 'value', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 20
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.aggregate_value_range).toEqual({ min: 21, max: Infinity })
    expect(p.count_range).toEqual({ min: 0, max: Infinity })
  })
})

describe('emitConstraintsFromPlan — position group', () => {
  it('emits region of qualifying squares for position group count plans', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'position',
      subject: 'allied', subjectFilter: 'pawn',
      positionAxis: 'rank', positionComparator: 'greater_than', positionTarget: 4,
      operator: 'count', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 2
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.region).toEqual({
      kind: 'set',
      squares: new Set(qualifyingSquares('rank', 'greater_than', 4, Board.WHITE))
    })
    expect(p.species_set).toEqual(new Set([Board.PAWN]))
    expect(p.count_range).toEqual({ min: 2, max: Infinity })
  })

  it('emits both region and aggregate_value_range for position group value plans', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'position',
      subject: 'allied', subjectFilter: 'major',
      positionAxis: 'rank', positionComparator: 'greater_than', positionTarget: 4,
      operator: 'value', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 9
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.region).toEqual({
      kind: 'set',
      squares: new Set(qualifyingSquares('rank', 'greater_than', 4, Board.WHITE))
    })
    expect(p.species_set).toEqual(new Set([Board.QUEEN, Board.ROOK]))
    expect(p.aggregate_value_range).toEqual({ min: 9, max: Infinity })
    expect(p.count_range).toEqual({ min: 0, max: Infinity })
  })
})

describe('emitConstraintsFromPlan — relational with singular target', () => {
  it('emits one proposition for the group subject with a related-to region', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any',
      subjectComparisonMetric: 'count',
      subjectComparator: 'greater_than_or_equal_to',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 1,
      operator: 'attack',
      target: 'moved_piece', targetFilter: 'any'
    }])
    const [plan] = combinedPlan.plans

    const { propositions, relations } = emitConstraintsFromPlan(plan)

    expect(relations).toHaveLength(0)
    expect(propositions).toHaveLength(1)
    const [p] = propositions
    expect(p.team).toBe(Board.WHITE)
    expect(p.region).toEqual({
      kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack'
    })
    expect(p.count_range).toEqual({ min: 1, max: Infinity })
  })
})

describe('emitConstraintsFromPlan — relational with singular subject', () => {
  it('emits one proposition for the group target with a related-to region whose role is subject', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy', targetFilter: 'any',
      targetComparisonMetric: 'count',
      targetComparator: 'greater_than_or_equal_to',
      targetComparisonSource: 'exact_number',
      targetComparisonSourceTotal: 1
    }])
    const [plan] = combinedPlan.plans

    const { propositions, relations } = emitConstraintsFromPlan(plan)

    expect(relations).toHaveLength(0)
    expect(propositions).toHaveLength(1)
    const [p] = propositions
    expect(p.team).toBe(Board.BLACK)
    expect(p.region).toEqual({
      kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'attack'
    })
    expect(p.count_range).toEqual({ min: 1, max: Infinity })
  })

  it('uses implicit existence count_range when no count descriptor is present', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any',
      operator: 'attack',
      target: 'moved_piece', targetFilter: 'any'
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.count_range).toEqual({ min: 1, max: Infinity })
  })
})

describe('emitConstraintsFromPlan — individual_value descriptor narrowing', () => {
  it('narrows the proposition species_set on a one-side-singular plan when subject side has individual_value descriptor', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any',
      subjectComparisonMetric: 'individual_value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 5,
      operator: 'attack',
      target: 'moved_piece', targetFilter: 'any'
    }])
    const [plan] = combinedPlan.plans

    const { propositions } = emitConstraintsFromPlan(plan)
    const [p] = propositions

    expect(p.species_set).toEqual(new Set([Board.QUEEN]))
  })

  it('narrows relation.subjectSide.species_set on a two-group plan when subject side has individual_value descriptor', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any',
      subjectComparisonMetric: 'individual_value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 5,
      operator: 'attack',
      target: 'enemy', targetFilter: 'pawn'
    }])
    const [plan] = combinedPlan.plans

    const { relations } = emitConstraintsFromPlan(plan)
    const [r] = relations

    expect(r.subjectSide.species_set).toEqual(new Set([Board.QUEEN]))
  })
})

describe('emitConstraintsFromPlan — relational with both group sides', () => {
  it('emits no propositions and one relation entry, with implicit existence on both sides', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'attack',
      target: 'enemy', targetFilter: 'pawn'
    }])
    const [plan] = combinedPlan.plans

    const { propositions, relations } = emitConstraintsFromPlan(plan)

    expect(propositions).toHaveLength(0)
    expect(relations).toHaveLength(1)
    const [r] = relations
    expect(r.operator).toBe('attack')
    expect(r.subjectSide.team).toBe(Board.WHITE)
    expect(r.subjectSide.species_set).toEqual(new Set([Board.PAWN]))
    expect(r.subjectSide.region).toEqual({ kind: 'all' })
    expect(r.subjectSide.count_range).toEqual({ min: 1, max: Infinity })
    expect(r.targetSide.team).toBe(Board.BLACK)
    expect(r.targetSide.species_set).toEqual(new Set([Board.PAWN]))
    expect(r.targetSide.region).toEqual({ kind: 'all' })
    expect(r.targetSide.count_range).toEqual({ min: 1, max: Infinity })
  })
})

describe('emitConstraintsFromPlan — PBS unary', () => {
  it('emits prior+current propositions and a crossFrame entry for unary count plans against prior_board_state', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'pawn',
      operator: 'count', comparator: 'greater_than',
      target: 'prior_board_state'
    }])
    const [plan] = combinedPlan.plans

    const { propositions, relations, crossFrame } = emitConstraintsFromPlan(plan)

    expect(relations).toHaveLength(0)
    expect(propositions).toHaveLength(2)
    const priorProp = propositions.find(p => p.frame === 'prior')
    const currentProp = propositions.find(p => p.frame === 'current')
    expect(priorProp).toBeDefined()
    expect(currentProp).toBeDefined()
    expect(priorProp.team).toBe(Board.WHITE)
    expect(priorProp.species_set).toEqual(new Set([Board.PAWN]))
    expect(priorProp.region).toEqual({ kind: 'all' })
    expect(priorProp.count_range).toEqual({ min: 0, max: Infinity })
    expect(currentProp.count_range).toEqual({ min: 0, max: Infinity })

    expect(crossFrame).toHaveLength(1)
    expect(crossFrame[0]).toEqual({
      metric: 'count',
      direction: '+',
      priorProposition: priorProp,
      currentProposition: currentProp
    })
  })

  it('uses metric aggregate_value for unary value plans against prior_board_state', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'any',
      operator: 'value', comparator: 'less_than',
      target: 'prior_board_state'
    }])
    const [plan] = combinedPlan.plans

    const { crossFrame } = emitConstraintsFromPlan(plan)

    expect(crossFrame[0].metric).toBe('aggregate_value')
    expect(crossFrame[0].direction).toBe('-')
  })

  it('uses metric individual_value for singular-subject unary value plans against prior_board_state', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'value', comparator: 'greater_than',
      target: 'prior_board_state'
    }])
    const [plan] = combinedPlan.plans

    const { crossFrame } = emitConstraintsFromPlan(plan)

    expect(crossFrame[0].metric).toBe('individual_value')
  })

  it('uses metric aggregate_mobility for unary mobility plans against prior_board_state', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'bishop',
      operator: 'mobility', comparator: 'greater_than',
      target: 'prior_board_state'
    }])
    const [plan] = combinedPlan.plans

    const { crossFrame } = emitConstraintsFromPlan(plan)

    expect(crossFrame[0].metric).toBe('aggregate_mobility')
    expect(crossFrame[0].direction).toBe('+')
  })
})

describe('emitConstraintsFromPlan — PBS-direction relational descriptor', () => {
  it('emits a prior+current proposition pair and a crossFrame entry for prior_board_state source', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any',
      subjectComparisonMetric: 'count',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'prior_board_state',
      operator: 'attack',
      target: 'moved_piece', targetFilter: 'any'
    }])
    const [plan] = combinedPlan.plans

    const { propositions, crossFrame } = emitConstraintsFromPlan(plan)

    expect(propositions).toHaveLength(2)
    const priorProp = propositions.find(p => p.frame === 'prior')
    const currentProp = propositions.find(p => p.frame === 'current')
    expect(priorProp).toBeDefined()
    expect(currentProp).toBeDefined()
    expect(priorProp.team).toBe(Board.WHITE)
    expect(priorProp.region).toEqual({
      kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack'
    })

    expect(crossFrame).toHaveLength(1)
    expect(crossFrame[0]).toEqual({
      metric: 'count',
      direction: '+',
      priorProposition: priorProp,
      currentProposition: currentProp
    })
  })
})
