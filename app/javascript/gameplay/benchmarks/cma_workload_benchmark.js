import { readFileSync } from "node:fs"

import BotRunner from "gameplay/bot_runner"
import Board from "gameplay/board"
import Layout from "gameplay/layout"
import NotationResolver from "gameplay/notation_resolver"
import profileCollector from "gameplay/profile_collector"
import Rules from "gameplay/rules"

process.env.MATCH_PROFILE = "1"

const COMPILED_PROGRAM = JSON.parse(
  readFileSync(new URL("../__fixtures__/rogue_v__2g_compiled_program.json", import.meta.url), "utf8")
)
const CYCLOPS_FIXTURE = JSON.parse(
  readFileSync(new URL("../__fixtures__/cyclops_behavior_fixture.json", import.meta.url), "utf8")
)

const PROFILE_LABELS = [
  "bot.score_move",
  "bot.run_node.condition",
  "condition.evaluate",
  "condition.v2.evaluate",
  "condition.v2.dispatch",
  "condition.v2.unary",
  "condition.v2.relational",
  "cma.v2.unary_value",
  "cma.v2.relational_result",
  "cma.v2.relational_actor_positions",
  "cma.v2.related_target_positions_for_subject",
  "board_query.covered_positions",
  "board_query.shielded_positions",
  "board_query.controlled_squares",
  "board_query.adjacent_positions"
]

const PROMOTION_PIECES = Object.freeze({
  Q: Board.QUEEN,
  R: Board.ROOK,
  B: Board.BISHOP,
  N: Board.NIGHT
})

function parseIterations(argv) {
  const explicit = argv.find((arg) => arg.startsWith("--iterations="))
  if (explicit) {
    return Number(explicit.split("=")[1])
  }

  const positional = argv[0]
  return positional ? Number(positional) : 50
}

function buildInitialBoard() {
  return new Board({
    layOut: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: []
  })
}

function replayBoard(notationPrefix) {
  const resolver = new NotationResolver()
  const board = buildInitialBoard()

  notationPrefix.forEach((notation) => {
    const moveObject = resolver.resolve({ board, notation })
    board._officiallyMovePiece(moveObject)
  })

  return board
}

function moveObjectFromSelectedMove(board, selectedMove) {
  const match = selectedMove.match(/^([a-h][1-8])-([a-h][1-8])(?:=([QRNB]))?$/)
  if (!match) {
    throw new Error(`Unsupported selectedMove format: ${selectedMove}`)
  }

  const [, from, to, promotionCode] = match
  const promotionPiece = promotionCode ? PROMOTION_PIECES[promotionCode] : Board.QUEEN
  const moveObject = Rules.getMoveObject(
    Board.gridCalculatorReverse(from),
    Board.gridCalculatorReverse(to),
    board,
    promotionPiece
  )

  if (moveObject.illegal) {
    throw new Error(`Fixture selectedMove resolved illegal on reconstructed board: ${selectedMove}`)
  }

  return moveObject
}

function relevantTimings(snapshot) {
  const timings = snapshot?.timings || {}
  const filtered = {}

  PROFILE_LABELS.forEach((label) => {
    if (timings[label]) {
      filtered[label] = timings[label]
    }
  })

  return filtered
}

function rogueFixturePositions() {
  const roguePositions = CYCLOPS_FIXTURE.positions.filter((entry) => {
    return entry.white === "Rogue" || entry.black === "Rogue"
  })
  const byPhase = roguePositions.reduce((accumulator, entry) => {
    if (!accumulator[entry.phase]) {
      accumulator[entry.phase] = []
    }

    accumulator[entry.phase].push(entry)
    return accumulator
  }, {})

  return Object.values(byPhase).flatMap((entries) => {
    return entries
      .slice()
      .sort((left, right) => right.notationPrefix.length - left.notationPrefix.length)
      .slice(0, 2)
  })
}

function scenarioDefinition(entry) {
  const board = replayBoard(entry.notationPrefix)
  const moveObject = moveObjectFromSelectedMove(board, entry.selectedMove)

  return {
    name: `match_${entry.matchId}_ply_${entry.plyNumber}_${entry.phase}_${entry.color}`,
    board,
    moveObject,
    metadata: {
      match_id: entry.matchId,
      ply_number: entry.plyNumber,
      phase: entry.phase,
      color: entry.color,
      white: entry.white,
      black: entry.black,
      notation_prefix_length: entry.notationPrefix.length,
      selected_move: entry.selectedMove,
      legal_move_count: entry.legalMoveCount,
      tied_top_count: entry.tiedTopCount
    }
  }
}

function benchmarkScenario({ botRunner, scenario, iterations }) {
  profileCollector.reset()
  const warmScore = botRunner.scoreMove({ board: scenario.board, moveObject: scenario.moveObject })
  profileCollector.reset()
  const startedAt = performance.now()
  let lastScore = null

  for (let i = 0; i < iterations; i += 1) {
    lastScore = botRunner.scoreMove({ board: scenario.board, moveObject: scenario.moveObject })
  }

  const totalMs = performance.now() - startedAt
  const snapshot = profileCollector.snapshot() || { timings: {}, counters: {} }

  return {
    ...scenario.metadata,
    iterations,
    warm_score: warmScore,
    last_score: lastScore,
    total_ms: Number(totalMs.toFixed(3)),
    avg_ms_per_iteration: Number((totalMs / iterations).toFixed(6)),
    timings: relevantTimings(snapshot)
  }
}

const iterations = parseIterations(process.argv.slice(2))
const botRunner = new BotRunner(COMPILED_PROGRAM)
const scenarios = rogueFixturePositions().map(scenarioDefinition)
const results = scenarios.map((scenario) => {
  return {
    name: scenario.name,
    result: benchmarkScenario({ botRunner, scenario, iterations })
  }
})

console.log(JSON.stringify({
  benchmark: "cma_workload",
  bot: "Rogue V__2G",
  iterations,
  scenario_count: scenarios.length,
  scenarios: results
}, null, 2))
