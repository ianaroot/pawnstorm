// Strategy for RELATION_PBS_COUNT { operator, subject, target, side, direction, nPrior, nCurrent }.
//
// Engineers a state where the count of distinct pieces on `side` involved in
// qualifying (subject, target) pairs is `nPrior` on the prior board and
// `nCurrent` on the current board, satisfying the descriptor's direction.
//
// MVP shape (M4a): target.actor === 'moved_piece' AND side === 'subject'. The
// move is moved_piece going from priorPos to currentPos; attackers are
// stationary; the count change comes from moved_piece's position change
// affecting which attackers reach it.
//
// Other shapes (subject is moved_piece; bystander-blocking-induced changes)
// arrive in M4b.

import {
  pieceCode, clonePiecesMap
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { piecesIntoBoard, subjectsRelatedToTarget } from '../hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))
// Aggressive bounds. The orchestrator runs the resolver up to ~200 times, so a
// failing strategy still gets many fresh-RNG retries — we don't need to
// exhaust every combination on a single call.
const OUTER_ATTEMPTS = 3
const CURRENT_POS_CANDIDATES = 4
const PRIOR_POS_CANDIDATES = 4
const ATTACKER_PLACEMENT_ATTEMPTS = 15

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

// Count subjects from `subjectTeam` reaching `targetPos` on the given board
// via `operator`. Equivalent to `qualifyingPairs` count but with a single
// target position.
function attackersOf({ pieces, operator, targetPos, subjectTeam, movingTeam }) {
  const board = piecesIntoBoard(pieces, movingTeam)
  return subjectsRelatedToTarget({
    board, operator, targetPosition: targetPos, subjectTeam
  }).length
}

export function relationPbsCountStrategy(pieces, hint, ctx) {
  // MVP scope.
  if (hint.target.actor !== 'moved_piece' || hint.side !== 'subject') { return null }
  if (hint.operator !== 'attack' && hint.operator !== 'defend') { return null }

  const { random, movingTeam, priorPieces } = ctx
  const movedSpeciesPool = hint.target.speciesPool ?? []
  const subjectTeam = hint.subject.team

  if (movedSpeciesPool.length === 0) { return null }

  // The board state at strategy time has seed pieces + kings. We'll layer the
  // moved_piece + attackers on top of it, mutating both the current `pieces`
  // map and ctx.priorPieces.
  for (let attempt = 0; attempt < OUTER_ATTEMPTS; attempt += 1) {
    const movedSpecies = pickRandom(shuffled(movedSpeciesPool, random), random)
    if (!movedSpecies) { continue }

    // Pick a current position that's free in pieces (after kings placed).
    const candidateCurrent = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)), random
    )

    for (const currentPos of candidateCurrent.slice(0, CURRENT_POS_CANDIDATES)) {
      // Place moved_piece in current.
      const currentWithMover = placePiece(pieces, currentPos, pieceCode(movingTeam, movedSpecies))
      if (!currentWithMover) { continue }

      // Pick a prior position that's free in priorPieces (which == pieces seed
      // state at this point, since no PBS strategy has run yet).
      const candidatePrior = shuffled(
        ALL_POSITIONS.filter(p => p !== currentPos && !priorPieces.has(p)), random
      )

      for (const priorPos of candidatePrior.slice(0, PRIOR_POS_CANDIDATES)) {
        const priorWithMover = placePiece(priorPieces, priorPos, pieceCode(movingTeam, movedSpecies))
        if (!priorWithMover) { continue }

        // Now place subject-side attackers reaching currentPos in current.
        // We want exactly nCurrent attackers reaching currentPos AND nPrior
        // of those same attackers also reaching priorPos.
        const placement = engineerAttackers({
          currentBase: currentWithMover,
          priorBase: priorWithMover,
          currentPos,
          priorPos,
          hint,
          subjectTeam,
          movingTeam,
          random
        })
        if (placement === null) { continue }

        // Mutate ctx.priorPieces so the resolver's downstream reconstruction
        // sees the engineered prior. (priorPieces was a clone, mutation is
        // safe.)
        priorPieces.clear()
        for (const [p, piece] of placement.priorPieces.entries()) {
          priorPieces.set(p, piece)
        }
        return placement.currentPieces
      }
    }
  }
  return null
}

function engineerAttackers({ currentBase, priorBase, currentPos, priorPos, hint, subjectTeam, movingTeam, random }) {
  // Iteratively add subjects until current count = nCurrent. After each
  // addition, check that prior count is on track toward nPrior. If we'd
  // overshoot prior, skip that placement and try another.
  const subjectSpeciesPool = hint.subject.speciesPool ?? []
  if (subjectSpeciesPool.length === 0) { return null }

  let current = clonePiecesMap(currentBase)
  let prior = clonePiecesMap(priorBase)

  let currentCount = attackersOf({ pieces: current, operator: hint.operator, targetPos: currentPos, subjectTeam, movingTeam })
  let priorCount = attackersOf({ pieces: prior, operator: hint.operator, targetPos: priorPos, subjectTeam, movingTeam })

  if (currentCount === hint.nCurrent && priorCount === hint.nPrior) {
    return { currentPieces: current, priorPieces: prior }
  }

  for (let i = 0; i < ATTACKER_PLACEMENT_ATTEMPTS && (currentCount !== hint.nCurrent || priorCount !== hint.nPrior); i += 1) {
    const species = pickRandom(shuffled(subjectSpeciesPool, random), random)
    const candidatePos = pickRandom(
      shuffled(ALL_POSITIONS.filter(p => !current.has(p) && !prior.has(p) && p !== currentPos && p !== priorPos), random),
      random
    )
    if (species === null || candidatePos === null) { return null }

    const trialCurrent = placePiece(current, candidatePos, pieceCode(subjectTeam, species))
    const trialPrior = placePiece(prior, candidatePos, pieceCode(subjectTeam, species))
    if (!trialCurrent || !trialPrior) { continue }

    const newCurrentCount = attackersOf({ pieces: trialCurrent, operator: hint.operator, targetPos: currentPos, subjectTeam, movingTeam })
    const newPriorCount = attackersOf({ pieces: trialPrior, operator: hint.operator, targetPos: priorPos, subjectTeam, movingTeam })

    // Don't let either overshoot.
    if (newCurrentCount > hint.nCurrent || newPriorCount > hint.nPrior) { continue }

    // Accept if it makes progress toward at least one target.
    if (newCurrentCount > currentCount || newPriorCount > priorCount) {
      current = trialCurrent
      prior = trialPrior
      currentCount = newCurrentCount
      priorCount = newPriorCount
    }
  }

  if (currentCount === hint.nCurrent && priorCount === hint.nPrior) {
    return { currentPieces: current, priorPieces: prior }
  }
  return null
}
