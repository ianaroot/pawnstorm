import Board from 'gameplay/board'
import {
  candidateSpecies,
  MOVE_KIND_STANDARD, MOVE_KIND_CASTLE, MOVE_KIND_PROMOTION, MOVE_KIND_EN_PASSANT
} from 'editorV2/panels/condition_preview/example_utils'
import { usesZeroRelationPath, PRIOR_BOARD_COMPARISON_SOURCE } from 'editorV2/panels/condition_preview/comparison_requirements'
import { shuffled } from './board_utils'
import { placePiece, teamHasKing } from './piece_placement'
import { buildSideConfigurations } from './configurations'
import { buildConfigSkeletons } from './relation_geometry'

const IDENTITY_ACTORS = new Set(['moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'])

// ===== Castle presets (both teams, after-board positions) =====

export function castlePresetsForTeam(team) {
  const offset = (team === Board.WHITE ? 0 : 7) * 8
  return [
    {
      name: `castle-kingside-${team}`,
      kingStart: offset + 4, kingEnd: offset + 6, rookStart: offset + 7, rookEnd: offset + 5,
      fixedPieces: new Map([
        [offset + 6, `${team}${Board.KING}`],
        [offset + 5, `${team}${Board.ROOK}`]
      ]),
      reservedSquares: new Set([offset + 4, offset + 7])
    },
    {
      name: `castle-queenside-${team}`,
      kingStart: offset + 4, kingEnd: offset + 2, rookStart: offset + 0, rookEnd: offset + 3,
      fixedPieces: new Map([
        [offset + 2, `${team}${Board.KING}`],
        [offset + 3, `${team}${Board.ROOK}`]
      ]),
      reservedSquares: new Set([offset + 0, offset + 1, offset + 4])
    }
  ]
}

// ===== Promotion presets (both teams, after-board positions) =====

export function promotionPresetsForTeam(team) {
  const [pawnRank, promoteRank] = team === Board.WHITE ? [6, 7] : [1, 0]
  const promotedSpecies = [Board.QUEEN, Board.ROOK, Board.BISHOP, Board.NIGHT]
  const presets = []

  for (const species of promotedSpecies) {
    for (let file = 0; file < 8; file++) {
      presets.push({
        name: `promotion-${species}-${file}-straight`,
        promotedSpecies: species, moveStart: pawnRank * 8 + file, moveEnd: promoteRank * 8 + file,
        isCapture: false, captureDirection: 'straight',
        fixedPieces: new Map([[promoteRank * 8 + file, `${team}${species}`]]),
        reservedSquares: new Set([pawnRank * 8 + file, promoteRank * 8 + file])
      })
    }
  }

  return presets
}

// ===== En passant presets (both teams, after-board positions) =====

