import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

export const ACTIVITY_TEMPLATES = [
  {
    id: "queen-pressure",
    name: "Queen Pressure",
    category: TEMPLATE_CATEGORIES.ACTIVITY,
    description: "Reward active queen pressure without treating it as a king-net template.",
    nodes: [
    {
      key: "organizer",
      type: "organizer",
      position: {
        x: 0.0,
        y: 0.0
      },
      data: {
        title: "Queen Pressure",
        notes: ""
      }
    },
    {
      key: "condition_110663",
      type: "condition",
      position: {
        x: 22.4375,
        y: 190.6875
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
      key: "condition_110664",
      type: "condition",
      position: {
        x: 21.609375,
        y: 391.484375
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "any",
        operator: "shield",
        target: "enemy",
        targetFilter: "queen",
        targetFilterMode: "include",
        subjectComparisonMetric: "count",
        subjectComparator: "less_than",
        subjectComparisonSource: "prior_board_state"
      }
    },
    {
      key: "condition_110709",
      type: "condition",
      position: {
        x: 22.609375,
        y: 590.75
      },
      data: {
        version: 2,
        kind: "relational",
        subject: "enemy",
        subjectFilter: "queen",
        operator: "attack",
        target: "moved_piece",
        targetFilter: "any",
        subjectFilterMode: "include"
      }
    },
    {
      key: "condition_110710",
      type: "condition",
      position: {
        x: 23.28125,
        y: 798.984375
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
      key: "action_110667",
      type: "action",
      position: {
        x: 18.890625,
        y: 998.5
      },
      data: {
        actionType: "add",
        value: 25
      }
    }
  ],
    connections: [
    {
      source: "organizer",
      target: "condition_110663"
    },
    {
      source: "condition_110663",
      target: "condition_110664"
    },
    {
      source: "condition_110664",
      target: "condition_110709"
    },
    {
      source: "condition_110709",
      target: "condition_110710"
    },
    {
      source: "condition_110710",
      target: "action_110667"
    }
  ]
  }
]
