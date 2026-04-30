import { materialValue } from "gameplay/board_query_utils"

function compareTotal(comparator, leftTotal, rightTotal) {
  if (leftTotal === null || rightTotal === null) { return false }
  switch (comparator) {
    case "equal_to": return leftTotal === rightTotal
    case "greater_than": return leftTotal > rightTotal
    case "less_than": return leftTotal < rightTotal
    case "greater_than_or_equal_to": return leftTotal >= rightTotal
    case "less_than_or_equal_to": return leftTotal <= rightTotal
    default: throw new Error(`Unknown comparator: ${comparator}`)
  }
}

function combinatorialMinSize(comparator, n) {
  switch (comparator) {
    case "equal_to": return n
    case "greater_than": return n + 1
    case "less_than": return 0
    case "greater_than_or_equal_to": return n
    case "less_than_or_equal_to": return 0
    default: throw new Error(`Unknown comparator: ${comparator}`)
  }
}

function combinatorialMaxSize(comparator, n, totalGroups) {
  switch (comparator) {
    case "equal_to": return n
    case "greater_than": return totalGroups
    case "less_than": return Math.max(0, n - 1)
    case "greater_than_or_equal_to": return totalGroups
    case "less_than_or_equal_to": return n
    default: throw new Error(`Unknown comparator: ${comparator}`)
  }
}

function searchSubsetWithSize(groups, size, valueComparator, valueReferenceTotal, startIdx, current) {
  if (current.length === size) {
    const sum = current.reduce((acc, group) => acc + group.value, 0)
    return compareTotal(valueComparator, sum, valueReferenceTotal) ? current.slice() : null
  }
  const remaining = size - current.length
  if (startIdx + remaining > groups.length) { return null }
  for (let i = startIdx; i <= groups.length - remaining; i += 1) {
    current.push(groups[i])
    const result = searchSubsetWithSize(groups, size, valueComparator, valueReferenceTotal, i + 1, current)
    current.pop()
    if (result) { return result }
  }
  return null
}

function buildGroups({ pairs, board, groupBySide, valueSide }) {
  const groupMap = new Map()
  for (const pair of pairs) {
    const groupKey = groupBySide === "subject" ? pair.subjectPosition : pair.targetPosition
    const valuePosition = valueSide === "subject" ? pair.subjectPosition : pair.targetPosition
    if (!groupMap.has(groupKey)) { groupMap.set(groupKey, { key: groupKey, value: 0 }) }
    groupMap.get(groupKey).value += materialValue(board.pieceTypeAt(valuePosition))
  }
  return Array.from(groupMap.values())
}

export function findCombinatorialQualifyingGroups({
  pairs, board, groupBySide, valueSide,
  valueComparator, valueReferenceTotal,
  countComparator, countReferenceTotal
}) {
  const groups = buildGroups({ pairs, board, groupBySide, valueSide })
  const totalGroups = groups.length
  const minSize = combinatorialMinSize(countComparator, countReferenceTotal)
  const maxSize = combinatorialMaxSize(countComparator, countReferenceTotal, totalGroups)

  for (let size = minSize; size <= maxSize; size += 1) {
    const found = searchSubsetWithSize(groups, size, valueComparator, valueReferenceTotal, 0, [])
    if (found) {
      return found.map(group => group.key)
    }
  }
  return null
}

export function combinatorialQualifyingExists(args) {
  return findCombinatorialQualifyingGroups(args) !== null
}
