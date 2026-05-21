// Strategy for UNARY_COUNT_PAIR — unary pair, count variant.
//
// Singular move-event actors have count 0 or 1 (they're singular). For
// presence-compatible comparators (=, ≥, ≤), the strategy engineers a move
// scenario where both actors exist (count = 1 each, satisfying 1=1, 1≥1, 1≤1).
// For >/< between two singulars, one actor must be absent; that's typically
// degenerate in chain context, so strategy returns null and reverse-gen takes
// over.
//
// Engineering reuses unaryValuePairStrategy: any non-king species pair works
// for count purposes, so we pick a pair satisfying ≤ (which is trivial) and
// delegate.

import Board from 'gameplay/board'
import { unaryValuePairStrategy } from './unary_value_pair'

function isPresenceCompatibleComparator(countOp) {
  return countOp === 'equal_to' ||
         countOp === 'greater_than_or_equal_to' ||
         countOp === 'less_than_or_equal_to'
}

export function unaryCountPairStrategy(pieces, hint, ctx) {
  if (!isPresenceCompatibleComparator(hint.countOp)) { return null }

  const subjectPool = hint.subjectSpeciesPool.filter(s => s !== Board.KING)
  const targetPool = hint.targetSpeciesPool.filter(s => s !== Board.KING)
  if (subjectPool.length === 0 || targetPool.length === 0) { return null }

  // Delegate to the value-pair strategy with a permissive comparator. Any
  // (subject, target) species pair where subject value ≤ target value
  // satisfies less_than_or_equal_to and produces a valid count=1 each
  // scenario.
  const valueHint = {
    ...hint,
    type: 'unary_value_pair',
    valueOp: 'less_than_or_equal_to',
    subjectSpeciesPool: subjectPool,
    targetSpeciesPool: targetPool
  }
  return unaryValuePairStrategy(pieces, valueHint, ctx)
}
