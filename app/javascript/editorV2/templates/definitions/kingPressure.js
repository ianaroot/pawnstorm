import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const KING_PRESSURE_TEMPLATES = [
  {
    id: "checkmate",
    name: "Checkmate",
    category: TEMPLATE_CATEGORIES.KING_PRESSURE,
    description: "Return hard for moves that appear to leave the enemy king checkmated.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Checkmate",
        notes: ""
      }
    },
    {
      key: "condition_110714",
      type: "condition",
      position: {
        x: 0.0,
        y: 160.0
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "king",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110720",
      type: "condition",
      position: {
        x: 0.0,
        y: 320.0
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "enemy",
        subjectFilter: "any",
        operator: "mobility",
        comparator: "equal_to",
        target: "exact_number",
        targetTotal: 0
      }
    },
    {
      key: "action_110715",
      type: "score",
      position: {
        x: 0.0,
        y: 480.0
      },
      data: {
        actionType: "return",
        value: 1000
      }
    }
  ],
    connections: [
    {
      source: "condition_110714",
      target: "condition_110720"
    },
    {
      source: "organizer",
      target: "condition_110714"
    },
    {
      source: "condition_110720",
      target: "action_110715"
    }
  ]
  },
  {
    id: "direct-king-pressure",
    name: "Direct King Pressure",
    category: TEMPLATE_CATEGORIES.KING_PRESSURE,
    description: "Reward direct attacks or pressure against the enemy king.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Direct King Pressure",
        notes: ""
      }
    },
    {
      key: "condition_110893",
      type: "condition",
      position: {
        x: -72.88562201782042,
        y: 183.04823112303802
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "king",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110885",
      type: "condition",
      position: {
        x: 132.77004526622295,
        y: 440.51606001439905
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110888",
      type: "condition",
      position: {
        x: -68.89175689457988,
        y: 529.9162458170376
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
      key: "condition_110889",
      type: "condition",
      position: {
        x: 133.5256407261304,
        y: 658.6815808280735
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
      key: "action_110891",
      type: "score",
      position: {
        x: 25.041191875351615,
        y: 831.9588105531411
      },
      data: {
        actionType: "add",
        value: 15
      }
    }
  ],
    connections: [
    {
      source: "condition_110885",
      target: "condition_110889"
    },
    {
      source: "condition_110893",
      target: "condition_110885"
    },
    {
      source: "organizer",
      target: "condition_110893"
    },
    {
      source: "condition_110889",
      target: "action_110891"
    },
    {
      source: "condition_110888",
      target: "action_110891"
    },
    {
      source: "condition_110893",
      target: "condition_110888"
    }
  ]
  },
  {
    id: "tighten-the-net",
    name: "Tighten The Net",
    category: TEMPLATE_CATEGORIES.KING_PRESSURE,
    description: "Reward moves that reduce enemy king mobility.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Tighten The Net",
        notes: ""
      }
    },
    {
      key: "condition_110805",
      type: "condition",
      position: {
        x: 20.025612355319936,
        y: 171.66871075418157
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "enemy",
        subjectFilter: "king",
        subjectFilterMode: "include",
        operator: "mobility",
        comparator: "less_than",
        target: "prior_board_state"
      }
    },
    {
      key: "condition_110811",
      type: "condition",
      position: {
        x: 109.06736977556557,
        y: 367.7109775967697
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110810",
      type: "condition",
      position: {
        x: -58.55901739440742,
        y: 368.57407143536284
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "pawn",
        operator: "count",
        comparator: "equal_to",
        subjectFilterMode: "include",
        target: "exact_number",
        targetTotal: 1
      }
    },
    {
      key: "condition_110799",
      type: "condition",
      position: {
        x: -62.24986362200434,
        y: 600.6798494179166
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
      key: "condition_110802",
      type: "condition",
      position: {
        x: 109.64690801166944,
        y: 601.3607821409723
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
      key: "action_110809",
      type: "score",
      position: {
        x: 29.476133178335658,
        y: 787.6592292783812
      },
      data: {
        actionType: "add",
        value: 17
      }
    }
  ],
    connections: [
    {
      source: "condition_110799",
      target: "action_110809"
    },
    {
      source: "condition_110802",
      target: "action_110809"
    },
    {
      source: "condition_110805",
      target: "condition_110810"
    },
    {
      source: "condition_110805",
      target: "condition_110811"
    },
    {
      source: "organizer",
      target: "condition_110805"
    },
    {
      source: "condition_110810",
      target: "condition_110802"
    },
    {
      source: "condition_110810",
      target: "condition_110799"
    },
    {
      source: "condition_110811",
      target: "condition_110802"
    },
    {
      source: "condition_110811",
      target: "condition_110799"
    }
  ]
  },
  {
    id: "strip-king-shelter",
    name: "Strip King Shelter",
    category: TEMPLATE_CATEGORIES.KING_PRESSURE,
    description: "Reward moves that remove or pressure pieces sheltering the enemy king.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Strip King Shelter",
        notes: ""
      }
    },
    {
      key: "condition_110882",
      type: "condition",
      position: {
        x: 18.48613179531003,
        y: 174.0992975514464
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
      key: "condition_110901",
      type: "condition",
      position: {
        x: 21.026377114962088,
        y: 380.01348968428465
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "shield",
        target: "enemy",
        targetFilter: "king",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "less_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110886",
      type: "condition",
      position: {
        x: 142.28902240322986,
        y: 520.5105963850383
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110884",
      type: "condition",
      position: {
        x: -66.4233505775992,
        y: 640.5095698215209
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
      key: "condition_110881",
      type: "condition",
      position: {
        x: 142.78122971946232,
        y: 729.929889731362
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
      key: "action_110880",
      type: "score",
      position: {
        x: 42.07454278703244,
        y: 883.2592032437497
      },
      data: {
        actionType: "add",
        value: 18
      }
    }
  ],
    connections: [
    {
      source: "condition_110882",
      target: "condition_110901"
    },
    {
      source: "condition_110881",
      target: "action_110880"
    },
    {
      source: "condition_110886",
      target: "condition_110881"
    },
    {
      source: "organizer",
      target: "condition_110882"
    },
    {
      source: "condition_110901",
      target: "condition_110884"
    },
    {
      source: "condition_110901",
      target: "condition_110886"
    },
    {
      source: "condition_110884",
      target: "action_110880"
    }
  ]
  }
]
