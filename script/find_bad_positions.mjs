import fs from 'fs'

import ReplayMoveInspector from 'gameplay/replay_move_inspector'
import BotRunner from 'gameplay/bot_runner'

import { buildBoardFromNotationPrefix } from './match_analysis_common.mjs'

const payloadPath = process.argv[2]

if (!payloadPath) {
  console.error('Usage: node find_bad_positions.mjs PAYLOAD_PATH')
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
const inspector = new ReplayMoveInspector({ compiledProgram: payload.compiled_program })
const runner = new BotRunner(payload.compiled_program)
const isWhite = payload.inspected_team === 'W'

function suspiciousness({ actual, tiedTopCount, trace }) {
  let score = 0
  if (actual?.score === 0) score += 3
  if (tiedTopCount >= payload.tie_threshold) score += 3
  if ((trace?.trace || []).filter(entry => entry.nodeType === 'action').length === 0) score += 2
  if (tiedTopCount > 1) score += 1
  return score
}

function reasonList({ actual, tiedTopCount, trace }) {
  const reasons = []
  if (actual?.score === 0) reasons.push('actual score 0')
  if (tiedTopCount >= payload.tie_threshold) reasons.push(`large top tie (${tiedTopCount})`)
  if ((trace?.trace || []).filter(entry => entry.nodeType === 'action').length === 0) reasons.push('no actions fired')
  if (tiedTopCount > 1 && tiedTopCount < payload.tie_threshold) reasons.push(`top tie (${tiedTopCount})`)
  return reasons
}

const flagged = []

for (let ply = 0; ply < payload.movement_notation.length; ply += 1) {
  const inspectedToMove = isWhite ? ply % 2 === 0 : ply % 2 === 1
  if (!inspectedToMove) continue

  const plyNumber = ply + 1
  const actualMoveNotation = payload.movement_notation[ply]
  const board = buildBoardFromNotationPrefix(payload.movement_notation.slice(0, ply))
  const result = inspector.inspectPosition({ board, actualMoveNotation })
  const actual = result.scoredMoves.find(r => r.key === result.actualMoveKey) || null
  const trace = actual ? runner.scoreMove({ board, moveObject: actual.moveObject, withTrace: true }) : null

  const reasons = reasonList({
    actual,
    tiedTopCount: result.tiedTopMoveKeys.length,
    trace
  })

  if (!payload.show_all && reasons.length === 0) continue

  flagged.push({
    ply: plyNumber,
    notation: actualMoveNotation,
    actualScore: actual?.score ?? null,
    topScore: result.topScore,
    tiedTopCount: result.tiedTopMoveKeys.length,
    reasons,
    suspiciousness: suspiciousness({
      actual,
      tiedTopCount: result.tiedTopMoveKeys.length,
      trace
    })
  })
}

flagged.sort((a, b) => {
  if (b.suspiciousness !== a.suspiciousness) return b.suspiciousness - a.suspiciousness
  if (b.tiedTopCount !== a.tiedTopCount) return b.tiedTopCount - a.tiedTopCount
  return a.ply - b.ply
})

console.log(`MATCH ${payload.id} ${payload.white} vs ${payload.black} ${payload.result}`)
console.log(`Flagging positions for ${payload.inspected_bot} as ${payload.inspected_team}`)
console.log('')

const rows = payload.show_all ? flagged : flagged.slice(0, payload.limit)

if (rows.length === 0) {
  console.log('No suspicious positions found for the current thresholds.')
  process.exit(0)
}

rows.forEach(row => {
  console.log(`ply ${row.ply} ${row.notation}`)
  console.log(`  score=${row.actualScore} top=${row.topScore} tied=${row.tiedTopCount} suspiciousness=${row.suspiciousness}`)
  console.log(`  reasons ${row.reasons.length > 0 ? row.reasons.join(', ') : 'none'}`)
  console.log(`  inspect  bin/rails runner script/inspect_match_moves.rb ${payload.id} "${payload.inspected_bot}" --plies=${row.ply} --all`)
  console.log('')
})

