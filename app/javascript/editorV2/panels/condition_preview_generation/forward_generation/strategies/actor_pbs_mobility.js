// Strategy for ACTOR_PBS_MOBILITY (M6).
//
// MVP scope: subject.actor === 'moved_piece'. The mover IS the piece whose
// mobility is constrained, so engineering is "place the piece at two
// positions whose mobilities match (nPrior, nCurrent), with a legal move
// connecting them." Bystander mobility (subject is some other actor whose
// mobility changes due to mover's blocking/unblocking) is deferred.

import Rules from 'gameplay/rules'
import {
  pieceCode, clonePiecesMap
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { piecesIntoBoard } from '../hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))
const MAX_SPECIES_ATTEMPTS = 4
const MAX_POSITION_CANDIDATES = 12

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

function mobilityAt(pieces, position, movingTeam) {
  const board = piecesIntoBoard(pieces, movingTeam)
  return Rules.availableMovesFrom({ board, startPosition: position }).length
}

export function actorPbsMobilityStrategy(pieces, hint, ctx) {
  if (hint.actor !== 'moved_piece') { return null }
  const { random, movingTeam, priorPieces } = ctx
  const speciesPool = hint.speciesPool ?? []
  if (speciesPool.length === 0) { return null }

  for (let s = 0; s < MAX_SPECIES_ATTEMPTS; s += 1) {
    const species = pickRandom(shuffled(speciesPool, random), random)
    if (!species) { continue }

    const currentCandidates = shuffled(
      ALL_POSITIONS.filter(p => !pieces.has(p)), random
    ).slice(0, MAX_POSITION_CANDIDATES)

    for (const currentPos of currentCandidates) {
      const currentTrial = placePiece(pieces, currentPos, pieceCode(hint.team, species))
      if (!currentTrial) { continue }
      if (mobilityAt(currentTrial, currentPos, movingTeam) !== hint.nCurrent) { continue }

      const priorCandidates = shuffled(
        ALL_POSITIONS.filter(p => p !== currentPos && !priorPieces.has(p)), random
      ).slice(0, MAX_POSITION_CANDIDATES)

      for (const priorPos of priorCandidates) {
        const priorTrial = placePiece(priorPieces, priorPos, pieceCode(hint.team, species))
        if (!priorTrial) { continue }
        if (mobilityAt(priorTrial, priorPos, movingTeam) !== hint.nPrior) { continue }

        // Verify legal move from priorPos to currentPos for this species via
        // the actual move-construction. Build a trial prior board.
        const priorBoard = piecesIntoBoard(priorTrial, movingTeam)
        let moveObject
        try { moveObject = Rules.getMoveObject(priorPos, currentPos, priorBoard) } catch { continue }
        if (moveObject.illegal) { continue }

        priorPieces.clear()
        for (const [p, piece] of priorTrial.entries()) { priorPieces.set(p, piece) }
        return currentTrial
      }
    }
  }
  return null
}
