import Board from 'gameplay/board'
import { relativeRank } from 'gameplay/board_query_utils'
import { intersectRegions } from 'editorV2/panels/condition_preview/forward_proposition/region'

// Region census is only satisfiable via moved_piece: entering the region as a
// subject (+), or capturing an in-region enemy (-).
export function narrowMovedPieceForRegion(ctx) {
  const moved = ctx.singulars?.moved_piece
  if (!moved) { return }
  const captured = ctx.singulars?.captured_piece
  for (const entry of ctx.crossFrame ?? []) {
    if (entry.source !== 'census') { continue }
    if (entry.metric !== 'count') { continue }
    const prop = entry.currentProposition
    if (prop?.region?.kind !== 'set') { continue }

    if (entry.direction === '+' && moved.team === prop.team) {
      moved.species_set = intersectSpecies(moved.species_set, prop.species_set)
      moved.region = intersectRegions(moved.region, prop.region)
    } else if (entry.direction === '-' && moved.team !== prop.team) {
      moved.region = intersectRegions(moved.region, captureRegion(prop.region, moved, captured))
    }
  }
}

function captureRegion(region, moved, captured) {
  const squares = new Set(region.squares)
  if (epEligible(moved, captured)) {
    const forward = moved.team === Board.BLACK ? 8 : -8
    for (const sq of region.squares) {
      if (relativeRank(sq, moved.team) !== 5) { continue }
      const landing = sq + forward
      if (landing >= 0 && landing <= 63) { squares.add(landing) }
    }
  }
  return { kind: 'set', squares }
}

function epEligible(moved, captured) {
  return Boolean(captured) &&
    moved.species_set.has(Board.PAWN) &&
    captured.species_set.has(Board.PAWN)
}

function intersectSpecies(a, b) {
  const next = new Set()
  for (const species of a) {
    if (species === null) { continue }
    if (b.has(species)) { next.add(species) }
  }
  return next
}
