// Chain constraint propagation — pre-pass that converges shared chain state
// before strategies run. Two variable categories so far:
//
//   1. Singular move-event actors (patch 1): movedPiece, capturedPiece,
//      enemyMovedPiece, enemyCapturedPiece. Each has species_set, position_set,
//      team. Strategies narrow species_set to a singleton on commit; sibling
//      strategies see the commit.
//
//   2. Inventory tree (patch 2): group actors (allied, enemy) with nested
//      filter sub-pools. ctx.inventory[team][frame][filter] holds count_range,
//      value_range, mobility_range. Plans contribute by narrowing ranges;
//      strategies consult ranges when engineering counts/values/mobility for
//      group-actor sides.
//
// The pre-pass runs `contributePlanConstraints(plan, vars)` for each plan in
// the chain. Order does not affect the converged state — set intersection
// and range narrowing are both commutative.
//
// Future patches add:
//   - PBS sample candidates (patch 3)
//   - Position constraint regions (patch 4)
//   - Relation participant coordination via inventory (patch 5)

import Board from 'gameplay/board'
import { attackingPositions, defendingPositions, adjacentPositions, shieldingPositions } from 'gameplay/board_query_utils'
import { ALL_POSITIONS, buildBoardFromLayout, buildLayoutFromPieces } from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { SINGULAR_ACTORS } from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { qualifyingSquares } from 'editorV2/panels/condition_preview_generation/collection/unary_position_collection'

export const ALL_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
const CAPTURABLE_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])

// Map actor name (as used in plans) to the variable key used in ctx.
export const ACTOR_TO_VAR_KEY = Object.freeze({
  moved_piece: 'movedPiece',
  captured_piece: 'capturedPiece',
  enemy_moved_piece: 'enemyMovedPiece',
  enemy_captured_piece: 'enemyCapturedPiece'
})

// Filter → species membership. Used to map a converged species_set onto the
// most-specific filter that contains it (for singular-actor inventory
// contributions).
const FILTER_SPECIES = Object.freeze({
  king:   [Board.KING],
  queen:  [Board.QUEEN],
  rook:   [Board.ROOK],
  bishop: [Board.BISHOP],
  knight: [Board.NIGHT],
  pawn:   [Board.PAWN],
  major:  [Board.QUEEN, Board.ROOK],
  minor:  [Board.BISHOP, Board.NIGHT],
  any:    [Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING]
})

// Most-specific filter whose species superset includes all of `speciesSet`
// (excluding null). Returns null if speciesSet is empty after null exclusion.
// E.g. {QUEEN} → 'queen'; {KNIGHT, BISHOP} → 'minor'; {KING, QUEEN} → 'any'.
function mostSpecificFilter(speciesSet) {
  const clean = [...speciesSet].filter(s => s !== null)
  if (clean.length === 0) { return null }
  const order = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn', 'major', 'minor', 'any']
  for (const filter of order) {
    const filterSpecies = FILTER_SPECIES[filter]
    if (clean.every(s => filterSpecies.includes(s))) { return filter }
  }
  return 'any'
}

function fullPositionSet() {
  return new Set(ALL_POSITIONS)
}

function fullMovedSpeciesSet() {
  return new Set(ALL_SPECIES)  // moved pieces include king (kings move)
}

function fullCapturedSpeciesSet() {
  return new Set([null, ...CAPTURABLE_SPECIES])  // capturable variants exclude king (kings can't be captured); include null for "no capture"
}

function fullEnemyMovedSpeciesSet() {
  return new Set([null, ...ALL_SPECIES])  // enemy can have moved any piece, OR no recent enemy move (null)
}

function initSingularActors(movingTeam) {
  const enemyTeam = Board.opposingTeam(movingTeam)
  return {
    movedPiece: {
      species_set: fullMovedSpeciesSet(),
      position_set: fullPositionSet(),
      team: movingTeam
    },
    capturedPiece: {
      species_set: fullCapturedSpeciesSet(),
      position_set: fullPositionSet(),
      team: enemyTeam
    },
    enemyMovedPiece: {
      species_set: fullEnemyMovedSpeciesSet(),
      position_set: fullPositionSet(),
      team: enemyTeam
    },
    enemyCapturedPiece: {
      species_set: fullCapturedSpeciesSet(),
      position_set: fullPositionSet(),
      team: movingTeam
    }
  }
}

