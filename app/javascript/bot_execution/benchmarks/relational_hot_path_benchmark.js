import Board from "chess_engine/board"
import CandidateMoveAnalysisV2 from "bot_execution/candidate_move_analysis_v2"
import profileCollector from "chess_engine/profile_collector"
import Rules from "chess_engine/rules"

process.env.MATCH_PROFILE = "1"

const PIECE_CODES = Object.freeze({
  wK: Board.WHITE_KING,
  wQ: Board.WHITE_QUEEN,
  wR: Board.WHITE_ROOK,
  wB: Board.WHITE_BISHOP,
  wN: Board.WHITE_NIGHT,
  wP: Board.WHITE_PAWN,
  bK: Board.BLACK_KING,
  bQ: Board.BLACK_QUEEN,
  bR: Board.BLACK_ROOK,
  bB: Board.BLACK_BISHOP,
  bN: Board.BLACK_NIGHT,
  bP: Board.BLACK_PAWN
})

const PROFILE_LABELS = [
  "cma.v2.relational_result",
  "cma.v2.relational_result.target_set",
  "cma.v2.relational_actor_positions",
  "cma.v2.related_target_positions_for_subject",
  "board_query.covered_positions",
  "board_query.covering_positions",
  "board_query.shielded_positions",
  "board_query.shielding_positions",
  "board_query.coverer_on_ray",
  "board_query.potential_slider_pressure_beyond_cover",
  "board_query.controlled_squares",
  "board_query.adjacent_positions"
]

function position(square) {
  return Board.gridCalculatorReverse(square)
}

function emptyLayout() {
  return Array(64).fill(Board.EMPTY_SQUARE)
}

function buildBoard({
  pieces = {},
  allowedToMove = Board.WHITE,
  movementNotation = [],
  capturedPieces = [],
  gameOver = false
} = {}) {
  const board = new Board({
    layOut: emptyLayout(),
    allowedToMove,
    movementNotation,
    capturedPieces,
    gameOver
  })

  Object.entries(pieces).forEach(([squareName, pieceCode]) => {
    const pieceObject = PIECE_CODES[pieceCode] || pieceCode
    board._placePiece({ position: position(squareName), pieceObject })
  })

  return board
}

function getMove(from, to, board, promotionPiece = Board.QUEEN) {
  return Rules.getMoveObject(position(from), position(to), board, promotionPiece)
}

function buildAnalysis({ board, move }) {
  return new CandidateMoveAnalysisV2({
    board,
    moveObject: getMove(move.from, move.to, board, move.promotionPiece)
  })
}

function parseIterations(argv) {
  const explicit = argv.find((arg) => arg.startsWith("--iterations="))
  if (explicit) {
    return Number(explicit.split("=")[1])
  }

  const positional = argv[0]
  return positional ? Number(positional) : 200
}

function benchmarkCase({ analysisFactory, query, iterations }) {
  profileCollector.reset()
  const warmAnalysis = analysisFactory()
  const baselineResult = warmAnalysis.relationalResult(query)
  profileCollector.reset()
  const startedAt = performance.now()
  let lastResult = null

  for (let i = 0; i < iterations; i += 1) {
    const analysis = analysisFactory()
    lastResult = analysis.relationalResult(query)
  }

  const totalMs = performance.now() - startedAt
  const snapshot = profileCollector.snapshot() || { timings: {}, counters: {} }
  const timings = snapshot.timings || {}

  const relevantTimings = {}
  PROFILE_LABELS.forEach((label) => {
    if (timings[label]) {
      relevantTimings[label] = timings[label]
    }
  })

  return {
    iterations,
    total_ms: Number(totalMs.toFixed(3)),
    avg_ms_per_iteration: Number((totalMs / iterations).toFixed(6)),
    subject_count: baselineResult?.subjectPositions?.length || lastResult?.subjectPositions?.length || 0,
    target_count: baselineResult?.targetPositions?.length || lastResult?.targetPositions?.length || 0,
    pair_count: baselineResult?.pairs?.length || lastResult?.pairs?.length || 0,
    timings: relevantTimings
  }
}

