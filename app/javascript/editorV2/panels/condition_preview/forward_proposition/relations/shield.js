import Board from 'gameplay/board'
import {
  buildBoardFromLayout, buildLayoutFromPieces,
  shuffled, pieceCode, legalPlacementForSpecies, pickWeightedSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { shieldAttackerSpeciesForStep, walkRay } from 'editorV2/panels/condition_preview/shared/geometry_utils'
import {
  ROOK_RAY_STEPS, BISHOP_RAY_STEPS, QUEEN_RAY_STEPS,
  shieldingPositions, nextPositionOnRay
} from 'gameplay/board_query_utils'
import {
  matchesSide, candidatesForSide, applyOne,
  requirementsMet, MAX_SATISFY_ITERATIONS,
  boundSingularInActiveSet, singularPosition
} from './relation_helpers'
import { respectsAllCaps } from 'editorV2/panels/condition_preview/forward_proposition/respect_caps'

// Shield invariant: subjectSide.team === targetSide.team. Both are the "ally side"
// of the shield (shielder + shielded). The attacker is the inferred opposing team.

const SLIDER_SPECIES = new Set([Board.ROOK, Board.BISHOP, Board.QUEEN])

export function satisfyShield(relation, pieces, ctx, random) {
  if (relation.subjectSide.count_range.max === 0 || relation.targetSide.count_range.max === 0) {
    return pieces
  }
  if (shieldRequirementsMet(relation, pieces, ctx)) { return pieces }
  const variant = pickVariant(relation, ctx, random)
  let next = pieces
  for (let i = 0; i < MAX_SATISFY_ITERATIONS; i += 1) {
    if (shieldRequirementsMet(relation, next, ctx)) { return next }
    const placed = placeOneTriple(variant, relation, next, ctx, random)
    if (placed === null || placed === next) { return null }
    next = placed
  }
  return shieldRequirementsMet(relation, next, ctx) ? next : null
}

function placeOneTriple(variant, relation, pieces, ctx, random) {
  switch (variant) {
    case 'bound-as-target':   return tryAsTarget(relation, pieces, ctx, random, relation.targetSide.boundSingularActor)
    case 'bound-as-shielder': return tryAsShielder(relation, pieces, ctx, random, relation.subjectSide.boundSingularActor)
    case 'moved-as-target':   return tryAsTarget(relation, pieces, ctx, random, 'moved_piece')
    case 'moved-as-shielder': return tryAsShielder(relation, pieces, ctx, random, 'moved_piece')
    case 'moved-as-attacker': return tryAsAttacker(relation, pieces, ctx, random)
    default:                  return tryAsBystander(relation, pieces, ctx, random)
  }
}

function shieldRequirementsMet(relation, pieces, ctx) {
  const { activeSubjects, activeTargets } = activeShieldSets(relation, pieces)
  if (!boundSingularInActiveSet(relation.subjectSide, activeSubjects, ctx)) { return false }
  if (!boundSingularInActiveSet(relation.targetSide, activeTargets, ctx)) { return false }
  return requirementsMet({
    subjectSide: relation.subjectSide,
    targetSide: relation.targetSide,
    activeSubjects, activeTargets, pieces
  })
}

export function activeShieldSets(relation, pieces, board = null) {
  board = board ?? buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const activeSubjects = new Set()
  const activeTargets = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (!matchesSide(tPiece, relation.targetSide)) { continue }
    const shielders = shieldingPositions({ board, targetPosition: tPos, team: relation.targetSide.team })
    let hasMatch = false
    for (const sPos of shielders) {
      if (matchesSide(pieces.get(sPos), relation.subjectSide)) {
        activeSubjects.add(sPos)
        hasMatch = true
      }
    }
    if (hasMatch) { activeTargets.add(tPos) }
  }
  return { activeSubjects, activeTargets }
}

function pickVariant(relation, ctx, random) {
  // Bound-singular variants are forced — the relation REQUIRES the bound singular
  // play that role (its position is committed elsewhere). No bystander fallback.
  if (relation.subjectSide.boundSingularActor && singularPosition(ctx, relation.subjectSide.boundSingularActor) !== null) {
    return 'bound-as-shielder'
  }
  if (relation.targetSide.boundSingularActor && singularPosition(ctx, relation.targetSide.boundSingularActor) !== null) {
    return 'bound-as-target'
  }

  // Non-bound: existing moved_piece-bias dispatch for variety.
  const eligible = ['bystander']
  const movedPiece = ctx?.singulars?.moved_piece
  if (!movedPiece) { return 'bystander' }
  const movedSpecies = [...movedPiece.species_set][0]
  if (movedSpecies === null || movedSpecies === undefined) { return 'bystander' }

  const movedTeam = movedPiece.team
  const allySide = relation.subjectSide.team
  const enemySide = Board.opposingTeam(allySide)

  if (movedTeam === allySide) {
    if (relation.targetSide.species_set.has(movedSpecies))  { eligible.push('moved-as-target') }
    if (relation.subjectSide.species_set.has(movedSpecies)) { eligible.push('moved-as-shielder') }
  }
  if (movedTeam === enemySide && SLIDER_SPECIES.has(movedSpecies)) {
    eligible.push('moved-as-attacker')
  }
  return eligible[Math.floor(random() * eligible.length)]
}

