import { afterEach, describe, expect, it } from 'vitest'

import { formatConditionSentence, getConditionPreviewMode, setConditionPreviewMode } from 'editorV2/utils/conditionPreviewFormatter'

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
  describe('preview mode toggle', () => {
    afterEach(() => setConditionPreviewMode('sentence'))
    const sample = census({ subject: 'allied', subjectFilter: 'rook', operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0 })
    it('defaults to sentence prose', () => {
      expect(getConditionPreviewMode()).toBe('sentence')
      expect(s(sample)).toBe('I have **at least one** rook')
    })
    it('chunks mode falls back to terse chunk text', () => {
      setConditionPreviewMode('chunks')
      expect(s(sample)).toBe('Allied rook/s : count : > 0')
    })
    it('flips back to prose', () => {
      setConditionPreviewMode('chunks')
      setConditionPreviewMode('sentence')
      expect(s(sample)).toBe('I have **at least one** rook')
    })
  })

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
        .toBe('enemy queens are shielded by enemy non-pawns **more valuable** than before')
    })
    it('attack, species filter', () => {
      expect(s(v({ subject: 'allied', subjectFilter: 'knight', operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queens are attacked by my knights **more valuable** than before')
    })
    it('defend, species filter', () => {
      expect(s(v({ subject: 'allied', subjectFilter: 'bishop', operator: 'defend', target: 'allied', targetFilter: 'queen' })))
        .toBe('my queens are defended by my bishops **more valuable** than before')
    })
    it('shield, exclude filter, allied target', () => {
      expect(s(v({ subject: 'allied', subjectFilter: 'pawn', subjectFilterMode: 'exclude', operator: 'shield', target: 'allied', targetFilter: 'queen' })))
        .toBe('my queens are shielded by my non-pawns **more valuable** than before')
    })
    it('attack, no filter', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'any', subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: pbs, operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queens are attacked by my pieces **more valuable** than before')
    })
  })

  describe('identity', () => {
    it('enemy_moved_piece same_piece captured_piece', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'enemy_moved_piece', target: 'captured_piece' }))
        .toBe('I captured the piece the enemy just moved')
    })
    it('captured_piece same_piece enemy_moved_piece (symmetric order)', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'captured_piece', target: 'enemy_moved_piece' }))
        .toBe('I captured the piece the enemy just moved')
    })
    it('moved_piece same_piece captured_piece (en passant from my side)', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'moved_piece', target: 'captured_piece' }))
        .toBe('I moved and captured the same piece')
    })
    it('moved_piece same_piece enemy_captured_piece', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'moved_piece', target: 'enemy_captured_piece' }))
        .toBe('the enemy captured the piece I just moved')
    })
    it('enemy_moved_piece same_piece enemy_captured_piece (en passant from enemy side)', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'enemy_moved_piece', target: 'enemy_captured_piece' }))
        .toBe('the enemy moved and captured the same piece')
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
    it('captured_piece pawn count = 1 (singular actor matches filter)', () => {
      expect(s(census({ subject: 'captured_piece', subjectFilter: 'pawn', operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 1 })))
        .toBe('my capture **is** a pawn')
    })
    it('moved_piece knight count >= 1', () => {
      expect(s(census({ subject: 'moved_piece', subjectFilter: 'knight', operator: 'count', comparator: 'greater_than_or_equal_to', target: 'exact_number', targetTotal: 1 })))
        .toBe('my moved piece **is** a knight')
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

  describe('census mobility — filter must not be dropped', () => {
    it('allied major mobility > PBS', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'major', operator: 'mobility', comparator: 'greater_than', target: pbs })))
        .toBe('my major pieces have **more** legal moves than before')
    })
    it('allied knight mobility = 0', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'knight', operator: 'mobility', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('my knights have **0** legal moves')
    })
    it('enemy knight mobility = 0', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'knight', operator: 'mobility', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('enemy knights have **0** legal moves')
    })
    it('enemy pawn-exclude mobility > PBS', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'pawn', subjectFilterMode: 'exclude', operator: 'mobility', comparator: 'greater_than', target: pbs })))
        .toBe('enemy non-pawns have **more** legal moves than before')
    })
  })

  describe('census value — idioms gated; honest fallthrough for enemy / filtered', () => {
    it('enemy value > PBS (no promotion idiom)', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'any', operator: 'value', comparator: 'greater_than', target: pbs })))
        .toBe("the enemy's team is **more valuable** than before")
    })
    it('enemy value < PBS (no capture idiom)', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'any', operator: 'value', comparator: 'less_than', target: pbs })))
        .toBe("the enemy's team is **less valuable** than before")
    })
    it('allied knight value > PBS (filter preserved, no promotion idiom)', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'knight', operator: 'value', comparator: 'greater_than', target: pbs })))
        .toBe('my knights are **more valuable** than before')
    })
    it('allied knight value < PBS (filter preserved, no capture idiom)', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'knight', operator: 'value', comparator: 'less_than', target: pbs })))
        .toBe('my knights are **less valuable** than before')
    })
    it('allied non-king value > PBS (exclude filter preserved)', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'exclude', operator: 'value', comparator: 'greater_than', target: pbs })))
        .toBe('my non-kings are **more valuable** than before')
    })
    it('allied any value > moved_piece (collection vs singular target)', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'greater_than', target: 'moved_piece' })))
        .toBe('my team is **more valuable** than my moved piece')
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
    it('value + region + PBS: "value of X on rank Y is higher than before"', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5, operator: 'value', comparator: 'greater_than', target: pbs })))
        .toBe('my rooks on rank 5 are **more valuable** than before')
    })
    it('value + region + numeric: "X on rank Y have N total value"', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5, operator: 'value', comparator: 'equal_to', target: 'exact_number', targetTotal: 10 })))
        .toBe('my rooks on rank 5 have **exactly 10** total value')
    })
    it('mobility + region + PBS: "X on rank Y have more legal moves than before"', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5, operator: 'mobility', comparator: 'greater_than', target: pbs })))
        .toBe('my rooks on rank 5 have **more** legal moves than before')
    })
    it('mobility + region + numeric: "X on rank Y have N legal moves"', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5, operator: 'mobility', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('my rooks on rank 5 have **0** legal moves')
    })
  })

  describe('census region vs singular_actor target', () => {
    const reg = (op, cmp, extra) => census({
      subject: 'allied', subjectFilter: 'rook', positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5,
      operator: op, comparator: cmp, target: 'moved_piece', ...extra
    })
    it('value > moved_piece (B)', () => {
      expect(s(reg('value', 'greater_than')))
        .toBe('I have at least one rook on rank 5 **more valuable** than my moved piece')
    })
    it('value < moved_piece', () => {
      expect(s(reg('value', 'less_than')))
        .toBe('I have at least one rook on rank 5 **less valuable** than my moved piece')
    })
    it('value >= moved_piece', () => {
      expect(s(reg('value', 'greater_than_or_equal_to')))
        .toBe('I have at least one rook on rank 5 **no less valuable** than my moved piece')
    })
    it('value <= moved_piece', () => {
      expect(s(reg('value', 'less_than_or_equal_to')))
        .toBe('I have at least one rook on rank 5 **no more valuable** than my moved piece')
    })
    it('value = moved_piece', () => {
      expect(s(reg('value', 'equal_to')))
        .toBe('I have at least one rook on rank 5 **equally valuable** to my moved piece')
    })
    it('count > moved_piece', () => {
      expect(s(reg('count', 'greater_than')))
        .toBe('I have **more** rooks on rank 5 than my moved piece')
    })
    it('count = moved_piece', () => {
      expect(s(reg('count', 'equal_to')))
        .toBe('I have the **same number** of rooks on rank 5 as my moved piece')
    })
    it('mobility > moved_piece', () => {
      expect(s(reg('mobility', 'greater_than')))
        .toBe('my rooks on rank 5 have **more** legal moves than my moved piece')
    })
    it('mobility = moved_piece', () => {
      expect(s(reg('mobility', 'equal_to')))
        .toBe('my rooks on rank 5 have the **same number** of legal moves as my moved piece')
    })
  })

  describe('safeguard: unrenderable comparison surfaces a warning', () => {
    it('SINGULAR_ACTOR target with count comparison', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any', operator: 'attack',
        target: 'moved_piece', targetFilter: 'any',
        targetComparisonMetric: 'count', targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 0
      })))
        .toBe("my pieces attack my moved piece ⚠ couldn't render target's count comparison")
    })
  })

  describe('identity — degenerate same_piece pairs covered', () => {
    it('captured_piece same_piece enemy_captured_piece', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'captured_piece', target: 'enemy_captured_piece' }))
        .toBe("my capture is the same piece as enemy's just-captured piece")
    })
    it('moved_piece same_piece enemy_moved_piece', () => {
      expect(s({ version: 2, kind: 'identity', subject: 'moved_piece', target: 'enemy_moved_piece' }))
        .toBe("my moved piece is the same piece as enemy's just-moved piece")
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
        .toBe('my team is **equally valuable** as before')
    })
    it('value = PBS, exclude-king filter', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'exclude', operator: 'value', comparator: 'equal_to', target: pbs })))
        .toBe('my non-kings are **equally valuable** as before')
    })
    it('exclude major → "non-major pieces" (no doubled noun)', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'major', subjectFilterMode: 'exclude', operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 0 })))
        .toBe('enemy has **0** non-major pieces')
    })
    it('exclude major, relational value target-passive', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'major', subjectFilterMode: 'exclude', subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: pbs, operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queens are attacked by my non-major pieces **more valuable** than before')
    })
  })

  describe('rare value/PBS guards (#3, #4)', () => {
    it('relational value = PBS, exclude filter', () => {
      expect(s(rel({ subject: 'enemy', subjectFilter: 'pawn', subjectFilterMode: 'exclude', subjectComparisonMetric: 'value', subjectComparator: 'equal_to', subjectComparisonSource: pbs, operator: 'shield', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queens are shielded by enemy non-pawns **equally valuable** as before')
    })
    it('relational value = PBS, no filter', () => {
      expect(s(rel({ subject: 'allied', subjectFilter: 'any', subjectComparisonMetric: 'value', subjectComparator: 'equal_to', subjectComparisonSource: pbs, operator: 'attack', target: 'enemy', targetFilter: 'queen' })))
        .toBe('enemy queens are attacked by my pieces **equally valuable** as before')
    })
    it('census value >= PBS', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'greater_than_or_equal_to', target: pbs })))
        .toBe('my team is **no less valuable** than before')
    })
    it('census value <= PBS', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'any', operator: 'value', comparator: 'less_than_or_equal_to', target: pbs })))
        .toBe('my team is **no more valuable** than before')
    })
    it('census value >= PBS, exclude-king filter', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'exclude', operator: 'value', comparator: 'greater_than_or_equal_to', target: pbs })))
        .toBe('my non-kings are **no less valuable** than before')
    })
  })

  describe('relational — moved_piece as subject (singular, active voice)', () => {
    it('moved_piece any attack enemy king', () => {
      expect(s(rel({ subject: 'moved_piece', subjectFilter: 'any', operator: 'attack', target: 'enemy', targetFilter: 'king' })))
        .toBe('my moved piece attacks enemy king')
    })
    it('moved_piece queen attack enemy king', () => {
      expect(s(rel({ subject: 'moved_piece', subjectFilter: 'queen', subjectFilterMode: 'include', operator: 'attack', target: 'enemy', targetFilter: 'king' })))
        .toBe('my moved queen attacks enemy king')
    })
    it('moved_piece king adjacent allied rook', () => {
      expect(s(rel({ subject: 'moved_piece', subjectFilter: 'king', subjectFilterMode: 'include', operator: 'adjacent', target: 'allied', targetFilter: 'rook', targetFilterMode: 'include' })))
        .toBe('my moved king is adjacent to my rook')
    })
    it('moved_piece any adjacent allied knight', () => {
      expect(s(rel({ subject: 'moved_piece', subjectFilter: 'any', operator: 'adjacent', target: 'allied', targetFilter: 'knight', targetFilterMode: 'include' })))
        .toBe('my moved piece is adjacent to my knight')
    })
    it('moved_piece pawn defend allied pawn (target count > PBS)', () => {
      expect(s(rel({
        subject: 'moved_piece', subjectFilter: 'pawn', subjectFilterMode: 'include',
        operator: 'defend',
        target: 'allied', targetFilter: 'pawn', targetFilterMode: 'include',
        targetComparisonMetric: 'count', targetComparator: 'greater_than', targetComparisonSource: pbs
      })))
        .toBe('my moved pawn defends **more** of my pawns than before')
    })
    it('moved_piece any defend allied major (target count > PBS)', () => {
      expect(s(rel({
        subject: 'moved_piece', subjectFilter: 'any',
        operator: 'defend',
        target: 'allied', targetFilter: 'major', targetFilterMode: 'include',
        targetComparisonMetric: 'count', targetComparator: 'greater_than', targetComparisonSource: pbs
      })))
        .toBe('my moved piece defends **more** of my major pieces than before')
    })
    it('target count = PBS: "X attack the same number of Y as before"', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        operator: 'attack',
        target: 'enemy', targetFilter: 'queen',
        targetComparisonMetric: 'count', targetComparator: 'equal_to', targetComparisonSource: pbs
      })))
        .toBe('my pieces attack the **same number** of enemy queens as before')
    })
    it('moved_piece + target count = PBS: "my moved piece attacks the same number of Y as before"', () => {
      expect(s(rel({
        subject: 'moved_piece', subjectFilter: 'any',
        operator: 'attack',
        target: 'enemy', targetFilter: 'queen',
        targetComparisonMetric: 'count', targetComparator: 'equal_to', targetComparisonSource: pbs
      })))
        .toBe('my moved piece attacks the **same number** of enemy queens as before')
    })
    it('subject count numeric + target count > PBS — target delta tail rendered', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'count', subjectComparator: 'greater_than', subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 5,
        operator: 'attack',
        target: 'enemy', targetFilter: 'queen',
        targetComparisonMetric: 'count', targetComparator: 'greater_than', targetComparisonSource: pbs
      })))
        .toBe('**more than 5** of my pieces attack **more** enemy queens than before')
    })
  })

  describe('census value vs exact_number — filter awareness', () => {
    it('allied non-king value = 34', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'exclude', operator: 'value', comparator: 'equal_to', target: 'exact_number', targetTotal: 34 })))
        .toBe('my non-kings have **exactly 34** total value')
    })
    it('enemy major value > 20', () => {
      expect(s(census({ subject: 'enemy', subjectFilter: 'major', subjectFilterMode: 'include', operator: 'value', comparator: 'greater_than', target: 'exact_number', targetTotal: 20 })))
        .toBe('enemy major pieces have **more than 20** total value')
    })
    it('allied knight value < 10', () => {
      expect(s(census({ subject: 'allied', subjectFilter: 'knight', operator: 'value', comparator: 'less_than', target: 'exact_number', targetTotal: 10 })))
        .toBe('my knights have **less than 10** total value')
    })
  })

  describe('relational value passive — target plurality drives is/are', () => {
    it('plural target (exclude filter): "are shielded"', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: pbs,
        operator: 'shield', target: 'enemy', targetFilter: 'pawn', targetFilterMode: 'exclude'
      })))
        .toBe('enemy non-pawns are shielded by my pieces **more valuable** than before')
    })
    it('plural target (any filter): "are attacked"', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'knight',
        subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: pbs,
        operator: 'attack', target: 'enemy', targetFilter: 'any'
      })))
        .toBe('enemy pieces are attacked by my knights **more valuable** than before')
    })
    it('allied major subject is plural (target count > PBS)', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'major',
        operator: 'attack', target: 'enemy', targetFilter: 'queen',
        targetComparisonMetric: 'count', targetComparator: 'greater_than', targetComparisonSource: pbs
      })))
        .toBe('my major pieces attack **more** enemy queens than before')
    })
    it('enemy minor subject is plural, passive value', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: pbs,
        operator: 'attack', target: 'enemy', targetFilter: 'minor'
      })))
        .toBe('enemy minor pieces are attacked by my pieces **more valuable** than before')
    })
    it('plural target with same (= PBS): "are shielded by the same"', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'equal_to', subjectComparisonSource: pbs,
        operator: 'shield', target: 'enemy', targetFilter: 'pawn', targetFilterMode: 'exclude'
      })))
        .toBe('enemy non-pawns are shielded by my pieces **equally valuable** as before')
    })
  })

  describe('relational value vs singular_actor source (template V)', () => {
    it('value > moved_piece', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: 'moved_piece',
        operator: 'attack', target: 'enemy', targetFilter: 'queen'
      })))
        .toBe('my pieces attacking enemy queens are **more valuable** than my moved piece')
    })
    it('value < captured_piece (also fixes captured_piece+filter in actorNoun)', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'knight',
        subjectComparisonMetric: 'value', subjectComparator: 'less_than', subjectComparisonSource: 'captured_piece',
        operator: 'attack', target: 'enemy', targetFilter: 'queen'
      })))
        .toBe('my knights attacking enemy queens are **less valuable** than my capture')
    })
    it('value = enemy_moved_piece', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'equal_to', subjectComparisonSource: 'enemy_moved_piece',
        operator: 'attack', target: 'enemy', targetFilter: 'queen'
      })))
        .toBe("my pieces attacking enemy queens are **equally valuable** to enemy's just-moved piece")
    })
    it('value < 5 (numeric)', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'knight',
        subjectComparisonMetric: 'value', subjectComparator: 'less_than', subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 5,
        operator: 'attack', target: 'enemy', targetFilter: 'queen'
      })))
        .toBe('my knights attacking enemy queens are **less valuable** than 5')
    })
    it('value = 5 (numeric)', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'equal_to', subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 5,
        operator: 'attack', target: 'enemy', targetFilter: 'queen'
      })))
        .toBe('my pieces attacking enemy queens are **equally valuable** to 5')
    })
  })

  describe('relational target-side value (template V-flipped)', () => {
    it('target individual_value > 5', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'knight',
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        targetComparisonMetric: 'individual_value', targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 5
      })))
        .toBe('enemy pieces attacked by my knights are **more valuable** than 5')
    })
    it('target individual_value > PBS', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'knight',
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        targetComparisonMetric: 'individual_value', targetComparator: 'greater_than',
        targetComparisonSource: pbs
      })))
        .toBe('enemy pieces attacked by my knights are **more valuable** than before')
    })
    it('target individual_value > moved_piece', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'knight',
        operator: 'defend', target: 'allied', targetFilter: 'any',
        targetComparisonMetric: 'individual_value', targetComparator: 'greater_than',
        targetComparisonSource: 'moved_piece'
      })))
        .toBe('my pieces defended by my knights are **more valuable** than my moved piece')
    })
    it('target value = PBS', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        operator: 'shield', target: 'enemy', targetFilter: 'queen',
        targetComparisonMetric: 'value', targetComparator: 'equal_to', targetComparisonSource: pbs
      })))
        .toBe('enemy queens shielded by my pieces are **equally valuable** as before')
    })
    it('target individual_value < 3', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        targetComparisonMetric: 'individual_value', targetComparator: 'less_than',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 3
      })))
        .toBe('enemy pieces attacked by my pieces are **less valuable** than 3')
    })
  })

  describe('relational mixed/both-sides metric — integrated single sentence (neither PBS)', () => {
    it('A1: subject value > 5 + target count > 3', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 5,
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        targetComparisonMetric: 'count', targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 3
      })))
        .toBe('my pieces, **more valuable** than 5, are attacking **more than 3** enemy pieces')
    })
    it('A3: subject count > 3 + target individual_value > 5', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'count', subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 3,
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        targetComparisonMetric: 'individual_value', targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 5
      })))
        .toBe('**more than 3** of my pieces attack enemy pieces **more valuable** than 5')
    })
    it('A4: subject value > 5 + target individual_value > 3 (both value)', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 5,
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        targetComparisonMetric: 'individual_value', targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 3
      })))
        .toBe('my pieces, **more valuable** than 5, are attacking enemy pieces **more valuable** than 3')
    })
    it('A5: subject value > moved_piece + target count > 3', () => {
      expect(s(rel({
        subject: 'allied', subjectFilter: 'any',
        subjectComparisonMetric: 'value', subjectComparator: 'greater_than', subjectComparisonSource: 'moved_piece',
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        targetComparisonMetric: 'count', targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 3
      })))
        .toBe('my pieces, **more valuable** than my moved piece, are attacking **more than 3** enemy pieces')
    })
  })

  describe('census value with singular_actor subject (filter preserved)', () => {
    it('moved_piece knight value = 5 (exact_number)', () => {
      expect(s(census({ subject: 'moved_piece', subjectFilter: 'knight', operator: 'value', comparator: 'equal_to', target: 'exact_number', targetTotal: 5 })))
        .toBe('my moved knight has value **exactly 5**')
    })
    it('moved_piece pawn value < 3 (exact_number)', () => {
      expect(s(census({ subject: 'moved_piece', subjectFilter: 'pawn', operator: 'value', comparator: 'less_than', target: 'exact_number', targetTotal: 3 })))
        .toBe('my moved pawn has value **less than 3**')
    })
    it('captured_piece knight value = 3 (exact_number, captured_piece + filter)', () => {
      expect(s(census({ subject: 'captured_piece', subjectFilter: 'knight', operator: 'value', comparator: 'equal_to', target: 'exact_number', targetTotal: 3 })))
        .toBe('my captured knight has value **exactly 3**')
    })
    it('moved_piece knight value = PBS', () => {
      expect(s(census({ subject: 'moved_piece', subjectFilter: 'knight', operator: 'value', comparator: 'equal_to', target: pbs })))
        .toBe('my moved knight is **equally valuable** as before')
    })
    it('moved_piece knight value > PBS', () => {
      expect(s(census({ subject: 'moved_piece', subjectFilter: 'knight', operator: 'value', comparator: 'greater_than', target: pbs })))
        .toBe('my moved knight is **more valuable** than before')
    })
  })
})
