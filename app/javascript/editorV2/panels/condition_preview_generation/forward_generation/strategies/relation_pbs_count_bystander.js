// Strategy for RELATION_PBS_COUNT — bystander-blocking case (M4b).
//
// Handles chains where neither subject nor target is moved_piece, and the
// count change comes from an allied slider's move installing a shielding
// line. Specifically:
//   - operator === 'shield'
//   - subject and target are bystanders (enemy pieces, typically)
//   - direction '+' with nPrior = 0
//
// Engineering recipe:
//   - Place enemy target T at a random square.
//   - Pick a ray from T; place enemy subject B at the next square along.
//   - Pick S beyond B on the same ray.
//   - Place an allied slider (rook/bishop/queen) at S. The slider attacks T
//     through B, so B is now shielding T. Current count >= 1.
//   - Pick origin O on the slider's move-range from S. In prior, slider at O,
//     not at S — no shielding line exists, prior count = 0.
//   - Move = slider from O to S.
//
// Verify pass confirms the count predicate; resolver derives the move from
// the diff between prior and current.
//
// Other shapes (direction '=', '-', non-zero nPrior, attack/defend bystander)
// are deferred. Strategy returns null for cases it doesn't handle and falls
// back to the move-first strategy or to reverse-gen.

import Board from 'gameplay/board'
import {
  ROOK_RAY_STEPS, BISHOP_RAY_STEPS, nextPositionOnRay
} from 'gameplay/board_query_utils'
import {
  pieceCode, clonePiecesMap, shuffled, pickRandom, ALL_POSITIONS
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { respectsInventoryCaps } from '../inventory_protocol'

const ALL_RAY_STEPS = Object.freeze([...ROOK_RAY_STEPS, ...BISHOP_RAY_STEPS])
const MAX_OUTER_ATTEMPTS = 3
const TARGET_POS_CANDIDATES = 4
const MAX_SLIDER_DISTANCE = 6



// Pick a slider species compatible with the ray AND with the converged
// ctx.movedPiece.species_set (the slider IS the mover). Returns null if no
// valid intersection.
function sliderSpeciesForRay(step, random, ctx) {
  const isOrthogonal = ROOK_RAY_STEPS.includes(step)
  const baseCandidates = isOrthogonal ? [Board.ROOK, Board.QUEEN] : [Board.BISHOP, Board.QUEEN]
  const candidates = baseCandidates.filter(s => ctx.movedPiece.species_set.has(s))
  if (candidates.length === 0) { return null }
  return pickRandom(shuffled(candidates, random), random)
}

// Origin candidates for a slider currently at finalPos: any square along the
// slider's rays from finalPos that's empty in `pieces`. Capped by distance.
function sliderOriginCandidates({ finalPos, sliderSpecies, pieces }) {
  const steps = sliderSpecies === Board.ROOK ? ROOK_RAY_STEPS
    : sliderSpecies === Board.BISHOP ? BISHOP_RAY_STEPS
    : ALL_RAY_STEPS
  const origins = []
  for (const step of steps) {
    let current = finalPos
    for (let dist = 1; dist <= MAX_SLIDER_DISTANCE; dist += 1) {
      current = nextPositionOnRay(current, step)
      if (current === null) { break }
      if (pieces.has(current)) { break }
      origins.push(current)
    }
  }
  return origins
}

export function relationPbsCountBystanderStrategy(pieces, hint, ctx) {
  if (hint.operator !== 'shield') { return null }
  if (hint.subject.actor === 'moved_piece' || hint.target.actor === 'moved_piece') { return null }
  if (hint.direction !== '+') { return null }
  if (hint.nPrior !== 0) { return null }
  if (hint.nCurrent < 1) { return null }

  const { random, movingTeam, priorPieces } = ctx
  const targetSpeciesPool = hint.target.speciesPool ?? []
  const subjectSpeciesPool = hint.subject.speciesPool ?? []
  if (targetSpeciesPool.length === 0 || subjectSpeciesPool.length === 0) { return null }

  for (let attempt = 0; attempt < MAX_OUTER_ATTEMPTS; attempt += 1) {
    const targetSpecies = pickRandom(shuffled(targetSpeciesPool, random), random)
    const subjectSpecies = pickRandom(shuffled(subjectSpeciesPool, random), random)
    if (!targetSpecies || !subjectSpecies) { continue }

    const targetCandidates = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)),
      random
    ).slice(0, TARGET_POS_CANDIDATES)

    for (const targetPos of targetCandidates) {
      for (const step of shuffled([...ALL_RAY_STEPS], random)) {
        const bystanderPos = nextPositionOnRay(targetPos, step)
        if (bystanderPos === null) { continue }
        if (pieces.has(bystanderPos)) { continue }

        const sliderSpecies = sliderSpeciesForRay(step, random, ctx)
        if (!sliderSpecies) { continue }

        // Walk past bystander to find slider final positions.
        const sliderCandidates = []
        let cursor = bystanderPos
        for (let dist = 1; dist <= MAX_SLIDER_DISTANCE; dist += 1) {
          cursor = nextPositionOnRay(cursor, step)
          if (cursor === null) { break }
          if (pieces.has(cursor)) { break }
          sliderCandidates.push(cursor)
        }

        // Filter slider candidates by ctx.movedPiece.position_set — the slider
        // IS the moved_piece, so its destination must be in the converged
        // position_set. Sibling plans (e.g. allied defends moved_piece) see
        // the same commitment.
        const movedPositionSet = ctx.movedPiece?.position_set
        const filteredSliderCandidates = movedPositionSet
          ? sliderCandidates.filter(p => movedPositionSet.has(p))
          : sliderCandidates
        for (const finalSliderPos of shuffled(filteredSliderCandidates, random)) {
          let current = pieces
          if (!respectsInventoryCaps(hint.target.team, targetSpecies, current, ctx, 'current')) { continue }
          current = placePiece(current, targetPos, pieceCode(hint.target.team, targetSpecies))
          if (!current) { continue }
          if (!respectsInventoryCaps(hint.subject.team, subjectSpecies, current, ctx, 'current')) { continue }
          current = placePiece(current, bystanderPos, pieceCode(hint.subject.team, subjectSpecies))
          if (!current) { continue }
          if (!respectsInventoryCaps(movingTeam, sliderSpecies, current, ctx, 'current')) { continue }
          current = placePiece(current, finalSliderPos, pieceCode(movingTeam, sliderSpecies))
          if (!current) { continue }

          const origins = sliderOriginCandidates({ finalPos: finalSliderPos, sliderSpecies, pieces: current })
          for (const origin of shuffled(origins, random)) {
            // Build prior: same as current with slider at origin instead of finalSliderPos.
            let prior = clonePiecesMap(current)
            prior.delete(finalSliderPos)
            const placed = placePiece(prior, origin, pieceCode(movingTeam, sliderSpecies))
            if (!placed) { continue }
            prior = placed

            // Mutate ctx.priorPieces in place.
            priorPieces.clear()
            for (const [p, piece] of prior.entries()) { priorPieces.set(p, piece) }

            // The slider is the moved_piece. Narrow ctx.movedPiece species_set
            // and position_set to the committed slider species and final
            // position so sibling strategies see the commit.
            ctx.movedPiece.species_set.clear()
            ctx.movedPiece.species_set.add(sliderSpecies)
            ctx.movedPiece.position_set.clear()
            ctx.movedPiece.position_set.add(finalSliderPos)

            return current
          }
        }
      }
    }
  }
  return null
}