// ===== Inventory tree (group actors) =====
//
// For each (team, frame, filter), holds count_range, value_range,
// mobility_range. Plans narrow these ranges; strategies consult them.
// Filter hierarchy:
//   any → king
//   any → major → queen | rook
//   any → minor → bishop | knight
//   any → pawn

export const INVENTORY_FILTERS = Object.freeze(['any', 'king', 'queen', 'rook', 'bishop', 'knight', 'pawn', 'major', 'minor'])

// Subset → parent map. Used for narrowing propagation:
//   subset narrows ⇒ parent's lower bound rises
//   parent narrows ⇒ subset's upper bound falls
const FILTER_PARENTS = Object.freeze({
  king: ['any'],
  queen: ['major', 'any'],
  rook: ['major', 'any'],
  bishop: ['minor', 'any'],
  knight: ['minor', 'any'],
  pawn: ['any'],
  major: ['any'],
  minor: ['any']
})

function fullRange() {
  return { min: 0, max: Infinity }
}

function initFilterCells() {
  const cells = {}
  for (const filter of INVENTORY_FILTERS) {
    cells[filter] = {
      count_range: fullRange(),
      value_range: fullRange(),
      mobility_range: fullRange()
    }
  }
  return cells
}

function initInventory(movingTeam) {
  const enemyTeam = Board.opposingTeam(movingTeam)
  return {
    [movingTeam]: { current: initFilterCells(), prior: initFilterCells() },
    [enemyTeam]: { current: initFilterCells(), prior: initFilterCells() }
  }
}

// Narrow a {min, max} range against a comparator + total.
function narrowRange(range, comparator, total) {
  switch (comparator) {
    case 'equal_to':
      range.min = Math.max(range.min, total)
      range.max = Math.min(range.max, total)
      break
    case 'greater_than':
      range.min = Math.max(range.min, total + 1)
      break
    case 'greater_than_or_equal_to':
      range.min = Math.max(range.min, total)
      break
    case 'less_than':
      range.max = Math.min(range.max, total - 1)
      break
    case 'less_than_or_equal_to':
      range.max = Math.min(range.max, total)
      break
    default:
      break
  }
}

// Map unary operator to inventory range key.
const OPERATOR_TO_RANGE_KEY = Object.freeze({
  count: 'count_range',
  value: 'value_range',
  mobility: 'mobility_range'
})

// Lower-bound contribution from a comparator + total. Returns null when the
// comparator implies no lower bound (less_than, less_than_or_equal_to).
function lowerBoundFromComparator(comparator, total) {
  switch (comparator) {
    case 'equal_to':                 return total
    case 'greater_than':             return total + 1
    case 'greater_than_or_equal_to': return total
    case 'less_than':
    case 'less_than_or_equal_to':    return null
    default:                         return null
  }
}

// Contribute a unary plan's constraints to the inventory tree. Only handles
// group actors (allied, enemy) with target=exact_number; unary pair (target
// is another actor) and prior_board_state targets defer to other variable
// categories.
function contributeUnaryToInventory(plan, vars) {
  if (plan.kind !== 'unary') { return }
  if (plan.subject !== 'allied' && plan.subject !== 'enemy') { return }
  if (plan.target !== 'exact_number') { return }
  if (!INVENTORY_FILTERS.includes(plan.subjectFilter)) { return }

  const team = plan.subjectTeam
  const filter = plan.subjectFilter
  const rangeKey = OPERATOR_TO_RANGE_KEY[plan.operator]
  if (!rangeKey) { return }

  const cell = vars.inventory[team]?.current?.[filter]
  if (!cell) { return }
  narrowRange(cell[rangeKey], plan.comparator, Number(plan.targetTotal ?? 0))
}

