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
        type: 'action',
        data: { actionType: 'add', value: 2 },
        children: []
      },
      second: {
        id: 'second',
        type: 'action',
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
        data: { relation: 'pass', comparison: 'any', comparisonValue: null },
        children: ['grandchild']
      },
      grandchild: {
        id: 'grandchild',
        type: 'action',
        data: { actionType: 'add', value: 4 },
        children: []
      },
      second: {
        id: 'second',
        type: 'condition',
        data: { relation: 'fail', comparison: 'any', comparisonValue: null },
        children: ['ignored']
      },
      ignored: {
        id: 'ignored',
        type: 'action',
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
        type: 'action',
        data: { actionType: 'add', value: 7 },
        children: []
      },
      second: {
        id: 'second',
        type: 'action',
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
        type: 'action',
        data: { actionType: 'add', value: 2 },
        children: ['ignored_child']
      },
      ignored_child: {
        id: 'ignored_child',
        type: 'action',
        data: { actionType: 'add', value: 100 },
        children: []
      },
      second: {
        id: 'second',
        type: 'action',
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
        type: 'action',
        data: { actionType: 'return', value: 11 },
        children: []
      },
      second: {
        id: 'second',
        type: 'action',
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
        type: 'action',
        data: { actionType: 'add', value: 1 },
        children: []
      },
      second: {
        id: 'second',
        type: 'action',
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
})
