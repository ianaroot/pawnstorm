import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { pieceCode } from 'editorV2/panels/condition_preview/shared/board_utils'
import {
  movedPieceCapturesRelationParticipant
} from 'editorV2/panels/condition_preview/forward_proposition/cross_frame/mechanisms/moved_piece_captures_relation_participant'
import { defaultTestCtx } from '../_helpers'

const D4 = 27

function movedPieceSingular(species = Board.QUEEN, square = D4) {
  return {
    team: Board.WHITE,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([square]) },
    priorRegion: { kind: 'all' },
    relationsToAnchors: []
  }
}

function capturedPieceSingular(species = Board.QUEEN, position = D4) {
  return {
    team: Board.BLACK,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([position]) },
    relationsToAnchors: []
  }
}

function entry({
  source = 'relational',
  operator = 'attack',
  direction = '-',
  metric = 'count',
  subjectTeam = Board.BLACK,
  subjectSpecies = new Set([Board.QUEEN]),
  targetTeam = Board.WHITE,
  targetSpecies = new Set([Board.KING])
} = {}) {
  return {
    source, operator, direction, metric,
    subjectProposition: { team: subjectTeam, species_set: subjectSpecies },
    targetProposition: { team: targetTeam, species_set: targetSpecies },
    currentProposition: { team: subjectTeam, species_set: subjectSpecies },
    priorProposition: { team: subjectTeam, species_set: subjectSpecies }
  }
}

describe('movedPieceCapturesRelationParticipant — appliesTo', () => {
  function ctxWithSingulars(captured = capturedPieceSingular()) {
    return defaultTestCtx({
      singulars: { moved_piece: movedPieceSingular(), captured_piece: captured }
    })
  }

  it('returns true for relational direction "-" attack with enemy subject and a non-null captured species', () => {
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry(), ctxWithSingulars(), new Map())).toBe(true)
  })

  it('returns false for census entries', () => {
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ source: 'census' }), ctxWithSingulars(), new Map())).toBe(false)
  })

  it('returns false for direction "+"', () => {
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ direction: '+' }), ctxWithSingulars(), new Map())).toBe(false)
  })

  it('returns false for direction "="', () => {
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ direction: '=' }), ctxWithSingulars(), new Map())).toBe(false)
  })

  it('returns true for defend, adjacent, and shield operators', () => {
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ operator: 'defend' }), ctxWithSingulars(), new Map())).toBe(true)
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ operator: 'adjacent' }), ctxWithSingulars(), new Map())).toBe(true)
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ operator: 'shield' }), ctxWithSingulars(), new Map())).toBe(true)
  })

  it('returns true for aggregate_value and aggregate_mobility metrics', () => {
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ metric: 'aggregate_value' }), ctxWithSingulars(), new Map())).toBe(true)
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry({ metric: 'aggregate_mobility' }), ctxWithSingulars(), new Map())).toBe(true)
  })

  it('returns false when no side has the enemy team (and operator is not shield)', () => {
    const e = entry({ subjectTeam: Board.WHITE, targetTeam: Board.WHITE })
    expect(movedPieceCapturesRelationParticipant.appliesTo(e, ctxWithSingulars(), new Map())).toBe(false)
  })

  it('returns true for shield even when both sides are the moving team (implicit attacker is enemy)', () => {
    const e = entry({ operator: 'shield', subjectTeam: Board.WHITE, targetTeam: Board.WHITE })
    expect(movedPieceCapturesRelationParticipant.appliesTo(e, ctxWithSingulars(), new Map())).toBe(true)
  })

  it('returns false when captured_piece species_set contains only null', () => {
    const captured = capturedPieceSingular()
    captured.species_set = new Set([null])
    expect(movedPieceCapturesRelationParticipant.appliesTo(entry(), ctxWithSingulars(captured), new Map())).toBe(false)
  })
})

// "enemy queen attack moved_piece" with PBS on subject count: moved_piece is
// bound to the target side; subjectProposition is the unbound (enemy)
// description, with region pointing back to moved_piece as the relation's
// target. targetProposition is null because the target is a singular.
function boundTargetAttackEntry({ subjectSpecies = new Set([Board.QUEEN]) } = {}) {
  const currentProp = {
    team: Board.BLACK,
    species_set: subjectSpecies,
    region: { kind: 'related-to', actor: 'moved_piece', role: 'target', operator: 'attack' },
    count_range: { min: 1, max: Infinity },
    frame: 'current'
  }
  const priorProp = { ...currentProp, frame: 'prior' }
  return {
    source: 'relational',
    operator: 'attack',
    direction: '-',
    metric: 'count',
    priorProposition: priorProp,
    currentProposition: currentProp,
    subjectProposition: currentProp,
    targetProposition: null
  }
}

// "enemy queen defend enemy pawn (count < PBS)": both sides on enemy team, no
// moved_piece binding. PBS lives on the subject side.
function unboundDefendEntry({
  subjectSpecies = new Set([Board.QUEEN]),
  targetSpecies = new Set([Board.PAWN])
} = {}) {
  const subjectProp = {
    team: Board.BLACK,
    species_set: subjectSpecies,
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity },
    frame: 'current'
  }
  const targetProp = {
    team: Board.BLACK,
    species_set: targetSpecies,
    region: { kind: 'all' },
    count_range: { min: 1, max: Infinity },
    frame: 'current'
  }
  const priorProp = { ...subjectProp, frame: 'prior' }
  return {
    source: 'relational',
    operator: 'defend',
    direction: '-',
    metric: 'count',
    priorProposition: priorProp,
    currentProposition: subjectProp,
    subjectProposition: subjectProp,
    targetProposition: targetProp
  }
}

