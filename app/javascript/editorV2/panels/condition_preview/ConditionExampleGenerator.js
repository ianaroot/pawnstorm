import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { adjacentPositions, controlledSquares, shieldedPositions } from 'gameplay/board_query_utils'

const MAX_DEFAULT_EXAMPLES = 6
const MAX_CANDIDATE_POOL = 120
const MAX_BUILD_ATTEMPTS = 1200
const MAX_REVERSE_MOVES_PER_OPTION = 4
const MAX_EXAMPLES_PER_BUCKET = 8
const MAX_EXAMPLES_PER_SKELETON = 3

const SUPPORTED_RELATIONAL_OPERATORS = new Set(['attack', 'defend', 'adjacent', 'shield'])
const SUPPORTED_RELATIONAL_ACTORS = new Set(['allied', 'enemy', 'moved_piece', 'enemy_moved_piece'])
const DISPLAY_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
const KING_CANDIDATE_POSITIONS = Object.freeze([
  square('b1'), square('g1'), square('a1'), square('h1'), square('c1'), square('f1'),
  square('b8'), square('g8'), square('a8'), square('h8'), square('c8'), square('f8')
])
const CENTRAL_POSITIONS = Object.freeze(
  ['c3', 'd3', 'e3', 'f3', 'c4', 'd4', 'e4', 'f4', 'c5', 'd5', 'e5', 'f5', 'c6', 'd6', 'e6', 'f6'].map(square)
)
const RAY_STEPS = Object.freeze([1, -1, 8, -8, 7, -7, 9, -9])

const FILTER_LABELS = Object.freeze({
  allied: 'Allied',
  enemy: 'Enemy',
  moved_piece: 'Moved piece',
  enemy_moved_piece: 'Enemy moved piece',
  captured_piece: 'Captured piece',
  enemy_captured_piece: 'Enemy captured piece'
})
const COUNT_COMPARISON_METRIC = 'count'
const EXACT_NUMBER_COMPARISON_SOURCE = 'exact_number'
const PRIOR_BOARD_COMPARISON_SOURCE = 'prior_board_state'

function square(value) {
  return Board.gridCalculatorReverse(value)
}

function emptyLayout() {
  return Array(64).fill(Board.EMPTY_SQUARE)
}

function pieceCode(team, species) {
  return `${team}${species}`
}

function pieceTeam(piece) {
  return piece ? piece[0] : null
}

function pieceSpecies(piece) {
  return piece ? piece[1] : null
}

function teamForActor(actor) {
  return actor === 'allied' || actor === 'moved_piece' ? Board.WHITE : Board.BLACK
}

function actorLabel(actor) {
  return FILTER_LABELS[actor] || actor
}

function roleRequiresMovedPiece(actor) {
  return actor === 'moved_piece'
}

function roleRequiresEnemyMovedPiece(actor) {
  return actor === 'enemy_moved_piece'
}

function comparisonDescriptors(payload) {
  return [
    {
      side: 'subject',
      metric: payload.subjectComparisonMetric,
      comparator: payload.subjectComparator,
      source: payload.subjectComparisonSource,
      total: payload.subjectComparisonSourceTotal
    },
    {
      side: 'target',
      metric: payload.targetComparisonMetric,
      comparator: payload.targetComparator,
      source: payload.targetComparisonSource,
      total: payload.targetComparisonSourceTotal
    }
  ].filter(descriptor => descriptor.metric && descriptor.comparator && (descriptor.source || descriptor.total !== undefined))
}

