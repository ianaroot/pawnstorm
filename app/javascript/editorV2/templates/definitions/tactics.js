import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const TACTIC_TEMPLATES = [
  {
    id: "knight-fork",
    name: "Knight Fork",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward knight moves that fork multiple valuable enemy pieces.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Knight Fork",
        notes: ""
      }
    },
    {
      key: "condition_110702",
      type: "condition",
      position: {
        x: 22.240622415768485,
        y: 265.69921658898056
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "knight",
        operator: "attack",
        target: "enemy",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "exclude",
        targetComparisonMetric: "count",
        targetComparator: "greater_than",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 1
      }
    },
    {
      key: "condition_110719",
      type: "condition",
      position: {
        x: 139.20937241576848,
        y: 406.12109158898056
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
      key: "condition_110716",
      type: "condition",
      position: {
        x: -99.33750258423152,
        y: 409.71484158898056
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
      key: "condition_110722",
      type: "condition",
      position: {
        x: -97.96648578148779,
        y: 592.3413132123806
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
      key: "action_110717",
      type: "score",
      position: {
        x: 129.57873997786191,
        y: 735.5296357903949
      },
      data: {
        actionType: "add",
        value: 30
      }
    }
  ],
    connections: [
    {
      source: "condition_110702",
      target: "condition_110716"
    },
    {
      source: "condition_110702",
      target: "condition_110719"
    },
    {
      source: "organizer",
      target: "condition_110702"
    },
    {
      source: "condition_110716",
      target: "condition_110722"
    },
    {
      source: "condition_110719",
      target: "action_110717"
    },
    {
      source: "condition_110722",
      target: "action_110717"
    }
  ]
  },
  {
    id: "bishop-fork",
    name: "Bishop Fork",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward bishop moves that fork multiple valuable enemy pieces.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Bishop Fork",
        notes: ""
      }
    },
    {
      key: "condition_110773",
      type: "condition",
      position: {
        x: 20.209372415768485,
        y: 215.12109158898056
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "bishop",
        operator: "attack",
        target: "enemy",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "exclude",
        targetComparisonMetric: "count",
        targetComparator: "greater_than",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 1
      }
    },
    {
      key: "condition_110782",
      type: "condition",
      position: {
        x: -117.94687758423152,
        y: 359.76171658898056
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
      key: "condition_110790",
      type: "condition",
      position: {
        x: 155.89687241576848,
        y: 363.91796658898056
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
      key: "condition_110783",
      type: "condition",
      position: {
        x: -115.88836078148779,
        y: 600.6069382123806
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
      key: "action_110779",
      type: "score",
      position: {
        x: 156.42248997786191,
        y: 747.4827607903949
      },
      data: {
        actionType: "add",
        value: 20
      }
    }
  ],
    connections: [
    {
      source: "condition_110773",
      target: "condition_110782"
    },
    {
      source: "condition_110773",
      target: "condition_110790"
    },
    {
      source: "organizer",
      target: "condition_110773"
    },
    {
      source: "condition_110782",
      target: "condition_110783"
    },
    {
      source: "condition_110783",
      target: "action_110779"
    },
    {
      source: "condition_110790",
      target: "action_110779"
    }
  ]
  },
  {
    id: "queen-pin",
    name: "Queen Pin",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward queen moves that create pin-like pressure.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Queen Pin",
        notes: ""
      }
    },
    {
      key: "condition_110789",
      type: "condition",
      position: {
        x: -70.1472794661388,
        y: 174.3057186870933
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "shield",
        target: "enemy",
        targetFilter: "queen",
        subjectFilterMode: "exclude",
        targetFilterMode: "include",
        subjectComparisonMetric: "value",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110582",
      type: "condition",
      position: {
        x: 113.2277898343873,
        y: 175.26010319691977
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "shield",
        target: "enemy",
        targetFilter: "king",
        subjectFilterMode: "exclude",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110794",
      type: "condition",
      position: {
        x: 21.664547168110403,
        y: 365.6933902515607
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
        subjectComparisonSourceTotal: 0,
        targetComparisonMetric: "value",
        targetComparator: "less_than",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 9
      }
    },
    {
      key: "condition_110795",
      type: "condition",
      position: {
        x: -75.13419521062156,
        y: 564.2749008114538
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
        subjectComparator: "less_than",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110796",
      type: "condition",
      position: {
        x: 101.92832068190728,
        y: 567.9883603383855
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
      key: "action_110792",
      type: "score",
      position: {
        x: 22.163980232858194,
        y: 781.0355083729987
      },
      data: {
        actionType: "add",
        value: 15
      }
    }
  ],
    connections: [
    {
      source: "condition_110582",
      target: "condition_110794"
    },
    {
      source: "organizer",
      target: "condition_110789"
    },
    {
      source: "organizer",
      target: "condition_110582"
    },
    {
      source: "condition_110789",
      target: "condition_110794"
    },
    {
      source: "condition_110794",
      target: "condition_110795"
    },
    {
      source: "condition_110794",
      target: "condition_110796"
    },
    {
      source: "condition_110795",
      target: "action_110792"
    },
    {
      source: "condition_110796",
      target: "action_110792"
    }
  ]
  },
  {
    id: "rook-pin",
    name: "Rook Pin",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward rook moves that create pin-like pressure.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Rook Pin",
        notes: ""
      }
    },
    {
      key: "condition_110800",
      type: "condition",
      position: {
        x: 20.777873386738065,
        y: 211.29274614398219
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "pawn",
        operator: "shield",
        target: "enemy",
        targetFilter: "rook",
        subjectFilterMode: "exclude",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110803",
      type: "condition",
      position: {
        x: 31.612409810547433,
        y: 440.34343090494895
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
        subjectComparisonSourceTotal: 0,
        targetComparisonMetric: "value",
        targetComparator: "less_than",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 5
      }
    },
    {
      key: "condition_110806",
      type: "condition",
      position: {
        x: -65.1863325681843,
        y: 638.924941464842
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
        subjectComparator: "less_than",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110798",
      type: "condition",
      position: {
        x: 111.87618332434431,
        y: 642.6384009917738
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
      key: "action_110807",
      type: "score",
      position: {
        x: 32.111842875295224,
        y: 855.685549026387
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
      target: "condition_110800"
    },
    {
      source: "condition_110798",
      target: "action_110807"
    },
    {
      source: "condition_110803",
      target: "condition_110798"
    },
    {
      source: "condition_110803",
      target: "condition_110806"
    },
    {
      source: "condition_110806",
      target: "action_110807"
    },
    {
      source: "condition_110800",
      target: "condition_110803"
    }
  ]
  },
  {
    id: "queen-skewer",
    name: "Queen Skewer",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward queen moves that create skewer-like pressure.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Queen Skewer",
        notes: ""
      }
    },
    {
      key: "condition_110780",
      type: "condition",
      position: {
        x: 16.538411440276832,
        y: 185.50402562717727
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "queen",
        operator: "shield",
        target: "enemy",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "exclude",
        subjectComparisonMetric: "value",
        subjectComparator: "greater_than",
        subjectComparisonSource: "moved_piece"
      }
    },
    {
      key: "condition_110781",
      type: "condition",
      position: {
        x: 18.565400548635807,
        y: 381.09949744558116
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
      key: "condition_110775",
      type: "condition",
      position: {
        x: -68.6766206170389,
        y: 586.1076010837728
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
      key: "condition_110784",
      type: "condition",
      position: {
        x: 135.08615830164558,
        y: 592.2713390150411
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
      key: "action_110791",
      type: "score",
      position: {
        x: 38.58790290557772,
        y: 813.04148202444
      },
      data: {
        actionType: "add",
        value: 15
      }
    }
  ],
    connections: [
    {
      source: "condition_110775",
      target: "action_110791"
    },
    {
      source: "condition_110780",
      target: "condition_110781"
    },
    {
      source: "condition_110781",
      target: "condition_110775"
    },
    {
      source: "condition_110781",
      target: "condition_110784"
    },
    {
      source: "condition_110784",
      target: "action_110791"
    },
    {
      source: "organizer",
      target: "condition_110780"
    }
  ]
  },
  {
    id: "rook-skewer",
    name: "Rook Skewer",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward rook moves that create skewer-like pressure.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Rook Skewer",
        notes: ""
      }
    },
    {
      key: "condition_110785",
      type: "condition",
      position: {
        x: 23.40625,
        y: 186.625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "rook",
        operator: "shield",
        target: "enemy",
        targetFilter: "pawn",
        subjectFilterMode: "include",
        targetFilterMode: "exclude",
        subjectComparisonMetric: "value",
        subjectComparator: "greater_than",
        subjectComparisonSource: "moved_piece"
      }
    },
    {
      key: "condition_110786",
      type: "condition",
      position: {
        x: 20.123721798559927,
        y: 422.8765173447291
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
      key: "condition_110787",
      type: "condition",
      position: {
        x: -67.11829936711501,
        y: 627.8846209829208
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
      key: "condition_110778",
      type: "condition",
      position: {
        x: 136.64447955156993,
        y: 634.0483589141891
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
      key: "action_110777",
      type: "score",
      position: {
        x: 40.14622415550184,
        y: 854.818501923588
      },
      data: {
        actionType: "return",
        value: 15
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110785"
    },
    {
      source: "condition_110778",
      target: "action_110777"
    },
    {
      source: "condition_110785",
      target: "condition_110786"
    },
    {
      source: "condition_110786",
      target: "condition_110778"
    },
    {
      source: "condition_110786",
      target: "condition_110787"
    },
    {
      source: "condition_110787",
      target: "action_110777"
    }
  ]
  },
  {
    id: "discovered-attack",
    name: "Discovered Attack",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward moves that uncover attacks from another allied piece.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Discovered Attack",
        notes: ""
      }
    },
    {
      key: "condition_110673",
      type: "condition",
      position: {
        x: 27.109375,
        y: 223.609375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "pawn",
        targetFilterMode: "exclude",
        targetComparisonMetric: "count",
        targetComparator: "equal_to",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110674",
      type: "condition",
      position: {
        x: 26.515625,
        y: 449.484375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "pawn",
        targetFilterMode: "exclude",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110732",
      type: "condition",
      position: {
        x: 30.404948114959097,
        y: 675.28125
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
      key: "action_110675",
      type: "score",
      position: {
        x: 27.8125,
        y: 890.84375
      },
      data: {
        actionType: "add",
        value: 20
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110673"
    },
    {
      source: "condition_110673",
      target: "condition_110674"
    },
    {
      source: "condition_110674",
      target: "condition_110732"
    },
    {
      source: "condition_110732",
      target: "action_110675"
    }
  ]
  },
  {
    id: "discovered-check",
    name: "Discovered Check",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward moves that uncover pressure against the enemy king.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Discovered Check",
        notes: ""
      }
    },
    {
      key: "condition_110668",
      type: "condition",
      position: {
        x: 20.1875,
        y: 190.859375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "king",
        targetFilterMode: "include",
        targetComparisonMetric: "count",
        targetComparator: "equal_to",
        targetComparisonSource: "exact_number",
        targetComparisonSourceTotal: 0
      }
    },
    {
      key: "condition_110672",
      type: "condition",
      position: {
        x: 15.40625,
        y: 404.390625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "moved_piece",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "king",
        targetFilterMode: "exclude"
      }
    },
    {
      key: "condition_110658",
      type: "condition",
      position: {
        x: 5.75,
        y: 609.3125
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
      key: "action_110660",
      type: "score",
      position: {
        x: -1.6875,
        y: 817.5
      },
      data: {
        actionType: "add",
        value: 30
      }
    }
  ],
    connections: [
    {
      source: "condition_110658",
      target: "action_110660"
    },
    {
      source: "condition_110668",
      target: "condition_110672"
    },
    {
      source: "condition_110672",
      target: "condition_110658"
    },
    {
      source: "organizer",
      target: "condition_110668"
    }
  ]
  },
  {
    id: "dual-king-threat",
    name: "Dual King Threat",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward moves that create multiple threats around the enemy king.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Dual King Threat",
        notes: ""
      }
    },
    {
      key: "condition_110683",
      type: "condition",
      position: {
        x: 18.21875,
        y: 206.65625
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "any",
        operator: "attack",
        target: "enemy",
        targetFilter: "king",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "greater_than",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 1
      }
    },
    {
      key: "action_110700",
      type: "score",
      position: {
        x: 16.125,
        y: 425.859375
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
      target: "condition_110683"
    },
    {
      source: "condition_110683",
      target: "action_110700"
    }
  ]
  },
  {
    id: "open-file-rook",
    name: "Open File Rook",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Reward rook activity on open or newly opened files.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Open File Rook",
        notes: ""
      }
    },
    {
      key: "condition_110685",
      type: "condition",
      position: {
        x: 14.75,
        y: 184.484375
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "moved_piece",
        subjectFilter: "rook",
        operator: "mobility",
        comparator: "greater_than",
        subjectFilterMode: "include",
        target: "prior_board_state"
      }
    },
    {
      key: "condition_110706",
      type: "condition",
      position: {
        x: 14.578125,
        y: 394.4375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "major",
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
      key: "condition_110704",
      type: "condition",
      position: {
        x: 14.09375,
        y: 613.59375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "major",
        operator: "defend",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "include"
      }
    },
    {
      key: "action_110705",
      type: "score",
      position: {
        x: 16.984375,
        y: 843.25
      },
      data: {
        actionType: "add",
        value: 7
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110685"
    },
    {
      source: "condition_110685",
      target: "condition_110706"
    },
    {
      source: "condition_110704",
      target: "action_110705"
    },
    {
      source: "condition_110706",
      target: "condition_110704"
    }
  ]
  },
  {
    id: "connect-majors",
    name: "Connect Majors",
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: "Encourage coordination between major pieces.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Connect Majors",
        notes: "NOT BEHAVING AS DESIRED\ncounts aggregate value of allies defending and defended"
      }
    },
    {
      key: "condition_110686",
      type: "condition",
      position: {
        x: 16.21875,
        y: 179.703125
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "allied",
        subjectFilter: "major",
        operator: "defend",
        target: "allied",
        targetFilter: "major",
        subjectFilterMode: "include",
        targetFilterMode: "include",
        subjectComparisonMetric: "value",
        subjectComparator: "greater_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "action_110698",
      type: "score",
      position: {
        x: 13.40625,
        y: 404.921875
      },
      data: {
        actionType: "add",
        value: 8
      }
    }
  ],
    connections: [
    {
      source: "condition_110686",
      target: "action_110698"
    },
    {
      source: "organizer",
      target: "condition_110686"
    }
  ]
  }
]
