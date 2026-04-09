import Board from "../board.js"
import Rules from "../rules.js"
import MovesCalculator from "../moves_calculator.js"

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
  gameOver = false,
  previousLayouts = JSON.stringify([])
} = {}) {
  const board = new Board({
    layOut: emptyLayout(),
    allowedToMove,
    movementNotation,
    capturedPieces,
    gameOver,
    previousLayouts
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

function playMoveSequence(board, moves) {
  moves.forEach(({ from, to }) => {
    const move = getMove(from, to, board)
    if (move.illegal) {
      throw new Error(`Illegal move in benchmark setup: ${from} -> ${to}`)
    }
    board._officiallyMovePiece(move)
  })

  return board
}

function benchmarkOperation({ iterations, run }) {
  const startedAt = performance.now()
  let operations = 0

  for (let i = 0; i < iterations; i += 1) {
    operations += run()
  }

  const totalMs = performance.now() - startedAt

  return {
    iterations,
    operations,
    total_ms: Number(totalMs.toFixed(3)),
    avg_ms_per_iteration: Number((totalMs / iterations).toFixed(6)),
    avg_ms_per_operation: operations === 0 ? 0 : Number((totalMs / operations).toFixed(6))
  }
}

function movablePositions(board) {
  return board._positionsOccupiedByTeam(board.allowedToMove)
}

function pseudoLegalMovesForSide(board) {
  return movablePositions(board).flatMap((startPosition) => {
    return new MovesCalculator({ board, startPosition }).moveObjects
  })
}

function attackedSquaresForScenario(board, extraSquares = []) {
  const kingPosition = board._kingPosition(board.allowedToMove)
  return [kingPosition, ...extraSquares.map(position)]
}

function scenarioDefinitions() {
  return [
    {
      name: "opening_castle_available",
      build() {
        return buildBoard({
          pieces: {
            e1: "wK",
            h1: "wR",
            a1: "wR",
            c4: "wB",
            f3: "wN",
            a2: "wP",
            b2: "wP",
            c2: "wP",
            d2: "wP",
            e2: "wP",
            f2: "wP",
            g2: "wP",
            h2: "wP",
            e8: "bK",
            a8: "bR",
            h8: "bR",
            a7: "bP",
            b7: "bP",
            c7: "bP",
            d7: "bP",
            e7: "bP",
            f7: "bP",
            g7: "bP",
            h7: "bP"
          }
        })
      },
      attackSquares: ["e1", "f1", "g1"]
    },
    {
      name: "en_passant_live",
      build() {
        return buildBoard({
          allowedToMove: Board.WHITE,
          movementNotation: ["h3", "d5"],
          pieces: {
            e1: "wK",
            e8: "bK",
            e5: "wP",
            d5: "bP",
            c4: "wB",
            f3: "wN",
            a2: "wP",
            h2: "wP",
            a7: "bP",
            h7: "bP"
          }
        })
      },
      attackSquares: ["e1"]
    },
    {
      name: "middlegame_pressure",
      build() {
        return buildBoard({
          allowedToMove: Board.WHITE,
          pieces: {
            g1: "wK",
            d1: "wQ",
            a1: "wR",
            f1: "wR",
            c4: "wB",
            g2: "wB",
            f3: "wN",
            c3: "wN",
            a2: "wP",
            b2: "wP",
            d4: "wP",
            e4: "wP",
            f2: "wP",
            g3: "wP",
            h2: "wP",
            g8: "bK",
            d8: "bQ",
            a8: "bR",
            f8: "bR",
            c5: "bB",
            g7: "bB",
            f6: "bN",
            c6: "bN",
            a7: "bP",
            b7: "bP",
            d6: "bP",
            e5: "bP",
            f7: "bP",
            g6: "bP",
            h7: "bP"
          }
        })
      },
      attackSquares: ["g1"]
    },
    {
      name: "black_castle_available",
      build() {
        return buildBoard({
          allowedToMove: Board.BLACK,
          pieces: {
            e1: "wK",
            a1: "wR",
            h1: "wR",
            a2: "wP",
            b2: "wP",
            c2: "wP",
            d2: "wP",
            e2: "wP",
            f2: "wP",
            g2: "wP",
            h2: "wP",
            e8: "bK",
            h8: "bR",
            a8: "bR",
            c5: "bB",
            f6: "bN",
            a7: "bP",
            b7: "bP",
            c7: "bP",
            d7: "bP",
            e7: "bP",
            f7: "bP",
            g7: "bP",
            h7: "bP"
          }
        })
      },
      attackSquares: ["e8", "f8", "g8"]
    },
    {
      name: "sequence_built_board",
      build() {
        const board = buildBoard({
          pieces: {
            a1: "wR",
            b1: "wN",
            c1: "wB",
            d1: "wQ",
            e1: "wK",
            f1: "wB",
            g1: "wN",
            h1: "wR",
            a2: "wP",
            b2: "wP",
            c2: "wP",
            d2: "wP",
            e2: "wP",
            f2: "wP",
            g2: "wP",
            h2: "wP",
            a7: "bP",
            b7: "bP",
            c7: "bP",
            d7: "bP",
            e7: "bP",
            f7: "bP",
            g7: "bP",
            h7: "bP",
            a8: "bR",
            b8: "bN",
            c8: "bB",
            d8: "bQ",
            e8: "bK",
            f8: "bB",
            g8: "bN",
            h8: "bR"
          }
        })

        playMoveSequence(board, [
          { from: "e2", to: "e4" },
          { from: "e7", to: "e5" },
          { from: "g1", to: "f3" },
          { from: "b8", to: "c6" },
          { from: "f1", to: "c4" },
          { from: "g8", to: "f6" },
          { from: "d2", to: "d3" },
          { from: "f8", to: "c5" }
        ])

        return board
      },
      attackSquares: ["e1"]
    }
  ]
}

function runScenarioBenchmark({ name, board, attackSquares, iterations }) {
  const attackPositions = attackedSquaresForScenario(board, attackSquares)

  return {
    name,
    allowed_to_move: board.allowedToMove,
    movable_piece_count: movablePositions(board).length,
    attack_square_count: attackPositions.length,
    available_moves_from: benchmarkOperation({
      iterations,
      run() {
        const positions = movablePositions(board)
        for (let i = 0; i < positions.length; i += 1) {
          Rules.availableMovesFrom({ board, startPosition: positions[i] })
        }
        return positions.length
      }
    }),
    check_query_with_move: benchmarkOperation({
      iterations,
      run() {
        const moveObjects = pseudoLegalMovesForSide(board)
        for (let i = 0; i < moveObjects.length; i += 1) {
          Rules.checkQueryWithMove({ board, moveObject: moveObjects[i] })
        }
        return moveObjects.length
      }
    }),
    piece_is_attacked: benchmarkOperation({
      iterations,
      run() {
        for (let i = 0; i < attackPositions.length; i += 1) {
          Rules.pieceIsAttacked({ board, defensePosition: attackPositions[i] })
        }
        return attackPositions.length
      }
    })
  }
}

function parseIterations(argv) {
  const explicit = argv.find((arg) => arg.startsWith("--iterations="))
  if (explicit) {
    return Number(explicit.split("=")[1])
  }

  const positional = argv[0]
  return positional ? Number(positional) : 200
}

const iterations = parseIterations(process.argv.slice(2))

if (!Number.isInteger(iterations) || iterations <= 0) {
  throw new Error(`Iterations must be a positive integer, got: ${iterations}`)
}

const scenarios = scenarioDefinitions().map((definition) => {
  return runScenarioBenchmark({
    name: definition.name,
    board: definition.build(),
    attackSquares: definition.attackSquares || [],
    iterations
  })
})

const output = {
  benchmark: "rules_hot_path",
  iterations,
  scenarios
}

console.log(JSON.stringify(output, null, 2))
