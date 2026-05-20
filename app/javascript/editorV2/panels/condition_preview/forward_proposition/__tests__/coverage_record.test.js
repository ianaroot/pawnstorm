import { describe, expect, it } from 'vitest'
import {
  createCoverageRecord,
  STANDARDS_DISPLAY_SIZE,
  SPECIALS_WARMUP_N,
  STANDARDS_KEY
} from '../coverage_record'

describe('createCoverageRecord — pre-warmup', () => {
  it('returns weight 1.0 for any shape when no examples have been noted', () => {
    const record = createCoverageRecord()
    expect(record.weightFor(STANDARDS_KEY, '')).toBe(1.0)
    expect(record.weightFor(STANDARDS_KEY, '0:subject')).toBe(1.0)
  })

  it('returns weight 1.0 for every shape while verifiedTotal is below the warmup threshold', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 4 })
    record.noteVerifiedExample(STANDARDS_KEY, 'A')
    record.noteVerifiedExample(STANDARDS_KEY, 'A')
    record.noteVerifiedExample(STANDARDS_KEY, 'B')
    expect(record.weightFor(STANDARDS_KEY, 'A')).toBe(1.0)
    expect(record.weightFor(STANDARDS_KEY, 'B')).toBe(1.0)
    expect(record.weightFor(STANDARDS_KEY, 'C')).toBe(1.0)
  })
})

describe('createCoverageRecord — warmup leader freeze', () => {
  it('freezes the leader at warmup, leaving every other shape at weight 1.0', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 4 })
    record.noteVerifiedExample(STANDARDS_KEY, 'A')
    record.noteVerifiedExample(STANDARDS_KEY, 'A')
    record.noteVerifiedExample(STANDARDS_KEY, 'A')
    record.noteVerifiedExample(STANDARDS_KEY, 'B') // total = 4 → warmup
    expect(record.weightFor(STANDARDS_KEY, 'A')).toBe(0)
    expect(record.weightFor(STANDARDS_KEY, 'B')).toBe(1.0)
    expect(record.weightFor(STANDARDS_KEY, 'C')).toBe(1.0)
  })

  it('uses the highest-count shape as the leader (not just the first inserted)', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 4 })
    record.noteVerifiedExample(STANDARDS_KEY, 'A')
    record.noteVerifiedExample(STANDARDS_KEY, 'B')
    record.noteVerifiedExample(STANDARDS_KEY, 'B')
    record.noteVerifiedExample(STANDARDS_KEY, 'B') // total=4 → warmup, B leads at 3
    expect(record.weightFor(STANDARDS_KEY, 'B')).toBe(0)
    expect(record.weightFor(STANDARDS_KEY, 'A')).toBe(1.0)
  })
})

describe('createCoverageRecord — post-warmup freeze and recompute', () => {
  it('freezes a non-leader shape when its count reaches the warmup-set target', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 6 })
    for (let i = 0; i < 4; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'A') }
    record.noteVerifiedExample(STANDARDS_KEY, 'B')
    record.noteVerifiedExample(STANDARDS_KEY, 'B') // total=6, warmup; A frozen at target=4
    expect(record.weightFor(STANDARDS_KEY, 'B')).toBe(1.0)
    record.noteVerifiedExample(STANDARDS_KEY, 'B')
    record.noteVerifiedExample(STANDARDS_KEY, 'B') // B reaches 4 = target → freeze
    expect(record.weightFor(STANDARDS_KEY, 'B')).toBe(0)
  })

  it('recomputes target to floor(displaySize / frozenCount) after each freeze', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 6 })
    for (let i = 0; i < 4; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'A') }
    record.noteVerifiedExample(STANDARDS_KEY, 'B')
    record.noteVerifiedExample(STANDARDS_KEY, 'B') // warmup; A frozen at target=4
    for (let i = 0; i < 2; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'B') } // B → 4, freeze; target=floor(6/2)=3
    // C reaches 3, the new target → freeze
    for (let i = 0; i < 3; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'C') }
    expect(record.weightFor(STANDARDS_KEY, 'C')).toBe(0)
  })

  it('freezes a previously-unfrozen shape immediately when the recomputed target drops to its count', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 6 })
    for (let i = 0; i < 4; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'A') } // warmup; A frozen at target=4
    record.noteVerifiedExample(STANDARDS_KEY, 'B')
    record.noteVerifiedExample(STANDARDS_KEY, 'B') // B at 2, unfrozen
    for (let i = 0; i < 4; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'C') } // C → 4, freeze; target=3
    expect(record.weightFor(STANDARDS_KEY, 'B')).toBe(1.0) // still under target 3
    for (let i = 0; i < 3; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'D') } // D → 3, freeze; target=floor(6/3)=2
    // freeze-on-recompute: B at count 2 meets new target 2 → freezes without further notes
    expect(record.weightFor(STANDARDS_KEY, 'B')).toBe(0)
  })
})

describe('createCoverageRecord — per-scenario isolation', () => {
  it('keeps counts independent across scenarios', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 4, specialsWarmupN: 4 })
    for (let i = 0; i < 4; i++) { record.noteVerifiedExample(STANDARDS_KEY, 'A') } // warmup standard
    expect(record.weightFor(STANDARDS_KEY, 'A')).toBe(0)
    expect(record.weightFor('castle', 'A')).toBe(1.0)
  })

  it('applies SPECIALS_WARMUP_N as warmup threshold and display size for non-standard scenarios', () => {
    const record = createCoverageRecord({ specialsWarmupN: 4 })
    for (let i = 0; i < 3; i++) { record.noteVerifiedExample('castle', 'A') }
    record.noteVerifiedExample('castle', 'B') // total=4 → warmup; A leader at 3
    expect(record.weightFor('castle', 'A')).toBe(0)
    expect(record.weightFor('castle', 'B')).toBe(1.0)
  })
})

describe('createCoverageRecord — empty-string shape key', () => {
  it('treats the empty string (bystander shape) like any other key', () => {
    const record = createCoverageRecord({ standardsDisplaySize: 4 })
    for (let i = 0; i < 3; i++) { record.noteVerifiedExample(STANDARDS_KEY, '') }
    record.noteVerifiedExample(STANDARDS_KEY, 'X') // warmup; bystander leader at 3
    expect(record.weightFor(STANDARDS_KEY, '')).toBe(0)
    expect(record.weightFor(STANDARDS_KEY, 'X')).toBe(1.0)
  })
})

describe('createCoverageRecord — exported constants', () => {
  it('STANDARDS_DISPLAY_SIZE defaults to 30', () => {
    expect(STANDARDS_DISPLAY_SIZE).toBe(30)
  })

  it('SPECIALS_WARMUP_N defaults to 4', () => {
    expect(SPECIALS_WARMUP_N).toBe(4)
  })

  it('STANDARDS_KEY is the string "standard"', () => {
    expect(STANDARDS_KEY).toBe('standard')
  })
})
