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
//     never deterministic for-each. (See buildMinimumSeed, applyStrategyDirectBlock.)
//   - When a hint has multiple satisfying strategies, do NOT always try them in
//     a fixed order — that biases output toward whichever strategy fires first.
//     Prefer round-robin or random strategy choice. The current
//     applyMobilityAtMost still tries C-then-A; rotate it before adding more
//     strategies, or new hint types will inherit the bias.
//   - Hints must not name squares. If you find yourself reading hint.square,
//     stop — that is a chain-shape template, not a semantic hint.

import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { controlledSquares } from 'gameplay/board_query_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode
} from 'editorV2/panels/condition_preview_generation/board_utils'
import { candidateSpecies, legalPriorTurnState } from 'editorV2/panels/condition_preview/example_utils'
import {
  adjacentNeighborPositions, originCandidatesForSpecies
} from 'editorV2/panels/condition_preview/geometry_utils'
import { placePiece } from '../piece_placement'
import { placeKingsIfAbsent } from '../board_utils'
import { compileHints, HINT_TYPES } from './hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))

function pickRandom(values, random) {
  if (!values || values.length === 0) { return null }
  return values[Math.floor(random() * values.length)]
}

function shuffled(values, random) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function piecesIntoBoard(pieces, allowedToMove) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces), null, allowedToMove)
}

function actorTeamOnBoard(actor, movingTeam) {
  if (actor === 'allied' || actor === 'moved_piece' || actor === 'captured_piece') {
    return movingTeam
  }
  return Board.opposingTeam(movingTeam)
}

function pieceMatchesFilter(species, filter) {
  if (filter === 'any') { return true }
  switch (filter) {
    case 'king':   return species === Board.KING
    case 'queen':  return species === Board.QUEEN
    case 'rook':   return species === Board.ROOK
    case 'bishop': return species === Board.BISHOP
    case 'knight': return species === Board.NIGHT
    case 'pawn':   return species === Board.PAWN
    case 'major':  return species === Board.QUEEN || species === Board.ROOK
    case 'minor':  return species === Board.BISHOP || species === Board.NIGHT
    default: return true
  }
}

// Apply ACTOR_MOBILITY_AT_MOST hint: for each matching piece on the board, ensure
// its mobility (legal-move count) is ≤ hint.maxMobility. Achieves the semantic
// property "actor's mobility ≤ N" via one of these strategies:
//   - C (check + block): place an allied attacker giving check on a matching king.
//     King's legal moves are then restricted to escape; non-king matching pieces
//     are restricted to defending moves. Strategy A runs on top to handle remaining
//     mobility. Most useful for mobility=0 with king in scope.
//   - A (direct block): place blockers/attackers at excess move-targets.
//
// Both strategies satisfy the same hint. Resolver tries C first (when applicable),
// falls back to A.
function applyMobilityAtMost(pieces, hint, movingTeam, random) {
  const cResult = tryStrategyCheckPlusBlock(pieces, hint, movingTeam, random)
  if (cResult !== null) { return cResult }
  return applyStrategyDirectBlock(pieces, hint, movingTeam, random)
}

function applyStrategyDirectBlock(pieces, hint, movingTeam, random) {
  const matching = []
  for (const [position, piece] of pieces.entries()) {
    if (piece.charAt(0) !== hint.team) { continue }
    if (!pieceMatchesFilter(piece.slice(1), hint.filter)) { continue }
    matching.push({ position, piece })
  }

  let result = pieces
  for (const { position, piece } of matching) {
    result = restrictMobilityForPiece(result, position, piece, hint.maxMobility, movingTeam, random)
    if (result === null) { return null }
  }
  return result
}

