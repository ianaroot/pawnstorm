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
  pieceCode, clonePiecesMap, ALL_POSITIONS, shuffled, pickRandom
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { piecesIntoBoard, subjectsRelatedToTarget } from '../hint_compiler'
import { respectsInventoryCaps } from '../inventory_protocol'

// Aggressive bounds. The orchestrator runs the resolver up to ~200 times, so a
// failing strategy still gets many fresh-RNG retries — we don't need to
// exhaust every combination on a single call.
const MAX_OUTER_ATTEMPTS = 3
const CURRENT_POS_CANDIDATES = 4
const PRIOR_POS_CANDIDATES = 4
const ATTACKER_PLACEMENT_ATTEMPTS = 15



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
  const subjectTeam = hint.subject.team

  // Mover species pool: intersect ctx.movedPiece.species_set with hint's target
  // pool. Sibling plans' moved_piece species constraints flow through ctx.
  const hintPool = hint.target.speciesPool ?? []
  const movedSpeciesPool = [...ctx.movedPiece.species_set].filter(s => s !== null && hintPool.includes(s))
  if (movedSpeciesPool.length === 0) { return null }

  // The board state at strategy time has seed pieces + kings. We'll layer the
  // moved_piece + attackers on top of it, mutating both the current `pieces`
  // map and ctx.priorPieces.
  for (let attempt = 0; attempt < MAX_OUTER_ATTEMPTS; attempt += 1) {
    const movedSpecies = pickRandom(shuffled(movedSpeciesPool, random), random)
    if (!movedSpecies) { continue }

    // Pick a current position that's free in pieces (after kings placed).
    // Filter by ctx.movedPiece.position_set so sibling position constraints
    // flow through.
    const movedPositionSet = ctx.movedPiece?.position_set
    const positionCandidates = movedPositionSet
      ? [...movedPositionSet].filter(p => !pieces.has(p))
      : ALL_POSITIONS.filter(p => !pieces.has(p))
    const candidateCurrent = shuffled(positionCandidates, random)

    if (!respectsInventoryCaps(movingTeam, movedSpecies, pieces, ctx, 'current')) { continue }
    if (!respectsInventoryCaps(movingTeam, movedSpecies, priorPieces, ctx, 'prior')) { continue }

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
          random,
          ctx
        })
        if (placement === null) { continue }

        // Mutate ctx.priorPieces so the resolver's downstream reconstruction
        // sees the engineered prior. (priorPieces was a clone, mutation is
        // safe.)
        priorPieces.clear()
        for (const [p, piece] of placement.priorPieces.entries()) {
          priorPieces.set(p, piece)
        }
        // The committed mover species is the moved_piece. Narrow ctx so
        // sibling strategies see the commit.
        ctx.movedPiece.species_set.clear()
        ctx.movedPiece.species_set.add(movedSpecies)
        ctx.movedPiece.position_set.clear()
        ctx.movedPiece.position_set.add(currentPos)
        return placement.currentPieces
      }
    }
  }
  return null
}

function engineerAttackers({ currentBase, priorBase, currentPos, priorPos, hint, subjectTeam, movingTeam, random, ctx }) {
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

    if (!respectsInventoryCaps(subjectTeam, species, current, ctx, 'current')) { continue }
    if (!respectsInventoryCaps(subjectTeam, species, prior, ctx, 'prior')) { continue }

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
