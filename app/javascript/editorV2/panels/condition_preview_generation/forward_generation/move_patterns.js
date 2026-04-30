import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { nextPositionOnRay, controlledSquares } from 'gameplay/board_query_utils'
import {
  RAY_STEPS, shieldAttackerSpeciesForStep, originCandidatesForSpecies,
  adjacentNeighborPositions
} from 'editorV2/panels/condition_preview/geometry_utils'
import { candidateSpecies, legalPriorTurnState } from 'editorV2/panels/condition_preview/example_utils'
import {
  buildBoardFromLayout, buildLayoutFromPieces, pieceCode
} from 'editorV2/panels/condition_preview/board_utils'
import { placePiece } from '../piece_placement'
import { placeKingsIfAbsent } from '../board_utils'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))

// ===== Helpers =====

function pickRandom(values, random) {
  if (!values || values.length === 0) { return null }
  return values[Math.floor(random() * values.length)]
}

function shuffled(values, random) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function randomPosition(random, exclude = new Set()) {
  const free = ALL_POSITIONS.filter(p => !exclude.has(p))
  return pickRandom(free, random)
}

function freeSquares(pieces, exclude = new Set()) {
  return ALL_POSITIONS.filter(p => !pieces.has(p) && !exclude.has(p))
}

function speciesAttacksFrom({ species, origin, currentPieces }) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(new Map([[origin, pieceCode(Board.WHITE, species)]])))
  return new Set(controlledSquares({ board, attackerPosition: origin }))
}

function originsThatReach({ destination, species, occupied }) {
  return originCandidatesForSpecies(destination, species).filter(p => p !== destination && !occupied.has(p))
}

function controlledFromPosition({ position, currentPieces }) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(currentPieces))
  return new Set(controlledSquares({ board, attackerPosition: position }))
}

function relationDestinations({ operator, anchorPosition, species, currentPieces, occupiedExtras = new Set() }) {
  const occupied = new Set([...currentPieces.keys(), ...occupiedExtras])
  switch (operator) {
    case 'attack':
    case 'defend':
      return originCandidatesForSpecies(anchorPosition, species)
        .filter(p => p !== anchorPosition && !occupied.has(p))
    case 'adjacent':
      return adjacentNeighborPositions(anchorPosition)
        .filter(p => p !== null && p !== anchorPosition && !occupied.has(p))
    default:
      return []
  }
}

function piecesIntoBoard(pieces, allowedToMove) {
  const layout = buildLayoutFromPieces(pieces)
  return buildBoardFromLayout(layout, null, allowedToMove)
}

function tryFinalize({ pieces, moverOrigin, moverEnd, movingTeam, random, requireCapture = false }) {
  const piecesWithKings = placeKingsIfAbsent(pieces, random)
  if (piecesWithKings === null) { return null }
  const priorBoard = piecesIntoBoard(piecesWithKings, movingTeam)
  let moveObject
  try { moveObject = Rules.getMoveObject(moverOrigin, moverEnd, priorBoard) } catch { return null }
  if (moveObject.illegal) { return null }
  if (requireCapture && !moveObject.captureNotation) { return null }
  if (!legalPriorTurnState(priorBoard, moveObject)) { return null }
  return { priorBoard, moveObject }
}

function pickMoverSpecies(plan, side, random) {
  const pool = side === 'subject' ? plan.subjectSpeciesPool : plan.targetSpeciesPool
  return pickRandom(pool, random) ?? null
}

// ===== Pattern E (shield-decrease via capture) =====
// Move captures an enemy shielder, decreasing shield count.

