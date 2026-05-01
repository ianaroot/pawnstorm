// Hint compiler — emits SEMANTIC hints from plans.
//
// Discipline: hints describe what must be true on the board, never what to do.
// Adding a new predicate type means adding a compile rule that emits semantic
// hints derived from the predicate's meaning. The resolver (separate module)
// is the only place that turns hints into placements.
//
// ===== Hint design rules (anti-patterns to avoid) =====
//
// Granular hints constrain the resulting board's properties (counts, totals,
// relationships, mobility) — never its specific piece-square assignments. The
// resolver retains all positional freedom. Bias creeps in only when:
//
//   1. Hints contain `square=` (procedural). Disallowed by contract — a hint
//      that names a square is a chain-shape template in disguise.
//   2. The resolver short-circuits to the first valid placement instead of
//      sampling. Mitigation: shuffled iteration + random species selection
//      (see buildMinimumSeed and Strategy A in hint_resolver).
//   3. Strategies are ordered such that one always wins. Mitigation:
//      round-robin or random strategy choice in the resolver, not always
//      "try C then A" — see hint_resolver for current strategy ordering.
//
// ===== Diversity test (guardrail when adding a hint type) =====
//
// When introducing a new hint type, generate 30 boards from the same chain
// and inspect piece-square distribution. If pieces cluster on the same square
// more than ~20% of the time, the hint is over-narrow — likely smuggling a
// position commitment, or pinning the resolver to one strategy. Loosen the
// hint or add resolver freedom before merging.

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import {
  materialValue, attackingPositions, defendingPositions,
  adjacentPositions, shieldingPositions, relativeRank, relativeToAbsolutePosition
} from 'gameplay/board_query_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'

export const HINT_TYPES = Object.freeze({
  // Structural fallback — at least one qualifying pair exists. Emitted for
  // relational plans without descriptors (and as a transitional fallback).
  RELATION_HOLDS: 'relation_holds',

  // Granular relational hints — descriptor-driven.
  RELATION_COUNT: 'relation_count',
  RELATION_AGGREGATE_VALUE: 'relation_aggregate_value',
  RELATION_INDIVIDUAL_VALUE: 'relation_individual_value',

  // Granular unary hints — actor-only constraints.
  ACTOR_COUNT: 'actor_count',
  ACTOR_AGGREGATE_VALUE: 'actor_aggregate_value',
  ACTOR_INDIVIDUAL_VALUE: 'actor_individual_value',

  // Mobility — generalized shape with mobilityOp + n. Today's emission still
  // covers only {≤, <, =} (the bounds the existing strategy handles). Strategies
  // for {>, ≥} arrive when a chain demands them; emission widens at that point.
  ACTOR_MOBILITY: 'actor_mobility',

  // Position constraint paired with one of the ACTOR_* hints above.
  ACTOR_AT_POSITION: 'actor_at_position'
})

// ===== Comparator helpers =====

export function compareValue(actual, op, target) {
  switch (op) {
    case 'equal_to':                 return actual === target
    case 'greater_than':             return actual > target
    case 'greater_than_or_equal_to': return actual >= target
    case 'less_than':                return actual < target
    case 'less_than_or_equal_to':    return actual <= target
    default:                         return false
  }
}

function mobilityUpperBoundFromComparator(comparator, total) {
  switch (comparator) {
    case 'equal_to':              return total
    case 'less_than':             return Math.max(0, total - 1)
    case 'less_than_or_equal_to': return total
    default:                      return null
  }
}

// ===== Filter / actor helpers =====

// Match a piece's species against (filter, filterMode). filterMode 'exclude'
// inverts the match — `filter='pawn', filterMode='exclude'` means "anything
// but a pawn." Defaults to 'include' when filterMode is null/undefined.
export function pieceMatchesFilter(species, filter, filterMode) {
  if (!filter || filter === 'any') { return true }
  let matches
  switch (filter) {
    case 'king':   matches = species === Board.KING; break
    case 'queen':  matches = species === Board.QUEEN; break
    case 'rook':   matches = species === Board.ROOK; break
    case 'bishop': matches = species === Board.BISHOP; break
    case 'knight': matches = species === Board.NIGHT; break
    case 'pawn':   matches = species === Board.PAWN; break
    case 'major':  matches = species === Board.QUEEN || species === Board.ROOK; break
    case 'minor':  matches = species === Board.BISHOP || species === Board.NIGHT; break
    default:       return true
  }
  return filterMode === 'exclude' ? !matches : matches
}

export function piecesIntoBoard(pieces, allowedToMove) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces), null, allowedToMove)
}

