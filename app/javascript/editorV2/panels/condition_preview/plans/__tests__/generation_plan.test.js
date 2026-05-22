import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildPlan } from 'editorV2/panels/condition_preview/plans/generation_plan'

describe('buildPlan team assignment for captured-type actors', () => {
  const teams = { movingTeam: Board.WHITE, enemyTeam: Board.BLACK }

  it('assigns subjectTeam = enemyTeam for captured_piece subject', () => {
    const plan = buildPlan(
      {
        version: 2, kind: 'census',
        subject: 'captured_piece', subjectFilter: 'any',
        operator: 'count', comparator: 'equal_to',
        target: 'exact_number', targetTotal: 1
      },
      teams
    )
    expect(plan.status).toBe('supported')
    expect(plan.subjectTeam).toBe(Board.BLACK)
  })

  it('assigns subjectTeam = movingTeam for enemy_captured_piece subject', () => {
    const plan = buildPlan(
      {
        version: 2, kind: 'census',
        subject: 'enemy_captured_piece', subjectFilter: 'any',
        operator: 'count', comparator: 'equal_to',
        target: 'exact_number', targetTotal: 1
      },
      teams
    )
    expect(plan.status).toBe('supported')
    expect(plan.subjectTeam).toBe(Board.WHITE)
  })

  it('assigns targetTeam = enemyTeam for captured_piece target', () => {
    const plan = buildPlan(
      {
        version: 2, kind: 'census',
        subject: 'allied', subjectFilter: 'any',
        operator: 'value', comparator: 'greater_than',
        target: 'captured_piece', targetFilter: 'any'
      },
      teams
    )
    expect(plan.status).toBe('supported')
    expect(plan.targetTeam).toBe(Board.BLACK)
  })

  it('assigns targetTeam = movingTeam for enemy_captured_piece target', () => {
    const plan = buildPlan(
      {
        version: 2, kind: 'census',
        subject: 'enemy', subjectFilter: 'any',
        operator: 'value', comparator: 'greater_than',
        target: 'enemy_captured_piece', targetFilter: 'any'
      },
      teams
    )
    expect(plan.status).toBe('supported')
    expect(plan.targetTeam).toBe(Board.WHITE)
  })
})
