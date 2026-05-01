// Strategy for RELATION_COUNT { operator, subject, target, side, countOp, n, frame }.
//
// Augments `pieces` so that the count of distinct positions on `side` involved
// in qualifying (subject, target) pairs satisfies (countOp, n).
//
// Approach: incrementally add a new qualifying piece on the chosen side,
// anchored to an existing piece on the opposite side, until the predicate is
// satisfied. If the chain requires fewer pieces than already present, we
// return null — the strategy cannot reduce, and the post-evaluator/reverse
// path handle that case.
//
// Frame `prior` is not yet wired (arrives in milestone 7); strategy returns
// null for it.

import {
  pieceCode
} from 'editorV2/panels/condition_preview_generation/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview_generation/shared/piece_placement'
import {
  compareValue, piecesIntoBoard, qualifyingPairs, subjectsRelatedToTarget
} from '../hint_compiler'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))

function pickRandom(values, random) {
  if (!values || values.length === 0) { return null }
  return values[Math.floor(random() * values.length)]
}

function shuffled(values, random) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// How many additional qualifying pieces on `side` we need to place to satisfy.
// Returns null when the constraint requires REMOVING pieces (we don't reduce).
function neededAdditions(countOp, n, current) {
  switch (countOp) {
    case 'equal_to':
      return current > n ? null : n - current
    case 'greater_than':
      return n + 1 - current
    case 'greater_than_or_equal_to':
      return n - current
    case 'less_than':
    case 'less_than_or_equal_to':
      return null
    default:
      return null
  }
}

// Place a new subject piece related (via operator) to one of the anchor
// target positions. Returns the augmented pieces map, or null if no placement
// works.
function addQualifyingSubject(pieces, hint, ctx, anchorTargetPositions) {
  const { random, movingTeam } = ctx
  const subjectSpeciesCandidates = shuffled([...hint.subject.speciesPool], random)
  if (subjectSpeciesCandidates.length === 0) { return null }

  for (const targetPos of shuffled([...anchorTargetPositions], random)) {
    for (const subjectSpecies of subjectSpeciesCandidates) {
      for (const subjectPos of shuffled([...ALL_POSITIONS], random)) {
        if (subjectPos === targetPos) { continue }
        if (pieces.has(subjectPos)) { continue }
        const next = placePiece(pieces, subjectPos, pieceCode(hint.subject.team, subjectSpecies))
        if (!next) { continue }
        const board = piecesIntoBoard(next, movingTeam)
        const subjects = subjectsRelatedToTarget({
          board, operator: hint.operator, targetPosition: targetPos,
          subjectTeam: hint.subject.team
        })
        if (subjects.includes(subjectPos)) { return next }
      }
    }
  }
  return null
}

// Place a new target piece related (via operator) to one of the anchor
// subject positions. Returns the augmented pieces map, or null.
function addQualifyingTarget(pieces, hint, ctx, anchorSubjectPositions) {
  const { random, movingTeam } = ctx
  const targetSpeciesCandidates = shuffled([...hint.target.speciesPool], random)
  if (targetSpeciesCandidates.length === 0) { return null }

  for (const subjectPos of shuffled([...anchorSubjectPositions], random)) {
    for (const targetSpecies of targetSpeciesCandidates) {
      for (const targetPos of shuffled([...ALL_POSITIONS], random)) {
        if (targetPos === subjectPos) { continue }
        if (pieces.has(targetPos)) { continue }
        const next = placePiece(pieces, targetPos, pieceCode(hint.target.team, targetSpecies))
        if (!next) { continue }
        const board = piecesIntoBoard(next, movingTeam)
        const subjects = subjectsRelatedToTarget({
          board, operator: hint.operator, targetPosition: targetPos,
          subjectTeam: hint.subject.team
        })
        if (subjects.includes(subjectPos)) { return next }
      }
    }
  }
  return null
}

export function relationCountStrategy(pieces, hint, ctx) {
  if (hint.frame !== 'current') { return null }

  const board = piecesIntoBoard(pieces, ctx.movingTeam)
  const pairs = qualifyingPairs(pieces, board, hint)

  const positionsOnSide = new Set(
    pairs.map(p => hint.side === 'subject' ? p.subjectPosition : p.targetPosition)
  )
  const currentCount = positionsOnSide.size

  if (compareValue(currentCount, hint.countOp, hint.n)) { return pieces }

  const additions = neededAdditions(hint.countOp, hint.n, currentCount)
  if (additions === null || additions <= 0) { return null }

  const anchorPositions = pairs.map(p => hint.side === 'subject' ? p.targetPosition : p.subjectPosition)
  if (anchorPositions.length === 0) { return null }

  let result = pieces
  for (let i = 0; i < additions; i += 1) {
    const next = hint.side === 'subject'
      ? addQualifyingSubject(result, hint, ctx, anchorPositions)
      : addQualifyingTarget(result, hint, ctx, anchorPositions)
    if (next === null) { return null }
    result = next
  }
  return result
}
