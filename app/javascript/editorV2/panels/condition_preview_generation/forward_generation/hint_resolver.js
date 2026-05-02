// Hint resolver — turns semantic hints into board augmentations.
//
// Each hint type has one application function. Application is generic: it
// satisfies the hint's semantic property by placing pieces, not by following
// chain-specific patterns. Adding a new hint type means adding one application
// function; existing application functions don't change.
//
// ===== Diversity discipline =====
//
// Hints constrain board properties; the resolver retains positional freedom.
// To preserve diversity across N runs of the same chain:
//
//   - Iterate candidate squares and species via shuffled() / pickRandom(),
//     never deterministic for-each. (See buildMinimumSeed, applyDirectBlock.)
//   - When a hint has multiple satisfying strategies, do NOT always try them in
//     a fixed order — that biases output toward whichever strategy fires first.
//     Prefer round-robin or random strategy choice. The current
//     applyMobilityAtMost still tries C-then-A; rotate it before adding more
//     strategies, or new hint types will inherit the bias.
//   - Hints must not name squares. If you find yourself reading hint.square,
//     stop — that is a chain-shape template, not a semantic hint.

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { controlledSquares, materialValue } from 'gameplay/board_query_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, clonePiecesMap,
  ALL_POSITIONS, shuffled, pickRandom
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { candidateSpecies, legalPriorTurnState, speciesMatchesFilter } from 'editorV2/panels/condition_preview_generation/shared/example_utils'
import { usesZeroRelationPath } from 'editorV2/panels/condition_preview_generation/plans/comparison_requirements'
import {
  adjacentNeighborPositions, originCandidatesForSpecies
} from 'editorV2/panels/condition_preview_generation/shared/geometry_utils'
import { placePiece } from '../shared/piece_placement'
import { placeKingsIfAbsent } from '../shared/board_utils'
import { compileHints, HINT_TYPES, satisfies } from './hint_compiler'
import { buildChainConstraints, narrowPbsHintsByInventory, ACTOR_TO_VAR_KEY } from './chain_constraints'
import { relationCountStrategy } from './strategies/relation_count'
import { actorCountStrategy } from './strategies/actor_count'
import { actorAtPositionStrategy } from './strategies/actor_at_position'
import { actorAggregateValueStrategy } from './strategies/actor_aggregate_value'
import { relationAggregateValueStrategy } from './strategies/relation_aggregate_value'
import { relationIndividualValueStrategy } from './strategies/relation_individual_value'
import { actorIndividualValueStrategy } from './strategies/actor_individual_value'
import { relationPbsCountStrategy } from './strategies/relation_pbs_count'
import { relationPbsCountBystanderStrategy } from './strategies/relation_pbs_count_bystander'
import { relationPbsAggregateValueStrategy } from './strategies/relation_pbs_aggregate_value'
import { actorPbsMobilityStrategy } from './strategies/actor_pbs_mobility'
import { relationSamePieceStrategy } from './strategies/relation_same_piece'
import { unaryValuePairStrategy } from './strategies/unary_value_pair'
import { unaryCountPairStrategy } from './strategies/unary_count_pair'




function piecesIntoBoard(pieces, allowedToMove, recentMoveContext = null) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces), recentMoveContext, allowedToMove)
}

function actorTeamOnBoard(actor, movingTeam) {
  if (actor === 'allied' || actor === 'moved_piece' || actor === 'captured_piece') {
    return movingTeam
  }
  return Board.opposingTeam(movingTeam)
}

