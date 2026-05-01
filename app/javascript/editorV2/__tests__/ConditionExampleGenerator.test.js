import { describe, expect, it } from 'vitest'

import CandidateMoveAnalysisV2 from 'bot_execution/candidate_move_analysis_v2'
import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import generateConditionExamples from '../panels/condition_preview_generation/ConditionExampleGenerator'

function seededRandom(seed = 12345) {
  let current = seed >>> 0
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0
    return current / 0x100000000
  }
}

function evaluateExample(payload, example) {
  const evaluator = new ConditionEvaluatorV2()
  return evaluator.evaluate(payload, {
    board: example.priorBoard,
    moveObject: example.moveObject
  })
}

function expectLegalPriorTurnState(example) {
  const movedTeam = example.priorBoard.teamAt(example.moveObject.startPosition)
  const opposingTeam = Board.opposingTeam(movedTeam)
  expect(Rules.checkQuery({ board: example.priorBoard, teamString: opposingTeam })).toBe(false)
}

function relationalValueForSide(example, side) {
  const analysis = new CandidateMoveAnalysisV2({
    board: example.priorBoard,
    moveObject: example.moveObject
  })
  const positions = side === 'subject' ? example.result.subjectPositions : example.result.targetPositions
  return analysis.metricForPositions({ metric: 'aggregate_value', positions })
}

function relationalValueForSideScoped(payload, example, side, boardScope = 'after') {
  const analysis = new CandidateMoveAnalysisV2({
    board: example.priorBoard,
    moveObject: example.moveObject
  })
  const result = analysis.relationalResult({
    subject: payload.subject,
    subjectFilter: payload.subjectFilter || 'any',
    subjectFilterMode: payload.subjectFilterMode || null,
    operator: payload.operator,
    target: payload.target,
    targetFilter: payload.targetFilter || 'any',
    targetFilterMode: payload.targetFilterMode || null,
    boardScope
  })
  const positions = side === 'subject' ? result.subjectPositions : result.targetPositions
  return analysis.metricForPositions({ metric: 'aggregate_value', positions, boardScope })
}

function relationalCountForSide(payload, example, side, boardScope = 'after') {
  const analysis = new CandidateMoveAnalysisV2({
    board: example.priorBoard,
    moveObject: example.moveObject
  })
  const result = analysis.relationalResult({
    subject: payload.subject,
    subjectFilter: payload.subjectFilter || 'any',
    subjectFilterMode: payload.subjectFilterMode || null,
    operator: payload.operator,
    target: payload.target,
    targetFilter: payload.targetFilter || 'any',
    targetFilterMode: payload.targetFilterMode || null,
    boardScope
  })
  return side === 'subject' ? result.subjectPositions.length : result.targetPositions.length
}