function generateShieldDecreaseCapture({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (plan.operator !== 'shield' || driver.pbsDirection !== '-') { return null }

  const movingTeam = combinedPlan.movingTeam
  const targetTeam = plan.targetTeam

  const targetSpecies = pickRandom(plan.targetSpeciesPool, random)
  if (!targetSpecies) { return null }
  const targetPos = randomPosition(random)
  if (targetPos === null) { return null }
  let pieces = placePiece(new Map(), targetPos, pieceCode(targetTeam, targetSpecies))
  if (!pieces) { return null }

  const step = pickRandom([...RAY_STEPS], random)
  const shielderPos = nextPositionOnRay(targetPos, -step)
  if (shielderPos === null) { return null }

  const attackerDistance = 1 + Math.floor(random() * 3)
  let attackerPos = shielderPos
  for (let i = 0; i < attackerDistance; i += 1) {
    attackerPos = nextPositionOnRay(attackerPos, -step)
    if (attackerPos === null) { return null }
  }

  const shielderSpecies = pickRandom(plan.subjectSpeciesPool, random)
  if (!shielderSpecies) { return null }
  pieces = placePiece(pieces, shielderPos, pieceCode(plan.subjectTeam, shielderSpecies))
  if (!pieces) { return null }

  const attackerSpecies = pickRandom(shieldAttackerSpeciesForStep(step), random)
  if (!attackerSpecies) { return null }
  pieces = placePiece(pieces, attackerPos, pieceCode(Board.opposingTeam(targetTeam), attackerSpecies))
  if (!pieces) { return null }

  const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING)
  const moverSpecies = pickRandom(shuffled(moverPool, random), random)
  if (!moverSpecies) { return null }

  const occupiedKeys = new Set(pieces.keys())
  const origins = shuffled(originsThatReach({ destination: shielderPos, species: moverSpecies, occupied: occupiedKeys }), random)
  for (const origin of origins) {
    const trial = placePiece(pieces, origin, pieceCode(movingTeam, moverSpecies))
    if (!trial) { continue }
    const finalized = tryFinalize({ pieces: trial, moverOrigin: origin, moverEnd: shielderPos, movingTeam, random, requireCapture: true })
    if (finalized) { return finalized }
  }
  return null
}

// ===== Pattern A (mover becomes subject) for attack/defend/adjacent =====
// Mover ends at a position with [operator] relation to target.
// Mover at origin does not have that relation. Hence count increases.

