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

// Baseline rates recorded 2026-05-18, N=1000 per payload, seed=1 (shuffles +
// synthesize interposition live). Regression reference when changing
// mechanisms or pipeline ordering; prior numbers are in git history.
const PAYLOADS = [
  {
    // Baseline 2026-05-18: 426/1000 (42.6%)
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
    // Baseline 2026-05-18: 103/1000 (10.3%)
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
    // Baseline 2026-05-18: 382/1000 (38.2%)
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
    // Baseline 2026-05-18: 103/1000 (10.3%)
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
    // Baseline 2026-05-18: 396/1000 (39.6%)
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
    // Baseline 2026-05-18: 120/1000 (12.0%)
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
    // Baseline 2026-05-18: 357/1000 (35.7%)
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
    // Baseline 2026-05-18: 532/1000 (53.2%)
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
    // Baseline 2026-05-18: 824/1000 (82.4%)
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
    // Baseline 2026-05-18: 821/1000 (82.1%)
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
    // Baseline 2026-05-18: 866/1000 (86.6%)
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
    // Baseline 2026-05-18: 762/1000 (76.2%)
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
    // Baseline 2026-05-18: 576/1000 (57.6%)
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
    // Baseline 2026-05-18: 799/1000 (79.9%)
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
    // Baseline 2026-05-18: 520/1000 (52.0%)
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
    // Baseline 2026-05-18: 639/1000 (63.9%)
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
  // DB chains (three conditions each), node IDs in name. Mostly bound
  // moved_piece relationals → route to propositions, not satisfyRelations
  // (chain B's shield emits 1 relation). Coverage for chain machinery +
  // propositions/cross-frame on real multi-condition chains.
  {
    // Baseline 2026-05-18: 593/1000 (59.3%)
    name: "chain 112415·112413·112412",
    payloads: [
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", operator: "attack", target: "moved_piece", targetFilter: "any", subjectFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any" },
      { version: 2, kind: "relational", subject: "moved_piece", subjectFilter: "knight", operator: "attack", target: "enemy", targetFilter: "pawn", subjectFilterMode: "include", targetFilterMode: "exclude", targetComparisonMetric: "count", targetComparator: "greater_than", targetComparisonSource: "exact_number", targetComparisonSourceTotal: 1 }
    ]
  },
  {
    // Baseline 2026-05-18: 411/1000 (41.1%)
    name: "chain 112421·112419·112418",
    payloads: [
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any" },
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", operator: "attack", target: "moved_piece", targetFilter: "any", subjectFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { kind: "relational", target: "enemy", subject: "enemy", version: 2, operator: "shield", targetFilter: "pawn", subjectFilter: "rook", targetFilterMode: "exclude", subjectComparator: "greater_than", subjectFilterMode: "include", subjectComparisonMetric: "individual_value", subjectComparisonSource: "moved_piece" }
    ]
  },
  {
    // Baseline 2026-05-18: 699/1000 (69.9%)
    name: "chain 112270·112269·112267",
    payloads: [
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "any", operator: "attack", target: "moved_piece", targetFilter: "any", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { kind: "census", target: "exact_number", subject: "captured_piece", version: 2, operator: "count", comparator: "equal_to", targetTotal: 0, subjectFilter: "any" }
    ]
  },
  {
    // Baseline 2026-05-18: 52/1000 (5.2%) — two simultaneous PBS deltas on one
    // moved_piece; hard case, lifted from 0.1% by the interposition work.
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
    // Baseline 2026-05-18: 383/1000 (38.3%)
    name: "chain synthetic 3-relation (attack+defend+shield)",
    payloads: [
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "queen", subjectFilterMode: "exclude", operator: "attack", target: "enemy", targetFilter: "queen", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "pawn", operator: "defend", target: "allied", targetFilter: "minor", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", subjectFilterMode: "exclude", operator: "shield", target: "enemy", targetFilter: "queen", targetFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 }
    ]
  },
  {
    // Baseline 2026-05-18: 431/1000 (43.1%)
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
  const snapshot = profileCollector.snapshot()
  return {
    name,
    attempts,
    verified: produced["forward-proposition"],
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
    `  ${pad("PAYLOAD", nameWidth)}  ${padL("VERIFIED", 12)}  ${padL("RATE", 7)}  ${padL("ms/att", 7)}`
  ]

  let totalMs = 0
  for (const r of results) {
    if (r.status && r.status !== "supported") {
      lines.push(`  ${pad(r.name, nameWidth)}  ${padL(r.status, 12)}`)
      continue
    }
    totalMs += r.total_ms
    const verified = `${r.verified}/${r.attempts}`
    const rate = `${(100 * r.verified / r.attempts).toFixed(1)}%`
    lines.push(
      `  ${pad(r.name, nameWidth)}  ${padL(verified, 12)}  ${padL(rate, 7)}  ${padL(r.avg_ms_per_attempt.toFixed(3), 7)}`
    )
  }

  lines.push("", `  total: ${results.length} payloads, ${(totalMs / 1000).toFixed(2)}s`)
  return lines.join("\n")
}

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