// Contribute lower bounds from a relational plan's comparison descriptors.
// `subject count >= N` implies at least N distinct subject pieces exist on
// the board (they're in the relation), so inventory.{subjectTeam}.{filter}.count.min
// rises to N. Same for target side. aggregate_value descriptors contribute
// to value_range. Less-than comparators give no lower bound. Zero-count
// descriptors give no lower bound. Singular actors are handled by
// contributeSingularActorsToInventory; skip them here.
//
// PBS-direction descriptors (source = prior_board_state) are deferred to
// patch 3 — their (n_prior, n_current) pairing needs more careful handling.
function contributeRelationalToInventory(plan, vars) {
  if (plan.kind !== 'relational') { return }
  const descriptors = plan.comparisonDescriptors ?? []
  for (const descriptor of descriptors) {
    if (descriptor.source !== 'exact_number') { continue }

    const total = Number(descriptor.resolvedTotal ?? descriptor.total ?? 0)
    const lowerBound = lowerBoundFromComparator(descriptor.comparator, total)
    if (lowerBound === null || lowerBound <= 0) { continue }

    const isSubject = descriptor.side === 'subject'
    const actor = isSubject ? plan.subject : plan.target
    if (actor !== 'allied' && actor !== 'enemy') { continue }

    const team = isSubject ? plan.subjectTeam : plan.targetTeam
    const filter = isSubject ? plan.subjectFilter : plan.targetFilter
    if (!INVENTORY_FILTERS.includes(filter)) { continue }

    const rangeKey = descriptor.metric === 'count' ? 'count_range'
                   : descriptor.metric === 'aggregate_value' ? 'value_range'
                   : null
    if (!rangeKey) { continue }

    const cell = vars.inventory[team]?.current?.[filter]
    if (!cell) { continue }
    raiseMin(cell[rangeKey], lowerBound)
  }
}

// Narrow a singular actor's position_set when a position plan with that
// actor as subject demands the piece be on qualifying squares. For singular
// actors with non-zero existential count requirement, the piece's position
// MUST be in the qualifying square set.
function contributePositionPlanToActorPositionSet(plan, vars) {
  if (plan.kind !== 'position') { return }
  if (!SINGULAR_ACTORS.has(plan.subject)) { return }

  // Existential semantics: count > 0 means the actor's position must be in
  // qualifyingSquares. count = 0 means the actor's position must NOT be in
  // qualifyingSquares.
  const total = Number(plan.targetTotal ?? 0)
  const lowerBound = lowerBoundFromComparator(plan.comparator, total)

  const varKey = ACTOR_TO_VAR_KEY[plan.subject]
  const positionSet = vars[varKey].position_set
  const qualifying = qualifyingSquares(plan.positionAxis, plan.positionComparator, plan.positionTarget, vars.movingTeam)
  const qualifyingSet = new Set(qualifying)

  if (lowerBound !== null && lowerBound > 0) {
    for (const pos of [...positionSet]) {
      if (!qualifyingSet.has(pos)) { positionSet.delete(pos) }
    }
  } else if (plan.comparator === 'equal_to' && total === 0) {
    for (const pos of qualifying) { positionSet.delete(pos) }
  }
}

// Contribute lower bounds from a position plan. `allied/pawn on rank > 4
// count >= 2` means at least 2 allied pawns exist on the board (some at
// rank > 4; possibly more elsewhere). Inventory's count.min rises to 2.
//
// Edge case noted but not specially handled: a chain author could write
// something bizarre like `allied/pawn count = 0 rank > 1` which technically
// translates to "no allied pawns past starting rank" (or, with a broad
// interpretation, "no allied pawns at all"). We don't try to extract extra
// inventory inferences from such constraints — the post-evaluator handles
// correctness, and inventory's lower-bound-only philosophy stays consistent.
function contributePositionToInventory(plan, vars) {
  if (plan.kind !== 'position') { return }
  if (plan.subject !== 'allied' && plan.subject !== 'enemy') { return }
  if (!INVENTORY_FILTERS.includes(plan.subjectFilter)) { return }

  const total = Number(plan.targetTotal ?? 0)
  const lowerBound = lowerBoundFromComparator(plan.comparator, total)
  if (lowerBound === null || lowerBound <= 0) { return }

  const cell = vars.inventory[plan.subjectTeam]?.current?.[plan.subjectFilter]
  if (!cell) { return }

  const rangeKey = plan.operator === 'count' ? 'count_range'
                 : plan.operator === 'value' ? 'value_range'
                 : plan.operator === 'mobility' ? 'mobility_range'
                 : null
  if (!rangeKey) { return }

  raiseMin(cell[rangeKey], lowerBound)
}

