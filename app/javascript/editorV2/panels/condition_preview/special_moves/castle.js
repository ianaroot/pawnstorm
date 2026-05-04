import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { MOVE_KIND_CASTLE, candidateIdentity } from '../shared/example_utils'
import {
  clonePiecesMap, buildLayoutFromPieces, buildBoardFromLayout, placeKingsIfAbsent
} from '../shared/board_utils'
import { buildSeedFromPreset, castlePresetsForTeam } from '../seeds/seed_builder'
import { Candidate } from '../shared/candidate'
import { CandidateVerifier } from '../shared/candidate_verifier'
import { ExampleFactory } from '../shared/example_factory'

export function collectCastleExamples({ combinedPlan, random, maxExamples }) {
  const presets = castlePresetsForTeam(combinedPlan.movingTeam)
  const examples = []
  const seen = new Set()
  const verifier = new CandidateVerifier({ combinedPlan })
  const factory = new ExampleFactory({ combinedPlan })

  for (const preset of presets) {
    if (examples.length >= maxExamples) { break }

    const seed = buildSeedFromPreset(combinedPlan, preset, MOVE_KIND_CASTLE, random)
    if (!seed) { continue }

    const piecesWithKings = placeKingsIfAbsent(seed.pieces, random)
    if (!piecesWithKings) { continue }

    if (piecesWithKings.get(preset.kingEnd) !== `${combinedPlan.movingTeam}${Board.KING}`) { continue }
    if (piecesWithKings.get(preset.rookEnd) !== `${combinedPlan.movingTeam}${Board.ROOK}`) { continue }

    const afterLayout = buildLayoutFromPieces(piecesWithKings)

    const priorPieces = clonePiecesMap(piecesWithKings)
    priorPieces.delete(preset.kingEnd)
    priorPieces.delete(preset.rookEnd)
    if (priorPieces.has(preset.kingStart) || priorPieces.has(preset.rookStart)) { continue }
    priorPieces.set(preset.kingStart, `${combinedPlan.movingTeam}${Board.KING}`)
    priorPieces.set(preset.rookStart, `${combinedPlan.movingTeam}${Board.ROOK}`)

    const priorBoard = buildBoardFromLayout(buildLayoutFromPieces(priorPieces), null, combinedPlan.movingTeam)

    let moveObject
    try {
      moveObject = Rules.getMoveObject(preset.kingStart, preset.kingEnd, priorBoard)
    } catch {
      continue
    }

    if (!moveObject.additionalActions) { continue }

    const candidate = new Candidate({ priorBoard, moveObject })
    if (!verifier.isVerified(candidate)) { continue }
    if (!candidate.matchesLayout(afterLayout)) { continue }

    const example = factory.build(candidate, {
      generationPath: 'castle',
      geometryKey: seed.geometryKey,
      moveKind: MOVE_KIND_CASTLE
    })
    if (!example) { continue }

    const identity = candidateIdentity(example)
    if (seen.has(identity)) { continue }
    seen.add(identity)
    examples.push(example)
  }

  return examples
}
