import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { nextPositionOnRay } from 'gameplay/board_query_utils'
import {
  RAY_STEPS, shieldAttackerSpeciesForStep, originCandidatesForSpecies
} from 'editorV2/panels/condition_preview/geometry_utils'
import { candidateSpecies, legalPriorTurnState } from 'editorV2/panels/condition_preview/example_utils'
import { buildBoardFromLayout, buildLayoutFromPieces } from 'editorV2/panels/condition_preview/board_utils'
import { placePiece } from '../piece_placement'
import { placeKingsIfAbsent } from '../board_utils'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))

function pickRandom(values, random) {
  if (!values || values.length === 0) { return null }
  return values[Math.floor(random() * values.length)]
}

function randomPosition(random) {
  return Math.floor(random() * 64)
}

// Find an origin square from which `species` of `team` can legally capture at `destination`.
// `pieces` already contains the captured piece at `destination`.
function findCaptureOrigin({ species, team, destination, pieces, random }) {
  const occupiedSet = new Set(pieces.keys())
  const candidates = originCandidatesForSpecies(destination, species).filter(p =>
    p !== destination && !occupiedSet.has(p)
  )
  const shuffled = [...candidates].sort(() => random() - 0.5)
  for (const origin of shuffled) {
    const trialPieces = placePiece(pieces, origin, `${team}${species}`)
    if (trialPieces === null) { continue }
    const layout = buildLayoutFromPieces(trialPieces)
    const board = buildBoardFromLayout(layout, null, team)
    let moveObject
    try { moveObject = Rules.getMoveObject(origin, destination, board) } catch { continue }
    if (moveObject.illegal) { continue }
    if (!moveObject.captureNotation) { continue }
    return { origin, pieces: trialPieces, moveObject, board }
  }
  return null
}

// Pattern E specialized for shield-PBS-decreasing relational plans.
// Produces (priorBoard, moveObject) where the move captures a shielder, decreasing shield count.
export function generateShieldDecreaseCapture({ driver, combinedPlan, random }) {
  const driverPlan = driver.plan
  const movingTeam = combinedPlan.movingTeam
  const enemyTeam = Board.opposingTeam(movingTeam)
  const targetTeam = driverPlan.targetTeam

  // 1. Place target piece (king or whatever target species). Singletons only for now.
  const targetSpecies = pickRandom(driverPlan.targetSpeciesPool, random)
  if (!targetSpecies) { return null }
  const targetPos = randomPosition(random)
  let pieces = placePiece(new Map(), targetPos, `${targetTeam}${targetSpecies}`)
  if (pieces === null) { return null }

  // 2. Pick a ray direction and shielder position (1 step from target in -step).
  const step = pickRandom([...RAY_STEPS], random)
  const shielderPos = nextPositionOnRay(targetPos, -step)
  if (shielderPos === null) { return null }

  // 3. Pick attacker position further along -step from shielder.
  const attackerDistance = 1 + Math.floor(random() * 3)
  let attackerPos = shielderPos
  for (let i = 0; i < attackerDistance; i += 1) {
    attackerPos = nextPositionOnRay(attackerPos, -step)
    if (attackerPos === null) { return null }
  }

  // 4. Pick shielder species from driver's subject pool.
  const subjectTeam = driverPlan.subjectTeam
  const shielderSpecies = pickRandom(driverPlan.subjectSpeciesPool, random)
  if (!shielderSpecies) { return null }
  pieces = placePiece(pieces, shielderPos, `${subjectTeam}${shielderSpecies}`)
  if (pieces === null) { return null }

  // 5. Pick attacker species (must attack along the step direction).
  const attackerSpecies = pickRandom(shieldAttackerSpeciesForStep(step), random)
  if (!attackerSpecies) { return null }
  // Attacker's team is the opposing-team-of-target (so attacker would capture target if shielder weren't there).
  const attackerTeam = Board.opposingTeam(targetTeam)
  pieces = placePiece(pieces, attackerPos, `${attackerTeam}${attackerSpecies}`)
  if (pieces === null) { return null }

  // 6. Pick mover species (movingTeam) and find an origin from which mover legally captures shielder.
  const moverPool = candidateSpecies('any', null).filter(s => s !== Board.KING)
  const moverSpecies = pickRandom(moverPool, random)
  if (!moverSpecies) { return null }
  const found = findCaptureOrigin({
    species: moverSpecies, team: movingTeam, destination: shielderPos, pieces, random
  })
  if (!found) { return null }
  pieces = found.pieces

  // 7. Place kings if absent.
  const piecesWithKings = placeKingsIfAbsent(pieces, random)
  if (piecesWithKings === null) { return null }

  // 8. Build prior board.
  const layout = buildLayoutFromPieces(piecesWithKings)
  const priorBoard = buildBoardFromLayout(layout, null, movingTeam)

  // 9. Recompute move object on the final board (after kings placed).
  let moveObject
  try { moveObject = Rules.getMoveObject(found.origin, shielderPos, priorBoard) } catch { return null }
  if (moveObject.illegal) { return null }
  if (!moveObject.captureNotation) { return null }
  if (!legalPriorTurnState(priorBoard, moveObject)) { return null }

  return { priorBoard, moveObject }
}
