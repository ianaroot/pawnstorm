import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const OPENING_TEMPLATES = [
  {
    id: "opening-game-condition",
    name: "Opening Game Condition",
    category: TEMPLATE_CATEGORIES.OPENING,
    description: "Detect an early opening state by checking that both sides still have high material.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Opening Game Condition",
        notes: ""
      }
    },
    {
      key: "condition_110771",
      type: "condition",
      position: {
        x: 20.475150769315405,
        y: 266.70397787031743
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "allied",
        subjectFilter: "any",
        operator: "value",
        comparator: "greater_than",
        target: "exact_number",
        targetTotal: 34
      }
    },
    {
      key: "condition_110772",
      type: "condition",
      position: {
        x: 21.342648741015182,
        y: 483.86459223170186
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "enemy",
        subjectFilter: "any",
        operator: "value",
        comparator: "greater_than",
        target: "exact_number",
        targetTotal: 34
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110771"
    },
    {
      source: "condition_110771",
      target: "condition_110772"
    }
  ]
  },
  {
    id: "safe-knight-development",
    name: "Safe Knight Development",
    category: TEMPLATE_CATEGORIES.OPENING,
    description: "Reward knight development that improves the moved knight without walking into danger.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Safe Knight Development",
        notes: ""
      }
    },
    {
      key: "condition_110636",
      type: "condition",
      position: {
        x: 3.116999160173691,
        y: 200.87959846118065
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "knight",
        subjectFilterMode: "include",
        operator: "mobility",
        comparator: "greater_than",
        target: "prior_board_state"
      }
    },
    {
      key: "condition_110682",
      type: "condition",
      position: {
        x: -2.890862089779148,
        y: 402.27505117977535
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
        subjectComparator: "greater_than",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 1
      }
    },
    {
      key: "condition_110659",
      type: "condition",
      position: {
        x: -119.76975788830987,
        y: 585.2489986790724
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "exclude"
      }
    },
    {
      key: "condition_110763",
      type: "condition",
      position: {
        x: 89.98940280496026,
        y: 695.1651124102991
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
      key: "condition_110670",
      type: "condition",
      position: {
        x: -121.64862462576639,
        y: 790.6824672451867
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
      key: "action_110671",
      type: "action",
      position: {
        x: -10.372618585035525,
        y: 983.7982075999153
      },
      data: {
        actionType: "add",
        value: 10
      }
    }
  ],
    connections: [
    {
      source: "condition_110636",
      target: "condition_110682"
    },
    {
      source: "condition_110659",
      target: "condition_110670"
    },
    {
      source: "condition_110670",
      target: "action_110671"
    },
    {
      source: "organizer",
      target: "condition_110636"
    },
    {
      source: "condition_110682",
      target: "condition_110659"
    },
    {
      source: "condition_110682",
      target: "condition_110763"
    },
    {
      source: "condition_110763",
      target: "action_110671"
    }
  ]
  },
  {
    id: "safe-bishop-development",
    name: "Safe Bishop Development",
    category: TEMPLATE_CATEGORIES.OPENING,
    description: "Reward bishop development that improves the moved bishop without walking into danger.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Safe Bishop Development",
        notes: ""
      }
    },
    {
      key: "condition_110768",
      type: "condition",
      position: {
        x: 19.081999032612202,
        y: 197.84092953871004
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "bishop",
        operator: "mobility",
        comparator: "greater_than",
        subjectFilterMode: "include",
        target: "prior_board_state"
      }
    },
    {
      key: "condition_110767",
      type: "condition",
      position: {
        x: 13.074137782659363,
        y: 399.23638225730474
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
      key: "condition_110765",
      type: "condition",
      position: {
        x: -103.8047580158709,
        y: 582.2103297566018
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "exclude",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110770",
      type: "condition",
      position: {
        x: 105.95440267739878,
        y: 692.1264434878285
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
      key: "condition_110769",
      type: "condition",
      position: {
        x: -105.68362475332697,
        y: 787.6437983227161
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectFilterMode: "include",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110766",
      type: "action",
      position: {
        x: 5.592381287402986,
        y: 980.7595386774447
      },
      data: {
        actionType: "add",
        value: 10
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110768"
    },
    {
      source: "condition_110765",
      target: "condition_110769"
    },
    {
      source: "condition_110767",
      target: "condition_110765"
    },
    {
      source: "condition_110767",
      target: "condition_110770"
    },
    {
      source: "condition_110768",
      target: "condition_110767"
    },
    {
      source: "condition_110769",
      target: "action_110766"
    },
    {
      source: "condition_110770",
      target: "action_110766"
    }
  ]
  },
  {
    id: "castling",
    name: "Castling",
    category: TEMPLATE_CATEGORIES.OPENING,
    description: "Approximate castling intent by rewarding king movement toward allied rook structure.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Castling",
        notes: ""
      }
    },
    {
      key: "condition_110757",
      type: "condition",
      position: {
        x: -215.46761122930684,
        y: 152.08950430719233
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "king",
        operator: "adjacent",
        target: "allied",
        targetFilter: "rook",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "equal_to",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110750",
      type: "condition",
      position: {
        x: 303.8514763525395,
        y: 156.1024742572381
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "king",
        operator: "adjacent",
        target: "allied",
        targetFilter: "rook",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "equal_to",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 1
      }
    },
    {
      key: "condition_110751",
      type: "condition",
      position: {
        x: 19.58179756772961,
        y: 200.3122850180289
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
      key: "condition_110756",
      type: "condition",
      position: {
        x: 306.13969391472483,
        y: 336.89341031984486
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "rook",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "king",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110758",
      type: "action",
      position: {
        x: -218.51500578220612,
        y: 379.0384788864885
      },
      data: {
        actionType: "subtract",
        value: 5
      }
    },
    {
      key: "condition_110754",
      type: "condition",
      position: {
        x: 21.468435469421365,
        y: 386.2718946038917
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "mobility",
        comparator: "greater_than",
        target: "prior_board_state"
      }
    },
    {
      key: "condition_110617",
      type: "condition",
      position: {
        x: 312.1016930594833,
        y: 542.3532827740723
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "king",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "king",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110755",
      type: "condition",
      position: {
        x: 17.565097153736133,
        y: 604.7997879707154
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "bishop",
        operator: "adjacent",
        target: "allied",
        targetFilter: "queen",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "less_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110749",
      type: "condition",
      position: {
        x: -121.691649983959,
        y: 606.0367371777534
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "bishop",
        operator: "adjacent",
        target: "allied",
        targetFilter: "king",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "less_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110753",
      type: "condition",
      position: {
        x: 149.4091005182845,
        y: 609.6615504172032
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "knight",
        operator: "adjacent",
        target: "allied",
        targetFilter: "rook",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "less_than",
        targetComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110622",
      type: "condition",
      position: {
        x: 311.7579430594833,
        y: 732.3845327740723
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "allied",
        targetFilter: "rook",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "action_110752",
      type: "action",
      position: {
        x: 14.82761609744739,
        y: 828.0238368787527
      },
      data: {
        actionType: "add",
        value: 10
      }
    },
    {
      key: "action_110624",
      type: "action",
      position: {
        x: 307.3829430594833,
        y: 961.0876577740723
      },
      data: {
        actionType: "add",
        value: 12
      }
    }
  ],
    connections: [
    {
      source: "condition_110617",
      target: "condition_110622"
    },
    {
      source: "condition_110622",
      target: "action_110624"
    },
    {
      source: "organizer",
      target: "condition_110751"
    },
    {
      source: "organizer",
      target: "condition_110750"
    },
    {
      source: "organizer",
      target: "condition_110757"
    },
    {
      source: "condition_110749",
      target: "action_110752"
    },
    {
      source: "condition_110750",
      target: "condition_110756"
    },
    {
      source: "condition_110751",
      target: "condition_110754"
    },
    {
      source: "condition_110753",
      target: "action_110752"
    },
    {
      source: "condition_110754",
      target: "condition_110749"
    },
    {
      source: "condition_110754",
      target: "condition_110753"
    },
    {
      source: "condition_110754",
      target: "condition_110755"
    },
    {
      source: "condition_110755",
      target: "action_110752"
    },
    {
      source: "condition_110756",
      target: "condition_110617"
    },
    {
      source: "condition_110757",
      target: "action_110758"
    }
  ]
  },
  {
    id: "queen-safety",
    name: "Queen Safety",
    category: TEMPLATE_CATEGORIES.OPENING,
    description: "Discourage early queen movement or exposed queen placement.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Queen Safety",
        notes: ""
      }
    },
    {
      key: "condition_110653",
      type: "condition",
      position: {
        x: -189.96875,
        y: 263.3125
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "queen",
        operator: "attack",
        target: "enemy",
        targetFilter: "any",
        subjectFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "equal_to",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110655",
      type: "condition",
      position: {
        x: 192.89772727272725,
        y: 269.805752840909
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "queen",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "less_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110747",
      type: "condition",
      position: {
        x: 378.17897727272725,
        y: 282.78799715909076
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "queen",
        operator: "attack",
        target: "enemy",
        targetFilter: "king",
        subjectFilterMode: "include",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110648",
      type: "condition",
      position: {
        x: 25.578125,
        y: 285.0
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "queen",
        targetFilterMode: "include"
      }
    },
    {
      key: "condition_110656",
      type: "condition",
      position: {
        x: 192.92897727272725,
        y: 480.102627840909
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "queen",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110654",
      type: "condition",
      position: {
        x: -195.765625,
        y: 480.71875
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
      key: "condition_110735",
      type: "condition",
      position: {
        x: 368.85085227272725,
        y: 487.28373579545473
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
      key: "action_110634",
      type: "action",
      position: {
        x: 15.703125,
        y: 639.984375
      },
      data: {
        actionType: "subtract",
        value: 20
      }
    },
    {
      key: "action_110657",
      type: "action",
      position: {
        x: 190.06960227272725,
        y: 678.462002840909
      },
      data: {
        actionType: "add",
        value: 150
      }
    },
    {
      key: "condition_110738",
      type: "condition",
      position: {
        x: 374.752840909091,
        y: 682.6587357954547
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "king",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "exclude",
        subjectComparisonMetric: "count",
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110741",
      type: "condition",
      position: {
        x: 370.5923295454545,
        y: 881.2453835227275
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
      key: "action_110743",
      type: "action",
      position: {
        x: 376.3948863636365,
        y: 1079.2368607954545
      },
      data: {
        actionType: "add",
        value: 60
      }
    }
  ],
    connections: [
    {
      source: "condition_110648",
      target: "action_110634"
    },
    {
      source: "organizer",
      target: "condition_110653"
    },
    {
      source: "organizer",
      target: "condition_110648"
    },
    {
      source: "organizer",
      target: "condition_110655"
    },
    {
      source: "organizer",
      target: "condition_110747"
    },
    {
      source: "condition_110653",
      target: "condition_110654"
    },
    {
      source: "condition_110654",
      target: "action_110634"
    },
    {
      source: "condition_110655",
      target: "condition_110656"
    },
    {
      source: "condition_110656",
      target: "action_110657"
    },
    {
      source: "condition_110735",
      target: "condition_110738"
    },
    {
      source: "condition_110738",
      target: "condition_110741"
    },
    {
      source: "condition_110741",
      target: "action_110743"
    },
    {
      source: "condition_110747",
      target: "condition_110735"
    }
  ]
  }
]
