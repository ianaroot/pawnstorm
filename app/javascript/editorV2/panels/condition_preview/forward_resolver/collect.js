import { Candidate } from '../shared/candidate'
import { resolveViaHints } from './hint_resolver'

const DEFAULT_HINT_RESOLVER_ATTEMPTS = 200

export function collectForwardResolverExamples({ combinedPlan, random, maxStandardSize, addUnique, standardExamples, produced }) {
  if (combinedPlan.plans.length === 0) { return }

  for (let attempt = 0; attempt < DEFAULT_HINT_RESOLVER_ATTEMPTS; attempt += 1) {
    if (standardExamples.length >= maxStandardSize) { break }
    const result = resolveViaHints({ combinedPlan, random })
    if (!result) { continue }
    const candidate = new Candidate({ combinedPlan, priorBoard: result.priorBoard, moveObject: result.moveObject })
    if (!candidate.isVerified()) { continue }
    const example = candidate.buildExample({ generationPath: 'forward-resolver', geometryKey: 'forward' })
    if (!example) { continue }
    produced['forward-resolver'] += 1
    addUnique(example, standardExamples)
  }
}
