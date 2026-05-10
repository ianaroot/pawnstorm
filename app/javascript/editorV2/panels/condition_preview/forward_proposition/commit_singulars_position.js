import { ALL_POSITIONS, pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import { aggregateMobilityRangeForSingular, edgeBiasedShuffle } from './mobility/edge_bias'
import { applyRelationsToAnchors } from './commit_singulars_helpers'
import { respectsAllCaps } from './respect_caps'

const ACTOR_KEYS = Object.freeze(['moved_piece', 'enemy_moved_piece', 'captured_piece', 'enemy_captured_piece'])

export function commitSingularsPosition(ctx, random, earlyPieces = new Map()) {
  const singulars = ctx.singulars
  const seen = new Set()
  const committed = new Set()
  for (const key of ACTOR_KEYS) {
    const singular = singulars[key]
    if (seen.has(singular)) {
      committed.add(key)
      continue
    }
    seen.add(singular)
    if (isAlreadyPositioned(singular)) {
      committed.add(key)
      continue
    }
    commitPositionFor(singular, singulars, committed, random, ctx, key, earlyPieces)
    committed.add(key)
  }
}

function isAlreadyPositioned(singular) {
  return singular.region.kind === 'set' && singular.region.squares.size === 1
}

function commitPositionFor(singular, singulars, committed, random, ctx, key, earlyPieces) {
  const species = [...singular.species_set][0]
  if (species === null) { return }

  applyRelationsToAnchors(singular, singulars, committed, species)

  const candidates = singular.region.kind === 'all' ? ALL_POSITIONS : [...singular.region.squares]
  if (candidates.length === 0) { return }
  const mobilityRange = aggregateMobilityRangeForSingular(singular, ctx.propositions)
  const ordered = edgeBiasedShuffle(candidates, random, mobilityRange, ctx.edgeBiasState)

  const virtualPieces = virtualPiecesFor(singulars, committed, earlyPieces)
  for (const candidate of ordered) {
    if (respectsAllCaps(singular.team, species, candidate, ctx, virtualPieces)) {
      singular.region = { kind: 'set', squares: new Set([candidate]) }
      return
    }
  }
  singular.region = { kind: 'set', squares: new Set() }
}

function virtualPiecesFor(singulars, committed, earlyPieces) {
  const map = new Map(earlyPieces)
  for (const name of committed) {
    const s = singulars[name]
    const species = [...s.species_set][0]
    if (species === null || s.region.kind !== 'set') { continue }
    const pos = [...s.region.squares][0]
    if (pos === undefined) { continue }
    if (map.has(pos)) { continue }
    map.set(pos, pieceCode(s.team, species))
  }
  return map
}
