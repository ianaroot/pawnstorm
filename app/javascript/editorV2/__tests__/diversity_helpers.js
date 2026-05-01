import Board from 'gameplay/board'

// Distribution of piece occupancy across after-board layouts of a set of
// examples. Returns Map<squareIndex, count>.
export function pieceSquareDistribution(examples) {
  const counts = new Map()
  for (const example of examples) {
    for (let pos = 0; pos < 64; pos++) {
      if (example.afterBoard.layOut[pos] !== Board.EMPTY_SQUARE) {
        counts.set(pos, (counts.get(pos) ?? 0) + 1)
      }
    }
  }
  return counts
}

// Max-occupancy ratio: most-occupied square's count / examples.length.
// Diversity guardrail — if a single square is occupied in >X% of generated
// examples for a chain without positional constraints, the resolver is biased.
export function maxOccupancyRatio(examples) {
  if (examples.length === 0) { return 0 }
  const counts = pieceSquareDistribution(examples)
  let maxCount = 0
  for (const c of counts.values()) { if (c > maxCount) { maxCount = c } }
  return maxCount / examples.length
}

// Count of distinct after-board layouts among the examples. A healthy chain
// should produce many unique boards across its example pool.
export function uniqueAfterBoardLayouts(examples) {
  const seen = new Set()
  for (const example of examples) { seen.add(example.afterBoard.layOut.join('')) }
  return seen.size
}
