import { describe, expect, it } from 'vitest'

import {
  formatConditionPreviewChunk,
  formatConditionPreviewState
} from 'editorV2/utils/conditionPreviewFormatter'

describe('conditionPreviewFormatter', () => {
  describe('formatConditionPreviewState', () => {
    it('formats a plain relational preview', () => {
      expect(
        formatConditionPreviewState({
          kind: 'relational',
          left: {
            subject: 'allied',
            filter: 'queen',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          operator: 'attack',
          right: {
            subject: 'enemy',
            filter: 'any',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          unary: {
            comparator: 'greater_than',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 0
          },
          ui: {
            leftComparisonOpen: false,
            rightComparisonOpen: false
          }
        })
      ).toBe('Allied queen/s : attack : Enemies any')
    })

    it('keeps side comparisons attached to their own chunks', () => {
      expect(
        formatConditionPreviewState({
          kind: 'relational',
          left: {
            subject: 'allied',
            filter: 'pawn',
            filterMode: 'include',
            comparisonMetric: 'count',
            comparator: 'greater_than',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 2
          },
          operator: 'attack',
          right: {
            subject: 'enemy',
            filter: 'bishop',
            filterMode: 'include',
            comparisonMetric: 'value',
            comparator: 'less_than',
            comparisonValueSource: 'prior_board_state',
            comparisonValueNumber: 1
          },
          unary: {
            comparator: 'greater_than',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 0
          },
          ui: {
            leftComparisonOpen: true,
            rightComparisonOpen: true
          }
        })
      ).toBe('Allied pawn/s (count > 2) : attack : Enemy bishop/s (value < Prior Board State)')
    })

    it('formats unary previews in a three-block layout', () => {
      expect(
        formatConditionPreviewState({
          kind: 'unary',
          left: {
            subject: 'enemy_moved_piece',
            filter: 'pawn',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          operator: 'mobility',
          right: {
            subject: 'enemy',
            filter: 'any',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          unary: {
            comparator: 'less_than',
            comparisonValueSource: 'prior_board_state',
            comparisonValueNumber: 0
          },
          ui: {
            leftComparisonOpen: false,
            rightComparisonOpen: false
          }
        })
      ).toBe('Enemy Moved Piece pawn/s : mobility : < Prior Board State')
    })

    it('formats same_piece with the explicit operator phrase', () => {
      expect(
        formatConditionPreviewState({
          kind: 'relational',
          left: {
            subject: 'enemy_moved_piece',
            filter: 'any',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          operator: 'same_piece',
          right: {
            subject: 'captured_piece',
            filter: 'any',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          unary: {
            comparator: 'greater_than',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 0
          },
          ui: {
            leftComparisonOpen: false,
            rightComparisonOpen: false
          }
        })
      ).toBe('Enemy Moved Piece : is same-piece-as : Captured Piece')
    })

    it('keeps king singular and any pluralized as allies or enemies', () => {
      expect(
        formatConditionPreviewState({
          kind: 'relational',
          left: {
            subject: 'allied',
            filter: 'king',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          operator: 'defend',
          right: {
            subject: 'enemy',
            filter: 'any',
            filterMode: 'include',
            comparisonMetric: '',
            comparator: 'equal_to',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 1
          },
          unary: {
            comparator: 'greater_than',
            comparisonValueSource: 'exact_number',
            comparisonValueNumber: 0
          },
          ui: {
            leftComparisonOpen: false,
            rightComparisonOpen: false
          }
        })
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