describe('ConditionExampleGenerator', () => {
  it('marks cover previews unsupported with a specific message', () => {
    const preview = generateConditionExamples({
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'cover',
      target: 'enemy',
      targetFilter: 'any'
    }, { random: seededRandom(1) })

    expect(preview.status).toBe('unsupported')
    expect(preview.reason).toBe('Cover previews are not supported yet.')
    expect(preview.examples).toEqual([])
  })

  it('marks unsupported relational value comparison sources with a specific message', () => {
    const preview = generateConditionExamples({
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'enemy'
    }, { random: seededRandom(11) })

    expect(preview.status).toBe('unsupported')
    expect(preview.reason).toBe('This relational comparison source is not supported yet.')
  })

  it('supports greater-than prior-board value comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'prior_board_state'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(12) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(relationalValueForSideScoped(payload, example, 'subject', 'after'))
        .toBeGreaterThan(relationalValueForSideScoped(payload, example, 'subject', 'prior'))
      expectLegalPriorTurnState(example)
    })
  })

  it('supports less-than prior-board value comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'less_than',
      subjectComparisonSource: 'prior_board_state'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(26) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(relationalValueForSideScoped(payload, example, 'subject', 'after'))
        .toBeLessThan(relationalValueForSideScoped(payload, example, 'subject', 'prior'))
      expectLegalPriorTurnState(example)
    })
  })

  it('supports equal-to prior-board value comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'equal_to',
      subjectComparisonSource: 'prior_board_state'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(27) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(relationalValueForSideScoped(payload, example, 'subject', 'after'))
        .toBe(relationalValueForSideScoped(payload, example, 'subject', 'prior'))
      expectLegalPriorTurnState(example)
    })
  })

  it('supports greater-than prior-board count comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'count',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'prior_board_state'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(23) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(relationalCountForSide(payload, example, 'subject', 'after'))
        .toBeGreaterThan(relationalCountForSide(payload, example, 'subject', 'prior'))
      expectLegalPriorTurnState(example)
    })
  })

  it('supports less-than prior-board count comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'count',
      subjectComparator: 'less_than',
      subjectComparisonSource: 'prior_board_state'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(24) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(relationalCountForSide(payload, example, 'subject', 'after'))
        .toBeLessThan(relationalCountForSide(payload, example, 'subject', 'prior'))
      expectLegalPriorTurnState(example)
    })
  })

  it('supports equal-to prior-board count comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'count',
      subjectComparator: 'equal_to',
      subjectComparisonSource: 'prior_board_state'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(25) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(relationalCountForSide(payload, example, 'subject', 'after'))
        .toBe(relationalCountForSide(payload, example, 'subject', 'prior'))
      expectLegalPriorTurnState(example)
    })
  })

  it('builds multiple verified attack examples', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(2) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(1)
    expect(preview.examples.length).toBeLessThanOrEqual(30)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
    })
  })

  it('enforces more variety across subject and target species when filters allow it', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'any'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(3) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBe(30)

    const speciesPairs = new Set(
      preview.examples.map(example => {
        const subjectSpecies = example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
        const targetSpecies = example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
        return `${subjectSpecies}=>${targetSpecies}`
      })
    )
    const subjectSpecies = new Set(
      preview.examples.map(example => {
        return example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
      })
    )
    const targetSpecies = new Set(
      preview.examples.map(example => {
        return example.result.targetPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
      })
    )

    expect(speciesPairs.size).toBeGreaterThan(2)
    expect(subjectSpecies.size).toBeGreaterThan(2)
    expect(targetSpecies.size).toBeGreaterThan(2)

    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
    })
  })

  it('supports moved_piece relational queries from the start', () => {
    const payload = {
      kind: 'relational',
      subject: 'moved_piece',
      subjectFilter: 'knight',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(4) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.result.subjectPositions).toContain(example.moveObject.endPosition)
      expectLegalPriorTurnState(example)
    })
  })

  it('never returns a prior board where the opponent is already in check before the move', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'moved_piece',
      targetFilter: 'any'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(18) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('supports enemy_moved_piece relational queries with retained move context', () => {
    const payload = {
      kind: 'relational',
      subject: 'enemy_moved_piece',
      subjectFilter: 'knight',
      operator: 'adjacent',
      target: 'allied',
      targetFilter: 'pawn'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(5) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.priorBoard.recentMoveContext).toBeTruthy()
      expect(example.result.subjectPositions).toContain(example.priorBoard.recentMoveContext.movedPieceEndPosition)
    })
  })

  it('supports exact-number count comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'any',
      subjectComparisonMetric: 'count',
      subjectComparator: 'greater_than_or_equal_to',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 2,
      targetComparisonMetric: 'count',
      targetComparator: 'greater_than_or_equal_to',
      targetComparisonSource: 'exact_number',
      targetComparisonSourceTotal: 2
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(13) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.result.subjectPositions.length).toBeGreaterThanOrEqual(2)
      expect(example.result.targetPositions.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('builds verified examples for allied queen attack enemy any with target count equal to 3', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'queen',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any',
      targetComparisonMetric: 'count',
      targetComparator: 'equal_to',
      targetComparisonSource: 'exact_number',
      targetComparisonSourceTotal: 3
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(101) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.result.targetPositions.length).toBe(3)
      expectLegalPriorTurnState(example)
    })
  })

  it('builds verified examples for allied pawn attack enemy any with subject count equal to 2', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'pawn',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any',
      subjectComparisonMetric: 'count',
      subjectComparator: 'equal_to',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 2
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(102) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.result.subjectPositions.length).toBe(2)
      expectLegalPriorTurnState(example)
    })
  })

  it('uses forward generation for allied attack enemy count > prior_board_state', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any', operator: 'attack',
      target: 'enemy', targetFilter: 'any',
      subjectComparisonMetric: 'count', subjectComparator: 'greater_than', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(801) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('uses forward generation for allied defend allied count < prior_board_state via mover-leaves-target', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any', operator: 'defend',
      target: 'allied', targetFilter: 'pawn',
      subjectComparisonMetric: 'count', subjectComparator: 'less_than', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(802) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('uses forward generation for allied attack count < prior_board_state via mover-leaves-subject (B)', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any', operator: 'attack',
      target: 'enemy', targetFilter: 'any',
      subjectComparisonMetric: 'count', subjectComparator: 'less_than', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1101) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('uses forward generation for enemy attack allied count > prior_board_state via mover-becomes-target (F)', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'enemy', subjectFilter: 'any', operator: 'attack',
      target: 'allied', targetFilter: 'any',
      subjectComparisonMetric: 'count', subjectComparator: 'greater_than', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1102) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('uses forward generation for allied defend allied count > prior_board_state', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any', operator: 'defend',
      target: 'allied', targetFilter: 'pawn',
      subjectComparisonMetric: 'count', subjectComparator: 'greater_than', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1103) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('uses forward generation for moved_piece mobility < prior_board_state', () => {
    const payload = {
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'mobility', comparator: 'less_than',
      target: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1104) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('uses forward generation for adjacent count < prior_board_state', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'allied', subjectFilter: 'any', operator: 'adjacent',
      target: 'enemy', targetFilter: 'any',
      subjectComparisonMetric: 'count', subjectComparator: 'less_than', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1105) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('flags contradiction when a singular actor has count > 1', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'moved_piece', subjectFilter: 'any', operator: 'attack',
      target: 'enemy', targetFilter: 'any',
      subjectComparisonMetric: 'count', subjectComparator: 'equal_to',
      subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 2
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1106) })
    expect(preview.status).toBe('contradictory')
    expect(preview.reason).toMatch(/singular actor/i)
  })

  it('flags contradiction when a singular actor uses aggregate_value', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'moved_piece', subjectFilter: 'any', operator: 'attack',
      target: 'enemy', targetFilter: 'any',
      subjectComparisonMetric: 'aggregate_value', subjectComparator: 'greater_than',
      subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 4
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1107) })
    expect(preview.status).toBe('contradictory')
    expect(preview.reason).toMatch(/aggregate value cannot be combined with a singular actor/i)
  })

  it('uses forward generation for allied any mobility > prior_board_state via group-mobility-increase pattern', () => {
    const payload = {
      version: 2, kind: 'unary',
      subject: 'allied', subjectFilter: 'any',
      operator: 'mobility', comparator: 'greater_than',
      target: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1108) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('falls back to Strategy A direct-blocking when no king is available to put in check', () => {
    const payload = {
      version: 2, kind: 'unary',
      subject: 'enemy', subjectFilter: 'pawn',
      operator: 'mobility', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 0
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1109) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('uses forward generation for shield count < PBS pattern (slider-as-attacker variant exercised)', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'enemy', subjectFilter: 'any', operator: 'shield',
      target: 'enemy', targetFilter: 'king',
      subjectComparisonMetric: 'count', subjectComparator: 'less_than', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(1110) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('builds verified examples via hint resolver for lone enemy mobility = 0', () => {
    const payload = {
      version: 2, kind: 'unary',
      subject: 'enemy', subjectFilter: 'any',
      operator: 'mobility', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 0
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(2001) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('builds verified examples via hint resolver for the checkmate chain', () => {
    const payloads = [
      { version: 2, kind: 'relational', subject: 'allied', subjectFilter: 'any', operator: 'attack', target: 'enemy', targetFilter: 'king' },
      { version: 2, kind: 'unary', subject: 'enemy', subjectFilter: 'any', operator: 'mobility', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 }
    ]
    const preview = generateConditionExamples(payloads, { random: seededRandom(1001) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('produces N=1 (not just 0=0) examples for king subject of attack count = PBS', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'moved_piece', subjectFilter: 'king', operator: 'attack',
      target: 'enemy', targetFilter: 'any',
      subjectComparisonMetric: 'count', subjectComparator: 'equal_to', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(901) })
    expect(preview.status).toBe('ready')
    const hasNonZeroCount = preview.examples.some(ex => ex.result.pairs.length >= 1)
    expect(hasNonZeroCount).toBe(true)
  })

  it('uses forward generation for enemy attack moved_piece king count = prior_board_state', () => {
    const payload = {
      version: 2, kind: 'relational',
      subject: 'enemy', subjectFilter: 'any', operator: 'attack',
      target: 'moved_piece', targetFilter: 'king',
      subjectComparisonMetric: 'count', subjectComparator: 'equal_to', subjectComparisonSource: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(805) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('uses forward generation for moved_piece mobility > prior_board_state', () => {
    const payload = {
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'mobility', comparator: 'greater_than',
      target: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(804) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('uses forward generation for moved_piece value > prior_board_state via promotion', () => {
    const payload = {
      version: 2, kind: 'unary',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'value', comparator: 'greater_than',
      target: 'prior_board_state'
    }
    const preview = generateConditionExamples(payload, { random: seededRandom(803) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('builds verified examples via forward generation for the move-into-shield-break-with-defense chain', () => {
    const payloads = [
      { version: 2, kind: 'relational', subject: 'moved_piece', subjectFilter: 'any', operator: 'adjacent', target: 'enemy', targetFilter: 'king' },
      { version: 2, kind: 'relational', subject: 'enemy', subjectFilter: 'any', operator: 'shield', target: 'enemy', targetFilter: 'king', subjectComparisonMetric: 'count', subjectComparator: 'less_than', subjectComparisonSource: 'prior_board_state' },
      { version: 2, kind: 'relational', subject: 'enemy', subjectFilter: 'pawn', operator: 'attack', target: 'moved_piece', targetFilter: 'any', subjectComparisonMetric: 'count', subjectComparator: 'equal_to', subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 0 },
      { version: 2, kind: 'relational', subject: 'allied', subjectFilter: 'any', operator: 'defend', target: 'moved_piece', targetFilter: 'any' }
    ]

    const preview = generateConditionExamples(payloads, { random: seededRandom(701) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    expect(preview.examples.some(ex => ex.generationPath === 'forward')).toBe(true)
  })

  it('reuses an existing enemy king when a later plan in the chain also needs the enemy king', () => {
    const payloads = [
      {
        version: 2,
        kind: 'relational',
        subject: 'moved_piece',
        subjectFilter: 'any',
        operator: 'adjacent',
        target: 'enemy',
        targetFilter: 'king'
      },
      {
        version: 2,
        kind: 'relational',
        subject: 'moved_piece',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'king'
      }
    ]

    const preview = generateConditionExamples(payloads, { random: seededRandom(601) })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
  })

  it('builds verified examples for unary captured piece count equal to 1', () => {
    const payload = {
      version: 2,
      kind: 'unary',
      subject: 'captured_piece',
      subjectFilter: 'any',
      operator: 'count',
      comparator: 'equal_to',
      target: 'exact_number',
      targetTotal: 1
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(401) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('builds verified examples for unary captured piece count greater than 0', () => {
    const payload = {
      version: 2,
      kind: 'unary',
      subject: 'captured_piece',
      subjectFilter: 'any',
      operator: 'count',
      comparator: 'greater_than',
      target: 'exact_number',
      targetTotal: 0
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(402) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('produces examples with exactly one king per team', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(301), maxExamples: 50 })
    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)

    preview.examples.forEach(example => {
      let whiteKings = 0
      let blackKings = 0
      example.afterBoard.layOut.forEach(piece => {
        if (piece === Board.WHITE_KING) { whiteKings += 1 }
        if (piece === Board.BLACK_KING) { blackKings += 1 }
      })
      expect(whiteKings).toBe(1)
      expect(blackKings).toBe(1)
    })
  })

  it('highlights only the qualifying subset for count + aggregate combinatorial conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'pawn',
      subjectComparisonMetric: 'count',
      subjectComparator: 'equal_to',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 2,
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any',
      targetComparisonMetric: 'aggregate_value',
      targetComparator: 'greater_than',
      targetComparisonSource: 'exact_number',
      targetComparisonSourceTotal: 8
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(201), maxExamples: 50 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)

    preview.examples.forEach(example => {
      expect(example.highlights.after.subjectPositions.length).toBe(2)
    })
  })

  it('produces aggregate_value > 4 target examples that include two-minor configurations, not only majors', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any',
      targetComparisonMetric: 'aggregate_value',
      targetComparator: 'greater_than',
      targetComparisonSource: 'exact_number',
      targetComparisonSourceTotal: 4
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(103), maxExamples: 50 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)

    const minorSpecies = new Set([Board.NIGHT, Board.BISHOP])
    const hasTwoMinors = preview.examples.some(example => {
      const targetSpecies = example.result.targetPositions.map(pos => example.afterBoard.pieceTypeAt(pos))
      if (targetSpecies.length < 2) { return false }
      return targetSpecies.every(species => minorSpecies.has(species))
    })

    expect(hasTwoMinors).toBe(true)
  })

  it('supports exact-number value comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'equal_to',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 8
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(19) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(relationalValueForSide(example, 'subject')).toBe(8)
      expectLegalPriorTurnState(example)
    })
  })

  it('supports moved_piece value comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'moved_piece'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(20) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.priorBoard.pieceTypeAt(example.moveObject.startPosition)).not.toBe('K')
      expectLegalPriorTurnState(example)
    })
  })

  it('supports captured_piece value comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'captured_piece'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(21) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
    expect(preview.examples.some(example => example.moveObject.captureNotation)).toBe(true)
  })

  it('supports enemy_captured_piece value comparisons on relational conditions', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'adjacent',
      target: 'enemy',
      targetFilter: 'pawn',
      subjectComparisonMetric: 'aggregate_value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'enemy_captured_piece'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(22) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
    const capturedContextExample = preview.examples.find(example => example.priorBoard.recentMoveContext?.capturedPieceSpecies)
    expect(capturedContextExample).toBeTruthy()
    expect(capturedContextExample.priorBoard.recentMoveContext.capturedPieceSpecies).not.toBe('K')
  })

  it('supports zero-count comparisons while still resolving singular actors', () => {
    const payload = {
      kind: 'relational',
      subject: 'moved_piece',
      subjectFilter: 'queen',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'pawn',
      targetFilterMode: 'exclude',
      targetComparisonMetric: 'count',
      targetComparator: 'equal_to',
      targetComparisonSource: 'exact_number',
      targetComparisonSourceTotal: 0
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(14) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.moveObject.endPosition).toBe(example.result.subjectPositions[0] || example.moveObject.endPosition)
      expect(example.afterBoard.pieceTypeAt(example.moveObject.endPosition)).toBe('Q')
      expect(example.result.targetPositions.length).toBe(0)
    })
  })

  it('supports zero-count comparisons without forcing general actors onto the board', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'rook',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'pawn',
      targetComparisonMetric: 'count',
      targetComparator: 'equal_to',
      targetComparisonSource: 'exact_number',
      targetComparisonSourceTotal: 0
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(15) })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.result.pairs).toHaveLength(0)
      expect(example.result.targetPositions).toHaveLength(0)
    })
  })

  it('never places pawns on the first or eighth rank in generated examples', () => {
    const payload = {
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any'
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(16), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    preview.examples.forEach(example => {
      ;[example.priorBoard, example.afterBoard].forEach(board => {
        board.layOut.forEach((piece, position) => {
          if (piece[1] !== 'P') { return }
          const rank = Math.floor(position / 8)
          expect(rank).not.toBe(0)
          expect(rank).not.toBe(7)
        })
      })
    })
  })

  it('can generate castle examples through the dedicated move-kind path', () => {
    const payload = {
      kind: 'relational',
      subject: 'moved_piece',
      subjectFilter: 'king',
      operator: 'adjacent',
      target: 'allied',
      targetFilter: 'rook'
    }

    const preview = generateConditionExamples(payload, {
      random: seededRandom(17),
      moveKinds: ['castle']
    })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    const castleExamples = preview.examples.filter(ex => ex.moveKind === 'castle')
    expect(castleExamples.length).toBeGreaterThan(0)
    castleExamples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expect(example.moveObject.additionalActions).toBeTruthy()
      expect(example.moveObject.pieceNotation).toMatch(/^O-O/)
      expectLegalPriorTurnState(example)
    })
  })

  it('generates verified examples for a position count condition on rank', () => {
    const payload = {
      kind: 'position',
      subject: 'allied',
      subjectFilter: 'any',
      positionAxis: 'rank',
      positionComparator: 'greater_than_or_equal_to',
      positionTarget: 5,
      operator: 'count',
      comparator: 'greater_than_or_equal_to',
      targetTotal: 1
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(20), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('generates verified examples for a position count condition on file', () => {
    const payload = {
      kind: 'position',
      subject: 'enemy',
      subjectFilter: 'any',
      positionAxis: 'file',
      positionComparator: 'equal_to',
      positionTarget: 4,
      operator: 'count',
      comparator: 'greater_than_or_equal_to',
      targetTotal: 1
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(21), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('generates verified examples for a position count condition on moved_piece', () => {
    const payload = {
      kind: 'position',
      subject: 'moved_piece',
      subjectFilter: 'any',
      positionAxis: 'rank',
      positionComparator: 'greater_than_or_equal_to',
      positionTarget: 6,
      operator: 'count',
      comparator: 'equal_to',
      targetTotal: 1
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(22), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('generates verified examples for a position value condition', () => {
    const payload = {
      kind: 'position',
      subject: 'allied',
      subjectFilter: 'any',
      positionAxis: 'rank',
      positionComparator: 'greater_than_or_equal_to',
      positionTarget: 6,
      operator: 'value',
      comparator: 'greater_than_or_equal_to',
      targetTotal: 3
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(23), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('generates verified examples for an enemy_moved_piece position condition', () => {
    const payload = {
      kind: 'position',
      subject: 'enemy_moved_piece',
      subjectFilter: 'any',
      positionAxis: 'rank',
      positionComparator: 'greater_than_or_equal_to',
      positionTarget: 5,
      operator: 'count',
      comparator: 'equal_to',
      targetTotal: 1
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(24), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('generates verified examples for a position count condition on square (a1)', () => {
    const payload = {
      kind: 'position',
      subject: 'allied',
      subjectFilter: 'any',
      positionAxis: 'square',
      positionComparator: 'equal_to',
      positionTarget: 0,
      operator: 'count',
      comparator: 'greater_than_or_equal_to',
      targetTotal: 1
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(25), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })

  it('generates verified examples for an enemy position count condition on square (a1)', () => {
    const payload = {
      kind: 'position',
      subject: 'enemy',
      subjectFilter: 'any',
      positionAxis: 'square',
      positionComparator: 'equal_to',
      positionTarget: 0,
      operator: 'count',
      comparator: 'greater_than_or_equal_to',
      targetTotal: 1
    }

    const preview = generateConditionExamples(payload, { random: seededRandom(26), maxExamples: 6 })

    expect(preview.status).toBe('ready')
    expect(preview.examples.length).toBeGreaterThan(0)
    preview.examples.forEach(example => {
      expect(evaluateExample(payload, example)).toBe(true)
      expectLegalPriorTurnState(example)
    })
  })
})
