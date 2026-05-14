import profileCollector from "gameplay/profile_collector"
import { buildCombinedPlan } from "editorV2/panels/condition_preview/plans/plan"
import { collectForwardPropositionExamples } from "editorV2/panels/condition_preview/forward_proposition/collect"

process.env.MATCH_PROFILE = "1"

const PROFILE_LABEL_PREFIXES = [
  "forward_proposition.",
  "board_query.",
  "cma.v2.",
  "condition.v2."
]

const PAYLOADS = [
  {
    name: "shield aggregate_value > PBS",
    payload: {
      version: 2, kind: "relational",
      subject: "enemy", subjectFilter: "pawn", subjectFilterMode: "exclude",
      operator: "shield",
      target: "enemy", targetFilter: "queen", targetFilterMode: "include",
      subjectComparisonMetric: "aggregate_value",
      subjectComparator: "greater_than",
      subjectComparisonSource: "prior_board_state"
    }
  },
  {
    name: "attack aggregate_value > PBS",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "knight",
      operator: "attack",
      target: "enemy", targetFilter: "queen",
      subjectComparisonMetric: "aggregate_value",
      subjectComparator: "greater_than",
      subjectComparisonSource: "prior_board_state"
    }
  },
  {
    name: "adjacent count > PBS",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "any",
      operator: "adjacent",
      target: "enemy", targetFilter: "any",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "prior_board_state"
    }
  }
]

function seededRandom(seed = 42) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function noopAddUnique(example, pool) { pool.push(example) }

function benchmarkPayload({ name, payload }, attempts) {
  const combinedPlan = buildCombinedPlan([payload])
  if (combinedPlan.status !== "supported") {
    return { name, status: combinedPlan.status }
  }
  profileCollector.reset()
  const started = performance.now()
  const standardExamples = []
  const produced = { "forward-proposition": 0 }
  collectForwardPropositionExamples({
    combinedPlan,
    random: seededRandom(1),
    maxStandardSize: 10000,
    addUnique: noopAddUnique,
    standardExamples,
    produced,
    attempts
  })
  const totalMs = performance.now() - started
  return {
    name,
    attempts,
    verified: produced["forward-proposition"],
    total_ms: Number(totalMs.toFixed(2)),
    avg_ms_per_attempt: Number((totalMs / attempts).toFixed(4)),
    timings: relevantTimings(profileCollector.snapshot())
  }
}

function relevantTimings(snapshot) {
  const result = {}
  if (!snapshot) { return result }
  for (const [label, data] of Object.entries(snapshot.timings ?? {})) {
    if (!PROFILE_LABEL_PREFIXES.some(p => label.startsWith(p))) { continue }
    result[label] = {
      count: data.count,
      total_ms: Number(data.total_ms.toFixed(2)),
      avg_ms: Number((data.total_ms / data.count).toFixed(4))
    }
  }
  return result
}

const attempts = parseInt(process.argv[2] ?? "200", 10)
const results = PAYLOADS.map(p => benchmarkPayload(p, attempts))

console.log(JSON.stringify({
  benchmark: "forward_proposition",
  attempts_per_payload: attempts,
  payload_count: PAYLOADS.length,
  payloads: results
}, null, 2))
