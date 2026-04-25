import Board from 'gameplay/board'
import { controlledSquares, shieldedPositions, nextPositionOnRay } from 'gameplay/board_query_utils'
import { pieceCode, clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout, legalPlacementForSpecies } from 'editorV2/panels/condition_preview/board_utils'
import { RAY_STEPS, adjacentNeighborPositions, shieldAttackerSpeciesForStep } from 'editorV2/panels/condition_preview/geometry_utils'

const ALL_POSITIONS = Object.freeze(Array.from({ length: 64 }, (_, i) => i))

function legalSubjectPlacements(subjectSpecies) {
  return ALL_POSITIONS
    .filter(position => legalPlacementForSpecies(position, subjectSpecies))
    .map(position => ({ position, species: subjectSpecies }))
}

export function teamForActorWithContext(actor, movingTeam = Board.WHITE) {
  return actor === 'allied' || actor === 'moved_piece' ? movingTeam : Board.opposingTeam(movingTeam)
}

export function mergeRelationPieces({ basePieces = new Map(), relationPieces, reservedSquares = new Set() }) {
  const pieces = clonePiecesMap(basePieces)
  for (const [position, piece] of relationPieces.entries()) {
    const existingPiece = pieces.get(position)
    if (existingPiece && existingPiece !== piece) { return null }
    if (!existingPiece && reservedSquares.has(position)) { return null }
    pieces.set(position, piece)
  }
  return pieces
}

export function buildCandidateSkeletons({ payload, subjectSpecies, targetSpecies, movingTeam = Board.WHITE, fixedPieces = new Map(), fixedSubjectPlacement = null, fixedTargetPlacement = null, reservedSquares = new Set() }) {
  switch (payload.operator) {
    case 'attack':
    case 'defend':
      return buildControlSkeletons({ payload, subjectSpecies, targetSpecies, movingTeam, fixedPieces, fixedSubjectPlacement, fixedTargetPlacement, reservedSquares })
    case 'adjacent':
      return buildAdjacentSkeletons({ payload, subjectSpecies, targetSpecies, movingTeam, fixedPieces, fixedSubjectPlacement, fixedTargetPlacement, reservedSquares })
    case 'shield':
      return buildShieldSkeletons({ payload, subjectSpecies, targetSpecies, movingTeam, fixedPieces, fixedSubjectPlacement, fixedTargetPlacement, reservedSquares })
    default:
      return []
  }
}

