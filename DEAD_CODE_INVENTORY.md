# Dead-code inventory — value redesign (aggregate_value gated off)

Code left **dormant and intact** by the value redesign so old behavior can be
restored quickly if UX testing demands it. If we stay on this path, this is the
list to delete. Identifiers are authoritative; line numbers are approximate.

## Newly dormant (introduced by this work — safe to delete to finalize)

| Identifier | File | ~Line | Notes |
|---|---|---|---|
| `NON_KING_VALUE_SPECIES` (const) | `app/javascript/editorV2/panels/condition_preview/plans/plan.js` | 20 | Replaced by `plans/value_source_options.js`. Now unreferenced. |
| `valueSourceOptions` (fn) | `app/javascript/editorV2/panels/condition_preview/plans/plan.js` | 28 | Old non-king copy. Live path uses `kingInclusiveValueSourceOptions` (import line 14). Unreferenced. |
| `detectSingularActorWithAggregateValue` (fn) | `app/javascript/editorV2/panels/condition_preview/plans/plan.js` | 264 | Unregistered from `CONTRADICTION_DETECTORS`; body retained, unreachable. |
| both-sides-aggregate validation block | `app/models/nodes/data_validator.rb` | 125–127 | Can't fire (line ~230 rejects aggregate metric first). Kept per "don't delete dead code"; restore value if aggregate_value is re-enabled. |

## Intentionally preserved dormant (handoff §3E/§9 — recoverable capability)

| Identifier | File | ~Line |
|---|---|---|
| `aggregate_value` dispatch branches | `app/javascript/bot_execution/candidate_move_analysis_v2.js` | 276–321 |
| `relationalAggregateValueFromPairs` (fn) | `app/javascript/bot_execution/candidate_move_analysis_v2.js` | ~337 |
| `metricForPositions` `case 'aggregate_value'` + `valueOfPositions` | `app/javascript/bot_execution/relational_analysis.js` | 167, 175 |
| `actor_aggregate_value.js` | `app/javascript/editorV2/panels/condition_preview/forward_resolver/strategies/` | — |
| `relation_aggregate_value.js` | `app/javascript/editorV2/panels/condition_preview/forward_resolver/strategies/` | — |
| `relation_pbs_aggregate_value.js` | `app/javascript/editorV2/panels/condition_preview/forward_resolver/strategies/` | — |
| ConditionForm.js aggregate UI logic: `leftUsesAggregateValue`/`rightUsesAggregateValue`, aggregate note toggles, mutual-exclusion, `disableOptions(['aggregate_value'])`, `metric === 'aggregate_value'` arm | `app/javascript/editorV2/panels/ConditionForm.js` | ~216, 479, 796, 824–831, 1022, 1045 |

## Pre-existing dead (NOT introduced by this work)

| Identifier | File | ~Line | Notes |
|---|---|---|---|
| `NON_KING_VALUE_SPECIES`, `valueSourceOptions`, `expandDescriptorVariants`, `expandRelationalPlanSources` | `app/javascript/editorV2/panels/condition_preview/plans/generation_plan.js` | 63, 155, 218, 251 | Dead before this work: nothing imports its `expandRelationalPlanSources`; `buildPlan` never reaches them. Untouched. |

## Skipped tests (dormant, preserved — re-enable with the aggregate engine)

- `app/javascript/editorV2/__tests__/ConditionExampleGenerator.test.js` — "flags contradiction when a singular actor uses aggregate_value" (`it.skip`)
- `app/javascript/bot_execution/__tests__/condition_evaluator_v2.test.js` — 8-test aggregate cluster (sum/dedup/count+aggregate combinatorial) + 3 relational-aggregate PBS tests (`it.skip`)
- `app/javascript/editorV2/panels/condition_preview/forward_proposition/__tests__/pbs_relation_diversity.test.js` — 5 aggregate_value `it.skip` (count test left live)
- `app/javascript/editorV2/panels/condition_preview/forward_proposition/__tests__/subject_side_aggregate_value_diversity.test.js` — whole describe (`describe.skip`)
- `app/javascript/editorV2/panels/condition_preview/forward_proposition/__tests__/narrow_for_crossframe.test.js` — "handles aggregate_value metric the same as count" (`it.skip`)
