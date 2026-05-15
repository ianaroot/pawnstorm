# condition_preview rules

## Goals

Generate a wide variety of legal chess positions + moves in which the condition(s) are satisfied. Variety means:

- Diversity of piece types involved
- Variety of whether the subject/target is the moving piece or a bystander
- Variety of whether kings are subject target or bystander
- Captures and non-captures both represented
- Check and non-check both represented
- Promotion (simple and capture, all four promoted species), castling, and en passant represented when feasibly satisfiable
- For value conditions: multiple value combinations that satisfy the condition (not just the minimum)
- For mobility conditions: different mobility values and the mechanisms that produce them (edge of board, blocking pieces, pins, check restricting moves, attacks on adjacent squares limiting king mobility)
- For relation conditions: both single-pair and multi-pair examples where the condition allows it
- For prior board state conditions: a variety of delta magnitudes (0→1, 1→2, 2→0 etc.)
- For position conditions: variety of what else is happening on the board (attacked, defended, pinned, etc.)

Rare-but-meaningful move types (castling, promotion, en passant) should be deliberately surfaced even though they are unlikely to appear by pure chance.

---

## Legality Rules

All generated boards must satisfy:

- No illegal moves (enforced by `Rules.getMoveObject` returning `illegal: false`)
- Opponent not in check at the start of the current player's turn (`legalPriorTurnState`)
- Pawns not on rank 1 or rank 8 (enforced at construction time via `legalPlacementForSpecies`)
- No more than 8 pawns per team (enforced at construction time via pawn count tracking)
- Exactly one king per team (enforced at construction time)
- No two pieces on the same square except via legal capture (`mergeRelationPieces` and move legality)
- No same team moving twice in a row (enforced by `allowedToMove` on the board and `legalPriorTurnState`)

Note: most of these are construction-time constraints, not verified by the evaluation chain. The verification chain covers illegal moves and opponent-in-check-before-move only.

## Team vocabulary

See `app/javascript/bot_execution/RULES.md` for the canonical definitions of `movingTeam`, `enemyTeam`, `subjectTeam`, `moved_piece`, `enemy_moved_piece`, `captured_piece`, `enemy_captured_piece`, and `prior_board_state` (PBS).

## Placement discipline

All mutations to a pieces `Map<position, pieceCode>` must go through `placePiece` in `shared/piece_placement.js`. Direct `.set()` on a pieces Map bypasses legality guards and has produced verifier crashes via invalid priorBoard states. If you find a raw `.set()` on a pieces Map outside `piece_placement.js`, treat it as a bug to fix or a deliberate exception that needs a comment explaining why.

**In-progress transition:** `placeWithCaps` in `forward_proposition/respect_caps.js` is being introduced as the canonical wrapper for ctx-having callers — it does `respectsAllCaps` then `placePiece` in one call. Once all forward_proposition callsites use `placeWithCaps`, `placePiece`'s local guards will be stripped and legality enforcement will live entirely in `ctx.propositions` as structural caps (already seeded by `forward_proposition/structural_invariants.js`). Until the refactor lands, both layers run — `placePiece`'s guards remain authoritative for callers without ctx. New ctx-having callsites should prefer `placeWithCaps`; new ctx-less callsites should continue using `placePiece` directly.

## Diversity tuning knobs

Code-side constants that affect generation diversity live at their
point of use, not in a central config file. When investigating a
diversity regression, look here:

- `forward_proposition/pbs_relaxation.js` → `RELAX_PROBABILITY` —
chance of relaxing `count_range` on stability-style PBS relations.
Higher = more 0=0 vacuous-truth examples.
- `forward_proposition/mobility/edge_bias.js` → `EDGE_BIAS_PROBABILITY`,
`LOW_MOBILITY_THRESHOLD` — bias toward edge placement for
low-mobility scenarios.
- `shared/enrichment.js` → `MAX_ENRICHED_EXTRA_PIECES`,
`ENRICHMENT_END_POSITION_WEIGHT` — how many extra pieces enrichment
adds and how much it weights end-positions.
- `orchestrator.js` → `ENRICHMENT_PROBABILITY`,
`FORWARD_PROPOSITION_ATTEMPTS`, `MAX_SEEDS_PER_VARIANT` — attempt
budgets and enrichment frequency.

Semantic sets (`RELAXABLE_PBS_COMPARATORS`, etc.) and performance knobs
(plan-cache size, plan-count caps, timeouts) are intentionally not
listed — changing those is a behavior change, not a tuning operation.

 ## Cross-frame mechanism role detection

  For mechanisms in `forward_proposition/cross_frame/mechanisms/`: use
  `movedPieceRoleInOrInferred(entry, ctx)` unless your non-bound semantics
  differ from "moved_piece is one of the two relation participants."
  Shield is the exception — it resolves `'attacker'` and calls
  `movedPieceRoleIn` (strict) locally.

## Forward-proposition diversity benchmark

  `npm run bench:forward-proposition -- 1000` records pass rates per
  representative PBS payload; baselines commented inline in
  `forward_proposition_benchmark.js`. Run before/after changes to
  mechanisms or phase ordering.