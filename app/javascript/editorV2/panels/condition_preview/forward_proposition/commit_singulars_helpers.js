import {
  pieceCode, buildBoardFromLayout, buildLayoutFromPieces
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { intersectRegions } from './region'
import { materializeRegion } from './materialize_region'
import { committedSpecies } from 'editorV2/panels/condition_preview/shared/singular_constraints'

export function commitCapturedPieceRegion(singular, square) {
  singular.region = { kind: 'set', squares: new Set([square]) }
}

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
  let map = new Map()
  for (const name of committed) {
    const s = singulars[name]
    const species = committedSpecies(s)
    if (species === null || s.region.kind !== 'set') { continue }
    const pos = [...s.region.squares][0]
    if (pos === undefined) { continue }
    const next = placePiece(map, pos, pieceCode(s.team, species))
    if (next === null) { continue }
    map = next
  }
  return buildBoardFromLayout(buildLayoutFromPieces(map))
}
