import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const KING_PRESSURE_TEMPLATES = [
  {
    "id": "checkmate",
    "name": "Checkmate",
    "category": TEMPLATE_CATEGORIES.KING_PRESSURE,
    "description": "Return hard for moves that appear to leave the enemy king checkmated.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Checkmate",
          "notes": ""
        }
      },
      {
        "key": "condition_113724",
        "type": "condition",
        "position": {
          "x": 8.0625,
          "y": 215.0156
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113568",
        "type": "condition",
        "position": {
          "x": 8.0625,
          "y": 433.6406
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
        "key": "action_113569",
        "type": "score",
        "position": {
          "x": 8.0625,
          "y": 656.4375
        },
        "data": {
          "actionType": "return",
          "value": 1000
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113724",
        "target": "condition_113568"
      },
      {
        "source": "condition_113568",
        "target": "action_113569"
      },
      {
        "source": "organizer",
        "target": "condition_113724"
      }
    ]
  },
  {
    "id": "tighten-the-net",
    "name": "Tighten The Net",
    "category": TEMPLATE_CATEGORIES.KING_PRESSURE,
    "description": "Reward moves that reduce enemy king mobility.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Tighten The Net",
          "notes": ""
        }
      },
      {
        "key": "condition_113741",
        "type": "condition",
        "position": {
          "x": 19.5725,
          "y": 180.2468
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "enemy",
          "subjectFilter": "king",
          "subjectFilterMode": "include",
          "operator": "mobility",
          "comparator": "less_than",
          "target": "prior_board_state"
        }
      },
      {
        "key": "condition_113744",
        "type": "condition",
        "position": {
          "x": 15.7549,
          "y": 376.2891
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
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
        "key": "condition_113887",
        "type": "condition",
        "position": {
          "x": -64.6249,
          "y": 578.508
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "condition_113888",
        "type": "condition",
        "position": {
          "x": 107.725,
          "y": 570.6108
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
        "key": "action_113906",
        "type": "score",
        "position": {
          "x": 27.5543,
          "y": 756.9092
        },
        "data": {
          "actionType": "add",
          "value": 17
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113741"
      },
      {
        "source": "condition_113741",
        "target": "condition_113744"
      },
      {
        "source": "condition_113744",
        "target": "condition_113887"
      },
      {
        "source": "condition_113744",
        "target": "condition_113888"
      },
      {
        "source": "condition_113887",
        "target": "action_113906"
      },
      {
        "source": "condition_113888",
        "target": "action_113906"
      }
    ]
  },
  {
    "id": "strip-king-shelter",
    "name": "Strip King Shelter",
    "category": TEMPLATE_CATEGORIES.KING_PRESSURE,
    "description": "Reward moves that remove or pressure pieces sheltering the enemy king.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Strip King Shelter",
          "notes": ""
        }
      },
      {
        "key": "condition_113765",
        "type": "condition",
        "position": {
          "x": 18.4861,
          "y": 174.0993
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
        "key": "condition_113771",
        "type": "condition",
        "position": {
          "x": 21.0264,
          "y": 380.0135
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "less_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "shield",
          "target": "enemy",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113766",
        "type": "condition",
        "position": {
          "x": -66.4234,
          "y": 640.5096
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
        "key": "condition_113767",
        "type": "condition",
        "position": {
          "x": 142.289,
          "y": 520.5106
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
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
        "key": "action_113777",
        "type": "score",
        "position": {
          "x": 42.0745,
          "y": 883.2592
        },
        "data": {
          "actionType": "add",
          "value": 18
        }
      },
      {
        "key": "condition_113772",
        "type": "condition",
        "position": {
          "x": 142.7812,
          "y": 729.9299
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113765"
      },
      {
        "source": "condition_113771",
        "target": "condition_113766"
      },
      {
        "source": "condition_113771",
        "target": "condition_113767"
      },
      {
        "source": "condition_113765",
        "target": "condition_113771"
      },
      {
        "source": "condition_113767",
        "target": "condition_113772"
      },
      {
        "source": "condition_113766",
        "target": "action_113777"
      },
      {
        "source": "condition_113772",
        "target": "action_113777"
      }
    ]
  },
  {
    "id": "direct-king-pressure",
    "name": "Direct King Pressure",
    "category": TEMPLATE_CATEGORIES.KING_PRESSURE,
    "description": "Reward direct attacks or pressure against the enemy king.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Direct King Pressure",
          "notes": ""
        }
      },
      {
        "key": "condition_113822",
        "type": "condition",
        "position": {
          "x": -72.8856,
          "y": 183.0482
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113823",
        "type": "condition",
        "position": {
          "x": -68.8918,
          "y": 529.9162
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
        "key": "condition_113824",
        "type": "condition",
        "position": {
          "x": 132.77,
          "y": 440.5161
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
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
        "key": "action_113821",
        "type": "score",
        "position": {
          "x": 25.0412,
          "y": 831.9588
        },
        "data": {
          "actionType": "add",
          "value": 15
        }
      },
      {
        "key": "condition_113825",
        "type": "condition",
        "position": {
          "x": 133.5256,
          "y": 658.6816
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113823",
        "target": "action_113821"
      },
      {
        "source": "condition_113825",
        "target": "action_113821"
      },
      {
        "source": "organizer",
        "target": "condition_113822"
      },
      {
        "source": "condition_113822",
        "target": "condition_113823"
      },
      {
        "source": "condition_113822",
        "target": "condition_113824"
      },
      {
        "source": "condition_113824",
        "target": "condition_113825"
      }
    ]
  }
]
