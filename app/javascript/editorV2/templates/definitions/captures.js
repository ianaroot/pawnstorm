import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const CAPTURE_TEMPLATES = [
  {
    "id": "free-capture",
    "name": "Free Capture",
    "category": TEMPLATE_CATEGORIES.CAPTURES,
    "description": "Reward captures that appear safe or low-risk.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Free Capture",
          "notes": ""
        }
      },
      {
        "key": "condition_113685",
        "type": "condition",
        "position": {
          "x": 21.9375,
          "y": 193.9063
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "captured_piece",
          "subjectFilter": "any",
          "operator": "count",
          "comparator": "equal_to",
          "target": "exact_number",
          "targetTotal": 1
        }
      },
      {
        "key": "condition_113686",
        "type": "condition",
        "position": {
          "x": 25.1094,
          "y": 416.3906
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "equal_to",
          "subjectComparisonSource": "exact_number",
          "subjectComparisonSourceTotal": 0,
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "action_113702",
        "type": "score",
        "position": {
          "x": 24.0781,
          "y": 689.75
        },
        "data": {
          "actionType": "add",
          "value": 60
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113685"
      },
      {
        "source": "condition_113685",
        "target": "condition_113686"
      },
      {
        "source": "condition_113686",
        "target": "action_113702"
      }
    ]
  },
  {
    "id": "kick-material",
    "name": "Kick Material",
    "category": TEMPLATE_CATEGORIES.CAPTURES,
    "description": "Reward moves that attack or pressure valuable enemy material.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Kick Material",
          "notes": ""
        }
      },
      {
        "key": "condition_113701",
        "type": "condition",
        "position": {
          "x": 20.1563,
          "y": 195.5469
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude"
        }
      },
      {
        "key": "condition_113573",
        "type": "condition",
        "position": {
          "x": 17.0625,
          "y": 410.9219
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "action_113942",
        "type": "score",
        "position": {
          "x": 11.375,
          "y": 614.1875
        },
        "data": {
          "actionType": "add",
          "value": 15
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113701",
        "target": "condition_113573"
      },
      {
        "source": "organizer",
        "target": "condition_113701"
      },
      {
        "source": "condition_113573",
        "target": "action_113942"
      }
    ]
  },
  {
    "id": "winning-capture",
    "name": "Winning Capture",
    "category": TEMPLATE_CATEGORIES.CAPTURES,
    "description": "Reward captures that win material compared with the moved piece.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Winning Capture",
          "notes": ""
        }
      },
      {
        "key": "condition_113842",
        "type": "condition",
        "position": {
          "x": 23.2124,
          "y": 225.3338
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "captured_piece",
          "subjectFilter": "any",
          "operator": "value",
          "comparator": "greater_than",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "action_113855",
        "type": "score",
        "position": {
          "x": 19.2124,
          "y": 451.916
        },
        "data": {
          "actionType": "add",
          "value": 200
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113842"
      },
      {
        "source": "condition_113842",
        "target": "action_113855"
      }
    ]
  }
]
