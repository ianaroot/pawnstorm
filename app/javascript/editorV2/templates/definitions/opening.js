import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const OPENING_TEMPLATES = [
  {
    "id": "opening-game-condition",
    "name": "Opening Game Condition",
    "category": TEMPLATE_CATEGORIES.OPENING,
    "description": "Detect an early opening state by checking that both sides still have high material.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Opening Game Condition",
          "notes": ""
        }
      },
      {
        "key": "condition_113731",
        "type": "condition",
        "position": {
          "x": 20.4752,
          "y": 266.704
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "allied",
          "subjectFilter": "king",
          "subjectFilterMode": "exclude",
          "operator": "value",
          "comparator": "greater_than",
          "target": "exact_number",
          "targetTotal": 34
        }
      },
      {
        "key": "condition_113850",
        "type": "condition",
        "position": {
          "x": 21.3426,
          "y": 483.8646
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "enemy",
          "subjectFilter": "king",
          "subjectFilterMode": "exclude",
          "operator": "value",
          "comparator": "greater_than",
          "target": "exact_number",
          "targetTotal": 34
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113731"
      },
      {
        "source": "condition_113731",
        "target": "condition_113850"
      }
    ]
  },
  {
    "id": "safe-bishop-development",
    "name": "Safe Bishop Development",
    "category": TEMPLATE_CATEGORIES.OPENING,
    "description": "Reward bishop development that improves the moved bishop without walking into danger.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Safe Bishop Development",
          "notes": ""
        }
      },
      {
        "key": "condition_113783",
        "type": "condition",
        "position": {
          "x": 19.082,
          "y": 197.8409
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "moved_piece",
          "subjectFilter": "bishop",
          "subjectFilterMode": "include",
          "operator": "mobility",
          "comparator": "greater_than",
          "target": "prior_board_state"
        }
      },
      {
        "key": "condition_113786",
        "type": "condition",
        "position": {
          "x": 13.0741,
          "y": 399.2364
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
        "key": "condition_113788",
        "type": "condition",
        "position": {
          "x": -103.8048,
          "y": 582.2103
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "exclude",
          "subjectComparisonMetric": "count",
          "subjectComparator": "less_than_or_equal_to",
          "subjectComparisonSource": "prior_board_state",
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "condition_113789",
        "type": "condition",
        "position": {
          "x": 105.9544,
          "y": 692.1264
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
        "key": "condition_113791",
        "type": "condition",
        "position": {
          "x": -105.6836,
          "y": 787.6438
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "include",
          "subjectComparisonMetric": "count",
          "subjectComparator": "equal_to",
          "subjectComparisonSource": "prior_board_state",
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "action_113915",
        "type": "score",
        "position": {
          "x": 5.5924,
          "y": 980.7595
        },
        "data": {
          "actionType": "add",
          "value": 10
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113783"
      },
      {
        "source": "condition_113783",
        "target": "condition_113786"
      },
      {
        "source": "condition_113786",
        "target": "condition_113788"
      },
      {
        "source": "condition_113786",
        "target": "condition_113789"
      },
      {
        "source": "condition_113788",
        "target": "condition_113791"
      },
      {
        "source": "condition_113789",
        "target": "action_113915"
      },
      {
        "source": "condition_113791",
        "target": "action_113915"
      }
    ]
  },
  {
    "id": "castling",
    "name": "Castling",
    "category": TEMPLATE_CATEGORIES.OPENING,
    "description": "Approximate castling intent by rewarding king movement toward allied rook structure.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Castling",
          "notes": ""
        }
      },
      {
        "key": "condition_113894",
        "type": "condition",
        "position": {
          "x": 443.1015,
          "y": 156.1025
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "king",
          "subjectFilterMode": "include",
          "operator": "adjacent",
          "target": "allied",
          "targetFilter": "rook",
          "targetFilterMode": "include",
          "targetComparisonMetric": "count",
          "targetComparator": "equal_to",
          "targetComparisonSource": "exact_number",
          "targetComparisonSourceTotal": 1
        }
      },
      {
        "key": "condition_113895",
        "type": "condition",
        "position": {
          "x": 19.5818,
          "y": 200.3123
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
        "key": "condition_113591",
        "type": "condition",
        "position": {
          "x": 445.3897,
          "y": 336.8934
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "rook",
          "subjectFilterMode": "include",
          "subjectComparisonMetric": "count",
          "subjectComparator": "equal_to",
          "subjectComparisonSource": "prior_board_state",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113587",
        "type": "condition",
        "position": {
          "x": 21.4684,
          "y": 386.2719
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "moved_piece",
          "subjectFilter": "any",
          "operator": "mobility",
          "comparator": "greater_than",
          "target": "prior_board_state"
        }
      },
      {
        "key": "condition_113660",
        "type": "condition",
        "position": {
          "x": 443.7111,
          "y": 555.7283
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "equal_to",
          "subjectComparisonSource": "prior_board_state",
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113661",
        "type": "condition",
        "position": {
          "x": -95.5041,
          "y": 569.8024
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "bishop",
          "subjectFilterMode": "include",
          "operator": "adjacent",
          "target": "allied",
          "targetFilter": "king",
          "targetFilterMode": "include",
          "targetComparisonMetric": "count",
          "targetComparator": "less_than",
          "targetComparisonSource": "prior_board_state"
        }
      },
      {
        "key": "condition_113911",
        "type": "condition",
        "position": {
          "x": 110.081,
          "y": 584.3178
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "knight",
          "subjectFilterMode": "include",
          "operator": "adjacent",
          "target": "allied",
          "targetFilter": "rook",
          "targetFilterMode": "include",
          "targetComparisonMetric": "count",
          "targetComparator": "less_than",
          "targetComparisonSource": "prior_board_state"
        }
      },
      {
        "key": "condition_113619",
        "type": "condition",
        "position": {
          "x": 388.5236,
          "y": 774.0877
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
          "target": "allied",
          "targetFilter": "rook",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "action_113914",
        "type": "score",
        "position": {
          "x": 8.4839,
          "y": 780.2582
        },
        "data": {
          "actionType": "add",
          "value": 10
        }
      },
      {
        "key": "action_113794",
        "type": "score",
        "position": {
          "x": 384.1486,
          "y": 1002.7908
        },
        "data": {
          "actionType": "add",
          "value": 12
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113895",
        "target": "condition_113587"
      },
      {
        "source": "condition_113894",
        "target": "condition_113591"
      },
      {
        "source": "condition_113660",
        "target": "condition_113619"
      },
      {
        "source": "condition_113591",
        "target": "condition_113660"
      },
      {
        "source": "condition_113587",
        "target": "condition_113661"
      },
      {
        "source": "condition_113619",
        "target": "action_113794"
      },
      {
        "source": "organizer",
        "target": "condition_113894"
      },
      {
        "source": "organizer",
        "target": "condition_113895"
      },
      {
        "source": "condition_113587",
        "target": "condition_113911"
      },
      {
        "source": "condition_113661",
        "target": "action_113914"
      },
      {
        "source": "condition_113911",
        "target": "action_113914"
      }
    ]
  },
  {
    "id": "safe-knight-development",
    "name": "Safe Knight Development",
    "category": TEMPLATE_CATEGORIES.OPENING,
    "description": "Reward knight development that improves the moved knight without walking into danger.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Safe Knight Development",
          "notes": ""
        }
      },
      {
        "key": "condition_113893",
        "type": "condition",
        "position": {
          "x": 3.117,
          "y": 200.8796
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "moved_piece",
          "subjectFilter": "knight",
          "subjectFilterMode": "include",
          "operator": "mobility",
          "comparator": "greater_than",
          "target": "prior_board_state"
        }
      },
      {
        "key": "condition_113785",
        "type": "condition",
        "position": {
          "x": -2.8909,
          "y": 402.2751
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "exact_number",
          "subjectComparisonSourceTotal": 0,
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "condition_113659",
        "type": "condition",
        "position": {
          "x": -119.7698,
          "y": 585.249
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "exclude",
          "subjectComparisonMetric": "count",
          "subjectComparator": "less_than_or_equal_to",
          "subjectComparisonSource": "prior_board_state",
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "condition_113787",
        "type": "condition",
        "position": {
          "x": 89.9894,
          "y": 695.1651
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
        "key": "condition_113790",
        "type": "condition",
        "position": {
          "x": -121.6486,
          "y": 790.6825
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
        "key": "action_113913",
        "type": "score",
        "position": {
          "x": -10.3726,
          "y": 983.7982
        },
        "data": {
          "actionType": "add",
          "value": 10
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113785",
        "target": "condition_113659"
      },
      {
        "source": "condition_113893",
        "target": "condition_113785"
      },
      {
        "source": "condition_113785",
        "target": "condition_113787"
      },
      {
        "source": "condition_113659",
        "target": "condition_113790"
      },
      {
        "source": "organizer",
        "target": "condition_113893"
      },
      {
        "source": "condition_113787",
        "target": "action_113913"
      },
      {
        "source": "condition_113790",
        "target": "action_113913"
      }
    ]
  }
]
