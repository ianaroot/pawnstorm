function nowMs() {
  if (globalThis.performance?.now) {
    return globalThis.performance.now()
  }
  return Date.now()
}

class ProfileCollector {
  constructor() {
    this.timings = new Map()
    this.counters = new Map()
  }

  reset() {
    this.timings.clear()
    this.counters.clear()
  }

  enabled() {
    return globalThis.process?.env?.MATCH_PROFILE === '1'
  }

  record(label, durationMs) {
    if (!this.enabled()) { return }

    const current = this.timings.get(label) || { count: 0, total_ms: 0, max_ms: 0 }
    current.count += 1
    current.total_ms += durationMs
    current.max_ms = Math.max(current.max_ms, durationMs)
    this.timings.set(label, current)
  }

  increment(label, amount = 1) {
    if (!this.enabled()) { return }
    this.counters.set(label, (this.counters.get(label) || 0) + amount)
  }

  measure(label, fn) {
    if (!this.enabled()) {
      return fn()
    }

    const startedAt = nowMs()
    try {
      return fn()
    } finally {
      this.record(label, nowMs() - startedAt)
    }
  }

  snapshot() {
    if (!this.enabled()) { return null }

    const timings = {}
    this.timings.forEach((value, key) => {
      timings[key] = {
        count: value.count,
        total_ms: Number(value.total_ms.toFixed(3)),
        avg_ms: Number((value.total_ms / value.count).toFixed(3)),
        max_ms: Number(value.max_ms.toFixed(3))
      }
    })

    const counters = {}
    this.counters.forEach((value, key) => {
      counters[key] = value
    })

    return { timings, counters }
  }
}

const profileCollector = new ProfileCollector()

export default profileCollector
