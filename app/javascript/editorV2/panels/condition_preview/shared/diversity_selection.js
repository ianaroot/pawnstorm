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

export function varietySignature(example) {
  return [
    example.variantType,
    subjectSpeciesSignature(example),
    targetSpeciesSignature(example),
    example.geometryKey
  ].join(':')
}

export function movedPieceSignature(example) {
  return example.afterBoard.pieceTypeAt(example.moveObject.endPosition)
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

export function bucketKeyForExample(example) {
  return [
    subjectSpeciesSignature(example),
    targetSpeciesSignature(example),
    example.variantType
  ].join('|')
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

export function selectDiverseExamples(candidates, maxExamples) {
  if (candidates.length <= maxExamples) { return [...candidates] }

  const selected = []
  const seenIdentities = new Set()
  const subjectBuckets = new Map()
  const targetBuckets = new Map()
  const pairBuckets = new Map()
  const variantBuckets = new Map()
  const movedPieceBuckets = new Map()
  const geometryBuckets = new Map()
  const valueComboBuckets = new Map()

  candidates.forEach(candidate => {
    const subjectKey = subjectSpeciesSignature(candidate)
    const targetKey = targetSpeciesSignature(candidate)
    const pairKey = speciesPairSignature(candidate)
    const variantKey = candidate.variantType
    const movedKey = movedPieceSignature(candidate)
    const geometryKey = candidate.geometryKey ?? ''
    const valueComboKey = valueComboSignature(candidate)

    if (!subjectBuckets.has(subjectKey)) { subjectBuckets.set(subjectKey, []) }
    if (!targetBuckets.has(targetKey)) { targetBuckets.set(targetKey, []) }
    if (!pairBuckets.has(pairKey)) { pairBuckets.set(pairKey, []) }
    if (!variantBuckets.has(variantKey)) { variantBuckets.set(variantKey, []) }
    if (!movedPieceBuckets.has(movedKey)) { movedPieceBuckets.set(movedKey, []) }
    if (!geometryBuckets.has(geometryKey)) { geometryBuckets.set(geometryKey, []) }
    if (!valueComboBuckets.has(valueComboKey)) { valueComboBuckets.set(valueComboKey, []) }

    subjectBuckets.get(subjectKey).push(candidate)
    targetBuckets.get(targetKey).push(candidate)
    pairBuckets.get(pairKey).push(candidate)
    variantBuckets.get(variantKey).push(candidate)
    movedPieceBuckets.get(movedKey).push(candidate)
    geometryBuckets.get(geometryKey).push(candidate)
    valueComboBuckets.get(valueComboKey).push(candidate)
  })

  roundRobinAppend({ selected, candidatesByKey: movedPieceBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: subjectBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: targetBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: pairBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: valueComboBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: variantBuckets, maxExamples, seenIdentities })
  roundRobinAppend({ selected, candidatesByKey: geometryBuckets, maxExamples, seenIdentities })

  if (selected.length >= maxExamples) {
    return selected.slice(0, maxExamples)
  }

  const remaining = candidates.filter(candidate => !seenIdentities.has(candidateIdentity(candidate)))
  for (let index = 0; index < remaining.length && selected.length < maxExamples; index++) {
    selected.push(remaining[index])
  }

  return selected
}
