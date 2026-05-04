import { Candidate } from '../shared/candidate'
import { classifyPlan } from './plan_classifier'
import { PATTERNS } from './move_patterns'

const DEFAULT_ATTEMPTS_PER_DRIVER = 200

export function collectForwardPatternExamples({ combinedPlan, random, maxStandardSize, addUnique, standardExamples, produced, attemptsPerDriver = DEFAULT_ATTEMPTS_PER_DRIVER }) {
  if (combinedPlan.plans.length === 0) { return }
  const classifications = combinedPlan.plans.map(classifyPlan)
  const drivers = classifications.filter(c => c.pbsDirection !== null)
  if (drivers.length === 0) { return }

  // Round-robin through (driver, pattern) combinations so every applicable pattern
  // gets a turn before any single pattern fills the pool.
  roundLoop: for (let round = 0; round < attemptsPerDriver; round += 1) {
    if (standardExamples.length >= maxStandardSize) { break }
    for (const driver of drivers) {
      for (const pattern of PATTERNS) {
        if (standardExamples.length >= maxStandardSize) { break roundLoop }
        const result = pattern.generate({ driver, combinedPlan, random })
        if (!result) { continue }
        const candidate = new Candidate({ combinedPlan, priorBoard: result.priorBoard, moveObject: result.moveObject })
        if (!candidate.isVerified()) { continue }
        const example = candidate.buildExample({ generationPath: 'forward-pattern', geometryKey: 'forward' })
        if (!example) { continue }
        produced['forward-pattern'] += 1
        addUnique(example, standardExamples)
      }
    }
  }
}
