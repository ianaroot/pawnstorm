import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const ENDGAME_TEMPLATES = [
  {
    id: "endgame",
    name: "Endgame",
    category: TEMPLATE_CATEGORIES.ENDGAME,
    description: "Detect and reward endgame-specific move priorities.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Endgame",
        notes: ""
      }
    },
    {
      key: "condition_110596",
      type: "condition",
      position: {
        x: 22.0,
        y: 193.875
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "allied",
        subjectFilter: "pawn",
        subjectFilterMode: "exclude",
        operator: "count",
        comparator: "less_than",
        target: "exact_number",
        targetTotal: 3
      }
    },
    {
      key: "condition_110604",
      type: "condition",
      position: {
        x: 22.0,
        y: 412.375
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "enemy",
        subjectFilter: "pawn",
        subjectFilterMode: "exclude",
        operator: "count",
        comparator: "less_than",
        target: "exact_number",
        targetTotal: 3
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110596"
    },
    {
      source: "condition_110596",
      target: "condition_110604"
    }
  ]
  },
  {
    id: "avoid-stalemate",
    name: "Avoid Stalemate",
    category: TEMPLATE_CATEGORIES.ENDGAME,
    description: "Discourage moves that leave the enemy with no legal mobility when not mating.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Avoid Stalemate",
        notes: ""
      }
    },
    {
      key: "condition_110608",
      type: "condition",
      position: {
        x: 19.984375,
        y: 197.390625
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
      key: "condition_110613",
      type: "condition",
      position: {
        x: 19.984375,
        y: 436.515625
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
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "action_110616",
      type: "score",
      position: {
        x: 25.25,
        y: 653.109375
      },
      data: {
        actionType: "return",
        value: -1000
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110608"
    },
    {
      source: "condition_110608",
      target: "condition_110613"
    },
    {
      source: "condition_110613",
      target: "action_110616"
    }
  ]
  },
  {
    id: "force-stalemate-when-losing",
    name: "Force Stalemate When Losing",
    category: TEMPLATE_CATEGORIES.ENDGAME,
    description: "Seek stalemate resources when materially losing.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Force Stalemate When Losing",
        notes: ""
      }
    },
    {
      key: "condition_110665",
      type: "condition",
      position: {
        x: 18.0,
        y: 200.640625
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "allied",
        subjectFilter: "pawn",
        operator: "count",
        comparator: "equal_to",
        subjectFilterMode: "include",
        target: "exact_number",
        targetTotal: 0
      }
    },
    {
      key: "condition_110661",
      type: "condition",
      position: {
        x: 16.09375,
        y: 408.125
      },
      data: {
        version: 2,
        kind: "unary",
        subject: "allied",
        subjectFilter: "any",
        operator: "value",
        comparator: "less_than",
        target: "exact_number",
        targetTotal: 5
      }
    },
    {
      key: "condition_110677",
      type: "condition",
      position: {
        x: 4.453125,
        y: 627.984375
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
      key: "condition_110679",
      type: "condition",
      position: {
        x: 4.453125,
        y: 840.375
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
        subjectComparator: "equal_to",
        subjectComparisonSource: "exact_number",
        subjectComparisonSourceTotal: 0
      }
    },
    {
      key: "action_110699",
      type: "score",
      position: {
        x: 4.453125,
        y: 1068.5625
      },
      data: {
        actionType: "return",
        value: 1000
      }
    }
  ],
    connections: [
    {
      source: "condition_110661",
      target: "condition_110677"
    },
    {
      source: "condition_110665",
      target: "condition_110661"
    },
    {
      source: "organizer",
      target: "condition_110665"
    },
    {
      source: "condition_110677",
      target: "condition_110679"
    },
    {
      source: "condition_110679",
      target: "action_110699"
    }
  ]
  }
]
