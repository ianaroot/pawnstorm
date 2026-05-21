import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const TACTIC_TEMPLATES = [
  {
    "id": "discovered-attack",
    "name": "Discovered Attack",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward moves that uncover attacks from another allied piece.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Discovered Attack",
          "notes": ""
        }
      },
      {
        "key": "condition_113753",
        "type": "condition",
        "position": {
          "x": 27.1094,
          "y": 223.6094
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "any",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude",
          "targetComparisonMetric": "count",
          "targetComparator": "equal_to",
          "targetComparisonSource": "exact_number",
          "targetComparisonSourceTotal": 0
        }
      },
      {
        "key": "condition_113851",
        "type": "condition",
        "position": {
          "x": 26.5156,
          "y": 449.4844
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "any",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude"
        }
      },
      {
        "key": "condition_113867",
        "type": "condition",
        "position": {
          "x": 30.4049,
          "y": 675.2813
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
        "key": "action_113897",
        "type": "score",
        "position": {
          "x": 27.8125,
          "y": 890.8438
        },
        "data": {
          "actionType": "add",
          "value": 20
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113753"
      },
      {
        "source": "condition_113753",
        "target": "condition_113851"
      },
      {
        "source": "condition_113851",
        "target": "condition_113867"
      },
      {
        "source": "condition_113867",
        "target": "action_113897"
      }
    ]
  },
  {
    "id": "open-file-rook",
    "name": "Open File Rook",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward rook activity on open or newly opened files.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Open File Rook",
          "notes": ""
        }
      },
      {
        "key": "condition_113923",
        "type": "condition",
        "position": {
          "x": 14.9375,
          "y": 182.1406
        },
        "data": {
          "version": 2,
          "kind": "census",
          "subject": "moved_piece",
          "subjectFilter": "rook",
          "subjectFilterMode": "include",
          "operator": "mobility",
          "comparator": "greater_than",
          "target": "prior_board_state"
        }
      },
      {
        "key": "condition_113852",
        "type": "condition",
        "position": {
          "x": 14.7656,
          "y": 392.0938
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "major",
          "subjectFilterMode": "exclude",
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
        "key": "condition_113868",
        "type": "condition",
        "position": {
          "x": 14.2813,
          "y": 611.25
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "major",
          "subjectFilterMode": "include",
          "operator": "defend",
          "target": "moved_piece",
          "targetFilter": "any"
        }
      },
      {
        "key": "condition_113922",
        "type": "condition",
        "position": {
          "x": 12.1706,
          "y": 829.7344
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "any",
          "operator": "defend",
          "target": "allied",
          "targetFilter": "pawn",
          "targetFilterMode": "include",
          "targetComparisonMetric": "count",
          "targetComparator": "less_than",
          "targetComparisonSource": "prior_board_state"
        }
      },
      {
        "key": "action_113909",
        "type": "score",
        "position": {
          "x": 6.5625,
          "y": 1036.0313
        },
        "data": {
          "actionType": "add",
          "value": 7
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113923",
        "target": "condition_113852"
      },
      {
        "source": "condition_113852",
        "target": "condition_113868"
      },
      {
        "source": "condition_113922",
        "target": "action_113909"
      },
      {
        "source": "condition_113868",
        "target": "condition_113922"
      },
      {
        "source": "organizer",
        "target": "condition_113923"
      }
    ]
  },
  {
    "id": "connect-majors",
    "name": "Connect Majors",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Encourage coordination between major pieces.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Connect Majors",
          "notes": ""
        }
      },
      {
        "key": "condition_113756",
        "type": "condition",
        "position": {
          "x": 16.2188,
          "y": 179.7031
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "allied",
          "subjectFilter": "major",
          "subjectFilterMode": "include",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "defend",
          "target": "allied",
          "targetFilter": "major",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "action_113853",
        "type": "score",
        "position": {
          "x": 13.4063,
          "y": 404.9219
        },
        "data": {
          "actionType": "add",
          "value": 8
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113756"
      },
      {
        "source": "condition_113756",
        "target": "action_113853"
      }
    ]
  },
  {
    "id": "knight-fork",
    "name": "Knight Fork",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward knight moves that fork multiple valuable enemy pieces.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Knight Fork",
          "notes": ""
        }
      },
      {
        "key": "condition_113749",
        "type": "condition",
        "position": {
          "x": 12.5531,
          "y": 212.9805
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "knight",
          "subjectFilterMode": "include",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude",
          "targetComparisonMetric": "count",
          "targetComparator": "greater_than",
          "targetComparisonSource": "exact_number",
          "targetComparisonSourceTotal": 1
        }
      },
      {
        "key": "condition_113750",
        "type": "condition",
        "position": {
          "x": -109.025,
          "y": 356.9961
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
        "key": "condition_113751",
        "type": "condition",
        "position": {
          "x": 129.5219,
          "y": 353.4023
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
        "key": "condition_113752",
        "type": "condition",
        "position": {
          "x": -107.654,
          "y": 539.6226
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
        "key": "action_113869",
        "type": "score",
        "position": {
          "x": 119.8912,
          "y": 682.8109
        },
        "data": {
          "actionType": "add",
          "value": 30
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113749"
      },
      {
        "source": "condition_113749",
        "target": "condition_113750"
      },
      {
        "source": "condition_113749",
        "target": "condition_113751"
      },
      {
        "source": "condition_113750",
        "target": "condition_113752"
      },
      {
        "source": "condition_113751",
        "target": "action_113869"
      },
      {
        "source": "condition_113752",
        "target": "action_113869"
      }
    ]
  },
  {
    "id": "bishop-fork",
    "name": "Bishop Fork",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward bishop moves that fork multiple valuable enemy pieces.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Bishop Fork",
          "notes": ""
        }
      },
      {
        "key": "condition_113757",
        "type": "condition",
        "position": {
          "x": 20.2094,
          "y": 215.1211
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "moved_piece",
          "subjectFilter": "bishop",
          "subjectFilterMode": "include",
          "operator": "attack",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude",
          "targetComparisonMetric": "count",
          "targetComparator": "greater_than",
          "targetComparisonSource": "exact_number",
          "targetComparisonSourceTotal": 1
        }
      },
      {
        "key": "condition_113856",
        "type": "condition",
        "position": {
          "x": -117.9469,
          "y": 359.7617
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
        "key": "condition_113871",
        "type": "condition",
        "position": {
          "x": 155.8969,
          "y": 363.918
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
        "key": "condition_113870",
        "type": "condition",
        "position": {
          "x": -115.8884,
          "y": 600.6069
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
        "key": "action_113872",
        "type": "score",
        "position": {
          "x": 156.4225,
          "y": 747.4828
        },
        "data": {
          "actionType": "add",
          "value": 20
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113757"
      },
      {
        "source": "condition_113757",
        "target": "condition_113856"
      },
      {
        "source": "condition_113856",
        "target": "condition_113870"
      },
      {
        "source": "condition_113757",
        "target": "condition_113871"
      },
      {
        "source": "condition_113870",
        "target": "action_113872"
      },
      {
        "source": "condition_113871",
        "target": "action_113872"
      }
    ]
  },
  {
    "id": "king-pin",
    "name": "King Pin",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward pinning an enemy piece against its king.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "King Pin",
          "notes": ""
        }
      },
      {
        "key": "condition_113844",
        "type": "condition",
        "position": {
          "x": 18.0872,
          "y": 186.9789
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "exclude",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "shield",
          "target": "enemy",
          "targetFilter": "king",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113610",
        "type": "condition",
        "position": {
          "x": 15.0239,
          "y": 380.334
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
          "targetFilter": "any",
          "targetComparisonMetric": "individual_value",
          "targetComparator": "less_than",
          "targetComparisonSource": "exact_number",
          "targetComparisonSourceTotal": 9
        }
      },
      {
        "key": "condition_113873",
        "type": "condition",
        "position": {
          "x": -81.7748,
          "y": 578.9155
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
        "key": "condition_113874",
        "type": "condition",
        "position": {
          "x": 95.2877,
          "y": 582.629
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
        "key": "action_113898",
        "type": "score",
        "position": {
          "x": 15.5234,
          "y": 795.6761
        },
        "data": {
          "actionType": "add",
          "value": 15
        }
      }
    ],
    "connections": [
      {
        "source": "condition_113844",
        "target": "condition_113610"
      },
      {
        "source": "organizer",
        "target": "condition_113844"
      },
      {
        "source": "condition_113610",
        "target": "condition_113873"
      },
      {
        "source": "condition_113610",
        "target": "condition_113874"
      },
      {
        "source": "condition_113873",
        "target": "action_113898"
      },
      {
        "source": "condition_113874",
        "target": "action_113898"
      }
    ]
  },
  {
    "id": "queen-skewer",
    "name": "Queen Skewer",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward queen moves that create skewer-like pressure.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Queen Skewer",
          "notes": ""
        }
      },
      {
        "key": "condition_113828",
        "type": "condition",
        "position": {
          "x": 17.3197,
          "y": 196.9259
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "queen",
          "subjectFilterMode": "include",
          "subjectComparisonMetric": "individual_value",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "moved_piece",
          "operator": "shield",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude"
        }
      },
      {
        "key": "condition_113829",
        "type": "condition",
        "position": {
          "x": 19.3467,
          "y": 392.5214
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
        "key": "condition_113830",
        "type": "condition",
        "position": {
          "x": -67.8954,
          "y": 597.5295
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
        "key": "condition_113831",
        "type": "condition",
        "position": {
          "x": 135.8674,
          "y": 603.6932
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
        "key": "action_113899",
        "type": "score",
        "position": {
          "x": 39.3692,
          "y": 824.4634
        },
        "data": {
          "actionType": "add",
          "value": 15
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113828"
      },
      {
        "source": "condition_113828",
        "target": "condition_113829"
      },
      {
        "source": "condition_113829",
        "target": "condition_113830"
      },
      {
        "source": "condition_113829",
        "target": "condition_113831"
      },
      {
        "source": "condition_113830",
        "target": "action_113899"
      },
      {
        "source": "condition_113831",
        "target": "action_113899"
      }
    ]
  },
  {
    "id": "rook-pin",
    "name": "Rook Pin",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward rook moves that create pin-like pressure.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Rook Pin",
          "notes": ""
        }
      },
      {
        "key": "condition_113738",
        "type": "condition",
        "position": {
          "x": 20.7779,
          "y": 211.2927
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "pawn",
          "subjectFilterMode": "exclude",
          "subjectComparisonMetric": "count",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "prior_board_state",
          "operator": "shield",
          "target": "enemy",
          "targetFilter": "rook",
          "targetFilterMode": "include"
        }
      },
      {
        "key": "condition_113739",
        "type": "condition",
        "position": {
          "x": 31.6124,
          "y": 440.3434
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
          "targetFilter": "any",
          "targetComparisonMetric": "individual_value",
          "targetComparator": "less_than",
          "targetComparisonSource": "exact_number",
          "targetComparisonSourceTotal": 5
        }
      },
      {
        "key": "condition_113875",
        "type": "condition",
        "position": {
          "x": 111.8762,
          "y": 642.6384
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
        "key": "condition_113876",
        "type": "condition",
        "position": {
          "x": -65.1863,
          "y": 638.9249
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
        "key": "action_113900",
        "type": "score",
        "position": {
          "x": 32.1118,
          "y": 855.6855
        },
        "data": {
          "actionType": "add",
          "value": 15
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113738"
      },
      {
        "source": "condition_113738",
        "target": "condition_113739"
      },
      {
        "source": "condition_113739",
        "target": "condition_113875"
      },
      {
        "source": "condition_113739",
        "target": "condition_113876"
      },
      {
        "source": "condition_113875",
        "target": "action_113900"
      },
      {
        "source": "condition_113876",
        "target": "action_113900"
      }
    ]
  },
  {
    "id": "rook-skewer",
    "name": "Rook Skewer",
    "category": TEMPLATE_CATEGORIES.TACTICS,
    "description": "Reward rook moves that create skewer-like pressure.",
    "nodes": [
      {
        "key": "organizer",
        "type": "organizer",
        "position": {
          "x": 0.0,
          "y": 0.0
        },
        "data": {
          "title": "Rook Skewer",
          "notes": ""
        }
      },
      {
        "key": "condition_113845",
        "type": "condition",
        "position": {
          "x": 23.4063,
          "y": 186.625
        },
        "data": {
          "version": 2,
          "kind": "relational",
          "subject": "enemy",
          "subjectFilter": "rook",
          "subjectFilterMode": "include",
          "subjectComparisonMetric": "individual_value",
          "subjectComparator": "greater_than",
          "subjectComparisonSource": "moved_piece",
          "operator": "shield",
          "target": "enemy",
          "targetFilter": "pawn",
          "targetFilterMode": "exclude"
        }
      },
      {
        "key": "condition_113857",
        "type": "condition",
        "position": {
          "x": 20.1237,
          "y": 422.8765
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
        "key": "condition_113877",
        "type": "condition",
        "position": {
          "x": 136.6445,
          "y": 634.0484
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
        "key": "condition_113878",
        "type": "condition",
        "position": {
          "x": -67.1183,
          "y": 627.8846
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
        "key": "action_113901",
        "type": "score",
        "position": {
          "x": 40.1462,
          "y": 854.8185
        },
        "data": {
          "actionType": "return",
          "value": 15
        }
      }
    ],
    "connections": [
      {
        "source": "organizer",
        "target": "condition_113845"
      },
      {
        "source": "condition_113845",
        "target": "condition_113857"
      },
      {
        "source": "condition_113857",
        "target": "condition_113877"
      },
      {
        "source": "condition_113857",
        "target": "condition_113878"
      },
      {
        "source": "condition_113877",
        "target": "action_113901"
      },
      {
        "source": "condition_113878",
        "target": "action_113901"
      }
    ]
  }
]