function scenarioDefinitions() {
  return [
    {
      name: "cover_pressure_lane",
      build() {
        const board = buildBoard({
          allowedToMove: Board.WHITE,
          pieces: {
            e1: "wK",
            d4: "wR",
            d5: "wP",
            c3: "wB",
            h1: "wR",
            e8: "bK",
            d8: "bR",
            a8: "bR",
            g8: "bQ",
            b7: "bB",
            a7: "bP",
            h7: "bP"
          }
        })

        return {
          board,
          move: { from: "c3", to: "b4" }
        }
      },
      queries: [
        {
          name: "cover_allied_any_to_allied_any",
          query: {
            subject: "allied",
            subjectFilter: "any",
            operator: "cover",
            target: "allied",
            targetFilter: "any"
          }
        },
        {
          name: "cover_allied_pawn_to_allied_rook",
          query: {
            subject: "allied",
            subjectFilter: "pawn",
            operator: "cover",
            target: "allied",
            targetFilter: "rook"
          }
        }
      ]
    },
    {
      name: "shield_slider_line",
      build() {
        const board = buildBoard({
          allowedToMove: Board.WHITE,
          pieces: {
            e1: "wK",
            e2: "wB",
            h1: "wR",
            c3: "wN",
            e8: "bR",
            h8: "bK",
            a8: "bR",
            d7: "bB"
          }
        })

        return {
          board,
          move: { from: "c3", to: "d5" }
        }
      },
      queries: [
        {
          name: "shield_allied_any_to_allied_king",
          query: {
            subject: "allied",
            subjectFilter: "any",
            operator: "shield",
            target: "allied",
            targetFilter: "king"
          }
        }
      ]
    },
    {
      name: "attack_defend_cluster",
      build() {
        const board = buildBoard({
          allowedToMove: Board.WHITE,
          pieces: {
            g1: "wK",
            d4: "wQ",
            c4: "wB",
            f3: "wN",
            e4: "wP",
            g2: "wP",
            g8: "bK",
            d7: "bQ",
            c6: "bB",
            f6: "bN",
            e5: "bP",
            g7: "bP"
          }
        })

        return {
          board,
          move: { from: "d4", to: "d5" }
        }
      },
      queries: [
        {
          name: "attack_enemy_any_to_moved_piece",
          query: {
            subject: "enemy",
            subjectFilter: "any",
            operator: "attack",
            target: "moved_piece",
            targetFilter: "any"
          }
        },
        {
          name: "defend_enemy_any_to_enemy_any",
          query: {
            subject: "enemy",
            subjectFilter: "any",
            operator: "defend",
            target: "enemy",
            targetFilter: "any"
          }
        }
      ]
    },
    {
      name: "adjacent_local_cluster",
      build() {
        const board = buildBoard({
          allowedToMove: Board.WHITE,
          pieces: {
            e1: "wK",
            d4: "wP",
            e4: "wP",
            f4: "wP",
            d5: "wN",
            e5: "wB",
            f5: "wR",
            e8: "bK",
            c6: "bP",
            d6: "bP",
            e6: "bP",
            f6: "bP",
            g6: "bP"
          }
        })

        return {
          board,
          move: { from: "d5", to: "f6" }
        }
      },
      queries: [
        {
          name: "adjacent_allied_any_to_enemy_any",
          query: {
            subject: "allied",
            subjectFilter: "any",
            operator: "adjacent",
            target: "enemy",
            targetFilter: "any"
          }
        }
      ]
    }
  ]
}

const iterations = parseIterations(process.argv.slice(2))

if (!Number.isInteger(iterations) || iterations <= 0) {
  throw new Error(`Iterations must be a positive integer, got: ${iterations}`)
}

const scenarios = scenarioDefinitions().map((definition) => {
  const { board, move } = definition.build()
  const moveObject = getMove(move.from, move.to, board, move.promotionPiece)

  return {
    name: definition.name,
    cases: definition.queries.map(({ name, query }) => {
      return {
        name,
        result: benchmarkCase({
          iterations,
          query,
          analysisFactory() {
            return new CandidateMoveAnalysisV2({ board, moveObject })
          }
        })
      }
    })
  }
})

console.log(JSON.stringify({
  benchmark: "relational_hot_path",
  iterations,
  scenarios
}, null, 2))
