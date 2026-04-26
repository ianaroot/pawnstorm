# condition_preview — architecture map

Generates illustrative chess board examples for a given bot condition payload, used by the editor to show the user what a condition looks like in practice.

Public entry point: `ConditionExampleGenerator.generateConditionExamples(payload, options)`.

---

## Dependency layers

### Layer 1 — foundation (no local deps)
`board_utils`, `geometry_utils`, `comparison_requirements`

### Layer 2 — condition-agnostic utils
`example_utils` → board_utils, geometry_utils

### Layer 3 — relational utils
`relational_utils` → example_utils, comparison_requirements, CandidateMoveAnalysisV2, ConditionEvaluatorV2

### Layer 4 — plan construction
`generation_plan` → relational_utils, comparison_requirements, example_utils

Validates payload, computes all derived values once, returns a typed plan struct. `payload` does not travel past this point — everything downstream receives the plan.

### Layer 5 — pipeline modules (receive plan as data, not import)
- `skeleton_builders` → board_utils, geometry_utils, board_query_utils
- `candidate_collection` → board_utils, geometry_utils, example_utils, relational_utils, skeleton_builders
- `skeleton_augmentation` → board_utils, geometry_utils, board_query_utils, skeleton_builders, comparison_requirements
- `diversity_selection` → example_utils
- `enrichment` → board_utils, example_utils, relational_utils, diversity_selection
- `special_move_examples` → board_utils, example_utils, relational_utils, skeleton_builders

### Layer 6 — orchestrator
`ConditionExampleGenerator` → all layer 5 modules + generation_plan + board_utils + comparison_requirements + example_utils

No module in layers 1–5 imports from the generator. No circular deps.

---

## Files

### `board_utils.js`
Low-level board plumbing. No local imports.  
Key exports: `square`, `pieceCode`, `pieceTeam`, `pieceSpecies`, `emptyLayout`, `buildLayoutFromPieces`, `buildBoardFromLayout`, `layoutsMatch`, `clonePiecesMap`, `legalPlacementForSpecies`, `shuffled`, `pushUnique`, `unique`, `occupiedCount`, `squareIsOccupied`.

### `geometry_utils.js`
Geometric calculations over board positions. No local imports.  
Key exports: `RAY_STEPS`, `adjacentNeighborPositions`, `positionsForSliderOrigins`, `originCandidatesForSpecies`, `shieldAttackerSpeciesForStep`, `relationSquareDistance`, `sortByDistanceFromRelation`.

### `comparison_requirements.js`
Pure analysis of comparison sub-conditions in a payload. No imports at all — works on plain objects.  
Key exports: `comparisonDescriptors`, `comparisonRequirements`, `usesZeroRelationPath`, `COUNT_COMPARISON_METRIC`, `EXACT_NUMBER_COMPARISON_SOURCE`, `PRIOR_BOARD_COMPARISON_SOURCE`.  
`comparisonRequirements` returns `{ comparisonsPresent, subject, target }` where subject/target are the required pair counts (null if unconstrained).

### `example_utils.js`
Condition-type-agnostic helpers. Reusable by both relational and future unary example generation.  
Key exports: `speciesMatchesFilter`, `candidateSpecies`, `selectKingPair`, `collectLegalReverseMoves`, `moveKindForMoveObject`, `soundForMove`, `candidateIdentity`, `MOVE_KIND_STANDARD`, `MOVE_KIND_CASTLE`.  
`candidateIdentity` currently references relational result fields — will be generalized when unary arrives.

### `relational_utils.js`
Relational-condition-specific helpers. Unary conditions will not use this file.  
Key exports: `teamForActor`, `roleRequiresMovedPiece`, `roleRequiresEnemyMovedPiece`, `relationalActorRequiresPresence`, `relationParams`, `subjectTargetLabels`, `buildExampleVariantPlan`, `sideSpeciesPool`, `evaluateCandidate`.  
`evaluateCandidate({ plan, priorBoard, moveObject })` — uses `plan.evaluationPayload` and `plan.relationParams`; gates on `result.pairs.length === 0`. Callers needing zero-pair results must inline evaluation instead.  
`subjectTargetLabels(plan, moveObject, result)` — uses `plan.subject`/`plan.target`.  

### `generation_plan.js`
Validates payload and constructs the typed plan struct consumed by all pipeline modules. Absorbs the support-check logic that would otherwise live in the generator.  
Key exports: `buildRelationalPlan(payload, options)` — returns either `{ status: 'unsupported', reason }` or a full supported plan.  
Plan shape:
- `evaluationPayload` — raw payload, for passing to the evaluator only; not for field access
- `operator`, `subject`, `target`, `subjectFilter`, `targetFilter`, `subjectFilterMode`, `targetFilterMode` — actor/operator fields still needed by geometry and collection logic
- `requirements` — pre-computed from `comparisonRequirements`
- `variants` — pre-computed from `buildExampleVariantPlan`
- `subjectSpeciesPool`, `targetSpeciesPool` — pre-computed from `candidateSpecies`
- `subjectTeam`, `targetTeam` — pre-computed from `teamForActor`
- `movingTeam`, `moveKinds` — from options
- `relationParams` — pre-computed from `relationParams`

