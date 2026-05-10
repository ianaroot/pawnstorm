import { Candidate } from '../shared/candidate'
import { CandidateVerifier } from '../shared/candidate_verifier'
import { ExampleFactory } from '../shared/example_factory'
import { buildAttempt } from './build_engine'

const DEFAULT_ATTEMPTS = 200

export function collectForwardPropositionExamples({
  combinedPlan, random, maxStandardSize, addUnique, standardExamples, produced,
  attempts = DEFAULT_ATTEMPTS, deadline = Infinity
}) {
  if (combinedPlan.plans.length === 0) { return }
  const verifier = new CandidateVerifier({ combinedPlan })
  const factory = new ExampleFactory({ combinedPlan })

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (standardExamples.length >= maxStandardSize) { break }
    if (Date.now() > deadline) { break }
    const result = buildAttempt(combinedPlan, random)
    if (!result) { continue }
    const candidate = new Candidate({ priorBoard: result.priorBoard, moveObject: result.moveObject })
    if (!verifier.isVerified(candidate)) { continue }
    const example = factory.build(candidate, { generationPath: 'forward-proposition', geometryKey: 'forward' })
    if (!example) { continue }
    produced['forward-proposition'] += 1
    addUnique(example, standardExamples)
  }
}
