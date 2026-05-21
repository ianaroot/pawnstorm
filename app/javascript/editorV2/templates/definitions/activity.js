import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const ACTIVITY_TEMPLATES = [
  {
    "id": "queen-safety",
    "name": "Queen Safety",
    "category": TEMPLATE_CATEGORIES.ACTIVITY,
    "description": "Discourage early queen movement or exposed queen placement.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Queen Safety",
          "notes": ""
        }
      },
      {
        "key": "condition_113747",
        "type": "condition",
        "position": {
          "x": -105.1875,
          "y": 213.8438
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "any",
          "operator": "attack",
          "target": "moved_piece",
          "targetFilter": "queen",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113563",
        "type": "condition",
        "position": {
          "x": 149.6321,
          "y": 215.5401
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
          "target": "moved_piece",
          "targetFilter": "queen",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "action_113940",
        "type": "score",
        "position": {
          "x": -110.375,
          "y": 469.0313
        },
        "data": {
          "actionType": "subtract",
          "value": 20
        }
      },
      {
        "key": "condition_113565",
        "type": "condition",
        "position": {
          "x": 149.6634,
          "y": 425.837
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
          "targetFilter": "queen",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "action_113946",
        "type": "score",
        "position": {
          "x": 146.804,
          "y": 624.1964
        },
        "data": {
          "actionType": "add",
          "value": 150
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113563"
      },
      {
        "source": "condition_113563",
        "target": "condition_113565"
      },
      {
        "source": "organizer",
        "target": "condition_113747"
      },
      {
        "source": "condition_113747",
        "target": "action_113940"
      },
      {
        "source": "condition_113565",
        "target": "action_113946"
      }
    ]
  }
]
