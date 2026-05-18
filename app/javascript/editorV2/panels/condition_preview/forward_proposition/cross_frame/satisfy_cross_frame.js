import profileCollector from 'gameplay/profile_collector'
import {
  buildBoardFromLayout, buildLayoutFromPieces, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildPriorBoard } from 'editorV2/panels/condition_preview/shared/example_utils'
import { pieceControlsSquare } from 'gameplay/board_query_utils'
import { singularPosition } from '../relations/relation_helpers'
import { mobilityDeltaSatisfied } from './mobility_delta'
import {
  singularSquare, firstSquareOf, compareWithDirection
} from './mechanisms/participates_helpers'
import { movedPieceParticipatesInAttackOrDefend } from './mechanisms/moved_piece_participates_in_attack_or_defend'
import { movedPieceParticipatesAdjacent } from './mechanisms/moved_piece_participates_adjacent'
import { movedPieceParticipatesShield } from './mechanisms/moved_piece_participates_shield'
import { movedPieceObstructsInAttackOrDefend } from './mechanisms/moved_piece_obstructs_in_attack_or_defend'
import { movedPieceObstructsShield } from './mechanisms/moved_piece_obstructs_shield'
import { movedPieceShiftsOwnMobility } from './mechanisms/moved_piece_shifts_own_mobility'
import { movedPieceShiftsAlliedMobility } from './mechanisms/moved_piece_shifts_allied_mobility'
import { movedPieceShiftsEnemyKingMobility } from './mechanisms/moved_piece_shifts_enemy_king_mobility'
import { movedPieceShiftsEnemyMobility } from './mechanisms/moved_piece_shifts_enemy_mobility'
import { movedPieceCapturesRelationParticipant } from './mechanisms/moved_piece_captures_relation_participant'
import { movedPieceShiftsRegionMembership } from './mechanisms/moved_piece_shifts_region_membership'

const MECHANISMS = Object.freeze([
  movedPieceShiftsRegionMembership,
  movedPieceParticipatesInAttackOrDefend,
  movedPieceParticipatesAdjacent,
  movedPieceParticipatesShield,
  movedPieceObstructsInAttackOrDefend,
  movedPieceObstructsShield,
  movedPieceShiftsOwnMobility,
  movedPieceShiftsAlliedMobility,
  movedPieceShiftsEnemyKingMobility,
  movedPieceShiftsEnemyMobility,
  movedPieceCapturesRelationParticipant
])

export function satisfyCrossFrame(ctx, pieces, random) {
  const entries = ctx.crossFrame ?? []
  if (entries.length === 0) { return pieces }

  for (const entry of shuffled(entries, random)) {
    profileCollector.increment(`forward_proposition.cross_frame.entry_seen.${entry.metric}.${entry.operator}`)
    const applicable = MECHANISMS.filter(m => m.appliesTo(entry, ctx, pieces))
    // Mechanisms chain via `pieces`: a non-null return is kept and the next
    // mechanism builds on it. entrySatisfied gates the chain — false keeps
    // iterating, true breaks. Count attack/defend uses chaining (each call
    // adds one attacker); other operators are one-shot (unconditional true).
    for (const mechanism of shuffled(applicable, random)) {
      profileCollector.increment(`forward_proposition.cross_frame.mech_applies.${mechanism.name}.${entry.metric}.${entry.operator}`)
      const next = mechanism.apply(entry, ctx, pieces, random)
      if (next === null) { continue }
      profileCollector.increment(`forward_proposition.cross_frame.mech_applied.${mechanism.name}.${entry.metric}.${entry.operator}`)
      pieces = next
      const satisfied = entrySatisfied(entry, ctx, pieces)
      profileCollector.increment(`forward_proposition.cross_frame.entry_satisfied.${satisfied ? 'true' : 'false'}.${entry.metric}.${entry.operator}`)
      if (satisfied) {
        profileCollector.increment(`forward_proposition.cross_frame.mech_won.${mechanism.name}.${entry.metric}.${entry.operator}`)
        break
      }
    }
  }
  return pieces
}

// Chain-control gate: true ends the mechanism loop, false keeps chaining.
// count + aggregate_mobility get real prior-vs-after checks; others true.
function entrySatisfied(entry, ctx, afterPieces) {
  if (entry.source === 'census' &&
      entry.metric === 'count' &&
      entry.currentProposition?.region?.kind === 'set') {
    return regionCountDeltaSatisfied(entry, ctx, afterPieces)
  }
  if (entry.metric === 'aggregate_mobility') {
    return mobilityDeltaSatisfied(entry, ctx, afterPieces)
  }
  if (entry.metric !== 'count') { return true }
  if (entry.operator !== 'attack' && entry.operator !== 'defend') { return true }

  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return true }
  const origin = firstSquareOf(moved.priorRegion)
  if (origin === null) { return true }

  const priorPieces = buildPriorBoard({ pieces: afterPieces, singulars: ctx.singulars, origin, endPos: destination })
  if (priorPieces === null) { return false }

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

function regionCountDeltaSatisfied(entry, ctx, afterPieces) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return true }
  const origin = firstSquareOf(moved.priorRegion)
  if (origin === null) { return true }

  const priorPieces = buildPriorBoard({
    pieces: afterPieces, singulars: ctx.singulars, origin, endPos: destination,
    capturedPiecePosition: singularPosition(ctx, 'captured_piece') ?? undefined
  })
  if (priorPieces === null) { return false }

  // census PBS builds both frames from one identical sideShape, so
  // currentProposition's team/species/region also describe the prior frame.
  const prop = entry.currentProposition
  const region = prop.region.squares
  const after = countInRegion(prop, afterPieces, region)
  const prior = countInRegion(prop, priorPieces, region)
  return compareWithDirection(after, prior, entry.direction)
}

function countInRegion(proposition, pieces, region) {
  let count = 0
  for (const [pos, piece] of pieces) {
    if (!region.has(pos)) { continue }
    if (piece.charAt(0) !== proposition.team) { continue }
    if (!proposition.species_set.has(piece.slice(1))) { continue }
    count += 1
  }
  return count
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

