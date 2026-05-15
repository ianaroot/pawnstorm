export function buildEligiblePool(ctx) {
  const pool = []
  addSingularEntries(pool, ctx.singulars ?? {})
  addPropositionEntries(pool, ctx.propositions ?? [])
  addRelationSideEntries(pool, ctx.relations ?? [])
  addFreshEntries(pool, ctx.propositions ?? [])
  return pool
}

function addSingularEntries(pool, singulars) {
  const seen = new Set()
  for (const [actorKey, singular] of Object.entries(singulars)) {
    if (seen.has(singular)) { continue }
    seen.add(singular)
    if (singularIsNullCommitted(singular)) { continue }
    pool.push({
      source: 'singular',
      actorKey,
      team: singular.team,
      speciesOptions: singular.species_set,
      regionOptions: singular.region,
      constraintRef: null,
      side: null
    })
  }
}

function singularIsNullCommitted(singular) {
  if (!singular.species_set || singular.species_set.size === 0) { return true }
  for (const species of singular.species_set) {
    if (species !== null) { return false }
  }
  return true
}

function addPropositionEntries(pool, propositions) {
  for (const proposition of propositions) {
    if (proposition.frame !== 'current') { continue }
    const slots = proposition.count_range?.min ?? 0
    for (let i = 0; i < slots; i += 1) {
      pool.push({
        source: 'proposition',
        actorKey: null,
        team: proposition.team,
        speciesOptions: proposition.species_set,
        regionOptions: proposition.region,
        constraintRef: proposition,
        side: null
      })
    }
  }
}

function addRelationSideEntries(pool, relations) {
  for (const relation of relations) {
    addRelationSide(pool, relation, 'subject', relation.subjectSide)
    addRelationSide(pool, relation, 'target', relation.targetSide)
  }
}

function addRelationSide(pool, relation, side, sideObj) {
  // Bound-singular sides are placed via their singular entry; skip to avoid
  // emitting a free placement entry that would compete with the singular.
  if (sideObj?.boundSingularActor) { return }
  const slots = sideObj?.count_range?.min ?? 0
  for (let i = 0; i < slots; i += 1) {
    pool.push({
      source: 'relation-side',
      actorKey: null,
      team: sideObj.team,
      speciesOptions: sideObj.species_set,
      regionOptions: sideObj.region,
      constraintRef: relation,
      side
    })
  }
}

function addFreshEntries(pool, propositions) {
  for (const proposition of propositions) {
    if (proposition.frame !== 'current') { continue }
    if (isPermissiveMobilityRange(proposition.aggregate_mobility_range)) { continue }
    // Bound-singular propositions are placed via the singular entry; skip
    // emitting a free placement entry that would compete with the singular.
    if (proposition.boundSingularActor) { continue }
    pool.push({
      source: 'fresh',
      actorKey: null,
      team: proposition.team,
      speciesOptions: proposition.species_set,
      regionOptions: proposition.region,
      constraintRef: proposition,
      side: null
    })
  }
}

function isPermissiveMobilityRange(range) {
  if (!range) { return true }
  return range.min === 0 && range.max === Infinity
}
