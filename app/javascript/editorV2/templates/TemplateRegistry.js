import { TEMPLATE_CATEGORIES } from './TemplateCategories.js'
import { validateTemplates } from './validateTemplates.js'

const RAW_TEMPLATES = [
  {
    id: 'winning-capture',
    name: 'Winning Capture',
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: 'Reward captures where the captured piece is worth at least the piece that moved.',
    nodes: [
      {
        key: 'organizer',
        type: 'organizer',
        position: { x: 0, y: 0 },
        data: { title: 'Winning Capture', notes: '' }
      },
      {
        key: 'condition',
        type: 'condition',
        position: { x: 12, y: 160 },
        data: {
          subject: 'captured_piece',
          subjectSpecifier: 'any',
          relation: 'value',
          relationSpecifier: 'any',
          comparison: 'greater_than',
          comparisonValue: 'moved_piece_value'
        }
      },
      {
        key: 'action',
        type: 'action',
        position: { x: 8, y: 320 },
        data: {
          actionType: 'return',
          value: 100
        }
      }
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  },
  {
    id: 'any-capture',
    name: 'Any Capture',
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: 'Give a simple bonus to any move that captures something.',
    nodes: [
      {
        key: 'organizer',
        type: 'organizer',
        position: { x: 0, y: 0 },
        data: { title: 'Any Capture', notes: '' }
      },
      {
        key: 'condition',
        type: 'condition',
        position: { x: 12, y: 160 },
        data: {
          subject: 'captured_piece',
          subjectSpecifier: 'any',
          relation: 'count',
          relationSpecifier: 'any',
          comparison: 'greater_than',
          comparisonValue: 0
        }
      },
      {
        key: 'action',
        type: 'action',
        position: { x: 8, y: 320 },
        data: {
          actionType: 'add',
          value: 3
        }
      }
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  },
  {
    id: 'avoid-pawn-attacks',
    name: 'Avoid Pawn Attacks',
    category: TEMPLATE_CATEGORIES.SAFETY,
    description: 'Punish moves that leave the moved piece attacked by a pawn.',
    nodes: [
      {
        key: 'organizer',
        type: 'organizer',
        position: { x: 0, y: 0 },
        data: { title: 'Avoid Pawn Attacks', notes: '' }
      },
      {
        key: 'condition',
        type: 'condition',
        position: { x: 12, y: 160 },
        data: {
          subject: 'moved_piece',
          subjectSpecifier: 'any',
          relation: 'attacker',
          relationSpecifier: 'pawn',
          comparison: 'greater_than',
          comparisonValue: 0
        }
      },
      {
        key: 'action',
        type: 'action',
        position: { x: 8, y: 320 },
        data: {
          actionType: 'subtract',
          value: 4
        }
      }
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  },
  {
    id: 'improve-pawn-mobility',
    name: 'Improve Pawn Mobility',
    category: TEMPLATE_CATEGORIES.ACTIVITY,
    description: 'Reward pawn moves that leave that pawn with more mobility than before.',
    nodes: [
      {
        key: 'organizer',
        type: 'organizer',
        position: { x: 0, y: 0 },
        data: { title: 'Improve Pawn Mobility', notes: '' }
      },
      {
        key: 'condition',
        type: 'condition',
        position: { x: 12, y: 160 },
        data: {
          subject: 'moved_piece',
          subjectSpecifier: 'pawn',
          relation: 'mobility',
          relationSpecifier: 'any',
          comparison: 'greater_than',
          comparisonValue: 'prior_board_state'
        }
      },
      {
        key: 'action',
        type: 'action',
        position: { x: 8, y: 320 },
        data: {
          actionType: 'add',
          value: 2
        }
      }
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  }
]

export const TEMPLATES = Object.freeze(validateTemplates(RAW_TEMPLATES))

export function templatesForCategory(category) {
  return TEMPLATES.filter(template => template.category === category)
}

export function findTemplate(templateId) {
  return TEMPLATES.find(template => template.id === templateId) || null
}
