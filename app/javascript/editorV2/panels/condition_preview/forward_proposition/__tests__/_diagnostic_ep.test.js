import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { buildCombinedPlan } from 'editorV2/panels/condition_preview/plans/plan'
import { candidateIdentity } from 'editorV2/panels/condition_preview/shared/example_utils'
import { collectForwardPropositionExamples } from 'editorV2/panels/condition_preview/forward_proposition/collect'

function seededRandom(seed = 1) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}
function makeAdder() {
  const seen = new Set()
  return function addUnique(example, pool) {
    const id = candidateIdentity(example)
    if (seen.has(id)) { return }
    seen.add(id)
    pool.push(example)
  }
}

describe('DIAGNOSTIC: standard outputs board summary (delete after analysis)', () => {
  it('counts pieces per example', () => {
    const combinedPlan = buildCombinedPlan([{
      version: 2, kind: 'census',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'count', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 1
    }])
    const standardExamples = []
    const produced = { 'forward-proposition': 0 }
    collectForwardPropositionExamples({
      combinedPlan, random: seededRandom(8001), maxStandardSize: 200,
      addUnique: makeAdder(), standardExamples, produced, attempts: 200
    })
    console.log('Verified: ' + standardExamples.length)
    for (let i = 0; i < Math.min(5, standardExamples.length); i += 1) {
      const ex = standardExamples[i]
      const counts = {}
      for (const piece of ex.afterBoard.layOut) {
        if (piece === Board.EMPTY_SQUARE) { continue }
        counts[piece] = (counts[piece] ?? 0) + 1
      }
      console.log('[' + i + '] after-board pieces: ' + JSON.stringify(counts) + '  moveKind=' + ex.moveKind)
    }
    expect(true).toBe(true)
  })
})
