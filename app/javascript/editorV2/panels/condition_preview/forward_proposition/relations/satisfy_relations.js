import profileCollector from 'gameplay/profile_collector'
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
    const sizeBefore = pieces.size
    const next = satisfier(relation, pieces, ctx, random)
    if (next === null) { return null }
    profileCollector.increment(`forward_proposition.satisfy_relations.size_delta.${relation.operator}.${next.size - sizeBefore}`)
    pieces = next
  }
  return pieces
}
