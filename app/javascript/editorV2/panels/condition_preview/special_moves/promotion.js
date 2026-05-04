import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { MOVE_KIND_PROMOTION, candidateIdentity } from '../shared/example_utils'
import {
  clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout, placeKingsIfAbsent, shuffled
} from '../shared/board_utils'
import { buildSeedFromPreset, promotionPresetsForTeam } from '../seeds/seed_builder'
import { evaluateAndBuildExample } from './example_construction'

const CAPTURED_SPECIES_OPTIONS = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])

function* roundRobinPromotionPresets(presets, random) {
  const bucketMap = new Map()
  for (const preset of presets) {
    const key = `${preset.promotedSpecies}-${preset.captureDirection}`
    if (!bucketMap.has(key)) { bucketMap.set(key, []) }
    bucketMap.get(key).push(preset)
  }

  const buckets = Array.from(bucketMap.values()).map(bucket => shuffled(bucket, random))
  const indices = new Array(buckets.length).fill(0)

  let remaining = true
  while (remaining) {
    remaining = false
    for (let b = 0; b < buckets.length; b++) {
      if (indices[b] < buckets[b].length) {
        yield buckets[b][indices[b]++]
        remaining = true
      }
    }
  }
}

export function collectPromotionExamples({ combinedPlan, random, maxExamples }) {
  const allPresets = promotionPresetsForTeam(combinedPlan.movingTeam)
  const examples = []
  const seen = new Set()
  const enemyTeam = Board.opposingTeam(combinedPlan.movingTeam)

  for (const preset of roundRobinPromotionPresets(allPresets, random)) {
    if (examples.length >= maxExamples) { break }

    const seed = buildSeedFromPreset(combinedPlan, preset, MOVE_KIND_PROMOTION, random)
    if (!seed) { continue }

    const piecesWithKings = placeKingsIfAbsent(seed.pieces, random)
    if (!piecesWithKings) { continue }

    if (piecesWithKings.get(preset.moveEnd) !== `${combinedPlan.movingTeam}${preset.promotedSpecies}`) { continue }

    const afterLayout = buildLayoutFromPieces(piecesWithKings)
    const afterBoard = buildBoardFromLayout(afterLayout)

    const basePriorPieces = clonePiecesMap(piecesWithKings)
    basePriorPieces.delete(preset.moveEnd)
    if (basePriorPieces.has(preset.moveStart)) { continue }

    const capturedOptions = preset.isCapture ? CAPTURED_SPECIES_OPTIONS : [null]

    for (const capturedSpecies of capturedOptions) {
      if (examples.length >= maxExamples) { break }

      const priorPieces = clonePiecesMap(basePriorPieces)
      if (capturedSpecies !== null) {
        priorPieces.set(preset.moveEnd, `${enemyTeam}${capturedSpecies}`)
      }
      priorPieces.set(preset.moveStart, `${combinedPlan.movingTeam}${Board.PAWN}`)

      const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces), null, combinedPlan.movingTeam)

      let moveObject
      try {
        moveObject = Rules.getMoveObject(preset.moveStart, preset.moveEnd, priorBoard, preset.promotedSpecies)
      } catch {
        continue
      }

      if (!moveObject.promotionPiece) { continue }

      const example = evaluateAndBuildExample({
        combinedPlan, priorBoard, afterLayout, afterBoard, moveObject, seed,
        moveKind: MOVE_KIND_PROMOTION
      })
      if (!example) { continue }

      const identity = candidateIdentity(example)
      if (seen.has(identity)) { continue }
      seen.add(identity)
      examples.push(example)
    }
  }

  return examples
}