function generateMoverBecomesSubject({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (driver.pbsDirection !== '+') { return null }
  if (!['attack', 'defend', 'adjacent'].includes(plan.operator)) { return null }
  if (plan.subjectTeam !== combinedPlan.movingTeam) { return null }

  const movingTeam = combinedPlan.movingTeam

  const targetSpecies = pickRandom(plan.targetSpeciesPool, random)
  if (!targetSpecies) { return null }
  const targetPos = randomPosition(random)
  if (targetPos === null) { return null }
  let pieces = placePiece(new Map(), targetPos, pieceCode(plan.targetTeam, targetSpecies))
  if (!pieces) { return null }

  const moverSpecies = pickRandom(plan.subjectSpeciesPool, random)
  if (!moverSpecies) { return null }

  const occupiedKeys = new Set(pieces.keys())
  const endCandidates = shuffled(
    relationDestinations({ operator: plan.operator, anchorPosition: targetPos, species: moverSpecies, currentPieces: pieces }),
    random
  )

  for (const moverEnd of endCandidates) {
    // Find an origin that reaches moverEnd but doesn't have the relation to target.
    const reachOrigins = originsThatReach({ destination: moverEnd, species: moverSpecies, occupied: new Set([...occupiedKeys, moverEnd]) })
    const relationOrigins = new Set(relationDestinations({ operator: plan.operator, anchorPosition: targetPos, species: moverSpecies, currentPieces: pieces }))
    const validOrigins = shuffled(reachOrigins.filter(p => !relationOrigins.has(p)), random)

    for (const origin of validOrigins) {
      const trial = placePiece(pieces, origin, pieceCode(movingTeam, moverSpecies))
      if (!trial) { continue }
      const finalized = tryFinalize({ pieces: trial, moverOrigin: origin, moverEnd, movingTeam, random })
      if (finalized) { return finalized }
    }
  }
  return null
}

// ===== Pattern B (mover leaves subject) for attack/defend/adjacent =====
// Mover at origin had the relation to target; at end, doesn't. Count decreases.

function generateMoverLeavesSubject({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (driver.pbsDirection !== '-') { return null }
  if (!['attack', 'defend', 'adjacent'].includes(plan.operator)) { return null }
  if (plan.subjectTeam !== combinedPlan.movingTeam) { return null }

  const movingTeam = combinedPlan.movingTeam

  const targetSpecies = pickRandom(plan.targetSpeciesPool, random)
  if (!targetSpecies) { return null }
  const targetPos = randomPosition(random)
  if (targetPos === null) { return null }
  let pieces = placePiece(new Map(), targetPos, pieceCode(plan.targetTeam, targetSpecies))
  if (!pieces) { return null }

  const moverSpecies = pickRandom(plan.subjectSpeciesPool, random)
  if (!moverSpecies) { return null }

  // Mover at origin has relation to target.
  const occupiedKeys = new Set(pieces.keys())
  const originCandidates = shuffled(
    relationDestinations({ operator: plan.operator, anchorPosition: targetPos, species: moverSpecies, currentPieces: pieces }),
    random
  )

  for (const moverOrigin of originCandidates) {
    const trial = placePiece(pieces, moverOrigin, pieceCode(movingTeam, moverSpecies))
    if (!trial) { continue }

    // End: somewhere mover can legally move to that doesn't have the relation to target.
    const moverFromOrigin = controlledFromPosition({ position: moverOrigin, currentPieces: trial })
    const relationDests = new Set(relationDestinations({ operator: plan.operator, anchorPosition: targetPos, species: moverSpecies, currentPieces: trial }))
    const endCandidates = shuffled([...moverFromOrigin].filter(p => p !== moverOrigin && !trial.has(p) && !relationDests.has(p)), random)

    for (const moverEnd of endCandidates) {
      const finalized = tryFinalize({ pieces: trial, moverOrigin, moverEnd, movingTeam, random })
      if (finalized) { return finalized }
    }
  }
  return null
}

// ===== Pattern E generic (capture decreases relation count) for attack/defend/adjacent =====
// Mover captures a participant on the relation, removing it from the after-board.

function generateCaptureDecreasesRelation({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (driver.pbsDirection !== '-') { return null }
  if (!['attack', 'defend', 'adjacent'].includes(plan.operator)) { return null }
  // Capture targets the side whose count decreases. For PBS- on subject: capture the subject.
  // For PBS- on target: capture the target.
  const captureSide = driver.pbsSide
  if (!captureSide) { return null }

  const movingTeam = combinedPlan.movingTeam

  // The captured side is opposite to mover (mover captures it).
  // Place the OTHER side as anchor, then captured at a position with relation to anchor.
  const anchorSide = captureSide === 'subject' ? 'target' : 'subject'
  const anchorTeam = anchorSide === 'subject' ? plan.subjectTeam : plan.targetTeam
  const capturedTeam = captureSide === 'subject' ? plan.subjectTeam : plan.targetTeam

  // Mover (movingTeam) captures an enemy piece (capturedTeam should be enemy of movingTeam).
  if (capturedTeam === movingTeam) { return null }

  const anchorPool = anchorSide === 'subject' ? plan.subjectSpeciesPool : plan.targetSpeciesPool
  const capturedPool = captureSide === 'subject' ? plan.subjectSpeciesPool : plan.targetSpeciesPool

  const anchorSpecies = pickRandom(anchorPool, random)
  if (!anchorSpecies) { return null }
  const anchorPos = randomPosition(random)
  if (anchorPos === null) { return null }
  let pieces = placePiece(new Map(), anchorPos, pieceCode(anchorTeam, anchorSpecies))
  if (!pieces) { return null }

  const capturedSpecies = pickRandom(capturedPool, random)
  if (!capturedSpecies) { return null }

  // captured position has relation to anchor
  const occupiedKeys = new Set(pieces.keys())
  const capturedCandidates = shuffled(
    relationDestinations({
      operator: plan.operator,
      anchorPosition: anchorPos,
      species: anchorSide === 'subject' ? anchorSpecies : capturedSpecies,
      currentPieces: pieces
    }),
    random
  )

  for (const capturedPos of capturedCandidates) {
    const piecesWithCaptured = placePiece(pieces, capturedPos, pieceCode(capturedTeam, capturedSpecies))
    if (!piecesWithCaptured) { continue }

    // Mover captures captured at capturedPos.
    const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING)
    const moverSpecies = pickRandom(shuffled(moverPool, random), random)
    if (!moverSpecies) { continue }

    const moverOrigins = shuffled(
      originsThatReach({ destination: capturedPos, species: moverSpecies, occupied: new Set(piecesWithCaptured.keys()) }),
      random
    )

    for (const moverOrigin of moverOrigins) {
      const trial = placePiece(piecesWithCaptured, moverOrigin, pieceCode(movingTeam, moverSpecies))
      if (!trial) { continue }
      const finalized = tryFinalize({ pieces: trial, moverOrigin, moverEnd: capturedPos, movingTeam, random, requireCapture: true })
      if (finalized) { return finalized }
    }
  }
  return null
}

// ===== Pattern F (mover becomes target) for attack/defend =====
// Mover ends at a position attacked/defended by an existing piece. Count increases.

function generateMoverBecomesTarget({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (driver.pbsDirection !== '+') { return null }
  if (!['attack', 'defend', 'adjacent'].includes(plan.operator)) { return null }
  if (plan.targetTeam !== combinedPlan.movingTeam) { return null }

  const movingTeam = combinedPlan.movingTeam

  // Place subject (the attacker/defender/neighbor).
  const subjectSpecies = pickRandom(plan.subjectSpeciesPool, random)
  if (!subjectSpecies) { return null }
  const subjectPos = randomPosition(random)
  if (subjectPos === null) { return null }
  let pieces = placePiece(new Map(), subjectPos, pieceCode(plan.subjectTeam, subjectSpecies))
  if (!pieces) { return null }

  const moverSpecies = pickRandom(plan.targetSpeciesPool, random)
  if (!moverSpecies) { return null }

  // End: a position with relation from subject's POV.
  const endCandidates = shuffled(
    relationDestinations({ operator: plan.operator, anchorPosition: subjectPos, species: subjectSpecies, currentPieces: pieces }),
    random
  )

  for (const moverEnd of endCandidates) {
    if (pieces.has(moverEnd)) { continue }
    const relationEnds = new Set(relationDestinations({ operator: plan.operator, anchorPosition: subjectPos, species: subjectSpecies, currentPieces: pieces }))
    const reachOrigins = originsThatReach({ destination: moverEnd, species: moverSpecies, occupied: new Set([...pieces.keys(), moverEnd]) })
    const validOrigins = shuffled(reachOrigins.filter(p => !relationEnds.has(p)), random)

    for (const moverOrigin of validOrigins) {
      const trial = placePiece(pieces, moverOrigin, pieceCode(movingTeam, moverSpecies))
      if (!trial) { continue }
      const finalized = tryFinalize({ pieces: trial, moverOrigin, moverEnd, movingTeam, random })
      if (finalized) { return finalized }
    }
  }
  return null
}

// ===== Pattern G (mover leaves target) for attack/defend/adjacent =====
// Mover at origin was attacked/defended by an existing piece; at end, isn't.

function generateMoverLeavesTarget({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (driver.pbsDirection !== '-') { return null }
  if (!['attack', 'defend', 'adjacent'].includes(plan.operator)) { return null }
  if (plan.targetTeam !== combinedPlan.movingTeam) { return null }

  const movingTeam = combinedPlan.movingTeam

  const subjectSpecies = pickRandom(plan.subjectSpeciesPool, random)
  if (!subjectSpecies) { return null }
  const subjectPos = randomPosition(random)
  if (subjectPos === null) { return null }
  let pieces = placePiece(new Map(), subjectPos, pieceCode(plan.subjectTeam, subjectSpecies))
  if (!pieces) { return null }

  const moverSpecies = pickRandom(plan.targetSpeciesPool, random)
  if (!moverSpecies) { return null }

  const originCandidates = shuffled(
    relationDestinations({ operator: plan.operator, anchorPosition: subjectPos, species: subjectSpecies, currentPieces: pieces }),
    random
  )

  for (const moverOrigin of originCandidates) {
    const trial = placePiece(pieces, moverOrigin, pieceCode(movingTeam, moverSpecies))
    if (!trial) { continue }

    const moverFromOrigin = controlledFromPosition({ position: moverOrigin, currentPieces: trial })
    const relationEnds = new Set(relationDestinations({ operator: plan.operator, anchorPosition: subjectPos, species: subjectSpecies, currentPieces: trial }))
    const endCandidates = shuffled([...moverFromOrigin].filter(p => p !== moverOrigin && !trial.has(p) && !relationEnds.has(p)), random)

    for (const moverEnd of endCandidates) {
      const finalized = tryFinalize({ pieces: trial, moverOrigin, moverEnd, movingTeam, random })
      if (finalized) { return finalized }
    }
  }
  return null
}

// ===== Pattern C (mover unblocks slider's ray) for attack/defend =====
// Prior: slider on a ray to target with mover blocking between them.
// After: mover off the ray; slider attacks target. Count increases.

function generateMoverUnblocksRay({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (driver.pbsDirection !== '+') { return null }
  if (!['attack', 'defend'].includes(plan.operator)) { return null }

  const movingTeam = combinedPlan.movingTeam
  const slidersInPool = [Board.QUEEN, Board.ROOK, Board.BISHOP].filter(s => plan.subjectSpeciesPool.includes(s))
  const sliderSpecies = pickRandom(slidersInPool, random)
  if (!sliderSpecies) { return null }

  const stepsForSpecies = sliderSpecies === Board.ROOK ? [1, -1, 8, -8]
    : sliderSpecies === Board.BISHOP ? [7, -7, 9, -9]
    : [1, -1, 8, -8, 7, -7, 9, -9]
  const step = pickRandom(stepsForSpecies, random)

  const targetSpecies = pickRandom(plan.targetSpeciesPool, random)
  if (!targetSpecies) { return null }
  const targetPos = randomPosition(random)
  if (targetPos === null) { return null }
  let pieces = placePiece(new Map(), targetPos, pieceCode(plan.targetTeam, targetSpecies))
  if (!pieces) { return null }

  const moverOrigin = nextPositionOnRay(targetPos, -step)
  if (moverOrigin === null) { return null }

  const sliderPos = nextPositionOnRay(moverOrigin, -step)
  if (sliderPos === null) { return null }
  pieces = placePiece(pieces, sliderPos, pieceCode(plan.subjectTeam, sliderSpecies))
  if (!pieces) { return null }

  const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING)
  const moverSpecies = pickRandom(shuffled(moverPool, random), random)
  if (!moverSpecies) { return null }
  pieces = placePiece(pieces, moverOrigin, pieceCode(movingTeam, moverSpecies))
  if (!pieces) { return null }

  const rayPositions = new Set()
  let p = sliderPos
  while (p !== null) {
    rayPositions.add(p)
    if (p === targetPos) { break }
    p = nextPositionOnRay(p, step)
  }

  const moverControls = controlledFromPosition({ position: moverOrigin, currentPieces: pieces })
  const endCandidates = shuffled([...moverControls].filter(p => !pieces.has(p) && !rayPositions.has(p)), random)

  for (const moverEnd of endCandidates) {
    const finalized = tryFinalize({ pieces, moverOrigin, moverEnd, movingTeam, random })
    if (finalized) { return finalized }
  }
  return null
}

// ===== Pattern D (mover blocks slider's ray) for attack/defend =====
// Prior: slider attacks target via clear ray.
// After: mover ends on the ray, blocking. Slider no longer attacks target. Count decreases.

function generateMoverBlocksRay({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (driver.pbsDirection !== '-') { return null }
  if (!['attack', 'defend'].includes(plan.operator)) { return null }

  const movingTeam = combinedPlan.movingTeam
  const slidersInPool = [Board.QUEEN, Board.ROOK, Board.BISHOP].filter(s => plan.subjectSpeciesPool.includes(s))
  const sliderSpecies = pickRandom(slidersInPool, random)
  if (!sliderSpecies) { return null }

  const stepsForSpecies = sliderSpecies === Board.ROOK ? [1, -1, 8, -8]
    : sliderSpecies === Board.BISHOP ? [7, -7, 9, -9]
    : [1, -1, 8, -8, 7, -7, 9, -9]
  const step = pickRandom(stepsForSpecies, random)

  const targetSpecies = pickRandom(plan.targetSpeciesPool, random)
  if (!targetSpecies) { return null }
  const targetPos = randomPosition(random)
  if (targetPos === null) { return null }
  let pieces = placePiece(new Map(), targetPos, pieceCode(plan.targetTeam, targetSpecies))
  if (!pieces) { return null }

  const blockSquare = nextPositionOnRay(targetPos, -step)
  if (blockSquare === null) { return null }

  const sliderPos = nextPositionOnRay(blockSquare, -step)
  if (sliderPos === null) { return null }
  pieces = placePiece(pieces, sliderPos, pieceCode(plan.subjectTeam, sliderSpecies))
  if (!pieces) { return null }

  const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING)
  const moverSpecies = pickRandom(shuffled(moverPool, random), random)
  if (!moverSpecies) { return null }

  const moverOrigins = shuffled(
    originsThatReach({ destination: blockSquare, species: moverSpecies, occupied: new Set(pieces.keys()) }),
    random
  )

  for (const moverOrigin of moverOrigins) {
    if (moverOrigin === sliderPos || moverOrigin === targetPos) { continue }
    const trial = placePiece(pieces, moverOrigin, pieceCode(movingTeam, moverSpecies))
    if (!trial) { continue }
    const finalized = tryFinalize({ pieces: trial, moverOrigin, moverEnd: blockSquare, movingTeam, random })
    if (finalized) { return finalized }
  }
  return null
}

// ===== Mobility moved_piece patterns =====
// Mover moves to a square with more (or fewer) available moves.

function generateMoverMobilityChange(direction) {
  return ({ driver, combinedPlan, random }) => {
    const plan = driver.plan
    if (plan.kind !== 'unary') { return null }
    if (plan.subject !== 'moved_piece') { return null }
    if (plan.operator !== 'mobility') { return null }
    if (driver.pbsDirection !== direction) { return null }

    const movingTeam = combinedPlan.movingTeam
    const moverSpecies = pickRandom(plan.subjectSpeciesPool, random)
    if (!moverSpecies) { return null }

    const origin = randomPosition(random)
    if (origin === null) { return null }
    let pieces = placePiece(new Map(), origin, pieceCode(movingTeam, moverSpecies))
    if (!pieces) { return null }

    // Optionally add some blockers near the origin to constrain mobility.
    const nearby = ALL_POSITIONS.filter(p => {
      if (pieces.has(p)) { return false }
      const rd = Math.abs(Board.rankIndex(p) - Board.rankIndex(origin))
      const fd = Math.abs(Board.fileIndex(p) - Board.fileIndex(origin))
      return rd <= 2 && fd <= 2
    })
    const blockerCount = direction === '+' ? 4 : 1
    for (const sq of shuffled(nearby, random).slice(0, blockerCount)) {
      const blockerSpecies = pickRandom([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK], random)
      const team = random() < 0.5 ? movingTeam : Board.opposingTeam(movingTeam)
      const next = placePiece(pieces, sq, pieceCode(team, blockerSpecies))
      if (next) { pieces = next }
    }

    const piecesWithKings = placeKingsIfAbsent(pieces, random)
    if (piecesWithKings === null) { return null }
    const priorBoard = piecesIntoBoard(piecesWithKings, movingTeam)

    const moves = Rules.availableMovesFrom({ board: priorBoard, startPosition: origin })
    const originMobility = moves.length
    if (moves.length === 0) { return null }

    for (const moveObject of shuffled([...moves], random)) {
      if (moveObject.illegal) { continue }
      const afterBoard = priorBoard.lightClone()
      try { afterBoard._hypotheticallyMovePiece(moveObject) } catch { continue }
      const endMobility = Rules.availableMovesFrom({ board: afterBoard, startPosition: moveObject.endPosition }).length
      const passes = direction === '+' ? endMobility > originMobility : endMobility < originMobility
      if (!passes) { continue }
      if (!legalPriorTurnState(priorBoard, moveObject)) { continue }
      return { priorBoard, moveObject }
    }
    return null
  }
}

// ===== Promotion pattern (unary moved_piece value > prior) =====

function generatePromotionForValueIncrease({ driver, combinedPlan, random }) {
  const plan = driver.plan
  if (plan.kind !== 'unary') { return null }
  if (plan.subject !== 'moved_piece') { return null }
  if (plan.operator !== 'value') { return null }
  if (driver.pbsDirection !== '+') { return null }

  const movingTeam = combinedPlan.movingTeam
  const enemyTeam = Board.opposingTeam(movingTeam)
  const promotedSpecies = pickRandom([Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT], random)

  // Pawn rank for white/black, and promotion rank.
  const [pawnRank, promoteRank] = movingTeam === Board.WHITE ? [6, 7] : [1, 0]
  const file = Math.floor(random() * 8)
  const moverOrigin = pawnRank * 8 + file
  const moverEnd = promoteRank * 8 + file

  let pieces = placePiece(new Map(), moverOrigin, pieceCode(movingTeam, Board.PAWN))
  if (!pieces) { return null }

  const piecesWithKings = placeKingsIfAbsent(pieces, random)
  if (piecesWithKings === null) { return null }
  const priorBoard = piecesIntoBoard(piecesWithKings, movingTeam)

  let moveObject
  try { moveObject = Rules.getMoveObject(moverOrigin, moverEnd, priorBoard, promotedSpecies) } catch { return null }
  if (moveObject.illegal) { return null }
  if (!moveObject.promotionPiece) { return null }
  if (!legalPriorTurnState(priorBoard, moveObject)) { return null }

  return { priorBoard, moveObject }
}

// ===== Pattern catalog =====

export const PATTERNS = [
  { name: 'E:shield-decrease-capture', generate: generateShieldDecreaseCapture },
  { name: 'A:mover-becomes-subject', generate: generateMoverBecomesSubject },
  { name: 'B:mover-leaves-subject', generate: generateMoverLeavesSubject },
  { name: 'E:capture-decreases-relation', generate: generateCaptureDecreasesRelation },
  { name: 'F:mover-becomes-target', generate: generateMoverBecomesTarget },
  { name: 'G:mover-leaves-target', generate: generateMoverLeavesTarget },
  { name: 'C:mover-unblocks-ray', generate: generateMoverUnblocksRay },
  { name: 'D:mover-blocks-ray', generate: generateMoverBlocksRay },
  { name: 'M:moved-mobility-increase', generate: generateMoverMobilityChange('+') },
  { name: 'M:moved-mobility-decrease', generate: generateMoverMobilityChange('-') },
  { name: 'V:promotion-value-increase', generate: generatePromotionForValueIncrease }
]
