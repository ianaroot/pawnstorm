import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { MOVE_KIND_EN_PASSANT, candidateIdentity } from '../shared/example_utils'
import {
  clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout, placeKingsIfAbsent, shuffled
} from '../shared/board_utils'
import { buildSeedFromPreset, enPassantPresetsForTeam } from '../seeds/seed_builder'
import { Candidate } from '../shared/candidate'

// Constructs prior+after directly from the preset, mirroring castle and
// promotion. Bypasses collectVerifiedExamples (whose variant filter was
// rejecting en-passant in the common case where moved_piece's endPosition
// isn't in the relation — captured_piece sits at a different square in
// en-passant by definition).

export function collectEnPassantExamples({ combinedPlan, random, maxExamples }) {
  const presets = shuffled(enPassantPresetsForTeam(combinedPlan.movingTeam), random)
  const examples = []
  const seen = new Set()
  const movingTeam = combinedPlan.movingTeam
  const enemyTeam = Board.opposingTeam(movingTeam)
  const moverPiece = `${movingTeam}${Board.PAWN}`
  const enemyPawn = `${enemyTeam}${Board.PAWN}`
  const dir = movingTeam === Board.BLACK ? 1 : -1

  for (const preset of presets) {
    if (examples.length >= maxExamples) { break }

    const seed = buildSeedFromPreset(combinedPlan, preset, MOVE_KIND_EN_PASSANT, random)
    if (!seed) { continue }

    const piecesWithKings = placeKingsIfAbsent(seed.pieces, random)
    if (!piecesWithKings) { continue }

    // The preset's only fixed piece is the mover at destSquare on the after-board.
    const destSquare = preset.fixedPieces.keys().next().value
    if (piecesWithKings.get(destSquare) !== moverPiece) { continue }
    const capturedSquare = preset.recentMoveContext.movedPieceEndPosition

    // placeKingsIfAbsent doesn't know about preset.reservedSquares, so a king
    // can land on capturedSquare. Overwriting it with the captured pawn would
    // produce a kingless board. Skip this preset attempt; the next iteration
    // gets fresh RNG.
    if (piecesWithKings.has(capturedSquare)) { continue }

    const afterLayout = buildLayoutFromPieces(piecesWithKings)

    const file = destSquare % 8
    const originCandidates = []
    if (file > 0) { originCandidates.push(destSquare + 8 * dir - 1) }
    if (file < 7) { originCandidates.push(destSquare + 8 * dir + 1) }

    for (const origin of shuffled(originCandidates, random)) {
      if (examples.length >= maxExamples) { break }
      // Skip if origin is occupied by something other than the (about-to-move) pawn.
      // The destSquare gets cleared and re-set; origin must be empty in piecesWithKings.
      if (piecesWithKings.has(origin) && origin !== destSquare) { continue }

      const priorPieces = clonePiecesMap(piecesWithKings)
      priorPieces.delete(destSquare)
      priorPieces.set(origin, moverPiece)
      priorPieces.set(capturedSquare, enemyPawn)

      const priorBoard = buildBoardFromLayout(
        buildLayoutFromPieces(priorPieces),
        preset.recentMoveContext,
        movingTeam
      )

      let moveObject
      try { moveObject = Rules.getMoveObject(origin, destSquare, priorBoard) }
      catch { continue }
      // Real en-passant has additionalActions (removing the captured pawn at
      // capturedSquare). If Rules didn't recognize this as en-passant, skip.
      if (!moveObject.additionalActions) { continue }

      const candidate = new Candidate({ combinedPlan, priorBoard, moveObject })
      if (!candidate.isVerified()) { continue }
      if (!candidate.matchesLayout(afterLayout)) { continue }

      const example = candidate.buildExample({
        generationPath: 'en-passant',
        geometryKey: seed.geometryKey,
        moveKind: MOVE_KIND_EN_PASSANT
      })
      if (!example) { continue }

      const identity = candidateIdentity(example)
      if (seen.has(identity)) { continue }
      seen.add(identity)
      examples.push(example)
    }
  }

  return examples
}
