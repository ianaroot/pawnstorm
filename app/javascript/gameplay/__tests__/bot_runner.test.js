import { describe, expect, it } from 'vitest'
import BotRunner from 'gameplay/bot_runner'

function buildProgram(nodes) {
  return {
    version: 1,
    root: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'root',
        data: {},
        children: ['first', 'second']
      },
      ...nodes
    }
  }
}

class FakeConditionEvaluator {
  constructor(resultsByRelation = {}) {
    this.resultsByRelation = resultsByRelation
  }

  evaluate(conditionNode) {
    return this.resultsByRelation[conditionNode.relation] ?? false
  }
}

describe('BotRunner', () => {
  it('walks children in compiled order and applies action scores', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'score',
        data: { actionType: 'add', value: 2 },
        children: []
      },
      second: {
        id: 'second',
        type: 'score',
        data: { actionType: 'add', value: 3 },
        children: []
      }
    })

    const runner = new BotRunner(program)

    expect(runner.scoreMove({ board: {}, moveObject: {} })).toBe(5)
  })

  it('continues into condition children only when the condition passes', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'condition',
        data: { relation: 'pass', comparison: 'greater_than', comparisonValue: 0 },
        children: ['grandchild']
      },
      grandchild: {
        id: 'grandchild',
        type: 'score',
        data: { actionType: 'add', value: 4 },
        children: []
      },
      second: {
        id: 'second',
        type: 'condition',
        data: { relation: 'fail', comparison: 'greater_than', comparisonValue: 0 },
        children: ['ignored']
      },
      ignored: {
        id: 'ignored',
        type: 'score',
        data: { actionType: 'add', value: 100 },
        children: []
      }
    })

    const runner = new BotRunner(program, {
      conditionEvaluator: new FakeConditionEvaluator({ pass: true, fail: false }),
      analysisFactory: () => ({})
    })

    expect(runner.scoreMove({ board: {}, moveObject: {} })).toBe(4)
  })

  it('lets organizers pass traversal through to their ordered children', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'organizer',
        data: {},
        children: ['grandchild']
      },
      grandchild: {
        id: 'grandchild',
        type: 'score',
        data: { actionType: 'add', value: 7 },
        children: []
      },
      second: {
        id: 'second',
        type: 'score',
        data: { actionType: 'subtract', value: 2 },
        children: []
      }
    })

    const runner = new BotRunner(program)

    expect(runner.scoreMove({ board: {}, moveObject: {} })).toBe(5)
  })

  it('treats actions as depth-terminating but still continues sibling traversal', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'score',
        data: { actionType: 'add', value: 2 },
        children: ['ignored_child']
      },
      ignored_child: {
        id: 'ignored_child',
        type: 'score',
        data: { actionType: 'add', value: 100 },
        children: []
      },
      second: {
        id: 'second',
        type: 'score',
        data: { actionType: 'add', value: 3 },
        children: []
      }
    })

    const runner = new BotRunner(program)

    expect(runner.scoreMove({ board: {}, moveObject: {} })).toBe(5)
  })

  it('halts all further traversal on return actions', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'score',
        data: { actionType: 'return', value: 11 },
        children: []
      },
      second: {
        id: 'second',
        type: 'score',
        data: { actionType: 'add', value: 3 },
        children: []
      }
    })

    const runner = new BotRunner(program)

    expect(runner.scoreMove({ board: {}, moveObject: {} })).toBe(11)
  })

  it('creates one analysis object per move evaluation', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'score',
        data: { actionType: 'add', value: 1 },
        children: []
      },
      second: {
        id: 'second',
        type: 'score',
        data: { actionType: 'add', value: 1 },
        children: []
      }
    })

    let callCount = 0
    const runner = new BotRunner(program, {
      analysisFactory: () => {
        callCount += 1
        return {}
      }
    })

    runner.scoreMove({ board: {}, moveObject: {} })
    expect(callCount).toBe(1)
  })

  it('can return a trace with condition results and action score changes', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'condition',
        data: { relation: 'pass', comparison: 'greater_than', comparisonValue: 0 },
        children: ['grandchild']
      },
      grandchild: {
        id: 'grandchild',
        type: 'score',
        data: { actionType: 'add', value: 4 },
        children: []
      },
      second: {
        id: 'second',
        type: 'score',
        data: { actionType: 'return', value: 9 },
        children: []
      }
    })

    const runner = new BotRunner(program, {
      conditionEvaluator: new FakeConditionEvaluator({ pass: true }),
      analysisFactory: () => ({})
    })

    expect(runner.scoreMove({ board: {}, moveObject: {}, withTrace: true })).toEqual({
      score: 9,
      halted: true,
      trace: [
        {
          nodeId: 'first',
          nodeType: 'condition',
          passed: true,
          data: { relation: 'pass', comparison: 'greater_than', comparisonValue: 0 }
        },
        {
          nodeId: 'grandchild',
          nodeType: 'score',
          actionType: 'add',
          value: 4,
          scoreBefore: 0,
          scoreAfter: 4,
          halted: false
        },
        {
          nodeId: 'second',
          nodeType: 'score',
          actionType: 'return',
          value: 9,
          scoreBefore: 4,
          scoreAfter: 9,
          halted: true
        }
      ]
    })
  })

  it('scores all legal moves and returns move-score pairs', () => {
    const program = buildProgram({
      first: {
        id: 'first',
        type: 'score',
        data: { actionType: 'add', value: 1 },
        children: []
      },
      second: {
        id: 'second',
        type: 'score',
        data: { actionType: 'add', value: 1 },
        children: []
      }
    })

    const moveA = { id: 'a' }
    const moveB = { id: 'b' }
    const runner = new BotRunner(program)
    runner.legalMoves = () => [moveA, moveB]

    expect(runner.scoreLegalMoves({ board: {} })).toEqual([
      { moveObject: moveA, score: 2 },
      { moveObject: moveB, score: 2 }
    ])
  })

  it('selects the highest-scoring legal move', () => {
    const program = buildProgram({})
    const moveA = { id: 'a' }
    const moveB = { id: 'b' }
    const runner = new BotRunner(program)

    runner.scoreLegalMoves = () => ([
      { moveObject: moveA, score: 2 },
      { moveObject: moveB, score: 5 }
    ])

    expect(runner.selectMove({ board: {} })).toBe(moveB)
  })

  it('breaks score ties using the injected random source', () => {
    const program = buildProgram({})
    const moveA = { id: 'a' }
    const moveB = { id: 'b' }
    const runner = new BotRunner(program, { random: () => 0.9 })

    runner.scoreLegalMoves = () => ([
      { moveObject: moveA, score: 5 },
      { moveObject: moveB, score: 5 }
    ])

    expect(runner.selectMove({ board: {} })).toBe(moveB)
  })

  it('returns null when there are no legal moves to score', () => {
    const program = buildProgram({})
    const runner = new BotRunner(program)

    runner.scoreLegalMoves = () => []

    expect(runner.selectMove({ board: {} })).toBe(null)
  })
})