// After all plans have contributed, derive inventory contributions from the
// converged singular-actor species_sets. Each guaranteed-existing actor adds
// +1 to the count_range minimum at the most-specific filter containing its
// species_set, in the appropriate frame(s).
//
// Frame contributions:
//   moved_piece            — both current and prior (the piece exists in both
//                            frames, just at different positions)
//   captured_piece         — prior only (gone in current)
//   enemy_moved_piece      — prior only (conservative: skip current since the
//                            piece may have been captured by our move)
//   enemy_captured_piece   — neither (was captured before our prior frame)
function contributeSingularActorsToInventory(vars) {
  // moved_piece always exists.
  const movedFilter = mostSpecificFilter(vars.movedPiece.species_set)
  if (movedFilter) {
    raiseMin(vars.inventory[vars.movedPiece.team].current[movedFilter].count_range, 1)
    raiseMin(vars.inventory[vars.movedPiece.team].prior[movedFilter].count_range, 1)
  }

  // captured_piece: only contributes when existence is required (null excluded).
  if (!vars.capturedPiece.species_set.has(null)) {
    const capFilter = mostSpecificFilter(vars.capturedPiece.species_set)
    if (capFilter) {
      raiseMin(vars.inventory[vars.capturedPiece.team].prior[capFilter].count_range, 1)
    }
  }

  // enemy_moved_piece: only contributes when existence is required.
  if (!vars.enemyMovedPiece.species_set.has(null)) {
    const emFilter = mostSpecificFilter(vars.enemyMovedPiece.species_set)
    if (emFilter) {
      raiseMin(vars.inventory[vars.enemyMovedPiece.team].prior[emFilter].count_range, 1)
    }
  }

  // enemy_captured_piece: doesn't contribute to either frame.
}

function raiseMin(range, value) {
  if (value > range.min) { range.min = value }
}

// Propagate range constraints across the filter hierarchy. After all plans
// have contributed, run this once to enforce:
//   - subset.min ≤ parent.min (parent's lower bound rises with subset's)
//   - parent.max ≥ subset.max (subset's upper bound falls with parent's)
// Iterates to fixed-point (bounded), since one propagation can trigger another.
function propagateInventoryRanges(inventory) {
  const RANGE_KEYS = ['count_range', 'value_range', 'mobility_range']
  for (const teamKey of Object.keys(inventory)) {
    for (const frameKey of Object.keys(inventory[teamKey])) {
      const cells = inventory[teamKey][frameKey]
      let changed = true
      let iterations = 0
      while (changed && iterations < 10) {
        changed = false
        iterations += 1
        for (const childFilter of Object.keys(FILTER_PARENTS)) {
          for (const parentFilter of FILTER_PARENTS[childFilter]) {
            const child = cells[childFilter]
            const parent = cells[parentFilter]
            for (const key of RANGE_KEYS) {
              if (child[key].min > parent[key].min) {
                parent[key].min = child[key].min
                changed = true
              }
              if (parent[key].max < child[key].max) {
                child[key].max = parent[key].max
                changed = true
              }
            }
          }
        }
      }
    }
  }
}

// Intersect a species set with a plan-derived pool. Narrows the set in place.
// Plan pools come from candidateSpecies and never contain null, so this also
// removes null from the variable's species_set — appropriate when the plan
// implies existence of the actor.
function intersectSpeciesPool(speciesSet, allowedPool) {
  const allowed = new Set(allowedPool)
  for (const species of [...speciesSet]) {
    if (!allowed.has(species)) { speciesSet.delete(species) }
  }
}

