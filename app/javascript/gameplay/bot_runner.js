import CandidateMoveAnalysis from 'gameplay/candidate_move_analysis'
import ConditionEvaluator from 'gameplay/condition_evaluator'

class BotRunner {
  constructor(compiledProgram, options = {}) {
    this.compiledProgram = compiledProgram
    this.analysisFactory = options.analysisFactory || ((args) => new CandidateMoveAnalysis(args))
    this.conditionEvaluator = options.conditionEvaluator || new ConditionEvaluator()
  }

  scoreMove({ board, moveObject }) {
    const analysis = this.analysisFactory({ board, moveObject })
    const state = {
      score: 0,
      halted: false
    }

    // Future trace collection should hook in here so one move evaluation can
    // optionally produce a structural execution trace without changing the
    // scoring contract.
    this.runNode(this.compiledProgram.root, analysis, state)

    return state.score
  }

  runNode(nodeId, analysis, state) {
    if (state.halted) {
      return
    }

    const node = this.compiledProgram.nodes[nodeId]
    if (!node) {
      throw new Error(`Unknown compiled node: ${nodeId}`)
    }

    switch (node.type) {
      case 'root':
      case 'organizer':
        this.runChildren(node.children || [], analysis, state)
        break
      case 'condition':
        if (this.conditionEvaluator.evaluate(node.data, analysis)) {
          this.runChildren(node.children || [], analysis, state)
        }
        break
      case 'action':
        this.applyAction(node.data, state)
        break
      default:
        throw new Error(`Unknown compiled node type: ${node.type}`)
    }
  }

  runChildren(childIds, analysis, state) {
    for (const childId of childIds) {
      if (state.halted) {
        break
      }

      this.runNode(childId, analysis, state)
    }
  }

  applyAction(actionNode, state) {
    switch (actionNode.actionType) {
      case 'add':
        state.score += actionNode.value
        break
      case 'subtract':
        state.score -= actionNode.value
        break
      case 'set':
        state.score = actionNode.value
        break
      case 'return':
        state.score = actionNode.value
        state.halted = true
        break
      default:
        throw new Error(`Unknown action type: ${actionNode.actionType}`)
    }
  }
}

export default BotRunner