// Apply ACTOR_MOBILITY hint by reducing mobility (today's strategies cover
// {≤, <, =} comparators via shared "≤ N" mechanics). Strategies:
//   - C (check + block): place an allied attacker giving check on a matching
//     king. King's legal moves are then restricted to escape; non-king matching
//     pieces are restricted to defending moves. Strategy A runs on top to
//     handle remaining mobility. Most useful for mobility=0 with king in scope.
//   - A (direct block): place blockers/attackers at excess move-targets.
//
// Both strategies satisfy "≤ N." Resolver tries C first (when applicable),
// falls back to A. For >/≥ comparators, no strategy is implemented yet —
// emission for those is gated off in the compiler.
function applyMobilityReduce(pieces, hint, ctx) {
  const cResult = tryCheckPlusBlock(pieces, hint, ctx)
  if (cResult !== null) { return cResult }
  return applyDirectBlock(pieces, hint, ctx)
}

// Translate a generalized ACTOR_MOBILITY hint into a `maxMobility` ceiling for
// the existing reduce strategies. Returns null if the comparator isn't yet
// supported (>, ≥) or maps to an out-of-range bound. When inventory carries a
// stricter mobility_range.max for the matching (team, frame, filter), the
// ceiling tightens accordingly so we respect sibling constraints.
function mobilityCeilingFor(hint, ctx) {
  let ceiling
  switch (hint.mobilityOp) {
    case 'less_than_or_equal_to':
    case 'equal_to':              ceiling = hint.n; break
    case 'less_than':             ceiling = Math.max(0, hint.n - 1); break
    default:                      return null
  }
  const cell = (hint.actor === 'allied' || hint.actor === 'enemy')
    ? ctx?.inventory?.[hint.team]?.[hint.frame ?? 'current']?.[hint.filter ?? 'any']
    : null
  const inventoryMax = cell?.mobility_range.max ?? Infinity
  return Math.min(ceiling, inventoryMax)
}

