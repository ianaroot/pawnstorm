import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import generateConditionExamples from '../panels/condition_preview/orchestrator'

function seededRandom(seed = 12345) {
  let current = seed >>> 0
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0
    return current / 0x100000000
  }
}

// Across a single move the moving team's own material can only RISE via a pawn
// promotion (it never loses material on its own turn), and the opposing team's
// material can only FALL via being captured (it never moves on this turn). So
// each "value vs prior" direction is either forced to a specific move type or is
// outright impossible. These tests probe whether the generator produces the
// right move type for the satisfiable directions and refuses the impossible ones
// rather than emitting a false example.
describe('census value vs prior_board_state (allied / moving team)', () => {
  const nonKing = { subjectFilter: 'king', subjectFilterMode: 'exclude' }

  it('generates a promotion example when allied material must have risen', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'allied', ...nonKing,
      operator: 'value', comparator: 'greater_than', target: 'prior_board_state'
    }

    let example = null
    for (let seed = 1; seed <= 25 && !example; seed += 1) {
      const preview = generateConditionExamples(payload, { random: seededRandom(seed) })
      if (preview.examples.length > 0) { example = preview.examples[0] }
    }

    expect(example).not.toBeNull()
    // The only way the moving team's non-king value rises on its own move is a promotion.
    expect(example.moveObject.promotionPiece).toBeTruthy()
  })

  it('generates no example when allied material must have fallen — the moving team never loses material on its own move', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'allied', ...nonKing,
      operator: 'value', comparator: 'less_than', target: 'prior_board_state'
    }

    for (let seed = 1; seed <= 25; seed += 1) {
      const preview = generateConditionExamples(payload, { random: seededRandom(seed) })
      expect(preview.examples.length).toBe(0)
    }
  })
})

describe('census value vs prior_board_state (enemy / opposing team)', () => {
  const nonKing = { subjectFilter: 'king', subjectFilterMode: 'exclude' }

  it('generates a capture example when enemy material must have fallen', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'enemy', ...nonKing,
      operator: 'value', comparator: 'less_than', target: 'prior_board_state'
    }

    let capture = null
    for (let seed = 1; seed <= 25 && !capture; seed += 1) {
      const preview = generateConditionExamples(payload, { random: seededRandom(seed) })
      for (const ex of preview.examples) {
        const moverTeam = ex.priorBoard.teamAt(ex.moveObject.startPosition)
        // Standard capture: an opposing piece stood on the destination square.
        if (ex.priorBoard.teamAt(ex.moveObject.endPosition) === Board.opposingTeam(moverTeam)) {
          capture = ex
          break
        }
      }
    }

    expect(capture).not.toBeNull()
  })

  it('generates no example when enemy material must have risen — the opposing team never gains material during the move', () => {
    const payload = {
      version: 2, kind: 'census', subject: 'enemy', ...nonKing,
      operator: 'value', comparator: 'greater_than', target: 'prior_board_state'
    }

    for (let seed = 1; seed <= 25; seed += 1) {
      const preview = generateConditionExamples(payload, { random: seededRandom(seed) })
      expect(preview.examples.length).toBe(0)
    }
  })
})