// Iterate piece entries matching team + filter. Yields { position, species }.
export function* matchingPieces(pieces, team, filter, filterMode) {
  for (const [position, piece] of pieces.entries()) {
    if (piece.charAt(0) !== team) { continue }
    const species = piece.slice(1)
    if (!pieceMatchesFilter(species, filter, filterMode)) { continue }
    yield { position, species }
  }
}

// Subjects related to a single target via the relation operator.
// Returns positions of pieces matching subject side that satisfy the relation
// with target at targetPosition.
export function subjectsRelatedToTarget({ board, operator, targetPosition, subjectTeam, subjectSpecies }) {
  switch (operator) {
    case 'attack':   return attackingPositions({ board, targetPosition, team: subjectTeam, species: subjectSpecies })
    case 'defend':   return defendingPositions({ board, targetPosition, team: subjectTeam, species: subjectSpecies })
    case 'adjacent': return adjacentPositions({ board, targetPosition, team: subjectTeam, species: subjectSpecies })
    case 'shield':   return shieldingPositions({ board, targetPosition, team: subjectTeam, species: subjectSpecies })
    default:         return []
  }
}

// Enumerate qualifying (subjectPos, targetPos) pairs for the relation. Each
// pair satisfies operator + side filters.
export function qualifyingPairs(pieces, board, hint) {
  const pairs = []
  for (const target of matchingPieces(pieces, hint.target.team, hint.target.filter, hint.target.filterMode)) {
    const subjectPositions = subjectsRelatedToTarget({
      board,
      operator: hint.operator,
      targetPosition: target.position,
      subjectTeam: hint.subject.team
    })
    for (const subjectPosition of subjectPositions) {
      const piece = pieces.get(subjectPosition)
      if (!piece) { continue }
      if (piece.charAt(0) !== hint.subject.team) { continue }
      const species = piece.slice(1)
      if (!pieceMatchesFilter(species, hint.subject.filter, hint.subject.filterMode)) { continue }
      pairs.push({ subjectPosition, targetPosition: target.position, subjectSpecies: species, targetSpecies: target.species })
    }
  }
  return pairs
}

// ===== Predicate functions (one per hint type) =====
// Each returns true iff the property the hint claims about the board holds.

function relationHoldsSatisfies(pieces, hint, context) {
  const board = piecesIntoBoard(pieces, context?.movingTeam ?? Board.WHITE)
  return qualifyingPairs(pieces, board, hint.shape).length > 0
}

function relationCountSatisfies(pieces, hint, context) {
  const board = piecesIntoBoard(pieces, context?.movingTeam ?? Board.WHITE)
  const pairs = qualifyingPairs(pieces, board, hint)
  // count of distinct pieces on the comparison side, not pair count
  const positions = new Set(
    pairs.map(p => hint.side === 'subject' ? p.subjectPosition : p.targetPosition)
  )
  return compareValue(positions.size, hint.countOp, hint.n)
}

function relationAggregateValueSatisfies(pieces, hint, context) {
  const board = piecesIntoBoard(pieces, context?.movingTeam ?? Board.WHITE)
  const pairs = qualifyingPairs(pieces, board, hint)
  // sum of distinct piece values on the comparison side
  const seenPositions = new Set()
  let total = 0
  for (const pair of pairs) {
    const position = hint.side === 'subject' ? pair.subjectPosition : pair.targetPosition
    if (seenPositions.has(position)) { continue }
    seenPositions.add(position)
    const species = hint.side === 'subject' ? pair.subjectSpecies : pair.targetSpecies
    total += materialValue(species)
  }
  return compareValue(total, hint.totalOp, hint.total)
}

function relationIndividualValueSatisfies(pieces, hint, context) {
  const board = piecesIntoBoard(pieces, context?.movingTeam ?? Board.WHITE)
  const pairs = qualifyingPairs(pieces, board, hint)
  if (pairs.length === 0) { return false }
  const seenPositions = new Set()
  for (const pair of pairs) {
    const position = hint.side === 'subject' ? pair.subjectPosition : pair.targetPosition
    if (seenPositions.has(position)) { continue }
    seenPositions.add(position)
    const species = hint.side === 'subject' ? pair.subjectSpecies : pair.targetSpecies
    if (!compareValue(materialValue(species), hint.valueOp, hint.value)) { return false }
  }
  return true
}

function actorCountSatisfies(pieces, hint /*, context */) {
  let count = 0
  for (const _ of matchingPieces(pieces, hint.team, hint.filter, hint.filterMode)) { count += 1 }
  return compareValue(count, hint.countOp, hint.n)
}

function actorAggregateValueSatisfies(pieces, hint /*, context */) {
  let total = 0
  for (const { species } of matchingPieces(pieces, hint.team, hint.filter, hint.filterMode)) {
    total += materialValue(species)
  }
  return compareValue(total, hint.totalOp, hint.total)
}

