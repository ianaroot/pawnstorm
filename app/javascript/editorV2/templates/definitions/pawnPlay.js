import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const PAWN_PLAY_TEMPLATES = [
  {
    id: "push-safe-pawns",
    name: "Push Safe Pawns",
    category: TEMPLATE_CATEGORIES.PAWN_PLAY,
    description: "Reward pawn pushes that do not create obvious tactical problems.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Push Safe Pawns",
        notes: ""
      }
    },
    {
      key: "condition_110849",
      type: "condition",
      position: {
        x: 409.01562499999955,
        y: 177.84765625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "pawn",
        operator: "defend",
        target: "allied",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110605",
      type: "condition",
      position: {
        x: -213.84375000000045,
        y: 186.873046875
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
      key: "condition_110688",
      type: "condition",
      position: {
        x: 262.9843749999998,
        y: 191.5
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "king",
        operator: "defend",
        target: "allied",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "greater_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110646",
      type: "condition",
      position: {
        x: 103.62499999999977,
        y: 195.15625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "pawn",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110644",
      type: "condition",
      position: {
        x: -60.9375,
        y: 199.5
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "defend",
        target: "allied",
        targetFilter: "pawn",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110606",
      type: "score",
      position: {
        x: 55.67187499999977,
        y: 489.326171875
      },
      data: {
        actionType: "return",
        value: 7
      }
    }
  ],
    connections: [
    {
      source: "condition_110605",
      target: "action_110606"
    },
    {
      source: "organizer",
      target: "condition_110605"
    },
    {
      source: "organizer",
      target: "condition_110644"
    },
    {
      source: "organizer",
      target: "condition_110646"
    },
    {
      source: "organizer",
      target: "condition_110688"
    },
    {
      source: "condition_110644",
      target: "action_110606"
    },
    {
      source: "condition_110646",
      target: "action_110606"
    },
    {
      source: "condition_110688",
      target: "action_110606"
    },
    {
      source: "organizer",
      target: "condition_110849"
    },
    {
      source: "condition_110849",
      target: "action_110606"
    }
  ]
  },
  {
    id: "attack-pawns",
    name: "Attack Pawns",
    category: TEMPLATE_CATEGORIES.PAWN_PLAY,
    description: "Reward attacks against enemy pawns.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Attack Pawns",
        notes: ""
      }
    },
    {
      key: "condition_110641",
      type: "condition",
      position: {
        x: -170.18750000000023,
        y: 183.515625
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
      key: "condition_110846",
      type: "condition",
      position: {
        x: 156.04687499999977,
        y: 199.1875
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "pawn",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110627",
      type: "condition",
      position: {
        x: 22.234374999999773,
        y: 405.0625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "captured_piece",
        subjectFilter: "pawn",
        operator: "count",
        comparator: "equal_to",
        target: "exact_number",
        subjectFilterMode: "include",
        targetTotal: 1
      }
    },
    {
      key: "condition_110635",
      type: "condition",
      position: {
        x: -168.57812500000023,
        y: 417.71875
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "pawn",
        operator: "attack",
        target: "enemy",
        targetFilter: "pawn",
        subjectFilterMode: "exclude",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110847",
      type: "condition",
      position: {
        x: 159.98437499999977,
        y: 423.84375
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
      key: "action_110848",
      type: "score",
      position: {
        x: 145.07812499999977,
        y: 632.609375
      },
      data: {
        actionType: "add",
        value: 19
      }
    },
    {
      key: "action_110621",
      type: "score",
      position: {
        x: 24.296874999999773,
        y: 643.953125
      },
      data: {
        actionType: "add",
        value: 16
      }
    },
    {
      key: "action_110643",
      type: "score",
      position: {
        x: -179.46875000000023,
        y: 648.5
      },
      data: {
        actionType: "add",
        value: 15
      }
    }
  ],
    connections: [
    {
      source: "condition_110627",
      target: "action_110621"
    },
    {
      source: "organizer",
      target: "condition_110641"
    },
    {
      source: "condition_110635",
      target: "action_110643"
    },
    {
      source: "condition_110641",
      target: "condition_110635"
    },
    {
      source: "condition_110846",
      target: "condition_110847"
    },
    {
      source: "condition_110847",
      target: "action_110848"
    },
    {
      source: "condition_110641",
      target: "condition_110627"
    },
    {
      source: "organizer",
      target: "condition_110846"
    }
  ]
  },
  {
    id: "improve-pawn-mobility",
    name: "Improve Pawn Mobility",
    category: TEMPLATE_CATEGORIES.PAWN_PLAY,
    description: "Reward pawn moves that improve pawn mobility.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Improve Pawn Mobility",
        notes: ""
      }
    },
    {
      key: "condition_110900",
      type: "condition",
      position: {
        x: -61.02978923885985,
        y: 199.00119091772285
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "pawn",
        operator: "defend",
        target: "allied",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "greater_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110899",
      type: "condition",
      position: {
        x: 119.59259540392486,
        y: 201.2183743637761
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "pawn",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "greater_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110898",
      type: "score",
      position: {
        x: 29.784442484365172,
        y: 396.46665136532647
      },
      data: {
        actionType: "add",
        value: 5
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110899"
    },
    {
      source: "organizer",
      target: "condition_110900"
    },
    {
      source: "condition_110899",
      target: "action_110898"
    },
    {
      source: "condition_110900",
      target: "action_110898"
    }
  ]
  },
  {
    id: "discourage-pawn-roaming",
    name: "Discourage Pawn Roaming",
    category: TEMPLATE_CATEGORIES.PAWN_PLAY,
    description: "Discourage pawn movement that wanders away from useful structure.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Discourage Pawn Roaming",
        notes: ""
      }
    },
    {
      key: "condition_110707",
      type: "condition",
      position: {
        x: 28.0,
        y: 176.234375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "pawn",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "action_110703",
      type: "score",
      position: {
        x: 25.1875,
        y: 382.59375
      },
      data: {
        actionType: "subtract",
        value: 1
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110707"
    },
    {
      source: "condition_110707",
      target: "action_110703"
    }
  ]
  },
  {
    id: "avoid-pawn-attacks",
    name: "Avoid Pawn Attacks",
    category: TEMPLATE_CATEGORIES.PAWN_PLAY,
    description: "Discourage moves that leave the moved piece attacked by enemy pawns.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Avoid Pawn Attacks",
        notes: ""
      }
    },
    {
      key: "condition_110733",
      type: "condition",
      position: {
        x: 29.069995683935304,
        y: 209.55310310884852
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "exclude"
      }
    },
    {
      key: "action_110729",
      type: "score",
      position: {
        x: 23.866870683935304,
        y: 416.35140761454204
      },
      data: {
        actionType: "subtract",
        value: 8
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110733"
    },
    {
      source: "condition_110733",
      target: "action_110729"
    }
  ]
  },
  {
    id: "safe-promotion",
    name: "Safe Promotion",
    category: TEMPLATE_CATEGORIES.PAWN_PLAY,
    description: "Reward promotion pushes that appear safe.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Safe Promotion",
        notes: ""
      }
    },
    {
      key: "condition_110629",
      type: "condition",
      position: {
        x: 18.53125,
        y: 192.15625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "value",
        comparator: "greater_than",
        target: "prior_board_state"
      }
    },
    {
      key: "condition_110630",
      type: "condition",
      position: {
        x: 10.828125,
        y: 402.1875
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
      key: "action_110631",
      type: "score",
      position: {
        x: 8.859375,
        y: 623.171875
      },
      data: {
        actionType: "add",
        value: 30
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110629"
    },
    {
      source: "condition_110629",
      target: "condition_110630"
    },
    {
      source: "condition_110630",
      target: "action_110631"
    }
  ]
  }
]
