import profileCollector from 'gameplay/profile_collector'

// Preview-only guard around ConditionEvaluatorV2.evaluate. In-progress,
// not-yet-persistable nodes can reach the evaluator here (unlike the
// gameplay path, which only sees validated data) and a malformed payload
// can throw. Treat a throw as "this candidate does not satisfy the chain"
// so generation degrades to fewer examples instead of unwinding the whole
// pass. The counter keeps it observable rather than silently swallowed.
export function safeEvaluate(evaluator, payload, input) {
  try {
    return evaluator.evaluate(payload, input)
  } catch {
    profileCollector.increment('condition_preview.evaluate.threw')
    return false
  }
}
