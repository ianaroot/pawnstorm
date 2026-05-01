// Strategy for ACTOR_COUNT { actor, team, filter, speciesPool, countOp, n, frame }.
//
// Augments `pieces` so that the count of pieces matching team + filter
// satisfies (countOp, n). Adds matching pieces at random unoccupied squares.
// If the chain requires fewer pieces than already present, returns null.

import {
  pieceCode
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import { compareValue, pieceMatchesFilter } from '../hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))

function shuffled(values, random) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function neededAdditions(countOp, n, current) {
  switch (countOp) {
    case 'equal_to':                 return current > n ? null : n - current
    case 'greater_than':             return n + 1 - current
    case 'greater_than_or_equal_to': return n - current
    case 'less_than':
    case 'less_than_or_equal_to':    return null
    default:                         return null
  }
}

export function actorCountStrategy(pieces, hint, ctx) {
  if (hint.frame !== 'current') { return null }

  let currentCount = 0
  for (const [, piece] of pieces.entries()) {
    if (piece.charAt(0) !== hint.team) { continue }
    if (!pieceMatchesFilter(piece.slice(1), hint.filter, hint.filterMode)) { continue }
    currentCount += 1
  }

  if (compareValue(currentCount, hint.countOp, hint.n)) { return pieces }

  const additions = neededAdditions(hint.countOp, hint.n, currentCount)
  if (additions === null || additions <= 0) { return null }

  const speciesCandidates = shuffled([...(hint.speciesPool ?? [])], ctx.random)
  if (speciesCandidates.length === 0) { return null }

  let result = pieces
  for (let i = 0; i < additions; i += 1) {
    let placed = false
    for (const species of speciesCandidates) {
      for (const pos of shuffled([...ALL_POSITIONS], ctx.random)) {
        if (result.has(pos)) { continue }
        const next = placePiece(result, pos, pieceCode(hint.team, species))
        if (!next) { continue }
        result = next
        placed = true
        break
      }
      if (placed) { break }
    }
    if (!placed) { return null }
  }
  return result
}
