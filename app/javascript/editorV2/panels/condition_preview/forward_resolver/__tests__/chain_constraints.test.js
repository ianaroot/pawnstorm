import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { buildChainConstraints } from 'editorV2/panels/condition_preview/forward_resolver/chain_constraints'

// These tests pin down that singular-actor team mapping flows correctly into
// the inventory bumps performed by chain_constraints. The bug we fixed had
// inventory contributions for captured_piece subjects landing on the wrong
// team bucket; these tests prevent regression by inspecting the inventory
// state directly after buildChainConstraints.

describe('buildChainConstraints inventory bumps for captured-type subjects', () => {
  it('routes captured_piece singular contribution into the enemyTeam inventory bucket', () => {
    const combinedPlan = buildCombinedPlan([
      {
        version: 2, kind: 'unary',
        subject: 'captured_piece', subjectFilter: 'any',
        operator: 'count', comparator: 'equal_to',
        target: 'exact_number', targetTotal: 1
      }
    ])
    expect(combinedPlan.status).toBe('supported')

    const vars = buildChainConstraints(combinedPlan)
    expect(vars).not.toBeNull()
    expect(vars.capturedPiece.team).toBe(Board.BLACK)
    expect(vars.inventory[Board.BLACK].prior.any.count_range.min).toBeGreaterThanOrEqual(1)
  })

  it('routes enemy_captured_piece singular contribution into the movingTeam inventory bucket', () => {
    const combinedPlan = buildCombinedPlan([
      {
        version: 2, kind: 'unary',
        subject: 'enemy_captured_piece', subjectFilter: 'any',
        operator: 'count', comparator: 'equal_to',
        target: 'exact_number', targetTotal: 1
      }
    ])
    expect(combinedPlan.status).toBe('supported')

    const vars = buildChainConstraints(combinedPlan)
    expect(vars).not.toBeNull()
    expect(vars.enemyCapturedPiece.team).toBe(Board.WHITE)
    expect(vars.inventory[Board.WHITE].prior.any.count_range.min).toBeGreaterThanOrEqual(1)
  })
})
