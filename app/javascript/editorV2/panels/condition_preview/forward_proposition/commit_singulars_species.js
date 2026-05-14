import { materialValue } from 'gameplay/board_query_utils'
import { compareValues } from 'bot_execution/utils'
import { pickWeightedSpecies } from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildSingularSelectionPool, pickFromPool } from './singular_selection'
import { ACTOR_PRIORITY } from './singulars'

const ACTOR_KEYS = Object.freeze(
  Object.keys(ACTOR_PRIORITY).sort((a, b) => ACTOR_PRIORITY[a] - ACTOR_PRIORITY[b])
)
const POOL_ACTORS = new Set(['moved_piece', 'enemy_moved_piece'])

export function commitSingularsSpecies(ctx, random) {
  const singulars = ctx.singulars
  const seen = new Set()
  const committed = new Set()
  for (const key of ACTOR_KEYS) {
    const singular = singulars[key]
    if (seen.has(singular)) { committed.add(key); continue }
    seen.add(singular)
    commitSpeciesFor(singular, singulars, committed, ctx, random, key)
    committed.add(key)
  }
}

function commitSpeciesFor(singular, singulars, committed, ctx, random, key) {
  applyUnaryComparisonsToAnchors(singular, singulars, committed)
  // Null in species_set means the chain doesn't constrain this actor — leave
  // it uncommitted half the time so unrelated singulars aren't always placed.
  if (singular.species_set.has(null) && random() < 0.5) {
    singular.species_set = new Set([null])
    return
  }
  if (POOL_ACTORS.has(key)) {
    const pool = buildSingularSelectionPool(singular, ctx)
    const picked = pickFromPool(pool, singular, random)
    singular.species_set = new Set([picked.species])
    singular.region = picked.region
    return
  }
  singular.species_set = new Set([pickWeightedSpecies(singular.species_set, random)])
}

function applyUnaryComparisonsToAnchors(singular, singulars, committed) {
  for (const entry of singular.unaryComparisonsToAnchors ?? []) {
    if (!committed.has(entry.otherActor)) { continue }
    const other = singulars[entry.otherActor]
    const otherSpecies = [...other.species_set][0]
    if (otherSpecies === null || otherSpecies === undefined) { continue }
    const otherValue = materialValue(otherSpecies)
    const filtered = new Set()
    for (const s of singular.species_set) {
      if (s === null) { continue }
      const passes = entry.myRole === 'subject'
        ? compareValues(materialValue(s), entry.comparator, otherValue)
        : compareValues(otherValue, entry.comparator, materialValue(s))
      if (passes) { filtered.add(s) }
    }
    singular.species_set = filtered
  }
}
