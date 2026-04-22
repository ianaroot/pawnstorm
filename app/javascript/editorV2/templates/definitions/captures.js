import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const CAPTURE_TEMPLATES = [
  {
    id: "any-capture",
    name: "Any Capture",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Give a simple bonus to any move that captures material.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Any Capture",
        notes: ""
      }
    },
    {
      key: "condition_110737",
      type: "condition",
      position: {
        x: 12.0,
        y: 160.0
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
      key: "action_110728",
      type: "action",
      position: {
        x: 8.0,
        y: 320.0
      },
      data: {
        actionType: "add",
        value: 3
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110737"
    },
    {
      source: "condition_110737",
      target: "action_110728"
    }
  ]
  },
  {
    id: "winning-capture",
    name: "Winning Capture",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Reward captures that win material compared with the moved piece.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Winning Capture",
        notes: ""
      }
    },
    {
      key: "condition_110736",
      type: "condition",
      position: {
        x: 23.21242555184881,
        y: 225.33379540624355
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "captured_piece",
        subjectFilter: "any",
        operator: "value",
        comparator: "greater_than",
        target: "moved_piece",
        targetFilter: "any"
      }
    },
    {
      key: "action_110730",
      type: "action",
      position: {
        x: 19.21242555184881,
        y: 451.91598348438674
      },
      data: {
        actionType: "add",
        value: 50
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110736"
    },
    {
      source: "condition_110736",
      target: "action_110730"
    }
  ]
  },
  {
    id: "free-capture",
    name: "Free Capture",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Reward captures that appear safe or low-risk.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Free Capture",
        notes: ""
      }
    },
    {
      key: "condition_110610",
      type: "condition",
      position: {
        x: 21.9375,
        y: 193.90625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "captured_piece",
        subjectFilter: "any",
        operator: "count",
        comparator: "equal_to",
        target: "exact_number",
        targetTotal: 1
      }
    },
    {
      key: "condition_110611",
      type: "condition",
      position: {
        x: 25.109375,
        y: 416.390625
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
      key: "action_110612",
      type: "action",
      position: {
        x: 24.078125,
        y: 689.75
      },
      data: {
        actionType: "add",
        value: 60
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110610"
    },
    {
      source: "condition_110610",
      target: "condition_110611"
    },
    {
      source: "condition_110611",
      target: "action_110612"
    }
  ]
  },
  {
    id: "recapture",
    name: "Recapture",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Reward recapturing after the opponent has taken material.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Recapture",
        notes: ""
      }
    },
    {
      key: "condition_110638",
      type: "condition",
      position: {
        x: 18.421875,
        y: 215.046875
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "enemy_captured_piece",
        subjectFilter: "any",
        operator: "count",
        comparator: "equal_to",
        target: "exact_number",
        targetTotal: 1
      }
    },
    {
      key: "condition_110639",
      type: "condition",
      position: {
        x: 14.203125,
        y: 426.703125
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy_moved_piece",
        subjectFilter: "any",
        operator: "same_piece",
        target: "captured_piece",
        targetFilter: "any"
      }
    },
    {
      key: "condition_110640",
      type: "condition",
      position: {
        x: 8.59375,
        y: 632.109375
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "enemy_moved_piece",
        subjectFilter: "any",
        operator: "value",
        comparator: "greater_than",
        target: "enemy_captured_piece",
        targetFilter: "any"
      }
    },
    {
      key: "action_110642",
      type: "action",
      position: {
        x: -5.1875,
        y: 857.734375
      },
      data: {
        actionType: "add",
        value: 15
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110638"
    },
    {
      source: "condition_110638",
      target: "condition_110639"
    },
    {
      source: "condition_110639",
      target: "condition_110640"
    },
    {
      source: "condition_110640",
      target: "action_110642"
    }
  ]
  },
  {
    id: "kick-material",
    name: "Kick Material",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Reward moves that attack or pressure valuable enemy material.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Kick Material",
        notes: ""
      }
    },
    {
      key: "condition_110892",
      type: "condition",
      position: {
        x: 20.15625,
        y: 195.546875
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "pawn",
        operator: "attack",
        target: "enemy",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "exclude"
      }
    },
    {
      key: "condition_110890",
      type: "condition",
      position: {
        x: -68.40625,
        y: 408.5
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
      key: "condition_110896",
      type: "condition",
      position: {
        x: 110.25,
        y: 420.296875
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "pawn",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "include"
      }
    },
    {
      key: "action_110895",
      type: "action",
      position: {
        x: 18.03125,
        y: 643.453125
      },
      data: {
        actionType: "add",
        value: 15
      }
    }
  ],
    connections: [
    {
      source: "condition_110890",
      target: "action_110895"
    },
    {
      source: "condition_110892",
      target: "condition_110896"
    },
    {
      source: "condition_110892",
      target: "condition_110890"
    },
    {
      source: "organizer",
      target: "condition_110892"
    },
    {
      source: "condition_110896",
      target: "action_110895"
    }
  ]
  },
  {
    id: "even-trade",
    name: "Even Trade",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Encourage trades that exchange comparable material.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Even Trade",
        notes: ""
      }
    },
    {
      key: "condition_110908",
      type: "condition",
      position: {
        x: 141.75,
        y: 224.28125
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "captured_piece",
        subjectFilter: "any",
        operator: "value",
        comparator: "greater_than_or_equal_to",
        target: "moved_piece",
        targetFilter: "any"
      }
    },
    {
      key: "condition_110906",
      type: "condition",
      position: {
        x: -92.8125,
        y: 225.53125
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "any",
        targetComparisonMetric: "value",
        targetComparator: "greater_than_or_equal_to",
        targetComparisonSource: "moved_piece"
      }
    },
    {
      key: "condition_110911",
      type: "condition",
      position: {
        x: -89.265625,
        y: 433.984375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "any"
      }
    },
    {
      key: "action_110910",
      type: "action",
      position: {
        x: 138.265625,
        y: 454.34375
      },
      data: {
        actionType: "add",
        value: 12
      }
    },
    {
      key: "action_110909",
      type: "action",
      position: {
        x: -97.375,
        y: 631.8125
      },
      data: {
        actionType: "add",
        value: 14
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110906"
    },
    {
      source: "organizer",
      target: "condition_110908"
    },
    {
      source: "condition_110908",
      target: "action_110910"
    },
    {
      source: "condition_110906",
      target: "condition_110911"
    },
    {
      source: "condition_110911",
      target: "action_110909"
    }
  ]
  },
  {
    id: "winning",
    name: "Winning",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Reward move patterns that improve a winning material position.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Winning",
        notes: ""
      }
    },
    {
      key: "condition_110904",
      type: "condition",
      position: {
        x: 106.546875,
        y: 207.390625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "allied",
        subjectFilter: "major",
        operator: "value",
        comparator: "greater_than",
        target: "enemy",
        subjectFilterMode: "include",
        targetFilter: "major",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110903",
      type: "condition",
      position: {
        x: -70.40625,
        y: 213.265625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "allied",
        subjectFilter: "minor",
        operator: "count",
        comparator: "greater_than",
        target: "enemy",
        subjectFilterMode: "include",
        targetFilter: "minor",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110905",
      type: "condition",
      position: {
        x: 24.65625,
        y: 424.5
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "allied",
        subjectFilter: "any",
        operator: "value",
        comparator: "greater_than",
        target: "enemy",
        targetFilter: "any"
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110903"
    },
    {
      source: "organizer",
      target: "condition_110904"
    },
    {
      source: "condition_110903",
      target: "condition_110905"
    },
    {
      source: "condition_110904",
      target: "condition_110905"
    }
  ]
  },
  {
    id: "winning-attack",
    name: "Winning Attack",
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: "Reward attacking continuations when the bot is already winning.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Winning Attack",
        notes: ""
      }
    },
    {
      key: "condition_110851",
      type: "condition",
      position: {
        x: 24.03125,
        y: 214.578125
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "any",
        targetComparisonMetric: "value",
        targetComparator: "greater_than",
        targetComparisonSource: "moved_piece"
      }
    },
    {
      key: "action_110852",
      type: "action",
      position: {
        x: 27.953125,
        y: 443.703125
      },
      data: {
        actionType: "add",
        value: 4
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110851"
    },
    {
      source: "condition_110851",
      target: "action_110852"
    }
  ]
  }
]
