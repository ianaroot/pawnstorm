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
  pieceCode, clonePiecesMap
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'

const ALL_RAY_STEPS = Object.freeze([...ROOK_RAY_STEPS, ...BISHOP_RAY_STEPS])
const OUTER_ATTEMPTS = 3
const TARGET_POS_CANDIDATES = 4
const MAX_SLIDER_DISTANCE = 6

function shuffled(values, random) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickRandom(values, random) {
  if (!values || values.length === 0) { return null }
  return values[Math.floor(random() * values.length)]
}

function sliderSpeciesForRay(step, random) {
  const isOrthogonal = ROOK_RAY_STEPS.includes(step)
  const candidates = isOrthogonal ? [Board.ROOK, Board.QUEEN] : [Board.BISHOP, Board.QUEEN]
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

  for (let attempt = 0; attempt < OUTER_ATTEMPTS; attempt += 1) {
    const targetSpecies = pickRandom(shuffled(targetSpeciesPool, random), random)
    const subjectSpecies = pickRandom(shuffled(subjectSpeciesPool, random), random)
    if (!targetSpecies || !subjectSpecies) { continue }

    const targetCandidates = shuffled(
      Array.from({ length: 64 }, (_, i) => i).filter(p => !pieces.has(p)),
      random
    ).slice(0, TARGET_POS_CANDIDATES)

    for (const targetPos of targetCandidates) {
      for (const step of shuffled([...ALL_RAY_STEPS], random)) {
        const bystanderPos = nextPositionOnRay(targetPos, step)
        if (bystanderPos === null) { continue }
        if (pieces.has(bystanderPos)) { continue }

        const sliderSpecies = sliderSpeciesForRay(step, random)
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

        for (const finalSliderPos of shuffled(sliderCandidates, random)) {
          let current = pieces
          current = placePiece(current, targetPos, pieceCode(hint.target.team, targetSpecies))
          if (!current) { continue }
          current = placePiece(current, bystanderPos, pieceCode(hint.subject.team, subjectSpecies))
          if (!current) { continue }
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

            return current
          }
        }
      }
    }
  }
  return null
}
