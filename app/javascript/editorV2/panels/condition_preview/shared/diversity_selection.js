import { materialValue } from 'gameplay/board_query_utils'
import { candidateIdentity } from 'editorV2/panels/condition_preview/shared/example_utils'

export function subjectSpeciesSignature(example) {
  const positions = example.result?.subjectPositions ?? []
  if (positions.length === 0) { return example.geometryKey ?? '' }
  return positions.map(position => example.afterBoard.pieceTypeAt(position)).join(',')
}

export function targetSpeciesSignature(example) {
  return example.result?.targetPositions?.map(position => example.afterBoard.pieceTypeAt(position)).join(',') ?? ''
}

export function speciesPairSignature(example) {
  return `${subjectSpeciesSignature(example)}=>${targetSpeciesSignature(example)}`
}

export function movedPieceSignature(example) {
  return example.afterBoard.pieceTypeAt(example.moveObject.endPosition)
}

export function bindingComboSignature(example) {
  return example.bindingComboKey ?? ''
}

export function variantSignature(example) {
  return example.variantType
}

export function geometrySignature(example) {
  return example.geometryKey ?? ''
}

// Sum of material values across a side's pieces. Bucketing by the
// (subject value sum, target value sum) pair surfaces examples that
// satisfy the same value condition via different species combinations
// (e.g. Q ≥ R, R ≥ B, Q ≥ N all bucket separately).
function sideValueTotal(positions, board) {
  if (!positions || positions.length === 0) { return 0 }
  let total = 0
  for (const position of positions) {
    const species = board.pieceTypeAt(position)
    if (!species) { continue }
    total += materialValue(species)
  }
  return total
}

export function valueComboSignature(example) {
  const subjectTotal = sideValueTotal(example.result?.subjectPositions, example.afterBoard)
  const targetTotal = sideValueTotal(example.result?.targetPositions, example.afterBoard)
  return `${subjectTotal}=>${targetTotal}`
}

export function uniqueExamples(examples) {
  const seen = new Set()
  return examples.filter(example => {
    const identity = candidateIdentity(example)
    if (seen.has(identity)) { return false }
    seen.add(identity)
    return true
  })
}

export function roundRobinAppend({ selected, candidatesByKey, maxExamples, seenIdentities }) {
  const queue = Array.from(candidatesByKey.entries()).map(([key, candidates]) => ({
    key,
    candidates: [...candidates]
  }))
  let added = false

  while (selected.length < maxExamples) {
    let progressed = false

    for (let index = 0; index < queue.length && selected.length < maxExamples; index++) {
      const bucket = queue[index]
      while (bucket.candidates.length > 0 && seenIdentities.has(candidateIdentity(bucket.candidates[0]))) {
        bucket.candidates.shift()
      }
      if (bucket.candidates.length === 0) { continue }

      const next = bucket.candidates.shift()
      selected.push(next)
      seenIdentities.add(candidateIdentity(next))
      progressed = true
      added = true
    }

    if (!progressed) { break }
  }

  return added
}

// Diversity dimensions in round-robin priority order. Each dimension's
// buckets are filled greedily before the next dimension takes a turn.
const DIVERSITY_DIMENSIONS = [
  bindingComboSignature,
  movedPieceSignature,
  subjectSpeciesSignature,
  targetSpeciesSignature,
  speciesPairSignature,
  valueComboSignature,
  variantSignature,
  geometrySignature
]

export function selectDiverseExamples(candidates, maxExamples) {
  if (candidates.length <= maxExamples) { return [...candidates] }

  const selected = []
  const seenIdentities = new Set()

  for (const signature of DIVERSITY_DIMENSIONS) {
    const buckets = new Map()
    for (const candidate of candidates) {
      const key = signature(candidate)
      if (!buckets.has(key)) { buckets.set(key, []) }
      buckets.get(key).push(candidate)
    }
    roundRobinAppend({ selected, candidatesByKey: buckets, maxExamples, seenIdentities })
    if (selected.length >= maxExamples) { return selected.slice(0, maxExamples) }
  }

  const remaining = candidates.filter(candidate => !seenIdentities.has(candidateIdentity(candidate)))
  for (let index = 0; index < remaining.length && selected.length < maxExamples; index++) {
    selected.push(remaining[index])
  }

  return selected
}
