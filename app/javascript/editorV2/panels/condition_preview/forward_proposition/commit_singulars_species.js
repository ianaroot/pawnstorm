import { pickWeightedSpecies } from 'editorV2/panels/condition_preview/shared/board_utils'
import { buildSingularSelectionPool, pickFromPool } from './singular_selection'

// captured_piece precedes enemy_moved_piece so the `seen` short-circuit catches stalemate-aliased pairs before the latter runs.
const ACTOR_KEYS = Object.freeze(['moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'])
const POOL_ACTORS = new Set(['moved_piece', 'enemy_moved_piece'])

export function commitSingularsSpecies(ctx, random) {
  const singulars = ctx.singulars
  const seen = new Set()
  for (const key of ACTOR_KEYS) {
    const singular = singulars[key]
    if (seen.has(singular)) { continue }
    seen.add(singular)
    commitSpeciesFor(singular, ctx, random, key)
  }
}

function commitSpeciesFor(singular, ctx, random, key) {
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