// "moved_piece attack enemy any (count < PBS)": moved_piece is bound to the
// subject side; targetProposition is the unbound (enemy) description, with
// region pointing back to moved_piece as the relation's subject.
// subjectProposition is null because the subject is a singular.
function boundSubjectAttackEntry({ targetSpecies = new Set([Board.QUEEN]) } = {}) {
  const currentProp = {
    team: Board.BLACK,
    species_set: targetSpecies,
    region: { kind: 'related-to', actor: 'moved_piece', role: 'subject', operator: 'attack' },
    count_range: { min: 1, max: Infinity },
    frame: 'current'
  }
  const priorProp = { ...currentProp, frame: 'prior' }
  return {
    source: 'relational',
    operator: 'attack',
    direction: '-',
    metric: 'count',
    priorProposition: priorProp,
    currentProposition: currentProp,
    subjectProposition: null,
    targetProposition: currentProp
  }
}

describe('movedPieceCapturesRelationParticipant — bound singular honors region (site 3)', () => {
  it('RED: does not commit when bound singular target attacker delta is zero (decoy creates spurious population delta)', () => {
    const D8 = 59
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(Board.NIGHT),
        captured_piece: {
          team: Board.BLACK,
          species_set: new Set([Board.ROOK]),
          region: { kind: 'set', squares: new Set([D4]) },
          relationsToAnchors: []
        }
      }
    })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.NIGHT)],
      [D8, pieceCode(Board.WHITE, Board.NIGHT)]
    ])

    const result = movedPieceCapturesRelationParticipant.apply(boundTargetAttackEntry({ subjectSpecies: new Set([Board.ROOK]) }), ctx, pieces, () => 0.5)
    expect(result).toBeNull()
  })
})

describe('movedPieceCapturesRelationParticipant — apply', () => {
  it('commits priorRegion to an origin where capturing an enemy queen drops attack count from 1 to 0', () => {
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular()
      }
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])

    const result = movedPieceCapturesRelationParticipant.apply(boundTargetAttackEntry(), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBe(1)
  })

  it('returns null when no origin produces a satisfying delta (capture species does not match the relation filter)', () => {
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular(Board.QUEEN)
      }
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])

    const entry = boundTargetAttackEntry({ subjectSpecies: new Set([Board.NIGHT]) })
    const result = movedPieceCapturesRelationParticipant.apply(entry, ctx, pieces, () => 0.5)

    expect(result).toBeNull()
  })

  it('commits priorRegion when moved_piece bound as subject attacks captured enemy on prior (count drops 1 to 0)', () => {
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular()
      }
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])

    const result = movedPieceCapturesRelationParticipant.apply(boundSubjectAttackEntry(), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBe(1)
  })

  it('commits priorRegion for unbound defend relation when capturing the defender drops the count', () => {
    const D6 = 43
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular()
      }
    })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [D6, pieceCode(Board.BLACK, Board.PAWN)]
    ])

    const result = movedPieceCapturesRelationParticipant.apply(unboundDefendEntry(), ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBe(1)
  })

  it('commits priorRegion for unbound adjacent relation when capturing one neighbor drops the count', () => {
    const E5 = 36
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular()
      }
    })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [E5, pieceCode(Board.BLACK, Board.PAWN)]
    ])

    const entry = { ...unboundDefendEntry(), operator: 'adjacent' }
    const result = movedPieceCapturesRelationParticipant.apply(entry, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBe(1)
  })

  it('commits priorRegion for shield relation when capturing the shielder removes the subject-matching piece between attacker and target', () => {
    const D1 = 3
    const D8 = 59
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular()
      }
    })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [D1, pieceCode(Board.WHITE, Board.QUEEN)],
      [D8, pieceCode(Board.BLACK, Board.KING)]
    ])

    const entry = {
      ...unboundDefendEntry({ subjectSpecies: new Set([Board.QUEEN]), targetSpecies: new Set([Board.KING]) }),
      operator: 'shield'
    }
    const result = movedPieceCapturesRelationParticipant.apply(entry, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBe(1)
  })

  it('satisfies aggregate_value direction "-" via capture (regression guard for value-branch divergence from count)', () => {
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular()
      }
    })
    const pieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])

    const entry = { ...boundTargetAttackEntry(), metric: 'aggregate_value' }
    const result = movedPieceCapturesRelationParticipant.apply(entry, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBe(1)
  })

  it('satisfies aggregate_mobility direction "-" via capture (regression guard for mobility-branch divergence from count)', () => {
    const H8 = 63
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: movedPieceSingular(),
        captured_piece: capturedPieceSingular()
      }
    })
    const pieces = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [H8, pieceCode(Board.BLACK, Board.KING)]
    ])

    const entry = { ...boundTargetAttackEntry(), metric: 'aggregate_mobility' }
    const result = movedPieceCapturesRelationParticipant.apply(entry, ctx, pieces, () => 0.5)

    expect(result).not.toBeNull()
    expect(ctx.singulars.moved_piece.priorRegion.kind).toBe('set')
    expect(ctx.singulars.moved_piece.priorRegion.squares.size).toBe(1)
  })
})
