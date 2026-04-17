import { describe, expect, it } from 'vitest'

import { validateTemplates } from 'editorV2/templates/validateTemplates'

describe('validateTemplates', () => {
  it('allows relational templates without mode for non attack/defend operators', () => {
    expect(() =>
      validateTemplates([
        {
          id: 'shield-template',
          name: 'Shield Template',
          category: 'tactics',
          description: 'test',
          nodes: [
            {
              key: 'organizer',
              type: 'organizer',
              position: { x: 0, y: 0 },
              data: { title: 'Shield Template', notes: '' }
            },
            {
              key: 'condition',
              type: 'condition',
              position: { x: 0, y: 100 },
              data: {
                version: 2,
                kind: 'relational',
                subject: 'enemy',
                subjectFilter: 'queen',
                operator: 'shield',
                target: 'enemy',
                targetFilter: 'any'
              }
            },
            {
              key: 'action',
              type: 'action',
              position: { x: 0, y: 200 },
              data: { actionType: 'return', value: 1 }
            }
          ],
          connections: [
            { source: 'organizer', target: 'condition' },
            { source: 'condition', target: 'action' }
          ]
        }
      ])
    ).not.toThrow()
  })

  it('requires mode for relational attack and defend templates', () => {
    expect(() =>
      validateTemplates([
        {
          id: 'attack-template',
          name: 'Attack Template',
          category: 'tactics',
          description: 'test',
          nodes: [
            {
              key: 'organizer',
              type: 'organizer',
              position: { x: 0, y: 0 },
              data: { title: 'Attack Template', notes: '' }
            },
            {
              key: 'condition',
              type: 'condition',
              position: { x: 0, y: 100 },
              data: {
                version: 2,
                kind: 'relational',
                subject: 'enemy',
                subjectFilter: 'any',
                operator: 'attack',
                target: 'allied',
                targetFilter: 'any'
              }
            },
            {
              key: 'action',
              type: 'action',
              position: { x: 0, y: 200 },
              data: { actionType: 'return', value: 1 }
            }
          ],
          connections: [
            { source: 'organizer', target: 'condition' },
            { source: 'condition', target: 'action' }
          ]
        }
      ])
    ).toThrow(/must define valid V2 condition data/)
  })
})
