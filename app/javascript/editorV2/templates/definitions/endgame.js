import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const ENDGAME_TEMPLATES = [
  {
    "id": "endgame",
    "name": "Endgame",
    "category": TEMPLATE_CATEGORIES.ENDGAME,
    "description": "Detect and reward endgame-specific move priorities.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Endgame",
          "notes": ""
        }
      },
      {
        "key": "condition_113604",
        "type": "condition",
        "position": {
          "x": 22,
          "y": 193.875
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "allied",
          "subjectFilter": "pawn",
          "subjectFilterMode": "exclude",
          "operator": "count",
          "comparator": "less_than",
          "target": "exact_number",
          "targetTotal": 4
        }
      },
      {
        "key": "condition_113567",
        "type": "condition",
        "position": {
          "x": 22,
          "y": 412.375
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "exclude",
          "operator": "count",
          "comparator": "less_than",
          "target": "exact_number",
          "targetTotal": 4
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113604",
        "target": "condition_113567"
      },
      {
        "source": "organizer",
        "target": "condition_113604"
      }
    ]
  },
  {
    "id": "avoid-stalemate",
    "name": "Avoid Stalemate",
    "category": TEMPLATE_CATEGORIES.ENDGAME,
    "description": "Discourage moves that leave the enemy with no legal mobility when not mating.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Avoid Stalemate",
          "notes": ""
        }
      },
      {
        "key": "condition_113683",
        "type": "condition",
        "position": {
          "x": 19.9844,
          "y": 197.3906
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "enemy",
          "subjectFilter": "any",
          "operator": "mobility",
          "comparator": "equal_to",
          "target": "exact_number",
          "targetTotal": 0
        }
      },
      {
        "key": "condition_113687",
        "type": "condition",
        "position": {
          "x": 19.9844,
          "y": 436.5156
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "equal_to",
          "subjectComparisonSource": "exact_number",
          "subjectComparisonSourceTotal": 0,
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "action_113560",
        "type": "score",
        "position": {
          "x": 25.25,
          "y": 653.1094
        },
        "data": {
          "actionType": "return",
          "value": -1000
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113687",
        "target": "action_113560"
      },
      {
        "source": "organizer",
        "target": "condition_113683"
      },
      {
        "source": "condition_113683",
        "target": "condition_113687"
      }
    ]
  }
]
