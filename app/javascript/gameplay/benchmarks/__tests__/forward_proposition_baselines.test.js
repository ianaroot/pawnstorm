import { describe, it, expect } from 'vitest'
import { PAYLOADS, benchmarkPayload } from '../forward_proposition_benchmark'

// benchmarkPayload is deterministic (seededRandom(1) per payload), so the
// verified count is reproducible. Guards against unintended generation
// regressions; re-record PAYLOADS[].baseline after intended changes.
const ATTEMPTS = 1000
const TOLERANCE = 0.2

describe('forward_proposition baselines', () => {
  for (const entry of PAYLOADS) {
    it(`${entry.name} within ±20% of ${entry.baseline}`, () => {
      const { verified } = benchmarkPayload(entry, ATTEMPTS)
      const drift = Math.abs(verified - entry.baseline)
      expect(
        drift,
        `${entry.name}: ${verified}/${ATTEMPTS} vs baseline ${entry.baseline} ` +
        `(off ${(100 * drift / entry.baseline).toFixed(1)}%, limit 20%)`
      ).toBeLessThanOrEqual(TOLERANCE * entry.baseline)
    }, 30000)
  }
})
