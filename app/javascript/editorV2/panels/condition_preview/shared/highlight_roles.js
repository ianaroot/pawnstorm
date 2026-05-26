function role(varName, label) {
  return {
    color: `rgb(var(${varName}))`,
    tint:  `rgb(var(${varName}) / 35%)`,
    label
  }
}

export const HIGHLIGHT_ROLES = {
  attacker:        role('--highlight-attacker',         'Attacker'),
  defender:        role('--highlight-defender',         'Defender'),
  shield:          role('--highlight-shield',           'Shield'),
  subject:         role('--highlight-subject',          'Subject'),
  positionSubject: role('--highlight-position-subject', 'Subject'),
  targetAttack:    role('--highlight-target-attack',    "Attacker's target"),
  targetDefend:    role('--highlight-target-defend',    "Defender's target"),
  targetShield:    role('--highlight-target-shield',    "Shield's target"),
  targetGeneric:   role('--highlight-target-generic',   'Target')
}

export const MOVED_FROM = role('--highlight-moved-from', 'Moved from')
export const MOVED_TO   = role('--highlight-moved-to',   'Moved to')

// Innermost first; moved rings drawn outside role rings.
export const ROLE_RENDER_ORDER = [
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

function entriesAtPosition(highlights, index) {
  const roles = highlights.roles || {}
  const entries = ROLE_RENDER_ORDER
    .filter(key => roles[key]?.includes(index))
    .map(key => HIGHLIGHT_ROLES[key])
  if (highlights.movedStartPosition === index) { entries.push(MOVED_FROM) }
  if (highlights.movedEndPosition === index)   { entries.push(MOVED_TO) }
  return entries
}

export function tileDecoration(highlights, index) {
  const entries = entriesAtPosition(highlights, index)
  if (entries.length === 0) { return null }

  const boxShadow = entries.map((e, ring) => `inset 0 0 0 ${3 * (ring + 1)}px ${e.color}`).join(', ')
  return { boxShadow, background: entries[0].tint }
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
