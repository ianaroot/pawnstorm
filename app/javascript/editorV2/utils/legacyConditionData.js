export const LEGACY_RELATION_MAP = Object.freeze({
  attacked_after_move: 'attacker_count',
  defended_after_move: 'defender_count',
  lost_defender: 'defender_count',
  lost_shield: 'shield_count',
  newly_attacked: 'attacker_count',
  unblocked: 'mobility'
})

export function normalizeLegacyRelation(relation) {
  return LEGACY_RELATION_MAP[relation] || relation
}

export function getLegacyKeys(data = {}, allowedKeys = []) {
  return Object.keys(data).filter(key => !allowedKeys.includes(key))
}

export function confirmLegacyDataDiscard(legacyKeys = []) {
  if (legacyKeys.length === 0) {
    return true
  }

  return confirm(
    `Saving this node will discard unsupported legacy fields: ${legacyKeys.join(', ')}. Continue?`
  )
}
