import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import { layoutsMatch } from 'editorV2/panels/condition_preview/shared/board_utils'

// A move (priorBoard + moveObject) being considered for an example. Pure
// state plus two memoized derivations: the after-board (priorBoard advanced
// by moveObject) and the analysis (CandidateMoveAnalysisV2). Both are
// computed lazily so callers only pay for what they read.
//
// matchesLayout is a self-query used by the special-moves pipelines, which
// build prior+after directly from a preset and need to confirm the rebuilt
// after matches the preset's layout.
//
// Verification logic lives on CandidateVerifier; example construction lives
// on ExampleFactory. Candidate stays focused on "the candidate itself."

export class Candidate {
  constructor({ priorBoard, moveObject }) {
    this.priorBoard = priorBoard
    this.moveObject = moveObject
    this._afterBoard = null
    this._analysis = null
  }

  get afterBoard() {
    if (this._afterBoard === null) {
      this._afterBoard = this.priorBoard.lightClone()
      this._afterBoard._hypotheticallyMovePiece(this.moveObject)
    }
    return this._afterBoard
  }

  get analysis() {
    if (this._analysis === null) {
      this._analysis = new CandidateMoveAnalysisV2({ board: this.priorBoard, moveObject: this.moveObject })
    }
    return this._analysis
  }

  matchesLayout(expectedLayout) {
    return layoutsMatch(this.afterBoard.layOut, expectedLayout)
  }
}
