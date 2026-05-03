// Strategy for ACTOR_PBS_MOBILITY (M6).
//
// MVP scope: subject.actor === 'moved_piece'. The mover IS the piece whose
// mobility is constrained, so engineering is "place the piece at two
// positions whose mobilities match (nPrior, nCurrent), with a legal move
// connecting them." Bystander mobility (subject is some other actor whose
// mobility changes due to mover's blocking/unblocking) is deferred.

import Rules from 'gameplay/rules'
import {
  pieceCode, clonePiecesMap, ALL_POSITIONS, shuffled, pickRandom
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { piecesIntoBoard } from '../hint_compiler'
import { respectsInventoryCaps } from '../inventory_protocol'

const MAX_SPECIES_ATTEMPTS = 4
const MAX_POSITION_CANDIDATES = 12



function mobilityAt(pieces, position, movingTeam) {
  const board = piecesIntoBoard(pieces, movingTeam)
  return Rules.availableMovesFrom({ board, startPosition: position }).length
}

export function actorPbsMobilityStrategy(pieces, hint, ctx) {
  if (hint.actor !== 'moved_piece') { return null }
  const { random, movingTeam, priorPieces } = ctx
  // Mover species pool: intersect ctx.movedPiece.species_set with hint's pool.
  const hintPool = hint.speciesPool ?? []
  const speciesPool = [...ctx.movedPiece.species_set].filter(s => s !== null && hintPool.includes(s))
  if (speciesPool.length === 0) { return null }

  for (let s = 0; s < MAX_SPECIES_ATTEMPTS; s += 1) {
    const species = pickRandom(shuffled(speciesPool, random), random)
    if (!species) { continue }

    if (!respectsInventoryCaps(hint.team, species, pieces, ctx, 'current')) { continue }
    if (!respectsInventoryCaps(hint.team, species, priorPieces, ctx, 'prior')) { continue }

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
        // Narrow ctx.movedPiece species_set + position_set to the committed
        // mover species and current-board position.
        ctx.movedPiece.species_set.clear()
        ctx.movedPiece.species_set.add(species)
        ctx.movedPiece.position_set.clear()
        ctx.movedPiece.position_set.add(currentPos)
        return currentTrial
      }
    }
  }
  return null
}
