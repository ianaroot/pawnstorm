import Board from 'gameplay/board'
import { pieceControlsSquare } from 'gameplay/board_query_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode, shuffled
} from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  attackerCandidatesFor, controlledSquaresForPieceAt, originCandidatesForSpecies
} from 'editorV2/panels/condition_preview/shared/geometry_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { intersectRegions } from '../../region'
import { respectsAllCaps } from '../../respect_caps'

const RELEVANT_OPERATORS = new Set(['attack', 'defend'])

export const movedPieceParticipatesInAttackOrDefend = {
  name: 'moved-piece-participates-in-attack-or-defend',

  appliesTo(entry, ctx, pieces) {
    if (entry.source !== 'relational') { return false }
    if (!RELEVANT_OPERATORS.has(entry.operator)) { return false }
    return movedPieceRoleIn(entry) !== null
  },

  apply(entry, ctx, pieces, random) {
    const role = movedPieceRoleIn(entry)
    if (role === null) { return null }
    if (entry.direction === '+') { return applyPlus(entry, role, ctx, pieces, random) }
    if (entry.direction === '-') { return applyMinus(entry, role, ctx, pieces, random) }
    return null
  }
}

function movedPieceRoleIn(entry) {
  const region = entry.currentProposition?.region
  if (region?.kind !== 'related-to') { return null }
  if (region.actor !== 'moved_piece') { return null }
  return region.role
}

function singularSquare(singular) {
  if (singular.region.kind !== 'set') { return null }
  if (singular.region.squares.size !== 1) { return null }
  return [...singular.region.squares][0]
}

function applyPlus(entry, role, ctx, pieces, random) {
  if (role === 'target') { return applyPlusRoleTarget(entry, ctx, pieces, random) }
  if (role === 'subject') { return applyPlusRoleSubject(entry, ctx, pieces, random) }
  return null
}

function applyMinus(entry, role, ctx, pieces, random) {
  if (role === 'target') { return applyMinusRoleTarget(entry, ctx, pieces, random) }
  if (role === 'subject') { return applyMinusRoleSubject(entry, ctx, pieces, random) }
  return null
}

// moved_piece is the relation's target; we place a piece (attacker/defender)
// that controls moved_piece's destination. priorRegion narrows to origin
// candidates the new piece does not control — so the count holds on after but
// not on prior, satisfying the '+' delta.
function applyPlusRoleTarget(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }

  const team = entry.currentProposition.team
  const speciesPool = placeableSpecies(entry.currentProposition.species_set)
  if (speciesPool.length === 0) { return null }

  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  for (const species of shuffled(speciesPool, random)) {
    const candidates = shuffled(attackerCandidatesFor(destination, species, team, board), random)
    for (const placement of candidates) {
      if (pieces.has(placement)) { continue }
      if (!respectsAllCaps(team, species, placement, ctx, pieces)) { continue }
      const result = commitWithPlacement({
        placement, species, placerTeam: team, ctx, pieces, destination,
        controllerCheck: piecePosition => piecePosition
      })
      if (result !== null) { return result }
    }
  }
  return null
}

// moved_piece is the relation's subject; we place a target piece (of the
// other team) on a square moved_piece's destination controls. priorRegion
// narrows to origin candidates from which moved_piece does NOT control that
// target square.
function applyPlusRoleSubject(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }

  const team = entry.currentProposition.team
  const speciesPool = placeableSpecies(entry.currentProposition.species_set)
  if (speciesPool.length === 0) { return null }

  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const reachable = shuffled(controlledSquaresForPieceAt(destination, board), random)
  for (const placement of reachable) {
    if (pieces.has(placement)) { continue }
    for (const species of shuffled(speciesPool, random)) {
      if (!respectsAllCaps(team, species, placement, ctx, pieces)) { continue }
      const result = commitWithPlacement({
        placement, species, placerTeam: team, ctx, pieces, destination,
        controllerCheck: piecePosition => piecePosition
      })
      if (result !== null) { return result }
    }
  }
  return null
}

