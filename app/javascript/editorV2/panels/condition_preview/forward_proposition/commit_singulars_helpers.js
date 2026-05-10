import {
  pieceCode, buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { intersectRegions } from './region'
import { materializeRegion } from './materialize_region'

export function applyRelationsToAnchors(singular, singulars, committed, species) {
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
