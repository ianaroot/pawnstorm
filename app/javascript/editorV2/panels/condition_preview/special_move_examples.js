import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import {
  square, pieceCode, clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout,
  layoutsMatch, shuffled
} from 'editorV2/panels/condition_preview/board_utils'
import {
  speciesMatchesFilter, selectKingPair, candidateIdentity,
  MOVE_KIND_CASTLE, soundForMove
} from 'editorV2/panels/condition_preview/example_utils'
import {
  subjectTargetLabels, candidateLabel, evaluateCandidate
} from 'editorV2/panels/condition_preview/relational_utils'
import { buildCandidateSkeletons } from 'editorV2/panels/condition_preview/skeleton_builders'

const MAX_CASTLE_BUILD_ATTEMPTS = 300

export function castlePresetForTeam(team) {
  if (team !== Board.WHITE) { return [] }

  return [
    {
      name: 'castle-kingside',
      movingTeam: team,
      moveStart: square('e1'),
      moveEnd: square('g1'),
      rookStart: square('h1'),
      rookEnd: square('f1'),
      fixedPieces: new Map([
        [square('g1'), pieceCode(team, Board.KING)],
        [square('f1'), pieceCode(team, Board.ROOK)]
      ]),
      reservedSquares: new Set([square('e1'), square('h1')])
    },
    {
      name: 'castle-queenside',
      movingTeam: team,
      moveStart: square('e1'),
      moveEnd: square('c1'),
      rookStart: square('a1'),
      rookEnd: square('d1'),
      fixedPieces: new Map([
        [square('c1'), pieceCode(team, Board.KING)],
        [square('d1'), pieceCode(team, Board.ROOK)]
      ]),
      reservedSquares: new Set([square('a1'), square('b1'), square('e1')])
    }
  ]
}

export function castleAnchorPlacementsForActor({ actor, filter = 'any', filterMode = null, preset, movingTeam = Board.WHITE }) {
  const alliedAnchors = [
    { position: preset.moveEnd, species: Board.KING },
    { position: preset.rookEnd, species: Board.ROOK }
  ]

  if (actor === 'moved_piece') {
    return speciesMatchesFilter(Board.KING, filter, filterMode) ? [alliedAnchors[0]] : []
  }
  if (actor !== 'allied') { return [] }

  return alliedAnchors.filter(anchor => speciesMatchesFilter(anchor.species, filter, filterMode))
}

export function collectLegalCastleMoveExamples({ afterPieces, preset, random }) {
  const piecesWithKings = selectKingPair(afterPieces, random)
  if (!piecesWithKings) { return [] }
  if (piecesWithKings.get(preset.moveEnd) !== pieceCode(preset.movingTeam, Board.KING)) { return [] }
  if (piecesWithKings.get(preset.rookEnd) !== pieceCode(preset.movingTeam, Board.ROOK)) { return [] }

  const afterLayout = buildLayoutFromPieces(piecesWithKings)
  const priorPieces = clonePiecesMap(piecesWithKings)
  priorPieces.delete(preset.moveEnd)
  priorPieces.delete(preset.rookEnd)
  if (priorPieces.has(preset.moveStart) || priorPieces.has(preset.rookStart)) { return [] }
  priorPieces.set(preset.moveStart, pieceCode(preset.movingTeam, Board.KING))
  priorPieces.set(preset.rookStart, pieceCode(preset.movingTeam, Board.ROOK))

  const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces))
  let moveObject
  try {
    moveObject = Rules.getMoveObject(preset.moveStart, preset.moveEnd, priorBoard)
  } catch {
    return []
  }
  if (moveObject.illegal || !moveObject.additionalActions || !/^O-O/.test(moveObject.pieceNotation || '')) { return [] }

  const rebuiltAfter = priorBoard.lightClone()
  rebuiltAfter._hypotheticallyMovePiece(moveObject)
  if (!layoutsMatch(rebuiltAfter.layOut, afterLayout)) { return [] }

  return [{ priorBoard, moveObject, afterBoard: rebuiltAfter }]
}

export function collectCastleExamples({ plan, random, maxExamples }) {
  const subjectSpeciesPool = shuffled([...plan.subjectSpeciesPool], random)
  const targetSpeciesPool = shuffled([...plan.targetSpeciesPool], random)
  const examples = []
  const seen = new Set()
  let attempts = 0

  castlePresetForTeam(plan.movingTeam).forEach(preset => {
    subjectSpeciesPool.forEach(subjectSpecies => {
      targetSpeciesPool.forEach(targetSpecies => {
        const subjectAnchors = [null, ...castleAnchorPlacementsForActor({
          actor: plan.subject,
          filter: plan.subjectFilter,
          filterMode: plan.subjectFilterMode,
          preset,
          movingTeam: plan.movingTeam
        })]
        const targetAnchors = [null, ...castleAnchorPlacementsForActor({
          actor: plan.target,
          filter: plan.targetFilter,
          filterMode: plan.targetFilterMode,
          preset,
          movingTeam: plan.movingTeam
        })]

        subjectAnchors.forEach(fixedSubjectPlacement => {
          targetAnchors.forEach(fixedTargetPlacement => {
            if (attempts >= MAX_CASTLE_BUILD_ATTEMPTS || examples.length >= maxExamples) { return }
            const skeletons = buildCandidateSkeletons({
              plan,
              subjectSpecies,
              targetSpecies,
              fixedPieces: preset.fixedPieces,
              fixedSubjectPlacement,
              fixedTargetPlacement,
              reservedSquares: preset.reservedSquares
            })

            skeletons.forEach(skeleton => {
              plan.variants.forEach(variant => {
                attempts += 1
                if (attempts > MAX_CASTLE_BUILD_ATTEMPTS || examples.length >= maxExamples) { return }
                collectLegalCastleMoveExamples({ afterPieces: skeleton.pieces, preset, random }).forEach(moveExample => {
                  const result = evaluateCandidate({
                    plan,
                    priorBoard: moveExample.priorBoard,
                    moveObject: moveExample.moveObject
                  })
                  if (!result) { return }

                  const movedPieceInRelation = (
                    result.subjectPositions.includes(moveExample.moveObject.endPosition) ||
                    result.targetPositions.includes(moveExample.moveObject.endPosition)
                  )
                  if (variant.type === 'involved' && !movedPieceInRelation) { return }
                  if (variant.type === 'separate' && movedPieceInRelation) { return }

                  const example = {
                    priorBoard: moveExample.priorBoard,
                    afterBoard: moveExample.afterBoard,
                    moveObject: moveExample.moveObject,
                    result,
                    highlights: subjectTargetLabels(plan, moveExample.moveObject, result),
                    label: candidateLabel(variant),
                    variantType: movedPieceInRelation ? 'involved' : 'separate',
                    geometryKey: `${preset.name}:${skeleton.geometryKey}`,
                    movedPieceInRelation,
                    moveKind: MOVE_KIND_CASTLE,
                    sound: soundForMove(moveExample.priorBoard, moveExample.afterBoard, moveExample.moveObject)
                  }
                  const identity = candidateIdentity(example)
                  if (seen.has(identity)) { return }
                  seen.add(identity)
                  examples.push(example)
                })
              })
            })
          })
        })
      })
    })
  })

  return examples
}
