import Board from 'gameplay/board'
import { shuffled } from 'editorV2/panels/condition_preview/shared/board_utils'

const LOW_MOBILITY_THRESHOLD = 5
const EDGE_BIAS_PROBABILITY = 0.4

export function isEdgePosition(position) {
  const file = Board.fileIndex(position)
  const rank = Board.rankIndex(position)
  return file === 0 || file === 7 || rank === 0 || rank === 7
}

export function edgeBiasedShuffle(positions, random, mobilityRange) {
  if (!shouldBiasEdge(mobilityRange) || random() >= EDGE_BIAS_PROBABILITY) {
    return shuffled(positions, random)
  }
  const edge = []
  const interior = []
  for (const pos of positions) {
    (isEdgePosition(pos) ? edge : interior).push(pos)
  }
  return [...shuffled(edge, random), ...shuffled(interior, random)]
}

export function aggregateMobilityRangeForSingular(singular, propositions) {
  let combinedMin = 0
  let combinedMax = Infinity
  for (const proposition of propositions ?? []) {
    if (proposition.frame !== 'current') { continue }
    if (!matchesSingularStrict(proposition, singular)) { continue }
    const range = proposition.aggregate_mobility_range
    if (!range) { continue }
    combinedMin = Math.max(combinedMin, range.min)
    combinedMax = Math.min(combinedMax, range.max)
  }
  return { min: combinedMin, max: combinedMax }
}

function matchesSingularStrict(proposition, singular) {
  if (proposition.team !== singular.team) { return false }
  if (!singularHasRealSpecies(singular)) { return false }
  for (const species of singular.species_set) {
    if (species === null) { continue }
    if (!proposition.species_set.has(species)) { return false }
  }
  return regionOverlap(proposition.region, singular.region)
}

function singularHasRealSpecies(singular) {
  for (const species of singular.species_set) {
    if (species !== null) { return true }
  }
  return false
}

function regionOverlap(a, b) {
  if (a.kind === 'all' || b.kind === 'all') { return true }
  if (a.kind === 'related-to' || b.kind === 'related-to') { return true }
  if (a.kind === 'set' && b.kind === 'set') {
    for (const square of a.squares) {
      if (b.squares.has(square)) { return true }
    }
    return false
  }
  return true
}

function shouldBiasEdge(mobilityRange) {
  if (!mobilityRange) { return false }
  if (!Number.isFinite(mobilityRange.max)) { return false }
  return mobilityRange.max <= LOW_MOBILITY_THRESHOLD
}
