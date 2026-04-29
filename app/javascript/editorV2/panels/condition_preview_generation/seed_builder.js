import Board from 'gameplay/board'
import {
  buildCandidateSkeletons, mergeRelationPieces
} from 'editorV2/panels/condition_preview/skeleton_builders'
import {
  candidateSpecies,
  MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/example_utils'
import { clonePiecesMap, shuffled } from './board_utils'

const IDENTITY_ACTORS = new Set(['moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'])

// ===== Castle presets (both teams, after-board positions) =====

function castlePresetsForTeam(team) {
  const offset = (team === Board.WHITE ? 0 : 7) * 8
  return [
    {
      name: `castle-kingside-${team}`,
      fixedPieces: new Map([
        [offset + 6, `${team}${Board.KING}`],
        [offset + 5, `${team}${Board.ROOK}`]
      ]),
      reservedSquares: new Set([offset + 4, offset + 7])
    },
    {
      name: `castle-queenside-${team}`,
      fixedPieces: new Map([
        [offset + 2, `${team}${Board.KING}`],
        [offset + 3, `${team}${Board.ROOK}`]
      ]),
      reservedSquares: new Set([offset + 0, offset + 1, offset + 4])
    }
  ]
}

// ===== Promotion presets (both teams, after-board positions) =====

function promotionPresetsForTeam(team) {
  const [pawnRank, promoteRank] = team === Board.WHITE ? [6, 7] : [1, 0]
  const promotedSpecies = [Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT]
  const presets = []

  for (const species of promotedSpecies) {
    for (let file = 0; file < 8; file++) {
      presets.push({
        name: `promotion-${species}-${file}-straight`,
        fixedPieces: new Map([[promoteRank * 8 + file, `${team}${species}`]]),
        reservedSquares: new Set([pawnRank * 8 + file, promoteRank * 8 + file])
      })
    }
    for (let file = 1; file < 8; file++) {
      presets.push({
        name: `promotion-${species}-${file}-capture-left`,
        fixedPieces: new Map([[promoteRank * 8 + (file - 1), `${team}${species}`]]),
        reservedSquares: new Set([pawnRank * 8 + file, promoteRank * 8 + (file - 1)])
      })
    }
    for (let file = 0; file < 7; file++) {
      presets.push({
        name: `promotion-${species}-${file}-capture-right`,
        fixedPieces: new Map([[promoteRank * 8 + (file + 1), `${team}${species}`]]),
        reservedSquares: new Set([pawnRank * 8 + file, promoteRank * 8 + (file + 1)])
      })
    }
  }

  return presets
}

// ===== En passant presets (both teams, after-board positions) =====

function enPassantPresetsForTeam(team) {
  const enemyTeam = Board.opposingTeam(team)
  // destRank: where the capturing pawn lands
  // capturedRank: where the captured pawn was (now empty in after-board)
  // doubleAdvanceRank: where the captured pawn started its double advance
  const [destRank, capturedRank, doubleAdvanceRank] = team === Board.WHITE ? [5, 4, 6] : [2, 3, 1]
  const presets = []

  for (let destFile = 0; destFile < 8; destFile++) {
    const destSquare = destRank * 8 + destFile
    const capturedSquare = capturedRank * 8 + destFile
    const doubleAdvanceStart = doubleAdvanceRank * 8 + destFile
    presets.push({
      name: `en-passant-${team}-${destFile}`,
      fixedPieces: new Map([[destSquare, `${team}${Board.PAWN}`]]),
      reservedSquares: new Set([capturedSquare]),
      recentMoveContext: {
        moveObject: { startPosition: doubleAdvanceStart, endPosition: capturedSquare },
        movingTeam: enemyTeam,
        movedPieceStartPosition: doubleAdvanceStart,
        movedPieceEndPosition: capturedSquare,
        movedPieceSpeciesBeforeMove: Board.PAWN,
        movedPieceSpeciesAfterMove: Board.PAWN,
        capturedPiecePosition: null,
        capturedPieceTeam: null,
        capturedPieceSpecies: null
      }
    })
  }

  return presets
}

// ===== Required position pieces =====

function buildRequiredPieces(requiredPositions, random) {
  const pieces = new Map()
  for (const [sq, { team, filter }] of requiredPositions.entries()) {
    const pool = candidateSpecies(filter, null)
    if (!pool || pool.length === 0) { return null }
    const species = pool[Math.floor(random() * pool.length)]
    const piece = `${team}${species}`
    const existing = pieces.get(sq)
    if (existing && existing !== piece) { return null }
    pieces.set(sq, piece)
  }
  return pieces
}

// ===== buildSeed =====

export function buildSeed(combinedPlan, attemptKind, random) {
  const requiredPieces = buildRequiredPieces(combinedPlan.requiredPositions, random)
  if (!requiredPieces) { return null }

  // Pick a special move preset and build the base fixed pieces
  let specialPreset = null
  let recentMoveContext = null

  if (attemptKind === MOVE_KIND_CASTLE) {
    const presets = shuffled(castlePresetsForTeam(combinedPlan.movingTeam), random)
    specialPreset = presets[0] ?? null
  } else if (attemptKind === MOVE_KIND_PROMOTION) {
    const presets = shuffled(promotionPresetsForTeam(combinedPlan.movingTeam), random)
    specialPreset = presets[0] ?? null
  } else if (attemptKind === MOVE_KIND_EN_PASSANT) {
    const presets = shuffled(enPassantPresetsForTeam(combinedPlan.movingTeam), random)
    specialPreset = presets[0] ?? null
    if (specialPreset) { recentMoveContext = specialPreset.recentMoveContext }
  }

  if (attemptKind !== MOVE_KIND_STANDARD && specialPreset === null) { return null }

  const fixedPieces = specialPreset
    ? mergeRelationPieces({ basePieces: requiredPieces, relationPieces: specialPreset.fixedPieces, reservedSquares: new Set() })
    : clonePiecesMap(requiredPieces)
  if (!fixedPieces) { return null }

  const reservedSquares = specialPreset ? new Set(specialPreset.reservedSquares) : new Set()

  // Build relational geometry sequentially across all relational plans.
  // Identity actors (moved_piece, captured_piece, etc.) are tracked so subsequent
  // plans reuse the same piece rather than placing a second conflicting one.
  const relationalPlans = combinedPlan.plans.filter(p => p.kind === 'relational')

  if (relationalPlans.length === 0) {
    const geometryKey = specialPreset?.name
      ?? `positions:${Array.from(requiredPieces.keys()).sort().join(',')}`
    return { pieces: fixedPieces, reservedSquares, recentMoveContext, attemptKind, geometryKey, relationalPositions: [] }
  }

  const placedActors = new Map() // actor name -> { position, species }

  let currentPieces = fixedPieces
  const geometryKeys = specialPreset ? [specialPreset.name] : []
  const relationalPositions = []

  for (const plan of relationalPlans) {
    const fixedSubjectPlacement = IDENTITY_ACTORS.has(plan.subject) ? (placedActors.get(plan.subject) ?? null) : null
    const fixedTargetPlacement = IDENTITY_ACTORS.has(plan.target) ? (placedActors.get(plan.target) ?? null) : null

    const subjectPool = fixedSubjectPlacement
      ? [fixedSubjectPlacement.species]
      : shuffled([...plan.subjectSpeciesPool], random)
    const targetPool = fixedTargetPlacement
      ? [fixedTargetPlacement.species]
      : shuffled([...plan.targetSpeciesPool], random)

    let found = false
    outer: for (const subjectSpecies of subjectPool) {
      for (const targetSpecies of targetPool) {
        const skeletons = shuffled(
          buildCandidateSkeletons({ plan, subjectSpecies, targetSpecies, fixedPieces: currentPieces, fixedSubjectPlacement, fixedTargetPlacement, reservedSquares }),
          random
        )
        if (skeletons.length === 0) { continue }
        const skeleton = skeletons[0]

        if (IDENTITY_ACTORS.has(plan.subject)) {
          placedActors.set(plan.subject, { position: skeleton.subjectPosition, species: skeleton.subjectSpecies })
        }
        if (IDENTITY_ACTORS.has(plan.target)) {
          placedActors.set(plan.target, { position: skeleton.targetPosition, species: skeleton.targetSpecies })
        }

        currentPieces = skeleton.pieces
        geometryKeys.push(skeleton.geometryKey)
        relationalPositions.push({
          subjectPosition: skeleton.subjectPosition,
          subjectSpecies: skeleton.subjectSpecies,
          targetPosition: skeleton.targetPosition,
          targetSpecies: skeleton.targetSpecies
        })
        found = true
        break outer
      }
    }

    if (!found) { return null }
  }

  return { pieces: currentPieces, reservedSquares, recentMoveContext, attemptKind, geometryKey: geometryKeys.join(':'), relationalPositions }
}
