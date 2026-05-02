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
import { SINGULAR_ACTORS, speciesMatchesFilter } from 'editorV2/panels/condition_preview_generation/shared/example_utils'

export const HINT_TYPES = Object.freeze({
  // Structural fallback — at least one qualifying pair exists. Emitted for
  // relational plans without descriptors (and as a transitional fallback).
  RELATION_HOLDS: 'relation_holds',

  // Granular relational hints — descriptor-driven.
  RELATION_COUNT: 'relation_count',
  RELATION_AGGREGATE_VALUE: 'relation_aggregate_value',
  RELATION_INDIVIDUAL_VALUE: 'relation_individual_value',

  // PBS-direction relational hints. Composite: each carries paired (nPrior,
  // nCurrent) sampled to satisfy the descriptor's direction. Predicate checks
  // both frames; strategy engineers both via a single coordinated placement.
  RELATION_PBS_COUNT: 'relation_pbs_count',
  RELATION_PBS_AGGREGATE_VALUE: 'relation_pbs_aggregate_value',

  // PBS-direction mobility for a single actor. Composite (nPrior, nCurrent).
  ACTOR_PBS_MOBILITY: 'actor_pbs_mobility',

  // Same-piece relation. Today only emitted for {enemy_moved_piece,
  // captured_piece}: the move captures the piece declared as the prior turn's
  // enemy_moved_piece via recentMoveContext.
  RELATION_SAME_PIECE: 'relation_same_piece',

  // Unary pair hints. Composite hint carrying both actors and the comparator.
  // Emitted when a unary plan compares one move-event actor's value/count
  // against another's (e.g. captured_piece value >= moved_piece). Strategies
  // engineer a move scenario where both actors exist with species satisfying
  // the comparator.
  UNARY_VALUE_PAIR: 'unary_value_pair',
  UNARY_COUNT_PAIR: 'unary_count_pair',

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
// (speciesMatchesFilter lives in shared/example_utils.js — imported below.)

export function piecesIntoBoard(pieces, allowedToMove, recentMoveContext = null) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces), recentMoveContext, allowedToMove)
}

