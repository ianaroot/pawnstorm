import { describe, expect, it } from 'vitest'

import { formatConditionSentence } from 'editorV2/utils/conditionPreviewFormatter'

// Render segments to a marked string: the emphasized segment wrapped in **…**.
// Lets each assertion read exactly like the locked phrasing spec.
function s(payload) {
  return formatConditionSentence(payload)
    .map(seg => (seg.emphasis ? `**${seg.text}**` : seg.text))
    .join('')
}

const rel = (extra) => ({ version: 2, kind: 'relational', ...extra })
const census = (extra) => ({ version: 2, kind: 'census', ...extra })
const pbs = 'prior_board_state'

describe('formatConditionSentence', () => {
  describe('relational — bare (implicit count > 0)', () => {
    it('allied any attack enemy king', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'any', operator: 'attack', target: 'enemy', targetFilter: 'king' })))
        .toBe('**at least one** of my pieces attacks enemy king')
    })
    it('enemy non-pawn attack moved_piece', () => {
      expect(s(rel({ subject: 'enemy', subjectFilter: 'pawn', subjectFilterMode: 'exclude', operator: 'attack', target: 'moved_piece', targetFilter: 'any' })))
        .toBe('**at least one** enemy non-pawn attacks my moved piece')
    })
    it('allied any defend moved_piece', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'any', operator: 'defend', target: 'moved_piece', targetFilter: 'any' })))
        .toBe('**at least one** of my pieces defends my moved piece')
    })
  })

  describe('relational — count vs exact_number', () => {
    const c = (n, cmp, extra) => rel({
      subjectComparisonMetric: 'count', subjectComparator: cmp,
      subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: n, ...extra
    })
    it('count = 0', () => {
      expect(s(c(0, 'equal_to', { subject: 'allied', subjectFilter: 'any', operator: 'attack', target: 'enemy', targetFilter: 'king' })))
        .toBe('**0** of my pieces attack enemy king')
    })
    it('enemy pawn count = 0', () => {
      expect(s(c(0, 'equal_to', { subject: 'enemy', subjectFilter: 'pawn', operator: 'attack', target: 'moved_piece', targetFilter: 'any' })))
        .toBe('**0** enemy pawns attack my moved piece')
    })
    it('count > 1', () => {
      expect(s(c(1, 'greater_than', { subject: 'allied', subjectFilter: 'any', operator: 'defend', target: 'moved_piece', targetFilter: 'any' })))
        .toBe('**more than 1** of my pieces defend my moved piece')
    })
    it('count = 2', () => {
      expect(s(c(2, 'equal_to', { subject: 'allied', subjectFilter: 'any', operator: 'attack', target: 'enemy', targetFilter: 'king' })))
        .toBe('**exactly 2** of my pieces attack enemy king')
    })
  })

  describe('relational — count vs prior_board_state (delta)', () => {
    const d = (cmp, extra) => rel({
      subjectComparisonMetric: 'count', subjectComparator: cmp, subjectComparisonSource: pbs, ...extra
    })
    it('> PBS', () => {
      expect(s(d('greater_than', { subject: 'allied', subjectFilter: 'knight', operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('**more** of my knights attack enemy queen than before')
    })
    it('< PBS', () => {
      expect(s(d('less_than', { subject: 'allied', subjectFilter: 'knight', operator: 'defend', target: 'allied', targetFilter: 'king' })))
        .toBe('**fewer** of my knights defend my king than before')
    })
    it('= PBS', () => {
      expect(s(d('equal_to', { subject: 'enemy', subjectFilter: 'pawn', subjectFilterMode: 'exclude', operator: 'attack', target: 'moved_piece', targetFilter: 'any' })))
        .toBe('the **same number** of enemy non-pawns attack my moved piece as before')
    })
    it('>= PBS', () => {
      expect(s(d('greater_than_or_equal_to', { subject: 'allied', subjectFilter: 'knight', operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('**no fewer** of my knights attack enemy queen than before')
    })
    it('<= PBS', () => {
      expect(s(d('less_than_or_equal_to', { subject: 'allied', subjectFilter: 'knight', operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('**no more** of my knights attack enemy queen than before')
    })
    it('adjacent > PBS', () => {
      expect(s(d('greater_than', { subject: 'allied', subjectFilter: 'any', operator: 'adjacent', target: 'enemy', targetFilter: 'any' })))
        .toBe('**more** of my pieces are adjacent to enemy pieces than before')
    })
  })

  describe('relational — value (target-passive); aggregate_value treated as value', () => {
    const v = (extra) => rel({
      subjectComparisonMetric: 'aggregate_value', subjectComparator: 'greater_than', subjectComparisonSource: pbs, ...extra
    })
    it('shield, exclude filter', () => {
      expect(s(v({ subject: 'enemy', subjectFilter: 'pawn', subjectFilterMode: 'exclude', operator: 'shield', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queen is shielded by **more** non-pawn pieces than before')
    })
    it('attack, species filter', () => {
      expect(s(v({ subject: 'allied', subjectFilter: 'knight', operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queen is attacked by **more** knights than before')
    })
    it('defend, species filter', () => {
      expect(s(v({ subject: 'allied', subjectFilter: 'bishop', operator: 'defend', target: 'allied', targetFilter: 'queen' })))
        .toBe('my queen is defended by **more** bishops than before')
    })
    it('shield, exclude filter, allied target', () => {
      expect(s(v({ subject: 'allied', subjectFilter: 'pawn', subjectFilterMode: 'exclude', operator: 'shield', target: 'allied', targetFilter: 'queen' })))
        .toBe('my queen is shielded by **more** non-pawn pieces than before')
    })
    it('attack, no filter (keeps "value")', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'any', subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: pbs, operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queen is attacked by **more** value than before')
    })
  })

  describe('identity', () => {
    it('enemy_moved_piece same_piece captured_piece', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'enemy_moved_piece', operator: 'same_piece', target: 'captured_piece' }))
        .toBe('I captured the piece the enemy just moved')
    })
  })

  describe('census — whole', () => {
    it('enemy mobility = 0', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'any', operator: 'mobility', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('enemy has **0** legal moves')
    })
    it('allied value < 5 (aggregate -> total value)', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'less_than', target: 'exact_number', targetTotal: 5 })))
        .toBe('my pieces have **less than 5** total value')
    })
    it('allied pawn count = 0', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'pawn', operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('I have **0** pawns')
    })
    it('allied rook count > 0', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0 })))
        .toBe('I have **at least one** rook')
    })
    it('allied pawn count = 3', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'pawn', operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 3 })))
        .toBe('I have **exactly 3** pawns')
    })
    it('captured_piece count > 0 (singular existence)', () => {
      expect(s(census({ subject: 'captured_piece', subjectFilter: 'any', operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0 })))
        .toBe('I **capture** a piece')
    })
    it('captured_piece count = 0', () => {
      expect(s(census({ subject: 'captured_piece', subjectFilter: 'any', operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('this move **captures nothing**')
    })
    it('moved_piece knight count = 0', () => {
      expect(s(census({ subject: 'moved_piece', subjectFilter: 'knight', operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('my moved piece is **not** a knight')
    })
    it('moved_piece knight mobility > PBS', () => {
      expect(s(census({ subject: 'moved_piece', subjectFilter: 'knight', operator: 'mobility', comparator: 'greater_than', target: pbs })))
        .toBe('my moved knight has **more** legal moves than before')
    })
    it('captured_piece value > enemy_captured_piece', () => {
      expect(s(census({ subject: 'captured_piece', subjectFilter: 'any', operator: 'value', comparator: 'greater_than', target: 'enemy_captured_piece' })))
        .toBe('I captured **more** value than the enemy just did')
    })
    it('allied value > PBS (promotion idiom)', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'greater_than', target: pbs })))
        .toBe('I **promoted** a pawn')
    })
    it('allied value < PBS (capture idiom)', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'less_than', target: pbs })))
        .toBe('I **captured** a piece')
    })
  })

  describe('census — region', () => {
    it('square equality (count > 0): bold the square', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'bishop', positionAxis: 'square', positionComparator: 'equal_to', positionTarget: 7, operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0 })))
        .toBe('I have at least one bishop on **h1**')
    })
    it('rank equality + count > PBS: bold the delta', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5, operator: 'count', comparator: 'greater_than', target: pbs })))
        .toBe('**more** of my rooks are on rank 5 than before')
    })
    it('file equality + count < PBS', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'any', positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 4, operator: 'count', comparator: 'less_than', target: pbs })))
        .toBe('**fewer** enemy pieces are on the d-file than before')
    })
    it('rank inequality (>=): bold the bounds', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'greater_than_or_equal_to', positionTarget: 7, operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0 })))
        .toBe('I have at least one rook between ranks **7 & 8**')
    })
    it('rank equality (non-delta): bold the rank locator', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5, operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0 })))
        .toBe('I have at least one rook on **rank 5**')
    })
    it('file equality (non-delta): bold the file locator', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 3, operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0 })))
        .toBe('I have at least one rook on the **c-file**')
    })
  })

  describe('review fixes (A–D, agreement)', () => {
    it('allied-collection mobility uses "have" not "has"', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'mobility', comparator: 'greater_than', target: pbs })))
        .toBe('my pieces have **more** legal moves than before')
    })
    it('value = capture family uses "as"', () => {
      expect(s(census({ subject: 'captured_piece', subjectFilter: 'any', operator: 'value', comparator: 'equal_to', target: 'enemy_captured_piece' })))
        .toBe('I captured **equal** value as the enemy just did')
    })
    it('value = PBS, no filter', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'equal_to', target: pbs })))
        .toBe('my team value is **not changed**')
    })
    it('value = PBS, exclude-king filter', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'exclude', operator: 'value', comparator: 'equal_to', target: pbs })))
        .toBe('the value of my non-king pieces is **not changed**')
    })
    it('exclude major → "non-major pieces" (no doubled noun)', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'major', subjectFilterMode: 'exclude', operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('enemy has **0** non-major pieces')
    })
    it('exclude major, relational value target-passive', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'major', subjectFilterMode: 'exclude', subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: pbs, operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queen is attacked by **more** non-major pieces than before')
    })
  })

  describe('rare value/PBS guards (#3, #4)', () => {
    it('relational value = PBS, exclude filter', () => {
      expect(s(rel({ subject: 'enemy', subjectFilter: 'pawn', subjectFilterMode: 'exclude', subjectComparisonMetric: 'value', subjectComparator: 'equal_to', subjectComparisonSource: pbs, operator: 'shield', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queen is shielded by the **same** non-pawn pieces as before')
    })
    it('relational value = PBS, no filter', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'any', subjectComparisonMetric: 'value', subjectComparator: 'equal_to', subjectComparisonSource: pbs, operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queen is attacked by the **same** value as before')
    })
    it('census value >= PBS', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'greater_than_or_equal_to', target: pbs })))
        .toBe('my team value is **not lower** than before')
    })
    it('census value <= PBS', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'less_than_or_equal_to', target: pbs })))
        .toBe('my team value is **not higher** than before')
    })
    it('census value >= PBS, exclude-king filter', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'exclude', operator: 'value', comparator: 'greater_than_or_equal_to', target: pbs })))
        .toBe('the value of my non-king pieces is **not lower** than before')
    })
  })
})
