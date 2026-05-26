export const HIGHLIGHT_ROLES = {
  attacker:        { color: '#991b1b', label: 'Attacker' },
  defender:        { color: '#2563eb', label: 'Defender' },
  shield:          { color: '#7c3aed', label: 'Shield' },
  subject:         { color: '#16a34a', label: 'Subject' },
  positionSubject: { color: '#f97316', label: 'Subject' },
  targetAttack:    { color: '#f43f5e', label: "Attacker's target" },
  targetDefend:    { color: '#93c5fd', label: "Defender's target" },
  targetShield:    { color: '#c4b5fd', label: "Shield's target" },
  targetGeneric:   { color: '#86efac', label: 'Target' }
}

export const MOVED_FROM = { color: '#fde047', label: 'Moved from' }
export const MOVED_TO   = { color: '#eab308', label: 'Moved to' }

// Innermost first; moved rings drawn outside role rings.
const ROLE_RENDER_ORDER = [
  'attacker', 'defender', 'shield', 'subject', 'positionSubject',
  'targetAttack', 'targetDefend', 'targetShield', 'targetGeneric'
]

export function relationSubjectRole(operator) {
  switch (operator) {
    case 'attack': return 'attacker'
    case 'defend': return 'defender'
    case 'shield': return 'shield'
    default:       return 'subject'
  }
}

export function relationTargetRole(operator) {
  switch (operator) {
    case 'attack': return 'targetAttack'
    case 'defend': return 'targetDefend'
    case 'shield': return 'targetShield'
    default:       return 'targetGeneric'
  }
}

function rolesAtPosition(roles, index) {
  return ROLE_RENDER_ORDER.filter(key => roles[key]?.includes(index))
}

export function tileDecoration(highlights, index) {
  const roles = highlights.roles || {}
  const colors = rolesAtPosition(roles, index).map(key => HIGHLIGHT_ROLES[key].color)
  if (highlights.movedStartPosition === index) { colors.push(MOVED_FROM.color) }
  if (highlights.movedEndPosition === index)   { colors.push(MOVED_TO.color) }
  if (colors.length === 0) { return null }

  const boxShadow = colors.map((color, ring) => `inset 0 0 0 ${3 * (ring + 1)}px ${color}`).join(', ')
  return { boxShadow, background: `${colors[0]}40` }
}

export function legendEntries(example) {
  const present = new Set()
  ;[example?.highlights?.prior, example?.highlights?.after].forEach(phase => {
    const roles = phase?.roles || {}
    ROLE_RENDER_ORDER.forEach(key => { if (roles[key]?.length) { present.add(key) } })
  })

  const deduped = []
  ROLE_RENDER_ORDER
    .filter(key => present.has(key))
    .map(key => HIGHLIGHT_ROLES[key])
    .forEach(entry => {
      if (!deduped.some(e => e.label === entry.label && e.color === entry.color)) { deduped.push(entry) }
    })

  return [...deduped, MOVED_FROM, MOVED_TO]
}