function applyDirectBlock(pieces, hint, ctx) {
  const { movingTeam, random } = ctx
  const ceiling = mobilityCeilingFor(hint, ctx)
  if (ceiling === null) { return null }
  const matching = []
  for (const [position, piece] of pieces.entries()) {
    if (piece.charAt(0) !== hint.team) { continue }
    if (!speciesMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
    matching.push({ position, piece })
  }

  let result = pieces
  for (const { position, piece } of matching) {
    result = restrictMobilityForPiece(result, position, piece, ceiling, movingTeam, random)
    if (result === null) { return null }
  }
  return result
}

// Strategy C generalized: for ANY actor (not just king), the hint can be satisfied
// by putting the matching team's king in check + placing matching pieces where
// they can't defend (no legal capture-attacker or block-ray move). When in check,
// a piece's only legal moves are defending moves; if there are none (or ≤ N), the
// actor's mobility ≤ N. Works for king (escape blocked) and non-king (pin/no-defend).
function tryCheckPlusBlock(pieces, hint, ctx) {
  const { movingTeam, random } = ctx
  const ceiling = mobilityCeilingFor(hint, ctx)
  if (ceiling === null) { return null }
  const kingCode = pieceCode(hint.team, Board.KING)
  let kingPos = null
  for (const [pos, piece] of pieces.entries()) {
    if (piece === kingCode) { kingPos = pos; break }
  }
  if (kingPos === null) { return null }

  const attackerPool = [Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT, Board.PAWN]
  for (const attackerSpecies of shuffled(attackerPool, random)) {
    for (const attackerPos of shuffled([...ALL_POSITIONS], random)) {
      if (attackerPos === kingPos) { continue }
      if (pieces.has(attackerPos)) { continue }
      const withAttacker = placePiece(pieces, attackerPos, pieceCode(movingTeam, attackerSpecies))
      if (!withAttacker) { continue }
      let attacks
      try {
        const board = piecesIntoBoard(withAttacker, hint.team)
        attacks = controlledSquares({ board, attackerPosition: attackerPos })
      } catch { continue }
      if (!attacks.includes(kingPos)) { continue }

      // After placing the check-attacker, see if total matching mobility is already ≤ ceiling.
      let totalMobility = 0
      let valid = true
      try {
        const board = piecesIntoBoard(withAttacker, hint.team)
        for (const [pos, piece] of withAttacker.entries()) {
          if (piece.charAt(0) !== hint.team) { continue }
          if (!speciesMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
          const moves = Rules.availableMovesFrom({ board, startPosition: pos })
          totalMobility += moves.length
          if (totalMobility > ceiling) { break }
        }
      } catch { valid = false }
      if (valid && totalMobility <= ceiling) { return withAttacker }

      // Fall back to topping up with direct blocking for any residual.
      let blocked = null
      try { blocked = applyDirectBlock(withAttacker, hint, ctx) } catch { blocked = null }
      if (blocked !== null) { return blocked }
    }
  }
  return null
}

function restrictMobilityForPiece(pieces, position, piece, maxMobility, movingTeam, random) {
  const targetTeam = piece.charAt(0)
  const board = piecesIntoBoard(pieces, targetTeam)
  const moves = Rules.availableMovesFrom({ board, startPosition: position })
  if (moves.length <= maxMobility) { return pieces }

  const opponentTeam = Board.opposingTeam(targetTeam)
  const blockerPool = candidateSpecies('any', null).filter(s => s !== Board.KING)

  let result = pieces
  let blockedCount = 0
  const movesToBlock = moves.length - maxMobility

  for (const move of shuffled([...moves], random)) {
    if (blockedCount >= movesToBlock) { break }
    const dest = move.endPosition
    if (result.has(dest)) { continue }

    // Try several species/teams; first that succeeds and actually reduces mobility wins.
    const trials = []
    for (const species of shuffled(blockerPool, random)) {
      for (const team of shuffled([targetTeam, opponentTeam], random)) {
        trials.push({ species, team })
      }
    }
    for (const trial of trials) {
      const next = placePiece(result, dest, pieceCode(trial.team, trial.species))
      if (!next) { continue }
      // Verify mobility actually went down.
      const verifyBoard = piecesIntoBoard(next, targetTeam)
      const newMoves = Rules.availableMovesFrom({ board: verifyBoard, startPosition: position })
      if (newMoves.length < moves.length - blockedCount) {
        result = next
        blockedCount += 1
        break
      }
    }
  }

  // Final check.
  const finalBoard = piecesIntoBoard(result, targetTeam)
  const finalMoves = Rules.availableMovesFrom({ board: finalBoard, startPosition: position })
  if (finalMoves.length > maxMobility) { return null }
  return result
}

// Strategy registry. Each entry maps a hint type to an ordered list of
// strategy functions. Each strategy takes (pieces, hint, ctx) and returns:
//   - a new pieces map (augmented to satisfy the hint), or
//   - null if it cannot apply (resolver tries the next strategy).
//
// Empty array = the hint is satisfied implicitly (e.g., by buildMinimumSeed).
// Missing entry = the hint type is not yet supported; resolver leaves pieces
// unchanged. The verify pass also skips unsupported types — we don't claim
// to satisfy what we have no strategy for, and the post-evaluator catches any
// resulting false positives.
//
// As strategies for new hint types land, add them here AND remove the type
// from STRUCTURAL_HINTS in hint_compiler.js.
const STRATEGIES = Object.freeze({
  [HINT_TYPES.RELATION_HOLDS]: [],
  [HINT_TYPES.ACTOR_MOBILITY]: [
    (pieces, hint, ctx) => applyMobilityReduce(pieces, hint, ctx)
  ],
  [HINT_TYPES.RELATION_COUNT]: [relationCountStrategy],
  [HINT_TYPES.ACTOR_COUNT]: [actorCountStrategy],
  [HINT_TYPES.ACTOR_AT_POSITION]: [actorAtPositionStrategy],
  [HINT_TYPES.ACTOR_AGGREGATE_VALUE]: [actorAggregateValueStrategy],
  [HINT_TYPES.RELATION_AGGREGATE_VALUE]: [relationAggregateValueStrategy],
  [HINT_TYPES.RELATION_INDIVIDUAL_VALUE]: [relationIndividualValueStrategy],
  [HINT_TYPES.ACTOR_INDIVIDUAL_VALUE]: [actorIndividualValueStrategy],
  [HINT_TYPES.RELATION_PBS_COUNT]: [relationPbsCountStrategy, relationPbsCountBystanderStrategy],
  [HINT_TYPES.RELATION_PBS_AGGREGATE_VALUE]: [relationPbsAggregateValueStrategy],
  [HINT_TYPES.ACTOR_PBS_MOBILITY]: [actorPbsMobilityStrategy],
  [HINT_TYPES.RELATION_SAME_PIECE]: [relationSamePieceStrategy],
  [HINT_TYPES.UNARY_VALUE_PAIR]: [unaryValuePairStrategy],
  [HINT_TYPES.UNARY_COUNT_PAIR]: [unaryCountPairStrategy]
})

function applyHint(pieces, hint, ctx) {
  const strategies = STRATEGIES[hint.type]
  if (strategies === undefined) { return pieces } // unsupported type — silent no-op
  if (strategies.length === 0) { return pieces } // implicit (seed-satisfied)
  for (const strategy of strategies) {
    const result = strategy(pieces, hint, ctx)
    if (result !== null) { return result }
  }
  return null // tried every strategy, none could apply
}

function verifyHints(pieces, hints, ctx) {
  for (const hint of hints) {
    if (!(hint.type in STRATEGIES)) { continue } // unsupported type, don't verify
    if (!satisfies(hint, pieces, ctx)) { return false }
  }
  return true
}

// Build minimum seed from relational plan structure: place at least one subject
// + target satisfying each relational plan. For unary-only chains, place the
// unary subject so mobility hints have something to constrain.
//
// `chainConstraints` carries converged singular-actor variables (movedPiece,
// capturedPiece, etc.). When a relational subject or target is a singular
// actor, the seed picks species from the converged set rather than the plan's
// pool, and narrows the converged set to the pick so sibling strategies see
// the commit.
function buildMinimumSeed(combinedPlan, chainConstraints, random) {
  const movingTeam = combinedPlan.movingTeam
  let pieces = new Map()

  function pickSpeciesForSide(plan, side) {
    const actor = side === 'subject' ? plan.subject : plan.target
    const planPool = side === 'subject' ? plan.subjectSpeciesPool : plan.targetSpeciesPool
    const varKey = ACTOR_TO_VAR_KEY[actor]
    if (varKey && chainConstraints) {
      const set = chainConstraints[varKey].species_set
      const pool = [...set].filter(s => s !== null && (planPool ? planPool.includes(s) : true))
      const pick = pickRandom(shuffled(pool, random), random)
      if (!pick) { return null }
      // Narrow the converged set so sibling strategies see the commit.
      set.clear()
      set.add(pick)
      return pick
    }
    return pickRandom(planPool, random)
  }

  // Pick a position for a piece, respecting ctx.{actor}.position_set when
  // the actor is a singular move-event actor. Returns null if no candidate
  // position is available.
  function pickPositionForActor(actor, occupied) {
    const varKey = ACTOR_TO_VAR_KEY[actor]
    let candidates = ALL_POSITIONS
    if (varKey && chainConstraints) {
      candidates = [...chainConstraints[varKey].position_set]
    }
    const free = candidates.filter(p => !occupied.has(p))
    if (free.length === 0) { return null }
    return pickRandom(shuffled(free, random), random)
  }

  // Narrow ctx.{actor}.position_set to {pos} when the seed commits a singular
  // actor's position. Sibling strategies see the commitment.
  function narrowPositionForActor(actor, pos) {
    const varKey = ACTOR_TO_VAR_KEY[actor]
    if (varKey && chainConstraints) {
      const set = chainConstraints[varKey].position_set
      set.clear()
      set.add(pos)
    }
  }

  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      // Zero-count plans want NO qualifying pair on the resulting board.
      // Placing one would violate the predicate (and verify would reject every
      // attempt). Skip seed placement; the strategy for RELATION_COUNT(=0)
      // returns pieces unchanged when the current count already satisfies.
      if (usesZeroRelationPath(plan.requirements)) { continue }
      // Same-piece doesn't have a placement geometry — the strategy engineers
      // the captured piece + mover + recentMoveContext entirely on its own.
      if (plan.operator === 'same_piece') { continue }
      const subjectTeam = plan.subjectTeam
      const targetTeam = plan.targetTeam
      const subjectSpecies = pickSpeciesForSide(plan, 'subject')
      const targetSpecies = pickSpeciesForSide(plan, 'target')
      if (!subjectSpecies || !targetSpecies) { return null }

      // Place target first, then subject in attack range. For singular-actor
      // sides, draw position from the converged position_set so the seed
      // respects sibling position constraints. The seed places tentatively
      // and does NOT narrow position_set — strategies (M4a, M4b, etc.) are
      // the authoritative committers for the move's actor positions, and
      // their geometry constraints may conflict with whatever the seed picks.
      const targetPos = pickPositionForActor(plan.target, pieces)
      if (targetPos === null) { return null }
      let next = placePiece(pieces, targetPos, pieceCode(targetTeam, targetSpecies))
      if (!next) { continue }
      pieces = next

      // Find a square from which subjectSpecies attacks targetPos.
      const subjectVarKey = ACTOR_TO_VAR_KEY[plan.subject]
      const subjectPositionCandidates = (subjectVarKey && chainConstraints)
        ? [...chainConstraints[subjectVarKey].position_set]
        : ALL_POSITIONS
      const candidatePositions = shuffled(subjectPositionCandidates, random)
      let placed = false
      for (const candidatePos of candidatePositions) {
        if (pieces.has(candidatePos)) { continue }
        if (candidatePos === targetPos) { continue }
        const trial = placePiece(pieces, candidatePos, pieceCode(subjectTeam, subjectSpecies))
        if (!trial) { continue }
        const board = piecesIntoBoard(trial, subjectTeam)
        const reach = reachOf(plan.operator, board, candidatePos)
        if (reach.has(targetPos)) {
          pieces = trial
          placed = true
          break
        }
      }
      if (!placed) { return null }
    } else if (plan.kind === 'unary') {
      // Unary pair plans (target is a singular move-event actor) are
      // engineered entirely by their own strategy — it commits a mover and/or
      // captured piece consistent with the comparator. Seed-placing here
      // would conflict.
      if (plan.target === 'moved_piece' || plan.target === 'captured_piece' ||
          plan.target === 'enemy_moved_piece' || plan.target === 'enemy_captured_piece') {
        continue
      }
      // Skip seed placement for unary count=0 plans only. Placing a matching
      // piece would directly violate the predicate. value=0 and mobility=0
      // plans still get a seed because their strategies operate on the seeded
      // piece (mobility reduce; value pool narrowing).
      const total = Number(plan.targetTotal ?? 0)
      if (plan.operator === 'count' && plan.target === 'exact_number'
          && plan.comparator === 'equal_to' && total === 0) { continue }

      // Place a piece matching plan.subject's actor + filter so mobility hints have a target.
      if (plan.subject === 'allied' || plan.subject === 'enemy') {
        const team = actorTeamOnBoard(plan.subject, movingTeam)
        // Narrow pool for unary value < N / <= N so the seeded piece can't
        // already overshoot the constraint (strategies don't reduce values).
        let speciesPool = plan.subjectSpeciesPool
        if (plan.operator === 'value' && plan.target === 'exact_number') {
          // Seed must not pre-violate the value predicate. For each comparator,
          // pick a species whose individual value can't already overshoot the
          // aggregate constraint (the strategy can add more pieces if needed).
          if (plan.comparator === 'less_than') {
            speciesPool = speciesPool.filter(s => materialValue(s) < total)
          } else if (plan.comparator === 'less_than_or_equal_to' || plan.comparator === 'equal_to') {
            speciesPool = speciesPool.filter(s => materialValue(s) <= total)
          }
        }
        const species = pickRandom(speciesPool, random)
        if (!species) { continue }
        // Skip if a matching piece is already on the board (e.g., placed by a relational plan).
        let alreadyMatched = false
        for (const piece of pieces.values()) {
          if (piece.charAt(0) === team && speciesMatchesFilter(piece.slice(1), plan.subjectFilter, plan.subjectFilterMode)) {
            alreadyMatched = true
            break
          }
        }
        if (alreadyMatched) { continue }
        const candidatePositions = shuffled(ALL_POSITIONS, random)
        for (const pos of candidatePositions) {
          if (pieces.has(pos)) { continue }
          const next = placePiece(pieces, pos, pieceCode(team, species))
          if (next) { pieces = next; break }
        }
      }
    }
  }

  return pieces
}