### `skeleton_builders.js`
Builds "skeletons" — minimal piece layouts satisfying a relational condition geometry. Receives `plan` for team and operator; does not import generation_plan.  
Key exports: `buildCandidateSkeletons`, `buildControlSkeletons`, `buildAdjacentSkeletons`, `buildShieldSkeletons`, `mergeRelationPieces`, `teamForActorWithContext`.  
`teamForActorWithContext` is exported for future use in the moving-team refactor; not called internally after plan adoption.

### `candidate_collection.js`
Takes skeletons and collects verified example boards by working backwards from legal moves.  
Key exports: `collectVerifiedExamples`, `buildZeroRelationExamples`, `preferredExtraMovedSpecies`, `buildEnemyRecentMoveContext`, `roleSquaresForMovedPiece`, `movedPieceOptionSets`, `requiredZeroRelationPlacements`.  
`buildZeroRelationExamples` inlines condition evaluation (does not use `evaluateCandidate`) because zero-count conditions intentionally produce zero pairs and `evaluateCandidate` would reject them. Uses `plan.evaluationPayload` directly.

### `diversity_selection.js`
Selects a diverse subset of examples from a candidate pool using round-robin across species/variant buckets.  
Key exports: `selectDiverseExamples`, `uniqueExamples`, `roundRobinAppend`, `subjectSpeciesSignature`, `targetSpeciesSignature`, `speciesPairSignature`, `varietySignature`, `bucketKeyForExample`.

### `enrichment.js`
Decorates examples with extra pieces to make positions richer, then finalizes and merges example sets.  
Key exports: `enrichExample`, `finalizeExamples`, `mergeMoveKindExamples`, `requiredRelationPairFloor`, `movePathSquares`, `forbiddenSquaresForEnrichment`, `weightedEnrichmentCandidateSquares`, `deriveVerifiedExample`, `exampleEligibleForEnrichment`, `buildEnrichmentPlacementPolicy`.  
`requiredRelationPairFloor(plan)` reads `plan.requirements` directly — no longer calls `comparisonRequirements`.

### `skeleton_augmentation.js`
Augments skeletons to add extra relation pairs when count comparisons require more than one subject or target.  
Key exports: `augmentSkeletonsForComparisons`, `augmentExistingRelation`, `addContributorsForSide`, `nextAvailableIndependentSkeletons`, `buildAttackOrDefendContributionCandidates`, `buildAdjacentContributionCandidates`.  
Reads `plan.requirements`, `plan.operator`, `plan.subjectTeam`, `plan.targetTeam`, `plan.subjectSpeciesPool`, `plan.targetSpeciesPool` — no longer imports relational_utils or comparison_requirements (except `usesZeroRelationPath`).

### `special_move_examples.js`
Generates examples for special move kinds. Currently handles castle; en passant and promotion are planned (add here first, extract if needed).  
Key exports: `collectCastleExamples`, `castlePresetForTeam`, `castleAnchorPlacementsForActor`, `collectLegalCastleMoveExamples`.  
Castle is currently White-only (`castlePresetForTeam` returns `[]` for Black). Will generalize with the moving-team refactor.

### `ConditionExampleGenerator.js`
Orchestrator and public API. Calls `buildRelationalPlan` then routes to the appropriate pipeline modules.  
Public exports: `generateConditionExamples` (named + default).  
Key constants: `MAX_DEFAULT_EXAMPLES = 30`, `MAX_CANDIDATE_POOL = 120`, `MAX_BUILD_ATTEMPTS = 1200`, `MAX_EXAMPLES_PER_BUCKET = 8`.

---

## Key architectural decisions

**Plan-based pipeline**: `generation_plan.js` validates payload and pre-computes all derived values (requirements, species pools, teams, variants, relationParams) once. Downstream modules receive the plan as a parameter — `payload` does not travel past `buildRelationalPlan`. `plan.evaluationPayload` is the only sanctioned route to the raw payload, used exclusively when calling `ConditionEvaluatorV2`.

**Relational vs unary split**: `example_utils` is condition-type-agnostic; `relational_utils` is relational-only. When unary support arrives, it gets its own `unary_utils`, its own plan builder, and shares `example_utils`. `generation_plan.js` will return a discriminated plan by `kind`.

**Moving team**: Currently hardcoded to `Board.WHITE` in plan construction (`teamForActor` uses White). Planned refactor: change plan construction to use `teamForActorWithContext(actor, plan.movingTeam)` — one-line fix that propagates automatically to all pipeline modules.

**Zero-relation path**: When a comparison requires zero matching pairs, `buildZeroRelationExamples` handles generation separately. The standard pipeline always produces at least one pair, so these two paths never mix.

**Enrichment probability**: `ENRICHMENT_PROBABILITY = 0.5` in enrichment.js — roughly half of output examples get extra decoration pieces.

**Special move kinds**: Castle, en passant, and promotion each need bespoke generation logic. All live in `special_move_examples.js` until extraction is justified.