export function enPassantPresetsForTeam(team) {
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

function findExistingKingPlacement(team, pieces) {
  const kingPiece = `${team}${Board.KING}`
  for (const [position, piece] of pieces.entries()) {
    if (piece === kingPiece) {
      return { position, species: Board.KING }
    }
  }
  return null
}

// Optimization: skip king from "any"-style pools when team already has its king,
// avoiding pointless config attempts that placePiece would reject.
function filterKingIfTeamHasOne(pool, team, pieces) {
  return teamHasKing(pieces, team) ? pool.filter(s => s !== Board.KING) : pool
}

function buildRequiredPieces(requiredPositions, random) {
  let pieces = new Map()
  for (const [sq, { team, filter }] of requiredPositions.entries()) {
    const basePool = candidateSpecies(filter, null)
    if (!basePool || basePool.length === 0) { return null }
    const pool = filterKingIfTeamHasOne(basePool, team, pieces)
    if (pool.length === 0) { return null }
    const species = pool[Math.floor(random() * pool.length)]
    const next = placePiece(pieces, sq, `${team}${species}`)
    if (next === null) { return null }
    pieces = next
  }
  return pieces
}

// Idempotent merge: skip squares already holding the same piece, otherwise placePiece.
// Used for fixed pieces from special-move presets that may overlap requiredPieces.
function mergeFixedPieces(basePieces, fixedPieces, reservedSquares) {
  let pieces = basePieces
  for (const [position, piece] of fixedPieces.entries()) {
    if (pieces.get(position) === piece) { continue }
    if (reservedSquares.has(position)) { return null }
    const next = placePiece(pieces, position, piece)
    if (next === null) { return null }
    pieces = next
  }
  return pieces
}

// ===== buildSeedFromPreset =====

export function buildSeedFromPreset(combinedPlan, specialPreset, attemptKind, random) {
  const requiredPieces = buildRequiredPieces(combinedPlan.requiredPositions, random)
  if (!requiredPieces) { return null }

  const recentMoveContext = (attemptKind === MOVE_KIND_EN_PASSANT && specialPreset)
    ? (specialPreset.recentMoveContext ?? null)
    : null

  const fixedPieces = specialPreset
    ? mergeFixedPieces(requiredPieces, specialPreset.fixedPieces, new Set())
    : new Map(requiredPieces)
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

  const placedActors = new Map()

  let currentPieces = fixedPieces
  const geometryKeys = specialPreset ? [specialPreset.name] : []
  const relationalPositions = []

  const movedPiecePool = combinedPlan.movedPieceSpeciesPool

  for (const plan of relationalPlans) {
    // Identity actors (moved_piece, etc.) reuse a previously-placed actor when
    // available. When the chain's first plan needs the actor as a king and a
    // special preset (e.g. castle) already placed one, fall through to the
    // existing king on the board so we don't strip king from the pool below.
    const fixedSubjectPlacement = IDENTITY_ACTORS.has(plan.subject)
      ? (placedActors.get(plan.subject)
          ?? (plan.subjectFilter === 'king' ? findExistingKingPlacement(plan.subjectTeam, currentPieces) : null))
      : (plan.subjectFilter === 'king' ? findExistingKingPlacement(plan.subjectTeam, currentPieces) : null)
    const fixedTargetPlacement = IDENTITY_ACTORS.has(plan.target)
      ? (placedActors.get(plan.target)
          ?? (plan.targetFilter === 'king' ? findExistingKingPlacement(plan.targetTeam, currentPieces) : null))
      : (plan.targetFilter === 'king' ? findExistingKingPlacement(plan.targetTeam, currentPieces) : null)

    const subjectPool = fixedSubjectPlacement
      ? [fixedSubjectPlacement.species]
      : filterKingIfTeamHasOne(
          plan.subject === 'moved_piece' && movedPiecePool
            ? plan.subjectSpeciesPool.filter(s => movedPiecePool.includes(s))
            : [...plan.subjectSpeciesPool],
          plan.subjectTeam,
          currentPieces
        )
    const targetPool = fixedTargetPlacement
      ? [fixedTargetPlacement.species]
      : filterKingIfTeamHasOne(
          plan.target === 'moved_piece' && movedPiecePool
            ? plan.targetSpeciesPool.filter(s => movedPiecePool.includes(s))
            : [...plan.targetSpeciesPool],
          plan.targetTeam,
          currentPieces
        )

    if (usesZeroRelationPath(plan.requirements)) {
      relationalPositions.push(null)
      continue
    }

    const subjectConfigs = fixedSubjectPlacement
      ? [[fixedSubjectPlacement.species]]
      : buildSideConfigurations({ plan, side: 'subject', pool: subjectPool, random })
    const targetConfigs = fixedTargetPlacement
      ? [[fixedTargetPlacement.species]]
      : buildSideConfigurations({ plan, side: 'target', pool: targetPool, random })

    let found = false
    outer: for (const subjectConfig of subjectConfigs) {
      for (const targetConfig of targetConfigs) {
        const skeletons = buildConfigSkeletons({
          plan, subjectConfig, targetConfig,
          fixedPieces: currentPieces, fixedSubjectPlacement, fixedTargetPlacement,
          reservedSquares, random
        })
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
          subjectPositions: skeleton.subjectPlacements,
          targetPositions: skeleton.targetPlacements
        })
        found = true
        break outer
      }
    }

    if (!found) { return null }

    const isPbsDecreasing = plan.comparisonDescriptors?.some(d =>
      d.source === PRIOR_BOARD_COMPARISON_SOURCE &&
      (d.comparator === 'less_than' || d.comparator === 'less_than_or_equal_to')
    )
    if (isPbsDecreasing && plan.targetTeam) {
      const extraPool = plan.targetSpeciesPool.filter(s => s !== Board.KING)
      for (let j = 0; j < 2 && extraPool.length > 0; j++) {
        const species = extraPool[Math.floor(random() * extraPool.length)]
        const free = Array.from({ length: 64 }, (_, k) => k)
          .filter(sq => !currentPieces.has(sq) && !reservedSquares.has(sq))
        if (free.length === 0) { break }
        const square = free[Math.floor(random() * free.length)]
        const next = placePiece(currentPieces, square, `${plan.targetTeam}${species}`)
        if (next !== null) { currentPieces = next }
      }
    }
  }

  return { pieces: currentPieces, reservedSquares, recentMoveContext, attemptKind, geometryKey: geometryKeys.join(':'), relationalPositions }
}

// ===== buildSeed =====

export function buildSeed(combinedPlan, attemptKind, random) {
  let specialPreset = null

  if (attemptKind === MOVE_KIND_CASTLE) {
    const presets = shuffled(castlePresetsForTeam(combinedPlan.movingTeam), random)
    specialPreset = presets[0] ?? null
  } else if (attemptKind === MOVE_KIND_PROMOTION) {
    const presets = shuffled(promotionPresetsForTeam(combinedPlan.movingTeam), random)
    specialPreset = presets[0] ?? null
  } else if (attemptKind === MOVE_KIND_EN_PASSANT) {
    const presets = shuffled(enPassantPresetsForTeam(combinedPlan.movingTeam), random)
    specialPreset = presets[0] ?? null
  }

  if (attemptKind !== MOVE_KIND_STANDARD && specialPreset === null) { return null }
  return buildSeedFromPreset(combinedPlan, specialPreset, attemptKind, random)
}
