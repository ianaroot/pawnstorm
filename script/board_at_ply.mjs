import fs from 'fs'

import { boardAscii, buildBoardFromNotationPrefix } from './match_analysis_common.mjs'

const payloadPath = process.argv[2]

if (!payloadPath) {
  console.error('Usage: node board_at_ply.mjs PAYLOAD_PATH')
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
const prefix = payload.movement_notation.slice(0, payload.ply - 1)
const board = buildBoardFromNotationPrefix(prefix)
const previousMove = payload.ply > 1 ? payload.movement_notation[payload.ply - 2] : null
const nextMove = payload.ply <= payload.movement_notation.length ? payload.movement_notation[payload.ply - 1] : null

console.log(`MATCH ${payload.id} ${payload.white} vs ${payload.black} ${payload.result}`)
console.log(`Board before ply ${payload.ply}`)
console.log(`Allowed to move: ${board.allowedToMove}`)
console.log(`Previous move: ${previousMove || 'none'}`)
console.log(`Next move: ${nextMove || 'none (end of game)'}`)
console.log('')
console.log(boardAscii({ board, perspective: payload.perspective }))

