import {
  ALL_POSITIONS, pickRandom, pieceCode, buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { intersectRegions } from './region'
import { materializeRegion } from './materialize_region'

const ACTOR_KEYS = Object.freeze(['moved_piece', 'enemy_moved_piece', 'captured_piece', 'enemy_captured_piece'])

export function commitSingulars(singulars, random) {
  const seen = new Set()
  const committed = new Set()
  for (const key of ACTOR_KEYS) {
    const singular = singulars[key]
    if (seen.has(singular)) {
      committed.add(key)
      continue
    }
    seen.add(singular)
    commitOne(singular, singulars, committed, random)
    committed.add(key)
  }
}

function commitOne(singular, singulars, committed, random) {
  const species = pickRandom([...singular.species_set], random)
  singular.species_set = new Set([species])
  if (species === null) { return }

  applyRelationsToAnchors(singular, singulars, committed, species)

  const candidates = singular.region.kind === 'all' ? ALL_POSITIONS : [...singular.region.squares]
  if (candidates.length === 0) { return }
  const position = pickRandom(candidates, random)
  singular.region = { kind: 'set', squares: new Set([position]) }
}

function applyRelationsToAnchors(singular, singulars, committed, species) {
  for (const r of singular.relationsToAnchors ?? []) {
    if (!committed.has(r.otherActor)) { continue }
    const anchorRole = r.myRole === 'subject' ? 'target' : 'subject'
    const board = buildBoardFromCommittedSingulars(singulars, committed)
    const region = materializeRegion(
      { kind: 'related-to', actor: r.otherActor, role: anchorRole, operator: r.operator },
      { singulars, board, species, team: singular.team }
    )
    singular.region = intersectRegions(singular.region, { kind: 'set', squares: region })
  }
}

function buildBoardFromCommittedSingulars(singulars, committed) {
  const map = new Map()
  for (const name of committed) {
    const s = singulars[name]
    const species = [...s.species_set][0]
    if (species === null || s.region.kind !== 'set') { continue }
    const pos = [...s.region.squares][0]
    if (pos === undefined) { continue }
    map.set(pos, pieceCode(s.team, species))
  }
  return buildBoardFromLayout(buildLayoutFromPieces(map))
}
