import fs from 'fs'

import Board from 'gameplay/board'
import Layout from 'gameplay/layout'
import NotationResolver from 'gameplay/notation_resolver'
import ReplayMoveInspector from 'gameplay/replay_move_inspector'
import BotRunner from 'gameplay/bot_runner'

const payloadPath = process.argv[2]

if (!payloadPath) {
  console.error('Usage: node inspect_match_moves.mjs PAYLOAD_PATH')
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
const notationResolver = new NotationResolver()

function buildBoardFromNotationPrefix(notationPrefix) {
  const board = new Board({
    layOut: Layout.default(),
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: [],
    previousLayouts: JSON.stringify([])
  })

  notationPrefix.forEach(notation => {
    const moveObject = notationResolver.resolve({ board, notation })
    board._officiallyMovePiece(moveObject)
  })

  return board
}

function moveLabel(moveObject) {
  const start = Board.gridCalculator(moveObject.startPosition)
  const finish = Board.gridCalculator(moveObject.endPosition)
  const promotion = moveObject.promotionPiece ? `=${moveObject.promotionPiece}` : ''
  return `${start}-${finish}${promotion}`
}

function prettyToken(value) {
  return String(value).replaceAll('_', ' ')
}

function specifierSummary(specifier, mode) {
  const label = prettyToken(specifier)
  return mode === 'exclude' ? `non-${label}` : label
}

function relationLabel(relation) {
  return {
    attacker: 'is ATTACKED by',
    attacked: 'makes ATTACKS against',
    defender: 'is DEFENDED by',
    defended: 'provides DEFENSE for',
    shielder: 'is SHIELDED by',
    shielded: 'provides SHIELDING for',
    coverer: 'is COVERED by',
    covered: 'provides COVER for'
  }[relation] || prettyToken(relation)
}

function conditionSummary(data) {
  const relationSpecifier = data.relationSpecifier && data.relationSpecifier !== 'any'
    ? ` ${specifierSummary(data.relationSpecifier, data.relationSpecifierMode)}`
    : ''
  const subjectSpecifier = data.subjectSpecifier && data.subjectSpecifier !== 'any'
    ? ` ${specifierSummary(data.subjectSpecifier, data.subjectSpecifierMode)}`
    : ''
  const comparisonValue = typeof data.comparisonValue === 'number'
    ? data.comparisonValue
    : prettyToken(data.comparisonValue)
  const operator = {
    equal_to: '=',
    greater_than: '>',
    less_than: '<'
  }[data.comparison] || data.comparison

  return `${prettyToken(data.subject)}${subjectSpecifier} ${relationLabel(data.relation)}${relationSpecifier} ${operator} ${comparisonValue}`
}

function buildParentMap(compiledProgram) {
  const parentMap = new Map()

  Object.entries(compiledProgram.nodes).forEach(([nodeId, node]) => {
    ;(node.children || []).forEach(childId => {
      parentMap.set(childId, nodeId)
    })
  })

  return parentMap
}

function ancestorIds(nodeId, parentMap) {
  const ids = []
  let currentId = nodeId

  while (parentMap.has(currentId)) {
    currentId = parentMap.get(currentId)
    ids.unshift(currentId)
  }

  return ids
}

function rootBranchIdForNode(nodeId, compiledProgram, parentMap) {
  const rootId = compiledProgram.root
  const ids = ancestorIds(nodeId, parentMap)
  const rootIndex = ids.indexOf(rootId)

  if (rootIndex === -1 || rootIndex === ids.length - 1) {
    return null
  }

  return ids[rootIndex + 1]
}

function organizerLabelForNode(nodeId, compiledProgram, parentMap) {
  const branchId = rootBranchIdForNode(nodeId, compiledProgram, parentMap)
  if (!branchId) return 'unknown branch'

  const branchNode = compiledProgram.nodes[branchId]
  const branchIndex = (compiledProgram.nodes[compiledProgram.root]?.children || []).indexOf(branchId)
  return branchNode?.data?.title || `branch ${branchIndex + 1}`
}

function actionBreakdown(trace, compiledProgram, parentMap) {
  return trace
    .filter(entry => entry.nodeType === 'action')
    .map(entry => {
      const chain = ancestorIds(entry.nodeId, parentMap)
        .map(nodeId => compiledProgram.nodes[nodeId])
        .filter(node => node?.type === 'condition')
        .map(node => conditionSummary(node.data))

      return {
        organizer: organizerLabelForNode(entry.nodeId, compiledProgram, parentMap),
        actionType: entry.actionType,
        value: entry.value,
        scoreBefore: entry.scoreBefore,
        scoreAfter: entry.scoreAfter,
        halted: entry.halted,
        chain
      }
    })
}

function representativeTopMove(result) {
  const topMoves = result.scoredMoves.filter(move => move.score === result.topScore)
  if (topMoves.length === 0) return null

  return topMoves.find(move => move.key !== result.actualMoveKey) || topMoves[0]
}

function statusLabel(result, actual) {
  if (!actual) return 'actual move unavailable'
  if (actual.score < result.topScore) return 'chosen below top'
  if (result.tiedTopMoveKeys.length > 1) return 'chosen tied for top'
  return 'chosen uniquely top'
}

function printMoveTrace(label, moveResult, traceResult, compiledProgram, parentMap) {
  console.log(`  ${label} ${moveLabel(moveResult.moveObject)} score=${moveResult.score}`)

  const actions = actionBreakdown(traceResult.trace, compiledProgram, parentMap)
  if (actions.length === 0) {
    console.log('    no actions fired')
    return
  }

  actions.forEach(action => {
    console.log(`    [${action.organizer}] ${action.actionType} ${action.value} score ${action.scoreBefore} -> ${action.scoreAfter}${action.halted ? ' HALT' : ''}`)
    console.log('      because:')
    action.chain.forEach(condition => {
      console.log(`        - ${condition}`)
    })
  })
}

const inspector = new ReplayMoveInspector({ compiledProgram: payload.compiled_program })
const runner = new BotRunner(payload.compiled_program)
const isWhite = payload.inspected_team === 'W'
const parentMap = buildParentMap(payload.compiled_program)

console.log(`MATCH ${payload.id} ${payload.white} vs ${payload.black} ${payload.result}`)
console.log(`Inspecting ${payload.inspected_bot} as ${payload.inspected_team}`)
console.log('')

let shown = 0

for (let ply = 0; ply < payload.movement_notation.length; ply += 1) {
  const inspectedToMove = isWhite ? ply % 2 === 0 : ply % 2 === 1
  if (!inspectedToMove) continue

  const plyNumber = ply + 1
  if (Array.isArray(payload.plies) && payload.plies.length > 0 && !payload.plies.includes(plyNumber)) {
    continue
  }

  const actualMoveNotation = payload.movement_notation[ply]
  const board = buildBoardFromNotationPrefix(payload.movement_notation.slice(0, ply))
  const result = inspector.inspectPosition({ board, actualMoveNotation })

  if (!payload.show_all && result.actualMoveWasTopScored) {
    continue
  }

  const actual = result.scoredMoves.find(r => r.key === result.actualMoveKey) || null
  const representativeTop = representativeTopMove(result)
  const topFive = [...result.scoredMoves]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => `${moveLabel(r.moveObject)}(${r.score})`)
  const tiedTopMoves = result.scoredMoves
    .filter(r => result.tiedTopMoveKeys.includes(r.key))
    .sort((a, b) => moveLabel(a.moveObject).localeCompare(moveLabel(b.moveObject)))
    .map(r => `${moveLabel(r.moveObject)}(${r.score})`)

  console.log(`ply ${plyNumber} ${actualMoveNotation}`)
  console.log(`  status ${statusLabel(result, actual)}`)
  console.log(`  actual ${actual ? moveLabel(actual.moveObject) : 'NA'} score=${actual?.score ?? 'NA'} top=${result.topScore} tied=${result.tiedTopMoveKeys.length}`)
  console.log(`  top-tied ${tiedTopMoves.length > 0 ? tiedTopMoves.join(', ') : 'none'}`)
  console.log(`  top5 ${topFive.join(', ')}`)

  if (actual) {
    const actualTrace = runner.scoreMove({ board, moveObject: actual.moveObject, withTrace: true })
    printMoveTrace('chosen', actual, actualTrace, payload.compiled_program, parentMap)
  }

  if (representativeTop && (!actual || representativeTop.key !== actual.key || result.tiedTopMoveKeys.length > 1)) {
    const topTrace = runner.scoreMove({ board, moveObject: representativeTop.moveObject, withTrace: true })
    printMoveTrace('reference top', representativeTop, topTrace, payload.compiled_program, parentMap)
  }

  console.log('')

  shown += 1
  if (!Array.isArray(payload.plies) && !payload.show_all && shown >= payload.limit) {
    break
  }
}

if (shown === 0) {
  console.log(payload.show_all
    ? 'No plies matched the requested filter.'
    : 'No non-top-scored plies found for the requested filter. Re-run with --all to inspect top-scored choices too.')
}
