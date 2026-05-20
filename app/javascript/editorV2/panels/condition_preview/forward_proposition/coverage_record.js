// Per-payload tracker of how many verified examples each binding shape has
// produced. Steers chooseMovedBinding toward shapes that haven't yet
// saturated their share of the display total. State partitions by scenario.

// Warmup threshold for the standard scenario; also the display total in the
// dynamic-target formula floor(displaySize / frozenCount).
export const STANDARDS_DISPLAY_SIZE = 30

// Warmup threshold for each special-move scenario; also its display total.
export const SPECIALS_WARMUP_N = 4

// The scenario-name string the standard scenario goes by. Callers passing
// scenarioName should send this for the standards pool.
export const STANDARDS_KEY = 'standard'

export function createCoverageRecord({
  standardKey = STANDARDS_KEY,
  standardsDisplaySize = STANDARDS_DISPLAY_SIZE,
  specialsWarmupN = SPECIALS_WARMUP_N
} = {}) {
  const scenarios = new Map()

  function substateFor(scenarioName) {
    let s = scenarios.get(scenarioName)
    if (s) { return s }
    const displaySize = scenarioName === standardKey ? standardsDisplaySize : specialsWarmupN
    s = {
      counts: new Map(),
      frozen: new Set(),
      verifiedTotal: 0,
      warmupHit: false,
      target: null,
      warmupThreshold: displaySize,
      displaySize
    }
    scenarios.set(scenarioName, s)
    return s
  }

  function noteVerifiedExample(scenarioName, shapeKey) {
    const s = substateFor(scenarioName)
    s.counts.set(shapeKey, (s.counts.get(shapeKey) ?? 0) + 1)
    s.verifiedTotal += 1
    if (!s.warmupHit) {
      if (s.verifiedTotal >= s.warmupThreshold) { hitWarmup(s) }
      return
    }
    maybeFreezeShape(s, shapeKey)
  }

  function weightFor(scenarioName, shapeKey) {
    const s = substateFor(scenarioName)
    if (!s.warmupHit) { return 1.0 }
    return s.frozen.has(shapeKey) ? 0 : 1.0
  }

  return { noteVerifiedExample, weightFor }
}

function hitWarmup(s) {
  s.warmupHit = true
  let leaderKey = null
  let leaderCount = -1
  for (const [key, count] of s.counts) {
    if (count > leaderCount) { leaderKey = key; leaderCount = count }
  }
  if (leaderKey === null) { return }
  s.frozen.add(leaderKey)
  s.target = leaderCount
}

function maybeFreezeShape(s, shapeKey) {
  if (s.frozen.has(shapeKey)) { return }
  const count = s.counts.get(shapeKey)
  if (count < s.target) { return }
  s.frozen.add(shapeKey)
  recomputeTarget(s)
}

// Tighten the target as more shapes freeze. Any previously-unfrozen shape
// whose count already meets the new target freezes immediately, which may
// tighten the target further — iterate to fixed point.
function recomputeTarget(s) {
  for (;;) {
    s.target = Math.floor(s.displaySize / s.frozen.size)
    let froze = false
    for (const [key, count] of s.counts) {
      if (s.frozen.has(key)) { continue }
      if (count >= s.target) { s.frozen.add(key); froze = true }
    }
    if (!froze) { return }
  }
}