// Iterate piece entries matching team + filter. Yields { position, species }.
export function* matchingPieces(pieces, team, filter, filterMode) {
  for (const [position, piece] of pieces.entries()) {
    if (piece.charAt(0) !== team) { continue }
    const species = piece.slice(1)
    if (!speciesMatchesFilter(species, filter, filterMode)) { continue }
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
      if (!speciesMatchesFilter(species, hint.subject.filter, hint.subject.filterMode)) { continue }
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

// PBS-direction predicates check both prior and current frames. The single
// composite hint carries (nPrior, nCurrent) so the predicate can verify both
// boards against their respective targets.
function relationPbsCountSatisfies(pieces, hint, context) {
  const priorPieces = context?.priorPieces
  if (!priorPieces) { return false }
  const checkHint = { ...hint, type: HINT_TYPES.RELATION_COUNT, countOp: 'equal_to' }
  const priorOk = relationCountSatisfies(priorPieces, { ...checkHint, n: hint.nPrior }, context)
  const currentOk = relationCountSatisfies(pieces, { ...checkHint, n: hint.nCurrent }, context)
  return priorOk && currentOk
}

function relationSamePieceSatisfies(pieces, hint, context) {
  // Weak verification: the strategy must have set up a recentMoveContext
  // pointing at an enemy piece on the prior board. Full move-object
  // validation runs via the post-evaluator. Uses recentMoveContext.movedPieceEndPosition
  // as the canonical "captured-piece prior square" — same value for standard
  // captures and en passant (the existing en passant preset already sets
  // movedPieceEndPosition = capturedSquare).
  const rmc = context?.recentMoveContext
  if (!rmc || rmc.movedPieceEndPosition === undefined) { return false }
  const priorPieces = context?.priorPieces
  if (!priorPieces) { return false }
  const piece = priorPieces.get(rmc.movedPieceEndPosition)
  if (!piece) { return false }
  const movingTeam = context?.movingTeam ?? Board.WHITE
  return piece.charAt(0) !== movingTeam
}

// Unary value pair predicate. Weak verification: confirm the strategy set up
// move-event actors whose species satisfy the comparator. Both actors are
// singular move-event actors (moved_piece, captured_piece, enemy_moved_piece,
// enemy_captured_piece). The post-evaluator runs the full chain check; this
// predicate just confirms structural setup.
function unaryValuePairSatisfies(pieces, hint, context) {
  const movingTeam = context?.movingTeam ?? Board.WHITE
  const subjectSpecies = singularActorSpecies(hint.subjectActor, pieces, context, movingTeam)
  const targetSpecies = singularActorSpecies(hint.targetActor, pieces, context, movingTeam)
  if (subjectSpecies === null || targetSpecies === null) { return false }
  return compareValue(materialValue(subjectSpecies), hint.valueOp, materialValue(targetSpecies))
}

function unaryCountPairSatisfies(pieces, hint, context) {
  const movingTeam = context?.movingTeam ?? Board.WHITE
  const subjectCount = singularActorPresence(hint.subjectActor, pieces, context, movingTeam) ? 1 : 0
  const targetCount = singularActorPresence(hint.targetActor, pieces, context, movingTeam) ? 1 : 0
  return compareValue(subjectCount, hint.countOp, targetCount)
}

// Resolve the species of a singular move-event actor from board state +
// recentMoveContext. Returns null if the actor isn't represented.
//   moved_piece           — derived from prior→current diff (the resolver's
//                           reconstruction), so we can't read it here pre-diff.
//                           Strategies stash the chosen mover species in ctx.
//   captured_piece        — same; strategies stash via ctx.
//   enemy_moved_piece     — recentMoveContext.movedPieceSpeciesAfterMove
//   enemy_captured_piece  — recentMoveContext.capturedPieceSpecies
function singularActorSpecies(actor, pieces, context, movingTeam) {
  const rmc = context?.recentMoveContext
  switch (actor) {
    case 'moved_piece':         return context?.moverSpecies ?? null
    case 'captured_piece':      return context?.capturedSpecies ?? null
    case 'enemy_moved_piece':   return rmc?.movedPieceSpeciesAfterMove ?? null
    case 'enemy_captured_piece': return rmc?.capturedPieceSpecies ?? null
    default:                    return null
  }
}

function singularActorPresence(actor, pieces, context, movingTeam) {
  return singularActorSpecies(actor, pieces, context, movingTeam) !== null
}

function actorPbsMobilitySatisfies(pieces, hint, context) {
  const priorPieces = context?.priorPieces
  if (!priorPieces) { return false }
  const movingTeam = context?.movingTeam ?? Board.WHITE

  function totalMobility(map) {
    const board = piecesIntoBoard(map, movingTeam)
    let total = 0
    for (const { position } of matchingPieces(map, hint.team, hint.filter, hint.filterMode)) {
      const moves = Rules.availableMovesFrom({ board, startPosition: position })
      total += moves.length
    }
    return total
  }

  return totalMobility(priorPieces) === hint.nPrior && totalMobility(pieces) === hint.nCurrent
}

function relationPbsAggregateValueSatisfies(pieces, hint, context) {
  const priorPieces = context?.priorPieces
  if (!priorPieces) { return false }
  const checkHint = { ...hint, type: HINT_TYPES.RELATION_AGGREGATE_VALUE, totalOp: 'equal_to' }
  const priorOk = relationAggregateValueSatisfies(priorPieces, { ...checkHint, total: hint.vPrior }, context)
  const currentOk = relationAggregateValueSatisfies(pieces, { ...checkHint, total: hint.vCurrent }, context)
  return priorOk && currentOk
}

const PREDICATES = Object.freeze({
  [HINT_TYPES.RELATION_HOLDS]:                  relationHoldsSatisfies,
  [HINT_TYPES.RELATION_COUNT]:                  relationCountSatisfies,
  [HINT_TYPES.RELATION_AGGREGATE_VALUE]:        relationAggregateValueSatisfies,
  [HINT_TYPES.RELATION_INDIVIDUAL_VALUE]:       relationIndividualValueSatisfies,
  [HINT_TYPES.RELATION_PBS_COUNT]:              relationPbsCountSatisfies,
  [HINT_TYPES.RELATION_PBS_AGGREGATE_VALUE]:    relationPbsAggregateValueSatisfies,
  [HINT_TYPES.ACTOR_PBS_MOBILITY]:              actorPbsMobilitySatisfies,
  [HINT_TYPES.RELATION_SAME_PIECE]:             relationSamePieceSatisfies,
  [HINT_TYPES.UNARY_VALUE_PAIR]:                unaryValuePairSatisfies,
  [HINT_TYPES.UNARY_COUNT_PAIR]:                unaryCountPairSatisfies,
  [HINT_TYPES.ACTOR_COUNT]:                     actorCountSatisfies,
  [HINT_TYPES.ACTOR_AGGREGATE_VALUE]:           actorAggregateValueSatisfies,
  [HINT_TYPES.ACTOR_INDIVIDUAL_VALUE]:          actorIndividualValueSatisfies,
  [HINT_TYPES.ACTOR_MOBILITY]:                  actorMobilitySatisfies,
  [HINT_TYPES.ACTOR_AT_POSITION]:               actorAtPositionSatisfies
})

export function satisfies(hint, pieces, context) {
  const predicate = PREDICATES[hint.type]
  if (!predicate) { return true }
  // Route to the correct frame's pieces map. Default to current; prior-frame
  // hints (PBS direction) check against context.priorPieces.
  const targetMap = hint.frame === 'prior' && context?.priorPieces
    ? context.priorPieces
    : pieces
  return predicate(targetMap, hint, context)
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

// PBS-direction descriptors (source = prior_board_state) emit PAIRED hints —
// one prior-frame, one current-frame — with sampled (n_prior, n_current) values
// consistent with the descriptor's direction. The strategies then engineer each
// frame's pieces map separately and the move falls out of the diff.
function pbsDirectionFromComparator(comparator) {
  switch (comparator) {
    case 'greater_than':
    case 'greater_than_or_equal_to': return '+'
    case 'less_than':
    case 'less_than_or_equal_to':    return '-'
    case 'equal_to':                 return '='
    default:                         return null
  }
}

function samplePbsCountPair(direction, random) {
  const r = random ?? (() => 0.5)
  switch (direction) {
    case '+': {
      const nPrior = Math.floor(r() * 3)        // 0..2
      const delta = 1 + Math.floor(r() * 2)      // 1..2
      return [nPrior, nPrior + delta]
    }
    case '-': {
      const nPrior = 1 + Math.floor(r() * 3)    // 1..3
      const delta = 1 + Math.floor(r() * nPrior) // 1..nPrior
      return [nPrior, nPrior - delta]
    }
    case '=': {
      const n = 1 + Math.floor(r() * 3)         // 1..3
      return [n, n]
    }
    default: return [null, null]
  }
}

function samplePbsMobilityPair(direction, random) {
  const r = random ?? (() => 0.5)
  switch (direction) {
    case '+': {
      const nPrior = 1 + Math.floor(r() * 4)        // 1..4
      const delta = 1 + Math.floor(r() * 3)          // 1..3
      return [nPrior, nPrior + delta]
    }
    case '-': {
      const nPrior = 2 + Math.floor(r() * 5)        // 2..6
      const delta = 1 + Math.floor(r() * (nPrior))   // 1..nPrior
      return [nPrior, Math.max(0, nPrior - delta)]
    }
    case '=': {
      const n = 1 + Math.floor(r() * 5)             // 1..5
      return [n, n]
    }
    default: return [null, null]
  }
}

function samplePbsValuePair(direction, random) {
  const r = random ?? (() => 0.5)
  switch (direction) {
    case '+': {
      const vPrior = Math.floor(r() * 4)        // 0..3
      const delta = 1 + Math.floor(r() * 3)      // 1..3
      return [vPrior, vPrior + delta]
    }
    case '-': {
      const vPrior = 1 + Math.floor(r() * 5)    // 1..5
      const delta = 1 + Math.floor(r() * vPrior) // 1..vPrior
      return [vPrior, vPrior - delta]
    }
    case '=': {
      const v = 1 + Math.floor(r() * 5)         // 1..5
      return [v, v]
    }
    default: return [null, null]
  }
}

function compileRelationalPbsDescriptor(plan, descriptor, random) {
  const direction = pbsDirectionFromComparator(descriptor.comparator)
  if (!direction) { return [] }

  const subject = relationalSideShape(plan, 'subject')
  const target = relationalSideShape(plan, 'target')
  const baseShape = {
    operator: plan.operator,
    subject, target,
    side: descriptor.side,
    direction
  }

  switch (descriptor.metric) {
    case 'count': {
      const [nPrior, nCurrent] = samplePbsCountPair(direction, random)
      if (nPrior === null) { return [] }
      return [{ type: HINT_TYPES.RELATION_PBS_COUNT, ...baseShape, nPrior, nCurrent }]
    }
    case 'aggregate_value': {
      const [vPrior, vCurrent] = samplePbsValuePair(direction, random)
      if (vPrior === null) { return [] }
      return [{ type: HINT_TYPES.RELATION_PBS_AGGREGATE_VALUE, ...baseShape, vPrior, vCurrent }]
    }
    case 'individual_value':
      // Individual-value PBS-direction is rarer. Defer to a later milestone;
      // emit nothing for now (post-evaluator handles it).
      return []
    default:
      return []
  }
}

function compileRelationalDescriptor(plan, descriptor, random) {
  if (descriptor.source === 'prior_board_state') {
    return compileRelationalPbsDescriptor(plan, descriptor, random)
  }

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
      return [{ type: HINT_TYPES.RELATION_COUNT, ...baseShape, countOp: descriptor.comparator, n: total }]
    case 'aggregate_value':
      return [{ type: HINT_TYPES.RELATION_AGGREGATE_VALUE, ...baseShape, totalOp: descriptor.comparator, total }]
    case 'individual_value':
      return [{ type: HINT_TYPES.RELATION_INDIVIDUAL_VALUE, ...baseShape, valueOp: descriptor.comparator, value: total }]
    default:
      return []
  }
}

function compileRelational(plan, random) {
  // Same-piece operator: today only the {enemy_moved_piece, captured_piece}
  // pair is supported. Emit before the descriptor pass since same_piece
  // doesn't carry a comparison descriptor.
  if (plan.operator === 'same_piece') {
    const actors = new Set([plan.subject, plan.target])
    if (actors.has('enemy_moved_piece') && actors.has('captured_piece')) {
      return [{
        type: HINT_TYPES.RELATION_SAME_PIECE,
        operator: 'same_piece',
        subject: relationalSideShape(plan, 'subject'),
        target: relationalSideShape(plan, 'target')
      }]
    }
    // Other same_piece pairs aren't supported in forward gen — fall through
    // to RELATION_HOLDS so the chain isn't gated off entirely.
  }

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
    const emitted = compileRelationalDescriptor(plan, descriptor, random)
    for (const hint of emitted) { hints.push(hint) }
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

function compileUnary(plan, random) {
  const hints = []
  const team = plan.subjectTeam
  const filter = plan.subjectFilter
  const filterMode = plan.subjectFilterMode
  const speciesPool = plan.subjectSpeciesPool
  const actor = plan.subject
  const target = plan.target
  const total = Number(plan.targetTotal ?? 0)
  const frame = target === 'prior_board_state' ? 'prior' : 'current'

  // Unary pair: target is another move-event actor. Emit a composite hint
  // carrying both actors. Strategy engineers a move scenario where both
  // singular actors exist with species satisfying the comparator.
  if (SINGULAR_ACTORS.has(actor) && SINGULAR_ACTORS.has(target)) {
    if (plan.operator === 'value') {
      hints.push({
        type: HINT_TYPES.UNARY_VALUE_PAIR,
        subjectActor: actor, subjectTeam: team,
        subjectFilter: filter, subjectFilterMode: filterMode, subjectSpeciesPool: speciesPool,
        targetActor: target, targetTeam: plan.targetTeam,
        targetFilter: plan.targetFilter, targetFilterMode: plan.targetFilterMode,
        targetSpeciesPool: plan.targetSpeciesPool,
        valueOp: plan.comparator
      })
      return hints
    }
    if (plan.operator === 'count') {
      hints.push({
        type: HINT_TYPES.UNARY_COUNT_PAIR,
        subjectActor: actor, subjectTeam: team,
        subjectFilter: filter, subjectFilterMode: filterMode, subjectSpeciesPool: speciesPool,
        targetActor: target, targetTeam: plan.targetTeam,
        targetFilter: plan.targetFilter, targetFilterMode: plan.targetFilterMode,
        targetSpeciesPool: plan.targetSpeciesPool,
        countOp: plan.comparator
      })
      return hints
    }
    // mobility unary pair not yet supported; fall through.
  }

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

  if (plan.operator === 'mobility' && target === 'prior_board_state') {
    const direction = pbsDirectionFromComparator(plan.comparator)
    if (!direction) { return hints }
    const [nPrior, nCurrent] = samplePbsMobilityPair(direction, random)
    if (nPrior === null) { return hints }
    hints.push({
      type: HINT_TYPES.ACTOR_PBS_MOBILITY,
      actor, filter, filterMode, team, speciesPool,
      direction, nPrior, nCurrent
    })
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

export function compileHints(combinedPlan, random) {
  const hints = []
  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      hints.push(...compileRelational(plan, random))
    } else if (plan.kind === 'unary') {
      hints.push(...compileUnary(plan, random))
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
const STRUCTURAL_HINTS = new Set([
  HINT_TYPES.RELATION_HOLDS
  // All other granular types now actionable (milestones 2-4).
])

export function chainHasNonStructuralHints(combinedPlan) {
  return compileHints(combinedPlan).some(h => !STRUCTURAL_HINTS.has(h.type))
}
