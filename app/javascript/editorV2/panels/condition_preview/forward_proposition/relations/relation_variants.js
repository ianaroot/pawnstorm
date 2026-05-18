import { singularPosition } from './relation_helpers'

// Pure role-binding selection shared by every relation satisfier. Decides
// which committed pool singular (if any) should anchor which relation role.
// No geometry, no placement — the satisfier executes the chosen binding.
//
// `roles`: ordered [{ name, side: { team, species_set, boundSingularActor? } }].
// The descriptor is the minimal shape common to relation sides and cross-frame
// entry propositions, so Phase 4 can reuse this against PBS entries unchanged.

const ACTOR_KIND = { moved_piece: 'moved', enemy_moved_piece: 'enemy-moved' }
const POOL_ACTORS = ['moved_piece', 'enemy_moved_piece']

export function chooseRelationVariant({ roles, ctx, random }) {
  const forced = forcedBindings(roles, ctx)
  if (forced.length > 0) { return { kind: 'bound', bindings: forced } }

  const eligible = [{ kind: 'bystander' }]
  for (const actorKey of POOL_ACTORS) {
    const singular = ctx?.singulars?.[actorKey]
    if (!singular) { continue }
    const species = [...singular.species_set][0]
    if (species == null) { continue }
    const position = singularPosition(ctx, actorKey)
    if (position === null) { continue }
    for (const role of roles) {
      if (singular.team !== role.side.team) { continue }
      if (!role.side.species_set.has(species)) { continue }
      eligible.push({ kind: ACTOR_KIND[actorKey], role: role.name, actorKey, position })
    }
  }
  return eligible[Math.floor(random() * eligible.length)]
}

function forcedBindings(roles, ctx) {
  const bindings = []
  for (const role of roles) {
    const actorKey = role.side.boundSingularActor
    if (!actorKey) { continue }
    const position = singularPosition(ctx, actorKey)
    if (position === null) { continue }
    bindings.push({ role: role.name, actorKey, position })
  }
  return bindings
}
