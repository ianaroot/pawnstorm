import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import Board from 'gameplay/board'
import BotRunner from 'gameplay/bot_runner'
import Layout from 'gameplay/layout'
import MatchRunner from 'gameplay/match_runner'

// Regression coverage for the "compiled program contains a kind the evaluator
// rejects" class of bug (a stale compiled program with a retired `unary` kind
// crashed every match while the entire suite stayed green). Every other layer
// is mocked at the seam or fed synthetic node trees; nothing actually played a
// realistic compiled program through the real BotRunner + ConditionEvaluator.
//
// The fixtures are generated from purpose-built, kind-rich dev bots via the
// Ruby compile pipeline (see the BotCompiler spec / fixture rake). They are
// intentionally small but cover every condition kind and the major payload
// variants. Until they are committed this suite self-skips so the green suite
// is honest rather than red-by-default.

// Resolve via fileURLToPath/path (plain strings) rather than `new URL(...)`:
// under the jsdom test environment the global URL is jsdom's class, which
// node:fs does not treat as a file URL, so existsSync/readFileSync would
// silently fail and the suite would self-skip even with fixtures present.
const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '__fixtures__')
const WHITE_FIXTURE = join(FIXTURE_DIR, 'smoke_white_compiled_program.json')
const BLACK_FIXTURE = join(FIXTURE_DIR, 'smoke_black_compiled_program.json')

const MAX_PLIES = 20
const RNG_SEED = 0x9e3779b9

// Deterministic PRNG so BotRunner tie-breaking (this.random) can't make the
// smoke test flaky.
function mulberry32(seed) {
  let state = seed >>> 0
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const fixturesPresent = existsSync(WHITE_FIXTURE) && existsSync(BLACK_FIXTURE)

function loadProgram(fixtureUrl) {
  return JSON.parse(readFileSync(fixtureUrl, 'utf8'))
}

function conditionKinds(program) {
  return Object.values(program.nodes)
    .filter(node => node.type === 'condition')
    .map(node => node.data && node.data.kind)
}

const describeMaybe = fixturesPresent ? describe : describe.skip

describeMaybe('match runner smoke (real bots end-to-end)', () => {
  const whiteProgram = fixturesPresent ? loadProgram(WHITE_FIXTURE) : null
  const blackProgram = fixturesPresent ? loadProgram(BLACK_FIXTURE) : null

  it('fixtures cover every live kind and contain no retired kinds', () => {
    const kinds = new Set([
      ...conditionKinds(whiteProgram),
      ...conditionKinds(blackProgram)
    ])

    // Coverage guard: a degenerate fixture must not pass the play test below
    // and give false confidence.
    expect(kinds).toContain('census')
    expect(kinds).toContain('relational')
    expect(kinds).toContain('identity')

    // The actual regression: retired kinds must never reach the runner.
    expect(kinds.has('unary')).toBe(false)
    expect(kinds.has('position')).toBe(false)
  })

  it('plays a full match without throwing and produces legal moves', () => {
    const board = new Board({
      layOut: Layout.default(),
      capturedPieces: [],
      allowedToMove: Board.WHITE,
      movementNotation: []
    })

    const random = mulberry32(RNG_SEED)
    const matchRunner = new MatchRunner({
      board,
      moveProviders: {
        [Board.WHITE]: new BotRunner(whiteProgram, { random }),
        [Board.BLACK]: new BotRunner(blackProgram, { random })
      }
    })

    let turns
    expect(() => {
      turns = matchRunner.play({ maxPlies: MAX_PLIES })
    }).not.toThrow()

    // Either the game ended on its own or we hit the ply cap — but real moves
    // must have been selected and applied along the way.
    expect(turns.length).toBeGreaterThan(0)
    expect(board.gameOver || turns.length === MAX_PLIES).toBe(true)

    let expectedTeam = Board.WHITE
    for (const turn of turns) {
      expect(turn.team).toBe(expectedTeam)
      expect(turn.moveObject).toBeTruthy()
      expect(Number.isInteger(turn.moveObject.startPosition)).toBe(true)
      expect(Number.isInteger(turn.moveObject.endPosition)).toBe(true)
      expectedTeam = expectedTeam === Board.WHITE ? Board.BLACK : Board.WHITE
    }
  })
})
