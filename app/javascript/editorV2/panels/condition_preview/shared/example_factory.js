import { soundForMove, moveKindForMoveObject } from './example_utils'
import { buildAggregatedResult, buildAggregatedHighlights } from './move_collection'

// Packages a verified Candidate into the example object that downstream
// rendering and diversity selection consume. One factory is created per
// pipeline call and reused across every candidate. Each call composes the
// chain-level aggregated result + highlights with the candidate's own state.

export class ExampleFactory {
  constructor({ combinedPlan }) {
    this.combinedPlan = combinedPlan
  }

  build(candidate, { generationPath, geometryKey, moveKind = null }) {
    const aggregatedResult = buildAggregatedResult(this.combinedPlan, candidate.analysis)
    if (!aggregatedResult) { return null }

    const highlights = buildAggregatedHighlights(
      this.combinedPlan, candidate.moveObject, aggregatedResult, candidate.priorBoard
    )
    const movedPieceInRelation = (
      aggregatedResult.subjectPositions.includes(candidate.moveObject.endPosition) ||
      aggregatedResult.targetPositions.includes(candidate.moveObject.endPosition)
    )

    return {
      priorBoard: candidate.priorBoard,
      afterBoard: candidate.afterBoard,
      moveObject: candidate.moveObject,
      result: aggregatedResult,
      highlights,
      variantType: movedPieceInRelation ? 'involved' : 'separate',
      geometryKey,
      movedPieceInRelation,
      moveKind: moveKind ?? moveKindForMoveObject(candidate.moveObject),
      sound: soundForMove(candidate.priorBoard, candidate.afterBoard, candidate.moveObject),
      generationPath
    }
  }
}
