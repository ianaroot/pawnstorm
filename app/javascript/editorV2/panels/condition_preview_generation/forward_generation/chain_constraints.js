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
import { ALL_POSITIONS } from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { SINGULAR_ACTORS } from 'editorV2/panels/condition_preview_generation/shared/example_utils'

const ALL_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
const CAPTURABLE_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])

// Map actor name (as used in plans) to the variable key used in ctx.
export const ACTOR_TO_VAR_KEY = Object.freeze({
  moved_piece: 'movedPiece',
  captured_piece: 'capturedPiece',
  enemy_moved_piece: 'enemyMovedPiece',
  enemy_captured_piece: 'enemyCapturedPiece'
})

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

const INVENTORY_FILTERS = Object.freeze(['any', 'king', 'queen', 'rook', 'bishop', 'knight', 'pawn', 'major', 'minor'])

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

// Contribute a unary plan's constraints to the inventory tree. Only handles
// group actors (allied, enemy) with target=exact_number; cross-actor and
// prior_board_state targets defer to other variable categories.
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

  // Inventory tree narrowings (group actors via unary plans).
  contributeUnaryToInventory(plan, vars)
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
  // Singular-actor variables: empty species_set is unsat.
  for (const key of ['movedPiece', 'capturedPiece', 'enemyMovedPiece', 'enemyCapturedPiece']) {
    if (vars[key].species_set.size === 0) { return false }
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

export function buildChainConstraints(combinedPlan) {
  const vars = initSingularActors(combinedPlan.movingTeam)
  vars.inventory = initInventory(combinedPlan.movingTeam)
  for (const plan of combinedPlan.plans) {
    contributePlanConstraints(plan, vars)
  }
  propagateInventoryRanges(vars.inventory)
  if (!isSatisfiable(vars)) { return null }
  return vars
}
