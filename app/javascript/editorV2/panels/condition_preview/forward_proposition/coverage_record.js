// Per-payload tracker of how many verified examples each binding shape has
// produced. Steers chooseMovedBinding toward shapes that haven't yet
// saturated their share of the display total. State partitions by scenario.

// Also serves as the warmup threshold.
export const STANDARD_DISPLAY_SIZE = 30

// Also the display total.
export const SPECIAL_WARMUP_THRESHOLD = 4

export const STANDARD_KEY = 'standard'

export function createCoverageRecord({
  standardKey = STANDARD_KEY,
  standardDisplaySize = STANDARD_DISPLAY_SIZE,
  specialWarmupThreshold = SPECIAL_WARMUP_THRESHOLD
} = {}) {
  const scenarios = new Map()

  function substateFor(scenarioName) {
    const existing = scenarios.get(scenarioName)
    if (existing) { return existing }
    const displaySize = scenarioName === standardKey ? standardDisplaySize : specialWarmupThreshold
    const state = {
      counts: new Map(),
      frozen: new Set(),
      verifiedTotal: 0,
      warmupHit: false,
      target: null,
      warmupThreshold: displaySize,
      displaySize
    }
    scenarios.set(scenarioName, state)
    return state
  }

  function noteVerifiedExample(scenarioName, shapeKey) {
    const state = substateFor(scenarioName)
    state.counts.set(shapeKey, (state.counts.get(shapeKey) ?? 0) + 1)
    state.verifiedTotal += 1
    if (!state.warmupHit) {
      if (state.verifiedTotal >= state.warmupThreshold) { hitWarmup(state) }
      return
    }
    maybeFreezeShape(state, shapeKey)
  }

  function weightFor(scenarioName, shapeKey) {
    const state = substateFor(scenarioName)
    if (!state.warmupHit) { return 1.0 }
    return state.frozen.has(shapeKey) ? 0 : 1.0
  }

  return { noteVerifiedExample, weightFor }
}

function hitWarmup(state) {
  state.warmupHit = true
  let leaderKey = null
  let leaderCount = -1
  for (const [key, count] of state.counts) {
    if (count > leaderCount) { leaderKey = key; leaderCount = count }
  }
  if (leaderKey === null) { return }
  state.frozen.add(leaderKey)
  state.target = leaderCount
}

function maybeFreezeShape(state, shapeKey) {
  if (state.frozen.has(shapeKey)) { return }
  const count = state.counts.get(shapeKey)
  if (count < state.target) { return }
  state.frozen.add(shapeKey)
  recomputeTarget(state)
}

// Tighten the target as more shapes freeze. Any previously-unfrozen shape
// whose count already meets the new target freezes immediately, which may
// tighten the target further — iterate to fixed point.
function recomputeTarget(state) {
  for (;;) {
    state.target = Math.floor(state.displaySize / state.frozen.size)
    let froze = false
    for (const [key, count] of state.counts) {
      if (state.frozen.has(key)) { continue }
      if (count >= state.target) { state.frozen.add(key); froze = true }
    }
    if (!froze) { return }
  }
}