function reachOf(operator, board, attackerPosition) {
  if (operator === 'adjacent') {
    return new Set(adjacentNeighborPositions(attackerPosition).filter(p => p !== null))
  }
  return new Set(controlledSquares({ board, attackerPosition }))
}

export function resolveViaHints({ combinedPlan, random }) {
  const hints = compileHints(combinedPlan, random)
  if (!hints.some(h => h.type !== HINT_TYPES.RELATION_HOLDS)) { return null }

  const movingTeam = combinedPlan.movingTeam

  // chainConstraints holds converged constraints on the four singular move-event
  // actors (movedPiece, capturedPiece, enemyMovedPiece, enemyCapturedPiece)
  // and the inventory tree (group actors). Built before seed/strategies so
  // they can consult and narrow it.
  const chainConstraints = buildChainConstraints(combinedPlan)
  if (chainConstraints === null) { return null }

  // Narrow PBS sample pairs (n_prior, n_current) by inventory + direction.
  // Re-samples in place when the existing sample is incompatible with sibling
  // inventory ranges. Returns false on unsat (no compatible pair exists).
  if (!narrowPbsHintsByInventory(hints, chainConstraints, random)) { return null }

  let pieces = buildMinimumSeed(combinedPlan, chainConstraints, random)
  if (pieces === null) { return null }
  // pieces.size === 0 is legitimate for chains that consist entirely of
  // zero-count or actor-only constraints — strategies populate the board
  // from there.

  // Place kings BEFORE strategies so each strategy sees the full set of
  // pieces it's expected to constrain (most importantly, mobility strategies
  // need to constrain king mobility, not just non-king actors).
  pieces = placeKingsIfAbsent(pieces, random)
  if (pieces === null) { return null }

  // Parallel prior-frame state. For chains with no PBS-direction descriptors,
  // priorPieces stays equal to the current state and the move is synthesized
  // by the reconstruction loop below. PBS-direction strategies (Phase 8d)
  // augment priorPieces independently from `pieces`; the move then falls out
  // of the diff between the two maps.
  const priorPieces = clonePiecesMap(pieces)
  // recentMoveContext is null by default; same_piece strategy sets it when
  // engineering a capture that declares the captured piece as the prior turn's
  // enemy moved_piece.
  const ctx = {
    movingTeam, random, priorPieces, recentMoveContext: null,
    movedPiece: chainConstraints.movedPiece,
    capturedPiece: chainConstraints.capturedPiece,
    enemyMovedPiece: chainConstraints.enemyMovedPiece,
    enemyCapturedPiece: chainConstraints.enemyCapturedPiece,
    inventory: chainConstraints.inventory
  }

  for (const hint of hints) {
    try {
      pieces = applyHint(pieces, hint, ctx)
    } catch { pieces = null }
    if (pieces === null) { return null }
  }

  // Verify: every supported hint must hold on the augmented board. The
  // orchestrator's outer attempt loop will retry with a fresh RNG sequence
  // if we return null here.
  if (!verifyHints(pieces, hints, ctx)) { return null }

  // If a PBS-direction strategy mutated priorPieces, the move falls out of
  // the diff between prior and current. Otherwise synthesize the move by
  // picking any moving-team piece and finding an origin.
  const diffMove = priorMatchesCurrent(pieces, ctx.priorPieces) ? null : deriveMoveFromDiff(ctx.priorPieces, pieces, movingTeam)
  if (diffMove !== null) {
    const priorBoard = piecesIntoBoard(ctx.priorPieces, movingTeam, ctx.recentMoveContext)
    let moveObject
    try { moveObject = Rules.getMoveObject(diffMove.origin, diffMove.dest, priorBoard) } catch { return null }
    if (moveObject.illegal) { return null }
    if (!legalPriorTurnState(priorBoard, moveObject)) { return null }
    return { priorBoard, moveObject }
  }

  // Find a legal move for the moving team that lands on this exact after-state.
  // Kings are valid movers — Rules.getMoveObject + legalPriorTurnState reject
  // illegal king moves (into check, etc.); no need to filter them here.
  const piecesByTeam = []
  for (const [pos, piece] of pieces.entries()) {
    if (piece.charAt(0) === movingTeam) {
      piecesByTeam.push({ position: pos, species: piece.slice(1) })
    }
  }

  // Strategy: pick any moving-team piece's after-position; find an origin from
  // which it could move there. Then construct prior board.
  for (const { position: endPos, species } of shuffled(piecesByTeam, random)) {
    const origins = shuffled(originCandidatesForSpecies(endPos, species), random)
    for (const origin of origins) {
      if (origin === endPos) { continue }
      if (pieces.has(origin)) { continue }
      let priorPieces = new Map(pieces)
      priorPieces.delete(endPos)
      const placed = placePiece(priorPieces, origin, pieceCode(movingTeam, species))
      if (!placed) { continue }
      priorPieces = placed
      const priorBoard = piecesIntoBoard(priorPieces, movingTeam)
      let moveObject
      try { moveObject = Rules.getMoveObject(origin, endPos, priorBoard) } catch { continue }
      if (moveObject.illegal) { continue }
      if (!legalPriorTurnState(priorBoard, moveObject)) { continue }
      return { priorBoard, moveObject }
    }
  }
  return null
}