// Apply this plan's constraints to the singular-actor variables. Plans
// reference singular actors via plan.subject and plan.target. Order of
// contributions across plans does not matter — set intersection commutes.
function contributePlanConstraints(plan, vars) {
  // Subject side: relational, unary, and position plans all may have a
  // singular actor as subject. Intersect species set with the plan's pool.
  if (SINGULAR_ACTORS.has(plan.subject)) {
    const varKey = ACTOR_TO_VAR_KEY[plan.subject]
    intersectSpeciesPool(vars[varKey].species_set, plan.subjectSpeciesPool)
  }

  // Target side: relational and unary plans (when target is an actor) may
  // reference a singular actor as target. Position plans don't have an actor
  // target field (target is null per the polymorphic plan contract).
  if (SINGULAR_ACTORS.has(plan.target)) {
    const varKey = ACTOR_TO_VAR_KEY[plan.target]
    intersectSpeciesPool(vars[varKey].species_set, plan.targetSpeciesPool)
  }

  // Same-piece operator: the move captures the prior turn's enemy_moved_piece.
  // Both capturedPiece and enemyMovedPiece must exist — narrow null out.
  if (plan.kind === 'relational' && plan.operator === 'same_piece') {
    vars.capturedPiece.species_set.delete(null)
    vars.enemyMovedPiece.species_set.delete(null)
  }

  // Inventory tree narrowings.
  contributeUnaryToInventory(plan, vars)
  contributeRelationalToInventory(plan, vars)
  contributePositionToInventory(plan, vars)

  // Position narrowing for singular actors.
  contributePositionPlanToActorPositionSet(plan, vars)
}

// Per-variable satisfiability check. An empty species_set on any singular
// actor variable means no species can satisfy the converged constraints —
// chain is unsat. Position sets are not narrowed in patch 1 (position
// constraints are deferred to patch 4) so they're not checked here.
//
// Note: zero-count plans (e.g. "captured_piece count = 0") want the actor to
// NOT exist, which would mean species_set should be {null}. Patch 1 doesn't
// translate zero-count plans into ctx narrowings; the post-evaluator catches
// such conflicts at runtime. Future patches may add zero-count handling.
function isSatisfiable(vars) {
  // Singular-actor variables: empty species_set is unsat. Empty position_set
  // is unsat for guaranteed-existing actors (movedPiece always exists; the
  // captured/enemy_*_piece variables only matter when null is excluded).
  for (const key of ['movedPiece', 'capturedPiece', 'enemyMovedPiece', 'enemyCapturedPiece']) {
    if (vars[key].species_set.size === 0) { return false }
    const mustExist = key === 'movedPiece' || !vars[key].species_set.has(null)
    if (mustExist && vars[key].position_set.size === 0) { return false }
  }
  // Inventory ranges: any cell with min > max is unsat.
  if (vars.inventory) {
    for (const teamKey of Object.keys(vars.inventory)) {
      for (const frameKey of Object.keys(vars.inventory[teamKey])) {
        const cells = vars.inventory[teamKey][frameKey]
        for (const filter of Object.keys(cells)) {
          const cell = cells[filter]
          if (cell.count_range.min > cell.count_range.max) { return false }
          if (cell.value_range.min > cell.value_range.max) { return false }
          if (cell.mobility_range.min > cell.mobility_range.max) { return false }
        }
      }
    }
  }
  return true
}

// ===== PBS sample propagation =====
//
// PBS-direction hints carry a sampled (prior, current) pair (count, value, or
// mobility) for the strategy to engineer. When sibling inventory constraints
// narrow the prior/current ranges, the existing sample may fall outside the
// compatible region. This pass re-samples each PBS hint within the converged
// inventory bounds + direction constraint. If no compatible pair exists, the
// chain is unsat.
//
// Mutates hints in place; returns true on success, false on unsat.
export function narrowPbsHintsByInventory(hints, chainConstraints, random) {
  const inventory = chainConstraints?.inventory
  if (!inventory) { return true }

  for (const hint of hints) {
    const lookup = pbsLookup(hint)
    if (!lookup) { continue }
    const teamCells = inventory[lookup.team]
    if (!teamCells) { continue }
    const priorRange = teamCells.prior?.[lookup.filter]?.[lookup.rangeKey]
    const currentRange = teamCells.current?.[lookup.filter]?.[lookup.rangeKey]
    if (!priorRange || !currentRange) { continue }

    const [priorKey, currentKey] = lookup.pairKeys
    const priorVal = hint[priorKey]
    const currentVal = hint[currentKey]

    if (pbsSampleCompatible(priorVal, currentVal, priorRange, currentRange, hint.direction)) {
      continue
    }

    const newPair = resamplePbsPair(priorRange, currentRange, hint.direction, random)
    if (!newPair) { return false }
    hint[priorKey] = newPair[0]
    hint[currentKey] = newPair[1]
  }
  return true
}