function supportStatus(payload) {
  if (!payload?.kind) {
    return { status: 'unsupported', reason: 'Condition preview is not available for this condition yet.' }
  }

  if (payload.kind !== 'relational') {
    return { status: 'unsupported', reason: 'Unary previews are not supported yet.' }
  }

  if (payload.operator === 'cover') {
    return { status: 'unsupported', reason: 'Cover previews are not supported yet.' }
  }

  if (!SUPPORTED_RELATIONAL_OPERATORS.has(payload.operator)) {
    return { status: 'unsupported', reason: `${payload.operator} previews are not supported yet.` }
  }

  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.subject)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.subject)} previews are not supported yet.` }
  }

  if (!SUPPORTED_RELATIONAL_ACTORS.has(payload.target)) {
    return { status: 'unsupported', reason: `${actorLabel(payload.target)} previews are not supported yet.` }
  }

  const comparisons = comparisonDescriptors(payload)
  if (comparisons.length > 0) {
    for (let index = 0; index < comparisons.length; index += 1) {
      const descriptor = comparisons[index]
      if (descriptor.source === PRIOR_BOARD_COMPARISON_SOURCE) {
        return {
          status: 'unsupported',
          reason: 'Prior-board relational comparisons are not supported yet.'
        }
      }
      if (descriptor.metric === 'value') {
        return {
          status: 'unsupported',
          reason: 'Value-based relational comparisons are not supported yet.'
        }
      }
      if (descriptor.metric !== COUNT_COMPARISON_METRIC) {
        return {
          status: 'unsupported',
          reason: `${descriptor.metric} relational comparisons are not supported yet.`
        }
      }
      if (descriptor.source !== EXACT_NUMBER_COMPARISON_SOURCE) {
        return {
          status: 'unsupported',
          reason: 'This relational comparison source is not supported yet.'
        }
      }
    }
  }

  return { status: 'supported', reason: null }
}

function speciesMatchesFilter(species, filter = 'any', filterMode = null) {
  if (filter === 'any') { return true }

  let matches
  switch (filter) {
    case 'king':
      matches = species === Board.KING
      break
    case 'queen':
      matches = species === Board.QUEEN
      break
    case 'rook':
      matches = species === Board.ROOK
      break
    case 'bishop':
      matches = species === Board.BISHOP
      break
    case 'knight':
      matches = species === Board.NIGHT
      break
    case 'pawn':
      matches = species === Board.PAWN
      break
    case 'major':
      matches = species === Board.ROOK || species === Board.QUEEN
      break
    case 'minor':
      matches = species === Board.NIGHT || species === Board.BISHOP
      break
    default:
      matches = false
  }

  return filterMode === 'exclude' ? !matches : matches
}

function candidateSpecies(filter = 'any', filterMode = null) {
  const pool = (filter === 'king' && filterMode !== 'exclude') ? [Board.KING] : [...DISPLAY_SPECIES]
  return pool.filter(species => speciesMatchesFilter(species, filter, filterMode))
}

function nextPositionOnRay(position, step) {
  const next = position + step
  if (!Board._inBounds(next)) { return null }
  const fileDelta = Math.abs((next % 8) - (position % 8))
  if (Math.abs(step) === 1 && fileDelta !== 1) { return null }
  if ((Math.abs(step) === 7 || Math.abs(step) === 9) && fileDelta !== 1) { return null }
  return next
}

function adjacentNeighborPositions(position) {
  const neighbors = []
  RAY_STEPS.forEach(step => {
    const next = nextPositionOnRay(position, step)
    if (next !== null) {
      neighbors.push(next)
    }
  })
  return neighbors
}

function positionsForSliderOrigins(endPosition, steps) {
  const origins = []
  steps.forEach(step => {
    for (let current = nextPositionOnRay(endPosition, step); current !== null; current = nextPositionOnRay(current, step)) {
      origins.push(current)
    }
  })
  return origins
}

function originCandidatesForSpecies(endPosition, species) {
  switch (species) {
    case Board.PAWN:
      return [endPosition - 8, endPosition - 16].filter(position => Board._inBounds(position))
    case Board.NIGHT:
      return [
        endPosition + 17, endPosition + 15, endPosition + 10, endPosition + 6,
        endPosition - 6, endPosition - 10, endPosition - 15, endPosition - 17
      ].filter(position => {
        if (!Board._inBounds(position)) { return false }
        const fileDiff = Math.abs((position % 8) - (endPosition % 8))
        const rankDiff = Math.abs(Math.floor(position / 8) - Math.floor(endPosition / 8))
        return (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1)
      })
    case Board.BISHOP:
      return positionsForSliderOrigins(endPosition, [7, -7, 9, -9])
    case Board.ROOK:
      return positionsForSliderOrigins(endPosition, [1, -1, 8, -8])
    case Board.QUEEN:
      return positionsForSliderOrigins(endPosition, [1, -1, 8, -8, 7, -7, 9, -9])
    case Board.KING:
      return [
        endPosition + 1, endPosition - 1, endPosition + 8, endPosition - 8,
        endPosition + 7, endPosition - 7, endPosition + 9, endPosition - 9
      ].filter(position => {
        if (!Board._inBounds(position)) { return false }
        const fileDiff = Math.abs((position % 8) - (endPosition % 8))
        const rankDiff = Math.abs(Math.floor(position / 8) - Math.floor(endPosition / 8))
        return Math.max(fileDiff, rankDiff) === 1
      })
    default:
      return []
  }
}

function unique(values) {
  return Array.from(new Set(values))
}

function shuffled(values, random) {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

function pushUnique(queue, seenKeys, entry, key) {
  if (seenKeys.has(key)) { return }
  seenKeys.add(key)
  queue.push(entry)
}

function clonePiecesMap(piecesMap) {
  return new Map(piecesMap)
}

function buildBoardFromLayout(layout, recentMoveContext = null) {
  return new Board({
    layOut: layout,
    capturedPieces: [],
    allowedToMove: Board.WHITE,
    movementNotation: [],
    recentMoveContext
  })
}

function layoutsMatch(left, right) {
  if (left.length !== right.length) { return false }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) { return false }
  }
  return true
}

function boardHasSafeKings(board) {
  const whiteKing = board._kingPosition(Board.WHITE)
  const blackKing = board._kingPosition(Board.BLACK)
  if (whiteKing === null || blackKing === null) { return false }

  const fileDiff = Math.abs((whiteKing % 8) - (blackKing % 8))
  const rankDiff = Math.abs(Math.floor(whiteKing / 8) - Math.floor(blackKing / 8))
  if (Math.max(fileDiff, rankDiff) <= 1) { return false }

  return (
    !Rules.pieceIsAttacked({ board, defensePosition: whiteKing, defendingTeam: Board.WHITE }) &&
    !Rules.pieceIsAttacked({ board, defensePosition: blackKing, defendingTeam: Board.BLACK })
  )
}

function relationSquareDistance(subjectPosition, targetPosition) {
  const fileDiff = Math.abs((subjectPosition % 8) - (targetPosition % 8))
  const rankDiff = Math.abs(Math.floor(subjectPosition / 8) - Math.floor(targetPosition / 8))
  return fileDiff + rankDiff
}

function sortByDistanceFromRelation(positions, relationPositions) {
  const distanceFor = (position) => relationPositions.reduce((best, relatedPosition) => {
    const fileDiff = Math.abs((position % 8) - (relatedPosition % 8))
    const rankDiff = Math.abs(Math.floor(position / 8) - Math.floor(relatedPosition / 8))
    return Math.min(best, fileDiff + rankDiff)
  }, Number.POSITIVE_INFINITY)

  return [...positions].sort((left, right) => distanceFor(right) - distanceFor(left))
}

function preferredExtraMovedSpecies(subjectSpecies, targetSpecies) {
  return unique([
    Board.NIGHT,
    Board.BISHOP,
    Board.ROOK,
    Board.QUEEN,
    Board.PAWN,
    subjectSpecies,
    targetSpecies
  ])
}

function buildEnemyRecentMoveContext(endPosition, species) {
  const candidates = originCandidatesForSpecies(endPosition, species).filter(position => position !== endPosition)
  const startPosition = candidates[0] || endPosition
  return {
    moveObject: { startPosition, endPosition },
    movingTeam: Board.BLACK,
    movedPieceStartPosition: startPosition,
    movedPieceEndPosition: endPosition,
    movedPieceSpeciesBeforeMove: species,
    movedPieceSpeciesAfterMove: species,
    capturedPiecePosition: null,
    capturedPieceTeam: null,
    capturedPieceSpecies: null
  }
}

function relationParams(payload) {
  return {
    subject: payload.subject,
    subjectFilter: payload.subjectFilter || 'any',
    subjectFilterMode: payload.subjectFilterMode || null,
    operator: payload.operator,
    target: payload.target,
    targetFilter: payload.targetFilter || 'any',
    targetFilterMode: payload.targetFilterMode || null
  }
}

function subjectTargetLabels(payload, moveObject, result) {
  const startPosition = moveObject.startPosition
  const endPosition = moveObject.endPosition
  const priorSubjectPositions = payload.subject === 'moved_piece' ? [startPosition] : result.subjectPositions
  const priorTargetPositions = payload.target === 'moved_piece' ? [startPosition] : result.targetPositions

  return {
    prior: {
      subjectPositions: priorSubjectPositions,
      targetPositions: priorTargetPositions,
      movedStartPosition: startPosition,
      movedEndPosition: null
    },
    after: {
      subjectPositions: result.subjectPositions,
      targetPositions: result.targetPositions,
      movedStartPosition: null,
      movedEndPosition: endPosition
    }
  }
}

function varietySignature(example) {
  const subjectPieces = example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  const targetPieces = example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  return [
    example.variantType,
    subjectPieces,
    targetPieces,
    example.geometryKey
  ].join(':')
}

function speciesPairSignature(example) {
  const subjectPieces = example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  const targetPieces = example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
  return `${subjectPieces}=>${targetPieces}`
}

function subjectSpeciesSignature(example) {
  return example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
}

function targetSpeciesSignature(example) {
  return example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
}

function buildExampleVariantPlan(payload) {
  if (roleRequiresMovedPiece(payload.subject) || roleRequiresMovedPiece(payload.target)) {
    return [{ type: 'required', label: 'Moved Piece Required' }]
  }

  const alliedRoles = [
    payload.subject === 'allied' ? 'subject' : null,
    payload.target === 'allied' ? 'target' : null
  ].filter(Boolean)

  if (alliedRoles.length === 0) {
    return [{ type: 'separate', label: 'Moved Piece Separate' }]
  }

  return [
    { type: 'involved', label: 'Moved Piece Involved' },
    { type: 'separate', label: 'Moved Piece Not Involved' }
  ]
}

function roleSquaresForMovedPiece(payload, skeleton) {
  const options = []
  if (payload.subject === 'moved_piece') {
    options.push({ square: skeleton.subjectPosition, species: skeleton.subjectSpecies, reason: 'required' })
  } else if (payload.target === 'moved_piece') {
    options.push({ square: skeleton.targetPosition, species: skeleton.targetSpecies, reason: 'required' })
  } else {
    if (payload.subject === 'allied') {
      options.push({ square: skeleton.subjectPosition, species: skeleton.subjectSpecies, reason: 'subject' })
    }
    if (payload.target === 'allied') {
      options.push({ square: skeleton.targetPosition, species: skeleton.targetSpecies, reason: 'target' })
    }
  }
  return options
}

function movedPieceOptionSets({ payload, skeleton, variant }) {
  if (variant.type === 'required') {
    return roleSquaresForMovedPiece(payload, skeleton).map(option => ({
      ...option,
      variantType: 'required'
    }))
  }

  if (variant.type === 'involved') {
    return roleSquaresForMovedPiece(payload, skeleton).map(option => ({
      ...option,
      variantType: 'involved'
    }))
  }

  const occupied = new Set(skeleton.pieces.keys())
  const relationPositions = [skeleton.subjectPosition, skeleton.targetPosition]
  const extraSquares = sortByDistanceFromRelation(
    Array.from({ length: 64 }, (_unused, index) => index).filter(index => !occupied.has(index)),
    relationPositions
  )

  const options = []
  preferredExtraMovedSpecies(skeleton.subjectSpecies, skeleton.targetSpecies).forEach(species => {
    extraSquares.forEach(squarePosition => {
      options.push({
        square: squarePosition,
        species,
        reason: 'separate',
        variantType: 'separate'
      })
    })
  })
  return options
}

function squareIsOccupied(pieces, position) {
  return pieces.has(position)
}

function buildLayoutFromPieces(pieces) {
  const layout = emptyLayout()
  pieces.forEach((piece, position) => {
    layout[position] = piece
  })
  return layout
}

function selectKingPair(basePieces, random) {
  const existingWhiteKings = []
  const existingBlackKings = []

  basePieces.forEach((piece, position) => {
    if (pieceSpecies(piece) !== Board.KING) { return }
    if (pieceTeam(piece) === Board.WHITE) {
      existingWhiteKings.push(position)
    } else if (pieceTeam(piece) === Board.BLACK) {
      existingBlackKings.push(position)
    }
  })

  if (existingWhiteKings.length > 1 || existingBlackKings.length > 1) { return null }

  const whiteCandidates = existingWhiteKings.length > 0
    ? existingWhiteKings
    : shuffled(KING_CANDIDATE_POSITIONS, random).filter(position => !squareIsOccupied(basePieces, position))
  const blackCandidates = existingBlackKings.length > 0
    ? existingBlackKings
    : shuffled(KING_CANDIDATE_POSITIONS, random).filter(position => !squareIsOccupied(basePieces, position))

  for (let whiteIndex = 0; whiteIndex < whiteCandidates.length; whiteIndex += 1) {
    const whiteKing = whiteCandidates[whiteIndex]
    if (existingWhiteKings.length === 0 && squareIsOccupied(basePieces, whiteKing)) { continue }

    for (let blackIndex = 0; blackIndex < blackCandidates.length; blackIndex += 1) {
      const blackKing = blackCandidates[blackIndex]
      if (whiteKing === blackKing) { continue }
      if (existingBlackKings.length === 0 && squareIsOccupied(basePieces, blackKing)) { continue }

      const fileDiff = Math.abs((whiteKing % 8) - (blackKing % 8))
      const rankDiff = Math.abs(Math.floor(whiteKing / 8) - Math.floor(blackKing / 8))
      if (Math.max(fileDiff, rankDiff) <= 1) { continue }

      const pieces = clonePiecesMap(basePieces)
      if (existingWhiteKings.length === 0) {
        pieces.set(whiteKing, pieceCode(Board.WHITE, Board.KING))
      }
      if (existingBlackKings.length === 0) {
        pieces.set(blackKing, pieceCode(Board.BLACK, Board.KING))
      }

      return pieces
    }
  }

  return null
}

function collectLegalReverseMoves({ afterPieces, movedPieceSquare, movedPieceSpecies, recentMoveContext, random, maxResults }) {
  const piecesWithKings = selectKingPair(afterPieces, random)
  if (!piecesWithKings) { return [] }

  const afterLayout = buildLayoutFromPieces(piecesWithKings)
  const afterBoard = buildBoardFromLayout(afterLayout, recentMoveContext)

  const originCandidates = shuffled(originCandidatesForSpecies(movedPieceSquare, movedPieceSpecies), random)
  const moves = []
  for (let index = 0; index < originCandidates.length; index += 1) {
    const originPosition = originCandidates[index]
    if (piecesWithKings.has(originPosition)) { continue }

    const priorPieces = clonePiecesMap(piecesWithKings)
    priorPieces.delete(movedPieceSquare)
    priorPieces.set(originPosition, pieceCode(Board.WHITE, movedPieceSpecies))
    const priorLayout = buildLayoutFromPieces(priorPieces)
    const priorBoard = buildBoardFromLayout(priorLayout, recentMoveContext)

    let moveObject
    try {
      moveObject = Rules.getMoveObject(originPosition, movedPieceSquare, priorBoard)
    } catch {
      continue
    }
    if (moveObject.illegal || moveObject.additionalActions || moveObject.promotionPiece || moveObject.captureNotation) { continue }

    const rebuiltAfter = priorBoard.lightClone()
    rebuiltAfter._hypotheticallyMovePiece(moveObject)
    if (!layoutsMatch(rebuiltAfter.layOut, afterLayout)) { continue }

    moves.push({
      priorBoard,
      moveObject,
      afterBoard
    })
    if (moves.length >= maxResults) { break }
  }

  return moves
}

function evaluateCandidate({ payload, priorBoard, moveObject }) {
  const evaluator = new ConditionEvaluatorV2()
  const input = { board: priorBoard, moveObject }
  if (!evaluator.evaluate(payload, input)) { return null }

  const analysis = new CandidateMoveAnalysisV2({ board: priorBoard, moveObject })
  const result = analysis.relationalResult(relationParams(payload))
  if (result.pairs.length === 0) { return null }

  return result
}

function desiredCountForComparison(descriptor) {
  const total = Number(descriptor.total || 0)
  switch (descriptor.comparator) {
    case 'equal_to':
      return total
    case 'greater_than':
      return total + 1
    case 'greater_than_or_equal_to':
      return Math.max(1, total)
    case 'less_than':
      return total > 0 ? total - 1 : 0
    case 'less_than_or_equal_to':
      return total > 0 ? 1 : 0
    default:
      return null
  }
}

function comparisonRequirements(payload) {
  const requirements = {
    subject: 1,
    target: 1,
    comparisonsPresent: false
  }

  comparisonDescriptors(payload).forEach(descriptor => {
    requirements.comparisonsPresent = true
    requirements[descriptor.side] = desiredCountForComparison(descriptor)
  })

  return requirements
}

function sideSpeciesPool(payload, side) {
  const filter = side === 'subject' ? (payload.subjectFilter || 'any') : (payload.targetFilter || 'any')
  const filterMode = side === 'subject' ? (payload.subjectFilterMode || null) : (payload.targetFilterMode || null)
  return candidateSpecies(filter, filterMode)
}

function buildAttackOrDefendContributionCandidates({ payload, side, anchorPosition, occupied, random }) {
  if (side === 'subject') {
    const subjectTeam = teamForActor(payload.subject)
    return shuffled(sideSpeciesPool(payload, 'subject'), random).flatMap(species => {
      const positions = []
      for (let position = 0; position < 64; position += 1) {
        if (occupied.has(position) || position === anchorPosition) { continue }
        const board = buildBoardFromLayout(buildLayoutFromPieces(new Map([
          [position, pieceCode(subjectTeam, species)]
        ])))
        if (controlledSquares({ board, attackerPosition: position }).includes(anchorPosition)) {
          positions.push({
            side: 'subject',
            position,
            species,
            piece: pieceCode(subjectTeam, species)
          })
        }
      }
      return shuffled(positions, random)
    })
  }

  const board = buildBoardFromLayout(buildLayoutFromPieces(occupied))
  return shuffled(controlledSquares({ board, attackerPosition: anchorPosition }), random)
    .filter(position => !occupied.has(position))
    .flatMap(position => {
      return shuffled(sideSpeciesPool(payload, 'target'), random).map(species => ({
        side: 'target',
        position,
        species,
        piece: pieceCode(teamForActor(payload.target), species)
      }))
    })
}

function buildAdjacentContributionCandidates({ payload, side, anchorPosition, occupied, random }) {
  const team = side === 'subject' ? teamForActor(payload.subject) : teamForActor(payload.target)
  const speciesPool = sideSpeciesPool(payload, side)
  return shuffled(adjacentNeighborPositions(anchorPosition), random)
    .filter(position => !occupied.has(position) && position !== anchorPosition)
    .flatMap(position => {
      return shuffled(speciesPool, random).map(species => ({
        side,
        position,
        species,
        piece: pieceCode(team, species)
      }))
    })
}

function nextAvailableIndependentSkeletons({ payload, occupied, random }) {
  const subjectSpeciesPool = shuffled(sideSpeciesPool(payload, 'subject'), random)
  const targetSpeciesPool = shuffled(sideSpeciesPool(payload, 'target'), random)
  const skeletons = []

  subjectSpeciesPool.forEach(subjectSpecies => {
    targetSpeciesPool.forEach(targetSpecies => {
      buildCandidateSkeletons({ payload, subjectSpecies, targetSpecies }).forEach(skeleton => {
        const positions = Array.from(skeleton.pieces.keys())
        if (positions.some(position => occupied.has(position))) { return }
        skeletons.push(skeleton)
      })
    })
  })

  return shuffled(skeletons, random)
}

function addContributorsForSide({ payload, pieces, side, neededCount, anchorPosition, random }) {
  if (neededCount <= 0) { return true }

  const occupied = new Map(pieces)
  const candidates = payload.operator === 'adjacent'
    ? buildAdjacentContributionCandidates({ payload, side, anchorPosition, occupied, random })
    : buildAttackOrDefendContributionCandidates({ payload, side, anchorPosition, occupied, random })

  let added = 0
  for (let index = 0; index < candidates.length && added < neededCount; index += 1) {
    const candidate = candidates[index]
    if (pieces.has(candidate.position)) { continue }
    pieces.set(candidate.position, candidate.piece)
    added += 1
  }

  return added === neededCount
}

function augmentExistingRelation({ payload, skeleton, requirements, random }) {
  const desiredSubjectCount = requirements.subject
  const desiredTargetCount = requirements.target
  const subjectIncrement = Math.max(0, desiredSubjectCount - 1)
  const targetIncrement = Math.max(0, desiredTargetCount - 1)

  if (payload.operator === 'shield' && desiredSubjectCount !== desiredTargetCount) {
    return []
  }

  const pieces = clonePiecesMap(skeleton.pieces)

  if (payload.operator === 'shield') {
    let extraSubjectsNeeded = subjectIncrement
    let extraTargetsNeeded = targetIncrement

    while (extraSubjectsNeeded > 0 || extraTargetsNeeded > 0) {
      const independentSkeletons = nextAvailableIndependentSkeletons({ payload, occupied: pieces, random })
      const extraSkeleton = independentSkeletons[0]
      if (!extraSkeleton) { break }

      extraSkeleton.pieces.forEach((piece, position) => {
        pieces.set(position, piece)
      })
      extraSubjectsNeeded = Math.max(0, extraSubjectsNeeded - 1)
      extraTargetsNeeded = Math.max(0, extraTargetsNeeded - 1)
    }

    if (extraSubjectsNeeded > 0 || extraTargetsNeeded > 0) { return [] }
    return [{
      ...skeleton,
      pieces,
      geometryKey: `${skeleton.geometryKey}:count:${desiredSubjectCount}:${desiredTargetCount}`
    }]
  }

  const subjectOkay = addContributorsForSide({
    payload,
    pieces,
    side: 'subject',
    neededCount: subjectIncrement,
    anchorPosition: skeleton.targetPosition,
    random
  })
  if (!subjectOkay) { return [] }

  const targetOkay = addContributorsForSide({
    payload,
    pieces,
    side: 'target',
    neededCount: targetIncrement,
    anchorPosition: skeleton.subjectPosition,
    random
  })
  if (!targetOkay) { return [] }

  return [{
    ...skeleton,
    pieces,
    geometryKey: `${skeleton.geometryKey}:count:${desiredSubjectCount}:${desiredTargetCount}`
  }]
}

function zeroComparisonPossible(requirements) {
  const desiredSubjectCount = requirements.subject
  const desiredTargetCount = requirements.target
  return desiredSubjectCount === 0 && desiredTargetCount === 0
}

function buildZeroRelationExample({ payload, random }) {
  const subjectSpeciesPool = shuffled(sideSpeciesPool(payload, 'subject'), random)
  const targetSpeciesPool = shuffled(sideSpeciesPool(payload, 'target'), random)
  const movedSpeciesPool = shuffled(unique([
    Board.NIGHT,
    Board.BISHOP,
    ...subjectSpeciesPool,
    ...targetSpeciesPool
  ]), random)
  const subjectTeam = teamForActor(payload.subject)
  const targetTeam = teamForActor(payload.target)
  const subjectPositions = [square('a4'), square('b5'), square('c6'), square('d7')]
  const targetPositions = [square('h4'), square('g5'), square('f6'), square('e7')]
  const movedEndPositions = [square('e2'), square('d2'), square('f2'), square('c2')]

  for (let movedIndex = 0; movedIndex < movedSpeciesPool.length; movedIndex += 1) {
    for (let endIndex = 0; endIndex < movedEndPositions.length; endIndex += 1) {
      const movedSpecies = movedSpeciesPool[movedIndex]
      const movedPieceSquare = movedEndPositions[endIndex]
      const pieces = new Map([[movedPieceSquare, pieceCode(Board.WHITE, movedSpecies)]])

      if (payload.subject !== 'moved_piece') {
        const subjectSpecies = subjectSpeciesPool[0]
        if (!subjectSpecies) { continue }
        pieces.set(subjectPositions[0], pieceCode(subjectTeam, subjectSpecies))
      }

      if (payload.target !== 'moved_piece') {
        const targetSpecies = targetSpeciesPool[0]
        if (!targetSpecies) { continue }
        pieces.set(targetPositions[0], pieceCode(targetTeam, targetSpecies))
      }

      const recentMoveContext = roleRequiresEnemyMovedPiece(payload.subject)
        ? buildEnemyRecentMoveContext(subjectPositions[1], subjectSpeciesPool[0] || Board.NIGHT)
        : roleRequiresEnemyMovedPiece(payload.target)
          ? buildEnemyRecentMoveContext(targetPositions[1], targetSpeciesPool[0] || Board.PAWN)
          : null

      if (roleRequiresEnemyMovedPiece(payload.subject)) {
        pieces.set(subjectPositions[1], pieceCode(Board.BLACK, subjectSpeciesPool[0] || Board.NIGHT))
      }
      if (roleRequiresEnemyMovedPiece(payload.target)) {
        pieces.set(targetPositions[1], pieceCode(Board.BLACK, targetSpeciesPool[0] || Board.PAWN))
      }

      const moveExamples = collectLegalReverseMoves({
        afterPieces: pieces,
        movedPieceSquare,
        movedPieceSpecies: movedSpecies,
        recentMoveContext,
        random,
        maxResults: 1
      })

      for (let moveIndex = 0; moveIndex < moveExamples.length; moveIndex += 1) {
        const moveExample = moveExamples[moveIndex]
        const evaluator = new ConditionEvaluatorV2()
        const input = {
          board: moveExample.priorBoard,
          moveObject: moveExample.moveObject
        }
        if (!evaluator.evaluate(payload, input)) { continue }

        const analysis = new CandidateMoveAnalysisV2(input)
        const result = analysis.relationalResult(relationParams(payload))

        return {
          priorBoard: moveExample.priorBoard,
          afterBoard: moveExample.afterBoard,
          moveObject: moveExample.moveObject,
          result,
          highlights: subjectTargetLabels(payload, moveExample.moveObject, result),
          label: '',
          variantType: 'required',
          geometryKey: `zero:${movedPieceSquare}:${movedSpecies}`,
          compactnessPenalty: compactPairCountPenalty(result),
          movedPieceInRelation: false
        }
      }
    }
  }

  return null
}

function augmentSkeletonsForComparisons({ payload, skeleton, random }) {
  const requirements = comparisonRequirements(payload)
  if (!requirements.comparisonsPresent) { return [skeleton] }
  if (requirements.subject === null || requirements.target === null) { return [] }
  if (requirements.subject < 0 || requirements.target < 0) { return [] }
  if (zeroComparisonPossible(requirements)) { return [] }
  if (requirements.subject === 0 || requirements.target === 0) { return [] }

  return augmentExistingRelation({ payload, skeleton, requirements, random })
}

function compactPairCountPenalty(result) {
  return (
    Math.max(0, result.pairs.length - 1) +
    Math.max(0, result.subjectPositions.length - 1) +
    Math.max(0, result.targetPositions.length - 1)
  )
}

function buildCandidateSkeletons({ payload, subjectSpecies, targetSpecies }) {
  switch (payload.operator) {
    case 'attack':
    case 'defend':
      return buildControlSkeletons({ payload, subjectSpecies, targetSpecies })
    case 'adjacent':
      return buildAdjacentSkeletons({ payload, subjectSpecies, targetSpecies })
    case 'shield':
      return buildShieldSkeletons({ payload, subjectSpecies, targetSpecies })
    default:
      return []
  }
}

function buildControlSkeletons({ payload, subjectSpecies, targetSpecies }) {
  const skeletons = []
  CENTRAL_POSITIONS.forEach(subjectPosition => {
    const pieces = new Map([[subjectPosition, pieceCode(teamForActor(payload.subject), subjectSpecies)]])
    const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
    controlledSquares({ board, attackerPosition: subjectPosition }).forEach(targetPosition => {
      if (subjectPosition === targetPosition) { return }
      const targetPiece = pieceCode(teamForActor(payload.target), targetSpecies)
      if (pieces.has(targetPosition)) { return }

      const relationPieces = clonePiecesMap(pieces)
      relationPieces.set(targetPosition, targetPiece)
      skeletons.push({
        pieces: relationPieces,
        subjectPosition,
        targetPosition,
        subjectSpecies,
        targetSpecies,
        geometryKey: `control:${subjectPosition}:${targetPosition}`
      })
    })
  })
  return skeletons
}

function buildAdjacentSkeletons({ payload, subjectSpecies, targetSpecies }) {
  const skeletons = []
  CENTRAL_POSITIONS.forEach(subjectPosition => {
    const pieces = new Map([[subjectPosition, pieceCode(teamForActor(payload.subject), subjectSpecies)]])
    const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
    adjacentPositions({ board, targetPosition: subjectPosition, team: teamForActor(payload.target) })
      .filter(position => position !== subjectPosition)
      .forEach(targetPosition => {
        const relationPieces = clonePiecesMap(pieces)
        relationPieces.set(targetPosition, pieceCode(teamForActor(payload.target), targetSpecies))
        skeletons.push({
          pieces: relationPieces,
          subjectPosition,
          targetPosition,
          subjectSpecies,
          targetSpecies,
          geometryKey: `adjacent:${subjectPosition}:${targetPosition}`
        })
      })

    RAY_STEPS.forEach(step => {
      const targetPosition = nextPositionOnRay(subjectPosition, step)
      if (targetPosition === null) { return }
      const relationPieces = clonePiecesMap(pieces)
      relationPieces.set(targetPosition, pieceCode(teamForActor(payload.target), targetSpecies))
      skeletons.push({
        pieces: relationPieces,
        subjectPosition,
        targetPosition,
        subjectSpecies,
        targetSpecies,
        geometryKey: `adjacent:${subjectPosition}:${targetPosition}`
      })
    })
  })
  return skeletons
}

function shieldAttackerSpeciesForStep(step) {
  if (Math.abs(step) === 1 || Math.abs(step) === 8) {
    return [Board.ROOK, Board.QUEEN]
  }
  return [Board.BISHOP, Board.QUEEN]
}

function buildShieldSkeletons({ payload, subjectSpecies, targetSpecies }) {
  const skeletons = []
  const attackerTeam = Board.opposingTeam(teamForActor(payload.target))
  CENTRAL_POSITIONS.forEach(subjectPosition => {
    RAY_STEPS.forEach(step => {
      const targetPosition = nextPositionOnRay(subjectPosition, step)
      if (targetPosition === null) { return }

      for (let distance = 1; distance <= 3; distance += 1) {
        let attackerPosition = subjectPosition
        for (let count = 0; count < distance; count += 1) {
          attackerPosition = nextPositionOnRay(attackerPosition, -step)
          if (attackerPosition === null) { break }
        }
        if (attackerPosition === null) { continue }

        shieldAttackerSpeciesForStep(step).forEach(attackerSpecies => {
          const relationPieces = new Map([
            [subjectPosition, pieceCode(teamForActor(payload.subject), subjectSpecies)],
            [targetPosition, pieceCode(teamForActor(payload.target), targetSpecies)],
            [attackerPosition, pieceCode(attackerTeam, attackerSpecies)]
          ])
          const board = buildBoardFromLayout(buildLayoutFromPieces(relationPieces))
          const shielded = shieldedPositions({ board, sourcePosition: subjectPosition, team: teamForActor(payload.target) })
          if (!shielded.includes(targetPosition)) { return }

          skeletons.push({
            pieces: relationPieces,
            subjectPosition,
            targetPosition,
            subjectSpecies,
            targetSpecies,
            geometryKey: `shield:${subjectPosition}:${targetPosition}:${attackerPosition}:${attackerSpecies}`
          })
        })
      }
    })
  })
  return skeletons
}

function candidateLabel(variant, payload) {
  if (variant.type === 'required') {
    return ''
  }
  return variant.label
}

function workItemKey(item) {
  return [
    item.subjectSpecies,
    item.targetSpecies,
    item.variant.type,
    item.skeleton.geometryKey
  ].join('|')
}

function candidateIdentity(example) {
  return [
    example.moveObject.startPosition,
    example.moveObject.endPosition,
    example.geometryKey,
    subjectSpeciesSignature(example),
    targetSpeciesSignature(example),
    example.variantType
  ].join(':')
}

function bucketKeyForExample(example) {
  return [
    subjectSpeciesSignature(example),
    targetSpeciesSignature(example),
    example.variantType
  ].join('|')
}

function sortedByCompactness(candidates) {
  return [...candidates].sort((left, right) => {
    if (left.compactnessPenalty !== right.compactnessPenalty) {
      return left.compactnessPenalty - right.compactnessPenalty
    }

    return relationSquareDistance(left.result.subjectPositions[0], left.result.targetPositions[0]) -
      relationSquareDistance(right.result.subjectPositions[0], right.result.targetPositions[0])
  })
}

function collectVerifiedExamples({ payload, skeleton, variant, random }) {
  const recentMoveContext = roleRequiresEnemyMovedPiece(payload.subject)
    ? buildEnemyRecentMoveContext(skeleton.subjectPosition, skeleton.subjectSpecies)
    : roleRequiresEnemyMovedPiece(payload.target)
      ? buildEnemyRecentMoveContext(skeleton.targetPosition, skeleton.targetSpecies)
      : null

  const movedOptions = shuffled(movedPieceOptionSets({ payload, skeleton, variant }), random)
  const examples = []
  const seenCandidates = new Set()

  for (let index = 0; index < movedOptions.length; index += 1) {
    const movedOption = movedOptions[index]
    const afterPieces = clonePiecesMap(skeleton.pieces)
    afterPieces.set(movedOption.square, pieceCode(Board.WHITE, movedOption.species))

    const moveExamples = collectLegalReverseMoves({
      afterPieces,
      movedPieceSquare: movedOption.square,
      movedPieceSpecies: movedOption.species,
      recentMoveContext,
      random,
      maxResults: MAX_REVERSE_MOVES_PER_OPTION
    })

    for (let moveIndex = 0; moveIndex < moveExamples.length; moveIndex += 1) {
      const moveExample = moveExamples[moveIndex]
      const result = evaluateCandidate({
        payload,
        priorBoard: moveExample.priorBoard,
        moveObject: moveExample.moveObject
      })
      if (!result) { continue }

      const movedPieceInRelation = (
        result.subjectPositions.includes(moveExample.moveObject.endPosition) ||
        result.targetPositions.includes(moveExample.moveObject.endPosition)
      )

      if (variant.type === 'involved' && !movedPieceInRelation) { continue }
      if (variant.type === 'separate' && movedPieceInRelation) { continue }

      const example = {
        priorBoard: moveExample.priorBoard,
        afterBoard: moveExample.afterBoard,
        moveObject: moveExample.moveObject,
        result,
        highlights: subjectTargetLabels(payload, moveExample.moveObject, result),
        label: candidateLabel(variant, payload),
        variantType: movedPieceInRelation ? 'involved' : 'separate',
        geometryKey: skeleton.geometryKey,
        compactnessPenalty: compactPairCountPenalty(result),
        movedPieceInRelation
      }
      const identity = candidateIdentity(example)
      if (seenCandidates.has(identity)) { continue }

      seenCandidates.add(identity)
      examples.push(example)
      if (examples.length >= MAX_EXAMPLES_PER_SKELETON) {
        return examples
      }
    }
  }

  return examples
}

function roundRobinAppend({ selected, candidatesByKey, maxExamples, seenIdentities }) {
  const queue = Array.from(candidatesByKey.entries()).map(([key, candidates]) => ({
    key,
    candidates: sortedByCompactness(candidates)
  }))
  let added = false

  while (selected.length < maxExamples) {
    let progressed = false

    for (let index = 0; index < queue.length && selected.length < maxExamples; index += 1) {
      const bucket = queue[index]
      while (bucket.candidates.length > 0 && seenIdentities.has(candidateIdentity(bucket.candidates[0]))) {
        bucket.candidates.shift()
      }
      if (bucket.candidates.length === 0) { continue }

      const next = bucket.candidates.shift()
      selected.push(next)
      seenIdentities.add(candidateIdentity(next))
      progressed = true
      added = true
    }

    if (!progressed) { break }
  }

  return added
}

function selectDiverseExamples(candidates, maxExamples) {
  if (candidates.length <= maxExamples) { return sortedByCompactness(candidates) }

  const selected = []
  const seenIdentities = new Set()
  const subjectBuckets = new Map()
  const targetBuckets = new Map()
  const pairBuckets = new Map()
  const variantBuckets = new Map()

  candidates.forEach(candidate => {
    const subjectKey = subjectSpeciesSignature(candidate)
    const targetKey = targetSpeciesSignature(candidate)
    const pairKey = speciesPairSignature(candidate)
    const variantKey = candidate.variantType

    if (!subjectBuckets.has(subjectKey)) { subjectBuckets.set(subjectKey, []) }
    if (!targetBuckets.has(targetKey)) { targetBuckets.set(targetKey, []) }
    if (!pairBuckets.has(pairKey)) { pairBuckets.set(pairKey, []) }
    if (!variantBuckets.has(variantKey)) { variantBuckets.set(variantKey, []) }

    subjectBuckets.get(subjectKey).push(candidate)
    targetBuckets.get(targetKey).push(candidate)
    pairBuckets.get(pairKey).push(candidate)
    variantBuckets.get(variantKey).push(candidate)
  })

  roundRobinAppend({ selected, candidatesByKey: subjectBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: targetBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: pairBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: variantBuckets, maxExamples, seenIdentities })

  if (selected.length >= maxExamples) {
    return selected.slice(0, maxExamples)
  }

  const remaining = sortedByCompactness(candidates).filter(candidate => !seenIdentities.has(candidateIdentity(candidate)))
  for (let index = 0; index < remaining.length && selected.length < maxExamples; index += 1) {
    selected.push(remaining[index])
  }

  return selected
}

function buildWorkItems({ payload, subjectSpeciesPool, targetSpeciesPool, variants, random }) {
  const items = []

  subjectSpeciesPool.forEach(subjectSpecies => {
    targetSpeciesPool.forEach(targetSpecies => {
      const skeletons = shuffled(buildCandidateSkeletons({ payload, subjectSpecies, targetSpecies }), random)
      skeletons.forEach(skeleton => {
        variants.forEach(variant => {
          items.push({ subjectSpecies, targetSpecies, skeleton, variant })
        })
      })
    })
  })

  return shuffled(items, random)
}

function scheduleWorkItems(items, random) {
  const queue = []
  const seen = new Set()
  const bySubject = new Map()
  const byTarget = new Map()
  const byPair = new Map()

  items.forEach(item => {
    const subjectKey = item.subjectSpecies
    const targetKey = item.targetSpecies
    const pairKey = `${subjectKey}|${targetKey}`

    if (!bySubject.has(subjectKey)) { bySubject.set(subjectKey, []) }
    if (!byTarget.has(targetKey)) { byTarget.set(targetKey, []) }
    if (!byPair.has(pairKey)) { byPair.set(pairKey, []) }

    bySubject.get(subjectKey).push(item)
    byTarget.get(targetKey).push(item)
    byPair.get(pairKey).push(item)
  })

  const roundRobinAppend = (groups) => {
    const buckets = shuffled(Array.from(groups.values()).map(group => shuffled(group, random)), random)
    let progressed = true

    while (progressed) {
      progressed = false
      buckets.forEach(bucket => {
        const item = bucket.shift()
        if (!item) { return }
        pushUnique(queue, seen, item, workItemKey(item))
        progressed = true
      })
    }
  }

  roundRobinAppend(bySubject)
  roundRobinAppend(byTarget)
  roundRobinAppend(byPair)
  shuffled(items, random).forEach(item => {
    pushUnique(queue, seen, item, workItemKey(item))
  })

  return queue
}

export function generateConditionExamples(payload, options = {}) {
  const maxExamples = options.maxExamples || MAX_DEFAULT_EXAMPLES
  const random = options.random || Math.random
  const support = supportStatus(payload)
  if (support.status !== 'supported') {
    return {
      status: support.status,
      reason: support.reason,
      examples: []
    }
  }

  const variants = buildExampleVariantPlan(payload)
  const subjectSpeciesPool = shuffled(candidateSpecies(payload.subjectFilter || 'any', payload.subjectFilterMode || null), random)
  const targetSpeciesPool = shuffled(candidateSpecies(payload.targetFilter || 'any', payload.targetFilterMode || null), random)
  const workQueue = scheduleWorkItems(
    buildWorkItems({ payload, subjectSpeciesPool, targetSpeciesPool, variants, random }),
    random
  )
  const buckets = new Map()
  const seenSignatures = new Set()
  let totalExamples = 0
  let attempts = 0

  for (let index = 0; index < workQueue.length; index += 1) {
    attempts += 1
    if (attempts > MAX_BUILD_ATTEMPTS || totalExamples >= MAX_CANDIDATE_POOL) { break }

    const item = workQueue[index]
    const augmentedSkeletons = augmentSkeletonsForComparisons({
      payload,
      skeleton: item.skeleton,
      random
    })

    for (let skeletonIndex = 0; skeletonIndex < augmentedSkeletons.length; skeletonIndex += 1) {
      const examples = collectVerifiedExamples({
        payload,
        skeleton: augmentedSkeletons[skeletonIndex],
        variant: item.variant,
        random
      })

      for (let exampleIndex = 0; exampleIndex < examples.length; exampleIndex += 1) {
        const example = examples[exampleIndex]
        const signature = varietySignature(example)
        if (seenSignatures.has(signature)) { continue }

        const key = bucketKeyForExample(example)
        const bucket = buckets.get(key) || []
        if (bucket.length >= MAX_EXAMPLES_PER_BUCKET) { continue }

        seenSignatures.add(signature)
        bucket.push(example)
        buckets.set(key, bucket)
        totalExamples += 1

        if (totalExamples >= MAX_CANDIDATE_POOL) { break }
      }

      if (totalExamples >= MAX_CANDIDATE_POOL) { break }
    }
  }

  const verified = Array.from(buckets.values()).flat()
  if (verified.length === 0 && zeroComparisonPossible(comparisonRequirements(payload))) {
    const zeroExample = buildZeroRelationExample({ payload, random })
    if (zeroExample) {
      return {
        status: 'ready',
        reason: null,
        examples: [zeroExample]
      }
    }
  }

  if (verified.length === 0) {
    return {
      status: 'no_examples',
      reason: "Couldn't build a verified example for this condition yet. This may mean the condition is unsatisfiable, or that the preview generator still needs work.",
      examples: []
    }
  }

  return {
    status: 'ready',
    reason: null,
    examples: selectDiverseExamples(verified, maxExamples)
  }
}

export default generateConditionExamples