function priorMatchesCurrent(currentPieces, priorPieces) {
  if (currentPieces.size !== priorPieces.size) { return false }
  for (const [pos, piece] of currentPieces.entries()) {
    if (priorPieces.get(pos) !== piece) { return false }
  }
  return true
}

// Derive a single legal move from the diff between prior and current pieces.
// Returns { origin, dest } or null if the diff isn't shaped like one move.
function deriveMoveFromDiff(priorPieces, currentPieces, movingTeam) {
  const onlyInPrior = []
  const onlyInCurrent = []
  for (const [pos, piece] of priorPieces.entries()) {
    if (currentPieces.get(pos) !== piece) { onlyInPrior.push({ pos, piece }) }
  }
  for (const [pos, piece] of currentPieces.entries()) {
    if (priorPieces.get(pos) !== piece) { onlyInCurrent.push({ pos, piece }) }
  }
  if (onlyInCurrent.length !== 1) { return null }
  const dest = onlyInCurrent[0]
  if (dest.piece.charAt(0) !== movingTeam) { return null }
  // Origin: position in prior with the same moved piece, not in current at that pos.
  const origins = onlyInPrior.filter(p => p.piece === dest.piece)
  if (origins.length !== 1) { return null }
  return { origin: origins[0].pos, dest: dest.pos }
}
