import { writeFileSync } from 'node:fs'

import Board from 'gameplay/board'
import BotRunner from 'gameplay/bot_runner'
import Layout from 'gameplay/layout'
import MatchRunner from 'gameplay/match_runner'
import profileCollector from 'gameplay/profile_collector'

const DEFAULT_MAX_PLIES = 1000

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) { chunks.push(chunk) }
  return Buffer.concat(chunks).toString()
}

function serializableError(error) {
  if (!error) { return null }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack
  }
}

function boardSnapshot(board) {
  if (!board) { return null }
  return {
    lay_out: board.layOut,
    captured_pieces: board.capturedPieces,
    allowed_to_move: board.allowedToMove,
    movement_notation: board.movementNotation,
    result_type: board._resultType,
    winner: board._winner,
    game_over: board.gameOver,
    profile: profileCollector.snapshot()
  }
}

function resultFor(board, maxPlies, turnCount) {
  if (!board.gameOver && turnCount >= maxPlies) { return 'capped' }
  if (board._resultType === 'fifty_move_rule') { return 'fifty_move_rule' }
  if (board._resultType === 'threefold_repetition') { return 'threefold_repetition' }
  if (board._resultType === 'stalemate') { return 'stalemate' }
  if (board._winner === Board.WHITE) { return 'white_win' }
  if (board._winner === Board.BLACK) { return 'black_win' }
  throw new Error(`Unable to resolve match result from board state: winner=${board._winner}, resultType=${board._resultType}`)
}

let currentBoard = null
let currentPayload = null

async function main() {
  const resultPath = process.env.MATCH_RESULT_PATH
  if (!resultPath) {
    throw new Error('MATCH_RESULT_PATH is required')
  }

  const payload = JSON.parse(await readStdin())
  currentPayload = payload

  const board = new Board({
    layOut: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: []
  })
  currentBoard = board
  const maxPlies = payload.max_plies ?? DEFAULT_MAX_PLIES

  const matchRunner = new MatchRunner({
    board,
    moveProviders: {
      [Board.WHITE]: new BotRunner(payload.white_compiled_program),
      [Board.BLACK]: new BotRunner(payload.black_compiled_program)
    }
  })

  const turns = profileCollector.measure('match.total', () => {
    return matchRunner.play({ maxPlies })
  })
  const resultPayload = {
    result: resultFor(board, maxPlies, turns.length),
    lay_out: board.layOut,
    captured_pieces: board.capturedPieces,
    allowed_to_move: board.allowedToMove,
    movement_notation: board.movementNotation,
    previous_layouts: [],
    profile: profileCollector.snapshot()
  }

  writeFileSync(resultPath, JSON.stringify(resultPayload), 'utf8')
}

await main().catch((error) => {
  const failurePayload = {
    error: serializableError(error),
    payload: currentPayload,
    board: boardSnapshot(currentBoard)
  }

  console.error(JSON.stringify(failurePayload))
  process.exitCode = 1
})
