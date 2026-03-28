import { writeFileSync } from 'node:fs'

import Board from 'gameplay/board'
import BotRunner from 'gameplay/bot_runner'
import Layout from 'gameplay/layout'
import MatchRunner from 'gameplay/match_runner'

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString()
}

function resultFor(board, maxPlies, turnCount) {
  if (!board.gameOver && turnCount >= maxPlies) { return 'capped' }
  if (board._resultType === 'threefold_repetition') { return 'threefold_repetition' }
  if (board._resultType === 'stalemate') { return 'stalemate' }
  if (board._winner === Board.WHITE) { return 'white_win' }
  if (board._winner === Board.BLACK) { return 'black_win' }
  throw new Error(`Unable to resolve match result from board state: winner=${board._winner}, resultType=${board._resultType}`)
}

async function main() {
  const resultPath = process.env.MATCH_RESULT_PATH
  if (!resultPath) {
    throw new Error('MATCH_RESULT_PATH is required')
  }

  const payload = JSON.parse(await readStdin())
  const board = new Board({
    layOut: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: [],
    previousLayouts: JSON.stringify([])
  })

  const matchRunner = new MatchRunner({
    board,
    moveProviders: {
      [Board.WHITE]: new BotRunner(payload.white_compiled_program),
      [Board.BLACK]: new BotRunner(payload.black_compiled_program)
    }
  })

  const turns = matchRunner.play({ maxPlies: payload.max_plies || 200 })
  const resultPayload = {
    result: resultFor(board, payload.max_plies || 200, turns.length),
    lay_out: board.layOut,
    captured_pieces: board.capturedPieces,
    allowed_to_move: board.allowedToMove,
    movement_notation: board.movementNotation,
    previous_layouts: []
  }

  writeFileSync(resultPath, JSON.stringify(resultPayload), 'utf8')
}

await main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
