import { afterEach, describe, expect, it } from 'vitest'

import { renderTemplatePreview } from 'editorV2/templates/TemplatePicker'

describe('TemplatePicker template preview', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders template nodes without text labels in the preview', () => {
    document.body.innerHTML = '<div data-template-picker-preview></div>'

    const html = renderTemplatePreview({
      id: 'sample-template',
      name: 'Sample Template',
      category: 'opening',
      description: 'Sample description',
      nodes: [
        {
          key: 'organizer',
          type: 'organizer',
          position: { x: 0, y: 0 },
          data: { title: 'Sample Template', notes: '' }
        },
        {
          key: 'condition',
          type: 'condition',
          position: { x: 0, y: 160 },
          data: {
            version: 2,
            kind: 'unary',
            subject: 'allied',
            subjectFilter: 'any',
            operator: 'count',
            comparator: 'greater_than',
            target: 'exact_number',
            targetTotal: 0
          }
        },
        {
          key: 'score',
          type: 'score',
          position: { x: 0, y: 320 },
          data: { actionType: 'return', value: 1 }
        }
      ],
      connections: [
        { source: 'organizer', target: 'condition' },
        { source: 'condition', target: 'score' }
      ]
    })

    expect(html).not.toContain('template-picker-preview__organizer-title')
    expect(html).not.toContain('template-picker-preview__condition-line')
    expect(html).not.toContain('template-picker-preview__action-type')
    expect(html).not.toContain('template-picker-preview__action-value')
  })
})
