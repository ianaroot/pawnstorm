// Strategy for RELATION_PBS_AGGREGATE_VALUE (M5).
//
// Mirrors M4a's PBS count strategy with value bookkeeping. Same shape:
// target.actor === 'moved_piece' AND side === 'subject', operator attack or
// defend. The move is moved_piece going priorPos → currentPos; attackers are
// stationary; the value-sum delta comes from moved_piece's position change
// affecting which attackers reach it.

import { materialValue } from 'gameplay/board_query_utils'
import {
  pieceCode, clonePiecesMap, ALL_POSITIONS, shuffled, pickRandom
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { piecesIntoBoard, subjectsRelatedToTarget } from '../hint_compiler'

const MAX_OUTER_ATTEMPTS = 3
const CURRENT_POS_CANDIDATES = 4
const PRIOR_POS_CANDIDATES = 4
const ATTACKER_PLACEMENT_ATTEMPTS = 20



function valueOnSide({ pieces, operator, targetPos, subjectTeam, movingTeam, subjectPool }) {
  const board = piecesIntoBoard(pieces, movingTeam)
  const positions = subjectsRelatedToTarget({
    board, operator, targetPosition: targetPos, subjectTeam
  })
  let total = 0
  for (const pos of positions) {
    const piece = pieces.get(pos)
    if (!piece) { continue }
    const species = piece.slice(1)
    if (subjectPool && !subjectPool.includes(species)) { continue }
    total += materialValue(species)
  }
  return total
}

export function relationPbsAggregateValueStrategy(pieces, hint, ctx) {
  if (hint.target.actor !== 'moved_piece' || hint.side !== 'subject') { return null }
  if (hint.operator !== 'attack' && hint.operator !== 'defend') { return null }

  const { random, movingTeam, priorPieces } = ctx
  // Mover species pool: intersect ctx.movedPiece.species_set with hint's pool.
  const hintTargetPool = hint.target.speciesPool ?? []
  const movedSpeciesPool = [...ctx.movedPiece.species_set].filter(s => s !== null && hintTargetPool.includes(s))
  const subjectSpeciesPool = hint.subject.speciesPool ?? []
  const subjectTeam = hint.subject.team
  if (movedSpeciesPool.length === 0 || subjectSpeciesPool.length === 0) { return null }

  for (let attempt = 0; attempt < MAX_OUTER_ATTEMPTS; attempt += 1) {
    const movedSpecies = pickRandom(shuffled(movedSpeciesPool, random), random)
    if (!movedSpecies) { continue }

    const candidateCurrent = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)), random
    ).slice(0, CURRENT_POS_CANDIDATES)

    for (const currentPos of candidateCurrent) {
      const currentWithMover = placePiece(pieces, currentPos, pieceCode(movingTeam, movedSpecies))
      if (!currentWithMover) { continue }

      const candidatePrior = shuffled(
        ALL_POSITIONS.filter(p => p !== currentPos && !priorPieces.has(p)), random
      ).slice(0, PRIOR_POS_CANDIDATES)

      for (const priorPos of candidatePrior) {
        const priorWithMover = placePiece(priorPieces, priorPos, pieceCode(movingTeam, movedSpecies))
        if (!priorWithMover) { continue }

        const placement = engineerByValue({
          currentBase: currentWithMover,
          priorBase: priorWithMover,
          currentPos, priorPos, hint,
          subjectTeam, movingTeam, random,
          subjectPool: subjectSpeciesPool
        })
        if (placement === null) { continue }

        priorPieces.clear()
        for (const [p, piece] of placement.priorPieces.entries()) {
          priorPieces.set(p, piece)
        }
        // Narrow ctx.movedPiece species_set + position_set so sibling
        // strategies see the commit.
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

function engineerByValue({ currentBase, priorBase, currentPos, priorPos, hint, subjectTeam, movingTeam, random, subjectPool }) {
  let current = clonePiecesMap(currentBase)
  let prior = clonePiecesMap(priorBase)

  let currentValue = valueOnSide({ pieces: current, operator: hint.operator, targetPos: currentPos, subjectTeam, movingTeam, subjectPool })
  let priorValue = valueOnSide({ pieces: prior, operator: hint.operator, targetPos: priorPos, subjectTeam, movingTeam, subjectPool })

  if (currentValue === hint.vCurrent && priorValue === hint.vPrior) {
    return { currentPieces: current, priorPieces: prior }
  }

  for (let i = 0; i < ATTACKER_PLACEMENT_ATTEMPTS && (currentValue !== hint.vCurrent || priorValue !== hint.vPrior); i += 1) {
    // Pick a species whose value won't overshoot either target.
    const remainingCurrent = hint.vCurrent - currentValue
    const remainingPrior = hint.vPrior - priorValue
    const cap = Math.max(remainingCurrent, remainingPrior)
    const fitting = subjectPool.filter(s => {
      const v = materialValue(s)
      return v > 0 && v <= cap
    })
    if (fitting.length === 0) { return null }
    const species = pickRandom(shuffled(fitting, random), random)

    const candidatePos = pickRandom(
      shuffled(ALL_POSITIONS.filter(p =>
        !current.has(p) && !prior.has(p) && p !== currentPos && p !== priorPos
      ), random),
      random
    )
    if (species === null || candidatePos === null) { return null }

    const trialCurrent = placePiece(current, candidatePos, pieceCode(subjectTeam, species))
    const trialPrior = placePiece(prior, candidatePos, pieceCode(subjectTeam, species))
    if (!trialCurrent || !trialPrior) { continue }

    const newCurrentValue = valueOnSide({ pieces: trialCurrent, operator: hint.operator, targetPos: currentPos, subjectTeam, movingTeam, subjectPool })
    const newPriorValue = valueOnSide({ pieces: trialPrior, operator: hint.operator, targetPos: priorPos, subjectTeam, movingTeam, subjectPool })

    if (newCurrentValue > hint.vCurrent || newPriorValue > hint.vPrior) { continue }
    if (newCurrentValue > currentValue || newPriorValue > priorValue) {
      current = trialCurrent
      prior = trialPrior
      currentValue = newCurrentValue
      priorValue = newPriorValue
    }
  }

  if (currentValue === hint.vCurrent && priorValue === hint.vPrior) {
    return { currentPieces: current, priorPieces: prior }
  }
  return null
}
