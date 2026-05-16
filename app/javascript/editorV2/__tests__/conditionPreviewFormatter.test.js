import { describe, expect, it } from 'vitest'

import {
  formatConditionPreview,
  formatConditionPreviewChunk,
} from 'editorV2/utils/conditionPreviewFormatter'

describe('conditionPreviewFormatter', () => {
  describe('formatConditionPreview', () => {
    it('formats a plain relational preview', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'queen',
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'any'
        }).text
      ).toBe('Allied queen/s : attack : Enemies any')
    })

    it('keeps side comparisons attached to their own chunks', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'pawn',
          subjectComparisonMetric: 'count',
          subjectComparator: 'greater_than',
          subjectComparisonSource: 'exact_number',
          subjectComparisonSourceTotal: 2,
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'bishop',
          targetComparisonMetric: 'value',
          targetComparator: 'less_than',
          targetComparisonSource: 'prior_board_state'
        }).text
      ).toBe('Allied pawn/s (count > 2) : attack : Enemy bishop/s (value < Prior Board State)')
    })

    it('labels the individual_value relational metric as "value"', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'pawn',
          subjectComparisonMetric: 'individual_value',
          subjectComparator: 'greater_than',
          subjectComparisonSource: 'exact_number',
          subjectComparisonSourceTotal: 3,
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'bishop'
        }).text
      ).toBe('Allied pawn/s (value > 3) : attack : Enemy bishop/s')
    })

    it('formats unary previews in a three-block layout', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          operator: 'mobility',
          comparator: 'less_than',
          target: 'prior_board_state'
        }).text
      ).toBe('Enemy Moved Piece pawn/s : mobility : < Prior Board State')
    })

    it('formats unary actor targets with filters', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'unary',
          subject: 'allied',
          subjectFilter: 'any',
          operator: 'value',
          comparator: 'greater_than',
          target: 'enemy',
          targetFilter: 'rook'
        }).text
      ).toBe('Allies any : value : > Enemy rook/s')
    })

    it('formats same_piece with the explicit operator phrase', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'relational',
          subject: 'enemy_moved_piece',
          subjectFilter: 'any',
          operator: 'same_piece',
          target: 'captured_piece',
          targetFilter: 'any'
        }).text
      ).toBe('Enemy Moved Piece : is same-piece-as : Captured Piece')
    })

    it('keeps king singular and any pluralized as allies or enemies', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'king',
          operator: 'defend',
          target: 'enemy',
          targetFilter: 'any'
        }).text
      ).toBe('Allied king : defend : Enemies any')
    })

    it('formats major and minor filters', () => {
      expect(
        formatConditionPreview({
          version: 2,
          kind: 'relational',
          subject: 'enemy',
          subjectFilter: 'major',
          operator: 'attack',
          target: 'allied',
          targetFilter: 'minor'
        }).text
      ).toBe('Enemy major piece/s : attack : Allied minor piece/s')
    })
  })

  describe('formatConditionPreviewChunk', () => {
    it('formats a side chunk', () => {
      expect(
        formatConditionPreviewChunk({
          role: 'side',
          subject: 'allied',
          filter: 'queen',
          filterMode: 'include',
          comparisonMetric: 'count',
          comparator: 'greater_than',
          comparisonSource: 'exact_number',
          comparisonSourceTotal: 2,
          comparisonOpen: true
        })
      ).toBe('Allied queen/s (count > 2)')
    })

    it('formats an operator chunk', () => {
      expect(formatConditionPreviewChunk({ role: 'operator', operator: 'same_piece' })).toBe('is same-piece-as')
    })

    it('formats a comparison chunk', () => {
      expect(
        formatConditionPreviewChunk({
          role: 'comparison',
          comparator: 'equal_to',
          target: 'captured_piece',
          targetFilter: 'any'
        })
      ).toBe('= Captured Piece')
    })

    it('formats excluded major and minor filters', () => {
      expect(
        formatConditionPreviewChunk({
          role: 'side',
          subject: 'enemy',
          filter: 'major',
          filterMode: 'exclude'
        })
      ).toBe('Enemy non-major piece/s')

      expect(
        formatConditionPreviewChunk({
          role: 'side',
          subject: 'allied',
          filter: 'minor',
          filterMode: 'exclude'
        })
      ).toBe('Allied non-minor piece/s')
    })
  })
})