function actorIndividualValueSatisfies(pieces, hint /*, context */) {
  let any = false
  for (const { species } of matchingPieces(pieces, hint.team, hint.filter, hint.filterMode)) {
    any = true
    if (!compareValue(materialValue(species), hint.valueOp, hint.value)) { return false }
  }
  return any
}

function actorMobilitySatisfies(pieces, hint, context) {
  const board = piecesIntoBoard(pieces, context?.movingTeam ?? Board.WHITE)
  let total = 0
  for (const { position } of matchingPieces(pieces, hint.team, hint.filter, hint.filterMode)) {
    const moves = Rules.availableMovesFrom({ board, startPosition: position })
    total += moves.length
  }
  return compareValue(total, hint.mobilityOp, hint.n)
}

function actorAtPositionSatisfies(pieces, hint, context) {
  const movingTeam = context?.movingTeam ?? Board.WHITE
  let any = false
  for (const { position } of matchingPieces(pieces, hint.team, hint.filter, hint.filterMode)) {
    any = true
    if (!positionMatchesAxis(position, hint, movingTeam)) { return false }
  }
  return any
}

export function positionMatchesAxis(position, hint, movingTeam) {
  switch (hint.axis) {
    case 'rank': {
      const rank = relativeRank(position, movingTeam)
      return compareValue(rank, hint.positionComparator, hint.positionTarget)
    }
    case 'file': {
      const file = Board.fileIndex(position) + 1
      return compareValue(file, hint.positionComparator, hint.positionTarget)
    }
    case 'square': {
      const absoluteTarget = relativeToAbsolutePosition(hint.positionTarget, movingTeam)
      return position === absoluteTarget
    }
    default: return false
  }
}

const PREDICATES = Object.freeze({
  [HINT_TYPES.RELATION_HOLDS]:             relationHoldsSatisfies,
  [HINT_TYPES.RELATION_COUNT]:             relationCountSatisfies,
  [HINT_TYPES.RELATION_AGGREGATE_VALUE]:   relationAggregateValueSatisfies,
  [HINT_TYPES.RELATION_INDIVIDUAL_VALUE]:  relationIndividualValueSatisfies,
  [HINT_TYPES.ACTOR_COUNT]:                actorCountSatisfies,
  [HINT_TYPES.ACTOR_AGGREGATE_VALUE]:      actorAggregateValueSatisfies,
  [HINT_TYPES.ACTOR_INDIVIDUAL_VALUE]:     actorIndividualValueSatisfies,
  [HINT_TYPES.ACTOR_MOBILITY]:             actorMobilitySatisfies,
  [HINT_TYPES.ACTOR_AT_POSITION]:          actorAtPositionSatisfies
})

export function satisfies(hint, pieces, context) {
  const predicate = PREDICATES[hint.type]
  if (!predicate) { return true }
  return predicate(pieces, hint, context)
}

// ===== Emission =====

function relationalSideShape(plan, side) {
  if (side === 'subject') {
    return {
      actor: plan.subject, team: plan.subjectTeam,
      filter: plan.subjectFilter, filterMode: plan.subjectFilterMode,
      speciesPool: plan.subjectSpeciesPool
    }
  }
  return {
    actor: plan.target, team: plan.targetTeam,
    filter: plan.targetFilter, filterMode: plan.targetFilterMode,
    speciesPool: plan.targetSpeciesPool
  }
}

function frameForDescriptor(descriptor) {
  return descriptor.source === 'prior_board_state' ? 'prior' : 'current'
}

function compileRelationalDescriptor(plan, descriptor) {
  const subject = relationalSideShape(plan, 'subject')
  const target = relationalSideShape(plan, 'target')
  const baseShape = {
    operator: plan.operator,
    subject, target,
    side: descriptor.side,
    frame: frameForDescriptor(descriptor)
  }
  const total = Number(descriptor.resolvedTotal ?? descriptor.total ?? 0)
  switch (descriptor.metric) {
    case 'count':
      return { type: HINT_TYPES.RELATION_COUNT, ...baseShape, countOp: descriptor.comparator, n: total }
    case 'aggregate_value':
      return { type: HINT_TYPES.RELATION_AGGREGATE_VALUE, ...baseShape, totalOp: descriptor.comparator, total }
    case 'individual_value':
      return { type: HINT_TYPES.RELATION_INDIVIDUAL_VALUE, ...baseShape, valueOp: descriptor.comparator, value: total }
    default:
      return null
  }
}

