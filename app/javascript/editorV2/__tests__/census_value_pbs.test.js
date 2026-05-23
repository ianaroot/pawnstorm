import { describe, expect, it } from 'vitest'
import generateConditionExamples from '../panels/condition_preview/orchestrator'

function seededRandom(seed = 12345) {
  let current = seed >>> 0
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0
    return current / 0x100000000
  }
}

// Across a single move, the moving team's own material can only RISE via a pawn
// promotion (it never loses material on its own turn). So "allied non-king value
// increased vs prior" is satisfiable only by a promotion, and "allied non-king
// value decreased" is impossible. These two tests probe whether the example
// generator (a) produces a promotion for the up-direction and (b) refuses the
// impossible down-direction rather than emitting a false example.
describe('census value vs prior_board_state (allied / moving team)', () => {
  const nonKing = { subjectFilter: 'king', subjectFilterMode: 'exclude' }

  it('allied non-king value > prior_board_state yields a promotion example', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'allied', ...nonKing,
      operator: 'value', comparator: 'greater_than', target: 'prior_board_state'
    }

    let example = null
    for (let seed = 1; seed <= 25 && !example; seed += 1) {
      const preview = generateConditionExamples(payload, { random: seededRandom(seed) })
      if (preview.examples.length > 0) { example = preview.examples[0] }
    }

    // No example across 25 seeds => the up-direction has no generation path (the
    // suspected missing-promotion-mechanism gap).
    expect(example).not.toBeNull()
    // The only way the moving team's non-king value rises on its own move is a
    // promotion; a non-promotion example would be a false positive.
    expect(example.moveObject.promotionPiece).toBeTruthy()
  })

  it('allied non-king value < prior_board_state is unsatisfiable (no example emitted)', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'allied', ...nonKing,
      operator: 'value', comparator: 'less_than', target: 'prior_board_state'
    }

    for (let seed = 1; seed <= 25; seed += 1) {
      const preview = generateConditionExamples(payload, { random: seededRandom(seed) })
      // The moving team cannot lose material on its own move, so any emitted
      // example here is a false positive from the permissive value path.
      expect(preview.examples.length).toBe(0)
    }
  })
})