function pbsLookup(hint) {
  // Map the PBS hint to (team, filter, rangeKey, pairKeys) for inventory access.
  switch (hint.type) {
    case 'relation_pbs_count': {
      const side = hint.side === 'subject' ? hint.subject : hint.target
      return { team: side.team, filter: side.filter || 'any', rangeKey: 'count_range', pairKeys: ['nPrior', 'nCurrent'] }
    }
    case 'relation_pbs_aggregate_value': {
      const side = hint.side === 'subject' ? hint.subject : hint.target
      return { team: side.team, filter: side.filter || 'any', rangeKey: 'value_range', pairKeys: ['vPrior', 'vCurrent'] }
    }
    case 'actor_pbs_mobility': {
      return { team: hint.team, filter: hint.filter || 'any', rangeKey: 'mobility_range', pairKeys: ['nPrior', 'nCurrent'] }
    }
    default:
      return null
  }
}

function pbsSampleCompatible(priorVal, currentVal, priorRange, currentRange, direction) {
  if (priorVal < priorRange.min || priorVal > priorRange.max) { return false }
  if (currentVal < currentRange.min || currentVal > currentRange.max) { return false }
  switch (direction) {
    case '+': return currentVal > priorVal
    case '-': return currentVal < priorVal
    case '=': return currentVal === priorVal
    default:  return true
  }
}

function resamplePbsPair(priorRange, currentRange, direction, random) {
  switch (direction) {
    case '=': {
      const lo = Math.max(priorRange.min, currentRange.min)
      const hi = Math.min(priorRange.max, currentRange.max)
      if (lo > hi || !Number.isFinite(hi)) { return Number.isFinite(hi) ? null : [lo, lo] }
      const n = lo + Math.floor(random() * (hi - lo + 1))
      return [n, n]
    }
    case '+': {
      // currentVal > priorVal
      const priorLo = priorRange.min
      const priorHi = Math.min(priorRange.max, Number.isFinite(currentRange.max) ? currentRange.max - 1 : Number.MAX_SAFE_INTEGER)
      if (priorLo > priorHi) { return null }
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const span = Math.min(priorHi - priorLo, 100)
        const nPrior = priorLo + Math.floor(random() * (span + 1))
        const currentLo = Math.max(currentRange.min, nPrior + 1)
        const currentHi = Number.isFinite(currentRange.max) ? currentRange.max : Math.max(currentLo, nPrior + 3)
        if (currentLo > currentHi) { continue }
        const cSpan = Math.min(currentHi - currentLo, 100)
        const nCurrent = currentLo + Math.floor(random() * (cSpan + 1))
        return [nPrior, nCurrent]
      }
      return null
    }
    case '-': {
      // currentVal < priorVal
      const priorLo = Math.max(priorRange.min, currentRange.min + 1)
      const priorHi = priorRange.max
      if (priorLo > priorHi) { return null }
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const span = Math.min(Number.isFinite(priorHi) ? priorHi - priorLo : 5, 100)
        const nPrior = priorLo + Math.floor(random() * (span + 1))
        const currentLo = currentRange.min
        const currentHi = Math.min(currentRange.max, nPrior - 1)
        if (currentLo > currentHi) { continue }
        const cSpan = Math.min(currentHi - currentLo, 100)
        const nCurrent = currentLo + Math.floor(random() * (cSpan + 1))
        return [nPrior, nCurrent]
      }
      return null
    }
    default:
      return null
  }
}

// ===== Position constraints (patch 5) =====
//
// Region representations:
//   { kind: 'set', squares: Set<int> }                    — concrete squares
//   { kind: 'related', actor, operator }                  — variable-dependent:
//       resolves to squares related to {actor}'s position via {operator}
//
// positionConstraint shape:
//   { subset: { team, filter }, region, count_range: { min, max }, plan }
//
// Resolution: regions are materialized against ctx (singular-actor position_sets)
// at consumption time. When the dependent variable narrows to a singleton, the
// region resolves to a deterministic set; otherwise it's the union of related
// squares for each candidate position.

