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

// Baselines recorded 2026-05-18, N=1000 per payload, seed=1 (deterministic).
// `baseline:` is the verified count; forward_proposition_baselines.test.js
// enforces ±20%. Re-record after intended mechanism/ordering changes; prior
// numbers are in git history.
//
// SHIFT LOG — minor within-±20% drifts left at their original baseline (NOT
// re-recorded) so each regression's cause stays traceable to a commit:
//  - commit <TBD: Phase 1 step 2 — shield onto chooseRelationVariant helper,
//    enemy_moved_piece adopted as shield shielder/target/attacker>:
//      shield aggregate_value > PBS                       389 → 403
//      shield aggregate_value > PBS (non-bound, both-allied) 381 → 391
//      enemy non-pawn shield enemy queen                  591 → 593
//      allied bishop shield allied rook (non-bound, current) 708 → 742
//      chain 112421·112419·112418                         445 → 403
//      chain synthetic 3-relation (attack+defend+shield)  409 → 383
//    Cause: enemy-side shields now recruit enemy_moved_piece (intended
//    participation gain); chain drifts are the same mechanism downstream.
//  - commit <TBD: Phase 1 step 3 — anchored moved/enemy geometry in
//    attack_or_defend.js / adjacent.js>:
//      attack count > PBS                                 112 → 108
//      attack aggregate_value > PBS                       112 → 108
//      adjacent count > PBS                               362 → 352
//      defend aggregate_value > PBS (non-bound)           390 → 382
//      defend count < PBS (non-bound, both-allied)        124 → 102  (-17.7%, closest to ±20% gate — watch)
//      allied pawn defend allied minor                    802 → 797
//      allied any adjacent enemy king                     528 → 602
//      allied non-queen attack enemy queen                617 → 624
//      allied bishop attack enemy rook (non-bound, cur)   714 → 711
//      allied knight defend allied bishop (non-bound,cur) 769 → 765
//      allied knight adjacent enemy queen (non-bound,cur) 663 → 654
//      chain synthetic 3-relation (attack+defend+shield)  409 → 390  (was 383 after step 2 above)
//    Cause: anchored moved/enemy recruitment shifts placement
//    distribution across the non-bound relation satisfiers.
//  - commit <TBD: independent special/standard shifts + singular-constraint discipline>:
//    Two collection shifts (special / standard) so neither starves the other,
//    plus per-group caps so castle / promotion / en_passant share the special
//    budget. Downstream code can no longer silently overwrite a scenario's
//    moved_piece commitment — must go through shared/singular_constraints.js.
//    Verified up across all 26 payloads; 11 baselines re-recorded (outside ±20%).
const PAYLOADS = [
  {
    baseline: 484,
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
    baseline: 390,
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
    baseline: 362,
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
    baseline: 390,
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
    baseline: 390,
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
    baseline: 281,
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
    baseline: 460,
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
    baseline: 533,
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
    baseline: 841,
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
    baseline: 828,
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
    baseline: 865,
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
    baseline: 777,
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
    baseline: 591,
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
    baseline: 802,
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
    baseline: 707,
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
    baseline: 617,
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
    baseline: 870,
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
    baseline: 769,
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
    baseline: 891,
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
    baseline: 708,
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
    baseline: 598,
    name: "chain 112415·112413·112412",
    payloads: [
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", operator: "attack", target: "moved_piece", targetFilter: "any", subjectFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any" },
      { version: 2, kind: "relational", subject: "moved_piece", subjectFilter: "knight", operator: "attack", target: "enemy", targetFilter: "pawn", subjectFilterMode: "include", targetFilterMode: "exclude", targetComparisonMetric: "count", targetComparator: "greater_than", targetComparisonSource: "exact_number", targetComparisonSourceTotal: 1 }
    ]
  },
  {
    baseline: 445,
    name: "chain 112421·112419·112418",
    payloads: [
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "any", operator: "defend", target: "moved_piece", targetFilter: "any" },
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", operator: "attack", target: "moved_piece", targetFilter: "any", subjectFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "equal_to", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { kind: "relational", target: "enemy", subject: "enemy", version: 2, operator: "shield", targetFilter: "pawn", subjectFilter: "rook", targetFilterMode: "exclude", subjectComparator: "greater_than", subjectFilterMode: "include", subjectComparisonMetric: "individual_value", subjectComparisonSource: "moved_piece" }
    ]
  },
  {
    baseline: 689,
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
    baseline: 59,
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
    baseline: 514,
    name: "chain synthetic 3-relation (attack+defend+shield)",
    payloads: [
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "queen", subjectFilterMode: "exclude", operator: "attack", target: "enemy", targetFilter: "queen", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "allied", subjectFilter: "pawn", operator: "defend", target: "allied", targetFilter: "minor", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 },
      { version: 2, kind: "relational", subject: "enemy", subjectFilter: "pawn", subjectFilterMode: "exclude", operator: "shield", target: "enemy", targetFilter: "queen", targetFilterMode: "include", subjectComparisonMetric: "count", subjectComparator: "greater_than", subjectComparisonSource: "exact_number", subjectComparisonSourceTotal: 0 }
    ]
  },
  {
    baseline: 502,
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
