import { describe, it, expect } from 'vitest'
import {
  HIGHLIGHT_ROLES,
  MOVED_FROM,
  MOVED_TO,
  ROLE_RENDER_ORDER,
  relationSubjectRole,
  relationTargetRole,
  tileDecoration,
  legendEntries
} from '../highlight_roles.js'

describe('ROLE_RENDER_ORDER', () => {
  it('includes every role that HIGHLIGHT_ROLES defines', () => {
    expect(new Set(ROLE_RENDER_ORDER)).toEqual(new Set(Object.keys(HIGHLIGHT_ROLES)))
  })
})

describe('relationSubjectRole / relationTargetRole', () => {
  it('maps each operator to its subject and target role keys', () => {
    expect(relationSubjectRole('attack')).toBe('attacker')
    expect(relationTargetRole('attack')).toBe('targetAttack')

    expect(relationSubjectRole('defend')).toBe('defender')
    expect(relationTargetRole('defend')).toBe('targetDefend')

    expect(relationSubjectRole('shield')).toBe('shield')
    expect(relationTargetRole('shield')).toBe('targetShield')

    expect(relationSubjectRole('adjacent')).toBe('subject')
    expect(relationTargetRole('adjacent')).toBe('targetGeneric')

    expect(relationSubjectRole('same_piece')).toBe('subject')
    expect(relationTargetRole('same_piece')).toBe('targetGeneric')
  })
})

describe('tileDecoration', () => {
  it('returns null when no roles or moved markers touch the tile', () => {
    expect(tileDecoration({ roles: { attacker: [10] } }, 20)).toBe(null)
  })

  it('decorates a single-role tile with one inset ring and a tinted background', () => {
    const deco = tileDecoration({ roles: { attacker: [10] } }, 10)
    expect(deco.boxShadow).toBe(`inset 0 0 0 3px ${HIGHLIGHT_ROLES.attacker.color}`)
<<<<<<< HEAD
    expect(deco.background).toBe(HIGHLIGHT_ROLES.attacker.tint)
=======
    expect(deco.background).toBe(`${HIGHLIGHT_ROLES.attacker.color}59`)
>>>>>>> 54fe34b (tile fill blends over wood; bump alpha to ~35%)
  })

  it('stacks role rings inside the moved rings when a piece carries both', () => {
    const deco = tileDecoration({
      roles: { subject: [10], target: [] },
      movedStartPosition: null,
      movedEndPosition: 10
    }, 10)
    expect(deco.boxShadow).toBe(
      `inset 0 0 0 3px ${HIGHLIGHT_ROLES.subject.color}, inset 0 0 0 6px ${MOVED_TO.color}`
    )
  })

  it('stacks one ring per role for a tile playing multiple roles', () => {
    const deco = tileDecoration({
      roles: { attacker: [10], shield: [10], targetGeneric: [10] }
    }, 10)
    expect(deco.boxShadow).toBe(
      [
        `inset 0 0 0 3px ${HIGHLIGHT_ROLES.attacker.color}`,
        `inset 0 0 0 6px ${HIGHLIGHT_ROLES.shield.color}`,
        `inset 0 0 0 9px ${HIGHLIGHT_ROLES.targetGeneric.color}`
      ].join(', ')
    )
    expect(deco.background).toBe(HIGHLIGHT_ROLES.attacker.tint)
  })

  it('shows moved-from + moved-to as concentric rings on a one-square move', () => {
    const deco = tileDecoration({ roles: {}, movedStartPosition: 10, movedEndPosition: 10 }, 10)
    expect(deco.boxShadow).toBe(
      `inset 0 0 0 3px ${MOVED_FROM.color}, inset 0 0 0 6px ${MOVED_TO.color}`
    )
  })
})

describe('legendEntries', () => {
  it('returns just the two moved markers when no roles are present', () => {
    const example = { highlights: { prior: { roles: {} }, after: { roles: {} } } }
    expect(legendEntries(example)).toEqual([MOVED_FROM, MOVED_TO])
  })

  it('lists every role present across prior/after, then moved markers, in render order', () => {
    const example = {
      highlights: {
        prior: { roles: { attacker: [10] } },
        after: { roles: { attacker: [12], targetAttack: [20] } }
      }
    }
    expect(legendEntries(example)).toEqual([
      HIGHLIGHT_ROLES.attacker,
      HIGHLIGHT_ROLES.targetAttack,
      MOVED_FROM,
      MOVED_TO
    ])
  })

  it('dedupes role entries that share both label and color', () => {
    const example = {
      highlights: {
        prior: { roles: { subject: [10] } },
        after: { roles: { subject: [10, 12] } }
      }
    }
    expect(legendEntries(example)).toEqual([HIGHLIGHT_ROLES.subject, MOVED_FROM, MOVED_TO])
  })

  it('lists each relation\'s target as its own entry', () => {
    const example = {
      highlights: {
        prior: { roles: {} },
        after: { roles: { targetAttack: [20], targetDefend: [21] } }
      }
    }
    expect(legendEntries(example)).toEqual([
      HIGHLIGHT_ROLES.targetAttack,
      HIGHLIGHT_ROLES.targetDefend,
      MOVED_FROM,
      MOVED_TO
    ])
  })

  it('keeps subject and positionSubject as separate entries (same "Subject" label, different colors)', () => {
    const example = {
      highlights: {
        prior: { roles: {} },
        after: { roles: { subject: [10], positionSubject: [20] } }
      }
    }
    expect(legendEntries(example)).toEqual([
      HIGHLIGHT_ROLES.subject,
      HIGHLIGHT_ROLES.positionSubject,
      MOVED_FROM,
      MOVED_TO
    ])
  })
})
