import { materialValue } from 'gameplay/board_query_utils'
import { compareValues } from 'bot_execution/utils'
import { pickWeightedSpecies } from 'editorV2/panels/condition_preview/shared/board_utils'
import { movedSpeciesPool } from './moved_binding'
import { ACTOR_PRIORITY } from './singulars'

const ACTOR_KEYS = Object.freeze(
  Object.keys(ACTOR_PRIORITY).sort((a, b) => ACTOR_PRIORITY[a] - ACTOR_PRIORITY[b])
)

// Runs before earlyPlaceConstraintTargets so the eligible-pool filter sees
// null-committed actors as decided. Value-comparison actors are skipped —
// commit-time applyValueComparisonsToAnchors strips null for them.
export function applyNullStayCoinFlips(ctx, random) {
  const seen = new Set()
  for (const key of ACTOR_KEYS) {
    const singular = ctx.singulars[key]
    if (seen.has(singular)) { continue }
    seen.add(singular)
    if ((singular.valueComparisonsToAnchors ?? []).length > 0) { continue }
    if (singular.species_set.has(null) && random() < 0.5) {
      singular.species_set = new Set([null])
    }
  }
}

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
  if (singular.species_set.size === 1 && singular.species_set.has(null)) { return }
  applyValueComparisonsToAnchors(singular, singulars, committed)
  if (singular.species_set.has(null)) {
    const next = new Set(singular.species_set)
    next.delete(null)
    singular.species_set = next
  }
  if (singular.species_set.size === 1) { return }
  if (key === 'moved_piece') {
    singular.species_set = new Set([pickWeightedSpecies(movedSpeciesPool(singular, ctx), random)])
    return
  }
  singular.species_set = new Set([pickWeightedSpecies(singular.species_set, random)])
}

function applyValueComparisonsToAnchors(singular, singulars, committed) {
  for (const entry of singular.valueComparisonsToAnchors ?? []) {
    if (!committed.has(entry.otherActor)) { continue }
    const other = singulars[entry.otherActor]
    const otherSpecies = [...other.species_set][0]
    if (otherSpecies === null || otherSpecies === undefined) { continue }
    const otherValue = materialValue(otherSpecies)
    const filtered = new Set()
    for (const s of singular.species_set) {
      if (s === null) { continue }
      const passes = entry.lowerSide === 'lhs'
        ? compareValues(materialValue(s), entry.comparator, otherValue)
        : compareValues(otherValue, entry.comparator, materialValue(s))
      if (passes) { filtered.add(s) }
    }
    singular.species_set = filtered
  }
}
