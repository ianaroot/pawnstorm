import {
  pieceCode, legalPlacementForSpecies, pickWeightedSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { intersectRegions } from '../../region'
import { respectsAllCaps } from '../../respect_caps'

// Strict: only resolves the explicit related-to role binding.
// Shield reuses this for its strict path and adds attacker-role inference locally.
export function movedPieceRoleIn(entry) {
  const region = entry.currentProposition?.region
  if (region?.kind !== 'related-to') { return null }
  if (region.actor !== 'moved_piece') { return null }
  return region.role
}

// For region.kind === 'all', infers role from moved_piece's team+species
// matching subjectProposition or targetProposition. Two-role mechanisms
// (adjacent, attack/defend) compose this with movedPieceRoleIn via
// movedPieceRoleInOrInferred. Shield does not use this — its non-bound
// inference returns 'attacker'.
export function inferRoleFromPropositionMatch(entry, moved) {
  if (!moved) { return null }
  const movedSpecies = [...moved.species_set][0]
  if (movedSpecies === null || movedSpecies === undefined) { return null }
  if (matchesProposition(moved, movedSpecies, entry.subjectProposition)) { return 'subject' }
  if (matchesProposition(moved, movedSpecies, entry.targetProposition)) { return 'target' }
  return null
}

export function movedPieceRoleInOrInferred(entry, ctx) {
  const fromRelatedTo = movedPieceRoleIn(entry)
  if (fromRelatedTo !== null) { return fromRelatedTo }
  if (entry.currentProposition?.region?.kind !== 'all') { return null }
  return inferRoleFromPropositionMatch(entry, ctx?.singulars?.moved_piece)
}

// Returns the proposition on the side OPPOSITE moved_piece's role.
// Falls back to currentProposition (which, for related-to entries, IS
// the opposite side by construction).
export function otherSidePropositionFor(entry, role) {
  const candidate = role === 'subject' ? entry.targetProposition : entry.subjectProposition
  return candidate ?? entry.currentProposition ?? null
}

function matchesProposition(moved, movedSpecies, proposition) {
  if (!proposition) { return false }
  return moved.team === proposition.team && proposition.species_set.has(movedSpecies)
}

export function singularSquare(singular) {
  if (singular.region.kind !== 'set') { return null }
  if (singular.region.squares.size !== 1) { return null }
  return [...singular.region.squares][0]
}

export function placeableSpecies(speciesSet) {
  const result = []
  for (const s of speciesSet) {
    if (s === null) { continue }
    result.push(s)
  }
  return result
}

export function pickPlaceableSpecies(speciesSet, position, random) {
  const filtered = new Set([...speciesSet].filter(
    s => s !== null && legalPlacementForSpecies(position, s)
  ))
  if (filtered.size === 0) { return null }
  return pickWeightedSpecies(filtered, random)
}

// Rate at which mechanisms reject reusing an existing-fitting piece in favor
// of trying a different position with fresh placement (diversity-driven).
// Tunable.
export const EXISTING_REUSE_REJECTION_RATE = 0.25

// Ensures the given square holds a piece compatible with (team, speciesSet).
// If a compatible piece already exists, returns pieces unchanged most of the
// time; rejects (returns null) at EXISTING_REUSE_REJECTION_RATE so the
// caller's iteration tries a different position. Otherwise places a new one,
// validating respectsAllCaps. Returns null if no placement is possible.
export function ensureRolePieceAt({ pieces, pos, team, speciesSet, ctx, random }) {
  const existing = pieces.get(pos)
  if (existing) {
    if (random() < EXISTING_REUSE_REJECTION_RATE) { return null }
    return pieces
  }
  const species = pickPlaceableSpecies(speciesSet, pos, random)
  if (species === null) { return null }
  if (!respectsAllCaps(team, species, pos, ctx, pieces)) { return null }
  return placePiece(pieces, pos, pieceCode(team, species))
}

// Narrows moved_piece.priorRegion by intersecting with `candidates`. Returns
// `pieces` (mutating ctx's priorRegion) when the intersection is non-empty,
// or null when the narrowing leaves no valid origin.
export function commitPriorRegion(ctx, candidates, pieces) {
  const proposed = { kind: 'set', squares: new Set(candidates) }
  const moved = ctx.singulars.moved_piece
  const intersected = intersectRegions(moved.priorRegion, proposed)
  if (intersected.kind === 'set' && intersected.squares.size === 0) { return null }
  moved.priorRegion = intersected
  return pieces
}
