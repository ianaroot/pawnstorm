import { satisfyAttackOrDefend } from './attack_or_defend'
import { satisfyAdjacent } from './adjacent'
import { satisfyShield } from './shield'

const SATISFIERS = {
  attack: satisfyAttackOrDefend,
  defend: satisfyAttackOrDefend,
  adjacent: satisfyAdjacent,
  shield: satisfyShield
}

export function satisfyRelations(ctx, pieces, random) {
  for (const relation of ctx.relations ?? []) {
    if (relation.operator === 'same_piece') { continue }
    const satisfier = SATISFIERS[relation.operator]
    if (!satisfier) { return null }
    const next = satisfier(relation, pieces, ctx, random)
    if (next === null) { return null }
    pieces = next
  }
  return pieces
}
