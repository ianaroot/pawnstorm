import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const DEFENSE_TEMPLATES = [
  {
    "id": "avoid-hanging-pieces",
    "name": "Avoid Hanging Pieces",
    "category": TEMPLATE_CATEGORIES.DEFENSE,
    "description": "Discourage moves that leave pieces hanging.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Avoid Hanging Pieces",
          "notes": ""
        }
      },
      {
        "key": "condition_113690",
        "type": "condition",
        "position": {
          "x": 18.3281,
          "y": 200.0156
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "captured_piece",
          "subjectFilter": "any",
          "operator": "count",
          "comparator": "equal_to",
          "target": "exact_number",
          "targetTotal": 0
        }
      },
      {
        "key": "condition_113571",
        "type": "condition",
        "position": {
          "x": 18.8594,
          "y": 405.1875
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
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "condition_113881",
        "type": "condition",
        "position": {
          "x": 22.7813,
          "y": 601.4688
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "exact_number",
          "subjectComparisonSourceTotal": 0,
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "action_113903",
        "type": "score",
        "position": {
          "x": 18.3594,
          "y": 807.9375
        },
        "data": {
          "actionType": "subtract",
          "value": 20
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113690",
        "target": "condition_113571"
      },
      {
        "source": "organizer",
        "target": "condition_113690"
      },
      {
        "source": "condition_113571",
        "target": "condition_113881"
      },
      {
        "source": "condition_113881",
        "target": "action_113903"
      }
    ]
  },
  {
    "id": "escape-check-safely",
    "name": "Escape Check Safely",
    "category": TEMPLATE_CATEGORIES.DEFENSE,
    "description": "Prefer safe replies when escaping check-like danger.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Escape Check Safely",
          "notes": ""
        }
      },
      {
        "key": "condition_113570",
        "type": "condition",
        "position": {
          "x": 18.4531,
          "y": 208.2344
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "less_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "attack",
          "target": "allied",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113962",
        "type": "condition",
        "position": {
          "x": 178.7656,
          "y": 426.25
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "moved_piece",
          "subjectFilter": "king",
          "subjectFilterMode": "include",
          "operator": "count",
          "comparator": "greater_than",
          "target": "exact_number",
          "targetTotal": 0
        }
      },
      {
        "key": "condition_113576",
        "type": "condition",
        "position": {
          "x": 12.9531,
          "y": 429.2656
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "major",
          "targetFilterMode": "exclude"
        }
      },
      {
        "key": "condition_113861",
        "type": "condition",
        "position": {
          "x": -127.8281,
          "y": 406.1406
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
        "key": "action_113904",
        "type": "score",
        "position": {
          "x": 90,
          "y": 660.0313
        },
        "data": {
          "actionType": "add",
          "value": 5
        }
      },
      {
        "key": "action_113884",
        "type": "score",
        "position": {
          "x": -132.9063,
          "y": 635.8906
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
        "target": "condition_113570"
      },
      {
        "source": "condition_113570",
        "target": "condition_113576"
      },
      {
        "source": "condition_113570",
        "target": "condition_113861"
      },
      {
        "source": "condition_113861",
        "target": "action_113884"
      },
      {
        "source": "condition_113576",
        "target": "action_113904"
      },
      {
        "source": "condition_113962",
        "target": "action_113904"
      },
      {
        "source": "condition_113570",
        "target": "condition_113962"
      }
    ]
  }
]
