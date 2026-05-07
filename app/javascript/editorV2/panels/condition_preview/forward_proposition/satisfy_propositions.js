import { pieceCode, shuffled, buildBoardFromLayout, buildLayoutFromPieces } from 'editorV2/panels/condition_preview/shared/board_utils'
import { materialValue } from 'gameplay/board_query_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { materializeRegion } from 'editorV2/panels/condition_preview/forward_proposition/materialize_region'

export function satisfyPropositions(ctx, pieces, random) {
  for (const prop of ctx.propositions) {
    if (prop.frame !== 'current') { continue }
    const next = satisfyOne(prop, pieces, ctx, random)
    if (next === null) { return null }
    pieces = next
  }
  return pieces
}

function satisfyOne(prop, pieces, ctx, random) {
  let { count, value } = tallyMatching(prop, pieces, ctx)
  while (count < prop.count_range.min || value < prop.aggregate_value_range.min) {
    const placed = placeOne(prop, pieces, ctx, random)
    if (placed === null) { return null }
    pieces = placed.pieces
    count += 1
    value += materialValue(placed.species)
  }
  return pieces
}

function tallyMatching(prop, pieces, ctx) {
  let count = 0
  let value = 0
  const board = boardForRegion(prop.region, pieces)
  for (const [pos, piece] of pieces.entries()) {
    if (matches(prop, pos, piece, ctx, board)) {
      count += 1
      value += materialValue(piece.slice(1))
    }
  }
  return { count, value }
}

function matches(prop, pos, piece, ctx, board) {
  if (piece.charAt(0) !== prop.team) { return false }
  const species = piece.slice(1)
  if (!prop.species_set.has(species)) { return false }
  const region = materializeRegion(prop.region, { singulars: ctx.singulars, board, species, team: prop.team })
  return region.has(pos)
}

function placeOne(prop, pieces, ctx, random) {
  const board = boardForRegion(prop.region, pieces)
  const speciesPool = shuffled([...prop.species_set].filter(s => s !== null), random)
  for (const species of speciesPool) {
    const code = pieceCode(prop.team, species)
    const region = materializeRegion(prop.region, { singulars: ctx.singulars, board, species, team: prop.team })
    const positions = shuffled([...region], random)
    for (const position of positions) {
      if (!respectsAllCaps(prop.team, species, position, ctx, pieces)) { continue }
      const next = placePiece(pieces, position, code)
      if (next !== null) { return { pieces: next, species } }
    }
  }
  return null
}

function respectsAllCaps(team, species, position, ctx, pieces) {
  const speciesValue = materialValue(species)
  for (const other of ctx.propositions) {
    if (other.frame !== 'current') { continue }
    if (other.team !== team) { continue }
    if (!other.species_set.has(species)) { continue }
    const board = boardForRegion(other.region, pieces)
    const region = materializeRegion(other.region, { singulars: ctx.singulars, board, species, team })
    if (!region.has(position)) { continue }

    let count = 0
    let value = 0
    for (const [pos, piece] of pieces.entries()) {
      if (matches(other, pos, piece, ctx, board)) {
        count += 1
        value += materialValue(piece.slice(1))
      }
    }
    if (count + 1 > other.count_range.max) { return false }
    if (value + speciesValue > other.aggregate_value_range.max) { return false }
  }
  return true
}

function boardForRegion(region, pieces) {
  if (region.kind !== 'related-to') { return null }
  return buildBoardFromLayout(buildLayoutFromPieces(pieces))
}
