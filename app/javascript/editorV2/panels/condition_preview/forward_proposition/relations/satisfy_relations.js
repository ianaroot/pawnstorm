import profileCollector from 'gameplay/profile_collector'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'
import { satisfyAttackOrDefend, activeAttackOrDefendSets } from './attack_or_defend'
import { satisfyAdjacent, activeAdjacentSets } from './adjacent'
import { satisfyShield, activeShieldSets } from './shield'
import { singularPosition } from './relation_helpers'

const SATISFIERS = {
  attack: satisfyAttackOrDefend,
  defend: satisfyAttackOrDefend,
  adjacent: satisfyAdjacent,
  shield: satisfyShield
}

const ACTIVE_SETS = {
  attack: activeAttackOrDefendSets,
  defend: activeAttackOrDefendSets,
  adjacent: activeAdjacentSets,
  shield: activeShieldSets
}

// Instrumentation only (no-op unless MATCH_PROFILE=1). Records, per relation,
// whether each committed pool actor ended up a subject/target participant or a
// bystander — the Phase 1 baseline metric for moved-piece recruitment.
function recordParticipation(relation, pieces, ctx) {
  const activeSetsFor = ACTIVE_SETS[relation.operator]
  if (!activeSetsFor) { return }
  const { activeSubjects, activeTargets } = activeSetsFor(relation, pieces)
  for (const actor of ['moved_piece', 'enemy_moved_piece']) {
    const pos = singularPosition(ctx, actor)
    if (pos === null) { continue }
    const role = activeSubjects.has(pos) ? 'subject'
      : activeTargets.has(pos) ? 'target'
      : 'bystander'
    profileCollector.increment(
      `forward_proposition.satisfy_relations.participant.${relation.operator}.${actor}.${role}`
    )
  }
}

export function satisfyRelations(ctx, pieces, random) {
  for (const relation of shuffled(ctx.relations ?? [], random)) {
    if (relation.operator === 'same_piece') { continue }
    const satisfier = SATISFIERS[relation.operator]
    if (!satisfier) { return null }
    const sizeBefore = pieces.size
    const next = satisfier(relation, pieces, ctx, random)
    if (next === null) { return null }
    profileCollector.increment(`forward_proposition.satisfy_relations.size_delta.${relation.operator}.${next.size - sizeBefore}`)
    recordParticipation(relation, next, ctx)
    pieces = next
  }
  return pieces
}
