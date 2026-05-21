import { describe, expect, it } from 'vitest'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { eligibleScenariosFor } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/eligibility'
import { kingsideCastleScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/kingside_castle'
import { queensideCastleScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/queenside_castle'

const TRIVIAL_PAYLOAD = {
  version: 2, kind: 'census',
  subject: 'allied', subjectFilter: 'pawn',
  operator: 'count', comparator: 'greater_than_or_equal_to',
  target: 'exact_number', targetTotal: 0
}

const KNIGHT_MOVER_PAYLOAD = {
  version: 2, kind: 'census',
  subject: 'moved_piece', subjectFilter: 'knight',
  operator: 'count', comparator: 'greater_than',
  target: 'exact_number', targetTotal: 0
}

describe('eligibleScenariosFor', () => {
  it('returns scenarios whose ctx-delta merge yields a satisfiable ctx', () => {
    const plan = buildCombinedPlan([TRIVIAL_PAYLOAD])
    const eligible = eligibleScenariosFor(plan, [kingsideCastleScenario, queensideCastleScenario])
    expect(eligible).toEqual([kingsideCastleScenario, queensideCastleScenario])
  })

  it('filters out scenarios whose merge yields unsatisfiable ctx', () => {
    const plan = buildCombinedPlan([KNIGHT_MOVER_PAYLOAD])
    const eligible = eligibleScenariosFor(plan, [kingsideCastleScenario, queensideCastleScenario])
    expect(eligible).toEqual([])
  })

  it('filters out a castle scenario when chain demands enough queens on the home rank to force overlap with the castle emptiness', () => {
    const plan = buildCombinedPlan([{
      version: 2, kind: 'census',
      subject: 'allied', subjectFilter: 'queen',
      positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 1,
      operator: 'count', comparator: 'greater_than_or_equal_to',
      target: 'exact_number', targetTotal: 8
    }])
    const eligible = eligibleScenariosFor(plan, [kingsideCastleScenario, queensideCastleScenario])
    expect(eligible).toEqual([])
  })
})
