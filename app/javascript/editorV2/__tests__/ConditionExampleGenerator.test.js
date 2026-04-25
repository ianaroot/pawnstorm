import { describe, expect, it } from 'vitest'

import ConditionEvaluatorV2 from 'bot_execution/condition_evaluator_v2'
import generateConditionExamples from '../panels/condition_preview/ConditionExampleGenerator'

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

  it('marks value-based relational comparisons unsupported with a specific message', () => {
    const preview = generateConditionExamples({
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'attack',
      target: 'enemy',
      targetFilter: 'any',
      subjectComparisonMetric: 'value',
      subjectComparator: 'greater_than',
      subjectComparisonSource: 'exact_number',
      subjectComparisonSourceTotal: 3
    }, { random: seededRandom(11) })

    expect(preview.status).toBe('unsupported')
    expect(preview.reason).toBe('Value-based relational comparisons are not supported yet.')
  })

  it('marks prior-board relational comparisons unsupported with a specific message', () => {
    const preview = generateConditionExamples({
      kind: 'relational',
      subject: 'allied',
      subjectFilter: 'any',
      operator: 'defend',
      target: 'allied',
      targetFilter: 'any',
      targetComparisonMetric: 'count',
      targetComparator: 'greater_than',
      targetComparisonSource: 'prior_board_state'
    }, { random: seededRandom(12) })

    expect(preview.status).toBe('unsupported')
    expect(preview.reason).toBe('Prior-board relational comparisons are not supported yet.')
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
    expect(preview.examples.length).toBeLessThanOrEqual(6)
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
    expect(preview.examples.length).toBe(6)

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

    const subjectCounts = new Map()
    preview.examples.forEach(example => {
      const subjectKey = example.result.subjectPositions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
      subjectCounts.set(subjectKey, (subjectCounts.get(subjectKey) || 0) + 1)
    })

    expect(Math.max(...subjectCounts.values())).toBeLessThan(4)
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
})
