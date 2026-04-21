import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const DEFENSE_TEMPLATES = [
  {
    id: "safety",
    name: "Safety",
    category: TEMPLATE_CATEGORIES.DEFENSE,
    description: "General defensive checks for safer move selection.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Safety",
        notes: ""
      }
    },
    {
      key: "condition_110712",
      type: "condition",
      position: {
        x: 19.546875,
        y: 199.859375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "allied",
        targetFilter: "pawn",
        targetFilterMode: "exclude",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110713",
      type: "action",
      position: {
        x: 18.453125,
        y: 421.625
      },
      data: {
        actionType: "subtract",
        value: 5
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110712"
    },
    {
      source: "condition_110712",
      target: "action_110713"
    }
  ]
  },
  {
    id: "retain-defense",
    name: "Retain Defense",
    category: TEMPLATE_CATEGORIES.DEFENSE,
    description: "Prefer moves that keep important pieces defended.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Retain Defense",
        notes: ""
      }
    },
    {
      key: "condition_110697",
      type: "condition",
      position: {
        x: 14.546875,
        y: 205.71875
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "defend",
        target: "allied",
        targetFilter: "pawn",
        targetFilterMode: "exclude",
        subjectComparisonMetric: "count",
        subjectComparator: "less_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110701",
      type: "action",
      position: {
        x: 10.640625,
        y: 416.765625
      },
      data: {
        actionType: "subtract",
        value: 3
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110697"
    },
    {
      source: "condition_110697",
      target: "action_110701"
    }
  ]
  },
  {
    id: "avoid-hanging-pieces",
    name: "Avoid Hanging Pieces",
    category: TEMPLATE_CATEGORIES.DEFENSE,
    description: "Discourage moves that leave pieces hanging.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Avoid Hanging Pieces",
        notes: ""
      }
    },
    {
      key: "condition_110620",
      type: "condition",
      position: {
        x: 18.328125,
        y: 200.015625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "captured_piece",
        subjectFilter: "any",
        operator: "count",
        comparator: "equal_to",
        target: "exact_number",
        targetTotal: 0
      }
    },
    {
      key: "condition_110623",
      type: "condition",
      position: {
        x: 18.859375,
        y: 405.1875
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "any",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110625",
      type: "condition",
      position: {
        x: 22.78125,
        y: 601.46875
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "action_110626",
      type: "action",
      position: {
        x: 18.359375,
        y: 807.9375
      },
      data: {
        actionType: "subtract",
        value: 20
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110620"
    },
    {
      source: "condition_110620",
      target: "condition_110623"
    },
    {
      source: "condition_110623",
      target: "condition_110625"
    },
    {
      source: "condition_110625",
      target: "action_110626"
    }
  ]
  },
  {
    id: "escape-check-safely",
    name: "Escape Check Safely",
    category: TEMPLATE_CATEGORIES.DEFENSE,
    description: "Prefer safe replies when escaping check-like danger.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Escape Check Safely",
        notes: ""
      }
    },
    {
      key: "condition_110690",
      type: "condition",
      position: {
        x: 18.453125,
        y: 208.234375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "allied",
        targetFilter: "king",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "less_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110692",
      type: "condition",
      position: {
        x: 256.421875,
        y: 357.265625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "major",
        targetFilterMode: "exclude"
      }
    },
    {
      key: "condition_110745",
      type: "condition",
      position: {
        x: -141.0,
        y: 373.328125
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "captured_piece",
        subjectFilter: "any",
        operator: "count",
        comparator: "greater_than",
        target: "exact_number",
        targetTotal: 0
      }
    },
    {
      key: "condition_110742",
      type: "condition",
      position: {
        x: 115.640625,
        y: 407.5
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "pawn",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110739",
      type: "condition",
      position: {
        x: -0.546875,
        y: 523.4375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "major",
        targetFilterMode: "exclude"
      }
    },
    {
      key: "condition_110746",
      type: "condition",
      position: {
        x: -268.078125,
        y: 526.890625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110920",
      type: "condition",
      position: {
        x: 255.171875,
        y: 561.90625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "king",
        operator: "count",
        comparator: "greater_than",
        target: "exact_number",
        subjectFilterMode: "include",
        targetTotal: 0
      }
    },
    {
      key: "condition_110614",
      type: "condition",
      position: {
        x: -144.21875,
        y: 611.21875
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "value",
        comparator: "less_than",
        target: "captured_piece",
        targetFilter: "any"
      }
    },
    {
      key: "action_110744",
      type: "action",
      position: {
        x: 110.5625,
        y: 637.25
      },
      data: {
        actionType: "add",
        value: 10
      }
    },
    {
      key: "action_110740",
      type: "action",
      position: {
        x: -3.546875,
        y: 752.796875
      },
      data: {
        actionType: "add",
        value: 20
      }
    },
    {
      key: "action_110734",
      type: "action",
      position: {
        x: -273.546875,
        y: 759.453125
      },
      data: {
        actionType: "add",
        value: 100
      }
    },
    {
      key: "action_110691",
      type: "action",
      position: {
        x: 251.53125,
        y: 766.359375
      },
      data: {
        actionType: "add",
        value: 5
      }
    },
    {
      key: "action_110615",
      type: "action",
      position: {
        x: -146.3125,
        y: 820.8125
      },
      data: {
        actionType: "add",
        value: 30
      }
    }
  ],
    connections: [
    {
      source: "condition_110614",
      target: "action_110615"
    },
    {
      source: "organizer",
      target: "condition_110690"
    },
    {
      source: "condition_110690",
      target: "condition_110692"
    },
    {
      source: "condition_110690",
      target: "condition_110742"
    },
    {
      source: "condition_110690",
      target: "condition_110745"
    },
    {
      source: "condition_110739",
      target: "action_110740"
    },
    {
      source: "condition_110742",
      target: "action_110744"
    },
    {
      source: "condition_110745",
      target: "condition_110746"
    },
    {
      source: "condition_110745",
      target: "condition_110739"
    },
    {
      source: "condition_110745",
      target: "condition_110614"
    },
    {
      source: "condition_110746",
      target: "action_110734"
    },
    {
      source: "condition_110692",
      target: "condition_110920"
    },
    {
      source: "condition_110920",
      target: "action_110691"
    }
  ]
  },
  {
    id: "hide-from-attacks",
    name: "Hide From Attacks",
    category: TEMPLATE_CATEGORIES.DEFENSE,
    description: "Reward moving away from enemy attacks.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Hide From Attacks",
        notes: ""
      }
    },
    {
      key: "condition_110695",
      type: "condition",
      position: {
        x: 17.71875,
        y: 202.234375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy_moved_piece",
        subjectFilter: "any",
        operator: "attack",
        target: "allied",
        targetFilter: "pawn",
        targetFilterMode: "exclude"
      }
    },
    {
      key: "action_110694",
      type: "action",
      position: {
        x: 8.65625,
        y: 468.34375
      },
      data: {
        actionType: "subtract",
        value: 5
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110695"
    },
    {
      source: "condition_110695",
      target: "action_110694"
    }
  ]
  },
  {
    id: "pawns-protect-majors",
    name: "Pawns Protect Majors",
    category: TEMPLATE_CATEGORIES.DEFENSE,
    description: "Encourage pawn structures that protect major pieces.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Pawns Protect Majors",
        notes: ""
      }
    },
    {
      key: "condition_110916",
      type: "condition",
      position: {
        x: 121.671875,
        y: 178.15625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "pawn",
        operator: "shield",
        target: "allied",
        targetFilter: "major",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "less_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110913",
      type: "condition",
      position: {
        x: -63.484375,
        y: 208.984375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "pawn",
        operator: "cover",
        target: "allied",
        targetFilter: "major",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "less_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110917",
      type: "action",
      position: {
        x: 122.71875,
        y: 388.34375
      },
      data: {
        actionType: "subtract",
        value: 10
      }
    },
    {
      key: "action_110914",
      type: "action",
      position: {
        x: -68.59375,
        y: 409.234375
      },
      data: {
        actionType: "subtract",
        value: 1
      }
    }
  ],
    connections: [
    {
      source: "condition_110913",
      target: "action_110914"
    },
    {
      source: "organizer",
      target: "condition_110913"
    },
    {
      source: "organizer",
      target: "condition_110916"
    },
    {
      source: "condition_110916",
      target: "action_110917"
    }
  ]
  }
]