function compileRelational(plan) {
  const descriptors = plan.comparisonDescriptors ?? []
  if (descriptors.length === 0) {
    // No descriptor — structural relation only. Carry plan shape so the
    // predicate can verify, plus the legacy `plan` field for backwards-compat
    // with current resolver consumers (which expect `hint.plan`).
    return [{
      type: HINT_TYPES.RELATION_HOLDS,
      operator: plan.operator,
      subject: relationalSideShape(plan, 'subject'),
      target: relationalSideShape(plan, 'target'),
      shape: {
        operator: plan.operator,
        subject: relationalSideShape(plan, 'subject'),
        target: relationalSideShape(plan, 'target')
      },
      plan
    }]
  }
  const hints = []
  for (const descriptor of descriptors) {
    const hint = compileRelationalDescriptor(plan, descriptor)
    if (hint) { hints.push(hint) }
  }
  // If no descriptor produced a recognized hint, fall back to RELATION_HOLDS.
  if (hints.length === 0) {
    hints.push({
      type: HINT_TYPES.RELATION_HOLDS,
      operator: plan.operator,
      subject: relationalSideShape(plan, 'subject'),
      target: relationalSideShape(plan, 'target'),
      shape: {
        operator: plan.operator,
        subject: relationalSideShape(plan, 'subject'),
        target: relationalSideShape(plan, 'target')
      },
      plan
    })
  }
  return hints
}

function compileUnary(plan) {
  const hints = []
  const team = plan.subjectTeam
  const filter = plan.subjectFilter
  const filterMode = plan.subjectFilterMode
  const speciesPool = plan.subjectSpeciesPool
  const actor = plan.subject
  const target = plan.target
  const total = Number(plan.targetTotal ?? 0)
  const frame = target === 'prior_board_state' ? 'prior' : 'current'

  if (plan.operator === 'mobility' && target === 'exact_number') {
    // Today only emit for comparators the existing strategy handles. The shape
    // carries mobilityOp/n so future strategies for >/≥ can plug in without
    // changing the emission contract.
    const upperBound = mobilityUpperBoundFromComparator(plan.comparator, total)
    if (upperBound !== null) {
      hints.push({
        type: HINT_TYPES.ACTOR_MOBILITY,
        actor, filter, filterMode, team, speciesPool,
        mobilityOp: plan.comparator,
        n: total
      })
    }
    return hints
  }

  if (plan.operator === 'count' && target === 'exact_number') {
    hints.push({
      type: HINT_TYPES.ACTOR_COUNT,
      actor, filter, filterMode, team, speciesPool,
      countOp: plan.comparator, n: total, frame
    })
    return hints
  }

  if (plan.operator === 'value' && target === 'exact_number') {
    // Unary `value` is the legacy aggregate name.
    hints.push({
      type: HINT_TYPES.ACTOR_AGGREGATE_VALUE,
      actor, filter, filterMode, team, speciesPool,
      totalOp: plan.comparator, total, frame
    })
    return hints
  }

  return hints
}

function compilePosition(plan) {
  const hints = []
  const actor = plan.subject
  const team = plan.subjectTeam
  const filter = plan.subjectFilter
  const filterMode = plan.subjectFilterMode
  const speciesPool = plan.subjectSpeciesPool

  hints.push({
    type: HINT_TYPES.ACTOR_AT_POSITION,
    actor, team, filter, filterMode, speciesPool,
    axis: plan.positionAxis,
    positionComparator: plan.positionComparator,
    positionTarget: plan.positionTarget
  })

  const targetTotal = Number(plan.targetTotal ?? 0)
  if (plan.operator === 'count') {
    hints.push({
      type: HINT_TYPES.ACTOR_COUNT,
      actor, team, filter, filterMode, speciesPool,
      countOp: plan.comparator, n: targetTotal, frame: 'current'
    })
  } else if (plan.operator === 'value') {
    hints.push({
      type: HINT_TYPES.ACTOR_AGGREGATE_VALUE,
      actor, team, filter, filterMode, speciesPool,
      totalOp: plan.comparator, total: targetTotal, frame: 'current'
    })
  }

  return hints
}

export function compileHints(combinedPlan) {
  const hints = []
  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      hints.push(...compileRelational(plan))
    } else if (plan.kind === 'unary') {
      hints.push(...compileUnary(plan))
    } else if (plan.kind === 'position') {
      hints.push(...compilePosition(plan))
    }
  }
  return hints
}

// Hint types whose presence does NOT cause forward generation to fire today.
// Either structural-only (RELATION_HOLDS) or strategy-not-yet-implemented (the
// granular ACTOR_*/RELATION_* set arrived in 8c step 1; strategies arrive in
// step 2). As each strategy lands, remove its type from this set.
const NON_ACTIONABLE = new Set([
  HINT_TYPES.RELATION_HOLDS
  // All other granular types now actionable (milestones 2-4).
])

export function chainHasActionableHints(combinedPlan) {
  return compileHints(combinedPlan).some(h => !NON_ACTIONABLE.has(h.type))
}
