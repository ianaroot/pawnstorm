import {
  pieceCode, weightedShuffleSpecies
} from 'editorV2/panels/condition_preview/shared/board_utils'
import { materialValue } from 'gameplay/board_query_utils'
import { placePiece } from 'editorV2/panels/condition_preview/shared/piece_placement'
import { materializeRegion } from 'editorV2/panels/condition_preview/forward_proposition/materialize_region'
import { edgeBiasedShuffle } from 'editorV2/panels/condition_preview/forward_proposition/mobility/edge_bias'
import { respectsAllCaps, matches, boardForRegion } from './respect_caps'

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

function placeOne(prop, pieces, ctx, random) {
  const board = boardForRegion(prop.region, pieces)
  const filtered = new Set([...prop.species_set].filter(s => s !== null))
  const speciesPool = weightedShuffleSpecies(filtered, random)
  for (const species of speciesPool) {
    const code = pieceCode(prop.team, species)
    const region = materializeRegion(prop.region, { singulars: ctx.singulars, board, species, team: prop.team })
    const positions = edgeBiasedShuffle([...region], random, prop.aggregate_mobility_range, ctx.edgeBiasState)
    for (const position of positions) {
      if (!respectsAllCaps(prop.team, species, position, ctx, pieces)) { continue }
      const next = placePiece(pieces, position, code)
      if (next !== null) { return { pieces: next, species } }
    }
  }
  return null
}
