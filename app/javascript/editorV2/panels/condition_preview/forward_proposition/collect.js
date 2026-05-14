import { Candidate } from '../shared/candidate'
import { CandidateVerifier } from '../shared/candidate_verifier'
import { ExampleFactory } from '../shared/example_factory'
import { buildAttempt } from './build_engine'
import { clearPlanCache } from './relations/attack_or_defend'
import { eligibleScenariosFor } from './scenarios/eligibility'
import { SCENARIO_REGISTRY } from './scenarios/registry'
import { standardScenario } from './scenarios/standard'

const DEFAULT_ATTEMPTS = 200

export function collectForwardPropositionExamples({
  combinedPlan, random, maxStandardSize, addUnique, standardExamples, produced,
  attempts = DEFAULT_ATTEMPTS, deadline = Infinity
}) {
  if (combinedPlan.plans.length === 0) { return }
  clearPlanCache()
  const verifier = new CandidateVerifier({ combinedPlan })
  const factory = new ExampleFactory({ combinedPlan })

  const eligible = eligibleScenariosFor(combinedPlan, SCENARIO_REGISTRY)
  const scenarioBudgets = buildScenarioBudgets(eligible, attempts)

  for (const { scenario, budget } of scenarioBudgets) {
    for (let i = 0; i < budget; i += 1) {
      if (standardExamples.length >= maxStandardSize) { return }
      if (Date.now() > deadline) { return }
      const result = buildAttempt(combinedPlan, random, scenario)
      if (!result) { continue }
      const candidate = new Candidate({ priorBoard: result.priorBoard, moveObject: result.moveObject })
      if (!verifier.isVerified(candidate)) { continue }
      const example = factory.build(candidate, { generationPath: 'forward-proposition', geometryKey: 'forward' })
      if (!example) { continue }
      produced['forward-proposition'] += 1
      addUnique(example, standardExamples)
    }
  }
}

function buildScenarioBudgets(eligibleScenarios, totalAttempts) {
  const perScenario = eligibleScenarios.map(scenario => ({ scenario, budget: scenario.attemptBudget ?? 0 }))
  const usedByScenarios = perScenario.reduce((sum, sb) => sum + sb.budget, 0)
  const standardBudget = Math.max(0, totalAttempts - usedByScenarios)
  return [...perScenario, { scenario: standardScenario, budget: standardBudget }]
}
