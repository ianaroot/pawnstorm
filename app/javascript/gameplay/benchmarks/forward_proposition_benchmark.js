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


// seed=1 N=5000 deterministic; `baseline:` is verified-as-percent-of-attempts
// (e.g. 41.98 means 41.98%). forward_proposition_baselines.test.js enforces
// ±20%. Re-record after intended behavior changes — the bench's friendly
// BASELINE column shows what to paste back in; shift causes are in git log.
const PAYLOADS = [
  {
    baseline: 52.64,
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
    baseline: 10.54,
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
    baseline: 23.30,
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
  },
  {
    baseline: 10.54,
    name: "attack count > PBS (non-bound)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "knight",
      operator: "attack",
      target: "enemy", targetFilter: "queen",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "prior_board_state"
    }
  },
  {
    baseline: 58.52,
    name: "defend aggregate_value > PBS (non-bound)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "bishop",
      operator: "defend",
      target: "allied", targetFilter: "queen",
      subjectComparisonMetric: "aggregate_value",
      subjectComparator: "greater_than",
      subjectComparisonSource: "prior_board_state"
    }
  },
  {
    baseline: 18.74,
    name: "defend count < PBS (non-bound, both-allied)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "knight",
      operator: "defend",
      target: "allied", targetFilter: "king",
      subjectComparisonMetric: "count",
      subjectComparator: "less_than",
      subjectComparisonSource: "prior_board_state"
    }
  },
  {
    baseline: 58.86,
    name: "shield aggregate_value > PBS (non-bound, both-allied)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "pawn", subjectFilterMode: "exclude",
      operator: "shield",
      target: "allied", targetFilter: "queen", targetFilterMode: "include",
      subjectComparisonMetric: "aggregate_value",
      subjectComparator: "greater_than",
      subjectComparisonSource: "prior_board_state"
    }
  },
  {
    baseline: 33.36,
    name: "rook mobility < 5 (mobility-constrained)",
    payload: {
      version: 2, kind: "census",
      subject: "allied", subjectFilter: "rook",
      operator: "mobility", comparator: "less_than",
      target: "exact_number", targetTotal: 5
    }
  },
  {
    // Adversarial: allied bishop at h1 conflicts unconditionally with
    // kingside castle's rookStart empty constraint. Every castle attempt
    // should be detectable as wasted.
    baseline: 83.70,
    name: "allied bishop at h1 (conflicts with kingside castle)",
    payload: {
      version: 2, kind: "census",
      subject: "allied", subjectFilter: "bishop",
      positionAxis: "square", positionComparator: "equal_to", positionTarget: 7,
      operator: "count", comparator: "greater_than",
      target: "exact_number", targetTotal: 0
    }
  },
  {
    // Adversarial: allied pawn at e5 conflicts with EP-left only when
    // moved_piece commits to d6 (diag-left-origin lands on e5). Other
    // EP destinations are fine. "Sometimes blocks."
    baseline: 82.58,
    name: "allied pawn at e5 (sometimes blocks en passant)",
    payload: {
      version: 2, kind: "census",
      subject: "allied", subjectFilter: "pawn",
      positionAxis: "square", positionComparator: "equal_to", positionTarget: 36,
      operator: "count", comparator: "greater_than",
      target: "exact_number", targetTotal: 0
    }
  },
  {
    // Region-restricted PBS census, increasing. Rook chosen so the rank
    // delta can't arise by luck (a rook may stay on its rank).
    baseline: 96.52,
    name: "census rook count rank=5 > PBS (region, increasing)",
    payload: {
      version: 2, kind: "census",
      subject: "allied", subjectFilter: "rook", subjectFilterMode: "include",
      positionAxis: "rank", positionComparator: "equal_to", positionTarget: 5,
      operator: "count", comparator: "greater_than",
      target: "prior_board_state"
    }
  },
  {
    // Region-restricted PBS census, decreasing (capture-in-region path).
    baseline: 83.02,
    name: "census enemy count file=4 < PBS (region, decreasing)",
    payload: {
      version: 2, kind: "census",
      subject: "enemy", subjectFilter: "any",
      positionAxis: "file", positionComparator: "equal_to", positionTarget: 4,
      operator: "count", comparator: "less_than",
      target: "prior_board_state"
    }
  },
  // Non-bound, non-PBS relational payloads: these compile to a ctx.relations
  // entry and exercise satisfyRelations (the PBS relational payloads above
  // route through cross_frame instead). Added to give the relations path
  // benchmark coverage.
  {
    baseline: 66.52,
    name: "enemy non-pawn shield enemy queen",
    payload: {
      version: 2, kind: "relational",
      subject: "enemy", subjectFilter: "pawn", subjectFilterMode: "exclude",
      operator: "shield",
      target: "enemy", targetFilter: "queen", targetFilterMode: "include",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  {
    baseline: 80.72,
    name: "allied pawn defend allied minor",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "pawn",
      operator: "defend",
      target: "allied", targetFilter: "minor",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  {
    baseline: 63.86,
    name: "allied any adjacent enemy king",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "any",
      operator: "adjacent",
      target: "enemy", targetFilter: "king",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  {
    baseline: 65.42,
    name: "allied non-queen attack enemy queen",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "queen", subjectFilterMode: "exclude",
      operator: "attack",
      target: "enemy", targetFilter: "queen",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  // Phase-1 non-bound current-frame participation repro set (no PBS, no
  // singular subject/target). Mirrors the control/doublestack experiment:
  // these are the conditions where moved-piece subject/target recruitment
  // is measured before/after the relation-variant helper.
  {
    baseline: 76.88,
    name: "allied bishop attack enemy rook (non-bound, current)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "bishop",
      operator: "attack",
      target: "enemy", targetFilter: "rook",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  {
    baseline: 82.60,
    name: "allied knight defend allied bishop (non-bound, current)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "knight",
      operator: "defend",
      target: "allied", targetFilter: "bishop",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  {
    baseline: 76.52,
    name: "allied knight adjacent enemy queen (non-bound, current)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "knight",
      operator: "adjacent",
      target: "enemy", targetFilter: "queen",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  {
    baseline: 73.26,
    name: "allied bishop shield allied rook (non-bound, current)",
    payload: {
      version: 2, kind: "relational",
      subject: "allied", subjectFilter: "bishop", subjectFilterMode: "include",
      operator: "shield",
      target: "allied", targetFilter: "rook", targetFilterMode: "include",
      subjectComparisonMetric: "count",
      subjectComparator: "greater_than",
      subjectComparisonSource: "exact_number",
      subjectComparisonSourceTotal: 0
    }
  },
  // DB chains (three conditions each), node IDs in name. Mostly bound
  // moved_piece relationals → route to propositions, not satisfyRelations
  // (chain B's shield emits 1 relation). Coverage for chain machinery +
  // propositions/cross-frame on real multi-condition chains.
  {
    baseline: 66.02,
    name: "chain 112415·112413·112412",
    payloads: [
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", operator: "attack", target: "moved_piece", targetFilter: "any", subjectFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any" },
      { version: 2, kind: "relational", subject: "moved_piece", subjectFilter: "knight", operator: "attack", target: "enemy", targetFilter: "pawn", subjectFilterMode: "include", targetFilterMode: "exclude", targetComparisonMetric: "count", targetComparator: "greater_than", targetComparisonSource: "exact_number", targetComparisonSourceTotal: 1 }
    ]
  },
  {
    baseline: 33.58,
    name: "allied defends moved + no pawn attacks moved + enemy rook (>moved value) shields enemy non-pawn",
    payloads: [
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any" },
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", operator: "attack", target: "moved_piece", targetFilter: "any", subjectFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { kind: "relational", target: "enemy", subject: "enemy", version: 2, operator: "shield", targetFilter: "pawn", subjectFilter: "rook", targetFilterMode: "exclude", subjectComparator: "greater_than", subjectFilterMode: "include", subjectComparisonMetric: "individual_value", subjectComparisonSource: "moved_piece" }
    ]
  },
  {
    baseline: 75.36,
    name: "chain 112270·112269·112267",
    payloads: [
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "any", operator: "attack", target: "moved_piece", targetFilter: "any", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { kind: "census", target: "exact_number", subject: "captured_piece", version: 2, operator: "count", comparator: "equal_to", targetTotal: 0, subjectFilter: "any" }
    ]
  },
  {
    // Two simultaneous PBS deltas on one moved_piece; hard case, lifted from
    // ~0.1% by the interposition work.
    baseline: 5.42,
    name: "chain 112832·112834·112835 (rook mobility PBS)",
    payloads: [
      { version: 2, kind: "relational", subject: "moved_piece", subjectFilter: "any", operator: "defend", target: "allied", targetFilter: "major", targetFilterMode: "include", targetComparisonMetric: "count", targetComparator: "greater_than", targetComparisonSource: "prior_board_state" },
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "major", operator: "attack", target: "moved_piece", targetFilter: "any", subjectFilterMode: "exclude", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { kind: "census", target: "prior_board_state", subject: "moved_piece", version: 2, operator: "mobility", comparator: "greater_than", subjectFilter: "rook", subjectFilterMode: "include" }
    ]
  },
  // Synthetic 3-relation chain: all non-bound, count>0, non-PBS, so all three
  // land in ctx.relations. Exists only to exercise the satisfyRelations shuffle
  // (no real bot chain combines ≥2 such relations — see session notes).
  {
    baseline: 40.26,
    name: "chain synthetic 3-relation (attack+defend+shield)",
    payloads: [
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "queen", subjectFilterMode: "exclude", operator: "attack", target: "enemy", targetFilter: "queen", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "pawn", operator: "defend", target: "allied", targetFilter: "minor", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", subjectFilterMode: "exclude", operator: "shield", target: "enemy", targetFilter: "queen", targetFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 }
    ]
  },
  {
    baseline: 43.42,
    name: "allied queen mobility < PBS (whole-board census)",
    payload: {
      version: 2, kind: "census",
      subject: "allied", subjectFilter: "queen",
      operator: "mobility", comparator: "less_than",
      target: "prior_board_state"
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

function benchmarkPayload(entry, attempts) {
  const { name } = entry
  const payloads = entry.payloads ?? [entry.payload]
  const combinedPlan = buildCombinedPlan(payloads)
  if (combinedPlan.status !== "supported") {
    return { name, status: combinedPlan.status }
  }
  profileCollector.reset()
  const started = performance.now()
  const standardExamples = []
  const produced = {
    "forward-proposition": 0,
    "forward-proposition.standard": 0,
    "forward-proposition.special": 0
  }
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
  const snapshot = profileCollector.snapshot()
  return {
    name,
    baseline: entry.baseline,
    attempts,
    verified: produced["forward-proposition"],
    verified_standard: produced["forward-proposition.standard"],
    verified_special: produced["forward-proposition.special"],
    total_ms: Number(totalMs.toFixed(2)),
    avg_ms_per_attempt: Number((totalMs / attempts).toFixed(4)),
    timings: relevantTimings(snapshot),
    counters: relevantCounters(snapshot)
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

function relevantCounters(snapshot) {
  const result = {}
  if (!snapshot) { return result }
  for (const [label, value] of Object.entries(snapshot.counters ?? {})) {
    if (!PROFILE_LABEL_PREFIXES.some(p => label.startsWith(p))) { continue }
    result[label] = value
  }
  return result
}

function formatFriendly(results, attempts) {
  const nameWidth = Math.max(7, ...results.map(r => r.name.length))
  const pad = (s, w) => String(s).padEnd(w)
  const padL = (s, w) => String(s).padStart(w)

  const lines = [
    `forward_proposition — ${attempts} attempts/payload, ${results.length} payloads`,
    "",
    `  ${pad("PAYLOAD", nameWidth)}  ${padL("VERIFIED", 12)}  ${padL("RATE", 8)}  ${padL("BASELINE", 9)}  ${padL("Δ%", 7)}  ${padL("ms/att", 7)}`
  ]

  let totalMs = 0
  for (const r of results) {
    if (r.status && r.status !== "supported") {
      lines.push(`  ${pad(r.name, nameWidth)}  ${padL(r.status, 12)}`)
      continue
    }
    totalMs += r.total_ms
    const verified = `${r.verified}/${r.attempts}`
    const rate = `${(100 * r.verified / r.attempts).toFixed(2)}%`
    const baseline = r.baseline == null ? "—" : `${r.baseline.toFixed(2)}%`
    const drift = formatDrift(r.verified, r.baseline, r.attempts)
    lines.push(
      `  ${pad(r.name, nameWidth)}  ${padL(verified, 12)}  ${padL(rate, 8)}  ${padL(baseline, 9)}  ${padL(drift, 7)}  ${padL(r.avg_ms_per_attempt.toFixed(3), 7)}`
    )
  }

  lines.push("", `  total: ${results.length} payloads, ${(totalMs / 1000).toFixed(2)}s`)
  return lines.join("\n")
}

// Signed relative drift of the current rate vs the baseline percent. Leading
// "!" marks drift outside the ±20% gate enforced by
// forward_proposition_baselines.test.js.
function formatDrift(verified, baseline, attempts) {
  if (baseline == null) { return "—" }
  const currentPct = 100 * verified / attempts
  const pct = 100 * (currentPct - baseline) / baseline
  const marker = Math.abs(pct) > 20 ? "!" : " "
  const sign = pct >= 0 ? "+" : ""
  return `${marker}${sign}${pct.toFixed(1)}%`
}

function runCli() {
  const attempts = parseInt(process.argv[2] ?? "200", 10)
  const results = PAYLOADS.map(p => benchmarkPayload(p, attempts))

  if (process.env.BENCH_JSON) {
    console.log(JSON.stringify({
      benchmark: "forward_proposition",
      attempts_per_payload: attempts,
      payload_count: PAYLOADS.length,
      payloads: results
    }, null, 2))
  } else {
    console.log(formatFriendly(results, attempts))
  }
}

if (!process.env.VITEST) { runCli() }

export { PAYLOADS, benchmarkPayload }