export function buildControlSkeletons({ payload, subjectSpecies, targetSpecies, movingTeam = Board.WHITE, fixedPieces = new Map(), fixedSubjectPlacement = null, fixedTargetPlacement = null, reservedSquares = new Set() }) {
  const skeletons = []
  const subjectPlacements = fixedSubjectPlacement ? [fixedSubjectPlacement] : legalSubjectPlacements(subjectSpecies)

  subjectPlacements.forEach(subjectPlacement => {
    const subjectPosition = subjectPlacement.position
    const pieces = mergeRelationPieces({
      basePieces: fixedPieces,
      relationPieces: new Map([[subjectPosition, pieceCode(teamForActorWithContext(payload.subject, movingTeam), subjectPlacement.species)]]),
      reservedSquares
    })
    if (!pieces) { return }
    const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
    const controlled = controlledSquares({ board, attackerPosition: subjectPosition })
    const targetPositions = fixedTargetPlacement ? [fixedTargetPlacement.position] : controlled

    targetPositions.forEach(targetPosition => {
      if (subjectPosition === targetPosition) { return }
      const effectiveTargetSpecies = fixedTargetPlacement?.species || targetSpecies
      if (!legalPlacementForSpecies(targetPosition, effectiveTargetSpecies)) { return }
      const targetPiece = pieceCode(teamForActorWithContext(payload.target, movingTeam), effectiveTargetSpecies)
      if (!controlled.includes(targetPosition)) { return }
      if (!fixedTargetPlacement && pieces.has(targetPosition)) { return }

      const relationPieces = mergeRelationPieces({
        basePieces: pieces,
        relationPieces: new Map([[targetPosition, targetPiece]]),
        reservedSquares
      })
      if (!relationPieces) { return }
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

export function buildAdjacentSkeletons({ payload, subjectSpecies, targetSpecies, movingTeam = Board.WHITE, fixedPieces = new Map(), fixedSubjectPlacement = null, fixedTargetPlacement = null, reservedSquares = new Set() }) {
  const skeletons = []
  const subjectPlacements = fixedSubjectPlacement ? [fixedSubjectPlacement] : legalSubjectPlacements(subjectSpecies)

  subjectPlacements.forEach(subjectPlacement => {
    const subjectPosition = subjectPlacement.position
    const pieces = mergeRelationPieces({
      basePieces: fixedPieces,
      relationPieces: new Map([[subjectPosition, pieceCode(teamForActorWithContext(payload.subject, movingTeam), subjectPlacement.species)]]),
      reservedSquares
    })
    if (!pieces) { return }
    const targetPositions = fixedTargetPlacement ? [fixedTargetPlacement.position] : adjacentNeighborPositions(subjectPosition)
    targetPositions.forEach(targetPosition => {
      if (targetPosition === null) { return }
      const effectiveTargetSpecies = fixedTargetPlacement?.species || targetSpecies
      if (!legalPlacementForSpecies(targetPosition, effectiveTargetSpecies)) { return }
      const relationPieces = mergeRelationPieces({
        basePieces: pieces,
        relationPieces: new Map([[targetPosition, pieceCode(teamForActorWithContext(payload.target, movingTeam), effectiveTargetSpecies)]]),
        reservedSquares
      })
      if (!relationPieces) { return }
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

export function buildShieldSkeletons({ payload, subjectSpecies, targetSpecies, movingTeam = Board.WHITE, fixedPieces = new Map(), fixedSubjectPlacement = null, fixedTargetPlacement = null, reservedSquares = new Set() }) {
  const skeletons = []
  const attackerTeam = Board.opposingTeam(teamForActorWithContext(payload.target, movingTeam))
  const subjectPlacements = fixedSubjectPlacement ? [fixedSubjectPlacement] : legalSubjectPlacements(subjectSpecies)

  subjectPlacements.forEach(subjectPlacement => {
    const subjectPosition = subjectPlacement.position
    RAY_STEPS.forEach(step => {
      const targetPositions = fixedTargetPlacement ? [fixedTargetPlacement.position] : [nextPositionOnRay(subjectPosition, step)].filter(Boolean)

      targetPositions.forEach(targetPosition => {
        if (targetPosition === null) { return }
        const effectiveTargetSpecies = fixedTargetPlacement?.species || targetSpecies
        if (!legalPlacementForSpecies(targetPosition, effectiveTargetSpecies)) { return }

        for (let distance = 1; distance <= 3; distance += 1) {
          let attackerPosition = subjectPosition
          for (let count = 0; count < distance; count += 1) {
            attackerPosition = nextPositionOnRay(attackerPosition, -step)
            if (attackerPosition === null) { break }
          }
          if (attackerPosition === null) { continue }

          shieldAttackerSpeciesForStep(step).forEach(attackerSpecies => {
            const relationPieces = mergeRelationPieces({
              basePieces: fixedPieces,
              relationPieces: new Map([
                [subjectPosition, pieceCode(teamForActorWithContext(payload.subject, movingTeam), subjectPlacement.species)],
                [targetPosition, pieceCode(teamForActorWithContext(payload.target, movingTeam), effectiveTargetSpecies)],
                [attackerPosition, pieceCode(attackerTeam, attackerSpecies)]
              ]),
              reservedSquares
            })
            if (!relationPieces) { return }
            const board = buildBoardFromLayout(buildLayoutFromPieces(relationPieces))
            const shielded = shieldedPositions({ board, sourcePosition: subjectPosition, team: teamForActorWithContext(payload.target, movingTeam) })
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
  })
  return skeletons
}
