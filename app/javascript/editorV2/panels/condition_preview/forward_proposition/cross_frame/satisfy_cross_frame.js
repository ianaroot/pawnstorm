import {
  buildBoardFromLayout, buildLayoutFromPieces, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildPriorBoard } from 'editorV2/panels/condition_preview/shared/example_utils'
import { pieceControlsSquare } from 'gameplay/board_query_utils'
import { movedPieceParticipatesInAttackOrDefend } from './mechanisms/moved_piece_participates_in_attack_or_defend'
import { movedPieceParticipatesAdjacent } from './mechanisms/moved_piece_participates_adjacent'
import { movedPieceParticipatesShield } from './mechanisms/moved_piece_participates_shield'
import { movedPieceObstructsInAttackOrDefend } from './mechanisms/moved_piece_obstructs_in_attack_or_defend'
import { movedPieceObstructsShield } from './mechanisms/moved_piece_obstructs_shield'
import { movedPieceShiftsOwnMobility } from './mechanisms/moved_piece_shifts_own_mobility'

const MECHANISMS = Object.freeze([
  movedPieceParticipatesInAttackOrDefend,
  movedPieceParticipatesAdjacent,
  movedPieceParticipatesShield,
  movedPieceObstructsInAttackOrDefend,
  movedPieceObstructsShield,
  movedPieceShiftsOwnMobility
])

export function satisfyCrossFrame(ctx, pieces, random) {
  const entries = ctx.crossFrame ?? []
  if (entries.length === 0) { return pieces }

  for (const entry of shuffled(entries, random)) {
    const applicable = MECHANISMS.filter(m => m.appliesTo(entry, ctx, pieces))
    for (const mechanism of shuffled(applicable, random)) {
      const next = mechanism.apply(entry, ctx, pieces, random)
      if (next === null) { continue }
      pieces = next
      if (entrySatisfied(entry, ctx, pieces)) { break }
    }
  }
  return pieces
}

// Direct metric check on (afterPieces, priorPieces). Currently supports
// count metric on attack/defend relations — the metrics produced by our
// only mechanism today. Other metrics are treated as "assume satisfied"
// until a mechanism that needs them lands.
function entrySatisfied(entry, ctx, afterPieces) {
  if (entry.metric !== 'count') { return true }
  if (entry.operator !== 'attack' && entry.operator !== 'defend') { return true }

  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return true }
  const origin = firstSquareOf(moved.priorRegion)
  if (origin === null) { return true }

  const priorPieces = buildPriorBoard({ pieces: afterPieces, singulars: ctx.singulars, origin, endPos: destination })

  const afterCount = countParticipants({
    proposition: entry.currentProposition,
    pieces: afterPieces,
    movedPieceSquare: destination
  })
  const priorCount = countParticipants({
    proposition: entry.priorProposition,
    pieces: priorPieces,
    movedPieceSquare: origin
  })

  return compareWithDirection(afterCount, priorCount, entry.direction)
}

function countParticipants({ proposition, pieces, movedPieceSquare }) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const role = proposition.region?.role // 'target' or 'subject' — moved_piece's role in the relation
  let count = 0
  for (const [pos, piece] of pieces) {
    if (piece.charAt(0) !== proposition.team) { continue }
    if (!proposition.species_set.has(piece.slice(1))) { continue }
    if (proposition.region?.kind === 'related-to') {
      if (!participatesInRelation(pos, role, movedPieceSquare, board)) { continue }
    }
    count += 1
  }
  return count
}

function participatesInRelation(otherSidePos, movedPieceRole, movedPieceSquare, board) {
  // role === 'target' means moved_piece is the target; the OTHER side
  // (otherSidePos) is the subject (attacker). Subject controls target.
  // role === 'subject' means moved_piece attacks; otherSidePos is the target.
  // moved_piece controls otherSidePos.
  if (movedPieceRole === 'target') {
    return pieceControlsSquare({ board, attackerPosition: otherSidePos, targetPosition: movedPieceSquare })
  }
  if (movedPieceRole === 'subject') {
    return pieceControlsSquare({ board, attackerPosition: movedPieceSquare, targetPosition: otherSidePos })
  }
  return false
}

function compareWithDirection(afterCount, priorCount, direction) {
  if (direction === '+') { return afterCount > priorCount }
  if (direction === '-') { return afterCount < priorCount }
  if (direction === '=') { return afterCount === priorCount }
  return false
}

function singularSquare(singular) {
  if (singular.region.kind !== 'set') { return null }
  if (singular.region.squares.size !== 1) { return null }
  return [...singular.region.squares][0]
}

function firstSquareOf(region) {
  if (!region) { return null }
  if (region.kind !== 'set') { return null }
  if (region.squares.size === 0) { return null }
  return [...region.squares][0]
}
