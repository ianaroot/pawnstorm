import { describe, it, expect } from 'vitest'
import { PAYLOADS, benchmarkPayload } from '../forward_proposition_benchmark'

// benchmarkPayload is deterministic (seededRandom(1) per payload), so the
// verified count is reproducible. baseline is verified-as-percent-of-attempts;
// guards against unintended generation regressions. Re-record
// PAYLOADS[].baseline after intended changes.
const ATTEMPTS = 5000
const TOLERANCE = 0.2

describe('forward_proposition baselines', () => {
  for (const entry of PAYLOADS) {
    it(`${entry.name} within ±20% of ${entry.baseline}%`, () => {
      const { verified } = benchmarkPayload(entry, ATTEMPTS)
      const currentPct = 100 * verified / ATTEMPTS
      const drift = Math.abs(currentPct - entry.baseline)
      expect(
        drift,
        `${entry.name}: ${currentPct.toFixed(2)}% vs baseline ${entry.baseline}% ` +
        `(off ${(100 * drift / entry.baseline).toFixed(1)}%, limit 20%)`
      ).toBeLessThanOrEqual(TOLERANCE * entry.baseline)
    }, 60000)
  }
})
