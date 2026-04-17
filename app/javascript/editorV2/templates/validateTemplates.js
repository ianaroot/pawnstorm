import {
  ACTION_DATA_KEYS,
  ORGANIZER_DATA_KEYS
} from '../utils/nodeDefaults.js'
import { TEMPLATE_CATEGORY_ORDER } from './TemplateCategories.js'

const ALLOWED_NODE_TYPES = Object.freeze(['organizer', 'condition', 'action'])
const CONDITION_UNARY_REQUIRED_KEYS = Object.freeze([
  'version',
  'kind',
  'subject',
  'subjectFilter',
  'operator',
  'comparator',
  'comparisonValue'
])
const CONDITION_UNARY_ALLOWED_KEYS = Object.freeze([
  ...CONDITION_UNARY_REQUIRED_KEYS,
  'subjectFilterMode'
])
const CONDITION_RELATIONAL_REQUIRED_KEYS = Object.freeze([
  'version',
  'kind',
  'subject',
  'subjectFilter',
  'operator',
  'target',
  'targetFilter'
])
const CONDITION_RELATIONAL_ALLOWED_KEYS = Object.freeze([
  ...CONDITION_RELATIONAL_REQUIRED_KEYS,
  'subjectFilterMode',
  'subjectComparisonMetric',
  'subjectComparator',
  'subjectComparisonValue',
  'targetFilterMode',
  'targetComparisonMetric',
  'targetComparator',
  'targetComparisonValue'
])

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function validateDataShape(template, node) {
  const keys = Object.keys(node.data || {}).sort()

  switch (node.type) {
    case 'organizer':
      assert(
        JSON.stringify(keys) === JSON.stringify([...ORGANIZER_DATA_KEYS].sort()),
        `Template "${template.id}" organizer node "${node.key}" must define only title and notes`
      )
      break
    case 'condition':
      validateConditionDataShape(template, node, keys)
      break
    case 'action':
      assert(
        JSON.stringify(keys) === JSON.stringify([...ACTION_DATA_KEYS].sort()),
        `Template "${template.id}" action node "${node.key}" must define actionType and value`
      )
      break
    default:
      break
  }
}

function validateConditionDataShape(template, node, keys) {
  const kind = node.data?.kind
  const allowedKeys = kind === 'unary' ? CONDITION_UNARY_ALLOWED_KEYS : CONDITION_RELATIONAL_ALLOWED_KEYS
  const requiredKeys = kind === 'unary' ? CONDITION_UNARY_REQUIRED_KEYS : CONDITION_RELATIONAL_REQUIRED_KEYS

  assert(
    kind === 'unary' || kind === 'relational',
    `Template "${template.id}" condition node "${node.key}" must define a valid V2 condition kind`
  )

  const extraKeys = keys.filter(key => !allowedKeys.includes(key))
  const missingKeys = requiredKeys.filter(key => !keys.includes(key))

  assert(
    extraKeys.length === 0 && missingKeys.length === 0,
    `Template "${template.id}" condition node "${node.key}" must define valid V2 condition data`
  )
}

export function validateTemplates(templates) {
  const templateIds = new Set()

  templates.forEach(template => {
    assert(typeof template.id === 'string' && template.id.length > 0, 'Each template must have a non-empty string id')
    assert(!templateIds.has(template.id), `Duplicate template id "${template.id}"`)
    templateIds.add(template.id)

    assert(typeof template.name === 'string' && template.name.length > 0, `Template "${template.id}" must have a non-empty name`)
    assert(TEMPLATE_CATEGORY_ORDER.includes(template.category), `Template "${template.id}" has an invalid category`)
    assert(typeof template.description === 'string' && template.description.length > 0, `Template "${template.id}" must have a non-empty description`)
    assert(Array.isArray(template.nodes) && template.nodes.length > 0, `Template "${template.id}" must define at least one node`)
    assert(Array.isArray(template.connections), `Template "${template.id}" must define a connections array`)

    const nodeKeys = new Set()
    const organizers = template.nodes.filter(node => node.type === 'organizer')

    assert(organizers.length === 1, `Template "${template.id}" must define exactly one organizer node`)

    template.nodes.forEach(node => {
      assert(typeof node.key === 'string' && node.key.length > 0, `Template "${template.id}" has a node with an invalid key`)
      assert(!nodeKeys.has(node.key), `Template "${template.id}" has duplicate node key "${node.key}"`)
      nodeKeys.add(node.key)

      assert(ALLOWED_NODE_TYPES.includes(node.type), `Template "${template.id}" node "${node.key}" has unsupported type "${node.type}"`)
      assert(node.type !== 'root', `Template "${template.id}" cannot include a root node`)
      assert(node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number', `Template "${template.id}" node "${node.key}" must define numeric x/y position`)
      assert(node.data && typeof node.data === 'object', `Template "${template.id}" node "${node.key}" must define data`)

      validateDataShape(template, node)
    })

    const organizer = organizers[0]
    assert(
      organizer.position.x === 0 && organizer.position.y === 0,
      `Template "${template.id}" organizer node must be anchored at { x: 0, y: 0 }`
    )
    assert(
      organizer.data.title === template.name,
      `Template "${template.id}" organizer title must match template name`
    )

    const uniqueConnections = new Set()
    template.connections.forEach(connection => {
      assert(typeof connection.source === 'string' && nodeKeys.has(connection.source), `Template "${template.id}" has a connection with invalid source "${connection.source}"`)
      assert(typeof connection.target === 'string' && nodeKeys.has(connection.target), `Template "${template.id}" has a connection with invalid target "${connection.target}"`)
      const key = `${connection.source}->${connection.target}`
      assert(!uniqueConnections.has(key), `Template "${template.id}" has duplicate connection "${key}"`)
      uniqueConnections.add(key)
    })
  })

  return templates
}