// Strategy C generalized: for ANY actor (not just king), the hint can be satisfied
// by putting the matching team's king in check + placing matching pieces where
// they can't defend (no legal capture-attacker or block-ray move). When in check,
// a piece's only legal moves are defending moves; if there are none (or ≤ N), the
// actor's mobility ≤ N. Works for king (escape blocked) and non-king (pin/no-defend).
function tryStrategyCheckPlusBlock(pieces, hint, movingTeam, random) {
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

      // After placing the check-attacker, see if total matching mobility is already ≤ maxMobility.
      let totalMobility = 0
      let valid = true
      try {
        const board = piecesIntoBoard(withAttacker, hint.team)
        for (const [pos, piece] of withAttacker.entries()) {
          if (piece.charAt(0) !== hint.team) { continue }
          if (!pieceMatchesFilter(piece.slice(1), hint.filter)) { continue }
          const moves = Rules.availableMovesFrom({ board, startPosition: pos })
          totalMobility += moves.length
          if (totalMobility > hint.maxMobility) { break }
        }
      } catch { valid = false }
      if (valid && totalMobility <= hint.maxMobility) { return withAttacker }

      // Fall back to topping up with direct blocking for any residual.
      let blocked = null
      try { blocked = applyStrategyDirectBlock(withAttacker, hint, movingTeam, random) } catch { blocked = null }
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

function applyHint(pieces, hint, movingTeam, random) {
  switch (hint.type) {
    case HINT_TYPES.RELATION_HOLDS:
      // Satisfied by upstream seed; no augmentation needed here.
      return pieces
    case HINT_TYPES.ACTOR_MOBILITY_AT_MOST:
      return applyMobilityAtMost(pieces, hint, movingTeam, random)
    default:
      return pieces
  }
}

// Build minimum seed from relational plan structure: place at least one subject
// + target satisfying each relational plan. For unary-only chains, place the
// unary subject so mobility hints have something to constrain.
function buildMinimumSeed(combinedPlan, random) {
  const movingTeam = combinedPlan.movingTeam
  let pieces = new Map()

  for (const plan of combinedPlan.plans) {
    if (plan.kind === 'relational') {
      const subjectTeam = plan.subjectTeam
      const targetTeam = plan.targetTeam
      const subjectSpecies = pickRandom(plan.subjectSpeciesPool, random)
      const targetSpecies = pickRandom(plan.targetSpeciesPool, random)
      if (!subjectSpecies || !targetSpecies) { return null }

      // Place target first, then subject in attack range.
      const targetPos = pickRandom(shuffled(ALL_POSITIONS, random), random)
      let next = placePiece(pieces, targetPos, pieceCode(targetTeam, targetSpecies))
      if (!next) { continue }
      pieces = next

      // Find a square from which subjectSpecies attacks targetPos.
      const tempPieces = new Map([[targetPos, pieceCode(targetTeam, targetSpecies)]])
      const candidatePositions = shuffled(ALL_POSITIONS, random)
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
      // Place a piece matching plan.subject's actor + filter so mobility hints have a target.
      if (plan.subject === 'allied' || plan.subject === 'enemy') {
        const team = actorTeamOnBoard(plan.subject, movingTeam)
        const speciesPool = plan.subjectSpeciesPool
        const species = pickRandom(speciesPool, random)
        if (!species) { continue }
        // Skip if a matching piece is already on the board (e.g., placed by a relational plan).
        let alreadyMatched = false
        for (const piece of pieces.values()) {
          if (piece.charAt(0) === team && pieceMatchesFilter(piece.slice(1), plan.subjectFilter)) {
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
  const hints = compileHints(combinedPlan)
  if (!hints.some(h => h.type !== HINT_TYPES.RELATION_HOLDS)) { return null }

  const movingTeam = combinedPlan.movingTeam

  let pieces = buildMinimumSeed(combinedPlan, random)
  if (pieces === null || pieces.size === 0) { return null }

  for (const hint of hints) {
    try {
      pieces = applyHint(pieces, hint, movingTeam, random)
    } catch { pieces = null }
    if (pieces === null) { return null }
  }

  pieces = placeKingsIfAbsent(pieces, random)
  if (pieces === null) { return null }

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
