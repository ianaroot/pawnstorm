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
          subjectComparisonValue: 2,
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'bishop',
          targetComparisonMetric: 'value',
          targetComparator: 'less_than',
          targetComparisonValue: 'prior_board_state'
        }).text
      ).toBe('Allied pawn/s (count > 2) : attack : Enemy bishop/s (value < Prior Board State)')
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
          comparisonValue: 'prior_board_state'
        }).text
      ).toBe('Enemy Moved Piece pawn/s : mobility : < Prior Board State')
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
          comparisonValue: 'exact_number',
          comparisonValueNumber: 2,
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
          comparisonValue: 'captured_piece_value',
          comparisonValueNumber: 0
        })
      ).toBe('= Captured Piece Value')
    })
  })
})