function tryAsBystander(relation, pieces, ctx, random) {
  const attackerTeam = Board.opposingTeam(relation.targetSide.team)
  const targetCandidates = orderedTargetCandidates(relation, pieces, random)

  for (const target of targetCandidates) {
    const piecesWithTarget = applyOne(pieces, target, ctx)
    if (piecesWithTarget === null) { continue }

    for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
      const compatibleSliders = shieldAttackerSpeciesForStep(step)
      const lineSquares = walkRay(target.position, step)
      const placed = tryPlaceShielderAndAttackerFromTarget({
        relation, attackerTeam, compatibleSliders,
        lineSquares, pieces: piecesWithTarget, ctx, random
      })
      if (placed !== null) { return placed }
    }
  }
  return null
}

// α: coin-flip per call to mix Way A (multiple shielders for same target) and
// Way B (multiple shielders, each with a different target). 50% prefer existing
// matching targets first (Way A leaning); 50% prefer fresh targets first (Way B).
function orderedTargetCandidates(relation, pieces, random) {
  const all = candidatesForSide(relation.targetSide, pieces)
  const existing = all.filter(c => c.kind === 'existing')
  const fresh    = all.filter(c => c.kind === 'fresh')
  if (random() < 0.5) {
    return [...shuffled(existing, random), ...shuffled(fresh, random)]
  }
  return [...shuffled(fresh, random), ...shuffled(existing, random)]
}

function tryAsTarget(relation, pieces, ctx, random, actorKey) {
  const targetPos = singularPosition(ctx, actorKey)
  if (targetPos === null) { return null }
  const attackerTeam = Board.opposingTeam(relation.targetSide.team)

  for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
    const compatibleSliders = shieldAttackerSpeciesForStep(step)
    const lineSquares = walkRay(targetPos, step)
    const placed = tryPlaceShielderAndAttackerFromTarget({
      relation, attackerTeam, compatibleSliders,
      lineSquares, pieces, ctx, random
    })
    if (placed !== null) { return placed }
  }
  return null
}

function tryAsShielder(relation, pieces, ctx, random, actorKey) {
  const shielderPos = singularPosition(ctx, actorKey)
  if (shielderPos === null) { return null }
  const attackerTeam = Board.opposingTeam(relation.targetSide.team)

  for (const step of shuffled(QUEEN_RAY_STEPS, random)) {
    const compatibleSliders = shieldAttackerSpeciesForStep(step)
    const towardTarget = walkRay(shielderPos, -step)
    const towardAttacker = walkRay(shielderPos, step)
    const placed = tryPlaceTargetAndAttackerFromShielder({
      relation, attackerTeam, compatibleSliders,
      towardTarget, towardAttacker, pieces, ctx, random
    })
    if (placed !== null) { return placed }
  }
  return null
}

function tryAsAttacker(relation, pieces, ctx, random) {
  const attackerPos = singularPosition(ctx, 'moved_piece')
  if (attackerPos === null) { return null }
  const movedSpecies = [...ctx.singulars.moved_piece.species_set][0]
  const attackerSteps = stepsForSliderSpecies(movedSpecies)

  for (const step of shuffled(attackerSteps, random)) {
    const lineSquares = walkRay(attackerPos, step)
    const placed = tryPlaceShielderAndTargetFromAttacker({
      relation, lineSquares, pieces, ctx, random
    })
    if (placed !== null) { return placed }
  }
  return null
}

function tryPlaceShielderAndAttackerFromTarget({
  relation, attackerTeam, compatibleSliders, lineSquares, pieces, ctx, random
}) {
  for (let shielderIdx = 0; shielderIdx < lineSquares.length - 1; shielderIdx += 1) {
    if (!squaresEmpty(lineSquares, 0, shielderIdx, pieces)) { continue }

    const shielderPos = lineSquares[shielderIdx]
    const existingShielder = pieces.get(shielderPos)
    if (existingShielder && !matchesSide(existingShielder, relation.subjectSide)) { continue }

    for (let attackerIdx = shielderIdx + 1; attackerIdx < lineSquares.length; attackerIdx += 1) {
      if (!squaresEmpty(lineSquares, shielderIdx + 1, attackerIdx, pieces)) { continue }

      const attackerPos = lineSquares[attackerIdx]
      const existingAttacker = pieces.get(attackerPos)
      if (existingAttacker && !validAttacker(existingAttacker, attackerTeam, compatibleSliders)) {
        continue
      }

      let next = pieces
      if (!existingShielder) {
        next = placeForRole({ side: relation.subjectSide, pos: shielderPos, ctx, pieces: next, random })
        if (next === null) { continue }
      }
      if (!existingAttacker) {
        next = placeForAttacker({ team: attackerTeam, sliders: compatibleSliders, pos: attackerPos, ctx, pieces: next, random })
        if (next === null) { continue }
      }
      if (next === pieces) { continue }
      return next
    }
  }
  return null
}