// moved_piece is the target. Direction '-' means count of attackers on
// moved_piece went down. If moved_piece's destination is already
// uncontrolled by relevant attackers, we just commit priorRegion to origin
// candidates that ARE controlled by some existing attacker. If the
// destination is still controlled, this mechanism can't post-engineer.
function applyMinusRoleTarget(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const team = entry.currentProposition.team
  const speciesSet = entry.currentProposition.species_set

  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  if (anyTeamPieceControls({ board, pieces, team, speciesSet, square: destination })) { return null }

  const movedSpecies = [...moved.species_set][0]
  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))
    .filter(origin => anyTeamPieceControls({ board, pieces, team, speciesSet, square: origin }))

  if (candidates.length === 0) { return null }
  return commitPriorRegion(ctx, candidates, pieces)
}

// moved_piece is the subject. Direction '-' means moved_piece attacks fewer
// targets on after than prior. Commit priorRegion to origin candidates from
// which moved_piece at origin controls more relevant targets than from
// destination.
function applyMinusRoleSubject(entry, ctx, pieces, random) {
  const moved = ctx.singulars.moved_piece
  const destination = singularSquare(moved)
  if (destination === null) { return null }
  const movedSpecies = [...moved.species_set][0]
  const team = entry.currentProposition.team
  const speciesSet = entry.currentProposition.species_set

  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const targetsFromDestination = relevantControlledTargets(board, pieces, destination, team, speciesSet)

  const candidates = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !pieces.has(p))
    .filter(origin => {
      const probe = withMovedAt(pieces, destination, origin, moved.team, movedSpecies)
      const probeBoard = buildBoardFromLayout(buildLayoutFromPieces(probe))
      const targetsFromOrigin = relevantControlledTargets(probeBoard, probe, origin, team, speciesSet)
      return targetsFromOrigin > targetsFromDestination
    })

  if (candidates.length === 0) { return null }
  return commitPriorRegion(ctx, candidates, pieces)
}

function placeableSpecies(speciesSet) {
  const result = []
  for (const s of speciesSet) {
    if (s === null) { continue }
    if (s === Board.KING) { continue }
    result.push(s)
  }
  return result
}

function anyTeamPieceControls({ board, pieces, team, speciesSet, square }) {
  for (const [pos, piece] of pieces) {
    if (piece.charAt(0) !== team) { continue }
    if (!speciesSet.has(piece.slice(1))) { continue }
    if (pieceControlsSquare({ board, attackerPosition: pos, targetPosition: square })) { return true }
  }
  return false
}

function relevantControlledTargets(board, pieces, attackerPosition, targetTeam, speciesSet) {
  const controlled = controlledSquaresForPieceAt(attackerPosition, board)
  let count = 0
  for (const sq of controlled) {
    const occupant = pieces.get(sq)
    if (!occupant) { continue }
    if (occupant.charAt(0) !== targetTeam) { continue }
    if (!speciesSet.has(occupant.slice(1))) { continue }
    count += 1
  }
  return count
}

function withMovedAt(pieces, fromSquare, toSquare, team, species) {
  const next = new Map(pieces)
  next.delete(fromSquare)
  next.set(toSquare, pieceCode(team, species))
  return next
}

function commitWithPlacement({ placement, species, placerTeam, ctx, pieces, destination, controllerCheck }) {
  const next = placePiece(pieces, placement, pieceCode(placerTeam, species))
  if (next === null) { return null }

  const hypotheticalBoard = buildBoardFromLayout(buildLayoutFromPieces(next))
  const moved = ctx.singulars.moved_piece
  const movedSpecies = [...moved.species_set][0]
  const validOrigins = originCandidatesForSpecies(destination, movedSpecies, moved.team)
    .filter(p => p !== destination && !next.has(p))
    .filter(origin => !pieceControlsSquare({
      board: hypotheticalBoard,
      attackerPosition: controllerCheck(placement),
      targetPosition: origin
    }))

  if (validOrigins.length === 0) { return null }

  const proposed = { kind: 'set', squares: new Set(validOrigins) }
  const intersected = intersectRegions(moved.priorRegion, proposed)
  if (intersected.kind === 'set' && intersected.squares.size === 0) { return null }

  moved.priorRegion = intersected
  return next
}

function commitPriorRegion(ctx, candidates, pieces) {
  const proposed = { kind: 'set', squares: new Set(candidates) }
  const moved = ctx.singulars.moved_piece
  const intersected = intersectRegions(moved.priorRegion, proposed)
  if (intersected.kind === 'set' && intersected.squares.size === 0) { return null }
  moved.priorRegion = intersected
  return pieces
}
