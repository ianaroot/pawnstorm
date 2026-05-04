import { Candidate } from '../shared/candidate'
import { CandidateVerifier } from '../shared/candidate_verifier'
import { ExampleFactory } from '../shared/example_factory'
import { resolveViaHints } from './hint_resolver'

const DEFAULT_HINT_RESOLVER_ATTEMPTS = 200

export function collectForwardResolverExamples({ combinedPlan, random, maxStandardSize, addUnique, standardExamples, produced }) {
  if (combinedPlan.plans.length === 0) { return }
  const verifier = new CandidateVerifier({ combinedPlan })
  const factory = new ExampleFactory({ combinedPlan })

  for (let attempt = 0; attempt < DEFAULT_HINT_RESOLVER_ATTEMPTS; attempt += 1) {
    if (standardExamples.length >= maxStandardSize) { break }
    const result = resolveViaHints({ combinedPlan, random })
    if (!result) { continue }
    const candidate = new Candidate({ priorBoard: result.priorBoard, moveObject: result.moveObject })
    if (!verifier.isVerified(candidate)) { continue }
    const example = factory.build(candidate, { generationPath: 'forward-resolver', geometryKey: 'forward' })
    if (!example) { continue }
    produced['forward-resolver'] += 1
    addUnique(example, standardExamples)
  }
}