function tryPlaceTargetAndAttackerFromShielder({
  relation, attackerTeam, compatibleSliders, towardTarget, towardAttacker, pieces, ctx, random
}) {
  for (let targetIdx = 0; targetIdx < towardTarget.length; targetIdx += 1) {
    if (!squaresEmpty(towardTarget, 0, targetIdx, pieces)) { continue }
    const targetPos = towardTarget[targetIdx]
    const existingTarget = pieces.get(targetPos)
    if (existingTarget && !matchesSide(existingTarget, relation.targetSide)) { continue }

    for (let attackerIdx = 0; attackerIdx < towardAttacker.length; attackerIdx += 1) {
      if (!squaresEmpty(towardAttacker, 0, attackerIdx, pieces)) { continue }
      const attackerPos = towardAttacker[attackerIdx]
      const existingAttacker = pieces.get(attackerPos)
      if (existingAttacker && !validAttacker(existingAttacker, attackerTeam, compatibleSliders)) {
        continue
      }

      let next = pieces
      if (!existingTarget) {
        next = placeForRole({ side: relation.targetSide, pos: targetPos, ctx, pieces: next, random })
        if (next === null) { continue }
      }
      if (!existingAttacker) {
        next = placeForAttacker({ team: attackerTeam, sliders: compatibleSliders, pos: attackerPos, ctx, pieces: next, random })
        if (next === null) { continue }
      }
      if (next === pieces) { continue }
      return next
    }
  }
  return null
}

function tryPlaceShielderAndTargetFromAttacker({
  relation, lineSquares, pieces, ctx, random
}) {
  for (let shielderIdx = 0; shielderIdx < lineSquares.length - 1; shielderIdx += 1) {
    if (!squaresEmpty(lineSquares, 0, shielderIdx, pieces)) { continue }

    const shielderPos = lineSquares[shielderIdx]
    const existingShielder = pieces.get(shielderPos)
    if (existingShielder && !matchesSide(existingShielder, relation.subjectSide)) { continue }

    for (let targetIdx = shielderIdx + 1; targetIdx < lineSquares.length; targetIdx += 1) {
      if (!squaresEmpty(lineSquares, shielderIdx + 1, targetIdx, pieces)) { continue }
      const targetPos = lineSquares[targetIdx]
      const existingTarget = pieces.get(targetPos)
      if (existingTarget && !matchesSide(existingTarget, relation.targetSide)) { continue }

      let next = pieces
      if (!existingShielder) {
        next = placeForRole({ side: relation.subjectSide, pos: shielderPos, ctx, pieces: next, random })
        if (next === null) { continue }
      }
      if (!existingTarget) {
        next = placeForRole({ side: relation.targetSide, pos: targetPos, ctx, pieces: next, random })
        if (next === null) { continue }
      }
      if (next === pieces) { continue }
      return next
    }
  }
  return null
}

function placeForRole({ side, pos, ctx, pieces, random }) {
  const species = pickSpeciesFromSet(side.species_set, pos, random)
  if (species === null) { return null }
  if (!respectsAllCaps(side.team, species, pos, ctx, pieces)) { return null }
  return placePiece(pieces, pos, pieceCode(side.team, species))
}

function placeForAttacker({ team, sliders, pos, ctx, pieces, random }) {
  const species = pickSpeciesFromSet(new Set(sliders), pos, random)
  if (species === null) { return null }
  if (!respectsAllCaps(team, species, pos, ctx, pieces)) { return null }
  return placePiece(pieces, pos, pieceCode(team, species))
}

function squaresEmpty(squares, fromIdx, untilIdx, pieces) {
  for (let i = fromIdx; i < untilIdx; i += 1) {
    if (pieces.has(squares[i])) { return false }
  }
  return true
}

function validAttacker(piece, attackerTeam, compatibleSliders) {
  return Board.parseTeam(piece) === attackerTeam && compatibleSliders.includes(Board.parseSpecies(piece))
}

function pickSpeciesFromSet(speciesSet, position, random) {
  const filtered = new Set([...speciesSet].filter(s => s !== null && legalPlacementForSpecies(position, s)))
  if (filtered.size === 0) { return null }
  return pickWeightedSpecies(filtered, random)
}

function stepsForSliderSpecies(species) {
  if (species === Board.ROOK)   { return ROOK_RAY_STEPS }
  if (species === Board.BISHOP) { return BISHOP_RAY_STEPS }
  if (species === Board.QUEEN)  { return QUEEN_RAY_STEPS }
  return []
}

