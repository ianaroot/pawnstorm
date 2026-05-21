import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const PAWN_PLAY_TEMPLATES = [
  {
    "id": "push-safe-pawns",
    "name": "Push Safe Pawns",
    "category": TEMPLATE_CATEGORIES.PAWN_PLAY,
    "description": "Reward pawn pushes that do not create obvious tactical problems.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Push Safe Pawns",
          "notes": ""
        }
      },
      {
        "key": "condition_113586",
        "type": "condition",
        "position": {
          "x": -125.9531,
          "y": 201.4043
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "pawn",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113588",
        "type": "condition",
        "position": {
          "x": 26.9531,
          "y": 214.0313
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "defend",
          "target": "allied",
          "targetFilter": "pawn",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113654",
        "type": "condition",
        "position": {
          "x": 191.5156,
          "y": 209.6875
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
          "targetFilter": "pawn",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "action_113793",
        "type": "score",
        "position": {
          "x": 29.6406,
          "y": 459.7168
        },
        "data": {
          "actionType": "return",
          "value": 7
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113586",
        "target": "action_113793"
      },
      {
        "source": "condition_113588",
        "target": "action_113793"
      },
      {
        "source": "condition_113654",
        "target": "action_113793"
      },
      {
        "source": "organizer",
        "target": "condition_113586"
      },
      {
        "source": "organizer",
        "target": "condition_113588"
      },
      {
        "source": "organizer",
        "target": "condition_113654"
      }
    ]
  },
  {
    "id": "safe-promotion",
    "name": "Safe Promotion",
    "category": TEMPLATE_CATEGORIES.PAWN_PLAY,
    "description": "Reward promotion pushes that appear safe.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Safe Promotion",
          "notes": ""
        }
      },
      {
        "key": "condition_113692",
        "type": "condition",
        "position": {
          "x": 18.5313,
          "y": 192.1563
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "moved_piece",
          "subjectFilter": "any",
          "operator": "value",
          "comparator": "greater_than",
          "target": "prior_board_state"
        }
      },
      {
        "key": "condition_113572",
        "type": "condition",
        "position": {
          "x": 10.8281,
          "y": 402.1875
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
        "key": "action_113939",
        "type": "score",
        "position": {
          "x": 8.8594,
          "y": 623.1719
        },
        "data": {
          "actionType": "add",
          "value": 30
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113692",
        "target": "condition_113572"
      },
      {
        "source": "organizer",
        "target": "condition_113692"
      },
      {
        "source": "condition_113572",
        "target": "action_113939"
      }
    ]
  },
  {
    "id": "attack-pawns",
    "name": "Attack Pawns",
    "category": TEMPLATE_CATEGORIES.PAWN_PLAY,
    "description": "Reward attacks against enemy pawns.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Attack Pawns",
          "notes": ""
        }
      },
      {
        "key": "condition_113892",
        "type": "condition",
        "position": {
          "x": -161.0469,
          "y": 196.4219
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
        "key": "condition_113748",
        "type": "condition",
        "position": {
          "x": 156.0469,
          "y": 199.1875
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "any",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113589",
        "type": "condition",
        "position": {
          "x": -1.7344,
          "y": 436.0625
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "captured_piece",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
          "operator": "count",
          "comparator": "equal_to",
          "target": "exact_number",
          "targetTotal": 1
        }
      },
      {
        "key": "condition_113656",
        "type": "condition",
        "position": {
          "x": -159.4375,
          "y": 430.625
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "pawn",
          "subjectFilterMode": "exclude",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113590",
        "type": "condition",
        "position": {
          "x": 159.9844,
          "y": 423.8438
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
        "key": "action_113561",
        "type": "score",
        "position": {
          "x": 0.3281,
          "y": 674.9531
        },
        "data": {
          "actionType": "add",
          "value": 16
        }
      },
      {
        "key": "action_113657",
        "type": "score",
        "position": {
          "x": -170.3281,
          "y": 661.4063
        },
        "data": {
          "actionType": "add",
          "value": 15
        }
      },
      {
        "key": "action_113658",
        "type": "score",
        "position": {
          "x": 145.0781,
          "y": 632.6094
        },
        "data": {
          "actionType": "add",
          "value": 19
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113589",
        "target": "action_113561"
      },
      {
        "source": "condition_113892",
        "target": "condition_113589"
      },
      {
        "source": "condition_113748",
        "target": "condition_113590"
      },
      {
        "source": "condition_113892",
        "target": "condition_113656"
      },
      {
        "source": "condition_113656",
        "target": "action_113657"
      },
      {
        "source": "condition_113590",
        "target": "action_113658"
      },
      {
        "source": "organizer",
        "target": "condition_113748"
      },
      {
        "source": "organizer",
        "target": "condition_113892"
      }
    ]
  },
  {
    "id": "avoid-pawn-attacks",
    "name": "Avoid Pawn Attacks",
    "category": TEMPLATE_CATEGORIES.PAWN_PLAY,
    "description": "Discourage moves that leave the moved piece attacked by enemy pawns.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Avoid Pawn Attacks",
          "notes": ""
        }
      },
      {
        "key": "condition_113841",
        "type": "condition",
        "position": {
          "x": 29.07,
          "y": 209.5531
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude"
        }
      },
      {
        "key": "action_113737",
        "type": "score",
        "position": {
          "x": 23.8669,
          "y": 416.3514
        },
        "data": {
          "actionType": "subtract",
          "value": 8
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113841",
        "target": "action_113737"
      },
      {
        "source": "organizer",
        "target": "condition_113841"
      }
    ]
  },
  {
    "id": "improve-pawn-mobility",
    "name": "Improve Pawn Mobility",
    "category": TEMPLATE_CATEGORIES.PAWN_PLAY,
    "description": "Reward pawn moves that improve pawn mobility.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Improve Pawn Mobility",
          "notes": ""
        }
      },
      {
        "key": "condition_113848",
        "type": "condition",
        "position": {
          "x": 21.6108,
          "y": 198.9387
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
          "operator": "defend",
          "target": "allied",
          "targetFilter": "pawn",
          "targetFilterMode": "include",
          "targetComparisonMetric": "count",
          "targetComparator": "greater_than",
          "targetComparisonSource": "prior_board_state"
        }
      },
      {
        "key": "action_113577",
        "type": "score",
        "position": {
          "x": 11.6282,
          "y": 414.701
        },
        "data": {
          "actionType": "add",
          "value": 5
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113848",
        "target": "action_113577"
      },
      {
        "source": "organizer",
        "target": "condition_113848"
      }
    ]
  }
]
