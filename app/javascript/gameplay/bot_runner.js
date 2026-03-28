import CandidateMoveAnalysis from 'gameplay/candidate_move_analysis'
import ConditionEvaluator from 'gameplay/condition_evaluator'
import Rules from 'gameplay/rules'

class BotRunner {
  constructor(compiledProgram, options = {}) {
    this.compiledProgram = compiledProgram
    this.analysisFactory = options.analysisFactory || ((args) => new CandidateMoveAnalysis(args))
    this.conditionEvaluator = options.conditionEvaluator || new ConditionEvaluator()
    this.random = options.random || Math.random
  }

  scoreMove({ board, moveObject, withTrace = false }) {
    const analysis = this.analysisFactory({ board, moveObject })
    const state = {
      score: 0,
      halted: false,
      trace: withTrace ? [] : null
    }

    this.runNode(this.compiledProgram.root, analysis, state)

    if (!withTrace) {
      return state.score
    }

    return {
      score: state.score,
      halted: state.halted,
      trace: state.trace
    }
  }

  legalMoves({ board }) {
    const movingTeam = board.allowedToMove
    const positions = board._positionsOccupiedByTeam(movingTeam)

    return positions.flatMap(startPosition => {
      return Rules.availableMovesFrom({ board, startPosition })
    })
  }

  scoreLegalMoves({ board, withTrace = false }) {
    return this.legalMoves({ board }).map(moveObject => {
      const scoreResult = this.scoreMove({ board, moveObject, withTrace })

      if (!withTrace) {
        return {
          moveObject,
          score: scoreResult
        }
      }

      return {
        moveObject,
        ...scoreResult
      }
    })
  }

  selectMove({ board }) {
    const scoredMoves = this.scoreLegalMoves({ board })
    if (scoredMoves.length === 0) {
      return null
    }

    const topScore = Math.max(...scoredMoves.map(result => result.score))
    const topMoves = scoredMoves.filter(result => result.score === topScore)
    const selected = topMoves[Math.floor(this.random() * topMoves.length)]

    return selected.moveObject
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
        {
          const passed = this.conditionEvaluator.evaluate(node.data, analysis)
          this.recordTrace(state, {
            nodeId,
            nodeType: 'condition',
            passed,
            data: node.data
          })

          if (passed) {
            this.runChildren(node.children || [], analysis, state)
          }
        }
        break
      case 'action':
        this.applyAction(nodeId, node.data, state)
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

  applyAction(nodeId, actionNode, state) {
    const scoreBefore = state.score

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

    this.recordTrace(state, {
      nodeId,
      nodeType: 'action',
      actionType: actionNode.actionType,
      value: actionNode.value,
      scoreBefore,
      scoreAfter: state.score,
      halted: state.halted
    })
  }

  recordTrace(state, entry) {
    if (!state.trace) {
      return
    }

    state.trace.push(entry)
  }
}

export default BotRunner
