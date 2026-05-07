import { ALL_POSITIONS } from 'editorV2/panels/condition_preview/shared/board_utils'

export function intersectRegions(a, b) {
  if (a.kind === 'all') { return b }
  if (b.kind === 'all') { return a }
  if (a.kind === 'set' && b.kind === 'set') {
    const result = new Set()
    for (const sq of a.squares) {
      if (b.squares.has(sq)) { result.add(sq) }
    }
    return { kind: 'set', squares: result }
  }
  return a
}

export function subtractRegions(a, b) {
  if (a.kind === 'all') {
    const result = new Set(ALL_POSITIONS)
    for (const sq of b.squares) { result.delete(sq) }
    return { kind: 'set', squares: result }
  }
  if (a.kind === 'set' && b.kind === 'set') {
    const result = new Set(a.squares)
    for (const sq of b.squares) { result.delete(sq) }
    return { kind: 'set', squares: result }
  }
  return a
}
