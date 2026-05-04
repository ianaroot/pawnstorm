// Pipeline stats — opt-in instrumentation for understanding which collection
// pipelines pull weight in the condition preview generator.
//
// Wire it up by passing `pipelineStats.record` as options.stats.onComplete
// when calling generateConditionExamples. Multiple calls accumulate into the
// module-level Map keyed by node_ids string. When you want to inspect:
//
//   cpgStats.flushToConsole()    // pretty JSON to devtools — copy/paste
//   cpgStats.snapshot()           // returns the live object
//   cpgStats.clear()              // reset the accumulator
//
// One entry per unique chain (node_ids tuple). Each entry's `runs` array
// preserves every call individually — same chain run multiple times keeps
// every record so variance across runs stays visible.

const accumulator = new Map()

function chainKey(nodeIds) {
  if (!nodeIds || nodeIds.length === 0) { return '__no_node_ids__' }
  return nodeIds.join('|')
}

function runFields(callRecord) {
  const { node_ids: _ids, payloads: _payloads, ...rest } = callRecord
  return rest
}

export const pipelineStats = {
  record(callRecord) {
    const key = chainKey(callRecord.node_ids)
    const existing = accumulator.get(key)
    if (existing) {
      existing.runs.push(runFields(callRecord))
    } else {
      accumulator.set(key, {
        node_ids: callRecord.node_ids ?? [],
        payloads: callRecord.payloads,
        runs: [runFields(callRecord)]
      })
    }
  },

  snapshot() {
    return Object.fromEntries(accumulator)
  },

  flushToConsole() {
    console.log(JSON.stringify(this.snapshot(), null, 2))
  },

  clear() { accumulator.clear() }
}

if (typeof window !== 'undefined') {
  window.cpgStats = pipelineStats
}

export default pipelineStats