export function resolveRegion(region, ctx, pieces) {
  if (!region) { return new Set() }
  if (region.kind === 'set') { return region.squares }
  if (region.kind === 'related') {
    const varKey = ACTOR_TO_VAR_KEY[region.actor]
    if (!varKey || !ctx[varKey]) { return new Set() }
    const positions = ctx[varKey].position_set
    const result = new Set()
    const board = buildBoardFromLayout(buildLayoutFromPieces(pieces ?? new Map()), null, ctx.movingTeam)
    for (const targetPos of positions) {
      const related = relatedPositions(region.operator, targetPos, board, ctx[varKey].team)
      for (const p of related) { result.add(p) }
    }
    return result
  }
  return new Set()
}

function relatedPositions(operator, targetPos, board, subjectTeam) {
  // Returns positions where a subject (any species) could be placed such that
  // it relates to targetPos via the operator. For 'adjacent', it's just the
  // 8 neighbors. For attack/defend/shield, depends on board state.
  switch (operator) {
    case 'adjacent': return adjacentPositions({ board, targetPosition: targetPos, team: subjectTeam })
    case 'attack':   return attackingPositions({ board, targetPosition: targetPos, team: subjectTeam })
    case 'defend':   return defendingPositions({ board, targetPosition: targetPos, team: subjectTeam })
    case 'shield':   return shieldingPositions({ board, targetPosition: targetPos, team: subjectTeam })
    default:         return []
  }
}

// Contribute a positionConstraint from a relational plan when one side is a
// singular actor. The other side's pieces must be placed at squares related
// to the singular actor's position. Deferred placement: seed-builder won't
// place these pieces; resolvePositionConstraints does after strategies commit.
function contributeRelationalPositionConstraint(plan, vars) {
  if (plan.kind !== 'relational') { return }
  if (plan.operator === 'same_piece') { return }
  // Only emit a constraint when ONE side is singular (the other becomes the
  // deferred-placement side). All-group relational plans use seed_builder.
  const subjectIsSingular = SINGULAR_ACTORS.has(plan.subject)
  const targetIsSingular = SINGULAR_ACTORS.has(plan.target)
  if (subjectIsSingular === targetIsSingular) { return }  // both or neither

  const singularSide = subjectIsSingular ? 'subject' : 'target'
  const groupSide = subjectIsSingular ? 'target' : 'subject'
  const singularActor = subjectIsSingular ? plan.subject : plan.target
  const groupTeam = groupSide === 'subject' ? plan.subjectTeam : plan.targetTeam
  const groupFilter = groupSide === 'subject' ? plan.subjectFilter : plan.targetFilter
  const groupFilterMode = groupSide === 'subject' ? plan.subjectFilterMode : plan.targetFilterMode

  // Existential semantics: at least 1 piece on the group side related to
  // the singular actor (unless plan demands count=0, which is handled by
  // zero-count-skip path elsewhere).
  vars.positionConstraints.push({
    subset: { team: groupTeam, filter: groupFilter || 'any', filterMode: groupFilterMode || null },
    region: { kind: 'related', actor: singularActor, operator: plan.operator },
    count_range: { min: 1, max: Infinity },
    plan
  })
}

export function buildChainConstraints(combinedPlan) {
  const vars = initSingularActors(combinedPlan.movingTeam)
  vars.inventory = initInventory(combinedPlan.movingTeam)
  vars.movingTeam = combinedPlan.movingTeam
  vars.positionConstraints = []
  for (const plan of combinedPlan.plans) {
    contributePlanConstraints(plan, vars)
    contributeRelationalPositionConstraint(plan, vars)
  }
  // Derive inventory contributions from converged singular-actor species_sets.
  // Runs after all plan contributions so we operate on narrowed sets.
  contributeSingularActorsToInventory(vars)
  propagateInventoryRanges(vars.inventory)
  if (!isSatisfiable(vars)) { return null }
  return vars
}
